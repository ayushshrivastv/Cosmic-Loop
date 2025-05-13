"use client";

import { AppleLayout } from '@/components/layouts/apple-layout';
import { ROUTES } from '@/lib/constants';
import { EventStatistics } from '@/components/dashboard/event-statistics';
import { RecipientList } from '@/components/dashboard/recipient-list';
import { ClaimAnalytics } from '@/components/dashboard/claim-analytics';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function DashboardPage() {
  return (
    <AppleLayout>
      {/* Content */}
      <div className="container mx-auto pt-32 pb-16 flex-1">
        <h1 className="text-3xl font-bold mb-8">Event Dashboard</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column - Info */}
          <div className="lg:col-span-1">
            <div className="border border-border rounded-lg p-6 sticky top-24">
              <h2 className="text-xl font-semibold mb-4">Dashboard Overview</h2>
              <p className="text-muted-foreground mb-4">
                Monitor your event tokens, track distributions, and manage recipients. This dashboard provides insights into your event&apos;s engagement and token distribution metrics.
              </p>

              <h3 className="font-medium text-lg mt-6 mb-2">Features</h3>
              <ul className="list-disc pl-5 text-muted-foreground space-y-1">
                <li>Track token claims and distributions</li>
                <li>Monitor recipient activity</li>
                <li>View event analytics and statistics</li>
                <li>Manage token supply and airdrops</li>
              </ul>

              <div className="mt-6 pt-6 border-t border-border">
                <h3 className="font-medium mb-2">Need help?</h3>
                <p className="text-sm text-muted-foreground">
                  Make sure your wallet is connected to view your event data.
                </p>
              </div>
            </div>
          </div>

          {/* Right column - Dashboard Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="statistics" className="border border-border rounded-lg p-6">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="statistics">Event Statistics</TabsTrigger>
                <TabsTrigger value="analytics">Claim Analytics</TabsTrigger>
                <TabsTrigger value="recipients">Token Recipients</TabsTrigger>
              </TabsList>
              
              <TabsContent value="statistics">
                <EventStatistics />
              </TabsContent>

              <TabsContent value="analytics">
                <ClaimAnalytics />
              </TabsContent>
              
              <TabsContent value="recipients">
                <RecipientList />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </AppleLayout>
  );
}
