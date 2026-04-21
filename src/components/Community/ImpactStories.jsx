import React, { useState } from 'react';

const SAMPLE_STORIES = [
  {
    id: 1,
    author: 'Maria G.',
    location: 'Austin, TX',
    timeAgo: '2 hours ago',
    category: 'Healthcare',
    title: 'ACA expansion saved my family',
    body: 'When my husband lost his job last year, we thought we\'d lose our health coverage too. The ACA expansion in our state meant we qualified for subsidized insurance. Our daughter\'s asthma medication went from $400/month to $35. Legislation like this isn\'t abstract — it\'s the difference between breathing easy and choosing between medicine and groceries.',
    reactions: { heart: 47, lightbulb: 12, handshake: 8 },
    replies: 6,
  },
  {
    id: 2,
    author: 'James T.',
    location: 'Detroit, MI',
    timeAgo: '5 hours ago',
    category: 'Veterans Affairs',
    title: 'PACT Act finally got me the care I needed',
    body: 'After 8 years of being told my respiratory issues weren\'t service-connected, the PACT Act changed everything. I got my VA claim approved in 3 months. To every veteran still fighting the system: don\'t give up. And to everyone else — this is why your vote matters.',
    reactions: { heart: 89, lightbulb: 23, handshake: 34 },
    replies: 14,
  },
  {
    id: 3,
    author: 'Priya K.',
    location: 'Portland, OR',
    timeAgo: '1 day ago',
    category: 'Housing',
    title: 'Rent stabilization gave us roots',
    body: 'My family moved 4 times in 3 years because landlords kept hiking rent. When our city passed rent stabilization, we finally stayed put. My kids are in the same school for two years running. Community starts with stability.',
    reactions: { heart: 62, lightbulb: 18, handshake: 27 },
    replies: 9,
  },
  {
    id: 4,
    author: 'David L.',
    location: 'Rural Iowa',
    timeAgo: '2 days ago',
    category: 'Infrastructure',
    title: 'Broadband funding connected our town',
    body: 'Our town of 800 people finally got high-speed internet through the infrastructure bill. My daughter can do homework without driving to the library. Three small businesses opened remote offices here. One bill literally put us on the map.',
    reactions: { heart: 104, lightbulb: 31, handshake: 19 },
    replies: 11,
  },
];

const REACTION_ICONS = {
  heart: { icon: '❤️', label: 'Moved me' },
  lightbulb: { icon: '💡', label: 'Learned something' },
  handshake: { icon: '🤝', label: 'Solidarity' },
};

const ImpactStories = ({ userProfile }) => {
  const [stories, setStories] = useState(SAMPLE_STORIES);
  const [showForm, setShowForm] = useState(false);
  const [newStory, setNewStory] = useState({ title: '', body: '', category: 'Healthcare' });
  const [userReactions, setUserReactions] = useState({});
  const [expandedStory, setExpandedStory] = useState(null);

  const categories = ['Healthcare', 'Housing', 'Economy & Jobs', 'Education', 'Veterans Affairs', 'Environment', 'Infrastructure', 'Public Safety'];

  const handleReaction = (storyId, reactionType) => {
    const key = `${storyId}-${reactionType}`;
    setUserReactions(prev => {
      const next = { ...prev };
      if (next[key]) {
        delete next[key];
      } else {
        next[key] = true;
      }
      return next;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newStory.title.trim() || !newStory.body.trim()) return;

    const story = {
      id: Date.now(),
      author: userProfile?.name ? `${userProfile.name.split(' ')[0]} ${userProfile.name.split(' ').pop()?.charAt(0) || ''}.` : 'Anonymous',
      location: userProfile?.location || 'Somewhere, USA',
      timeAgo: 'Just now',
      category: newStory.category,
      title: newStory.title,
      body: newStory.body,
      reactions: { heart: 0, lightbulb: 0, handshake: 0 },
      replies: 0,
    };

    setStories(prev => [story, ...prev]);
    setNewStory({ title: '', body: '', category: 'Healthcare' });
    setShowForm(false);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Impact Stories</h3>
            <p className="text-sm text-gray-500 mt-0.5">Real people sharing how legislation changed their lives</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            {showForm ? 'Cancel' : 'Share Your Story'}
          </button>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="p-5 bg-blue-50 border-b border-blue-100 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={newStory.category}
              onChange={(e) => setNewStory(prev => ({ ...prev, category: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              value={newStory.title}
              onChange={(e) => setNewStory(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Give your story a headline..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              maxLength={100}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Your Story</label>
            <textarea
              value={newStory.body}
              onChange={(e) => setNewStory(prev => ({ ...prev, body: e.target.value }))}
              placeholder="How did a specific law, bill, or policy impact your life? Be specific — your story can inspire others to get involved..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              maxLength={1000}
            />
            <p className="text-xs text-gray-400 mt-1">{newStory.body.length}/1000</p>
          </div>
          <button
            type="submit"
            disabled={!newStory.title.trim() || !newStory.body.trim()}
            className="w-full py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Publish Story
          </button>
        </form>
      )}

      <div className="divide-y divide-gray-100">
        {stories.map(story => {
          const isExpanded = expandedStory === story.id;
          const bodyPreview = story.body.length > 180 ? story.body.slice(0, 180) + '...' : story.body;

          return (
            <div key={story.id} className="p-5 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                    {story.author.charAt(0)}
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-900">{story.author}</span>
                    <span className="text-xs text-gray-400 ml-2">{story.location}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                    {story.category}
                  </span>
                  <span className="text-xs text-gray-400">{story.timeAgo}</span>
                </div>
              </div>

              <h4 className="text-base font-semibold text-gray-900 mb-1.5">{story.title}</h4>

              <p className="text-sm text-gray-700 leading-relaxed mb-3">
                {isExpanded ? story.body : bodyPreview}
                {story.body.length > 180 && (
                  <button
                    onClick={() => setExpandedStory(isExpanded ? null : story.id)}
                    className="ml-1 text-blue-600 hover:text-blue-700 font-medium"
                  >
                    {isExpanded ? 'Show less' : 'Read more'}
                  </button>
                )}
              </p>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  {Object.entries(REACTION_ICONS).map(([type, { icon, label }]) => {
                    const reacted = userReactions[`${story.id}-${type}`];
                    const count = story.reactions[type] + (reacted ? 1 : 0);
                    return (
                      <button
                        key={type}
                        onClick={() => handleReaction(story.id, type)}
                        title={label}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs transition-all ${
                          reacted
                            ? 'bg-blue-100 text-blue-700 font-medium'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        <span>{icon}</span>
                        <span>{count}</span>
                      </button>
                    );
                  })}
                </div>
                <span className="text-xs text-gray-400">
                  {story.replies} {story.replies === 1 ? 'reply' : 'replies'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ImpactStories;
