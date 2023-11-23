import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '@rainbow-me/rainbowkit/styles.css';
import './globals.css'
import { NavBar } from '@/components';
import { RainbowProviders } from '@/providers/RainbowProviders';
import { GlobalStatesProvider } from '@/providers/GlobalStatesProvider';
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Bet 24/7',
  description: 'A Web3 Raffle Game',
  icons: {
    icon: '/favicon.ico',
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className='scroll-smooth'>
      <body className={inter.className}>
        <GlobalStatesProvider>
          <main className="bg-[#091B1B] min-h-screen w-screen">
            <RainbowProviders>
              <Toaster
                position="top-center"
                toastOptions={{
                  style: {
                    overflowWrap: "break-word",
                    wordWrap: "break-word",
                    // wordBreak: "break-all"
                  },
                }}
              />
              <NavBar />
              {children}
            </RainbowProviders>
          </main>
        </GlobalStatesProvider>
      </body>
    </html>
  )
}