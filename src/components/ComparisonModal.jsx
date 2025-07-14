import React from 'react';
import PoliticianCard from './PoliticianCard';

const ComparisonModal = ({ isOpen, onClose, selectedBills, politicians, userProfile }) => {
  if (!isOpen || selectedBills.length === 0) return null;

  const formatFinancialEffect = (amount) => {
    if (amount === 0) return '$0';
    const absAmount = Math.abs(amount);
    const sign = amount >= 0 ? '+' : '-';
    return `${sign}$${absAmount.toLocaleString()}`;
  };

  const findPolitician = (id) => {
    return politicians.find(p => p.id === id);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Passed':
        return 'bg-green-100 text-green-800';
      case 'In Committee':
        return 'bg-yellow-100 text-yellow-800';
      case 'Proposed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const totalFinancialImpact = selectedBills.reduce((sum, bill) => sum + (bill.financialEffect || 0), 0);
  const averageConfidence = selectedBills.reduce((sum, bill) => sum + (bill.confidence || 0), 0) / selectedBills.length;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Bill Comparison ({selectedBills.length} bills)
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-white p-3 rounded-lg">
              <div className="text-lg font-bold text-gray-900">
                {formatFinancialEffect(totalFinancialImpact)}
              </div>
              <div className="text-sm text-gray-600">Total Financial Impact</div>
            </div>
            <div className="bg-white p-3 rounded-lg">
              <div className="text-lg font-bold text-gray-900">
                {Math.round(averageConfidence)}%
              </div>
              <div className="text-sm text-gray-600">Average Confidence</div>
            </div>
            <div className="bg-white p-3 rounded-lg">
              <div className="text-lg font-bold text-gray-900">
                {selectedBills.filter(b => b.isBenefit).length}/{selectedBills.length}
              </div>
              <div className="text-sm text-gray-600">Benefits vs Costs</div>
            </div>
          </div>
        </div>

        <div className="overflow-auto max-h-[60vh]">
          <div className="p-4">
            <div className="grid gap-4">
              {selectedBills.map((bill, index) => (
                <div key={bill.id} className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {bill.title}
                      </h3>
                      <div className="flex items-center space-x-2 mb-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(bill.status)}`}>
                          {bill.status}
                        </span>
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {bill.category}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          bill.scope === 'Federal' ? 'bg-blue-100 text-blue-800' :
                          bill.scope === 'State' ? 'bg-purple-100 text-purple-800' :
                          'bg-orange-100 text-orange-800'
                        }`}>
                          {bill.scope}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="text-sm text-gray-600 mb-1">Financial Effect</div>
                      <div className={`text-lg font-bold ${
                        bill.financialEffect >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {formatFinancialEffect(bill.financialEffect)}
                      </div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="text-sm text-gray-600 mb-1">Timeline</div>
                      <div className="text-lg font-semibold text-gray-900">
                        {bill.timeline}
                      </div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="text-sm text-gray-600 mb-1">Confidence</div>
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full" 
                            style={{ width: `${bill.confidence}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-900">{bill.confidence}%</span>
                      </div>
                    </div>
                  </div>

                  {bill.sponsor && (
                    <div className="mb-3">
                      <div className="text-sm text-gray-600 mb-2">Primary Sponsor</div>
                      <PoliticianCard politician={findPolitician(bill.sponsor)} size="small" />
                    </div>
                  )}

                  <div className="text-sm text-gray-700">
                    {bill.personalImpact}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Comparing {selectedBills.length} pieces of legislation for {userProfile?.name || 'your profile'}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => {
                  const comparisonData = {
                    bills: selectedBills,
                    totalImpact: totalFinancialImpact,
                    averageConfidence: Math.round(averageConfidence),
                    userLocation: userProfile?.location
                  };
                  const shareText = `Legislative Comparison Analysis\n\nComparing ${selectedBills.length} bills:\n${selectedBills.map(b => `• ${b.title} (${formatFinancialEffect(b.financialEffect)})`).join('\n')}\n\nTotal Financial Impact: ${formatFinancialEffect(totalFinancialImpact)}\nAverage Confidence: ${Math.round(averageConfidence)}%\n\nGenerated by VoterImpact`;
                  
                  if (navigator.share) {
                    navigator.share({ title: 'Legislative Comparison', text: shareText });
                  } else {
                    navigator.clipboard.writeText(shareText);
                    alert('Comparison copied to clipboard!');
                  }
                }}
                className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100"
              >
                Share Comparison
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComparisonModal;