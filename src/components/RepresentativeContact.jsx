import React, { useState } from 'react';
import { useRepresentatives } from '../hooks/useRepresentatives';

const RepresentativeContact = ({ userLocation, onClose }) => {
  const { representatives, loading, error } = useRepresentatives(userLocation);
  const [selectedRep, setSelectedRep] = useState(null);
  const [messageType, setMessageType] = useState('support');
  const [billTitle, setBillTitle] = useState('');
  const [personalMessage, setPersonalMessage] = useState('');

  const messageTemplates = {
    support: {
      subject: 'Please Support [BILL]',
      body: `Dear [TITLE] [LASTNAME],

As your constituent in [LOCATION], I am writing to urge you to support [BILL].

This legislation is important to me because [PERSONAL_REASON].

[PERSONAL_MESSAGE]

Thank you for your time and consideration. I look forward to your response on this important matter.

Sincerely,
[YOUR_NAME]`
    },
    oppose: {
      subject: 'Please Oppose [BILL]',
      body: `Dear [TITLE] [LASTNAME],

As your constituent in [LOCATION], I am writing to urge you to oppose [BILL].

I have concerns about this legislation because [PERSONAL_REASON].

[PERSONAL_MESSAGE]

Thank you for representing my interests. I look forward to your response.

Sincerely,
[YOUR_NAME]`
    }
  };

  const generateMessage = (rep) => {
    const template = messageTemplates[messageType];
    const title = rep.position === 'Senator' ? 'Senator' : 'Representative';
    const lastName = rep.name.split(' ').pop();
    
    let body = template.body
      .replace('[TITLE]', title)
      .replace('[LASTNAME]', lastName)
      .replace('[LOCATION]', userLocation)
      .replace(/\[BILL\]/g, billTitle || '[BILL TITLE]')
      .replace('[PERSONAL_MESSAGE]', personalMessage ? `\n${personalMessage}\n` : '');

    return {
      subject: template.subject.replace('[BILL]', billTitle || '[BILL TITLE]'),
      body
    };
  };

  const handleContact = (rep, method) => {
    const message = generateMessage(rep);
    
    switch (method) {
      case 'email':
        if (rep.email) {
          window.location.href = `mailto:${rep.email}?subject=${encodeURIComponent(message.subject)}&body=${encodeURIComponent(message.body)}`;
        }
        break;
      case 'phone':
        if (rep.phone) {
          window.location.href = `tel:${rep.phone}`;
        }
        break;
      case 'website':
        if (rep.website || rep.url) {
          window.open(rep.website || rep.url, '_blank');
        }
        break;
      default:
        break;
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading representatives...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Contact Your Representatives</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>

        {error && (
          <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mb-4">
            <p className="text-sm text-yellow-800">{error}</p>
          </div>
        )}

        {/* Message Builder */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="font-medium mb-3">Prepare Your Message</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">Position</label>
              <select
                value={messageType}
                onChange={(e) => setMessageType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="support">Support</option>
                <option value="oppose">Oppose</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Bill Title</label>
              <input
                type="text"
                value={billTitle}
                onChange={(e) => setBillTitle(e.target.value)}
                placeholder="e.g., Affordable Housing Tax Credit Extension"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">
              Personal Message (Optional)
            </label>
            <textarea
              value={personalMessage}
              onChange={(e) => setPersonalMessage(e.target.value)}
              placeholder="Add your personal story or specific reasons..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm">
            <p className="font-medium text-blue-800 mb-1">💡 Tips for Effective Communication</p>
            <ul className="text-blue-700 text-xs space-y-1">
              <li>• Be specific about the bill and your position</li>
              <li>• Share personal stories about how it affects you</li>
              <li>• Be respectful and professional</li>
              <li>• Request a response to your concerns</li>
            </ul>
          </div>
        </div>

        {/* Representatives List */}
        <div className="space-y-4">
          <h3 className="font-medium">Your Representatives</h3>
          
          {representatives.length === 0 ? (
            <p className="text-gray-600">No representatives found for your location.</p>
          ) : (
            representatives.map((rep) => (
              <div key={rep.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-lg">
                      {rep.name}
                      {rep.party && (
                        <span className="ml-2 text-sm text-gray-600">
                          ({rep.party})
                        </span>
                      )}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {rep.position} • {rep.state}
                      {rep.district && ` • District ${rep.district}`}
                    </p>
                    
                    {selectedRep?.id === rep.id && (
                      <div className="mt-3 bg-gray-50 rounded p-3">
                        <pre className="text-xs whitespace-pre-wrap font-mono">
                          {generateMessage(rep).body}
                        </pre>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col space-y-2 ml-4">
                    {rep.phone && (
                      <button
                        onClick={() => handleContact(rep, 'phone')}
                        className="flex items-center px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                      >
                        📞 Call
                      </button>
                    )}
                    
                    {rep.email && (
                      <button
                        onClick={() => {
                          setSelectedRep(rep);
                          handleContact(rep, 'email');
                        }}
                        className="flex items-center px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                      >
                        ✉️ Email
                      </button>
                    )}
                    
                    {(rep.website || rep.url) && (
                      <button
                        onClick={() => handleContact(rep, 'website')}
                        className="flex items-center px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
                      >
                        🌐 Website
                      </button>
                    )}
                    
                    <button
                      onClick={() => setSelectedRep(rep.id === selectedRep?.id ? null : rep)}
                      className="text-xs text-blue-600 hover:text-blue-800"
                    >
                      {selectedRep?.id === rep.id ? 'Hide' : 'Preview'} Message
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Action Links */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium mb-3">Additional Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <a
              href="https://www.usa.gov/register-to-vote"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              🗳️ Register to Vote
            </a>
            
            <a
              href="https://www.usa.gov/election-office"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
            >
              📍 Find Polling Place
            </a>
            
            <a
              href="https://townhallproject.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
            >
              🏛️ Find Town Halls
            </a>
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default RepresentativeContact;