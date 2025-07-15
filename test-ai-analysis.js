// Test script to verify enhanced AI analysis with detailed bill data
const { analyzePersonalImpact } = require('./src/services/claudeService');

// Sample test legislation with enhanced data
const testLegislation = {
  id: 1,
  title: 'Affordable Housing Tax Credit Extension',
  status: 'In Committee',
  category: 'Housing',
  scope: 'Federal',
  description: 'Extends and expands the Low-Income Housing Tax Credit program to increase affordable housing development nationwide.',
  summary: 'This bill extends the Low-Income Housing Tax Credit (LIHTC) program through 2030 and increases the annual credit authority by 50%. Key provisions include: (1) Increases the 9% credit allocation to states by 50% annually, (2) Extends the placed-in-service deadline for projects allocated credits in 2020-2023, (3) Allows income averaging across units in a project, (4) Reduces the 50% test for bond-financed developments to 25%, (5) Enables tribal governments to receive direct allocations. The bill aims to create approximately 2 million additional affordable housing units over 10 years, with priority for developments serving extremely low-income families (30% AMI or below).',
  keyProvisions: [
    'Annual credit allocation increased by 50% ($2.3 billion to $3.5 billion)',
    'Income targeting: 10% of credits reserved for developments serving extremely low-income families', 
    'Geographic distribution: Rural areas receive minimum 15% allocation',
    'Tenant protections: 30-year affordability period for all LIHTC properties',
    'Workforce development: Projects must include local hiring requirements'
  ],
  billNumber: 'S.1234',
  congress: 118
};

// Sample user profile - $60k California resident
const testUserProfile = {
  name: 'Test User',
  age: 35,
  location: 'California',
  monthly_income: 5000,
  company: 'Tech Company',
  is_veteran: false,
  political_interests: ['Housing', 'Economic']
};

async function testEnhancedAnalysis() {
  console.log('Testing enhanced AI analysis with detailed bill data...');
  console.log('\nBill:', testLegislation.title);
  console.log('User Profile:', `${testUserProfile.name}, $${testUserProfile.monthly_income * 12}/year, ${testUserProfile.location}`);
  
  try {
    const result = await analyzePersonalImpact(testLegislation, testUserProfile);
    
    if (result.success) {
      console.log('\n✅ AI Analysis Result:');
      console.log('Personal Impact:', result.data.personalImpact);
      console.log('Financial Effect:', result.data.financialEffect);
      console.log('Timeline:', result.data.timeline);
      console.log('Confidence:', result.data.confidence + '%');
      console.log('Is Benefit:', result.data.isBenefit);
      
      // Check if analysis references specific bill content
      const hasSpecificContent = 
        result.data.personalImpact.includes('LIHTC') ||
        result.data.personalImpact.includes('Low-Income Housing Tax Credit') ||
        result.data.personalImpact.includes('2 million') ||
        result.data.personalImpact.includes('2030');
        
      if (hasSpecificContent) {
        console.log('\n✅ SUCCESS: AI analysis includes specific bill content from summary/provisions');
      } else {
        console.log('\n⚠️  WARNING: AI analysis may not be using detailed bill content');
      }
      
    } else {
      console.log('\n❌ AI Analysis Failed:', result.error);
    }
    
  } catch (error) {
    console.error('\n❌ Test Error:', error.message);
  }
}

// Run the test
testEnhancedAnalysis();