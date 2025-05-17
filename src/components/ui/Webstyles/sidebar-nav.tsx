"use client";

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';

interface NavItem {
  label: string;
  href: string;
}

interface SidebarNavProps {
  navItems: NavItem[];
  logo?: React.ReactNode;
}

export const SidebarNav: React.FC<SidebarNavProps> = ({
  navItems,
  logo
}: SidebarNavProps) => {
  const pathname = usePathname();

  return (
    <aside className="fixed top-0 left-0 h-full w-52 bg-black flex flex-col z-50 overflow-y-auto">
      {/* Logo */}
      <div className="p-6 pb-10">
        {logo || (
          <Link href="/" className="text-white font-bold text-xl inline-block">
            <span className="text-white">Scalable</span>
            <span className="text-white ml-1">cToken</span>
          </Link>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-6">
        <ul className="space-y-5">
          {navItems.map((item: NavItem) => {
            const isActive = pathname === item.href;
            
            return (
              <li key={item.href}>
                <Link 
                  href={item.href}
                  className={`relative block text-base transition-colors ${
                    isActive ? 'text-white font-medium' : 'text-zinc-300 hover:text-white'
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer area - can be used for additional links or info */}
      <div className="mt-auto p-6 pt-10">
        <Link 
          href="https://github.com/ayushshrivastv/Scalable-cToken.git" 
          target="_blank"
          className="text-zinc-300 hover:text-white text-sm transition-colors"
        >
          GitHub Repository
        </Link>
      </div>
    </aside>
  );
};
