'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  FileText, 
  Network, 
  Bot, 
  AlertOctagon, 
  History, 
  Settings, 
  ShieldCheck,
  ChevronRight,
  Sparkles
} from 'lucide-react';

export function AppSidebar() {
  const pathname = usePathname();

  const navItems = [
    {
      name: 'Operations Overview',
      href: '/app',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      name: 'Document Inbox',
      href: '/app/documents',
      icon: FileText,
      badge: '1 Review',
      badgeColor: 'bg-[#FFF3DB] text-[#B8710E] border-[#F5DC9C]',
    },
    {
      name: 'Traceability Explorer',
      href: '/app/trace',
      icon: Network,
      badge: 'Interactive',
      badgeColor: 'bg-[#E8F3ED] text-[#173D32] border-[#C6DEC6]',
    },
    {
      name: 'AI Investigation',
      href: '/app/agent',
      icon: Bot,
      badge: 'Open-Weight',
      badgeColor: 'bg-[#E8F3ED] text-[#173D32] border-[#C6DEC6]',
    },
    {
      name: 'Incident Reports',
      href: '/app/incidents',
      icon: AlertOctagon,
      badge: '1 Active',
      badgeColor: 'bg-[#FCE9E7] text-[#B94343] border-[#F5C2BE]',
    },
    {
      name: 'Audit Trail',
      href: '/app/audit',
      icon: History,
      badge: null,
    },
    {
      name: 'Settings & Models',
      href: '/app/settings',
      icon: Settings,
      badge: null,
    },
  ];

  return (
    <aside className="w-64 shrink-0 bg-white border-r border-[#E2E6DF] flex flex-col justify-between h-screen sticky top-0 overflow-y-auto">
      <div>
        {/* Brand header */}
        <div className="p-5 border-b border-[#E2E6DF]">
          <Link href="/app" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#173D32] flex items-center justify-center text-white font-bold text-sm shadow-xs">
              <ShieldCheck className="w-4 h-4 text-[#DCE8DF]" />
            </div>
            <div>
              <span className="font-bold text-base text-[#173D32] tracking-tight block leading-tight">
                BatchTrace
              </span>
              <span className="text-[11px] text-[#66746F] font-medium tracking-tight block">
                Food Intelligence & Trace
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation list */}
        <nav className="p-3 space-y-1">
          <div className="px-3 pt-2 pb-1 text-[11px] font-semibold uppercase tracking-wider text-[#66746F]">
            Navigation
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/app' && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-[#173D32] text-white shadow-xs font-semibold'
                    : 'text-[#27343A] hover:bg-[#F7F6F0] hover:text-[#173D32]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#527D68]'}`} />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full border font-mono ${
                      isActive ? 'bg-white/20 text-white border-white/30' : item.badgeColor
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Info Box */}
      <div className="p-4 border-t border-[#E2E6DF] bg-[#F7F6F0]/60 m-3 rounded-xl border">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] font-semibold text-[#173D32] flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-[#527D68]" />
            Grounded AI Guarantee
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
        </div>
        <p className="text-[11px] text-[#66746F] leading-snug">
          Deterministic PostgreSQL engine is the ground truth. Zero hallucinated lot codes or customer orders.
        </p>
        <Link
          href="/how-it-works"
          className="mt-2.5 flex items-center gap-1 text-[11px] font-semibold text-[#173D32] hover:underline"
        >
          View safeguards & architecture <ChevronRight className="w-3 h-3" />
        </Link>
      </div>
    </aside>
  );
}
