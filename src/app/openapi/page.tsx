"use client";

import { AppleLayout } from '@/components/layouts/apple-layout';

export default function OpenAPIPage() {
  return (
    <AppleLayout>
      {/* Content */}
      <div className="container mx-auto pt-32 pb-16 flex-1">
        <h1 className="text-3xl font-bold mb-8">OpenAPI Integration</h1>
        
        <div className="grid grid-cols-1 gap-8">
          {/* Empty middle section */}
          <div className="border border-border rounded-lg p-6 min-h-[400px] flex items-center justify-center">
            <p className="text-muted-foreground text-lg">OpenAPI Integration Coming Soon</p>
          </div>
        </div>
      </div>
    </AppleLayout>
  );
}
