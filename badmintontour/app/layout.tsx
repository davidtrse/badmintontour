import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'Giải Cầu Lông',
    description: 'Quản lý giải đấu cầu lông',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="vi">
            <body className={inter.className}>
                <main className="min-h-screen bg-gray-50">
                    {children}
                </main>
            </body>
        </html>
    );
} 