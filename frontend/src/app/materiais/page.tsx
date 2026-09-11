'use client';

import { API_URL } from '@/src/lib/api';

import { useEffect, useState } from 'react';

type Material = {
  id: number;
  nome: string;
  ativo: boolean;
};

export default function MateriaisPage() {
  const [materiais, setMateriais] = useState<Material[]>([]);
  const [busca, setBusca] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    carregarMateriais();
  }, []);

  async function carregarMateriais() {
    try {
      setErro('');

      const token = localStorage.getItem('token');

      if (!token) {
        window.location.href = '/';
        return;
      }

      const resposta = await fetch(
        `${API_URL}/materiais`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!resposta.ok) {
        throw new Error();
      }

      setMateriais(await resposta.json());
    } catch {
      setErro('NÃ£o foi possÃ­vel carregar os materiais.');
    } finally {
      setCarregando(false);
    }
  }

  async function inativarMaterial(id: number) {
    if (!window.confirm('Deseja realmente inativar este material?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');

      const resposta = await fetch(
        `${API_URL}/materiais/${id}/inativar`,
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

      await carregarMateriais();
    } catch {
      setErro('NÃ£o foi possÃ­vel inativar o material.');
    }
  }

  const materiaisFiltrados = materiais.filter((item) =>
    item.nome.toLowerCase().includes(busca.toLowerCase()),
  );

  return (
    <main className="min-h-screen bg-zinc-100">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div>
            <h1 className="text-xl font-bold text-zinc-900">Materiais</h1>
            <p className="text-xs text-zinc-500">PrÃ©-Frezado Frederico</p>
          </div>

          <button
            onClick={() => (window.location.href = '/dashboard')}
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
              Cadastro de materiais
            </h2>
          </div>

          <button
            onClick={() => (window.location.href = '/materiais/novo')}
            className="rounded-xl bg-zinc-900 px-5 py-3 font-semibold text-white"
          >
            + Novo material
          </button>
        </div>

        <input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar material..."
          className="mb-5 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 sm:max-w-md"
        />

        {erro && (
          <div className="mb-4 rounded-xl bg-red-50 p-4 text-red-700">
            {erro}
          </div>
        )}

        {carregando ? (
          <div>Carregando...</div>
        ) : (
          <div className="space-y-3">
            {materiaisFiltrados.map((material) => (
              <div
                key={material.id}
                className="rounded-2xl bg-white p-5 shadow-sm"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-zinc-900">
                      {material.nome}
                    </h3>

                    <span
                      className={`rounded-full px-3 py-1 text-xs ${
                        material.ativo
                          ? 'bg-green-100 text-green-700'
                          : 'bg-zinc-200 text-zinc-600'
                      }`}
                    >
                      {material.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        (window.location.href =
                          `/materiais/${material.id}/editar`)
                      }
                      className="rounded-xl border border-zinc-300 px-4 py-2 text-sm"
                    >
                      Editar
                    </button>

                    {material.ativo && (
                      <button
                        onClick={() => inativarMaterial(material.id)}
                        className="rounded-xl bg-red-50 px-4 py-2 text-sm text-red-700"
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
