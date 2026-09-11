'use client';

import { useEffect, useState } from 'react';
import { API_URL } from '@/src/lib/api';

type Cliente = {
  id: number;
  nome: string;
  documento?: string | null;
  telefone?: string | null;
  observacoes?: string | null;
  ativo: boolean;
};

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [busca, setBusca] = useState('');

  useEffect(() => {
    carregarClientes();
  }, []);

  async function carregarClientes() {
    try {
      setErro('');

      const token = localStorage.getItem('token');

      if (!token) {
        window.location.href = '/';
        return;
      }

      const resposta = await fetch(
        `${API_URL}/clientes`,
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

      setClientes(dados);
    } catch {
      setErro(
        'Não foi possível carregar os clientes.',
      );
    } finally {
      setCarregando(false);
    }
  }

  async function inativarCliente(id: number) {
    const confirmar = window.confirm(
      'Deseja realmente inativar este cliente?',
    );

    if (!confirmar) {
      return;
    }

    try {
      const token = localStorage.getItem('token');

      if (!token) {
        window.location.href = '/';
        return;
      }

      const resposta = await fetch(
        `${API_URL}/clientes/${id}/inativar`,
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

      await carregarClientes();
    } catch {
      setErro(
        'Não foi possível inativar o cliente.',
      );
    }
  }

  const clientesFiltrados = clientes.filter(
    (cliente) =>
      cliente.nome
        .toLowerCase()
        .includes(busca.toLowerCase()) ||
      cliente.documento
        ?.toLowerCase()
        .includes(busca.toLowerCase()),
  );

  return (
    <main className="min-h-screen bg-zinc-100">
      <header className="app-header">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div>
            <h1 className="text-xl font-bold text-zinc-900">
              Clientes
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
              Cadastro de clientes
            </h2>

            <p className="mt-1 text-sm text-zinc-500">
              Consulte, edite e inative clientes.
            </p>
          </div>

          <button
            onClick={() => {
              window.location.href =
                '/clientes/novo';
            }}
            className="btn-primary w-full px-5 py-3 sm:w-auto"
          >
            + Novo cliente
          </button>
        </div>

        <div className="mb-5">
          <input
            value={busca}
            onChange={(e) =>
              setBusca(e.target.value)
            }
            placeholder="Buscar cliente..."
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
        ) : clientesFiltrados.length === 0 ? (
          <div className="rounded-2xl bg-white p-8 text-center text-zinc-500">
            Nenhum cliente encontrado.
          </div>
        ) : (
          <div className="space-y-3">
            {clientesFiltrados.map((cliente) => (
              <div
                key={cliente.id}
                className="app-card p-5"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold text-zinc-900">
                        {cliente.nome}
                      </h3>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          cliente.ativo
                            ? 'bg-green-100 text-green-700'
                            : 'bg-zinc-200 text-zinc-600'
                        }`}
                      >
                        {cliente.ativo
                          ? 'Ativo'
                          : 'Inativo'}
                      </span>
                    </div>

                    {cliente.documento && (
                      <p className="mt-2 text-sm text-zinc-500">
                        Documento:{' '}
                        {cliente.documento}
                      </p>
                    )}

                    {cliente.telefone && (
                      <p className="mt-1 text-sm text-zinc-500">
                        Telefone:{' '}
                        {cliente.telefone}
                      </p>
                    )}

                    {cliente.observacoes && (
                      <p className="mt-3 text-sm text-zinc-500">
                        {cliente.observacoes}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        window.location.href =
                          `/clientes/${cliente.id}/editar`;
                      }}
                      className="rounded-xl border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700"
                    >
                      Editar
                    </button>

                    {cliente.ativo && (
                      <button
                        onClick={() =>
                          inativarCliente(
                            cliente.id,
                          )
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