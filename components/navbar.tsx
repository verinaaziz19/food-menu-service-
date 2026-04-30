'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { BrandLogo } from '@/components/brand-logo';

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
    <nav className="border-b border-[#e6d8c7] bg-[#f7efe5]/95 text-[#7a432d] shadow-sm backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex min-h-24 items-center justify-between gap-4 py-3">
          <BrandLogo className="shrink-0" imageClassName="h-16 sm:h-20 md:h-24" />

          {/* Navigation Links */}
          <div className="flex items-center gap-4 sm:gap-6">
            <Link
              href="/dashboard"
              className="font-medium transition hover:text-[#c95a2e]"
            >
              Dashboard
            </Link>

            <Link
              href="/profile"
              className="font-medium transition hover:text-[#c95a2e]"
            >
              Profile
            </Link>

            <Link
              href="/orders"
              className="font-medium transition hover:text-[#c95a2e]"
            >
              {user.role === 'employee' ? 'Manage Orders' : 'My Orders'}
            </Link>

            {user.role === 'employee' && (
              <span className="rounded-full bg-[#88b95f]/15 px-3 py-1 text-sm font-semibold text-[#6e9f48]">
                Staff
              </span>
            )}

            <Button
              onClick={handleLogout}
              className="border-0 bg-[#c95a2e] text-white hover:bg-[#ab4a22]"
            >
              Logout
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
