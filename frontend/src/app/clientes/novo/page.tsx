'use client';

import { Form } from '@/src/components/form';
import { ErrorMessage } from '@/src/components/error-message';

import { useRouter } from 'next/navigation';

import { AppHeader } from '@/src/components/app-header';

import { useState } from 'react';
import { API_URL } from '@/src/lib/api';

export default function NovoClientePage() {
  const router = useRouter();
  const [nome, setNome] = useState('');
  const [documento, setDocumento] = useState('');
  const [telefone, setTelefone] = useState('');
  const [observacoes, setObservacoes] = useState('');

  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');

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

      const resposta = await fetch(`${API_URL}/clientes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nome,
          documento: documento || undefined,
          telefone: telefone || undefined,
          observacoes: observacoes || undefined,
        }),
      });

      if (resposta.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');

        router.push('/');
        return;
      }

      if (!resposta.ok) {
        const dados = await resposta.json();

        setErro(dados.message || 'Erro ao cadastrar cliente');
        return;
      }

      router.push('/clientes');
    } catch (erro) {
      console.error(erro);

      setErro('Não foi possível salvar o cliente.');
    } finally {
      setSalvando(false);
    }
  }

  return (
    <main className="app-page">
      <AppHeader title="Novo cliente" backHref="/clientes" />

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
                Nome *
              </label>

              <input
                id="nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Nome do cliente"
                className="app-input"
                required
              />
            </div>

            <div>
              <label
                htmlFor="documento"
                className="mb-2 block text-sm font-medium text-zinc-700"
              >
                Documento
              </label>

              <input
                id="documento"
                value={documento}
                onChange={(e) => setDocumento(e.target.value)}
                placeholder="CPF, CNPJ ou outro"
                className="app-input"
              />
            </div>

            <div>
              <label
                htmlFor="telefone"
                className="mb-2 block text-sm font-medium text-zinc-700"
              >
                Telefone
              </label>

              <input
                id="telefone"
                type="tel"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                placeholder="Telefone do cliente"
                className="app-input"
              />
            </div>

            <div>
              <label
                htmlFor="observacoes"
                className="mb-2 block text-sm font-medium text-zinc-700"
              >
                Observações
              </label>

              <textarea
                id="observacoes"
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                rows={4}
                placeholder="Informações adicionais"
                className="app-input"
              />
            </div>

            <ErrorMessage message={erro} />

            <button
              type="submit"
              disabled={salvando}
              className="btn-primary w-full px-5 py-3 transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {salvando ? 'Salvando...' : 'Salvar cliente'}
            </button>
          </div>
        </Form>
      </div>
    </main>
  );
}