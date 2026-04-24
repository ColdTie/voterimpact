import React, { useState } from 'react';

const generateEvents = (location) => {
  const city = location?.split(',')[0]?.trim() || 'Your City';
  return [
    {
      id: 1,
      title: `${city} Town Hall: Housing & Development`,
      type: 'Town Hall',
      date: 'May 3, 2026',
      time: '6:00 PM - 8:00 PM',
      location: `${city} Community Center`,
      address: `123 Main St, ${location || 'Your City'}`,
      description: 'Join your city council members for an open discussion on housing development, zoning changes, and rent stabilization proposals.',
      attendees: 87,
      capacity: 150,
      topics: ['Housing', 'Zoning', 'Development'],
      rsvpd: false,
      virtual: true,
      virtualLink: true,
      organizer: 'City Council',
    },
    {
      id: 2,
      title: 'Voter Registration Drive',
      type: 'Registration',
      date: 'May 5, 2026',
      time: '10:00 AM - 4:00 PM',
      location: `${city} Public Library`,
      address: `456 Oak Ave, ${location || 'Your City'}`,
      description: 'Help register new voters in your community. Volunteers needed to assist with voter registration forms and answer questions.',
      attendees: 23,
      capacity: null,
      topics: ['Voter Registration', 'Civic Engagement'],
      rsvpd: false,
      virtual: false,
      organizer: 'League of Voters',
    },
    {
      id: 3,
      title: 'Know Your Rights: Tenant Workshop',
      type: 'Workshop',
      date: 'May 8, 2026',
      time: '7:00 PM - 9:00 PM',
      location: 'Virtual Event',
      address: 'Zoom link provided after RSVP',
      description: 'Free legal workshop covering tenant rights, eviction protections, and how to navigate landlord disputes. Local attorneys will answer questions.',
      attendees: 134,
      capacity: 200,
      topics: ['Housing', 'Legal Rights', 'Tenant Protection'],
      rsvpd: false,
      virtual: true,
      virtualLink: true,
      organizer: 'Legal Aid Society',
    },
    {
      id: 4,
      title: 'Community Budget Forum',
      type: 'Forum',
      date: 'May 12, 2026',
      time: '5:30 PM - 7:30 PM',
      location: `${city} City Hall`,
      address: `789 Government Blvd, ${location || 'Your City'}`,
      description: 'Public forum on the proposed city budget for next fiscal year. Voice your priorities for public spending on infrastructure, education, and public safety.',
      attendees: 45,
      capacity: 200,
      topics: ['Budget', 'Public Spending', 'Infrastructure'],
      rsvpd: false,
      virtual: true,
      virtualLink: true,
      organizer: 'City Government',
    },
    {
      id: 5,
      title: 'Neighborhood Clean Energy Meetup',
      type: 'Meetup',
      date: 'May 15, 2026',
      time: '11:00 AM - 1:00 PM',
      location: `${city} Park Pavilion`,
      address: `321 Green St, ${location || 'Your City'}`,
      description: 'Connect with neighbors interested in community solar, energy efficiency programs, and local environmental initiatives. Light refreshments provided.',
      attendees: 31,
      capacity: 50,
      topics: ['Environment', 'Clean Energy', 'Community'],
      rsvpd: false,
      virtual: false,
      organizer: 'Green Neighbors Coalition',
    },
    {
      id: 6,
      title: 'Veterans Benefits Information Session',
      type: 'Info Session',
      date: 'May 18, 2026',
      time: '2:00 PM - 4:00 PM',
      location: `${city} Veterans Center`,
      address: `555 Service Rd, ${location || 'Your City'}`,
      description: 'Learn about federal and state benefits available to veterans including healthcare, education, housing, and employment assistance programs.',
      attendees: 56,
      capacity: 75,
      topics: ['Veterans', 'Benefits', 'Healthcare'],
      rsvpd: false,
      virtual: true,
      virtualLink: true,
      organizer: 'Veterans Affairs Office',
    },
  ];
};

const typeColors = {
  'Town Hall': 'bg-blue-100 text-blue-800 border-blue-200',
  'Registration': 'bg-green-100 text-green-800 border-green-200',
  'Workshop': 'bg-purple-100 text-purple-800 border-purple-200',
  'Forum': 'bg-amber-100 text-amber-800 border-amber-200',
  'Meetup': 'bg-emerald-100 text-emerald-800 border-emerald-200',
  'Info Session': 'bg-red-100 text-red-800 border-red-200',
};

const typeIcons = {
  'Town Hall': '🏛️',
  'Registration': '📋',
  'Workshop': '🎓',
  'Forum': '💬',
  'Meetup': '🤝',
  'Info Session': 'ℹ️',
};

function LocalEvents({ userProfile }) {
  const location = userProfile?.location || 'Your City, US';
  const [events, setEvents] = useState(() => generateEvents(location));
  const [view, setView] = useState('list');
  const [typeFilter, setTypeFilter] = useState('all');

  const handleRsvp = (eventId) => {
    setEvents(prev => prev.map(e =>
      e.id === eventId
        ? { ...e, rsvpd: !e.rsvpd, attendees: e.rsvpd ? e.attendees - 1 : e.attendees + 1 }
        : e
    ));
  };

  const filteredEvents = typeFilter === 'all'
    ? events
    : events.filter(e => e.type === typeFilter);

  const rsvpdCount = events.filter(e => e.rsvpd).length;

  return (
    <div className="space-y-4">
      {/* RSVP Summary */}
      {rsvpdCount > 0 && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-gray-900">You're attending {rsvpdCount} event{rsvpdCount !== 1 ? 's' : ''}</p>
              <p className="text-sm text-gray-600">Check your calendar for upcoming dates</p>
            </div>
          </div>
        </div>
      )}

      {/* View & Filter Controls */}
      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setTypeFilter('all')}
            className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors ${
              typeFilter === 'all' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All Events
          </button>
          {Object.keys(typeColors).map(type => (
            <button
              key={type}
              onClick={() => setTypeFilter(type)}
              className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors ${
                typeFilter === type ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
        <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-0.5">
          <button
            onClick={() => setView('list')}
            className={`p-1.5 rounded-md transition-colors ${view === 'list' ? 'bg-white shadow-sm' : ''}`}
          >
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <button
            onClick={() => setView('grid')}
            className={`p-1.5 rounded-md transition-colors ${view === 'grid' ? 'bg-white shadow-sm' : ''}`}
          >
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Events */}
      <div className={view === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : 'space-y-4'}>
        {filteredEvents.map(event => (
          <div key={event.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
            <div className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${typeColors[event.type] || 'bg-gray-100 text-gray-800'}`}>
                      {typeIcons[event.type]} {event.type}
                    </span>
                    {event.virtual && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-cyan-50 text-cyan-700 border border-cyan-200">
                        Virtual option
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-semibold text-gray-900">{event.title}</h3>
                </div>
              </div>

              <p className="mt-2 text-sm text-gray-600">{event.description}</p>

              <div className="mt-4 space-y-2">
                <div className="flex items-center space-x-2 text-sm text-gray-700">
                  <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="font-medium">{event.date}</span>
                  <span className="text-gray-400">|</span>
                  <span>{event.time}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-700">
                  <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>{event.location}</span>
                </div>
              </div>

              {/* Attendees & RSVP */}
              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex -space-x-2">
                    {[...Array(Math.min(4, event.attendees))].map((_, i) => (
                      <div
                        key={i}
                        className="w-7 h-7 rounded-full border-2 border-white bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center text-xs text-white font-medium"
                      >
                        {String.fromCharCode(65 + Math.floor(Math.random() * 26))}
                      </div>
                    ))}
                    {event.attendees > 4 && (
                      <div className="w-7 h-7 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-xs text-gray-600 font-medium">
                        +{event.attendees - 4}
                      </div>
                    )}
                  </div>
                  <span className="text-sm text-gray-500">
                    {event.attendees} attending{event.capacity ? ` of ${event.capacity}` : ''}
                  </span>
                </div>
                <button
                  onClick={() => handleRsvp(event.id)}
                  className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
                    event.rsvpd
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-indigo-600 text-white hover:bg-indigo-700'
                  }`}
                >
                  {event.rsvpd ? 'Going' : 'RSVP'}
                </button>
              </div>

              {/* Topics */}
              <div className="mt-3 flex flex-wrap gap-1.5">
                {event.topics.map(topic => (
                  <span key={topic} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
                    {topic}
                  </span>
                ))}
              </div>

              <div className="mt-2 text-xs text-gray-400">
                Organized by {event.organizer}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredEvents.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No events match this filter.</p>
          <button
            onClick={() => setTypeFilter('all')}
            className="mt-2 text-indigo-600 hover:text-indigo-700 text-sm font-medium"
          >
            View all events
          </button>
        </div>
      )}

      {/* Submit Event CTA */}
      <div className="bg-gradient-to-r from-emerald-50 to-cyan-50 rounded-xl border border-emerald-200 p-6 text-center">
        <h3 className="text-lg font-semibold text-gray-900">Hosting a civic event?</h3>
        <p className="mt-1 text-sm text-gray-600">
          Submit your town hall, workshop, or community meeting so neighbors can find it.
        </p>
        <button className="mt-4 inline-flex items-center px-6 py-3 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-700 transition-colors shadow-md">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Submit an Event
        </button>
      </div>
    </div>
  );
}

export default LocalEvents;
