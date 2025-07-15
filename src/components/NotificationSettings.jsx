import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

const NotificationSettings = ({ onClose }) => {
  const { user } = useAuth();
  const [settings, setSettings] = useState({
    emailNotifications: true,
    billUpdates: true,
    voteAlerts: true,
    townHalls: false,
    weeklyDigest: true,
    categories: [],
    representatives: []
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const categories = [
    'Healthcare', 'Housing', 'Economic', 'Veterans Affairs',
    'Environment', 'Transportation', 'Social Issues', 'Education'
  ];

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('notification_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (data) {
        setSettings(data.settings);
      }
    } catch (error) {
      console.error('Error loading notification settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('notification_settings')
        .upsert({
          user_id: user.id,
          settings,
          updated_at: new Date().toISOString()
        });

      if (!error) {
        // Show success message
        alert('Notification settings saved successfully!');
        onClose();
      } else {
        throw error;
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const toggleCategory = (category) => {
    setSettings(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category]
    }));
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Notification Settings</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>

        {/* Main Toggle */}
        <div className="mb-6">
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={settings.emailNotifications}
              onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
              className="h-5 w-5 text-blue-600"
            />
            <div>
              <span className="font-medium">Email Notifications</span>
              <p className="text-sm text-gray-600">
                Receive email updates about legislation that matters to you
              </p>
            </div>
          </label>
        </div>

        {settings.emailNotifications && (
          <>
            {/* Notification Types */}
            <div className="mb-6">
              <h3 className="font-medium mb-3">Notification Types</h3>
              <div className="space-y-3">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={settings.billUpdates}
                    onChange={(e) => setSettings({ ...settings, billUpdates: e.target.checked })}
                    className="h-4 w-4 text-blue-600"
                  />
                  <div>
                    <span className="text-sm font-medium">Bill Status Updates</span>
                    <p className="text-xs text-gray-600">
                      When bills you're tracking change status or have votes scheduled
                    </p>
                  </div>
                </label>

                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={settings.voteAlerts}
                    onChange={(e) => setSettings({ ...settings, voteAlerts: e.target.checked })}
                    className="h-4 w-4 text-blue-600"
                  />
                  <div>
                    <span className="text-sm font-medium">Vote Alerts</span>
                    <p className="text-xs text-gray-600">
                      24-hour notice before important votes in Congress
                    </p>
                  </div>
                </label>

                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={settings.townHalls}
                    onChange={(e) => setSettings({ ...settings, townHalls: e.target.checked })}
                    className="h-4 w-4 text-blue-600"
                  />
                  <div>
                    <span className="text-sm font-medium">Town Hall Meetings</span>
                    <p className="text-xs text-gray-600">
                      When your representatives schedule public meetings
                    </p>
                  </div>
                </label>

                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={settings.weeklyDigest}
                    onChange={(e) => setSettings({ ...settings, weeklyDigest: e.target.checked })}
                    className="h-4 w-4 text-blue-600"
                  />
                  <div>
                    <span className="text-sm font-medium">Weekly Digest</span>
                    <p className="text-xs text-gray-600">
                      Summary of legislative activity relevant to you
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* Category Preferences */}
            <div className="mb-6">
              <h3 className="font-medium mb-3">Topics of Interest</h3>
              <p className="text-sm text-gray-600 mb-3">
                Get notified about new bills in these categories:
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {categories.map(category => (
                  <label key={category} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={settings.categories.includes(category)}
                      onChange={() => toggleCategory(category)}
                      className="h-4 w-4 text-blue-600"
                    />
                    <span className="text-sm">{category}</span>
                  </label>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Sample Notification Preview */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium mb-2">Sample Notification</h3>
          <div className="bg-white border border-gray-200 rounded p-3 text-sm">
            <p className="font-medium text-gray-900">
              🏛️ Bill Update: Affordable Housing Tax Credit Extension
            </p>
            <p className="text-gray-600 mt-1">
              Status changed from "In Committee" to "House Vote Scheduled"
            </p>
            <p className="text-gray-600 mt-1">
              Vote scheduled for Thursday, January 18 at 2:00 PM EST
            </p>
            <div className="mt-2 flex space-x-3">
              <a href="#" className="text-blue-600 hover:underline text-xs">
                View Bill Details
              </a>
              <a href="#" className="text-blue-600 hover:underline text-xs">
                Contact Your Rep
              </a>
            </div>
          </div>
        </div>

        {/* Privacy Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-6 text-sm">
          <p className="font-medium text-blue-800 mb-1">🔒 Privacy Notice</p>
          <p className="text-blue-700 text-xs">
            Your notification preferences are stored securely. We will never share your
            email address or send spam. You can unsubscribe at any time.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={saveSettings}
            disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings;