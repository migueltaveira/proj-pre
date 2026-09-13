'use client';

import { useLoadData } from '@/src/hooks/use-load-data';

import { useRouter } from 'next/navigation';

import { AppHeader } from '@/src/components/app-header';

import { API_URL } from '@/src/lib/api';

import { useCallback, useState } from 'react';

type Material = {
  id: number;
  nome: string;
  ativo: boolean;
};

export default function MateriaisPage() {
  const router = useRouter();
  const [materiais, setMateriais] = useState<Material[]>([]);
  const [busca, setBusca] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  const carregarMateriais = useCallback(async () => {
    try {
      setErro('');

      const token = localStorage.getItem('token');

      if (!token) {
        router.push('/');
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
      setErro('Não foi possível carregar os materiais.');
    } finally {
      setCarregando(false);
    }
  }, [router]);

  useLoadData(carregarMateriais);

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
      setErro('Não foi possível inativar o material.');
    }
  }

  const materiaisFiltrados = materiais.filter((item) =>
    item.nome.toLowerCase().includes(busca.toLowerCase()),
  );

  return (
    <main className="app-page">
      <AppHeader title="Materiais" backHref="/dashboard" />

      <div id="conteudo" tabIndex={-1} className="mx-auto max-w-6xl px-4 py-6">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-zinc-900">
              Cadastro de materiais
            </h2>
          </div>

          <button
            onClick={() => (router.push('/materiais/novo'))}
            className="btn-primary px-5 py-3 font-semibold"
          >
            + Novo material
          </button>
        </div>

        <input
          aria-label="Buscar registros" value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar material..."
          className="app-input sm:max-w-md"
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
                className="app-card p-5"
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
                        (router.push(`/materiais/${material.id}/editar`))
                      }
                      className="btn-voltar"
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
