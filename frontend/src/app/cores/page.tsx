'use client';

import { useLoadData } from '@/src/hooks/use-load-data';

import { useRouter } from 'next/navigation';

import { AppHeader } from '@/src/components/app-header';

import { API_URL } from '@/src/lib/api';

import { useCallback, useState } from 'react';

type Cor = {
  id: number;
  nome: string;
  ativo: boolean;
};

export default function CoresPage() {
  const router = useRouter();
  const [cores, setCores] = useState<Cor[]>([]);
  const [busca, setBusca] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  const carregarCores = useCallback(async () => {
    try {
      setErro('');

      const token = localStorage.getItem('token');

      if (!token) {
        router.push('/');
        return;
      }

      const resposta = await fetch(
        `${API_URL}/cores`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (resposta.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
        router.push('/');
        return;
      }

      if (!resposta.ok) {
        throw new Error();
      }

      const dados = await resposta.json();

      setCores(dados);
    } catch {
      setErro('Não foi possível carregar as cores.');
    } finally {
      setCarregando(false);
    }
  }, [router]);

  useLoadData(carregarCores);

  async function inativarCor(id: number) {
    const confirmar = window.confirm(
      'Deseja realmente inativar esta cor?',
    );

    if (!confirmar) {
      return;
    }

    try {
      const token = localStorage.getItem('token');

      if (!token) {
        router.push('/');
        return;
      }

      const resposta = await fetch(
        `${API_URL}/cores/${id}/inativar`,
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

      await carregarCores();
    } catch {
      setErro('Não foi possível inativar a cor.');
    }
  }

  const coresFiltradas = cores.filter((cor) =>
    cor.nome
      .toLowerCase()
      .includes(busca.toLowerCase()),
  );

  return (
    <main className="app-page">
      <AppHeader title="Cores" backHref="/dashboard" />

      <div id="conteudo" tabIndex={-1} className="mx-auto max-w-6xl px-4 py-6">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-zinc-900">
              Cadastro de cores
            </h2>

            <p className="mt-1 text-sm text-zinc-500">
              Consulte, edite e inative cores.
            </p>
          </div>

          <button
            onClick={() => {
              router.push('/cores/novo');
            }}
            className="btn-primary w-full px-5 py-3 sm:w-auto"
          >
            + Nova cor
          </button>
        </div>

        <div className="mb-5">
          <input
            aria-label="Buscar registros" value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar cor..."
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
        ) : coresFiltradas.length === 0 ? (
          <div className="app-card p-8 text-center text-zinc-500">
            Nenhuma cor encontrada.
          </div>
        ) : (
          <div className="space-y-3">
            {coresFiltradas.map((cor) => (
              <div
                key={cor.id}
                className="app-card p-5"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-zinc-900">
                      {cor.nome}
                    </h3>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        cor.ativo
                          ? 'bg-green-100 text-green-700'
                          : 'bg-zinc-200 text-zinc-600'
                      }`}
                    >
                      {cor.ativo ? 'Ativa' : 'Inativa'}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        router.push(`/cores/${cor.id}/editar`);
                      }}
                      className="rounded-xl border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700"
                    >
                      Editar
                    </button>

                    {cor.ativo && (
                      <button
                        onClick={() => inativarCor(cor.id)}
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
