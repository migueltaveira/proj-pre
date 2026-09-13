'use client';

import { formatarOP, nomeStatus, classeStatus } from '@/src/lib/pedidos';

import { useLoadData } from '@/src/hooks/use-load-data';

import { useRouter } from 'next/navigation';

import { AppHeader } from '@/src/components/app-header';

import { API_URL } from '@/src/lib/api';

import { useCallback, useState } from 'react';

type Pedido = {
  id: number;
  numeroOP: number;
  status: 'EM_PRODUCAO' | 'CONCLUIDO' | 'CANCELADO';
  observacoes?: string | null;
  criadoEm: string;

  cliente: {
    nome: string;
  };

  modelo: {
    nome: string;
    referencia?: string | null;
  };

  material: {
    nome: string;
  };

  cor: {
    nome: string;
  };

  tamanhos: {
    id: number;
    tamanho: number;
    quantidade: number;
  }[];
};

export default function PedidosPage() {
  const router = useRouter();
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  const carregarPedidos = useCallback(async () => {
    try {
      setErro('');

      const token = localStorage.getItem('token');

      if (!token) {
        router.push('/');
        return;
      }

      const resposta = await fetch(
        `${API_URL}/pedidos`,
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

      setPedidos(dados);
    } catch {
      setErro(
        'Não foi possível carregar os pedidos.',
      );
    } finally {
      setCarregando(false);
    }
  }, [router]);

  useLoadData(carregarPedidos);

  return (
    <main className="app-page">
      <AppHeader title="Pedidos" backHref="/dashboard" />

      <div id="conteudo" tabIndex={-1} className="mx-auto max-w-6xl px-4 py-6">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-zinc-900">
              Fichas de produção
            </h2>

            <p className="mt-1 text-sm text-zinc-500">
              Consulte e acompanhe as OPs.
            </p>
          </div>

          <button
            onClick={() => {
              router.push('/pedidos/novo');
            }}
            className="btn-primary w-full px-5 py-3 sm:w-auto"
          >
            + Nova ficha
          </button>
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
        ) : pedidos.length === 0 ? (
          <div className="app-card p-8 text-center text-zinc-500">
            Nenhuma ficha cadastrada.
          </div>
        ) : (
          <div className="space-y-4">
            {pedidos.map((pedido) => {
              const total = pedido.tamanhos.reduce(
                (soma, item) =>
                  soma + item.quantidade,
                0,
              );

              return (
                <button
                  key={pedido.id}
                  onClick={() => {
                    router.push(`/pedidos/${pedido.id}`);
                  }}
                  className="app-card w-full   p-5 text-left  transition"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-medium text-zinc-500">
                        OP
                      </p>

                      <h3 className="text-xl font-bold text-zinc-900">
                        {formatarOP(
                          pedido.numeroOP,
                        )}
                      </h3>
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${classeStatus(
                        pedido.status,
                      )}`}
                    >
                      {nomeStatus(
                        pedido.status,
                      )}
                    </span>
                  </div>

                  <div className="mt-4 grid gap-2 text-sm text-zinc-600 sm:grid-cols-2">
                    <p>
                      <strong>Cliente:</strong>{' '}
                      {pedido.cliente.nome}
                    </p>

                    <p>
                      <strong>Modelo:</strong>{' '}
                      {pedido.modelo.nome}
                    </p>

                    <p>
                      <strong>Material:</strong>{' '}
                      {pedido.material.nome}
                    </p>

                    <p>
                      <strong>Cor:</strong>{' '}
                      {pedido.cor.nome}
                    </p>

                    <p>
                      <strong>Total:</strong>{' '}
                      {total} pares
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
