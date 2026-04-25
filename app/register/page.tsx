'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, type UserRole } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50 p-4">
      <Card className="w-full max-w-md border-2 border-green-200 shadow-lg">
        <div className="p-8">
          <h1 className="text-3xl font-bold text-center mb-2 text-green-900">Osteria</h1>
          <p className="text-center text-green-700 mb-8">Create an Account</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-green-900 mb-2">Full Name</label>
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                required
                className="border-green-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-green-900 mb-2">Email</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="border-green-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-green-900 mb-2">Password</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="border-green-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-green-900 mb-2">Account Type</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full px-3 py-2 border-2 border-green-200 rounded-md bg-white text-green-900"
              >
                <option value="client">Customer</option>
                <option value="employee">Restaurant Employee</option>
              </select>
            </div>

            {error && <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">{error}</div>}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2"
            >
              {isLoading ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-green-700">
            Already have an account?{' '}
            <a href="/login" className="font-semibold underline hover:text-green-900">
              Log in here
            </a>
          </div>
        </div>
      </Card>
    </div>
  );
}
