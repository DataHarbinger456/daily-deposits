import { LoginForm } from '@/components/auth/LoginForm';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="w-full max-w-md space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold text-slate-900">Daily Deposits</h1>
          <p className="text-sm text-slate-600">Sign in to your account</p>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-8 shadow-md">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
