import React, { useState } from 'react';

const SAMPLE_STORIES = [
  {
    id: 'story-1',
    author: { name: 'Jessica R.', location: 'Milwaukee, WI', avatar: 'J' },
    title: 'The Affordable Care Act literally saved my life',
    story: "In 2024, I was diagnosed with a rare autoimmune condition. Without insurance, the treatment would have cost over $180,000. Because of the ACA's pre-existing condition protections, I was able to get coverage and start treatment within weeks. I'm now in remission and back to work full-time. When people talk about healthcare policy as an abstract thing, I want them to know - these laws are the difference between life and death for real people.",
    billReference: 'Affordable Care Act Expansion',
    category: 'Healthcare',
    createdAt: '2026-04-20T10:00:00Z',
    reactions: { inspired: 234, relatable: 189, important: 312 },
    userReaction: null,
  },
  {
    id: 'story-2',
    author: { name: 'Marcus T.', location: 'Detroit, MI', avatar: 'M' },
    title: 'How the GI Bill changed three generations of my family',
    story: "My grandfather used the original GI Bill after WWII to become the first person in our family to go to college. My father used the updated version after Vietnam. And when I came back from Afghanistan, the Post-9/11 GI Bill let me get my engineering degree. Three generations, three wars, three degrees. That's the power of investing in veterans. I now mentor other vets transitioning to civilian careers.",
    billReference: 'Post-9/11 GI Bill',
    category: 'Veterans',
    createdAt: '2026-04-18T14:30:00Z',
    reactions: { inspired: 456, relatable: 123, important: 267 },
    userReaction: null,
  },
  {
    id: 'story-3',
    author: { name: 'Elena P.', location: 'Phoenix, AZ', avatar: 'E' },
    title: 'Our neighborhood finally got broadband - and it changed everything',
    story: "We live in a rural area outside Phoenix. For years, my kids had to drive to the library to do homework online. When the broadband expansion bill passed and our area was included in the rollout, it transformed our community. My daughter can now attend virtual college classes. My husband found remote work. Three neighbors started small online businesses. One bill, one fiber optic cable, and our whole community leaped forward.",
    billReference: 'Rural Broadband Expansion Act',
    category: 'Infrastructure',
    createdAt: '2026-04-15T09:00:00Z',
    reactions: { inspired: 178, relatable: 290, important: 201 },
    userReaction: null,
  },
  {
    id: 'story-4',
    author: { name: 'Raj K.', location: 'Atlanta, GA', avatar: 'R' },
    title: 'Small business tax credits kept my restaurant alive',
    story: "When the pandemic hit, I was ready to close my family's restaurant for good. We'd been open for 12 years. The small business tax credits and PPP loans gave us just enough runway to pivot to takeout, then eventually reopen. Today we're doing better than ever and we've hired 5 new employees. Policy isn't just about big corporations - it's about the family restaurant on your corner.",
    billReference: 'Small Business Relief Act',
    category: 'Economy',
    createdAt: '2026-04-12T16:00:00Z',
    reactions: { inspired: 312, relatable: 201, important: 156 },
    userReaction: null,
  },
];

const timeAgo = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days < 1) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  return `${Math.floor(days / 30)} months ago`;
};

const ImpactStories = ({ userName }) => {
  const [stories, setStories] = useState(SAMPLE_STORIES);
  const [showForm, setShowForm] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [newStory, setNewStory] = useState({
    title: '',
    story: '',
    billReference: '',
    category: 'General',
  });

  const handleReaction = (storyId, reaction) => {
    setStories(prev =>
      prev.map(s => {
        if (s.id !== storyId) return s;
        if (s.userReaction === reaction) return s;
        const updated = { ...s, userReaction: reaction };
        if (s.userReaction) {
          updated.reactions = { ...s.reactions, [s.userReaction]: s.reactions[s.userReaction] - 1 };
        }
        updated.reactions = { ...updated.reactions, [reaction]: (updated.reactions[reaction] || 0) + 1 };
        return updated;
      })
    );
  };

  const handleSubmit = () => {
    if (!newStory.title.trim() || !newStory.story.trim()) return;
    const story = {
      id: `story-new-${Date.now()}`,
      author: { name: userName || 'Anonymous', location: 'Your Community', avatar: (userName || 'A')[0] },
      ...newStory,
      createdAt: new Date().toISOString(),
      reactions: { inspired: 0, relatable: 0, important: 0 },
      userReaction: null,
    };
    setStories(prev => [story, ...prev]);
    setNewStory({ title: '', story: '', billReference: '', category: 'General' });
    setShowForm(false);
  };

  const totalReactions = (reactions) =>
    Object.values(reactions).reduce((sum, v) => sum + v, 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Impact Stories</h2>
          <p className="text-sm text-gray-600 mt-1">
            Real stories from real people about how legislation changed their lives
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          Share Your Story
        </button>
      </div>

      {showForm && (
        <div className="bg-white border border-blue-200 rounded-xl p-6 mb-6">
          <h3 className="font-semibold text-gray-900 mb-1">Share Your Impact Story</h3>
          <p className="text-sm text-gray-600 mb-4">
            How has a law or policy personally affected your life? Your story can help others understand why these issues matter.
          </p>
          <input
            type="text"
            placeholder="Give your story a title"
            value={newStory.title}
            onChange={(e) => setNewStory(prev => ({ ...prev, title: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm mb-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <div className="grid grid-cols-2 gap-3 mb-3">
            <input
              type="text"
              placeholder="Related bill or policy (optional)"
              value={newStory.billReference}
              onChange={(e) => setNewStory(prev => ({ ...prev, billReference: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <select
              value={newStory.category}
              onChange={(e) => setNewStory(prev => ({ ...prev, category: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option>General</option>
              <option>Healthcare</option>
              <option>Education</option>
              <option>Economy</option>
              <option>Infrastructure</option>
              <option>Environment</option>
              <option>Veterans</option>
              <option>Housing</option>
            </select>
          </div>
          <textarea
            placeholder="Tell your story... How did a law or policy change your life, your family's life, or your community?"
            value={newStory.story}
            onChange={(e) => setNewStory(prev => ({ ...prev, story: e.target.value }))}
            rows={6}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm mb-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500">
              Your story may be shared with the community. No personal identifying info beyond your first name and city will be shown.
            </p>
            <div className="flex space-x-2">
              <button
                onClick={() => setShowForm(false)}
                className="px-4 py-2 text-gray-600 text-sm font-medium hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={!newStory.title.trim() || !newStory.story.trim()}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Share Story
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {stories.map(story => {
          const isExpanded = expandedId === story.id;
          const preview = story.story.length > 200
            ? story.story.substring(0, 200) + '...'
            : story.story;

          return (
            <div
              key={story.id}
              className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
                      {story.author.avatar}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{story.author.name}</div>
                      <div className="text-xs text-gray-500">{story.author.location} · {timeAgo(story.createdAt)}</div>
                    </div>
                  </div>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                    {story.category}
                  </span>
                </div>

                <h3 className="font-semibold text-gray-900 text-lg mb-2">{story.title}</h3>

                {story.billReference && (
                  <div className="inline-flex items-center bg-blue-50 text-blue-700 text-xs font-medium px-2 py-1 rounded mb-3">
                    Related: {story.billReference}
                  </div>
                )}

                <p className="text-sm text-gray-700 leading-relaxed">
                  {isExpanded ? story.story : preview}
                </p>

                {story.story.length > 200 && (
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : story.id)}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium mt-2"
                  >
                    {isExpanded ? 'Show less' : 'Read full story'}
                  </button>
                )}
              </div>

              <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                <div className="flex space-x-3">
                  {[
                    { key: 'inspired', emoji: '✨', label: 'Inspired' },
                    { key: 'relatable', emoji: '🤝', label: 'Relatable' },
                    { key: 'important', emoji: '💡', label: 'Important' },
                  ].map(r => (
                    <button
                      key={r.key}
                      onClick={() => handleReaction(story.id, r.key)}
                      className={`flex items-center space-x-1 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                        story.userReaction === r.key
                          ? 'bg-blue-100 text-blue-700 ring-1 ring-blue-300'
                          : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                      }`}
                    >
                      <span>{r.emoji}</span>
                      <span>{r.label}</span>
                      <span className="text-gray-400 ml-1">{story.reactions[r.key]}</span>
                    </button>
                  ))}
                </div>
                <span className="text-xs text-gray-400">
                  {totalReactions(story.reactions).toLocaleString()} reactions
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
