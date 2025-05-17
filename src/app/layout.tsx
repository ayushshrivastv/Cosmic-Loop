import type { Metadata } from "next";
import { Inter, Fredoka } from "next/font/google";
import "./globals.css";
import ClientProvider from "@/components/providers/client-provider";
// import { ThemeToggleButton } from "@/components/ui/theme-toggle-button"; // Removed - now in shared/header
import { APP_NAME, APP_DESCRIPTION } from '@/lib/constants';

const inter = Inter({ subsets: ["latin"] });
const fredoka = Fredoka({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: '--font-fredoka' });

export const metadata: Metadata = {
  title: APP_NAME,
  description: APP_DESCRIPTION,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={fredoka.variable}>{/* Added Fredoka font variable */}
      <body className={`${inter.className} flex flex-col min-h-screen`}>
        <ClientProvider>
          {/* IsolatedWalletProvider removed from here - ClientProvider already handles wallet context via RouteConditionalWalletProvider */}
          <main className="flex-grow">
            {children}
          </main>
        </ClientProvider>
      </body>
    </html>
  );
}
