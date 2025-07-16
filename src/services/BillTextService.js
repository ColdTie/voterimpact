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

    try {
      // For federal bills, try to fetch full text
      if (legislation.scope === 'Federal' && legislation.congress && legislation.billNumber) {
        const billType = this.extractBillType(legislation.billNumber);
        const billNumber = this.extractBillNumber(legislation.billNumber);
        
        if (billType && billNumber) {
          const textVersions = await CongressService.getBillText(
            legislation.congress,
            billType,
            billNumber
          );

          if (textVersions && textVersions.length > 0) {
            const enhancedLegislation = await this.enhanceLegislationWithText(
              legislation,
              textVersions
            );
            
            // Cache the result
            this.cache.set(cacheKey, {
              data: enhancedLegislation,
              timestamp: Date.now()
            });
            
            return enhancedLegislation;
          }
        }
      }

      // If we can't fetch text, enhance with available data
      return this.enhanceLegislationWithoutText(legislation);
      
    } catch (error) {
      console.warn('Failed to fetch bill text:', error);
      return this.enhanceLegislationWithoutText(legislation);
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

    // Add context based on bill number and congress
    if (legislation.billNumber && legislation.congress) {
      enhanced += `\n\nThis is ${legislation.billNumber} from the ${legislation.congress}th Congress.`;
    }

    // Add status context
    if (legislation.status) {
      enhanced += ` Current status: ${legislation.status}.`;
    }

    // Add sponsor information if available
    if (legislation.sponsor?.name) {
      enhanced += ` Sponsored by ${legislation.sponsor.name}`;
      if (legislation.sponsor.party && legislation.sponsor.state) {
        enhanced += ` (${legislation.sponsor.party}-${legislation.sponsor.state})`;
      }
      enhanced += '.';
    }

    return enhanced.trim();
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