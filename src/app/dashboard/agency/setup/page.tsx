'use client';

import { Card } from '@/components/ui/card';
import Link from 'next/link';
import { CheckCircle2, Circle } from 'lucide-react';
import { useState } from 'react';

interface SetupStep {
  id: string;
  title: string;
  description: string;
  status: 'completed' | 'in-progress' | 'pending';
  details: string;
  icon: string;
}

export default function SetupGuidePage() {
  const [steps, setSteps] = useState<SetupStep[]>([
    {
      id: 'database',
      title: 'Database Setup',
      description: 'Database is configured and running',
      status: 'completed',
      details:
        'SQLite for development, PostgreSQL for production. All tables created and migrations applied.',
      icon: '🗄️',
    },
    {
      id: 'stripe',
      title: 'Stripe Integration',
      description: 'Connect Stripe for payment processing',
      status: 'pending',
      details:
        'Sign up for a Stripe account, generate API keys, and configure billing and subscriptions. Add your keys to environment variables.',
      icon: '💳',
    },
    {
      id: 'ghl',
      title: 'GoHighLevel Integration',
      description: 'Connect GoHighLevel for CRM sync',
      status: 'pending',
      details:
        'Get your GoHighLevel API key from settings. Configure webhooks for real-time lead syncing between Daily Deposits and GHL.',
      icon: '🔗',
    },
    {
      id: 'email',
      title: 'Email Service',
      description: 'Set up Resend for transactional emails',
      status: 'pending',
      details:
        'Sign up for Resend account, create API key. Configure email templates for daily summaries and notifications.',
      icon: '📧',
    },
    {
      id: 'auth',
      title: 'Authentication',
      description: 'User authentication is configured',
      status: 'completed',
      details: 'Email/password signup with Argon2 hashing. Session management via Auth.js.',
      icon: '🔐',
    },
    {
      id: 'analytics',
      title: 'Analytics Setup',
      description: 'Configure analytics and error tracking',
      status: 'pending',
      details:
        'Optional: Set up Sentry for error tracking and analytics dashboards for monitoring leads and revenue.',
      icon: '📊',
    },
  ]);

  const completedCount = steps.filter((s) => s.status === 'completed').length;
  const totalCount = steps.length;
  const progressPercent = Math.round((completedCount / totalCount) * 100);

  const toggleStep = (id: string) => {
    setSteps((prev) =>
      prev.map((step) => {
        if (step.id === id) {
          const newStatus = step.status === 'completed' ? 'pending' : 'completed';
          return { ...step, status: newStatus };
        }
        return step;
      })
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <Link href="/dashboard/agency" className="text-blue-600 hover:underline text-sm mb-4 inline-block">
          ← Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold mb-2">Setup Guide</h1>
        <p className="text-gray-600">
          Complete these steps to fully configure Daily Deposits for your agency
        </p>
      </div>

      {/* Progress Bar */}
      <Card className="p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Setup Progress</h3>
          <span className="text-2xl font-bold text-blue-600">{completedCount}</span>
          <span className="text-sm text-gray-600">of {totalCount} completed</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className="bg-blue-600 h-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </Card>

      {/* Setup Steps */}
      <div className="space-y-4">
        {steps.map((step) => (
          <Card key={step.id} className="p-6 hover:shadow-lg transition-shadow">
            <button
              onClick={() => toggleStep(step.id)}
              className="w-full text-left flex items-start gap-4 group"
            >
              <div className="flex-shrink-0 mt-1">
                {step.status === 'completed' ? (
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                ) : (
                  <Circle className="w-6 h-6 text-gray-400 group-hover:text-gray-600" />
                )}
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">{step.icon}</span>
                  <h3 className="font-semibold text-lg text-slate-900">{step.title}</h3>
                  {step.status === 'completed' && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                      Completed
                    </span>
                  )}
                </div>
                <p className="text-gray-600 text-sm mb-3">{step.description}</p>

                <div
                  className={`text-sm text-gray-700 pl-4 border-l-2 border-gray-300 ${
                    step.status === 'completed' ? 'bg-green-50 border-l-green-500 p-3 -ml-4 pl-4' : ''
                  }`}
                >
                  {step.details}
                </div>
              </div>
            </button>
          </Card>
        ))}
      </div>

      {/* Documentation Links */}
      <Card className="p-6 mt-8 bg-blue-50">
        <h3 className="font-semibold text-slate-900 mb-4">Documentation & Resources</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <a
            href="#"
            className="flex items-center gap-3 p-3 bg-white rounded border hover:border-blue-600 transition-colors"
          >
            <span className="text-xl">📖</span>
            <div>
              <p className="font-medium text-sm">Getting Started Guide</p>
              <p className="text-xs text-gray-600">Step-by-step walkthrough</p>
            </div>
          </a>
          <a
            href="#"
            className="flex items-center gap-3 p-3 bg-white rounded border hover:border-blue-600 transition-colors"
          >
            <span className="text-xl">🎥</span>
            <div>
              <p className="font-medium text-sm">Video Tutorials</p>
              <p className="text-xs text-gray-600">Watch how to set up integrations</p>
            </div>
          </a>
          <a
            href="#"
            className="flex items-center gap-3 p-3 bg-white rounded border hover:border-blue-600 transition-colors"
          >
            <span className="text-xl">💬</span>
            <div>
              <p className="font-medium text-sm">Support Chat</p>
              <p className="text-xs text-gray-600">Talk to our team</p>
            </div>
          </a>
          <a
            href="#"
            className="flex items-center gap-3 p-3 bg-white rounded border hover:border-blue-600 transition-colors"
          >
            <span className="text-xl">🚀</span>
            <div>
              <p className="font-medium text-sm">API Reference</p>
              <p className="text-xs text-gray-600">Technical documentation</p>
            </div>
          </a>
        </div>
      </Card>
    </div>
  );
}
