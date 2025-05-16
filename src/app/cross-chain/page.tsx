"use client";

import React from 'react';
import { CrossChainDashboard } from '@/components/cross-chain/dashboard-redirect';

export default function CrossChainPage() {
  return (
    <div>
      <div className="container mx-auto pt-32 pb-16 flex-1">
        <CrossChainDashboard />
      </div>
    </div>
  );
}
