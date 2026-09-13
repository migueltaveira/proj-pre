'use client';

import { useLoadData } from '@/src/hooks/use-load-data';

import { useRouter } from 'next/navigation';

import { AppHeader } from '@/src/components/app-header';

import { API_URL } from '@/src/lib/api';

import {
  useCallback, useMemo,
  useState,
} from 'react';

type Opcao = {
  id: number;
  nome: string;
  ativo: boolean;
};

type Modelo = Opcao & {
  referencia?: string | null;
};

type Quantidades = Record<number, string>;

const tamanhosDisponiveis = [
  33, 34, 35, 36, 37, 38, 39, 40,
  41, 42, 43, 44, 45, 46,
];

export default function NovoPedidoPage() {
  const router = useRouter();
  const [clientes, setClientes] = useState<Opcao[]>([]);
  const [modelos, setModelos] = useState<Modelo[]>([]);
  const [materiais, setMateriais] = useState<Opcao[]>([]);
  const [cores, setCores] = useState<Opcao[]>([]);

  const [clienteId, setClienteId] = useState('');
  const [modeloId, setModeloId] = useState('');
  const [materialId, setMaterialId] = useState('');
  const [corId, setCorId] = useState('');

  const [observacoes, setObservacoes] =
    useState('');

  const [quantidades, setQuantidades] =
    useState<Quantidades>({});

  const [carregando, setCarregando] =
    useState(true);

  const [salvando, setSalvando] =
    useState(false);

  const [erro, setErro] = useState('');

  const carregarCadastros = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');

      if (!token) {
        router.push('/');
        return;
      }

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const [
        respostaClientes,
        respostaModelos,
        respostaMateriais,
        respostaCores,
      ] = await Promise.all([
        fetch(
          `${API_URL}/clientes`,
          { headers },
        ),
        fetch(
          `${API_URL}/modelos`,
          { headers },
        ),
        fetch(
          `${API_URL}/materiais`,
          { headers },
        ),
        fetch(
          `${API_URL}/cores`,
          { headers },
        ),
      ]);

      if (
        respostaClientes.status === 401 ||
        respostaModelos.status === 401 ||
        respostaMateriais.status === 401 ||
        respostaCores.status === 401
      ) {
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');

        router.push('/');
        return;
      }

      if (
        !respostaClientes.ok ||
        !respostaModelos.ok ||
        !respostaMateriais.ok ||
        !respostaCores.ok
      ) {
        throw new Error();
      }

      const [
        dadosClientes,
        dadosModelos,
        dadosMateriais,
        dadosCores,
      ] = await Promise.all([
        respostaClientes.json(),
        respostaModelos.json(),
        respostaMateriais.json(),
        respostaCores.json(),
      ]);

      setClientes(
        dadosClientes.filter(
          (item: Opcao) => item.ativo,
        ),
      );

      setModelos(
        dadosModelos.filter(
          (item: Modelo) => item.ativo,
        ),
      );

      setMateriais(
        dadosMateriais.filter(
          (item: Opcao) => item.ativo,
        ),
      );

      setCores(
        dadosCores.filter(
          (item: Opcao) => item.ativo,
        ),
      );
    } catch {
      setErro(
        'Não foi possível carregar os cadastros.',
      );
    } finally {
      setCarregando(false);
    }
  }, [router]);

  useLoadData(carregarCadastros);

  const totalPares = useMemo(() => {
    return Object.values(
      quantidades,
    ).reduce((soma, valor) => {
      const numero = Number(valor);

      return soma + (numero || 0);
    }, 0);
  }, [quantidades]);

  function alterarQuantidade(
    tamanho: number,
    valor: string,
  ) {
    if (
      valor !== '' &&
      Number(valor) < 0
    ) {
      return;
    }

    setQuantidades((anterior) => ({
      ...anterior,
      [tamanho]: valor,
    }));
  }

  async function salvar(
    e: React.FormEvent,
  ) {
    e.preventDefault();

    try {
      setErro('');
      setSalvando(true);

      const token = localStorage.getItem('token');

      if (!token) {
        router.push('/');
        return;
      }

      const tamanhos = tamanhosDisponiveis
        .map((tamanho) => ({
          tamanho,
          quantidade: Number(
            quantidades[tamanho] || 0,
          ),
        }))
        .filter(
          (item) => item.quantidade > 0,
        );

      if (tamanhos.length === 0) {
        setErro(
          'Informe a quantidade de pelo menos um tamanho.',
        );
        return;
      }

      const resposta = await fetch(
        `${API_URL}/pedidos`,
        {
          method: 'POST',
          headers: {
            'Content-Type':
              'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            clienteId: Number(clienteId),
            modeloId: Number(modeloId),
            materialId:
              Number(materialId),
            corId: Number(corId),
            observacoes:
              observacoes || undefined,
            tamanhos,
          }),
        },
      );

      if (resposta.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');

        router.push('/');
        return;
      }

      const dados = await resposta.json();

      if (!resposta.ok) {
        setErro(
          dados.message ||
            'Erro ao criar ficha.',
        );
        return;
      }

      router.push(`/pedidos/${dados.id}`);
    } catch {
      setErro(
        'Não foi possível criar a ficha.',
      );
    } finally {
      setSalvando(false);
    }
  }

  if (carregando) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-100">
        <p className="text-zinc-500">
          Carregando...
        </p>
      </main>
    );
  }

  return (
    <main className="app-page">
      <AppHeader title="Nova ficha" backHref="/pedidos" />

      <div id="conteudo" tabIndex={-1} className="mx-auto max-w-5xl px-4 py-6">
        <form
          onSubmit={salvar}
          className="space-y-6"
        >
          <section className="app-card p-5  sm:p-8">
            <h2 className="text-lg font-semibold text-zinc-900">
              Dados da ficha
            </h2>

            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-700">
                  Cliente *
                </label>

                <select
                  value={clienteId}
                  onChange={(e) =>
                    setClienteId(
                      e.target.value,
                    )
                  }
                  required
                  className="app-input"
                >
                  <option value="">
                    Selecione
                  </option>

                  {clientes.map((item) => (
                    <option
                      key={item.id}
                      value={item.id}
                    >
                      {item.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-700">
                  Modelo *
                </label>

                <select
                  value={modeloId}
                  onChange={(e) =>
                    setModeloId(
                      e.target.value,
                    )
                  }
                  required
                  className="app-input"
                >
                  <option value="">
                    Selecione
                  </option>

                  {modelos.map((item) => (
                    <option
                      key={item.id}
                      value={item.id}
                    >
                      {item.nome}
                      {item.referencia
                        ? ` - ${item.referencia}`
                        : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-700">
                  Material *
                </label>

                <select
                  value={materialId}
                  onChange={(e) =>
                    setMaterialId(
                      e.target.value,
                    )
                  }
                  required
                  className="app-input"
                >
                  <option value="">
                    Selecione
                  </option>

                  {materiais.map((item) => (
                    <option
                      key={item.id}
                      value={item.id}
                    >
                      {item.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-700">
                  Cor *
                </label>

                <select
                  value={corId}
                  onChange={(e) =>
                    setCorId(e.target.value)
                  }
                  required
                  className="app-input"
                >
                  <option value="">
                    Selecione
                  </option>

                  {cores.map((item) => (
                    <option
                      key={item.id}
                      value={item.id}
                    >
                      {item.nome}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          <section className="app-card p-5  sm:p-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-zinc-900">
                  Numeração
                </h2>

                <p className="mt-1 text-sm text-zinc-500">
                  Informe somente os tamanhos necessários.
                </p>
              </div>

              <div className="rounded-xl bg-zinc-100 px-4 py-2 text-right">
                <p className="text-xs text-zinc-500">
                  Total
                </p>

                <p className="font-bold text-zinc-900">
                  {totalPares} pares
                </p>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-3 sm:grid-cols-5 md:grid-cols-7">
              {tamanhosDisponiveis.map(
                (tamanho) => (
                  <div
                    key={tamanho}
                    className="overflow-hidden rounded-xl border border-zinc-200"
                  >
                    <div className="btn-primary py-2 text-center font-semibold">
                      {tamanho}
                    </div>

                    <input
                      type="number"
                      min="0"
                      inputMode="numeric"
                      value={
                        quantidades[
                          tamanho
                        ] || ''
                      }
                      onChange={(e) =>
                        alterarQuantidade(
                          tamanho,
                          e.target.value,
                        )
                      }
                      placeholder="0"
                      className="app-input"
                    />
                  </div>
                ),
              )}
            </div>
          </section>

          <section className="app-card p-5  sm:p-8">
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
              rows={5}
              placeholder="Informações adicionais da ficha"
              className="app-input"
            />
          </section>

          {erro && (
            <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {erro}
            </div>
          )}

          <button
            type="submit"
            disabled={salvando}
            className="btn-primary w-full   px-5 py-4 text-base font-semibold  disabled:opacity-60"
          >
            {salvando
              ? 'Criando ficha...'
              : 'Criar ficha de produção'}
          </button>
        </form>
      </div>
    </main>
  );
}
