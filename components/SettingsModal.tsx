import React, { useState, useEffect } from 'react';
import { Button } from './Button';
import { IconX, IconDatabase } from './Icons';
import { resetSupabaseClient, getSupabase } from '../services/supabaseClient';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onSave }) => {
  const [url, setUrl] = useState('');
  const [key, setKey] = useState('');

  useEffect(() => {
    if (isOpen) {
      setUrl(localStorage.getItem('sb_url') || '');
      setKey(localStorage.getItem('sb_key') || '');
    }
  }, [isOpen]);

  const handleSave = () => {
    localStorage.setItem('sb_url', url.trim());
    localStorage.setItem('sb_key', key.trim());
    
    // Reset the singleton so next call picks up new keys
    resetSupabaseClient();
    
    onSave();
    onClose();
  };

  const handleClear = () => {
      localStorage.removeItem('sb_url');
      localStorage.removeItem('sb_key');
      setUrl('');
      setKey('');
      resetSupabaseClient();
      onSave();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-gray-50">
          <div className="flex items-center gap-2">
             <IconDatabase className="w-5 h-5 text-indigo-600" />
             <h3 className="font-bold text-gray-900">Backend Settings</h3>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <IconX className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-sm text-gray-600">
            Connect your Supabase database to sync projects across devices. 
            Leave blank to use Local Storage (browser only).
          </p>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Supabase URL</label>
            <input
              type="text"
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 text-gray-900 bg-white"
              placeholder="https://xyz.supabase.co"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Supabase Anon Key</label>
            <input
              type="password"
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 text-gray-900 bg-white"
              placeholder="eyJhbGciOiJIUzI1NiIsInR..."
              value={key}
              onChange={(e) => setKey(e.target.value)}
            />
          </div>
        </div>

        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-between">
          <button 
            onClick={handleClear}
            className="text-sm text-red-600 hover:text-red-800 font-medium"
          >
            Disconnect / Reset
          </button>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={onClose}>Cancel</Button>
            <Button onClick={handleSave}>Save & Connect</Button>
          </div>
        </div>
      </div>
    </div>
  );
};