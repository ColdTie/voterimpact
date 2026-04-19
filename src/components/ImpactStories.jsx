import React, { useState, useEffect } from 'react';

const STORAGE_KEY = 'voterimpact_impact_stories';

const sampleStories = [
  {
    id: 'story-1',
    author: 'Maria T.',
    location: 'Austin, TX',
    avatar: 'MT',
    billTitle: 'Affordable Housing Development Act',
    category: 'Housing',
    story: 'As a single mom renting in Austin, housing costs have pushed me to the edge. This bill would expand voucher programs — that could mean the difference between staying in our neighborhood near my daughter\'s school or being forced out. Real families need this.',
    reactions: { heart: 24, handshake: 12, lightbulb: 8 },
    timeAgo: '2 hours ago',
    replies: [
      { author: 'James K.', text: 'Same situation here in Denver. Rent went up 30% in two years.', timeAgo: '1 hour ago' }
    ]
  },
  {
    id: 'story-2',
    author: 'Robert J.',
    location: 'Rural Montana',
    avatar: 'RJ',
    billTitle: 'Veterans Healthcare Expansion Act',
    category: 'Veterans Affairs',
    story: 'I served two tours overseas and the nearest VA clinic is 3 hours away. This bill would fund telehealth expansion for rural vets. I know dozens of vets in my county alone who skip appointments because of the drive. This would literally save lives.',
    reactions: { heart: 67, handshake: 31, lightbulb: 15 },
    timeAgo: '5 hours ago',
    replies: [
      { author: 'Sarah M.', text: 'My father is a Vietnam vet in rural Oregon — same story. Thank you for sharing.', timeAgo: '4 hours ago' },
      { author: 'David L.', text: 'Telehealth changed everything for me after my local clinic closed. Every vet deserves access.', timeAgo: '3 hours ago' }
    ]
  },
  {
    id: 'story-3',
    author: 'Priya S.',
    location: 'Chicago, IL',
    avatar: 'PS',
    billTitle: 'Clean Energy Transition Act',
    category: 'Environment',
    story: 'My neighborhood has some of the worst air quality in the city because of nearby industrial plants. This clean energy bill includes environmental justice provisions that could reduce pollution in communities like mine. My kids deserve to play outside without worrying about asthma attacks.',
    reactions: { heart: 45, handshake: 22, lightbulb: 18 },
    timeAgo: '1 day ago',
    replies: []
  },
  {
    id: 'story-4',
    author: 'Carlos R.',
    location: 'Phoenix, AZ',
    avatar: 'CR',
    billTitle: 'Small Business Recovery Act',
    category: 'Economic',
    story: 'I run a small restaurant that barely survived the pandemic. The tax credits in this bill would let me hire back two employees and finally fix our kitchen equipment. Small businesses are the backbone of our communities — we just need a fair shot.',
    reactions: { heart: 38, handshake: 29, lightbulb: 11 },
    timeAgo: '1 day ago',
    replies: [
      { author: 'Linda W.', text: 'Small business owner here too. The payroll tax relief alone would be huge for us.', timeAgo: '20 hours ago' }
    ]
  }
];

const ImpactStories = ({ legislation, userProfile }) => {
  const [stories, setStories] = useState([]);
  const [showCompose, setShowCompose] = useState(false);
  const [newStory, setNewStory] = useState({ billTitle: '', story: '', category: 'Economic' });
  const [filterCategory, setFilterCategory] = useState('All');
  const [expandedStory, setExpandedStory] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [userReactions, setUserReactions] = useState({});

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
      if (stored && stored.length > 0) {
        setStories(stored);
      } else {
        setStories(sampleStories);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(sampleStories));
      }
    } catch {
      setStories(sampleStories);
    }
  }, []);

  const handleSubmitStory = () => {
    if (!newStory.story.trim() || !newStory.billTitle.trim()) return;

    const story = {
      id: `story-${Date.now()}`,
      author: userProfile?.name ? `${userProfile.name.split(' ')[0]} ${userProfile.name.split(' ').pop()?.charAt(0) || ''}.` : 'Anonymous',
      location: userProfile?.location || 'United States',
      avatar: userProfile?.name ? userProfile.name.split(' ').map(n => n.charAt(0)).join('').slice(0, 2).toUpperCase() : 'AN',
      billTitle: newStory.billTitle,
      category: newStory.category,
      story: newStory.story,
      reactions: { heart: 0, handshake: 0, lightbulb: 0 },
      timeAgo: 'Just now',
      replies: []
    };

    const updated = [story, ...stories];
    setStories(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setNewStory({ billTitle: '', story: '', category: 'Economic' });
    setShowCompose(false);
  };

  const handleReaction = (storyId, type) => {
    const key = `${storyId}-${type}`;
    const alreadyReacted = userReactions[key];

    const updated = stories.map(s => {
      if (s.id === storyId) {
        return {
          ...s,
          reactions: {
            ...s.reactions,
            [type]: s.reactions[type] + (alreadyReacted ? -1 : 1)
          }
        };
      }
      return s;
    });

    setStories(updated);
    setUserReactions(prev => ({ ...prev, [key]: !alreadyReacted }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const handleReply = (storyId) => {
    if (!replyText.trim()) return;

    const updated = stories.map(s => {
      if (s.id === storyId) {
        return {
          ...s,
          replies: [...s.replies, {
            author: userProfile?.name ? `${userProfile.name.split(' ')[0]} ${userProfile.name.split(' ').pop()?.charAt(0) || ''}.` : 'You',
            text: replyText,
            timeAgo: 'Just now'
          }]
        };
      }
      return s;
    });

    setStories(updated);
    setReplyText('');
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const categories = ['All', 'Economic', 'Healthcare', 'Housing', 'Veterans Affairs', 'Environment', 'Transportation', 'Social Issues'];
  const filteredStories = filterCategory === 'All' ? stories : stories.filter(s => s.category === filterCategory);

  const reactionIcons = {
    heart: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
      </svg>
    ),
    handshake: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" />
      </svg>
    ),
    lightbulb: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    )
  };

  const reactionLabels = { heart: 'Relate', handshake: 'Solidarity', lightbulb: 'Insightful' };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 text-white">
        <h3 className="text-xl font-bold mb-2">Share Your Story</h3>
        <p className="text-indigo-100 text-sm mb-4">
          How does legislation affect your daily life? Your story helps others understand the real human impact of policy decisions.
        </p>
        <button
          onClick={() => setShowCompose(!showCompose)}
          className="bg-white text-indigo-600 px-5 py-2.5 rounded-lg font-semibold text-sm hover:bg-indigo-50 transition-colors"
        >
          {showCompose ? 'Cancel' : 'Write Your Story'}
        </button>
      </div>

      {showCompose && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Which bill does this relate to?</label>
            <select
              value={newStory.billTitle}
              onChange={(e) => setNewStory(prev => ({ ...prev, billTitle: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Select a bill...</option>
              {legislation.map(bill => (
                <option key={bill.id} value={bill.title}>{bill.title}</option>
              ))}
              <option value="Other">Other / General</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={newStory.category}
              onChange={(e) => setNewStory(prev => ({ ...prev, category: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              {categories.filter(c => c !== 'All').map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Your Story</label>
            <textarea
              value={newStory.story}
              onChange={(e) => setNewStory(prev => ({ ...prev, story: e.target.value }))}
              placeholder="Tell your community how this bill affects your life..."
              rows={4}
              maxLength={1000}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
            />
            <div className="text-xs text-gray-400 text-right mt-1">{newStory.story.length}/1000</div>
          </div>
          <button
            onClick={handleSubmitStory}
            disabled={!newStory.story.trim() || !newStory.billTitle}
            className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-semibold text-sm hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Share Your Story
          </button>
        </div>
      )}

      <div className="flex space-x-2 overflow-x-auto pb-1">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              filterCategory === cat
                ? 'bg-indigo-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filteredStories.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <svg className="mx-auto h-12 w-12 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
            <p>No stories in this category yet. Be the first to share!</p>
          </div>
        ) : (
          filteredStories.map(story => (
            <div key={story.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="p-5">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold text-sm flex-shrink-0">
                    {story.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900 text-sm">{story.author}</span>
                      <span className="text-xs text-gray-400">{story.location}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        story.category === 'Economic' ? 'bg-green-100 text-green-700' :
                        story.category === 'Healthcare' ? 'bg-pink-100 text-pink-700' :
                        story.category === 'Housing' ? 'bg-yellow-100 text-yellow-700' :
                        story.category === 'Veterans Affairs' ? 'bg-blue-100 text-blue-700' :
                        story.category === 'Environment' ? 'bg-teal-100 text-teal-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {story.category}
                      </span>
                      <span className="text-xs text-gray-400">{story.timeAgo}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg px-3 py-2 mb-3">
                  <span className="text-xs text-gray-500">Re: </span>
                  <span className="text-sm font-medium text-gray-800">{story.billTitle}</span>
                </div>

                <p className="text-gray-700 text-sm leading-relaxed">{story.story}</p>

                <div className="flex items-center gap-3 mt-4 pt-3 border-t border-gray-100">
                  {Object.entries(reactionIcons).map(([type, icon]) => {
                    const reacted = userReactions[`${story.id}-${type}`];
                    return (
                      <button
                        key={type}
                        onClick={() => handleReaction(story.id, type)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                          reacted
                            ? 'bg-indigo-100 text-indigo-700'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {icon}
                        <span>{story.reactions[type]}</span>
                        <span className="hidden sm:inline">{reactionLabels[type]}</span>
                      </button>
                    );
                  })}
                  <button
                    onClick={() => setExpandedStory(expandedStory === story.id ? null : story.id)}
                    className="ml-auto flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    {story.replies.length > 0 ? `${story.replies.length} replies` : 'Reply'}
                  </button>
                </div>
              </div>

              {expandedStory === story.id && (
                <div className="border-t border-gray-100 bg-gray-50 px-5 py-4 space-y-3">
                  {story.replies.map((reply, i) => (
                    <div key={i} className="flex gap-2">
                      <div className="w-7 h-7 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-bold text-xs flex-shrink-0">
                        {reply.author.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-800">{reply.author}</span>
                          <span className="text-xs text-gray-400">{reply.timeAgo}</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-0.5">{reply.text}</p>
                      </div>
                    </div>
                  ))}
                  <div className="flex gap-2 pt-2">
                    <input
                      type="text"
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleReply(story.id)}
                      placeholder="Add a reply..."
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    <button
                      onClick={() => handleReply(story.id)}
                      disabled={!replyText.trim()}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                    >
                      Reply
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ImpactStories;
