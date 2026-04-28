'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();

  if (!user) {
    return null;
  }

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <nav className="bg-gradient-to-r from-amber-600 to-amber-700 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Brand */}
          <Link href="/dashboard" className="font-bold text-xl hover:text-amber-100">
            Osteria
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-6">
            <Link
              href="/dashboard"
              className="hover:text-amber-100 transition font-medium"
            >
              Dashboard
            </Link>

            <Link
              href="/profile"
              className="hover:text-amber-100 transition font-medium"
            >
              Profile
            </Link>

            <Link
              href="/orders"
              className="hover:text-amber-100 transition font-medium"
            >
              {user.role === 'employee' ? 'Manage Orders' : 'My Orders'}
            </Link>

            {user.role === 'employee' && (
              <span className="bg-amber-500 px-3 py-1 rounded-full text-sm font-semibold">
                Staff
              </span>
            )}

            <Button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white border-0"
            >
              Logout
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
