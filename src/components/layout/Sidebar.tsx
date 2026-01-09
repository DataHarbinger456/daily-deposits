'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => setIsOpen(!isOpen);

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: '📊' },
    { href: '/dashboard/record', label: 'Record Lead', icon: '➕' },
    { href: '/dashboard/leads', label: 'Open Leads', icon: '📋' },
    { href: '/dashboard/settings', label: 'Settings', icon: '⚙️' },
  ];

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
        <div className="space-y-8">
          <div>
            <h2 className="text-xl font-bold">Daily Deposits</h2>
            <p className="text-xs text-slate-400">v1.0</p>
          </div>

          <nav className="space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center space-x-3 px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            ))}
          </nav>

          <div className="pt-8 border-t border-slate-700">
            <Button
              variant="outline"
              className="w-full justify-center text-sm"
              onClick={() => setIsOpen(false)}
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
