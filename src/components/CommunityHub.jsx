import React, { useState, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import DiscussionThread from './DiscussionThread';
import LocalEvents from './LocalEvents';
import CommunityPulse from './CommunityPulse';
import ActionGroups from './ActionGroups';

const CommunityHub = ({ legislation = [] }) => {
  const { userProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('pulse');
  const [showNewPost, setShowNewPost] = useState(false);
  const [newPostText, setNewPostText] = useState('');
  const [newPostBill, setNewPostBill] = useState('');
  const [discussions, setDiscussions] = useState(generateSeedDiscussions);

  const location = userProfile?.location || 'your area';

  const tabs = [
    { id: 'pulse', label: 'Community Pulse', icon: PulseIcon },
    { id: 'discuss', label: 'Discussions', icon: ChatIcon },
    { id: 'events', label: 'Local Events', icon: CalendarIcon },
    { id: 'groups', label: 'Action Groups', icon: GroupIcon },
  ];

  const handleNewPost = () => {
    if (!newPostText.trim()) return;
    const post = {
      id: `post-${Date.now()}`,
      author: userProfile?.name || 'Anonymous',
      authorLocation: location,
      text: newPostText,
      billRef: newPostBill || null,
      timestamp: new Date().toISOString(),
      upvotes: 0,
      replies: [],
      tags: [],
    };
    setDiscussions(prev => [post, ...prev]);
    setNewPostText('');
    setNewPostBill('');
    setShowNewPost(false);
  };

  const handleUpvote = (postId) => {
    setDiscussions(prev =>
      prev.map(d => d.id === postId ? { ...d, upvotes: d.upvotes + 1 } : d)
    );
  };

  const handleReply = (postId, replyText) => {
    setDiscussions(prev =>
      prev.map(d => {
        if (d.id !== postId) return d;
        return {
          ...d,
          replies: [...d.replies, {
            id: `reply-${Date.now()}`,
            author: userProfile?.name || 'Anonymous',
            text: replyText,
            timestamp: new Date().toISOString(),
          }],
        };
      })
    );
  };

  const billOptions = useMemo(() =>
    legislation.slice(0, 20).map(b => ({ id: b.id, title: b.title })),
    [legislation]
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Community Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-6">
        <h2 className="text-xl font-bold">Your Civic Community</h2>
        <p className="text-indigo-100 text-sm mt-1">
          Connect with neighbors in {location} who care about the same issues
        </p>
        <div className="mt-3 flex items-center space-x-4 text-sm">
          <span className="bg-white/20 rounded-full px-3 py-1">
            127 neighbors active this week
          </span>
          <span className="bg-white/20 rounded-full px-3 py-1">
            14 discussions
          </span>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200 px-4">
        <div className="flex space-x-1 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="px-4 py-4">
        {activeTab === 'pulse' && (
          <CommunityPulse location={location} legislation={legislation} />
        )}

        {activeTab === 'discuss' && (
          <div>
            {/* New Discussion Button */}
            <div className="mb-4">
              {!showNewPost ? (
                <button
                  onClick={() => setShowNewPost(true)}
                  className="w-full bg-white border-2 border-dashed border-gray-300 rounded-lg p-4 text-gray-500 hover:border-indigo-400 hover:text-indigo-600 transition-colors text-left"
                >
                  Start a discussion about legislation that matters to you...
                </button>
              ) : (
                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                  <textarea
                    value={newPostText}
                    onChange={e => setNewPostText(e.target.value)}
                    placeholder="What's on your mind? Share your perspective on local issues, ask questions, or organize around a cause..."
                    className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                    rows={3}
                    autoFocus
                  />
                  <div className="mt-3 flex items-center justify-between">
                    <select
                      value={newPostBill}
                      onChange={e => setNewPostBill(e.target.value)}
                      className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 text-gray-600 focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">Link to a bill (optional)</option>
                      {billOptions.map(b => (
                        <option key={b.id} value={b.id}>
                          {b.title.length > 50 ? b.title.slice(0, 50) + '...' : b.title}
                        </option>
                      ))}
                    </select>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => { setShowNewPost(false); setNewPostText(''); }}
                        className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleNewPost}
                        disabled={!newPostText.trim()}
                        className="px-4 py-1.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Post
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Discussion Threads */}
            <div className="space-y-3">
              {discussions.map(thread => (
                <DiscussionThread
                  key={thread.id}
                  thread={thread}
                  onUpvote={() => handleUpvote(thread.id)}
                  onReply={(text) => handleReply(thread.id, text)}
                  legislation={legislation}
                />
              ))}
            </div>
          </div>
        )}

        {activeTab === 'events' && (
          <LocalEvents location={location} />
        )}

        {activeTab === 'groups' && (
          <ActionGroups location={location} />
        )}
      </div>
    </div>
  );
};

function generateSeedDiscussions() {
  return [
    {
      id: 'seed-1',
      author: 'Maria G.',
      authorLocation: 'Downtown',
      text: "Has anyone looked into the infrastructure bill that just passed committee? I'm curious how the transit funding would actually be distributed to our area. The current bus routes barely cover the east side of town.",
      billRef: null,
      timestamp: new Date(Date.now() - 2 * 3600000).toISOString(),
      upvotes: 23,
      replies: [
        { id: 'r1', author: 'David K.', text: "I looked into it - there's a provision for expanding routes in underserved areas. I'm cautiously optimistic but want to see the specific allocation formula.", timestamp: new Date(Date.now() - 1.5 * 3600000).toISOString() },
        { id: 'r2', author: 'Sarah L.', text: "Our city council has a public comment session next Tuesday about exactly this. Would be great to show up in numbers.", timestamp: new Date(Date.now() - 1 * 3600000).toISOString() },
      ],
      tags: ['Transportation', 'Infrastructure'],
    },
    {
      id: 'seed-2',
      author: 'James T.',
      authorLocation: 'Westside',
      text: "I organized a voter registration drive at the community center last weekend - we helped 34 people register! If anyone wants to help with the next one, we're planning for May 10th. All volunteers welcome regardless of party affiliation.",
      billRef: null,
      timestamp: new Date(Date.now() - 8 * 3600000).toISOString(),
      upvotes: 56,
      replies: [
        { id: 'r3', author: 'Priya M.', text: "This is amazing! I'd love to help. Can we also set up a table at the farmer's market?", timestamp: new Date(Date.now() - 6 * 3600000).toISOString() },
        { id: 'r4', author: 'Carlos R.', text: 'Count me in. I can bring bilingual materials.', timestamp: new Date(Date.now() - 5 * 3600000).toISOString() },
        { id: 'r5', author: 'Aisha W.', text: 'I have experience with voter registration from my college days. Happy to train new volunteers!', timestamp: new Date(Date.now() - 3 * 3600000).toISOString() },
      ],
      tags: ['Voter Registration', 'Community Action'],
    },
    {
      id: 'seed-3',
      author: 'Linda P.',
      authorLocation: 'Northside',
      text: "Heads up everyone - the school board is voting on the new budget next week and they're considering cutting the after-school programs. These programs are a lifeline for working parents. Who's coming to the meeting to speak up?",
      billRef: null,
      timestamp: new Date(Date.now() - 24 * 3600000).toISOString(),
      upvotes: 41,
      replies: [
        { id: 'r6', author: 'Tom B.', text: "My kids depend on those programs. I'll be there. Should we organize carpools?", timestamp: new Date(Date.now() - 20 * 3600000).toISOString() },
        { id: 'r7', author: 'Kenji S.', text: "I put together a one-page fact sheet about the programs' impact. Happy to share with anyone who wants to use it in their testimony.", timestamp: new Date(Date.now() - 18 * 3600000).toISOString() },
      ],
      tags: ['Education', 'Local Budget'],
    },
    {
      id: 'seed-4',
      author: 'Roberto F.',
      authorLocation: 'Eastside',
      text: "Just attended the town hall on the proposed housing development at Oak & 5th. Mixed feelings - we definitely need more affordable units, but the current plan only has 15% set aside as affordable. Our neighborhood group is drafting a letter asking for 30%. Thoughts?",
      billRef: null,
      timestamp: new Date(Date.now() - 48 * 3600000).toISOString(),
      upvotes: 38,
      replies: [
        { id: 'r8', author: 'Nina C.', text: "30% seems fair given the tax incentives they're getting. I'd sign that letter.", timestamp: new Date(Date.now() - 44 * 3600000).toISOString() },
        { id: 'r9', author: 'Alex M.', text: 'As someone who works in housing policy - push for 25% with a community land trust component. More likely to get approved and creates permanent affordability.', timestamp: new Date(Date.now() - 40 * 3600000).toISOString() },
      ],
      tags: ['Housing', 'Development'],
    },
    {
      id: 'seed-5',
      author: 'Wei L.',
      authorLocation: 'Suburbs',
      text: "Does anyone know if the new healthcare expansion bill covers dental? I've been reading through it but the language is dense. Would be great to have a community explainer session.",
      billRef: null,
      timestamp: new Date(Date.now() - 72 * 3600000).toISOString(),
      upvotes: 19,
      replies: [
        { id: 'r10', author: 'Dr. Rachel K.', text: "I can help break it down - I'm a healthcare policy researcher. Short answer: limited dental coverage for adults under 150% FPL, full coverage for children. Happy to do a Q&A if there's interest.", timestamp: new Date(Date.now() - 68 * 3600000).toISOString() },
        { id: 'r11', author: 'Marcus J.', text: "I'd attend a Q&A for sure. Can we set something up at the library?", timestamp: new Date(Date.now() - 60 * 3600000).toISOString() },
      ],
      tags: ['Healthcare', 'Community Learning'],
    },
  ];
}

function PulseIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  );
}

function ChatIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  );
}

function CalendarIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}

function GroupIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  );
}

export default CommunityHub;
