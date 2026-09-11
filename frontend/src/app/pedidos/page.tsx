'use client';

import { API_URL } from '@/src/lib/api';

import { useEffect, useState } from 'react';

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
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    carregarPedidos();
  }, []);

  async function carregarPedidos() {
    try {
      setErro('');

      const token = localStorage.getItem('token');

      if (!token) {
        window.location.href = '/';
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

        window.location.href = '/';
        return;
      }

      if (!resposta.ok) {
        throw new Error();
      }

      const dados = await resposta.json();

      setPedidos(dados);
    } catch {
      setErro(
        'NÃ£o foi possÃ­vel carregar os pedidos.',
      );
    } finally {
      setCarregando(false);
    }
  }

  function formatarOP(numero: number) {
    return String(numero).padStart(6, '0');
  }

  function nomeStatus(status: Pedido['status']) {
    if (status === 'EM_PRODUCAO') {
      return 'Em produÃ§Ã£o';
    }

    if (status === 'CONCLUIDO') {
      return 'ConcluÃ­do';
    }

    return 'Cancelado';
  }

  function classeStatus(status: Pedido['status']) {
    if (status === 'EM_PRODUCAO') {
      return 'bg-amber-100 text-amber-700';
    }

    if (status === 'CONCLUIDO') {
      return 'bg-green-100 text-green-700';
    }

    return 'bg-red-100 text-red-700';
  }

  return (
    <main className="min-h-screen bg-zinc-100">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div>
            <h1 className="text-xl font-bold text-zinc-900">
              Pedidos
            </h1>

            <p className="text-xs text-zinc-500">
              PrÃ©-Frezado Frederico
            </p>
          </div>

          <button
            onClick={() => {
              window.location.href = '/dashboard';
            }}
            className="rounded-xl border border-zinc-300 px-4 py-2 text-sm"
          >
            Voltar
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-6">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-zinc-900">
              Fichas de produÃ§Ã£o
            </h2>

            <p className="mt-1 text-sm text-zinc-500">
              Consulte e acompanhe as OPs.
            </p>
          </div>

          <button
            onClick={() => {
              window.location.href = '/pedidos/novo';
            }}
            className="w-full rounded-xl bg-zinc-900 px-5 py-3 font-semibold text-white sm:w-auto"
          >
            + Nova ficha
          </button>
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
        ) : pedidos.length === 0 ? (
          <div className="rounded-2xl bg-white p-8 text-center text-zinc-500">
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
                    window.location.href =
                      `/pedidos/${pedido.id}`;
                  }}
                  className="w-full rounded-2xl bg-white p-5 text-left shadow-sm transition hover:shadow-md"
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
