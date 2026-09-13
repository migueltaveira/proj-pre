import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Pré-Frezado Frederico | Produção',
  description: 'Gestão de clientes, cadastros e fichas de produção.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="pt-BR"><body>{children}</body></html>;
}
