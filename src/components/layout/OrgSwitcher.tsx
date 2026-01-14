'use client';

import { useState, useEffect, useCallback } from 'react';
import { ChevronDown } from 'lucide-react';

interface Org {
  id: string;
  name: string;
  userId: string;
}

interface User {
  id: string;
  email: string;
  name: string;
  companyName?: string;
  userType: 'business_owner' | 'agency';
}

export function OrgSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [currentOrg, setCurrentOrg] = useState<Org | null>(null);
  const [orgs, setOrgs] = useState<Org[]>([]);

  const fetchUserData = useCallback(async () => {
    try {
      const viewingOrgId = sessionStorage.getItem('viewingOrgId');
      const url = `/api/me${viewingOrgId ? `?viewingOrgId=${viewingOrgId}` : ''}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }
      const data = await response.json();
      setUser(data.user);
      setCurrentOrg(data.currentOrg);
      setOrgs(data.orgs);
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  }, []);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  const handleSwitchOrg = (orgId: string) => {
    if (window) {
      sessionStorage.removeItem('viewingAsAgency');
      sessionStorage.setItem('viewingOrgId', orgId);
      window.location.reload();
    }
  };

  const handleSwitchToAgency = () => {
    if (window) {
      sessionStorage.removeItem('viewingOrgId');
      sessionStorage.setItem('viewingAsAgency', 'true');
      window.location.reload();
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-white transition-colors"
      >
        <div className="text-left">
          <p className="font-semibold text-sm truncate">{user.companyName || 'Daily Deposits'}</p>
          {currentOrg && (
            <p className="text-xs text-slate-400 truncate">{currentOrg.name}</p>
          )}
        </div>
        <ChevronDown
          className={`w-4 h-4 text-slate-400 transition-transform flex-shrink-0 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-lg shadow-xl z-50 overflow-hidden border border-slate-200 min-w-max">
          {/* Agency View Option */}
          {user.userType === 'agency' && (
            <>
              <button
                onClick={handleSwitchToAgency}
                className="w-full text-left px-4 py-3 hover:bg-slate-50 border-b border-slate-200 text-slate-900 text-sm font-medium flex items-center gap-2"
              >
                <span className="text-lg">🏢</span>
                Switch to Agency View
              </button>
            </>
          )}

          {/* Organizations */}
          {orgs.length === 0 ? (
            <div className="p-4 text-center text-slate-500 text-sm">No organizations</div>
          ) : (
            <div className="max-h-64 overflow-y-auto">
              {orgs.map((org) => (
                <button
                  key={org.id}
                  onClick={() => handleSwitchOrg(org.id)}
                  className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                    currentOrg && org.id === currentOrg.id
                      ? 'bg-blue-50 text-blue-900 border-l-4 border-blue-600 font-medium'
                      : 'text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {org.name}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
