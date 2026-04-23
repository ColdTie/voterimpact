import React, { useState } from 'react';
import { communityEvents, actionCampaigns, communityPulse, discussionGroups } from '../data/communityData';

const CommunityHub = ({ userProfile }) => {
  const [activeSection, setActiveSection] = useState('pulse');
  const [rsvpedEvents, setRsvpedEvents] = useState(new Set());
  const [supportedCampaigns, setSupportedCampaigns] = useState(new Set());
  const [joinedGroups, setJoinedGroups] = useState(new Set());

  const sections = [
    { id: 'pulse', label: 'Community Pulse' },
    { id: 'events', label: 'Events' },
    { id: 'campaigns', label: 'Campaigns' },
    { id: 'groups', label: 'Groups' },
  ];

  const toggleRsvp = (eventId) => {
    setRsvpedEvents(prev => {
      const next = new Set(prev);
      if (next.has(eventId)) next.delete(eventId);
      else next.add(eventId);
      return next;
    });
  };

  const toggleSupport = (campaignId) => {
    setSupportedCampaigns(prev => {
      const next = new Set(prev);
      if (next.has(campaignId)) next.delete(campaignId);
      else next.add(campaignId);
      return next;
    });
  };

  const toggleJoin = (groupId) => {
    setJoinedGroups(prev => {
      const next = new Set(prev);
      if (next.has(groupId)) next.delete(groupId);
      else next.add(groupId);
      return next;
    });
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Housing': 'bg-orange-100 text-orange-800',
      'Economic': 'bg-green-100 text-green-800',
      'Healthcare': 'bg-red-100 text-red-800',
      'Environment': 'bg-emerald-100 text-emerald-800',
      'Transportation': 'bg-blue-100 text-blue-800',
      'Veterans Affairs': 'bg-purple-100 text-purple-800',
      'Social Issues': 'bg-yellow-100 text-yellow-800',
      'Civic Engagement': 'bg-indigo-100 text-indigo-800',
      'Education': 'bg-pink-100 text-pink-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const relevantEvents = communityEvents.filter(evt => {
    if (!userProfile) return true;
    if (userProfile.is_veteran && evt.category === 'Veterans Affairs') return true;
    if (userProfile.political_interests) {
      const interests = userProfile.political_interests.toLowerCase();
      if (interests.includes(evt.category.toLowerCase())) return true;
    }
    return true;
  });

  const sortedEvents = [...relevantEvents].sort((a, b) => {
    const aRelevant = userProfile?.is_veteran && a.category === 'Veterans Affairs' ? 1 : 0;
    const bRelevant = userProfile?.is_veteran && b.category === 'Veterans Affairs' ? 1 : 0;
    if (bRelevant !== aRelevant) return bRelevant - aRelevant;
    return new Date(a.date) - new Date(b.date);
  });

  return (
    <div className="pb-6">
      {/* Section tabs */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex space-x-1 overflow-x-auto scrollbar-hide">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                activeSection === section.id
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {section.label}
            </button>
          ))}
        </div>
      </div>

      {/* Community Pulse */}
      {activeSection === 'pulse' && (
        <div className="px-4 pt-4 space-y-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">What Your Community Cares About</h3>
            <p className="text-sm text-gray-500 mb-5">
              Based on activity from {communityPulse.reduce((sum, p) => sum + p.neighbors, 0).toLocaleString()} neighbors in your area
            </p>

            <div className="space-y-4">
              {communityPulse.map((item) => (
                <div key={item.issue}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-medium text-gray-800">{item.issue}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-500">{item.neighbors.toLocaleString()} neighbors</span>
                      {item.trend === 'up' && (
                        <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                        </svg>
                      )}
                      {item.trend === 'down' && (
                        <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                        </svg>
                      )}
                      {item.trend === 'stable' && (
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2.5">
                    <div
                      className="bg-indigo-500 h-2.5 rounded-full transition-all duration-500"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl border border-indigo-100 p-5">
            <h3 className="text-base font-semibold text-indigo-900 mb-2">Your Voice Matters</h3>
            <p className="text-sm text-indigo-700 mb-4">
              When neighbors speak up together, local officials listen. Join events, support campaigns, and connect with groups below to amplify your impact.
            </p>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-white rounded-lg p-3 shadow-sm">
                <div className="text-2xl font-bold text-indigo-600">{communityEvents.length}</div>
                <div className="text-xs text-gray-600 mt-1">Upcoming Events</div>
              </div>
              <div className="bg-white rounded-lg p-3 shadow-sm">
                <div className="text-2xl font-bold text-indigo-600">{actionCampaigns.length}</div>
                <div className="text-xs text-gray-600 mt-1">Active Campaigns</div>
              </div>
              <div className="bg-white rounded-lg p-3 shadow-sm">
                <div className="text-2xl font-bold text-indigo-600">{discussionGroups.length}</div>
                <div className="text-xs text-gray-600 mt-1">Groups to Join</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Events */}
      {activeSection === 'events' && (
        <div className="px-4 pt-4 space-y-3">
          {sortedEvents.map((event) => {
            const isRsvped = rsvpedEvents.has(event.id);
            const fillPercent = Math.round((event.attendees / event.capacity) * 100);
            return (
              <div key={event.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(event.category)}`}>
                        {event.category}
                      </span>
                      {event.isVirtual && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                          Virtual
                        </span>
                      )}
                    </div>
                    <h4 className="text-base font-semibold text-gray-900">{event.title}</h4>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-3">{event.description}</p>
                <div className="flex items-center space-x-4 text-xs text-gray-500 mb-3">
                  <div className="flex items-center space-x-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>{formatDate(event.date)}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{event.time}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>{event.location}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-100 rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full ${fillPercent > 80 ? 'bg-orange-500' : 'bg-green-500'}`}
                        style={{ width: `${fillPercent}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500">
                      {event.attendees + (isRsvped ? 1 : 0)}/{event.capacity} going
                    </span>
                  </div>
                  <button
                    onClick={() => toggleRsvp(event.id)}
                    className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      isRsvped
                        ? 'bg-green-100 text-green-800 border border-green-300'
                        : 'bg-indigo-600 text-white hover:bg-indigo-700'
                    }`}
                  >
                    {isRsvped ? 'Going' : 'RSVP'}
                  </button>
                </div>
                <div className="mt-2 text-xs text-gray-400">Organized by {event.organizer}</div>
              </div>
            );
          })}
        </div>
      )}

      {/* Campaigns */}
      {activeSection === 'campaigns' && (
        <div className="px-4 pt-4 space-y-4">
          {actionCampaigns.map((campaign) => {
            const isSupported = supportedCampaigns.has(campaign.id);
            const currentSupporters = campaign.supporters + (isSupported ? 1 : 0);
            const progress = Math.round((currentSupporters / campaign.goal) * 100);
            return (
              <div key={campaign.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-5">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(campaign.category)}`}>
                      {campaign.category}
                    </span>
                    <span className="text-xs text-gray-500">{campaign.daysLeft} days left</span>
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-1">{campaign.title}</h4>
                  <p className="text-sm text-gray-600 mb-4">{campaign.description}</p>

                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">
                        {currentSupporters.toLocaleString()} supporters
                      </span>
                      <span className="text-sm text-gray-500">Goal: {campaign.goal.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-3">
                      <div
                        className="bg-indigo-500 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      />
                    </div>
                    <div className="text-right mt-1">
                      <span className="text-xs font-medium text-indigo-600">{progress}%</span>
                    </div>
                  </div>

                  <button
                    onClick={() => toggleSupport(campaign.id)}
                    className={`w-full py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                      isSupported
                        ? 'bg-green-100 text-green-800 border border-green-300'
                        : 'bg-indigo-600 text-white hover:bg-indigo-700'
                    }`}
                  >
                    {isSupported ? 'You Signed On' : 'Add Your Name'}
                  </button>
                </div>

                {campaign.updates.length > 0 && (
                  <div className="bg-gray-50 border-t border-gray-100 px-5 py-3">
                    <h5 className="text-xs font-semibold text-gray-500 uppercase mb-2">Latest Updates</h5>
                    {campaign.updates.slice(0, 2).map((update, i) => (
                      <div key={i} className="flex items-start space-x-2 mb-1.5 last:mb-0">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 flex-shrink-0" />
                        <div>
                          <span className="text-xs text-gray-500">{formatDate(update.date)}: </span>
                          <span className="text-xs text-gray-700">{update.text}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="px-5 py-2 border-t border-gray-100 text-xs text-gray-400">
                  Organized by {campaign.organizer}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Discussion Groups */}
      {activeSection === 'groups' && (
        <div className="px-4 pt-4 space-y-3">
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100 p-4 mb-1">
            <p className="text-sm text-indigo-800">
              Groups connect you with neighbors who share your concerns. Join the conversation, share resources, and organize together.
            </p>
          </div>

          {discussionGroups.map((group) => {
            const isJoined = joinedGroups.has(group.id);
            return (
              <div key={group.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="text-base font-semibold text-gray-900">{group.name}</h4>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(group.category)}`}>
                        {group.category}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{group.description}</p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <div className="flex items-center space-x-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <span>{group.members + (isJoined ? 1 : 0)} members</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 rounded-full bg-green-400" />
                        <span>{group.recentActivity}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleJoin(group.id)}
                    className={`ml-3 px-4 py-1.5 rounded-lg text-sm font-medium transition-colors flex-shrink-0 ${
                      isJoined
                        ? 'bg-green-100 text-green-800 border border-green-300'
                        : 'bg-indigo-600 text-white hover:bg-indigo-700'
                    }`}
                  >
                    {isJoined ? 'Joined' : 'Join'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CommunityHub;
