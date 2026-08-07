'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  CheckSquare,
  Users,
  CreditCard,
  Package,
  Server,
  DollarSign,
  BarChart3,
  Bell,
  History,
  Settings,
  ChevronRight,
} from 'lucide-react';

const navigation = [
  { name: 'Task Center', href: '/task-center', icon: CheckSquare },
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  {
    name: 'Customers',
    href: '/customers',
    icon: Users,
    children: [{ name: 'Pending Customers', href: '/customers/pending' }],
  },
  { name: 'Subscriptions', href: '/subscriptions', icon: CreditCard },
  { name: 'Products', href: '/products', icon: Package },
  {
    name: 'Master Accounts',
    href: '/master-accounts',
    icon: Server,
    children: [{ name: 'Streaming Profiles', href: '/streaming-profiles' }],
  },
  { name: 'Revenue', href: '/revenue', icon: DollarSign },
  { name: 'Reports', href: '/reports', icon: BarChart3 },
  { name: 'Notifications', href: '/notifications', icon: Bell },
  { name: 'Activity Log', href: '/activity-log', icon: History },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col border-r bg-card">
      <div className="border-b p-6">
        <span className="text-xl font-bold tracking-tight text-primary">
          SubscriptionOS
        </span>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = pathname.startsWith(item.href);

          return (
            <div key={item.name} className="space-y-1">
              <Link
                href={item.href}
                className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{item.name}</span>
              </Link>

              {item.children && (
                <div className="space-y-1 pl-8">
                  {item.children.map((child) => (
                    <Link
                      key={child.name}
                      href={child.href}
                      className="flex items-center gap-2 rounded-md px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
                    >
                      <ChevronRight className="h-3 w-3" />
                      <span>{child.name}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
