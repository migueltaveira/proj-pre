'use client';

import { API_URL } from '@/src/lib/api';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

type Pedido = {
  id: number;
  numeroOP: number;
  status: 'EM_PRODUCAO' | 'CONCLUIDO' | 'CANCELADO';
  observacoes?: string | null;
  criadoEm: string;

  cliente: {
    nome: string;
  };

  modelo: {
    nome: string;
    referencia?: string | null;
  };

  material: {
    nome: string;
  };

  cor: {
    nome: string;
  };

  tamanhos: {
    id: number;
    tamanho: number;
    quantidade: number;
  }[];
};

export default function ImprimirPedidoPage() {
  const params = useParams();
  const id = params.id as string;

  const [pedido, setPedido] = useState<Pedido | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    carregarPedido();
  }, []);

  async function carregarPedido() {
    try {
      const token = localStorage.getItem('token');

      if (!token) {
        window.location.href = '/';
        return;
      }

      const resposta = await fetch(
        `${API_URL}/pedidos/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (resposta.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
        window.location.href = '/';
        return;
      }

      if (!resposta.ok) {
        throw new Error();
      }

      const dados = await resposta.json();
      setPedido(dados);
    } catch {
      setErro('Não foi possível carregar a ficha.');
    } finally {
      setCarregando(false);
    }
  }

  function formatarOP(numero: number) {
    return String(numero).padStart(6, '0');
  }

  function formatarStatus(status: Pedido['status']) {
    if (status === 'EM_PRODUCAO') return 'EM PRODUÇÃO';
    if (status === 'CONCLUIDO') return 'CONCLUÍDO';
    return 'CANCELADO';
  }

  if (carregando) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        Carregando...
      </main>
    );
  }

  if (!pedido) {
    return (
      <main className="p-6">
        {erro || 'Ficha não encontrada.'}
      </main>
    );
  }

  const totalPares = pedido.tamanhos.reduce(
    (total, item) => total + item.quantidade,
    0,
  );

  return (
    <>
      <div className="no-print flex justify-center gap-3 bg-zinc-100 p-4">
        <button
          onClick={() => window.history.back()}
          className="rounded-lg border border-zinc-300 bg-white px-5 py-2 font-medium"
        >
          Voltar
        </button>

        <button
          onClick={() => window.print()}
          className="rounded-lg bg-zinc-900 px-5 py-2 font-semibold text-white"
        >
          Imprimir
        </button>
      </div>

      <main className="pagina-impressao">
        <section className="ficha">
          <header className="cabecalho">
            <div>
              <h1>Pré-Frezado Frederico</h1>
              <p>Ficha de Produção de Solas</p>
            </div>

            <div className="op">
              <span>OP</span>
              <strong>{formatarOP(pedido.numeroOP)}</strong>
            </div>
          </header>

          <section className="dados">
            <div>
              <span>Cliente</span>
              <strong>{pedido.cliente.nome}</strong>
            </div>

            <div>
              <span>Modelo</span>
              <strong>{pedido.modelo.nome}</strong>
            </div>

            <div>
              <span>Referência</span>
              <strong>{pedido.modelo.referencia || '-'}</strong>
            </div>

            <div>
              <span>Material</span>
              <strong>{pedido.material.nome}</strong>
            </div>

            <div>
              <span>Cor</span>
              <strong>{pedido.cor.nome}</strong>
            </div>

            <div>
              <span>Status</span>
              <strong>{formatarStatus(pedido.status)}</strong>
            </div>
          </section>

          <section className="grade">
            {pedido.tamanhos.map((item) => (
              <div className="tamanho" key={item.id}>
                <div className="numero">{item.tamanho}</div>
                <div className="quantidade">{item.quantidade}</div>
              </div>
            ))}
          </section>

          <section className="resumo">
            <div>
              <span>Total</span>
              <strong>{totalPares} pares</strong>
            </div>
          </section>

          <section className="observacoes">
            <span>Observações</span>

            <p>
              {pedido.observacoes || ''}
            </p>
          </section>
        </section>
      </main>

      <style jsx global>{`
        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
        }

        .pagina-impressao {
          min-height: 100vh;
          background: #e4e4e7;
          padding: 20px;
        }

        .ficha {
          width: 210mm;
          min-height: 148mm;
          margin: 0 auto;
          background: white;
          border: 2px solid #18181b;
          padding: 7mm;
          color: #18181b;
          font-family: Arial, Helvetica, sans-serif;
        }

        .cabecalho {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 2px solid #18181b;
          padding-bottom: 4mm;
        }

        .cabecalho h1 {
          margin: 0;
          font-size: 22px;
        }

        .cabecalho p {
          margin: 2px 0 0;
          font-size: 14px;
        }

        .op {
          text-align: center;
          min-width: 42mm;
        }

        .op span {
          display: block;
          font-size: 12px;
          font-weight: bold;
        }

        .op strong {
          display: block;
          font-size: 26px;
        }

        .dados {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2mm;
          margin-top: 4mm;
        }

        .dados div {
          border: 1px solid #52525b;
          padding: 2.5mm;
          min-height: 15mm;
        }

        .dados span,
        .resumo span,
        .observacoes span {
          display: block;
          font-size: 10px;
          text-transform: uppercase;
          font-weight: bold;
          margin-bottom: 2px;
        }

        .dados strong {
          font-size: 15px;
        }

        .grade {
          display: flex;
          gap: 2mm;
          margin-top: 5mm;
          flex-wrap: nowrap;
          overflow: hidden;
        }

        .tamanho {
          flex: 1;
          min-width: 14mm;
          border: 2px solid #18181b;
          text-align: center;
        }

        .numero {
          background: #18181b;
          color: white;
          font-size: 18px;
          font-weight: bold;
          padding: 2mm 1mm;
        }

        .quantidade {
          font-size: 22px;
          font-weight: bold;
          padding: 4mm 1mm;
        }

        .resumo {
          display: flex;
          justify-content: flex-end;
          margin-top: 4mm;
        }

        .resumo div {
          border: 1px solid #52525b;
          width: 45mm;
          padding: 2.5mm;
        }

        .resumo strong {
          font-size: 18px;
        }

        .observacoes {
          margin-top: 4mm;
          border: 1px solid #52525b;
          min-height: 28mm;
          padding: 3mm;
        }

        .observacoes p {
          margin: 4px 0 0;
          font-size: 13px;
          white-space: pre-wrap;
        }

        @page {
          size: A5 landscape;
          margin: 0;
        }

        @media print {
          .no-print {
            display: none !important;
          }

          html,
          body {
            width: 210mm;
            height: 148mm;
            margin: 0;
            padding: 0;
            background: white;
          }

          .pagina-impressao {
            width: 210mm;
            height: 148mm;
            min-height: 148mm;
            margin: 0;
            padding: 0;
            background: white;
          }

          .ficha {
            width: 210mm;
            height: 148mm;
            min-height: 148mm;
            margin: 0;
            border: none;
            padding: 6mm;
          }
        }
      `}</style>
    </>
  );
}