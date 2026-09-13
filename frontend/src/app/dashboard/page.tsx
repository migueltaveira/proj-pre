'use client';

import { formatarOP, nomeStatus, classeStatus } from '@/src/lib/pedidos';

import { useLoadData } from '@/src/hooks/use-load-data';

import { useRouter } from 'next/navigation';

import { AppHeader } from '@/src/components/app-header';

import { useCallback, useState } from 'react';
import { API_URL } from '@/src/lib/api';

type Usuario = {
  id: number;
  nome: string;
  usuario: string;
  perfil: string;
};

type PedidoResumo = {
  id: number;
  numeroOP: number;
  status: 'EM_PRODUCAO' | 'CONCLUIDO' | 'CANCELADO';

  cliente: {
    nome: string;
  };

  modelo: {
    nome: string;
  };
};

type Resumo = {
  total: number;
  emProducao: number;
  concluidos: number;
  cancelados: number;
  ultimosPedidos: PedidoResumo[];
};

export default function Dashboard() {
  const router = useRouter();
  const [usuario, setUsuario] =
    useState<Usuario | null>(null);

  const [resumo, setResumo] =
    useState<Resumo | null>(null);

  const [carregando, setCarregando] =
    useState(true);

  const [erro, setErro] = useState('');

  const carregarDashboard = useCallback(async () => {
    try {
      setErro('');

      const token = localStorage.getItem('token');
      const usuarioSalvo =
        localStorage.getItem('usuario');

      if (!token || !usuarioSalvo) {
        router.push('/');
        return;
      }

      try {
        setUsuario(
          JSON.parse(usuarioSalvo),
        );
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');

        router.push('/');
        return;
      }

      const resposta = await fetch(
        `${API_URL}/pedidos/resumo/dashboard`,        
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
        throw new Error(
          'Erro ao carregar resumo',
        );
      }

      const dados = await resposta.json();

      setResumo(dados);
    } catch (erro) {
      console.error(erro);

      setErro(
        'Não foi possível carregar o dashboard.',
      );
    } finally {
      setCarregando(false);
    }
  }, [router]);

  useLoadData(carregarDashboard);

  if (carregando) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-100">
        <p className="text-zinc-500">
          Carregando dashboard...
        </p>
      </main>
    );
  }

  return (
    <main className="app-page">

      <AppHeader title="Pré-Frezado Frederico" />
      <div id="conteudo" tabIndex={-1} className="mx-auto max-w-6xl px-4 py-6">

        <section className="mb-6">
          <h2 className="text-2xl font-bold text-zinc-900">
            Olá, {usuario?.nome}
          </h2>

          <p className="mt-1 text-sm text-zinc-500">
            Acompanhe a produção e acesse os cadastros.
          </p>
        </section>

        {erro && (
          <div role="alert" className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {erro}
          </div>
        )}

        <section>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">

            <div className="app-card p-5">
              <p className="text-sm text-zinc-500">
                Total de fichas
              </p>

              <p className="mt-2 text-3xl font-bold text-zinc-900">
                {resumo?.total ?? 0}
              </p>
            </div>

            <div className="app-card p-5">
              <p className="text-sm text-zinc-500">
                Em produção
              </p>

              <p className="mt-2 text-3xl font-bold text-amber-600">
                {resumo?.emProducao ?? 0}
              </p>
            </div>

            <div className="app-card p-5">
              <p className="text-sm text-zinc-500">
                Concluídas
              </p>

              <p className="mt-2 text-3xl font-bold text-green-600">
                {resumo?.concluidos ?? 0}
              </p>
            </div>

            <div className="app-card p-5">
              <p className="text-sm text-zinc-500">
                Canceladas
              </p>

              <p className="mt-2 text-3xl font-bold text-red-600">
                {resumo?.cancelados ?? 0}
              </p>
            </div>

          </div>
        </section>

        <section className="mt-8">
          <h3 className="mb-4 text-lg font-semibold text-zinc-900">
            Produção
          </h3>

          <div className="grid gap-3 sm:grid-cols-2">

            <button
              onClick={() => {
                router.push('/pedidos/novo');
              }}
              className="app-card production-action p-5 text-left transition"
            >
              <p className="text-sm text-zinc-300">
                Produção
              </p>

              <h4 className="mt-1 text-xl font-semibold">
                + Nova ficha
              </h4>

              <p className="mt-2 text-sm text-zinc-300">
                Criar uma nova ordem de produção.
              </p>
            </button>

            <button
              onClick={() => {
                router.push('/pedidos');
              }}
              className="app-card p-5 text-left  transition"
            >
              <p className="text-sm text-zinc-500">
                Produção
              </p>

              <h4 className="mt-1 text-xl font-semibold text-zinc-900">
                Pedidos / Fichas
              </h4>

              <p className="mt-2 text-sm text-zinc-500">
                Consultar e acompanhar as OPs.
              </p>
            </button>

          </div>
        </section>

        <section className="mt-8">
          <h3 className="mb-4 text-lg font-semibold text-zinc-900">
            Cadastros
          </h3>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">

            <button
              onClick={() => {
                router.push('/clientes');
              }}
              className="app-card p-5 text-left  transition"
            >
              <p className="text-sm text-zinc-500">
                Cadastro
              </p>

              <h4 className="mt-1 text-lg font-semibold text-zinc-900">
                Clientes
              </h4>
            </button>

            <button
              onClick={() => {
                router.push('/modelos');
              }}
              className="app-card p-5 text-left  transition"
            >
              <p className="text-sm text-zinc-500">
                Cadastro
              </p>

              <h4 className="mt-1 text-lg font-semibold text-zinc-900">
                Modelos
              </h4>
            </button>

            <button
              onClick={() => {
                router.push('/materiais');
              }}
              className="app-card p-5 text-left  transition"
            >
              <p className="text-sm text-zinc-500">
                Cadastro
              </p>

              <h4 className="mt-1 text-lg font-semibold text-zinc-900">
                Materiais
              </h4>
            </button>

            <button
              onClick={() => {
                router.push('/cores');
              }}
              className="app-card p-5 text-left  transition"
            >
              <p className="text-sm text-zinc-500">
                Cadastro
              </p>

              <h4 className="mt-1 text-lg font-semibold text-zinc-900">
                Cores
              </h4>
            </button>

          </div>
        </section>

        <section className="mt-8">

          <div className="mb-4 flex items-center justify-between">

            <div>
              <h3 className="text-lg font-semibold text-zinc-900">
                Últimas fichas
              </h3>

              <p className="mt-1 text-sm text-zinc-500">
                Últimas ordens de produção cadastradas.
              </p>
            </div>

            <button
              onClick={() => {
                router.push('/pedidos');
              }}
              className="text-sm font-medium text-zinc-600 transition hover:text-zinc-900"
            >
              Ver todas
            </button>

          </div>

          {!resumo ||
          resumo.ultimosPedidos.length === 0 ? (
            <div className="app-card p-8 text-center text-sm text-zinc-500">
              Nenhuma ficha cadastrada.
            </div>
          ) : (
            <div className="space-y-3">

              {resumo.ultimosPedidos.map(
                (pedido) => (
                  <button
                    key={pedido.id}
                    onClick={() => {
                      router.push(`/pedidos/${pedido.id}`);
                    }}
                    className="app-card flex w-full items-center justify-between gap-4   p-4 text-left  transition"
                  >
                    <div>
                      <p className="text-xs font-medium text-zinc-500">
                        OP
                      </p>

                      <p className="text-lg font-bold text-zinc-900">
                        {formatarOP(
                          pedido.numeroOP,
                        )}
                      </p>

                      <p className="mt-1 text-sm text-zinc-500">
                        {pedido.cliente.nome}
                        {' • '}
                        {pedido.modelo.nome}
                      </p>
                    </div>

                    <span
                      className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${classeStatus(
                        pedido.status,
                      )}`}
                    >
                      {nomeStatus(
                        pedido.status,
                      )}
                    </span>

                  </button>
                ),
              )}

            </div>
          )}

        </section>

      </div>
    </main>
  );
}
