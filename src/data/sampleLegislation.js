// Sample legislation data for fallback when API is unavailable
export const sampleLegislation = [
  {
    id: 1,
    title: 'Affordable Housing Tax Credit Extension',
    status: 'In Committee',
    category: 'Housing',
    scope: 'Federal',
    personalImpact: 'You could see your housing costs reduced by up to $200/month through expanded tax credits that encourage affordable housing development in your area.',
    financialEffect: 2400,
    timeline: '6-12 months',
    confidence: 75,
    isBenefit: true,
    description: 'Extends and expands the Low-Income Housing Tax Credit program to increase affordable housing development nationwide.',
    summary: 'This bill extends the Low-Income Housing Tax Credit (LIHTC) program through 2030 and increases the annual credit authority by 50%.',
    keyProvisions: [
      'Annual credit allocation increased by 50% ($2.3 billion to $3.5 billion)',
      'Income targeting: 10% of credits reserved for developments serving extremely low-income families'
    ],
    sponsor: 'sanders-vt',
    cosponsors: ['warren-ma', 'cortez-masto-nv'],
    congress: 118,
    chamber: 'senate',
    billNumber: 'S.1234'
  }
  // Add more sample bills as needed
];