import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-10 bg-white/95 backdrop-blur-sm border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="text-2xl font-bold text-slate-900">Daily Deposits</div>
          <div className="flex gap-2 sm:gap-4">
            <Link href="/login">
              <Button variant="ghost" size="sm" className="hidden sm:inline">Sign In</Button>
              <Button variant="ghost" size="sm" className="sm:hidden">Sign In</Button>
            </Link>
            <Link href="/signup">
              <Button size="sm">Start Free</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section - Pain Point Focused */}
      <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight">
            Stop Flying Blind.<br />Know Your Numbers.
          </h1>
          <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
            You&apos;re spending money on ads. But can you answer this: <span className="font-semibold text-white">How many leads did you get today? How many turned into customers?</span>
          </p>

          <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/signup">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto">
                Get Free Access
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 w-full sm:w-auto">
                See How It Works
              </Button>
            </Link>
          </div>

          <p className="text-sm text-slate-400 pt-2">
            No credit card required. 30 seconds to set up.
          </p>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-red-50">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
                The Problem: You Can&apos;t Improve What You Don&apos;t Measure
              </h2>
              <p className="text-lg text-slate-600">
                Here&apos;s what business owners are losing by NOT tracking leads:
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              {[
                {
                  icon: '💸',
                  title: 'Wasted Ad Spend',
                  description: 'No way to know which ad sources actually convert. You keep paying for leads that don&apos;t close.',
                },
                {
                  icon: '📉',
                  title: 'Flying Blind on Metrics',
                  description: 'Can&apos;t calculate CAC, ROAS, or close rates. You&apos;re making decisions based on guesses.',
                },
                {
                  icon: '⚠️',
                  title: 'Losing Leads in the Pipeline',
                  description: 'No clear picture of where leads are. Which ones are pending estimates? How many are stalled?',
                },
                {
                  icon: '📊',
                  title: 'No Growth Insights',
                  description: 'Can&apos;t see what&apos;s working and what&apos;s not. Your growth is capped by guesswork.',
                },
              ].map((problem, i) => (
                <div key={i} className="bg-white p-6 rounded-lg border-l-4 border-red-500">
                  <div className="text-3xl mb-3">{problem.icon}</div>
                  <h3 className="font-semibold text-slate-900 mb-2">{problem.title}</h3>
                  <p className="text-slate-600 text-sm">{problem.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-12">
            <div className="text-center">
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
                The Solution: Daily Deposits
              </h2>
              <p className="text-lg text-slate-600">
                A dead-simple system for tracking leads and building the data foundation you need to grow.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-8">
              {[
                {
                  icon: '⏱️',
                  title: '30 Seconds to Log',
                  description: 'Record service, source, and contact name. That&apos;s it. Easy enough to do every day.',
                },
                {
                  icon: '📊',
                  title: 'See Your Real Metrics',
                  description: 'Now you can finally calculate CAC, ROAS, and close rates. Know what&apos;s actually working.',
                },
                {
                  icon: '📈',
                  title: 'Track the Full Journey',
                  description: 'Lead comes in → Estimate scheduled → Job won or lost. See the complete pipeline.',
                },
                {
                  icon: '🎯',
                  title: 'Any Industry, Any Source',
                  description: 'Works for HVAC, plumbing, roofing, cleaning, landscaping. Google Ads, Facebook, referrals—any source.',
                },
              ].map((solution, i) => (
                <div key={i} className="p-6 rounded-lg bg-blue-50 border border-blue-200">
                  <div className="text-3xl mb-3">{solution.icon}</div>
                  <h3 className="font-semibold text-slate-900 mb-2">{solution.title}</h3>
                  <p className="text-slate-600 text-sm">{solution.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Core Features Section */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-slate-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Everything You Need to Track What Matters
            </h2>
          </div>

          <div className="space-y-6">
            {[
              {
                title: 'Daily Lead Logging',
                description: 'Log leads as they come in. Capture source (Google Ads, Facebook, Referral), service type, and contact name.',
                icon: '📝',
              },
              {
                title: 'Pipeline Status Tracking',
                description: 'See estimate status (Pending → Scheduled → Completed) and close status (Open → Won → Lost). Know where every lead is.',
                icon: '🗂️',
              },
              {
                title: 'Open Leads View',
                description: 'Never lose track of a lead in progress. See all unclosed leads across all dates and mark them Won or Lost in seconds.',
                icon: '📋',
              },
              {
                title: 'Your Data, Your Rules',
                description: 'Set up your own services and lead sources. No limitations, no pre-defined categories. Fits your business exactly.',
                icon: '⚙️',
              },
            ].map((feature, i) => (
              <div key={i} className="bg-white p-6 rounded-lg border border-slate-200 flex gap-4">
                <div className="text-3xl flex-shrink-0">{feature.icon}</div>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-2">{feature.title}</h3>
                  <p className="text-slate-600">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Outcomes Section */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              The Metrics That Matter
            </h2>
            <p className="text-lg text-slate-600">
              With Daily Deposits, you&apos;ll finally be able to calculate:
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            {[
              {
                metric: 'CAC',
                title: 'Customer Acquisition Cost',
                description: 'Know exactly how much each paying customer costs you from start to finish.',
              },
              {
                metric: 'ROAS',
                title: 'Return on Ad Spend',
                description: 'See which ad sources actually generate revenue. Stop throwing money at underperformers.',
              },
              {
                metric: 'Close Rate',
                title: 'Conversion Rate',
                description: 'What percentage of leads become paying customers? Track it. Improve it.',
              },
              {
                metric: 'Cost Per Lead',
                title: 'Source Cost',
                description: 'How much are you really paying per lead from Google vs Facebook vs referrals?',
              },
            ].map((item, i) => (
              <div key={i} className="p-6 rounded-lg bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200">
                <div className="text-4xl font-bold text-blue-600 mb-2">{item.metric}</div>
                <h3 className="font-semibold text-slate-900 mb-2">{item.title}</h3>
                <p className="text-slate-600 text-sm">{item.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 p-6 bg-blue-50 rounded-lg border border-blue-200 text-center">
            <p className="text-slate-700">
              <span className="font-semibold">Daily Deposits captures the foundational data</span> that feeds ALL of these metrics. No complicated dashboards. Just the numbers you need to grow.
            </p>
          </div>
        </div>
      </section>

      {/* Who It&apos;s For Section */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-slate-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
            Built for Service Business Owners
          </h2>
          <p className="text-lg text-slate-600 mb-8">
            If you generate leads and run ads, this is for you.
          </p>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {[
              'HVAC Contractors',
              'Plumbing Companies',
              'Roofing Businesses',
              'Cleaning Services',
              'Landscaping',
              'Any Service Business',
            ].map((industry) => (
              <div
                key={industry}
                className="bg-white p-4 rounded-lg border border-slate-200"
              >
                <p className="font-semibold text-slate-900">{industry}</p>
              </div>
            ))}
          </div>

          <p className="text-slate-600 mt-8">
            Running Google Ads? Facebook? Getting referrals? Daily Deposits works for all of it.
          </p>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              How It Works
            </h2>
            <p className="text-lg text-slate-600">
              Simple enough to use every day.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-6 sm:gap-4">
            {[
              {
                step: '1',
                title: 'Set Up Your Services & Sources',
                description: 'Add your service types (plumbing repairs, emergency calls, etc.) and lead sources (Google Ads, Facebook, referrals).',
              },
              {
                step: '2',
                title: 'Log Leads in 30 Seconds',
                description: 'When a lead comes in, record the service, source, and contact name. Takes less time than writing it down.',
              },
              {
                step: '3',
                title: 'Track Status & Analyze',
                description: 'Mark leads as Won or Lost. See your pipeline. Calculate your real metrics. Make better decisions.',
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center text-xl font-bold mb-4 mx-auto">
                  {item.step}
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">{item.title}</h3>
                <p className="text-slate-600 text-sm">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Stop Guessing. Start Growing.
            </h2>
            <p className="text-lg opacity-90">
              Track your leads. Know your metrics. Build a real foundation for growth.
            </p>
          </div>

          <Link href="/signup">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-slate-100 font-semibold">
              Start Free Today — No Credit Card
            </Button>
          </Link>

          <p className="text-sm opacity-75">
            Trusted by service business owners who take growth seriously.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid sm:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-semibold text-white mb-4">Daily Deposits</h3>
              <p className="text-sm">Lead tracking for service businesses.</p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="#" className="hover:text-white">Features</Link></li>
                <li><Link href="#" className="hover:text-white">Pricing</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="#" className="hover:text-white">About</Link></li>
                <li><Link href="#" className="hover:text-white">Blog</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="#" className="hover:text-white">Privacy</Link></li>
                <li><Link href="#" className="hover:text-white">Terms</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-700 pt-8">
            <p className="text-sm text-center">
              © 2026 Daily Deposits. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
