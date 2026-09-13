'use client';

import { useRouter } from 'next/navigation';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navigation = [
  ['/dashboard', 'Visão geral'],
  ['/pedidos', 'Produção'],
  ['/clientes', 'Clientes'],
  ['/modelos', 'Modelos'],
  ['/materiais', 'Materiais'],
  ['/cores', 'Cores'],
] as const;

export function AppHeader({ title, backHref }: { title: string; backHref?: string }) {
  const router = useRouter();
  const pathname = usePathname();

  function sair() {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    router.push('/');
  }

  return (
    <header className="app-header">
      <a className="skip-link" href="#conteudo">Pular para o conteúdo</a>
      <div className="header-content">
        <Link href="/dashboard" className="brand" aria-label="Pré-Frezado Frederico — início">
          <span className="brand-mark" aria-hidden="true">PF<span>.</span></span>
          <span>Pré-Frezado Frederico<small>GESTÃO DE PRODUÇÃO</small></span>
        </Link>
        <button type="button" className="btn-sair" onClick={sair}>Sair da conta ↗</button>
      </div>
      <nav className="app-nav" aria-label="Navegação principal">
        {navigation.map(([href, label]) => (
          <Link key={href} href={href} aria-current={pathname === href || pathname.startsWith(`${href}/`) ? 'page' : undefined}>{label}</Link>
        ))}
      </nav>
      <div className="page-heading">
        <div><p>PAINEL DE CONTROLE</p><h1>{title}</h1></div>
        {backHref && <Link href={backHref} className="btn-voltar">← Voltar</Link>}
      </div>
    </header>
  );
}
