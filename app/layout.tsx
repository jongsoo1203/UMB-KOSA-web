import type { Metadata, Viewport } from 'next';
import { Noto_Sans_KR } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'UMB | KOSA',
  description: 'Hello, KOSA!',
};

export const viewport: Viewport = {
  themeColor: '#FAF6F5',
};

const notoSansKR = Noto_Sans_KR({
  subsets: ['latin'],
  weight: ['100', '300', '400', '500', '700', '900'],
  display: 'swap',
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={notoSansKR.className}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
