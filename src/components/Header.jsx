'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header() {
  const pathname = usePathname();
  
  return (
    <header className="bg-blue-600 text-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="text-xl font-bold">
          Civic Issue Reporter
        </Link>
        <nav>
          <ul className="flex space-x-4">
            <li>
              <Link 
                href="/" 
                className={`hover:text-blue-200 ${pathname === '/' ? 'font-bold' : ''}`}
              >
                Report Issue
              </Link>
            </li>
            <li>
              <Link 
                href="/dashboard" 
                className={`hover:text-blue-200 ${pathname === '/dashboard' ? 'font-bold' : ''}`}
              >
                Dashboard
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}