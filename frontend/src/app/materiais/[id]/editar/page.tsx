'use client';

import { Form } from '@/src/components/form';
import { ErrorMessage } from '@/src/components/error-message';

import { useLoadData } from '@/src/hooks/use-load-data';

import { useRouter } from 'next/navigation';

import { AppHeader } from '@/src/components/app-header';

import { API_URL } from '@/src/lib/api';

import { useCallback, useState } from 'react';
import { useParams } from 'next/navigation';

export default function EditarMaterialPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [nome, setNome] = useState('');
  const [ativo, setAtivo] = useState(true);

  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');

  const carregarMaterial = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');

      if (!token) {
        router.push('/');
        return;
      }

      const resposta = await fetch(
        `${API_URL}/materiais/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!resposta.ok) {
        throw new Error();
      }

      const material = await resposta.json();

      setNome(material.nome || '');
      setAtivo(material.ativo);
    } catch {
      setErro('Não foi possível carregar o material.');
    } finally {
      setCarregando(false);
    }
  }, [id, router]);

  useLoadData(carregarMaterial);

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
        `${API_URL}/materiais/${id}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            nome,
            ativo,
          }),
        },
      );

      const dados = await resposta.json();

      if (!resposta.ok) {
        setErro(
          dados.message ||
            'Erro ao atualizar o material.',
        );
        return;
      }

      router.push('/materiais');
    } catch {
      setErro('Não foi possível atualizar o material.');
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
      <AppHeader title="Editar material" backHref="/materiais" />

      <div id="conteudo" tabIndex={-1} className="mx-auto max-w-3xl px-4 py-6">
        <Form
          onSubmit={salvar}
          className="app-card p-5  sm:p-8"
        >
          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-700">
              Nome do material *
            </label>

            <input
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
              className="app-input"
            />
          </div>

          <div className="mt-5 flex items-center gap-3 rounded-xl bg-zinc-50 p-4">
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
              Material ativo
            </label>
          </div>

          <ErrorMessage message={erro} />

          <button
            type="submit"
            disabled={salvando}
            className="btn-primary mt-6 w-full   px-5 py-3 font-semibold  disabled:opacity-60"
          >
            {salvando
              ? 'Salvando...'
              : 'Salvar alterações'}
          </button>
        </Form>
      </div>
    </main>
  );
}