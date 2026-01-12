'use client';

import { useState } from 'react';
import { LogOut, User, Settings } from 'lucide-react';

interface ProfileMenuProps {
  userName: string;
  userEmail: string;
}

export function ProfileMenu({ userName, userEmail }: ProfileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSignOut = async () => {
    // Clear any auth state (in a real app, you'd call a /api/auth/logout endpoint)
    localStorage.clear();
    sessionStorage.clear();
    // Redirect to home/login
    window.location.href = '/';
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-600 text-white hover:bg-blue-700 font-bold text-sm"
        title={userName}
      >
        {userName.charAt(0).toUpperCase()}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
          <div className="p-4 border-b">
            <p className="font-semibold text-slate-900">{userName}</p>
            <p className="text-xs text-slate-600">{userEmail}</p>
          </div>

          <div className="py-2">
            <button className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-3 text-sm text-slate-700">
              <User className="w-4 h-4" />
              Profile
            </button>
            <button className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-3 text-sm text-slate-700">
              <Settings className="w-4 h-4" />
              Settings
            </button>
          </div>

          <div className="border-t">
            <button
              onClick={handleSignOut}
              className="w-full text-left px-4 py-2 hover:bg-red-50 flex items-center gap-3 text-sm text-red-600"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
