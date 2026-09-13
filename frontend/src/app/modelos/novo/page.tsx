'use client';

import { Form } from '@/src/components/form';
import { ErrorMessage } from '@/src/components/error-message';

import { useRouter } from 'next/navigation';

import { AppHeader } from '@/src/components/app-header';

import { API_URL } from '@/src/lib/api';

import { useState } from 'react';

export default function NovoModeloPage() {
  const router = useRouter();
  const [nome, setNome] = useState('');
  const [referencia, setReferencia] = useState('');
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);

  async function salvar(
    e: React.FormEvent,
  ) {
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
        `${API_URL}/modelos`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            nome,
            referencia:
              referencia || undefined,
          }),
        },
      );

      if (resposta.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');

        router.push('/');
        return;
      }

      if (!resposta.ok) {
        const dados = await resposta.json();

        setErro(
          dados.message ||
            'Erro ao cadastrar modelo',
        );

        return;
      }

      router.push('/modelos');
    } catch {
      setErro(
        'Não foi possível salvar o modelo.',
      );
    } finally {
      setSalvando(false);
    }
  }

  return (
    <main className="app-page">
      <AppHeader title="Novo modelo" backHref="/modelos" />

      <div id="conteudo" tabIndex={-1} className="mx-auto max-w-3xl px-4 py-6">
        <Form
          onSubmit={salvar}
          className="app-card p-5  sm:p-8"
        >
          <div className="space-y-5">
            <div>
              <label
                htmlFor="nome"
                className="mb-2 block text-sm font-medium text-zinc-700"
              >
                Nome do modelo *
              </label>

              <input
                id="nome"
                value={nome}
                onChange={(e) =>
                  setNome(e.target.value)
                }
                placeholder="Ex.: Modelo 350"
                className="app-input"
                required
              />
            </div>

            <div>
              <label
                htmlFor="referencia"
                className="mb-2 block text-sm font-medium text-zinc-700"
              >
                Referência
              </label>

              <input
                id="referencia"
                value={referencia}
                onChange={(e) =>
                  setReferencia(e.target.value)
                }
                placeholder="Ex.: REF-350"
                className="app-input"
              />
            </div>
          </div>

          <ErrorMessage message={erro} />

          <button
            type="submit"
            disabled={salvando}
            className="btn-primary mt-6 w-full   px-5 py-3 font-semibold  disabled:opacity-60"
          >
            {salvando
              ? 'Salvando...'
              : 'Salvar modelo'}
          </button>
        </Form>
      </div>
    </main>
  );
}
