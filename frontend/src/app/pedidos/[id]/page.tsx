'use client';

import { API_URL } from '@/src/lib/api';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

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

export default function PedidoDetalhePage() {
  const params = useParams();

  const id = params.id as string;

  const [pedido, setPedido] = useState<Pedido | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [alterandoStatus, setAlterandoStatus] = useState(false);
  const [erro, setErro] = useState('');

  useEffect(() => {
    carregarPedido();
  }, []);

  async function carregarPedido() {
    try {
      setErro('');

      const token = localStorage.getItem('token');

      if (!token) {
        window.location.href = '/';
        return;
      }

      const resposta = await fetch(
        `${API_URL}/pedidos/${id}`,
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

      setPedido(dados);
    } catch {
      setErro('Não foi possível carregar a ficha.');
    } finally {
      setCarregando(false);
    }
  }

  async function alterarStatus(
    status: 'EM_PRODUCAO' | 'CONCLUIDO' | 'CANCELADO',
  ) {
    try {
      setAlterandoStatus(true);
      setErro('');

      const token = localStorage.getItem('token');

      if (!token) {
        window.location.href = '/';
        return;
      }

      const resposta = await fetch(
        `${API_URL}/pedidos/${id}/status`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status,
          }),
        },
      );

      const dados = await resposta.json();

      if (!resposta.ok) {
        setErro(
          dados.message || 'Erro ao alterar status.',
        );
        return;
      }

      setPedido(dados);
    } catch {
      setErro('Não foi possível alterar o status.');
    } finally {
      setAlterandoStatus(false);
    }
  }

  function formatarOP(numero: number) {
    return String(numero).padStart(6, '0');
  }

  function nomeStatus(status: Pedido['status']) {
    if (status === 'EM_PRODUCAO') {
      return 'Em produção';
    }

    if (status === 'CONCLUIDO') {
      return 'Concluído';
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

  if (carregando) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-100">
        <p className="text-zinc-500">
          Carregando ficha...
        </p>
      </main>
    );
  }

  if (!pedido) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-100 px-4">
        <div className="text-center">
          <p className="text-zinc-700">
            {erro || 'Ficha não encontrada.'}
          </p>

          <button
            onClick={() => {
              window.location.href = '/pedidos';
            }}
            className="mt-4 rounded-xl bg-zinc-900 px-5 py-3 text-white"
          >
            Voltar
          </button>
        </div>
      </main>
    );
  }

  const totalPares = pedido.tamanhos.reduce(
    (soma, item) => soma + item.quantidade,
    0,
  );

  return (
    <main className="min-h-screen bg-zinc-100">
      <header className="app-header">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <div>
            <p className="text-xs text-zinc-500">
              Ficha de Produção
            </p>

            <h1 className="text-xl font-bold text-zinc-900">
              OP {formatarOP(pedido.numeroOP)}
            </h1>
          </div>

          <button
            onClick={() => {
              window.location.href = '/pedidos';
            }}
            className="rounded-xl border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100"
          >
            Voltar
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-5xl space-y-6 px-4 py-6">

        {erro && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {erro}
          </div>
        )}

        <section className="rounded-2xl bg-white p-5 shadow-sm sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

            <div>
              <p className="text-sm text-zinc-500">
                Ordem de Produção
              </p>

              <h2 className="mt-1 text-3xl font-bold text-zinc-900">
                {formatarOP(pedido.numeroOP)}
              </h2>
            </div>

            <span
              className={`w-fit rounded-full px-4 py-2 text-sm font-semibold ${classeStatus(
                pedido.status,
              )}`}
            >
              {nomeStatus(pedido.status)}
            </span>
          </div>

          <div className="mt-6 grid gap-5 border-t border-zinc-100 pt-6 sm:grid-cols-2">

            <div>
              <p className="text-xs font-medium uppercase text-zinc-400">
                Cliente
              </p>

              <p className="mt-1 font-semibold text-zinc-900">
                {pedido.cliente.nome}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase text-zinc-400">
                Modelo
              </p>

              <p className="mt-1 font-semibold text-zinc-900">
                {pedido.modelo.nome}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase text-zinc-400">
                Referência
              </p>

              <p className="mt-1 font-semibold text-zinc-900">
                {pedido.modelo.referencia || '-'}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase text-zinc-400">
                Material
              </p>

              <p className="mt-1 font-semibold text-zinc-900">
                {pedido.material.nome}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase text-zinc-400">
                Cor
              </p>

              <p className="mt-1 font-semibold text-zinc-900">
                {pedido.cor.nome}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase text-zinc-400">
                Total
              </p>

              <p className="mt-1 font-semibold text-zinc-900">
                {totalPares} pares
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl bg-white p-5 shadow-sm sm:p-8">

          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-zinc-900">
                Numeração
              </h2>

              <p className="mt-1 text-sm text-zinc-500">
                Tamanhos e quantidades da ficha.
              </p>
            </div>

            <div className="rounded-xl bg-zinc-100 px-4 py-2 text-right">
              <p className="text-xs text-zinc-500">
                Total
              </p>

              <p className="font-bold text-zinc-900">
                {totalPares} pares
              </p>
            </div>
          </div>

          <div className="mt-5 overflow-x-auto">

            <div className="flex min-w-max gap-3">
              {pedido.tamanhos.map((item) => (
                <div
                  key={item.id}
                  className="w-20 overflow-hidden rounded-xl border border-zinc-200"
                >
                  <div className="bg-zinc-900 py-2 text-center font-bold text-white">
                    {item.tamanho}
                  </div>

                  <div className="py-4 text-center text-xl font-bold text-zinc-900">
                    {item.quantidade}
                  </div>
                </div>
              ))}
            </div>

          </div>
        </section>

        <section className="rounded-2xl bg-white p-5 shadow-sm sm:p-8">

          <h2 className="text-lg font-semibold text-zinc-900">
            Observações
          </h2>

          <p className="mt-3 whitespace-pre-wrap text-sm text-zinc-600">
            {pedido.observacoes ||
              'Nenhuma observação cadastrada.'}
          </p>
        </section>

        <section className="rounded-2xl bg-white p-5 shadow-sm sm:p-8">

          <h2 className="text-lg font-semibold text-zinc-900">
            Ações
          </h2>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">

            <button
              type="button"
              onClick={() => {
                window.location.href =
                  `/pedidos/${pedido.id}/imprimir`;
              }}
              className="rounded-xl bg-zinc-900 px-5 py-3 font-semibold text-white transition hover:bg-zinc-800"
            >
              Imprimir
            </button>

            {pedido.status !== 'CONCLUIDO' && (
              <button
                type="button"
                disabled={alterandoStatus}
                onClick={() =>
                  alterarStatus('CONCLUIDO')
                }
                className="rounded-xl bg-green-600 px-5 py-3 font-semibold text-white transition hover:bg-green-700 disabled:opacity-60"
              >
                {alterandoStatus
                  ? 'Alterando...'
                  : 'Concluir'}
              </button>
            )}

            {pedido.status !== 'CANCELADO' && (
              <button
                type="button"
                disabled={alterandoStatus}
                onClick={() =>
                  alterarStatus('CANCELADO')
                }
                className="rounded-xl bg-red-600 px-5 py-3 font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
              >
                {alterandoStatus
                  ? 'Alterando...'
                  : 'Cancelar'}
              </button>
            )}

            {pedido.status !== 'EM_PRODUCAO' && (
              <button
                type="button"
                disabled={alterandoStatus}
                onClick={() =>
                  alterarStatus('EM_PRODUCAO')
                }
                className="rounded-xl border border-zinc-300 bg-white px-5 py-3 font-semibold text-zinc-700 transition hover:bg-zinc-100 disabled:opacity-60"
              >
                Voltar para produção
              </button>
            )}

          </div>
        </section>

      </div>
    </main>
  );
}