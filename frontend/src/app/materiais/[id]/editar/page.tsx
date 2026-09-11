'use client';

import { API_URL } from '@/src/lib/api';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

export default function EditarMaterialPage() {
  const params = useParams();
  const id = params.id as string;

  const [nome, setNome] = useState('');
  const [ativo, setAtivo] = useState(true);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    carregar();
  }, []);

  async function carregar() {
    const token = localStorage.getItem('token');

    const resposta = await fetch(
      `${API_URL}/materiais/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    const dados = await resposta.json();

    setNome(dados.nome);
    setAtivo(dados.ativo);
    setCarregando(false);
  }

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    setSalvando(true);

    const token = localStorage.getItem('token');

    await fetch(
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

    window.location.href = '/materiais';
  }

  if (carregando) {
    return <main className="p-6">Carregando...</main>;
  }

  return (
    <main className="min-h-screen bg-zinc-100 p-4">
      <div className="mx-auto max-w-2xl">
        <form
          onSubmit={salvar}
          className="rounded-2xl bg-white p-6 shadow-sm"
        >
          <h1 className="mb-6 text-2xl font-bold">
            Editar material
          </h1>

          <label className="mb-2 block text-sm font-medium">
            Nome
          </label>

          <input
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
            className="w-full rounded-xl border px-4 py-3"
          />

          <label className="mt-5 flex items-center gap-3">
            <input
              type="checkbox"
              checked={ativo}
              onChange={(e) => setAtivo(e.target.checked)}
            />
            Material ativo
          </label>

          <button
            disabled={salvando}
            className="mt-6 w-full rounded-xl bg-zinc-900 px-5 py-3 font-semibold text-white"
          >
            Salvar alterações
          </button>
        </form>
      </div>
    </main>
  );
}