'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { isAuthenticated, isAdmin } from '@/lib/auth';
import ThemeToggle from './ThemeToggle';

export default function Header() {
  const pathname = usePathname();
  
  // Determine if user is admin or regular user
  const userIsAdmin = isAdmin();
  const userIsAuthenticated = isAuthenticated();
  
  return (
    <header className="bg-white dark:bg-gray-900 shadow-medium sticky top-0 z-10">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="text-xl font-bold text-primary-600">
          CityFix
        </Link>
        <div className="flex items-center space-x-4">
          <nav>
            <ul className="flex space-x-4">
              {userIsAuthenticated ? (
                <>
                  <li>
                    <Link 
                      href="/report" 
                      className={`btn-pill ${pathname === '/report' ? 'bg-primary-600 text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                    >
                      Report Issue
                    </Link>
                  </li>
                  {userIsAdmin ? (
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
                  )}
                </>
              ) : (
                <li>
                  <Link 
                    href="/" 
                    className={`btn-pill ${pathname === '/' ? 'bg-primary-600 text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                  >
                    Report Issue
                  </Link>
                </li>
              )}
            </ul>
          </nav>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}