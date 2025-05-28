"use client";

import { PageLayout } from '@/components/layouts/page-layout';
import { ROUTES } from '@/lib/constants';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button'; 
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';

// Dynamically import ProfileContent, ensuring it's only rendered on the client-side
const ProfileContent = dynamic(
  () => import('@/components/profile/profile-content'), 
  {
    ssr: false,
    loading: () => <div className="text-center py-12"><p className="text-muted-foreground">Loading your profile...</p></div>,
  }
);

// Main page component
export default function ProfilePage() {
  return (
    <PageLayout activePage={ROUTES.PROFILE}>
      <div className="container mx-auto py-8 flex-1">
        <h1 className="text-3xl font-bold mb-8">Your Tokens</h1>
        
        {/* ProfileContent will use the loading state during SSR/initial client load */}
        <ProfileContent />
        
        {/* Referral Section - this part does not use useWallet directly */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-6">Referral Program</h2>
          <Card className="p-6 bg-gradient-to-br from-blue-900/30 to-purple-900/30 border border-blue-500/30">
            <div className="text-center py-8">
              <div className="mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h3 className="text-xl font-medium mb-2">Coming Soon</h3>
              <p className="text-blue-200/80 mb-6">I'm still reading docs and building</p>
              <Button variant="outline" className="border-blue-500/50 text-blue-300 hover:bg-blue-500/20" disabled>
                Stay Tuned
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
}
