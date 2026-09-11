'use client';

import { useState } from 'react';
import { API_URL } from '@/src/lib/api';

export default function NovoClientePage() {
  const [nome, setNome] = useState('');
  const [documento, setDocumento] = useState('');
  const [telefone, setTelefone] = useState('');
  const [observacoes, setObservacoes] = useState('');

  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');

  async function salvar(e: React.FormEvent) {
    e.preventDefault();

    try {
      setSalvando(true);
      setErro('');

      const token = localStorage.getItem('token');

      if (!token) {
        window.location.href = '/';
        return;
      }

      const resposta = await fetch(`${API_URL}/clientes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nome,
          documento: documento || undefined,
          telefone: telefone || undefined,
          observacoes: observacoes || undefined,
        }),
      });

      if (resposta.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');

        window.location.href = '/';
        return;
      }

      if (!resposta.ok) {
        const dados = await resposta.json();

        setErro(dados.message || 'Erro ao cadastrar cliente');
        return;
      }

      window.location.href = '/clientes';
    } catch (erro) {
      console.error(erro);

      setErro('Não foi possível salvar o cliente.');
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
              Novo cliente
            </h1>

            <p className="text-xs text-zinc-500">
              Pré-Frezado Frederico
            </p>
          </div>

          <button
            onClick={() => {
              window.location.href = '/clientes';
            }}
            className="rounded-xl border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700"
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
          <div className="space-y-5">
            <div>
              <label
                htmlFor="nome"
                className="mb-2 block text-sm font-medium text-zinc-700"
              >
                Nome *
              </label>

              <input
                id="nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Nome do cliente"
                className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-zinc-900 outline-none focus:border-zinc-900 focus:ring-2 focus:ring-zinc-200"
                required
              />
            </div>

            <div>
              <label
                htmlFor="documento"
                className="mb-2 block text-sm font-medium text-zinc-700"
              >
                Documento
              </label>

              <input
                id="documento"
                value={documento}
                onChange={(e) => setDocumento(e.target.value)}
                placeholder="CPF, CNPJ ou outro"
                className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-zinc-900 outline-none focus:border-zinc-900 focus:ring-2 focus:ring-zinc-200"
              />
            </div>

            <div>
              <label
                htmlFor="telefone"
                className="mb-2 block text-sm font-medium text-zinc-700"
              >
                Telefone
              </label>

              <input
                id="telefone"
                type="tel"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                placeholder="Telefone do cliente"
                className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-zinc-900 outline-none focus:border-zinc-900 focus:ring-2 focus:ring-zinc-200"
              />
            </div>

            <div>
              <label
                htmlFor="observacoes"
                className="mb-2 block text-sm font-medium text-zinc-700"
              >
                Observações
              </label>

              <textarea
                id="observacoes"
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                rows={4}
                placeholder="Informações adicionais"
                className="w-full resize-none rounded-xl border border-zinc-300 px-4 py-3 text-zinc-900 outline-none focus:border-zinc-900 focus:ring-2 focus:ring-zinc-200"
              />
            </div>

            {erro && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {erro}
              </div>
            )}

            <button
              type="submit"
              disabled={salvando}
              className="btn-primary w-full px-5 py-3 transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {salvando ? 'Salvando...' : 'Salvar cliente'}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}