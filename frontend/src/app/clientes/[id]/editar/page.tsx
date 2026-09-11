'use client';

import {
  useEffect,
  useState,
} from 'react';
import { API_URL } from '@/src/lib/api';

import { useParams } from 'next/navigation';

export default function EditarClientePage() {
  const params = useParams();
  const id = params.id as string;

  const [nome, setNome] = useState('');
  const [documento, setDocumento] =
    useState('');
  const [telefone, setTelefone] =
    useState('');
  const [observacoes, setObservacoes] =
    useState('');
  const [ativo, setAtivo] =
    useState(true);

  const [carregando, setCarregando] =
    useState(true);

  const [salvando, setSalvando] =
    useState(false);

  const [erro, setErro] = useState('');

  useEffect(() => {
    carregarCliente();
  }, []);

  async function carregarCliente() {
    try {
      const token = localStorage.getItem('token');

      if (!token) {
        window.location.href = '/';
        return;
      }

      const resposta = await fetch(
        `${API_URL}/clientes/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!resposta.ok) {
        throw new Error();
      }

      const cliente = await resposta.json();

      setNome(cliente.nome || '');
      setDocumento(cliente.documento || '');
      setTelefone(cliente.telefone || '');
      setObservacoes(
        cliente.observacoes || '',
      );
      setAtivo(cliente.ativo);
    } catch {
      setErro(
        'Não foi possível carregar o cliente.',
      );
    } finally {
      setCarregando(false);
    }
  }

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
        `${API_URL}/clientes/${id}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type':
              'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            nome,
            documento:
              documento || undefined,
            telefone:
              telefone || undefined,
            observacoes:
              observacoes || undefined,
            ativo,
          }),
        },
      );

      const dados = await resposta.json();

      if (!resposta.ok) {
        setErro(
          dados.message ||
            'Erro ao atualizar cliente.',
        );

        return;
      }

      window.location.href = '/clientes';
    } catch {
      setErro(
        'Não foi possível atualizar o cliente.',
      );
    } finally {
      setSalvando(false);
    }
  }

  if (carregando) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-100">
        Carregando...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-100">

      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
          <div>
            <h1 className="text-xl font-bold text-zinc-900">
              Editar cliente
            </h1>

            <p className="text-xs text-zinc-500">
              Pré-Frezado Frederico
            </p>
          </div>

          <button
            onClick={() => {
              window.location.href =
                '/clientes';
            }}
            className="rounded-xl border border-zinc-300 px-4 py-2 text-sm"
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
              <label className="mb-2 block text-sm font-medium text-zinc-700">
                Nome *
              </label>

              <input
                value={nome}
                onChange={(e) =>
                  setNome(e.target.value)
                }
                required
                className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-zinc-900 outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-700">
                Documento
              </label>

              <input
                value={documento}
                onChange={(e) =>
                  setDocumento(
                    e.target.value,
                  )
                }
                className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-zinc-900 outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-700">
                Telefone
              </label>

              <input
                value={telefone}
                onChange={(e) =>
                  setTelefone(
                    e.target.value,
                  )
                }
                className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-zinc-900 outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-700">
                Observações
              </label>

              <textarea
                value={observacoes}
                onChange={(e) =>
                  setObservacoes(
                    e.target.value,
                  )
                }
                rows={4}
                className="w-full resize-none rounded-xl border border-zinc-300 px-4 py-3 text-zinc-900 outline-none"
              />
            </div>

            <div className="flex items-center gap-3 rounded-xl bg-zinc-50 p-4">

              <input
                id="ativo"
                type="checkbox"
                checked={ativo}
                onChange={(e) =>
                  setAtivo(
                    e.target.checked,
                  )
                }
                className="h-5 w-5"
              />

              <label
                htmlFor="ativo"
                className="font-medium text-zinc-700"
              >
                Cliente ativo
              </label>

            </div>

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
              : 'Salvar alterações'}
          </button>

        </form>

      </div>
    </main>
  );
}