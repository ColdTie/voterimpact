import React from 'react';

const LegislationCard = ({ legislation }) => {
  const {
    title,
    status,
    personalImpact,
    timeline,
    confidence,
    financialEffect,
    isBenefit
  } = legislation;

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

  const formatFinancialEffect = (amount) => {
    if (amount === 0) return '$0';
    const absAmount = Math.abs(amount);
    const sign = amount >= 0 ? '+' : '-';
    return `${sign}$${absAmount.toLocaleString()}`;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 mx-4 mb-4 p-4">
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-900 flex-1 pr-2">
          {title}
        </h3>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
          {status}
        </span>
      </div>

      <div className="bg-gray-50 rounded-lg p-3 mb-3">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Personal Impact</h4>
        
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600">Financial Effect:</span>
          <div className="flex items-center">
            <span className={`text-lg font-bold ${
              financialEffect >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {formatFinancialEffect(financialEffect)}
            </span>
            {isBenefit !== undefined && (
              <div className={`ml-2 w-2 h-2 rounded-full ${
                isBenefit ? 'bg-green-500' : 'bg-red-500'
              }`}></div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600">Timeline:</span>
          <span className="text-sm font-medium text-gray-900">{timeline}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Confidence:</span>
          <div className="flex items-center">
            <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
              <div 
                className="bg-blue-500 h-2 rounded-full" 
                style={{ width: `${confidence}%` }}
              ></div>
            </div>
            <span className="text-sm font-medium text-gray-900">{confidence}%</span>
          </div>
        </div>
      </div>

      {personalImpact && (
        <p className="text-sm text-gray-700 leading-relaxed">
          {personalImpact}
        </p>
      )}
    </div>
  );
};

export default LegislationCard;