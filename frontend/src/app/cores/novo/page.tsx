'use client';

import { API_URL } from '@/src/lib/api';

import { useState } from 'react';

export default function NovaCorPage() {
  const [nome, setNome] = useState('');
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);

  async function salvar(
    e: React.FormEvent,
  ) {
    e.preventDefault();

    try {
      setSalvando(true);
      setErro('');

      const token = localStorage.getItem('token');

      if (!token) {
        window.location.href = '/';
        return;
      }

      const resposta = await fetch(
        `${API_URL}/cores`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            nome,
          }),
        },
      );

      if (resposta.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');

        window.location.href = '/';
        return;
      }

      if (!resposta.ok) {
        const dados = await resposta.json();

        setErro(
          dados.message ||
            'Erro ao cadastrar cor',
        );

        return;
      }

      window.location.href = '/cores';
    } catch {
      setErro(
        'Não foi possí­vel salvar a cor.',
      );
    } finally {
      setSalvando(false);
    }
  }

  return (
    <main className="min-h-screen bg-zinc-100">
      <header className="app-header">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
          <div>
            <h1 className="text-xl font-bold text-zinc-900">
              Nova cor
            </h1>

            <p className="text-xs text-zinc-500">
              Pré-Frezado Frederico
            </p>
          </div>

          <button
            onClick={() => {
              window.location.href = '/cores';
            }}
            className="btn-voltar"
          >
            Voltar
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-4 py-6">
        <form
          onSubmit={salvar}
          className="rounded-2xl bg-white p-5 shadow-sm sm:p-8"
        >
          <div>
            <label
              htmlFor="nome"
              className="mb-2 block text-sm font-medium text-zinc-700"
            >
              Nome da cor *
            </label>

            <input
              id="nome"
              value={nome}
              onChange={(e) =>
                setNome(e.target.value)
              }
              placeholder="Ex.: Preto"
              className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-zinc-900 outline-none focus:border-zinc-900 focus:ring-2 focus:ring-zinc-200"
              required
            />
          </div>

          {erro && (
            <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {erro}
            </div>
          )}

          <button
            type="submit"
            disabled={salvando}
            className="mt-6 w-full rounded-xl bg-zinc-900 px-5 py-3 font-semibold text-white disabled:opacity-60"
          >
            {salvando
              ? 'Salvando...'
              : 'Salvar cor'}
          </button>
        </form>
      </div>
    </main>
  );
}
