'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, type UserRole } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { BrandLogo } from '@/components/brand-logo';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('client');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await register(email, password, name, role);
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[linear-gradient(145deg,#f8f1e8_0%,#f0e2d4_52%,#edf5e5_100%)] p-4">
      <Card className="w-full max-w-lg border-2 border-[#e8d8c7] bg-[#fffaf4]/95 shadow-xl">
        <div className="p-8">
          <div className="mb-6 flex justify-center">
            <BrandLogo href="/register" imageClassName="h-24 sm:h-28" />
          </div>
          <p className="mb-8 text-center text-[#6e9f48]">Create an Account</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-[#7a432d]">Full Name</label>
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                required
                className="border-[#dec8b4]"
              />
            </div>

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

            <div>
              <label className="mb-2 block text-sm font-medium text-[#7a432d]">Account Type</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full rounded-md border-2 border-[#dec8b4] bg-white px-3 py-2 text-[#7a432d]"
              >
                <option value="client">Customer</option>
                <option value="employee">Restaurant Employee</option>
              </select>
            </div>

            {error && <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">{error}</div>}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#88b95f] py-2 font-semibold text-white hover:bg-[#6e9f48]"
            >
              {isLoading ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-[#7f6958]">
            Already have an account?{' '}
            <a href="/login" className="font-semibold underline hover:text-[#c95a2e]">
              Log in here
            </a>
          </div>
        </div>
      </Card>
    </div>
  );
}
