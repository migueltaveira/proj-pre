'use client';

import { Form } from '@/src/components/form';
import { ErrorMessage } from '@/src/components/error-message';

import { useRouter } from 'next/navigation';

import { useState } from 'react';
import { API_URL } from '@/src/lib/api';

export default function Home() {
  const router = useRouter();
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');

  async function entrar(e: React.FormEvent) {
    e.preventDefault();

    setErro('');
    setCarregando(true);

    try {
      const resposta = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          usuario,
          senha,
        }),
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        setErro(dados.message || 'Usuário ou senha inválidos.');
        return;
      }

      localStorage.setItem('token', dados.access_token);
      localStorage.setItem('usuario', JSON.stringify(dados.usuario));

      router.push('/dashboard');
    } catch (erro) {
      console.error(erro);

      setErro(
        'Não foi possível conectar. Tente novamente em alguns instantes.',
      );
    } finally {
      setCarregando(false);
    }
  }

  return (
    <main className="login-page">
      <aside className="login-intro">
        <span className="brand-mark" aria-hidden="true">PF<span>.</span></span>
        <p>Organize suas fichas e acompanhe cada etapa da produção em um só lugar.</p>
        <small>PRÉ-FREZADO FREDERICO · CONTROLE DE PRODUÇÃO</small>
      </aside>
      <section className="login-content" aria-label="Acesso ao sistema">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">

          <h1 className="mt-4 text-3xl font-bold text-zinc-900">
            Pré-Frezado Frederico
          </h1>

          <p className="mt-2 text-sm text-zinc-500">
            Sistema de fichas de produção
          </p>
        </div>

        <div className="app-card p-6  sm:p-8">
          <h2 className="text-xl font-semibold text-zinc-900">
            Acessar sistema
          </h2>

          <p className="mt-1 text-sm text-zinc-500">
            Entre com seus dados para continuar
          </p>

          <Form onSubmit={entrar} className="mt-6 space-y-5">
            <div>
              <label
                htmlFor="usuario"
                className="mb-2 block text-sm font-medium text-zinc-700"
              >
                Usuário
              </label>

              <input
                id="usuario"
                type="text"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                placeholder="Digite seu usuário"
                autoComplete="username"
                className="app-input"
                required
              />
            </div>

            <div>
              <label
                htmlFor="senha"
                className="mb-2 block text-sm font-medium text-zinc-700"
              >
                Senha
              </label>

              <input
                id="senha"
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="Digite sua senha"
                autoComplete="current-password"
                className="app-input"
                required
              />
            </div>

            <ErrorMessage message={erro} />

            <button
              type="submit"
              disabled={carregando}
              className="btn-primary w-full   px-4 py-3 font-semibold  transition  active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {carregando ? 'Entrando...' : 'Entrar'}
            </button>
          </Form>
        </div>

        <p className="mt-6 text-center text-xs text-zinc-400">
          Pré-Frezado Frederico • Controle de Produção
        </p>
      </div>
    </section>
    </main>
  );
}
