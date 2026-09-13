'use client';

import { Form } from '@/src/components/form';
import { ErrorMessage } from '@/src/components/error-message';

import { useRouter } from 'next/navigation';

import { AppHeader } from '@/src/components/app-header';

import { API_URL } from '@/src/lib/api';

import { useState } from 'react';

export default function NovaCorPage() {
  const router = useRouter();
  const [nome, setNome] = useState('');
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
        `${API_URL}/cores`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            nome,
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
            'Erro ao cadastrar cor',
        );

        return;
      }

      router.push('/cores');
    } catch {
      setErro(
        'Não foi possível salvar a cor.',
      );
    } finally {
      setSalvando(false);
    }
  }

  return (
    <main className="app-page">
      <AppHeader title="Nova cor" backHref="/cores" />

      <div id="conteudo" tabIndex={-1} className="mx-auto max-w-3xl px-4 py-6">
        <Form
          onSubmit={salvar}
          className="app-card p-5  sm:p-8"
        >
          <div>
            <label
              htmlFor="nome"
              className="mb-2 block text-sm font-medium text-zinc-700"
            >
              Nome da cor *
            </label>

            <input
              id="nome"
              value={nome}
              onChange={(e) =>
                setNome(e.target.value)
              }
              placeholder="Ex.: Preto"
              className="app-input"
              required
            />
          </div>

          <ErrorMessage message={erro} />

          <button
            type="submit"
            disabled={salvando}
            className="btn-primary mt-6 w-full   px-5 py-3 font-semibold  disabled:opacity-60"
          >
            {salvando
              ? 'Salvando...'
              : 'Salvar cor'}
          </button>
        </Form>
      </div>
    </main>
  );
}
