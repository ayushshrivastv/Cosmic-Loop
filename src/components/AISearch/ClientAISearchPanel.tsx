'use client';

import dynamic from 'next/dynamic';

// Import the AISearchPanel with dynamic loading to prevent SSR issues
const AISearchPanel = dynamic(
  () => import('@/components/AISearch/AISearchPanel'),
  { ssr: false }
);

export default function ClientAISearchPanel() {
  return <AISearchPanel />;
}
