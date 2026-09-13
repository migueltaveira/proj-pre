'use client';

import { useLoadData } from '@/src/hooks/use-load-data';

import { useRouter } from 'next/navigation';

import { AppHeader } from '@/src/components/app-header';

import { API_URL } from '@/src/lib/api';

import { useCallback, useState } from 'react';

type Modelo = {
  id: number;
  nome: string;
  referencia?: string | null;
  ativo: boolean;
};

export default function ModelosPage() {
  const router = useRouter();
  const [modelos, setModelos] = useState<Modelo[]>([]);
  const [busca, setBusca] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  const carregarModelos = useCallback(async () => {
    try {
      setErro('');

      const token = localStorage.getItem('token');

      if (!token) {
        router.push('/');
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
      setErro('Não foi possível carregar os modelos.');
    } finally {
      setCarregando(false);
    }
  }, [router]);

  useLoadData(carregarModelos);

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
      setErro('Não foi possível inativar o modelo.');
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
    <main className="app-page">
      <AppHeader title="Modelos" backHref="/dashboard" />

      <div id="conteudo" tabIndex={-1} className="mx-auto max-w-6xl px-4 py-6">
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
              router.push('/modelos/novo');
            }}
            className="btn-primary w-full px-5 py-3 sm:w-auto"
          >
            + Novo modelo
          </button>
        </div>

        <div className="mb-5">
          <input
            aria-label="Buscar registros" value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar modelo ou referência..."
            className="app-input sm:max-w-md"
          />
        </div>

        {erro && (
          <div role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {erro}
          </div>
        )}

        {carregando ? (
          <div className="app-card p-6">
            Carregando...
          </div>
        ) : modelosFiltrados.length === 0 ? (
          <div className="app-card p-8 text-center text-zinc-500">
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
                        router.push(`/modelos/${modelo.id}/editar`);
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
