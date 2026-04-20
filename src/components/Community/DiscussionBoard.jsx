import React, { useState } from 'react';

const DiscussionBoard = ({ userProfile }) => {
  const [activeTab, setActiveTab] = useState('trending');
  const [expandedThread, setExpandedThread] = useState(null);
  const [replyText, setReplyText] = useState('');

  const discussions = {
    trending: [
      {
        id: 1,
        title: 'New affordable housing proposal — what do you think?',
        author: 'Elena M.',
        authorInitials: 'EM',
        authorColor: 'bg-pink-500',
        timeAgo: '2 hours ago',
        replies: 23,
        participants: 14,
        preview: 'The city council just proposed converting the old warehouse district into mixed-income housing. This could add 400+ units but some neighbors worry about parking and density.',
        tags: ['Housing', 'Local'],
        pinned: false,
        thread: [
          { author: 'Carlos D.', initials: 'CD', color: 'bg-blue-500', text: 'I live near the warehouse district. We desperately need more housing, but they need to include adequate parking. The streets are already packed.', timeAgo: '1 hour ago', likes: 8 },
          { author: 'Priya S.', initials: 'PS', color: 'bg-green-500', text: 'Mixed-income is the right approach. Pure luxury or pure affordable both create problems. Has anyone seen the actual density numbers?', timeAgo: '45 min ago', likes: 12 },
          { author: 'Tom W.', initials: 'TW', color: 'bg-orange-500', text: 'I went to the public comment session last week. They\'re planning 30% affordable units. The developer also committed to a community garden on the ground level.', timeAgo: '20 min ago', likes: 15 },
        ],
      },
      {
        id: 2,
        title: 'Bus route 47 is being cut — here\'s how to push back',
        author: 'Marcus J.',
        authorInitials: 'MJ',
        authorColor: 'bg-indigo-500',
        timeAgo: '5 hours ago',
        replies: 41,
        participants: 28,
        preview: 'Route 47 serves three schools and the senior center. The transit authority says ridership is low but they only count weekday mornings. Evening and weekend riders are being ignored.',
        tags: ['Transportation', 'Local'],
        pinned: false,
        thread: [
          { author: 'Linda F.', initials: 'LF', color: 'bg-teal-500', text: 'My mother takes this bus to her doctor appointments. Cutting it would be devastating for seniors in our area. I\'m writing to the transit board.', timeAgo: '4 hours ago', likes: 22 },
          { author: 'Alex P.', initials: 'AP', color: 'bg-rose-500', text: 'I compiled ridership data from the transit authority\'s own reports. Evening ridership on route 47 is actually HIGHER than routes 31 and 38, which aren\'t being cut. Something doesn\'t add up.', timeAgo: '3 hours ago', likes: 34 },
        ],
      },
      {
        id: 3,
        title: 'School board meeting recap: budget priorities for next year',
        author: 'Rachel K.',
        authorInitials: 'RK',
        authorColor: 'bg-purple-500',
        timeAgo: '1 day ago',
        replies: 17,
        participants: 11,
        preview: 'I attended last night\'s meeting and took notes. Key takeaway: they\'re proposing a 3% increase in per-student spending but cutting arts programs. Here\'s the full breakdown.',
        tags: ['Education', 'Local'],
        pinned: false,
        thread: [
          { author: 'Mike L.', initials: 'ML', color: 'bg-amber-600', text: 'Thanks for the notes Rachel. Cutting arts to fund... what exactly? My kids\' school already lost their music teacher last year.', timeAgo: '20 hours ago', likes: 9 },
        ],
      },
    ],
    recent: [
      {
        id: 4,
        title: 'Anyone attending the town hall on Saturday?',
        author: 'Kevin B.',
        authorInitials: 'KB',
        authorColor: 'bg-cyan-500',
        timeAgo: '30 min ago',
        replies: 5,
        participants: 4,
        preview: 'The mayor is doing a Q&A session at the community center this Saturday at 10am. I\'m planning to ask about the road repair timeline. Anyone want to coordinate questions?',
        tags: ['Local', 'Events'],
        pinned: false,
        thread: [],
      },
      {
        id: 5,
        title: 'Understanding the new state tax credit — is anyone eligible?',
        author: 'Nina G.',
        authorInitials: 'NG',
        authorColor: 'bg-emerald-500',
        timeAgo: '1 hour ago',
        replies: 8,
        participants: 6,
        preview: 'The state just passed a new energy efficiency tax credit. If you installed solar, heat pumps, or insulation in the last 2 years, you might qualify for up to $2,500 back.',
        tags: ['Economic', 'State'],
        pinned: false,
        thread: [],
      },
    ],
  };

  const activeDiscussions = discussions[activeTab] || discussions.trending;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-lg font-semibold text-gray-900">Discussions</h3>
        <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
          Start a Thread
        </button>
      </div>
      <p className="text-sm text-gray-500 mb-4">
        Real conversations between your neighbors about real issues
      </p>

      <div className="flex space-x-1 mb-5 bg-gray-100 rounded-lg p-1">
        {[
          { key: 'trending', label: 'Trending' },
          { key: 'recent', label: 'Recent' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${
              activeTab === tab.key
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {activeDiscussions.map((discussion) => {
          const isExpanded = expandedThread === discussion.id;

          return (
            <div
              key={discussion.id}
              className="border border-gray-100 rounded-lg hover:border-gray-200 transition-all"
            >
              <button
                onClick={() => setExpandedThread(isExpanded ? null : discussion.id)}
                className="w-full p-4 text-left"
              >
                <div className="flex items-start space-x-3">
                  <div className={`w-8 h-8 ${discussion.authorColor} rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5`}>
                    {discussion.authorInitials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-gray-900 leading-snug">
                      {discussion.title}
                    </h4>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-xs text-gray-500">{discussion.author}</span>
                      <span className="text-xs text-gray-300">·</span>
                      <span className="text-xs text-gray-500">{discussion.timeAgo}</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">{discussion.preview}</p>
                    <div className="flex items-center space-x-3 mt-2.5">
                      <div className="flex flex-wrap gap-1.5">
                        {discussion.tags.map((tag) => (
                          <span key={tag} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded font-medium">
                            {tag}
                          </span>
                        ))}
                      </div>
                      <span className="text-xs text-gray-400">
                        {discussion.replies} replies · {discussion.participants} people
                      </span>
                    </div>
                  </div>
                </div>
              </button>

              {isExpanded && (
                <div className="border-t border-gray-100 px-4 pb-4">
                  {discussion.thread.length > 0 ? (
                    <div className="mt-3 space-y-3">
                      {discussion.thread.map((reply, idx) => (
                        <div key={idx} className="flex items-start space-x-2.5 pl-2">
                          <div className={`w-6 h-6 ${reply.color} rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0 mt-0.5`}>
                            {reply.initials}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <span className="text-xs font-semibold text-gray-800">{reply.author}</span>
                              <span className="text-xs text-gray-400">{reply.timeAgo}</span>
                            </div>
                            <p className="text-sm text-gray-700 mt-0.5">{reply.text}</p>
                            <div className="flex items-center space-x-3 mt-1.5">
                              <button className="text-xs text-gray-400 hover:text-blue-600 flex items-center space-x-1">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                                </svg>
                                <span>{reply.likes}</span>
                              </button>
                              <button className="text-xs text-gray-400 hover:text-blue-600">Reply</button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400 mt-3 text-center py-2">No replies yet. Be the first to respond.</p>
                  )}

                  <div className="mt-4 flex items-center space-x-2">
                    <div className="w-7 h-7 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {userProfile?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1 flex space-x-2">
                      <input
                        type="text"
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Share your perspective..."
                        className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <button
                        disabled={!replyText.trim()}
                        className="px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      >
                        Reply
                      </button>
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
