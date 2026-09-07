import './globals.css';
import type { ReactNode } from 'react';

export const metadata = {
  title: 'Universal AI — Agent Platform',
  description: 'Платформа персональных ИИ-агентов для Telegram',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return <html lang="ru"><body>{children}</body></html>;
}
