import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Risk Lite — World Domination Strategy',
  description:
    'A fast-paced neon strategy game of world domination. Conquer territories, build armies, and crush your AI opponents.',
  keywords: ['risk', 'strategy game', 'board game', 'world domination', 'next.js game'],
  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased bg-[#030712] text-white overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
