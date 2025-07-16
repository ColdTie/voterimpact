import CongressService from './CongressService';

class BillTextService {
  constructor() {
    this.cache = new Map();
    this.CACHE_DURATION = 30 * 60 * 1000; // 30 minutes
  }

  // Get enhanced bill data with full text for AI analysis
  async getEnhancedBillData(legislation) {
    const cacheKey = `${legislation.congress}-${legislation.billNumber}`;
    
    // Check cache first
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }

    // Always enhance with available data first
    const enhancedLegislation = this.enhanceLegislationWithoutText(legislation);

    try {
      // For federal bills, try to fetch full text (but don't block on it)
      if (legislation.scope === 'Federal' && legislation.congress && legislation.billNumber) {
        const billType = this.extractBillType(legislation.billNumber);
        const billNumber = this.extractBillNumber(legislation.billNumber);
        
        if (billType && billNumber) {
          // Only attempt if we have a real API key (not DEMO_KEY)
          const apiKey = process.env.REACT_APP_CONGRESS_API_KEY;
          if (apiKey && apiKey !== 'DEMO_KEY') {
            try {
              const textVersions = await CongressService.getBillText(
                legislation.congress,
                billType,
                billNumber
              );

              if (textVersions && textVersions.length > 0) {
                const textEnhanced = await this.enhanceLegislationWithText(
                  legislation,
                  textVersions
                );
                
                // Cache the result
                this.cache.set(cacheKey, {
                  data: textEnhanced,
                  timestamp: Date.now()
                });
                
                return textEnhanced;
              }
            } catch (textError) {
              // Log but don't fail - continue with enhanced data
              console.warn(`Bill text fetch failed for ${legislation.billNumber}:`, textError.message);
            }
          }
        }
      }

      // Cache the enhanced (but not full-text) result
      this.cache.set(cacheKey, {
        data: enhancedLegislation,
        timestamp: Date.now()
      });
      
      return enhancedLegislation;
      
    } catch (error) {
      console.warn('Error in getEnhancedBillData:', error);
      return enhancedLegislation; // Return the basic enhanced version
    }
  }

  // Extract bill type from bill number (e.g., "H.R.1234" -> "house-bill")
  extractBillType(billNumber) {
    if (!billNumber) return null;
    
    const typeMap = {
      'H.R.': 'house-bill',
      'H.': 'house-bill',
      'S.': 'senate-bill',
      'H.J.Res.': 'house-joint-resolution',
      'S.J.Res.': 'senate-joint-resolution',
      'H.Con.Res.': 'house-concurrent-resolution',
      'S.Con.Res.': 'senate-concurrent-resolution',
      'H.Res.': 'house-resolution',
      'S.Res.': 'senate-resolution'
    };

    for (const [prefix, type] of Object.entries(typeMap)) {
      if (billNumber.startsWith(prefix)) {
        return type;
      }
    }

    return 'house-bill'; // default fallback
  }

  // Extract bill number from full bill designation
  extractBillNumber(billNumber) {
    if (!billNumber) return null;
    return billNumber.replace(/[^0-9]/g, '');
  }

  // Enhance legislation with actual bill text
  async enhanceLegislationWithText(legislation, textVersions) {
    try {
      // Get the latest version of the bill text
      const latestVersion = textVersions[0];
      
      if (!latestVersion || !latestVersion.textUrl) {
        return this.enhanceLegislationWithoutText(legislation);
      }

      // Fetch the actual text content
      const textContent = await this.fetchBillTextContent(latestVersion.textUrl);
      
      if (textContent) {
        const excerpts = this.extractKeyExcerpts(textContent);
        const keyProvisions = this.extractKeyProvisions(textContent);
        
        return {
          ...legislation,
          fullTextExcerpts: excerpts,
          keyProvisions: keyProvisions,
          fullTextAvailable: true,
          textVersion: latestVersion.type,
          textDate: latestVersion.date
        };
      }
      
      return this.enhanceLegislationWithoutText(legislation);
      
    } catch (error) {
      console.warn('Error enhancing legislation with text:', error);
      return this.enhanceLegislationWithoutText(legislation);
    }
  }

  // Enhance legislation without full text (fallback)
  enhanceLegislationWithoutText(legislation) {
    return {
      ...legislation,
      fullTextAvailable: false,
      enhancedSummary: this.generateEnhancedSummary(legislation)
    };
  }

  // Fetch bill text content from Congress.gov API
  async fetchBillTextContent(textUrl) {
    // Note: In a real implementation, this would need proper API handling
    // For now, return a placeholder that indicates we tried but couldn't get text
    return null;
  }

  // Extract key excerpts from bill text for AI analysis
  extractKeyExcerpts(fullText) {
    if (!fullText) return null;

    // Look for sections that typically contain impact information
    const impactSections = [];
    const eligibilityText = this.extractEligibilityRequirements(fullText);
    const financialImpact = this.extractFinancialImpactDetails(fullText);

    // Extract sections with common impact keywords
    const impactKeywords = [
      'shall be entitled',
      'financial assistance',
      'tax credit',
      'benefit',
      'subsidy',
      'funding',
      'appropriation',
      'effective date'
    ];

    const lines = fullText.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].toLowerCase();
      
      for (const keyword of impactKeywords) {
        if (line.includes(keyword)) {
          // Extract this section and a few surrounding lines
          const section = lines.slice(Math.max(0, i - 1), i + 3).join('\n');
          if (section.length > 50) {
            impactSections.push(section.trim());
          }
          break;
        }
      }
    }

    return {
      impactSections: impactSections.slice(0, 5), // Limit to 5 sections
      eligibilityText,
      financialImpact
    };
  }

  // Extract eligibility requirements from bill text
  extractEligibilityRequirements(fullText) {
    const eligibilityKeywords = [
      'eligible',
      'qualification',
      'requirement',
      'criteria',
      'shall be qualified'
    ];

    const lines = fullText.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].toLowerCase();
      
      for (const keyword of eligibilityKeywords) {
        if (line.includes(keyword)) {
          // Extract this section
          const section = lines.slice(i, i + 2).join('\n');
          if (section.length > 30) {
            return section.trim();
          }
        }
      }
    }

    return null;
  }

  // Extract financial impact details from bill text
  extractFinancialImpactDetails(fullText) {
    const financialKeywords = [
      'amount of',
      'not to exceed',
      'shall not exceed',
      'maximum amount',
      'total funding',
      'appropriated'
    ];

    const lines = fullText.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].toLowerCase();
      
      for (const keyword of financialKeywords) {
        if (line.includes(keyword) && /\$|dollar/i.test(line)) {
          // Extract this section
          const section = lines.slice(i, i + 2).join('\n');
          if (section.length > 30) {
            return section.trim();
          }
        }
      }
    }

    return null;
  }

  // Extract key provisions from bill text
  extractKeyProvisions(fullText) {
    if (!fullText) return [];

    const provisions = [];
    const sectionKeywords = [
      'SEC.',
      'Section',
      'SECTION',
      '(a)',
      '(b)',
      '(c)'
    ];

    const lines = fullText.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Look for section headers or numbered provisions
      for (const keyword of sectionKeywords) {
        if (line.startsWith(keyword) && line.length > 20) {
          // Get the next few lines to form a provision
          const provisionLines = [];
          for (let j = i; j < Math.min(i + 3, lines.length); j++) {
            const nextLine = lines[j].trim();
            if (nextLine) {
              provisionLines.push(nextLine);
            }
          }
          
          const provision = provisionLines.join(' ').substring(0, 200);
          if (provision.length > 50) {
            provisions.push(provision + '...');
          }
          
          if (provisions.length >= 5) break; // Limit to 5 provisions
        }
      }
      
      if (provisions.length >= 5) break;
    }

    return provisions;
  }

  // Generate enhanced summary from available data
  generateEnhancedSummary(legislation) {
    let enhanced = legislation.summary || legislation.description || '';

    // Add bill context and metadata
    if (legislation.billNumber && legislation.congress) {
      enhanced += `\n\nBILL DETAILS:\n`;
      enhanced += `- Bill Number: ${legislation.billNumber}\n`;
      enhanced += `- Congress: ${legislation.congress}th Congress\n`;
      enhanced += `- Chamber: ${legislation.chamber || 'Not specified'}\n`;
      enhanced += `- Category: ${legislation.category || 'Not specified'}\n`;
      enhanced += `- Status: ${legislation.status || 'Unknown'}\n`;
    }

    // Add sponsor information if available
    if (legislation.sponsor?.name) {
      enhanced += `\nSPONSOR INFORMATION:\n`;
      enhanced += `- Primary Sponsor: ${legislation.sponsor.name}`;
      if (legislation.sponsor.party && legislation.sponsor.state) {
        enhanced += ` (${legislation.sponsor.party}-${legislation.sponsor.state})`;
      }
      enhanced += '\n';
    }

    // Add timeline information
    if (legislation.introducedDate || legislation.lastActionDate) {
      enhanced += `\nTIMELINE:\n`;
      if (legislation.introducedDate) {
        enhanced += `- Introduced: ${legislation.introducedDate}\n`;
      }
      if (legislation.lastActionDate && legislation.lastAction) {
        enhanced += `- Last Action: ${legislation.lastAction} (${legislation.lastActionDate})\n`;
      }
    }

    // Add voting record if available
    if (legislation.votingRecord) {
      enhanced += `\nLEGISLATIVE PROGRESS:\n`;
      if (legislation.votingRecord.committee) {
        const comm = legislation.votingRecord.committee;
        enhanced += `- Committee Vote: ${comm.yes} yes, ${comm.no} no`;
        if (comm.abstain > 0) enhanced += `, ${comm.abstain} abstain`;
        enhanced += '\n';
      }
      if (legislation.votingRecord.house) {
        const house = legislation.votingRecord.house;
        enhanced += `- House Vote: ${house.yes} yes, ${house.no} no`;
        if (house.abstain > 0) enhanced += `, ${house.abstain} abstain`;
        enhanced += '\n';
      }
      if (legislation.votingRecord.senate) {
        const senate = legislation.votingRecord.senate;
        enhanced += `- Senate Vote: ${senate.yes} yes, ${senate.no} no`;
        if (senate.abstain > 0) enhanced += `, ${senate.abstain} abstain`;
        enhanced += '\n';
      }
    }

    // Add bill analysis based on title/category
    enhanced += this.generateBillAnalysisFromTitle(legislation);

    // Add data availability note
    enhanced += `\nDATA AVAILABILITY NOTE:\n`;
    enhanced += `Full bill text was not available through the Congress.gov API (using DEMO_KEY). `;
    enhanced += `Analysis is based on available bill summary, metadata, and sponsor information. `;
    enhanced += `For more detailed analysis, the complete bill text would be needed.`;

    return enhanced.trim();
  }

  // Generate additional context based on bill title and category
  generateBillAnalysisFromTitle(legislation) {
    let analysis = `\nBILL CONTEXT ANALYSIS:\n`;
    
    const title = (legislation.title || '').toLowerCase();
    const category = (legislation.category || '').toLowerCase();

    // Provide context based on common bill patterns
    if (title.includes('tax') || title.includes('credit')) {
      analysis += `- This appears to be tax-related legislation that could affect taxpayer obligations or benefits.\n`;
    }
    
    if (title.includes('act') && title.includes('amend')) {
      analysis += `- This bill appears to amend existing legislation rather than create new programs.\n`;
    }
    
    if (title.includes('protect') || title.includes('prevent')) {
      analysis += `- This appears to be protective/preventive legislation addressing specific harms or risks.\n`;
    }
    
    if (title.includes('veteran') || category.includes('veteran')) {
      analysis += `- This legislation specifically affects veterans and their benefits or services.\n`;
    }
    
    if (title.includes('worker') || title.includes('employment')) {
      analysis += `- This bill appears to affect workplace rights, employment, or labor issues.\n`;
    }
    
    if (title.includes('healthcare') || title.includes('health')) {
      analysis += `- This legislation relates to healthcare policy, access, or medical services.\n`;
    }

    if (title.includes('assault weapon') || title.includes('firearm')) {
      analysis += `- This bill addresses firearms regulations and Second Amendment issues.\n`;
    }

    // Add status-specific context
    if (legislation.status === 'Introduced') {
      analysis += `- As an introduced bill, this is in early stages and may undergo significant changes.\n`;
    } else if (legislation.status === 'Passed') {
      analysis += `- This bill has passed and its provisions are already in effect or implementation.\n`;
    }

    return analysis;
  }

  // Clear cache
  clearCache() {
    this.cache.clear();
  }

  // Get cache stats
  getCacheStats() {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.keys())
    };
  }
}

const billTextService = new BillTextService();
export default billTextService;