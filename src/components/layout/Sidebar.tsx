'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { OrgSwitcher } from './OrgSwitcher';

interface User {
  id: string;
  email: string;
  name: string;
  companyName?: string;
  userType: 'business_owner' | 'agency';
}

interface SidebarProps {
  isViewingAgency?: boolean;
  currentOrgId?: string;
}

export function Sidebar({ isViewingAgency: initialIsAgency = false }: SidebarProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [viewingOrgId, setViewingOrgId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        if (typeof window === 'undefined') return;

        // Check viewing mode from session storage
        const orgIdFromSession = sessionStorage.getItem('viewingOrgId');
        setViewingOrgId(orgIdFromSession);

        const response = await fetch('/api/me');
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };

    fetchUser();
  }, []);

  const toggleSidebar = () => setIsOpen(!isOpen);

  // Determine if viewing agency mode: agency user type BUT not viewing a specific org
  const isViewingAgency = (user?.userType === 'agency' || initialIsAgency) && !viewingOrgId;

  // Agency users viewing agency mode - show different menu
  const agencyNavItems = [
    { href: '/dashboard/agency', label: 'Agency Dashboard', icon: '📊' },
    { href: '/dashboard/agency/setup', label: 'Setup Guide', icon: '⚙️' },
  ];

  // Business owner mode - show operations menu
  const businessNavItems = [
    { href: '/dashboard', label: 'Dashboard', icon: '📊' },
    { href: '/dashboard/record', label: 'Record Lead', icon: '➕' },
    { href: '/dashboard/leads', label: 'Contacts', icon: '📋' },
    { href: '/dashboard/settings', label: 'Settings', icon: '⚙️' },
  ];

  const navItems = isViewingAgency ? agencyNavItems : businessNavItems;

  const isActive = (href: string) => {
    // Exact match for all routes
    return pathname === href;
  };

  return (
    <>
      {/* Mobile toggle */}
      <div className="fixed top-0 left-0 z-40 md:hidden">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="rounded-none"
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen w-64 bg-slate-900 text-white p-6 pt-20 transition-transform duration-300 md:translate-x-0 z-30 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="space-y-6">
          <OrgSwitcher />
          <div className="px-1">
            <p className="text-xs text-slate-400 font-semibold">NAVIGATION</p>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors ${
                    active
                      ? 'bg-blue-600 text-white font-semibold'
                      : 'text-slate-300 hover:bg-slate-800'
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="pt-8 border-t border-slate-700">
            <Button
              className="w-full justify-center text-sm bg-slate-700 text-white hover:bg-slate-600"
              onClick={() => {
                localStorage.clear();
                sessionStorage.clear();
                window.location.href = '/';
              }}
            >
              Sign Out
            </Button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
