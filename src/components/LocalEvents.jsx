import React, { useState, useEffect } from 'react';

const STORAGE_KEY = 'voterimpact_local_events';

const generateSampleEvents = (location) => {
  const city = location?.split(',')[0]?.trim() || 'Your City';
  const state = location?.split(',')[1]?.trim() || 'US';

  return [
    {
      id: 'evt-1',
      title: `${city} Town Hall: Housing & Development`,
      type: 'town-hall',
      date: '2026-04-26',
      time: '6:00 PM',
      location: `${city} Community Center`,
      address: `123 Main St, ${city}, ${state}`,
      description: `Join your city council members for an open forum on housing development, zoning changes, and affordable housing initiatives in ${city}. All residents welcome.`,
      organizer: `${city} City Council`,
      attendees: 47,
      maxAttendees: 200,
      tags: ['Housing', 'Local Government'],
      isVirtual: false,
      virtualLink: null
    },
    {
      id: 'evt-2',
      title: 'Voter Registration Drive',
      type: 'voter-drive',
      date: '2026-05-03',
      time: '10:00 AM - 4:00 PM',
      location: `${city} Public Library`,
      address: `456 Oak Ave, ${city}, ${state}`,
      description: 'Help register new voters in your community! Volunteers needed to assist with registration forms, provide voter education materials, and answer questions about the voting process.',
      organizer: `${state} League of Voters`,
      attendees: 23,
      maxAttendees: 50,
      tags: ['Voting', 'Volunteering'],
      isVirtual: false,
      virtualLink: null
    },
    {
      id: 'evt-3',
      title: 'State Budget Impact Workshop',
      type: 'workshop',
      date: '2026-05-10',
      time: '2:00 PM',
      location: 'Virtual Event',
      address: null,
      description: `Understanding how the state budget affects ${city}: A deep-dive workshop on education funding, infrastructure spending, and social services allocations. Learn how to read budget proposals and advocate for your priorities.`,
      organizer: 'Civic Engagement Coalition',
      attendees: 89,
      maxAttendees: 500,
      tags: ['Economic', 'Education'],
      isVirtual: true,
      virtualLink: '#'
    },
    {
      id: 'evt-4',
      title: 'Community Clean Energy Forum',
      type: 'forum',
      date: '2026-05-15',
      time: '7:00 PM',
      location: `${city} High School Auditorium`,
      address: `789 School Rd, ${city}, ${state}`,
      description: 'Local environmental organizations and city planners discuss the clean energy transition plan, solar incentive programs, and electric vehicle infrastructure for our community.',
      organizer: `${city} Environmental Alliance`,
      attendees: 34,
      maxAttendees: 150,
      tags: ['Environment', 'Energy'],
      isVirtual: false,
      virtualLink: null
    },
    {
      id: 'evt-5',
      title: 'Veterans Benefits Info Session',
      type: 'info-session',
      date: '2026-05-20',
      time: '11:00 AM',
      location: `${city} Veterans Hall`,
      address: `321 Veteran Blvd, ${city}, ${state}`,
      description: 'Free information session about new veteran benefit programs, healthcare access updates, and employment assistance. Open to all veterans and their families.',
      organizer: 'Veterans Affairs Office',
      attendees: 28,
      maxAttendees: 75,
      tags: ['Veterans Affairs', 'Healthcare'],
      isVirtual: false,
      virtualLink: null
    },
    {
      id: 'evt-6',
      title: 'Neighborhood Watch & Safety Meeting',
      type: 'meeting',
      date: '2026-05-22',
      time: '6:30 PM',
      location: `${city} Fire Station #3`,
      address: `555 Safety Lane, ${city}, ${state}`,
      description: 'Monthly community safety meeting with local police and fire departments. Discuss neighborhood concerns, review recent safety initiatives, and learn about new community programs.',
      organizer: `${city} Neighborhood Association`,
      attendees: 15,
      maxAttendees: 60,
      tags: ['Community', 'Safety'],
      isVirtual: false,
      virtualLink: null
    }
  ];
};

const typeStyles = {
  'town-hall': { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Town Hall' },
  'voter-drive': { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Voter Drive' },
  'workshop': { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Workshop' },
  'forum': { bg: 'bg-teal-100', text: 'text-teal-700', label: 'Forum' },
  'info-session': { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Info Session' },
  'meeting': { bg: 'bg-rose-100', text: 'text-rose-700', label: 'Meeting' },
  'rally': { bg: 'bg-red-100', text: 'text-red-700', label: 'Rally' },
  'other': { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Event' }
};

const LocalEvents = ({ userProfile }) => {
  const [events, setEvents] = useState([]);
  const [rsvps, setRsvps] = useState({});
  const [showCreate, setShowCreate] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const [expandedEvent, setExpandedEvent] = useState(null);
  const [newEvent, setNewEvent] = useState({
    title: '', type: 'meeting', date: '', time: '',
    location: '', description: '', tags: '', isVirtual: false
  });

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
      if (stored?.events?.length > 0) {
        setEvents(stored.events);
        setRsvps(stored.rsvps || {});
      } else {
        const sample = generateSampleEvents(userProfile?.location);
        setEvents(sample);
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ events: sample, rsvps: {} }));
      }
    } catch {
      setEvents(generateSampleEvents(userProfile?.location));
    }
  }, [userProfile?.location]);

  const handleRsvp = (eventId) => {
    const newRsvps = { ...rsvps };
    const wasRsvped = newRsvps[eventId];

    const updated = events.map(e => {
      if (e.id === eventId) {
        return { ...e, attendees: e.attendees + (wasRsvped ? -1 : 1) };
      }
      return e;
    });

    if (wasRsvped) {
      delete newRsvps[eventId];
    } else {
      newRsvps[eventId] = true;
    }

    setEvents(updated);
    setRsvps(newRsvps);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ events: updated, rsvps: newRsvps }));
  };

  const handleCreateEvent = () => {
    if (!newEvent.title.trim() || !newEvent.date) return;

    const event = {
      id: `evt-${Date.now()}`,
      title: newEvent.title,
      type: newEvent.type,
      date: newEvent.date,
      time: newEvent.time || 'TBD',
      location: newEvent.isVirtual ? 'Virtual Event' : newEvent.location,
      address: newEvent.isVirtual ? null : newEvent.location,
      description: newEvent.description,
      organizer: userProfile?.name || 'Community Member',
      attendees: 1,
      maxAttendees: 100,
      tags: newEvent.tags.split(',').map(t => t.trim()).filter(Boolean),
      isVirtual: newEvent.isVirtual,
      virtualLink: newEvent.isVirtual ? '#' : null
    };

    const updated = [event, ...events];
    const newRsvps = { ...rsvps, [event.id]: true };
    setEvents(updated);
    setRsvps(newRsvps);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ events: updated, rsvps: newRsvps }));
    setNewEvent({ title: '', type: 'meeting', date: '', time: '', location: '', description: '', tags: '', isVirtual: false });
    setShowCreate(false);
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const getDaysUntil = (dateStr) => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const eventDate = new Date(dateStr + 'T00:00:00');
    const diff = Math.ceil((eventDate - now) / (1000 * 60 * 60 * 24));
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Tomorrow';
    if (diff < 0) return 'Past';
    return `In ${diff} days`;
  };

  const eventTypes = ['all', 'town-hall', 'voter-drive', 'workshop', 'forum', 'info-session', 'meeting'];
  const filteredEvents = filterType === 'all' ? events : events.filter(e => e.type === filterType);
  const upcomingEvents = filteredEvents.filter(e => getDaysUntil(e.date) !== 'Past');
  const myRsvpCount = Object.keys(rsvps).length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-rose-500 to-orange-500 rounded-xl p-5 text-white">
          <div className="text-3xl font-bold">{upcomingEvents.length}</div>
          <div className="text-rose-100 text-sm mt-1">Upcoming Events</div>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl p-5 text-white">
          <div className="text-3xl font-bold">{myRsvpCount}</div>
          <div className="text-blue-100 text-sm mt-1">Your RSVPs</div>
        </div>
        <div className="bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl p-5 text-white">
          <div className="text-3xl font-bold">
            {events.reduce((sum, e) => sum + e.attendees, 0).toLocaleString()}
          </div>
          <div className="text-violet-100 text-sm mt-1">Total Attendees</div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Local Civic Events</h3>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          {showCreate ? 'Cancel' : 'Create Event'}
        </button>
      </div>

      {showCreate && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Event Title</label>
              <input
                type="text"
                value={newEvent.title}
                onChange={(e) => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., Community Budget Forum"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={newEvent.type}
                onChange={(e) => setNewEvent(prev => ({ ...prev, type: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {Object.entries(typeStyles).map(([key, val]) => (
                  <option key={key} value={key}>{val.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input
                type="date"
                value={newEvent.date}
                onChange={(e) => setNewEvent(prev => ({ ...prev, date: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
              <input
                type="text"
                value={newEvent.time}
                onChange={(e) => setNewEvent(prev => ({ ...prev, time: e.target.value }))}
                placeholder="e.g., 6:00 PM"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="virtual-toggle"
              checked={newEvent.isVirtual}
              onChange={(e) => setNewEvent(prev => ({ ...prev, isVirtual: e.target.checked }))}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="virtual-toggle" className="text-sm text-gray-700">This is a virtual event</label>
          </div>
          {!newEvent.isVirtual && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input
                type="text"
                value={newEvent.location}
                onChange={(e) => setNewEvent(prev => ({ ...prev, location: e.target.value }))}
                placeholder="e.g., City Hall, 123 Main St"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={newEvent.description}
              onChange={(e) => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
              placeholder="What's this event about?"
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma-separated)</label>
            <input
              type="text"
              value={newEvent.tags}
              onChange={(e) => setNewEvent(prev => ({ ...prev, tags: e.target.value }))}
              placeholder="e.g., Housing, Local Government"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <button
            onClick={handleCreateEvent}
            disabled={!newEvent.title.trim() || !newEvent.date}
            className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-semibold text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Create Event
          </button>
        </div>
      )}

      <div className="flex space-x-2 overflow-x-auto pb-1">
        {eventTypes.map(type => {
          const style = type === 'all' ? { label: 'All Events' } : typeStyles[type];
          return (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                filterType === type
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {style.label}
            </button>
          );
        })}
      </div>

      <div className="space-y-4">
        {upcomingEvents.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <svg className="mx-auto h-12 w-12 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p>No upcoming events in this category. Create one to get your community together!</p>
          </div>
        ) : (
          upcomingEvents.map(event => {
            const style = typeStyles[event.type] || typeStyles.other;
            const isRsvped = rsvps[event.id];
            const isExpanded = expandedEvent === event.id;
            const daysUntil = getDaysUntil(event.date);
            const capacityPct = Math.round((event.attendees / event.maxAttendees) * 100);

            return (
              <div key={event.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-5">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 text-center">
                      <div className="w-14 bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                        <div className="bg-red-500 text-white text-xs font-bold py-0.5">
                          {new Date(event.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short' }).toUpperCase()}
                        </div>
                        <div className="py-1 text-xl font-bold text-gray-900">
                          {new Date(event.date + 'T00:00:00').getDate()}
                        </div>
                      </div>
                      <div className={`text-xs mt-1 font-medium ${
                        daysUntil === 'Today' ? 'text-red-600' :
                        daysUntil === 'Tomorrow' ? 'text-orange-600' :
                        'text-gray-500'
                      }`}>
                        {daysUntil}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${style.bg} ${style.text}`}>
                          {style.label}
                        </span>
                        {event.isVirtual && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-cyan-100 text-cyan-700">
                            Virtual
                          </span>
                        )}
                      </div>
                      <h4 className="font-semibold text-gray-900 mb-1">{event.title}</h4>
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {event.time}
                        </span>
                        <span className="flex items-center gap-1">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {event.location}
                        </span>
                      </div>
                    </div>

                    <div className="flex-shrink-0 flex flex-col items-end gap-2">
                      <button
                        onClick={() => handleRsvp(event.id)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                          isRsvped
                            ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                            : 'border border-blue-300 text-blue-700 hover:bg-blue-50'
                        }`}
                      >
                        {isRsvped ? 'Going' : 'RSVP'}
                      </button>
                      <div className="text-xs text-gray-500">
                        {event.attendees}/{event.maxAttendees} going
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center gap-3">
                    <div className="flex-1">
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            capacityPct > 80 ? 'bg-red-400' : capacityPct > 50 ? 'bg-amber-400' : 'bg-emerald-400'
                          }`}
                          style={{ width: `${Math.min(capacityPct, 100)}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-xs text-gray-500">{capacityPct}% full</span>
                    <button
                      onClick={() => setExpandedEvent(isExpanded ? null : event.id)}
                      className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                    >
                      {isExpanded ? 'Less' : 'More'}
                    </button>
                  </div>

                  {event.tags.length > 0 && (
                    <div className="flex gap-1.5 mt-3">
                      {event.tags.map(tag => (
                        <span key={tag} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {isExpanded && (
                  <div className="border-t border-gray-100 bg-gray-50 px-5 py-4">
                    <p className="text-sm text-gray-700 mb-3">{event.description}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>Organized by: <strong>{event.organizer}</strong></span>
                      {event.address && (
                        <span className="text-blue-600">{event.address}</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default LocalEvents;
