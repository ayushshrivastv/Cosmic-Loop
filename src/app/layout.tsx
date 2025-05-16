import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ClientProvider from "@/components/providers/client-provider";
import { SidebarNav } from '@/components/ui/Webstyles/sidebar-nav';
import { SmartWalletButton } from '@/components/wallet/smart-wallet-button';
import { SimplifiedFooter } from '@/components/ui/Webstyles/simplified-footer';
import { APP_NAME, APP_DESCRIPTION, ROUTES } from '@/lib/constants';
import ChatPopup from "@/components/shared/chat-popup";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: APP_NAME,
  description: APP_DESCRIPTION,
};

// Define navigation items for the sidebar
const navItems = [
  { label: 'Home', href: ROUTES.HOME },
  { label: 'Dashboard', href: ROUTES.DASHBOARD },
  { label: 'Create Event', href: ROUTES.MINT },
  { label: 'Claim Token', href: ROUTES.CLAIM },
  { label: 'Cross Chain', href: ROUTES.CROSS_CHAIN },
  { label: 'OpenAPI', href: ROUTES.OPENAPI, external: false },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>{/* Added suppressHydrationWarning for next-themes */}
      <body className={`${inter.className} flex flex-col min-h-screen bg-black text-white`}>
        <ClientProvider>
          {/* Top right wallet button - visible on all pages */}
          <div className="fixed top-4 right-4 z-50">
            <SmartWalletButton />
          </div>
          
          {/* Sidebar navigation - visible on all pages */}
          <SidebarNav navItems={navItems} />
          
          {/* Main content with padding for sidebar */}
          <main className="flex-grow md:pl-[180px] pt-16 md:pt-6 px-4 md:px-8 max-w-screen-xl mx-auto">
            {children}
          </main>
          
          {/* Footer with padding for sidebar */}
          <SimplifiedFooter className="md:pl-[180px]" />
          
          <ChatPopup />
        </ClientProvider>
      </body>
    </html>
  );
}
