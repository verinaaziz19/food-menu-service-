'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { BrandLogo } from '@/components/brand-logo';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    console.log('[v0] Form submitted');

    try {
      console.log('[v0] Calling login function');
      await login(email, password);
      console.log('[v0] Login successful, pushing to dashboard');
      router.push('/dashboard');
    } catch (err) {
      console.log('[v0] Login error:', err);
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[linear-gradient(145deg,#f8f1e8_0%,#f2e1d0_55%,#edf4e5_100%)] p-4">
      <Card className="w-full max-w-lg border-2 border-[#e8d8c7] bg-[#fffaf4]/95 shadow-xl">
        <div className="p-8">
          <div className="mb-6 flex justify-center">
            <BrandLogo href="/login" imageClassName="h-24 sm:h-28" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-[#7a432d]">Email</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="border-[#dec8b4]"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-[#7a432d]">Password</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="border-[#dec8b4]"
              />
            </div>

            {error && <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">{error}</div>}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#c95a2e] py-2 font-semibold text-white hover:bg-[#ab4a22]"
            >
              {isLoading ? 'Logging in...' : 'Log In'}
            </Button>
          </form>

          <div className="mt-6 rounded border border-[#d8e8c6] bg-[#f4f8ef] p-4 text-sm">
            <p className="mb-2 font-semibold text-[#7a432d]">Demo Credentials:</p>
            <p className="mb-1 text-[#6c5a46]">
              <strong>Client:</strong> client@example.com / password123
            </p>
            <p className="mb-3 text-[#6c5a46]">
              <strong>Employee:</strong> employee@example.com / password123
            </p>
            <p className="text-xs text-[#7f6958]">
              Don&apos;t have an account? <a href="/register" className="underline font-semibold hover:text-[#c95a2e]">
                Register here
              </a>
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
