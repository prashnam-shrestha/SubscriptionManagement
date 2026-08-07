'use client';

import { useAuth } from '@/lib/auth-context';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      <Card>
        <CardHeader>
          <CardTitle>Welcome Back</CardTitle>
        </CardHeader>

        <CardContent>
          <p className="text-lg">
            Logged in as{' '}
            <span className="font-semibold">{user?.fullName}</span>{' '}
            (<span className="font-medium text-primary">{user?.role}</span>)
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
