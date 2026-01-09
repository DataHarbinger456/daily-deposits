import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-10 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="text-2xl font-bold text-slate-900">Daily Deposits</div>
          <div className="flex gap-4">
            <Link href="/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/signup">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl md:text-6xl font-bold text-slate-900">
              Track Your Daily Deposits
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Simple, powerful, and intuitive deposit tracking. Never miss a record again.
            </p>
          </div>

          <div className="flex gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" className="text-lg h-12 px-8">
                Start Free Today
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="text-lg h-12 px-8">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">
            Why Choose Daily Deposits?
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: '🎯',
                title: 'Easy Tracking',
                description: 'Record deposits in seconds with our intuitive interface.',
              },
              {
                icon: '📊',
                title: 'Smart Analytics',
                description: 'Visualize your deposit trends and patterns over time.',
              },
              {
                icon: '🔒',
                title: 'Secure & Private',
                description: 'Your data is encrypted and never shared with third parties.',
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="p-6 rounded-lg border border-slate-200 hover:shadow-lg transition-shadow"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-slate-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center space-y-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-12 text-white">
          <h2 className="text-3xl font-bold">Ready to get started?</h2>
          <p className="text-lg opacity-90">
            Join thousands of users tracking their deposits with confidence.
          </p>
          <Link href="/signup">
            <Button size="lg" variant="secondary" className="text-lg h-12 px-8">
              Create Your Account
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
