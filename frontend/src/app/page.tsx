'use client';

import { useState } from 'react';
import { API_URL } from '@/src/lib/api';

export default function Home() {
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

      window.location.href = '/dashboard';
    } catch (erro) {
      console.error(erro);

      setErro(
        'Não foi possível conectar ao servidor. Verifique se o backend está rodando.',
      );
    } finally {
      setCarregando(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-100 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-900 text-2xl font-bold text-white shadow-lg">
            PF
          </div>

          <h1 className="mt-4 text-3xl font-bold text-zinc-900">
            Pré-Frezado Frederico
          </h1>

          <p className="mt-2 text-sm text-zinc-500">
            Sistema de fichas de produção
          </p>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-xl sm:p-8">
          <h2 className="text-xl font-semibold text-zinc-900">
            Acessar sistema
          </h2>

          <p className="mt-1 text-sm text-zinc-500">
            Entre com seus dados para continuar
          </p>

          <form onSubmit={entrar} className="mt-6 space-y-5">
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
                className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-zinc-900 outline-none transition focus:border-zinc-900 focus:ring-2 focus:ring-zinc-200"
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
                className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-zinc-900 outline-none transition focus:border-zinc-900 focus:ring-2 focus:ring-zinc-200"
                required
              />
            </div>

            {erro && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {erro}
              </div>
            )}

            <button
              type="submit"
              disabled={carregando}
              className="w-full rounded-xl bg-zinc-900 px-4 py-3 font-semibold text-white transition hover:bg-zinc-800 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {carregando ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-zinc-400">
          Pré-Frezado Frederico • Controle de Produção
        </p>
      </div>
    </main>
  );
}