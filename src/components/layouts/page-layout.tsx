import type { FC, ReactNode } from 'react';
import { Header } from '@/components/shared/header';
import { Footer } from '@/components/shared/footer';
import { ROUTES } from '@/lib/constants';

interface PageLayoutProps {
  children: ReactNode;
  activePage?: string;
}

export const PageLayout: FC<PageLayoutProps> = ({
  children,
  activePage
}) => {
  return (
    <main className="min-h-screen flex flex-col">
      <Header activePage={activePage} />

      <div className="flex-1">
        {children}
      </div>

      <Footer />
    </main>
  );
};
