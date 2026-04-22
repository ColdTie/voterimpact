import React, { useState } from 'react';

const LocalEvents = ({ location }) => {
  const [filter, setFilter] = useState('all');
  const [rsvpd, setRsvpd] = useState(new Set());

  const events = [
    {
      id: 'evt-1',
      title: 'Town Hall: Housing Development Plan',
      description: 'Public comment session on the proposed Oak & 5th mixed-use development. City planners will present updated plans and take questions from residents.',
      date: '2026-05-03',
      time: '6:30 PM',
      location: 'City Hall, Council Chambers',
      type: 'town-hall',
      attendees: 89,
      organizer: 'City Planning Department',
      tags: ['Housing', 'Development'],
    },
    {
      id: 'evt-2',
      title: 'Voter Registration Drive',
      description: 'Help your neighbors register to vote! Volunteers will assist with registration forms and provide information about upcoming elections. All are welcome.',
      date: '2026-05-10',
      time: '10:00 AM - 3:00 PM',
      location: 'Community Center, Main Hall',
      type: 'volunteer',
      attendees: 23,
      organizer: 'Community Action Network',
      tags: ['Voter Registration', 'Volunteering'],
    },
    {
      id: 'evt-3',
      title: 'School Board Budget Meeting',
      description: 'The school board will vote on next year\'s budget, including proposed cuts to after-school programs. Public testimony will be taken.',
      date: '2026-04-29',
      time: '7:00 PM',
      location: 'Lincoln High School Auditorium',
      type: 'government',
      attendees: 156,
      organizer: 'School Board',
      tags: ['Education', 'Budget'],
    },
    {
      id: 'evt-4',
      title: 'Healthcare Bill Q&A Session',
      description: 'Dr. Rachel Kim, healthcare policy researcher, will break down the new healthcare expansion bill in plain language. Bring your questions!',
      date: '2026-05-07',
      time: '5:30 PM',
      location: 'Public Library, Meeting Room B',
      type: 'education',
      attendees: 34,
      organizer: 'Civic Learning Circle',
      tags: ['Healthcare', 'Community Learning'],
    },
    {
      id: 'evt-5',
      title: 'Neighborhood Park Cleanup & Petition Signing',
      description: 'Join us for a community park cleanup and sign the petition for park renovation funding. Gloves and bags provided. Refreshments after!',
      date: '2026-05-17',
      time: '9:00 AM - 12:00 PM',
      location: 'Riverside Park, Main Entrance',
      type: 'volunteer',
      attendees: 42,
      organizer: 'Friends of Riverside Park',
      tags: ['Environment', 'Community Action'],
    },
    {
      id: 'evt-6',
      title: 'City Council Work Session: Transit Expansion',
      description: 'Council members will discuss the proposed bus route expansion plan. This is a work session - public observation welcome but no testimony.',
      date: '2026-05-12',
      time: '4:00 PM',
      location: 'City Hall, Room 201',
      type: 'government',
      attendees: 28,
      organizer: 'City Council',
      tags: ['Transportation', 'Infrastructure'],
    },
  ];

  const typeColors = {
    'town-hall': { bg: 'bg-amber-50', border: 'border-amber-200', badge: 'bg-amber-100 text-amber-800', icon: 'text-amber-500' },
    'volunteer': { bg: 'bg-green-50', border: 'border-green-200', badge: 'bg-green-100 text-green-800', icon: 'text-green-500' },
    'government': { bg: 'bg-blue-50', border: 'border-blue-200', badge: 'bg-blue-100 text-blue-800', icon: 'text-blue-500' },
    'education': { bg: 'bg-purple-50', border: 'border-purple-200', badge: 'bg-purple-100 text-purple-800', icon: 'text-purple-500' },
  };

  const typeLabels = {
    'town-hall': 'Town Hall',
    'volunteer': 'Volunteer',
    'government': 'Government',
    'education': 'Learning',
  };

  const filters = [
    { id: 'all', label: 'All Events' },
    { id: 'town-hall', label: 'Town Halls' },
    { id: 'volunteer', label: 'Volunteer' },
    { id: 'government', label: 'Government' },
    { id: 'education', label: 'Learning' },
  ];

  const filteredEvents = filter === 'all' ? events : events.filter(e => e.type === filter);

  const toggleRsvp = (eventId) => {
    setRsvpd(prev => {
      const next = new Set(prev);
      if (next.has(eventId)) {
        next.delete(eventId);
      } else {
        next.add(eventId);
      }
      return next;
    });
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr + 'T00:00:00');
    const now = new Date();
    const diff = Math.floor((date - now) / (1000 * 60 * 60 * 24));

    const formatted = date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });

    if (diff === 0) return { text: formatted, badge: 'Today', urgent: true };
    if (diff === 1) return { text: formatted, badge: 'Tomorrow', urgent: true };
    if (diff <= 7) return { text: formatted, badge: `In ${diff} days`, urgent: false };
    return { text: formatted, badge: null, urgent: false };
  };

  return (
    <div className="space-y-4">
      {/* Filter Pills */}
      <div className="flex space-x-2 overflow-x-auto pb-1">
        {filters.map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              filter === f.id
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Events List */}
      <div className="space-y-3">
        {filteredEvents.map(event => {
          const colors = typeColors[event.type];
          const dateInfo = formatDate(event.date);
          const isRsvpd = rsvpd.has(event.id);

          return (
            <div key={event.id} className={`rounded-lg border ${colors.border} ${colors.bg} overflow-hidden`}>
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${colors.badge}`}>
                        {typeLabels[event.type]}
                      </span>
                      {dateInfo.badge && (
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          dateInfo.urgent ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {dateInfo.badge}
                        </span>
                      )}
                    </div>
                    <h3 className="text-sm font-semibold text-gray-900">{event.title}</h3>
                  </div>
                </div>

                <p className="text-sm text-gray-700 mb-3">{event.description}</p>

                <div className="grid grid-cols-2 gap-2 mb-3 text-xs text-gray-600">
                  <div className="flex items-center space-x-1">
                    <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>{dateInfo.text} at {event.time}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>{event.location}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>{event.attendees + (isRsvpd ? 1 : 0)} attending</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <span>{event.organizer}</span>
                  </div>
                </div>

                {/* Tags & RSVP */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-200/50">
                  <div className="flex flex-wrap gap-1">
                    {event.tags.map(tag => (
                      <span key={tag} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-white/60 text-gray-600">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <button
                    onClick={() => toggleRsvp(event.id)}
                    className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                      isRsvpd
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {isRsvpd ? 'Going!' : 'RSVP'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredEvents.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p className="text-sm">No events found for this filter.</p>
        </div>
      )}

      {/* Suggest an Event */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 text-center shadow-sm">
        <p className="text-sm text-gray-600 mb-2">Know of a civic event in {location}?</p>
        <button className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors">
          Suggest an Event
        </button>
      </div>
    </div>
  );
};

export default LocalEvents;
