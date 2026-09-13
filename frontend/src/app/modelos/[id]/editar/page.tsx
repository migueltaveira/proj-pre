'use client';

import { useLoadData } from '@/src/hooks/use-load-data';

import { useRouter } from 'next/navigation';

import { AppHeader } from '@/src/components/app-header';

import { API_URL } from '@/src/lib/api';

import { useCallback, useState } from 'react';
import { useParams } from 'next/navigation';

export default function EditarModeloPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [nome, setNome] = useState('');
  const [referencia, setReferencia] = useState('');
  const [ativo, setAtivo] = useState(true);

  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');

  const carregarModelo = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');

      if (!token) {
        router.push('/');
        return;
      }

      const resposta = await fetch(
        `${API_URL}/modelos/${id}`,
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

      setNome(dados.nome || '');
      setReferencia(dados.referencia || '');
      setAtivo(dados.ativo);
    } catch {
      setErro('Não foi possível carregar o modelo.');
    } finally {
      setCarregando(false);
    }
  }, [id, router]);

  useLoadData(carregarModelo);

  async function salvar(e: React.FormEvent) {
    e.preventDefault();

    try {
      setSalvando(true);
      setErro('');

      const token = localStorage.getItem('token');

      if (!token) {
        router.push('/');
        return;
      }

      const resposta = await fetch(
        `${API_URL}/modelos/${id}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            nome,
            referencia: referencia || undefined,
            ativo,
          }),
        },
      );

      const dados = await resposta.json();

      if (!resposta.ok) {
        setErro(
          dados.message ||
            'Erro ao atualizar o modelo.',
        );
        return;
      }

      router.push('/modelos');
    } catch {
      setErro(
        'Não foi possível atualizar o modelo.',
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
    <main className="app-page">
      <AppHeader title="Editar modelo" backHref="/modelos" />

      <div id="conteudo" tabIndex={-1} className="mx-auto max-w-3xl px-4 py-6">
        <form
          onSubmit={salvar}
          className="app-card p-5  sm:p-8"
        >
          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-700">
                Nome do modelo *
              </label>

              <input
                value={nome}
                onChange={(e) =>
                  setNome(e.target.value)
                }
                required
                className="app-input"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-700">
                Referência
              </label>

              <input
                value={referencia}
                onChange={(e) =>
                  setReferencia(e.target.value)
                }
                className="app-input"
              />
            </div>

            <div className="flex items-center gap-3 rounded-xl bg-zinc-50 p-4">
              <input
                id="ativo"
                type="checkbox"
                checked={ativo}
                onChange={(e) =>
                  setAtivo(e.target.checked)
                }
                className="h-5 w-5"
              />

              <label
                htmlFor="ativo"
                className="font-medium text-zinc-700"
              >
                Modelo ativo
              </label>
            </div>
          </div>

          {erro && (
            <div role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {erro}
            </div>
          )}

          <button
            type="submit"
            disabled={salvando}
            className="btn-primary mt-6 w-full   px-5 py-3 font-semibold  disabled:opacity-60"
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