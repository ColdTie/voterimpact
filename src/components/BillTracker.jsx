import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import CongressService from '../services/CongressService';

const BillTracker = ({ bill, onClose }) => {
  const { user } = useAuth();
  const [isTracking, setIsTracking] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actions, setActions] = useState([]);
  const [loadingActions, setLoadingActions] = useState(true);

  useEffect(() => {
    checkTrackingStatus();
    loadBillActions();
  }, [bill.id]);

  const checkTrackingStatus = async () => {
    try {
      const { data } = await supabase
        .from('bill_tracking')
        .select('id')
        .eq('user_id', user.id)
        .eq('bill_id', bill.id)
        .single();

      setIsTracking(!!data);
    } catch (error) {
      console.error('Error checking tracking status:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadBillActions = async () => {
    try {
      // Parse bill ID to get congress, type, and number
      const [congress, billType, billNumber] = bill.id.split('-');
      
      if (congress && billType && billNumber) {
        const billActions = await CongressService.getBillActions(
          congress,
          billType,
          billNumber
        );
        setActions(billActions);
      }
    } catch (error) {
      console.error('Error loading bill actions:', error);
    } finally {
      setLoadingActions(false);
    }
  };

  const toggleTracking = async () => {
    setLoading(true);
    try {
      if (isTracking) {
        // Remove from tracking
        await supabase
          .from('bill_tracking')
          .delete()
          .eq('user_id', user.id)
          .eq('bill_id', bill.id);
        
        setIsTracking(false);
      } else {
        // Add to tracking
        await supabase
          .from('bill_tracking')
          .insert({
            user_id: user.id,
            bill_id: bill.id,
            bill_title: bill.title,
            bill_status: bill.status,
            created_at: new Date().toISOString()
          });
        
        setIsTracking(true);
      }
    } catch (error) {
      console.error('Error updating tracking status:', error);
      alert('Failed to update tracking status');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (actionText) => {
    const text = actionText.toLowerCase();
    if (text.includes('introduced')) return '📄';
    if (text.includes('committee')) return '🏛️';
    if (text.includes('passed')) return '✅';
    if (text.includes('vote')) return '🗳️';
    if (text.includes('signed')) return '✍️';
    return '📋';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Bill Tracking</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>

        {/* Bill Info */}
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <h3 className="font-medium text-lg">{bill.title}</h3>
          <p className="text-sm text-gray-600 mt-1">
            {bill.billNumber} • {bill.status}
          </p>
        </div>

        {/* Tracking Toggle */}
        <div className="mb-6">
          <button
            onClick={toggleTracking}
            disabled={loading}
            className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
              isTracking
                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            } disabled:opacity-50`}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current mr-2"></div>
                Loading...
              </span>
            ) : isTracking ? (
              '🔕 Stop Tracking This Bill'
            ) : (
              '🔔 Track This Bill'
            )}
          </button>
          
          {isTracking && (
            <p className="text-sm text-gray-600 mt-2 text-center">
              You'll receive email notifications when this bill's status changes
            </p>
          )}
        </div>

        {/* Legislative Timeline */}
        <div className="mb-6">
          <h3 className="font-medium mb-3">Legislative Timeline</h3>
          
          {loadingActions ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : actions.length > 0 ? (
            <div className="space-y-3">
              {actions.slice(0, 10).map((action, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm">
                    {getStatusIcon(action.text)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">{action.text}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDate(action.actionDate)}
                      {action.chamber && ` • ${action.chamber}`}
                    </p>
                  </div>
                </div>
              ))}
              
              {actions.length > 10 && (
                <p className="text-sm text-gray-500 text-center mt-3">
                  + {actions.length - 10} more actions
                </p>
              )}
            </div>
          ) : (
            <p className="text-gray-600 text-center py-4">
              No legislative actions available
            </p>
          )}
        </div>

        {/* Next Steps */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <h4 className="font-medium text-blue-900 mb-2">📊 Current Status</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-blue-700">Chamber:</span>
              <span className="font-medium text-blue-900">{bill.chamber || 'House'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-700">Status:</span>
              <span className="font-medium text-blue-900">{bill.status}</span>
            </div>
            {bill.lastAction && (
              <div className="flex justify-between">
                <span className="text-blue-700">Last Action:</span>
                <span className="font-medium text-blue-900">{bill.lastActionDate}</span>
              </div>
            )}
          </div>
        </div>

        {/* What Tracking Includes */}
        <div className="bg-gray-50 rounded-lg p-4 text-sm">
          <h4 className="font-medium mb-2">What You'll Be Notified About:</h4>
          <ul className="space-y-1 text-gray-600">
            <li>✓ Committee assignments and hearings</li>
            <li>✓ Scheduled votes in House or Senate</li>
            <li>✓ Passage through either chamber</li>
            <li>✓ Presidential action (signed or vetoed)</li>
            <li>✓ Major amendments or changes</li>
          </ul>
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default BillTracker;