import React, { useState } from 'react';

const DiscussionThread = ({ thread, onUpvote, onReply, legislation = [] }) => {
  const [expanded, setExpanded] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [showReplyBox, setShowReplyBox] = useState(false);

  const timeAgo = (timestamp) => {
    const seconds = Math.floor((Date.now() - new Date(timestamp)) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const linkedBill = thread.billRef
    ? legislation.find(b => b.id === thread.billRef)
    : null;

  const handleSubmitReply = () => {
    if (!replyText.trim()) return;
    onReply(replyText);
    setReplyText('');
    setShowReplyBox(false);
    setExpanded(true);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      <div className="p-4">
        {/* Author & Meta */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-sm font-bold">
              {thread.author.charAt(0)}
            </div>
            <div>
              <span className="text-sm font-medium text-gray-900">{thread.author}</span>
              <span className="text-xs text-gray-400 ml-2">{thread.authorLocation}</span>
            </div>
          </div>
          <span className="text-xs text-gray-400">{timeAgo(thread.timestamp)}</span>
        </div>

        {/* Post Body */}
        <p className="text-sm text-gray-800 leading-relaxed mb-3">{thread.text}</p>

        {/* Linked Bill */}
        {linkedBill && (
          <div className="bg-blue-50 border border-blue-100 rounded-lg px-3 py-2 mb-3">
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              <span className="text-xs font-medium text-blue-700">{linkedBill.title}</span>
            </div>
          </div>
        )}

        {/* Tags */}
        {thread.tags && thread.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {thread.tags.map(tag => (
              <span key={tag} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center space-x-4 pt-2 border-t border-gray-100">
          <button
            onClick={onUpvote}
            className="flex items-center space-x-1 text-gray-500 hover:text-indigo-600 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
            <span className="text-xs font-medium">{thread.upvotes}</span>
          </button>

          <button
            onClick={() => {
              if (thread.replies.length > 0) setExpanded(!expanded);
              setShowReplyBox(!showReplyBox);
            }}
            className="flex items-center space-x-1 text-gray-500 hover:text-indigo-600 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span className="text-xs font-medium">
              {thread.replies.length} {thread.replies.length === 1 ? 'reply' : 'replies'}
            </span>
          </button>

          <button className="flex items-center space-x-1 text-gray-500 hover:text-indigo-600 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            <span className="text-xs font-medium">Share</span>
          </button>
        </div>
      </div>

      {/* Replies */}
      {expanded && thread.replies.length > 0 && (
        <div className="bg-gray-50 border-t border-gray-200 px-4 py-3 space-y-3">
          {thread.replies.map(reply => (
            <div key={reply.id} className="flex space-x-2">
              <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-xs font-bold flex-shrink-0 mt-0.5">
                {reply.author.charAt(0)}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-medium text-gray-900">{reply.author}</span>
                  <span className="text-xs text-gray-400">{timeAgo(reply.timestamp)}</span>
                </div>
                <p className="text-sm text-gray-700 mt-0.5">{reply.text}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reply Input */}
      {showReplyBox && (
        <div className="bg-gray-50 border-t border-gray-200 px-4 py-3">
          <div className="flex space-x-2">
            <input
              type="text"
              value={replyText}
              onChange={e => setReplyText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmitReply()}
              placeholder="Write a reply..."
              className="flex-1 text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              autoFocus
            />
            <button
              onClick={handleSubmitReply}
              disabled={!replyText.trim()}
              className="px-3 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              Reply
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiscussionThread;
