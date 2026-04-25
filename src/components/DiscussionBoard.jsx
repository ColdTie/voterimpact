import React, { useState } from 'react';

const SAMPLE_DISCUSSIONS = [
  {
    id: 'disc-1',
    title: 'How will the Infrastructure Act affect our commute?',
    author: { name: 'Maria G.', location: 'Portland, OR', avatar: 'M' },
    category: 'Infrastructure',
    createdAt: '2026-04-23T14:30:00Z',
    content: "I've been reading about the new infrastructure bill and wondering how it'll impact our daily commute. The proposed light rail extension could cut my travel time in half, but I'm worried about the construction disruption. Anyone else in the Portland metro area have thoughts?",
    replies: [
      {
        id: 'r-1',
        author: { name: 'James T.', location: 'Beaverton, OR', avatar: 'J' },
        content: "I'm cautiously optimistic. The construction will be rough for 2-3 years, but the long-term benefit is huge. I drive 45 minutes each way - if the light rail extension goes through, I could cut that to 20 minutes.",
        createdAt: '2026-04-23T15:45:00Z',
        likes: 12,
      },
      {
        id: 'r-2',
        author: { name: 'Aisha K.', location: 'Gresham, OR', avatar: 'A' },
        content: "For those of us in Gresham, this is a game-changer. We've been underserved by public transit for years. My kids have to take two buses to get to their school activities.",
        createdAt: '2026-04-23T16:20:00Z',
        likes: 24,
      },
      {
        id: 'r-3',
        author: { name: 'David L.', location: 'Portland, OR', avatar: 'D' },
        content: "I actually attended the city council meeting about this last week. They're planning to phase construction so major routes stay open. I can share the meeting notes if anyone's interested.",
        createdAt: '2026-04-24T09:10:00Z',
        likes: 31,
      },
    ],
    likes: 47,
    pinned: true,
  },
  {
    id: 'disc-2',
    title: 'School funding measure - what parents need to know',
    author: { name: 'Sarah W.', location: 'Austin, TX', avatar: 'S' },
    category: 'Education',
    createdAt: '2026-04-22T10:00:00Z',
    content: "As a parent of two kids in AISD, I wanted to break down what the proposed school funding measure actually means for our families. The 0.5% property tax increase would fund new STEM programs, hire 200 more teachers, and upgrade playground equipment across 45 schools. For a median home value of $450K, that's about $187/month more.",
    replies: [
      {
        id: 'r-4',
        author: { name: 'Carlos R.', location: 'Austin, TX', avatar: 'C' },
        content: "Thanks for breaking this down, Sarah. As a renter, I'm wondering if this will increase my rent too. Does anyone know how landlords typically handle property tax increases?",
        createdAt: '2026-04-22T11:30:00Z',
        likes: 18,
      },
    ],
    likes: 35,
    pinned: false,
  },
  {
    id: 'disc-3',
    title: 'Organizing a neighborhood clean energy co-op',
    author: { name: 'Lin C.', location: 'Denver, CO', avatar: 'L' },
    category: 'Environment',
    createdAt: '2026-04-21T08:15:00Z',
    content: "With the Clean Energy Transition Act incentives, several of us on the west side are exploring a neighborhood solar co-op. By pooling together, we can get bulk pricing on solar panels and share the excess energy credits. If 20 households join, we each save about 40% on installation costs. Who's interested?",
    replies: [
      {
        id: 'r-5',
        author: { name: 'Pat M.', location: 'Denver, CO', avatar: 'P' },
        content: "Count me in! I've been wanting to go solar but the upfront cost has been prohibitive. A co-op model makes so much more sense.",
        createdAt: '2026-04-21T09:00:00Z',
        likes: 15,
      },
      {
        id: 'r-6',
        author: { name: 'Nina S.', location: 'Lakewood, CO', avatar: 'N' },
        content: "I run a small solar installation business and would love to give your group a group rate. DM me if you want to set up an info session!",
        createdAt: '2026-04-21T10:30:00Z',
        likes: 22,
      },
    ],
    likes: 56,
    pinned: false,
  },
  {
    id: 'disc-4',
    title: 'Veterans: have you used the new healthcare provisions?',
    author: { name: 'Mike D.', location: 'San Antonio, TX', avatar: 'M' },
    category: 'Healthcare',
    createdAt: '2026-04-20T16:45:00Z',
    content: "Fellow vets - the expanded VA healthcare provisions went into effect last month. I finally got approved for mental health services that were previously denied. The process took about 2 weeks. Happy to walk anyone through the application if you're struggling with the paperwork.",
    replies: [
      {
        id: 'r-7',
        author: { name: 'Tom B.', location: 'Houston, TX', avatar: 'T' },
        content: "Mike, thank you for sharing this. I had no idea these changes went through. I've been putting off reapplying after getting denied twice. Your offer to help means a lot.",
        createdAt: '2026-04-20T17:30:00Z',
        likes: 34,
      },
    ],
    likes: 89,
    pinned: true,
  },
];

const timeAgo = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours < 1) return 'just now';
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return `${Math.floor(days / 7)}w ago`;
};

const DiscussionBoard = ({ userName }) => {
  const [discussions, setDiscussions] = useState(SAMPLE_DISCUSSIONS);
  const [expandedId, setExpandedId] = useState(null);
  const [newReply, setNewReply] = useState('');
  const [showNewThread, setShowNewThread] = useState(false);
  const [newThread, setNewThread] = useState({ title: '', content: '', category: 'General' });
  const [sortBy, setSortBy] = useState('recent');

  const handleLike = (discussionId, replyId = null) => {
    setDiscussions(prev =>
      prev.map(d => {
        if (d.id !== discussionId) return d;
        if (!replyId) return { ...d, likes: d.likes + 1 };
        return {
          ...d,
          replies: d.replies.map(r =>
            r.id === replyId ? { ...r, likes: r.likes + 1 } : r
          ),
        };
      })
    );
  };

  const handleReply = (discussionId) => {
    if (!newReply.trim()) return;
    setDiscussions(prev =>
      prev.map(d => {
        if (d.id !== discussionId) return d;
        return {
          ...d,
          replies: [
            ...d.replies,
            {
              id: `r-new-${Date.now()}`,
              author: { name: userName || 'You', location: 'Your Location', avatar: (userName || 'Y')[0] },
              content: newReply,
              createdAt: new Date().toISOString(),
              likes: 0,
            },
          ],
        };
      })
    );
    setNewReply('');
  };

  const handleNewThread = () => {
    if (!newThread.title.trim() || !newThread.content.trim()) return;
    const thread = {
      id: `disc-new-${Date.now()}`,
      title: newThread.title,
      author: { name: userName || 'You', location: 'Your Location', avatar: (userName || 'Y')[0] },
      category: newThread.category,
      createdAt: new Date().toISOString(),
      content: newThread.content,
      replies: [],
      likes: 0,
      pinned: false,
    };
    setDiscussions(prev => [thread, ...prev]);
    setNewThread({ title: '', content: '', category: 'General' });
    setShowNewThread(false);
    setExpandedId(thread.id);
  };

  const sorted = [...discussions].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    if (sortBy === 'recent') return new Date(b.createdAt) - new Date(a.createdAt);
    if (sortBy === 'popular') return b.likes - a.likes;
    if (sortBy === 'active') return b.replies.length - a.replies.length;
    return 0;
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Discussions</h2>
          <p className="text-sm text-gray-600 mt-1">
            Talk about the issues that matter with people near you
          </p>
        </div>
        <button
          onClick={() => setShowNewThread(true)}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          Start Discussion
        </button>
      </div>

      {showNewThread && (
        <div className="bg-white border border-blue-200 rounded-xl p-5 mb-6">
          <h3 className="font-semibold text-gray-900 mb-3">Start a New Discussion</h3>
          <input
            type="text"
            placeholder="What do you want to discuss?"
            value={newThread.title}
            onChange={(e) => setNewThread(prev => ({ ...prev, title: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm mb-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <div className="flex space-x-3 mb-3">
            <select
              value={newThread.category}
              onChange={(e) => setNewThread(prev => ({ ...prev, category: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option>General</option>
              <option>Infrastructure</option>
              <option>Education</option>
              <option>Healthcare</option>
              <option>Environment</option>
              <option>Housing</option>
              <option>Economy</option>
            </select>
          </div>
          <textarea
            placeholder="Share your thoughts, questions, or experiences..."
            value={newThread.content}
            onChange={(e) => setNewThread(prev => ({ ...prev, content: e.target.value }))}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm mb-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => setShowNewThread(false)}
              className="px-4 py-2 text-gray-600 text-sm font-medium hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              onClick={handleNewThread}
              disabled={!newThread.title.trim() || !newThread.content.trim()}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Post Discussion
            </button>
          </div>
        </div>
      )}

      <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 mb-4 w-fit">
        {[
          { key: 'recent', label: 'Recent' },
          { key: 'popular', label: 'Most Liked' },
          { key: 'active', label: 'Most Active' },
        ].map(opt => (
          <button
            key={opt.key}
            onClick={() => setSortBy(opt.key)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              sortBy === opt.key
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {sorted.map(discussion => {
          const isExpanded = expandedId === discussion.id;
          return (
            <div
              key={discussion.id}
              className={`bg-white border rounded-xl overflow-hidden transition-shadow ${
                discussion.pinned ? 'border-blue-200' : 'border-gray-200'
              } ${isExpanded ? 'shadow-md' : 'hover:shadow-sm'}`}
            >
              <div
                className="p-5 cursor-pointer"
                onClick={() => setExpandedId(isExpanded ? null : discussion.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      {discussion.pinned && (
                        <span className="text-xs text-blue-600 font-medium bg-blue-50 px-2 py-0.5 rounded">
                          Pinned
                        </span>
                      )}
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                        {discussion.category}
                      </span>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1">{discussion.title}</h3>
                    <div className="flex items-center space-x-3 text-xs text-gray-500">
                      <div className="flex items-center">
                        <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold mr-1">
                          {discussion.author.avatar}
                        </div>
                        <span>{discussion.author.name}</span>
                      </div>
                      <span>{discussion.author.location}</span>
                      <span>{timeAgo(discussion.createdAt)}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 ml-4 text-sm text-gray-500">
                    <span className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      {discussion.likes}
                    </span>
                    <span className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      {discussion.replies.length}
                    </span>
                    <svg
                      className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {isExpanded && (
                <div className="border-t border-gray-100">
                  <div className="p-5 bg-gray-50">
                    <p className="text-sm text-gray-700 leading-relaxed">{discussion.content}</p>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleLike(discussion.id); }}
                      className="mt-3 flex items-center text-xs text-gray-500 hover:text-red-500 transition-colors"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      Like
                    </button>
                  </div>

                  {discussion.replies.length > 0 && (
                    <div className="divide-y divide-gray-100">
                      {discussion.replies.map(reply => (
                        <div key={reply.id} className="p-5 pl-10">
                          <div className="flex items-start">
                            <div className="w-7 h-7 bg-gray-400 rounded-full flex items-center justify-center text-white text-xs font-bold mr-3 flex-shrink-0">
                              {reply.author.avatar}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <span className="text-sm font-medium text-gray-900">{reply.author.name}</span>
                                <span className="text-xs text-gray-500">{reply.author.location}</span>
                                <span className="text-xs text-gray-400">{timeAgo(reply.createdAt)}</span>
                              </div>
                              <p className="text-sm text-gray-700">{reply.content}</p>
                              <button
                                onClick={() => handleLike(discussion.id, reply.id)}
                                className="mt-2 flex items-center text-xs text-gray-500 hover:text-red-500 transition-colors"
                              >
                                <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                                {reply.likes}
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="p-5 bg-gray-50 border-t border-gray-100">
                    <div className="flex space-x-3">
                      <div className="w-7 h-7 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {(userName || 'Y')[0]}
                      </div>
                      <div className="flex-1 flex space-x-2">
                        <input
                          type="text"
                          placeholder="Add your thoughts..."
                          value={expandedId === discussion.id ? newReply : ''}
                          onChange={(e) => setNewReply(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleReply(discussion.id)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <button
                          onClick={() => handleReply(discussion.id)}
                          disabled={!newReply.trim()}
                          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          Reply
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DiscussionBoard;
