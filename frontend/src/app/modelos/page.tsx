'use client';

import { API_URL } from '@/src/lib/api';

import { useEffect, useState } from 'react';

type Modelo = {
  id: number;
  nome: string;
  referencia?: string | null;
  ativo: boolean;
};

export default function ModelosPage() {
  const [modelos, setModelos] = useState<Modelo[]>([]);
  const [busca, setBusca] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    carregarModelos();
  }, []);

  async function carregarModelos() {
    try {
      setErro('');

      const token = localStorage.getItem('token');

      if (!token) {
        window.location.href = '/';
        return;
      }

      const resposta = await fetch(
        `${API_URL}/modelos`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!resposta.ok) {
        throw new Error();
      }

      const dados = await resposta.json();
      setModelos(dados);
    } catch {
      setErro('Não foi possí­vel carregar os modelos.');
    } finally {
      setCarregando(false);
    }
  }

  async function inativarModelo(id: number) {
    const confirmar = window.confirm(
      'Deseja realmente inativar este modelo?',
    );

    if (!confirmar) {
      return;
    }

    try {
      const token = localStorage.getItem('token');

      const resposta = await fetch(
        `${API_URL}/modelos/${id}/inativar`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!resposta.ok) {
        throw new Error();
      }

      await carregarModelos();
    } catch {
      setErro('Não foi possí­vel inativar o modelo.');
    }
  }

  const modelosFiltrados = modelos.filter((modelo) => {
    const buscaLower = busca.toLowerCase();

    return (
      modelo.nome
        .toLowerCase()
        .includes(buscaLower) ||
      modelo.referencia
        ?.toLowerCase()
        .includes(buscaLower)
    );
  });

  return (
    <main className="min-h-screen bg-zinc-100">
      <header className="app-header">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div>
            <h1 className="text-xl font-bold text-zinc-900">
              Modelos
            </h1>

            <p className="text-xs text-zinc-500">
              Pré-Frezado Frederico
            </p>
          </div>

          <button
            onClick={() => {
              window.location.href = '/dashboard';
            }}
            className="btn-voltar"
          >
            Voltar
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-6">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-zinc-900">
              Cadastro de modelos
            </h2>

            <p className="mt-1 text-sm text-zinc-500">
              Consulte, edite e inative modelos.
            </p>
          </div>

          <button
            onClick={() => {
              window.location.href = '/modelos/novo';
            }}
            className="btn-primary w-full px-5 py-3 sm:w-auto"
          >
            + Novo modelo
          </button>
        </div>

        <div className="mb-5">
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar modelo ou referência..."
            className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 outline-none sm:max-w-md"
          />
        </div>

        {erro && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {erro}
          </div>
        )}

        {carregando ? (
          <div className="rounded-2xl bg-white p-6">
            Carregando...
          </div>
        ) : modelosFiltrados.length === 0 ? (
          <div className="rounded-2xl bg-white p-8 text-center text-zinc-500">
            Nenhum modelo encontrado.
          </div>
        ) : (
          <div className="space-y-3">
            {modelosFiltrados.map((modelo) => (
              <div
                key={modelo.id}
                className="app-card p-5"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold text-zinc-900">
                        {modelo.nome}
                      </h3>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          modelo.ativo
                            ? 'bg-green-100 text-green-700'
                            : 'bg-zinc-200 text-zinc-600'
                        }`}
                      >
                        {modelo.ativo
                          ? 'Ativo'
                          : 'Inativo'}
                      </span>
                    </div>

                    {modelo.referencia && (
                      <p className="mt-2 text-sm text-zinc-500">
                        Referência: {modelo.referencia}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        window.location.href =
                          `/modelos/${modelo.id}/editar`;
                      }}
                      className="rounded-xl border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700"
                    >
                      Editar
                    </button>

                    {modelo.ativo && (
                      <button
                        onClick={() =>
                          inativarModelo(modelo.id)
                        }
                        className="rounded-xl bg-red-50 px-4 py-2 text-sm font-medium text-red-700"
                      >
                        Inativar
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
