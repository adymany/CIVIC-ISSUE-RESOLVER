'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { clearUser } from '@/lib/auth';
import ThemeToggle from './ThemeToggle';

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, isClient } = useAuth();
  
  // Use auth context values directly
  const userIsAuthenticated = !!user;
  const userIsAdmin = user?.role === 'ADMIN';
  
  const handleLogout = async () => {
    try {
      // Call the logout API endpoint
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      // Clear user data locally
      clearUser();
      
      // Update auth context
      logout();
      
      // Redirect to home page
      router.push('/');
      
      // Refresh the page to ensure all components update
      router.refresh();
    } catch (error) {
      console.error('Error during logout:', error);
      // Even if API call fails, still clear local data and redirect
      clearUser();
      logout();
      router.push('/');
      router.refresh();
    }
  };
  
  // Render the same structure on both server and client
  // The difference will be in the authentication state which we'll handle gracefully
  return (
    <header className="bg-white dark:bg-gray-900 shadow-medium sticky top-0 z-10">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="text-xl font-bold text-primary-600 hover:text-primary-700 transition-colors">
          CityFix
        </Link>
        <div className="flex items-center space-x-4">
          <nav>
            <ul className="flex space-x-4 items-center">
              <li>
                <Link 
                  href="/report" 
                  className={`btn-pill ${(user && pathname === '/report') ? 'bg-primary-600 text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                >
                  Report Issue
                </Link>
              </li>
              
              {/* Show admin/dashboard or user reports based on auth state */}
              {user && (
                user.role === 'ADMIN' ? (
                  <li>
                    <Link 
                      href="/dashboard" 
                      className={`btn-pill ${pathname === '/dashboard' ? 'bg-primary-600 text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                    >
                      Dashboard
                    </Link>
                  </li>
                ) : (
                  <li>
                    <Link 
                      href="/user-reports" 
                      className={`btn-pill ${pathname === '/user-reports' ? 'bg-primary-600 text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                    >
                      My Reports
                    </Link>
                  </li>
                )
              )}
              
              {/* Show logout or login based on auth state */}
              <li>
                {user ? (
                  <button
                    onClick={handleLogout}
                    className="btn-pill text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    Logout
                  </button>
                ) : (
                  <Link 
                    href="/auth" 
                    className={`btn-pill ${pathname === '/auth' ? 'bg-primary-600 text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                  >
                    Login
                  </Link>
                )}
              </li>
            </ul>
          </nav>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}