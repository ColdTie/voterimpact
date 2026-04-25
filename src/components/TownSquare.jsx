import React, { useState } from 'react';

const SAMPLE_GROUPS = [
  {
    id: 'group-1',
    name: 'Parents for Better Schools',
    description: 'Parents advocating for improved school funding, teacher pay, and STEM programs in our district.',
    members: 234,
    category: 'Education',
    recentActivity: 'Organized a letter-writing campaign to the school board',
    isJoined: false,
    upcomingEvent: {
      title: 'School Board Meeting Watch Party',
      date: '2026-05-02T18:00:00Z',
      location: 'Community Center, Room 204',
    },
  },
  {
    id: 'group-2',
    name: 'Green Neighbors Coalition',
    description: 'Working together to support clean energy legislation and sustainable community practices.',
    members: 189,
    category: 'Environment',
    recentActivity: 'Solar co-op saved members $2,400 avg on installation',
    isJoined: false,
    upcomingEvent: {
      title: 'Community Garden Planning Session',
      date: '2026-05-05T10:00:00Z',
      location: 'Riverside Park Pavilion',
    },
  },
  {
    id: 'group-3',
    name: 'Veterans Support Network',
    description: 'Connecting veterans with resources, benefits guidance, and peer support in our community.',
    members: 156,
    category: 'Veterans',
    recentActivity: 'Helped 12 vets navigate new VA healthcare provisions',
    isJoined: false,
    upcomingEvent: {
      title: 'VA Benefits Workshop',
      date: '2026-05-08T14:00:00Z',
      location: 'VFW Hall',
    },
  },
  {
    id: 'group-4',
    name: 'Affordable Housing Alliance',
    description: 'Advocating for fair housing policies, rent stabilization, and homeownership programs.',
    members: 312,
    category: 'Housing',
    recentActivity: 'Testified at city council hearing on rent stabilization',
    isJoined: false,
    upcomingEvent: {
      title: 'Town Hall: Housing Crisis Solutions',
      date: '2026-05-12T19:00:00Z',
      location: 'City Hall Auditorium',
    },
  },
  {
    id: 'group-5',
    name: 'Small Business Owners United',
    description: 'Sharing resources and advocating for policies that support local small businesses.',
    members: 178,
    category: 'Economy',
    recentActivity: 'Organized buy-local campaign with 30 participating businesses',
    isJoined: false,
    upcomingEvent: null,
  },
  {
    id: 'group-6',
    name: 'Healthcare Access Now',
    description: 'Fighting for affordable healthcare access and prescription drug pricing reform.',
    members: 267,
    category: 'Healthcare',
    recentActivity: 'Collected 1,200 signatures for prescription drug pricing petition',
    isJoined: false,
    upcomingEvent: {
      title: 'Free Health Screening Day',
      date: '2026-05-15T09:00:00Z',
      location: 'Community Health Center',
    },
  },
];

const UPCOMING_EVENTS = [
  {
    id: 'event-1',
    title: 'City Council Open Forum',
    date: '2026-04-28T18:30:00Z',
    location: 'City Hall, Council Chambers',
    description: 'Monthly public comment period. Topics: road repairs, park funding, business permits.',
    attendees: 45,
    type: 'government',
  },
  {
    id: 'event-2',
    title: 'Voter Registration Drive',
    date: '2026-05-01T10:00:00Z',
    location: 'Central Library & 5 other locations',
    description: 'Help your neighbors register to vote before the June primary deadline.',
    attendees: 23,
    type: 'civic',
  },
  {
    id: 'event-3',
    title: 'Candidates Forum: District 7',
    date: '2026-05-06T19:00:00Z',
    location: 'High School Auditorium',
    description: 'Meet the candidates running for District 7 council seat. Q&A included.',
    attendees: 89,
    type: 'election',
  },
  {
    id: 'event-4',
    title: 'Community Budget Workshop',
    date: '2026-05-10T14:00:00Z',
    location: 'Recreation Center',
    description: 'Have your say on how the city spends its budget. Participate in priority-setting exercises.',
    attendees: 34,
    type: 'government',
  },
];

const formatDate = (dateStr) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
};

const formatTime = (dateStr) => {
  const d = new Date(dateStr);
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
};

const daysUntil = (dateStr) => {
  const diff = new Date(dateStr) - new Date();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
};

const TownSquare = ({ userLocation }) => {
  const [groups, setGroups] = useState(SAMPLE_GROUPS);
  const [activeTab, setActiveTab] = useState('groups');
  const [rsvps, setRsvps] = useState({});

  const handleJoinGroup = (groupId) => {
    setGroups(prev =>
      prev.map(g => {
        if (g.id !== groupId) return g;
        return {
          ...g,
          isJoined: !g.isJoined,
          members: g.isJoined ? g.members - 1 : g.members + 1,
        };
      })
    );
  };

  const handleRSVP = (eventId) => {
    setRsvps(prev => ({ ...prev, [eventId]: !prev[eventId] }));
  };

  const getEventTypeStyle = (type) => {
    switch (type) {
      case 'government': return 'bg-blue-100 text-blue-700';
      case 'civic': return 'bg-green-100 text-green-700';
      case 'election': return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      Education: 'from-amber-400 to-orange-500',
      Environment: 'from-green-400 to-emerald-500',
      Veterans: 'from-blue-400 to-indigo-500',
      Housing: 'from-purple-400 to-violet-500',
      Economy: 'from-yellow-400 to-amber-500',
      Healthcare: 'from-red-400 to-rose-500',
    };
    return colors[category] || 'from-gray-400 to-gray-500';
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">Town Square</h2>
        <p className="text-sm text-gray-600 mt-1">
          Find your people, join causes, and show up for your community
        </p>
      </div>

      <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 mb-6">
        <button
          onClick={() => setActiveTab('groups')}
          className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === 'groups'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Action Groups
        </button>
        <button
          onClick={() => setActiveTab('events')}
          className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === 'events'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Upcoming Events
        </button>
      </div>

      {activeTab === 'groups' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {groups.map(group => (
            <div
              key={group.id}
              className={`bg-white border rounded-xl overflow-hidden hover:shadow-md transition-all ${
                group.isJoined ? 'border-blue-300 ring-1 ring-blue-100' : 'border-gray-200'
              }`}
            >
              <div className={`h-2 bg-gradient-to-r ${getCategoryColor(group.category)}`} />
              <div className="p-5">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-gray-900">{group.name}</h3>
                    <span className="text-xs text-gray-500">{group.category}</span>
                  </div>
                  <button
                    onClick={() => handleJoinGroup(group.id)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                      group.isJoined
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                    }`}
                  >
                    {group.isJoined ? 'Joined' : 'Join'}
                  </button>
                </div>

                <p className="text-sm text-gray-600 mb-3">{group.description}</p>

                <div className="flex items-center text-xs text-gray-500 mb-3">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  {group.members} members
                </div>

                <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-600">
                  <span className="font-medium text-gray-700">Recent: </span>
                  {group.recentActivity}
                </div>

                {group.upcomingEvent && (
                  <div className="mt-3 bg-blue-50 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs font-medium text-blue-800">
                          Next Event
                        </div>
                        <div className="text-sm font-medium text-gray-900 mt-0.5">
                          {group.upcomingEvent.title}
                        </div>
                        <div className="text-xs text-gray-600 mt-0.5">
                          {formatDate(group.upcomingEvent.date)} at {formatTime(group.upcomingEvent.date)}
                        </div>
                      </div>
                      <div className="text-xs text-blue-600 font-medium">
                        {daysUntil(group.upcomingEvent.date)}d
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'events' && (
        <div className="space-y-4">
          {UPCOMING_EVENTS.map(event => {
            const days = daysUntil(event.date);
            const isRSVPd = rsvps[event.id];

            return (
              <div
                key={event.id}
                className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getEventTypeStyle(event.type)}`}>
                        {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                      </span>
                      {days <= 3 && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                          {days === 0 ? 'Today!' : days === 1 ? 'Tomorrow' : `In ${days} days`}
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold text-gray-900 text-lg">{event.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{event.description}</p>

                    <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {formatDate(event.date)} at {formatTime(event.date)}
                      </div>
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {event.location}
                      </div>
                    </div>
                  </div>

                  <div className="ml-4 flex flex-col items-end space-y-2">
                    <div className="text-center bg-gray-50 rounded-lg px-4 py-2">
                      <div className="text-2xl font-bold text-gray-900">
                        {new Date(event.date).getDate()}
                      </div>
                      <div className="text-xs text-gray-500 uppercase">
                        {new Date(event.date).toLocaleDateString('en-US', { month: 'short' })}
                      </div>
                    </div>
                    <button
                      onClick={() => handleRSVP(event.id)}
                      className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors w-full ${
                        isRSVPd
                          ? 'bg-green-600 text-white hover:bg-green-700'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      {isRSVPd ? "I'm Going" : 'RSVP'}
                    </button>
                    <span className="text-xs text-gray-500">
                      {event.attendees + (isRSVPd ? 1 : 0)} attending
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TownSquare;
