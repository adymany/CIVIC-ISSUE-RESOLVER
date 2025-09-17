'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function TestLogoutPage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If user is not authenticated, redirect to home
    if (!user) {
      router.push('/');
    }
  }, [user, router]);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Test Logout</h1>
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">User Information</h2>
        {user ? (
          <div>
            <p className="mb-2"><strong>ID:</strong> {user.id}</p>
            <p className="mb-2"><strong>Email:</strong> {user.email}</p>
            <p className="mb-2"><strong>Name:</strong> {user.name}</p>
            <p className="mb-4"><strong>Role:</strong> {user.role}</p>
            <button
              onClick={handleLogout}
              className="btn-primary-gradient btn-pill"
            >
              Logout
            </button>
          </div>
        ) : (
          <p>No user is currently logged in.</p>
        )}
      </div>
    </div>
  );
}