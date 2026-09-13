'use client';

import { useLoadData } from '@/src/hooks/use-load-data';

import { useRouter } from 'next/navigation';

import { useCallback, useState } from 'react';
import { useParams } from 'next/navigation';
import { API_URL } from '@/src/lib/api';

import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

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
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [pedido, setPedido] = useState<Pedido | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [compartilhando, setCompartilhando] = useState(false);

  const carregarPedido = useCallback(async () => {
    try {
      setErro('');

      const token = localStorage.getItem('token');

      if (!token) {
        router.push('/');
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

        router.push('/');
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
  }, [id, router]);

  useLoadData(carregarPedido);

  function formatarOP(numero: number) {
    return String(numero).padStart(6, '0');
  }

  function formatarStatus(status: Pedido['status']) {
    if (status === 'EM_PRODUCAO') {
      return 'EM PRODUÇÃO';
    }

    if (status === 'CONCLUIDO') {
      return 'CONCLUÍDO';
    }

    return 'CANCELADO';
  }

  async function compartilharFicha() {
    if (!pedido) return;

    try {
      setCompartilhando(true);

      const elemento = document.getElementById('ficha-pdf');

      if (!elemento) {
        alert('Não foi possível localizar a ficha.');
        return;
      }

      const canvas = await html2canvas(elemento, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true,
      });

      const imagem = canvas.toDataURL('image/jpeg', 1.0);

      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a5',
      });

      pdf.addImage(
        imagem,
        'JPEG',
        0,
        0,
        210,
        148,
      );

      const nomeArquivo = `OP-${formatarOP(pedido.numeroOP)}.pdf`;

      const pdfBlob = pdf.output('blob');

      const arquivo = new File(
        [pdfBlob],
        nomeArquivo,
        {
          type: 'application/pdf',
        },
      );

      if (
        navigator.share &&
        navigator.canShare?.({
          files: [arquivo],
        })
      ) {
        await navigator.share({
          title: `Ficha OP ${formatarOP(pedido.numeroOP)}`,
          text: 'Ficha de Produção',
          files: [arquivo],
        });

        return;
      }

      pdf.save(nomeArquivo);
    } catch (erro) {
      if (
        erro instanceof DOMException &&
        erro.name === 'AbortError'
      ) {
        return;
      }

      console.error(erro);

      alert(
        'Não foi possível gerar ou compartilhar o PDF.',
      );
    } finally {
      setCompartilhando(false);
    }
  }

  if (carregando) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-100">
        <p className="text-zinc-500">
          Carregando ficha...
        </p>
      </main>
    );
  }

  if (!pedido) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-100 px-4">
        <div className="text-center">
          <p className="text-zinc-700">
            {erro || 'Ficha não encontrada.'}
          </p>

          <button
            type="button"
            onClick={() => {
              router.push('/pedidos');
            }}
            className="btn-voltar"
          >
            Voltar
          </button>
        </div>
      </main>
    );
  }

  const totalPares = pedido.tamanhos.reduce(
    (total, item) => total + item.quantidade,
    0,
  );

  return (
    <>
      <div className="no-print">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="btn-voltar"
        >
          Voltar
        </button>

        <button
          type="button"
          onClick={compartilharFicha}
          disabled={compartilhando}
          className="botao-compartilhar"
        >
          {compartilhando
            ? 'Abrindo...'
            : 'Compartilhar'}
        </button>

        <button
          type="button"
          onClick={() => window.print()}
          className="botao-imprimir"
        >
          Imprimir
        </button>
      </div>

      <main className="pagina-impressao">
        <section className="ficha" id="ficha-pdf">
          <header className="cabecalho">
            <div>
              <h1>Pré-Frezado Frederico</h1>
              <p>Ficha de Produção de Solas</p>
            </div>

            <div className="op">
              <span>OP</span>
              <strong>
                {formatarOP(pedido.numeroOP)}
              </strong>
            </div>
          </header>

          <section className="dados">
            <div>
              <span>Cliente</span>
              <strong>
                {pedido.cliente.nome}
              </strong>
            </div>

            <div>
              <span>Modelo</span>
              <strong>
                {pedido.modelo.nome}
              </strong>
            </div>

            <div>
              <span>Referência</span>
              <strong>
                {pedido.modelo.referencia || '-'}
              </strong>
            </div>

            <div>
              <span>Material</span>
              <strong>
                {pedido.material.nome}
              </strong>
            </div>

            <div>
              <span>Cor</span>
              <strong>
                {pedido.cor.nome}
              </strong>
            </div>

            <div>
              <span>Status</span>
              <strong>
                {formatarStatus(pedido.status)}
              </strong>
            </div>
          </section>

          <section className="grade">
            {pedido.tamanhos.map((item) => (
              <div
                className="tamanho"
                key={item.id}
              >
                <div className="numero">
                  {item.tamanho}
                </div>

                <div className="quantidade">
                  {item.quantidade}
                </div>
              </div>
            ))}
          </section>

          <section className="rodape-ficha">
            <div className="total-pares">
              <span>Total</span>

              <strong>{totalPares}</strong>

              <small>pares</small>
            </div>

            <div className="observacoes">
              <span>Observações</span>

              <p>
                {pedido.observacoes || ''}
              </p>
            </div>
          </section>
        </section>
      </main>

      <style jsx global>{`
        * {
          box-sizing: border-box;
        }

        html,
        body {
          margin: 0;
          padding: 0;
          background: #e4e4e7;
          font-family: Arial, Helvetica, sans-serif;
        }

        body {
          color: #18181b;
        }

        .no-print {
          display: flex;
          justify-content: center;
          flex-wrap: wrap;
          gap: 10px;

          background: #f4f4f5;

          padding: 14px;
        }

        .botao-secundario,
        .botao-compartilhar,
        .botao-imprimir {
          border-radius: 10px;

          padding: 10px 18px;

          font-size: 14px;
          font-weight: 600;

          cursor: pointer;

          transition: 0.2s;
        }

        .botao-secundario {
          border: 1px solid #a1a1aa;

          background: white;

          color: #18181b;
        }

        .botao-secundario:hover {
          background: #f4f4f5;
        }

        .botao-compartilhar {
          border: none;

          background: #2563eb;

          color: white;
        }

        .botao-compartilhar:hover {
          background: #1d4ed8;
        }

        .botao-compartilhar:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .botao-imprimir {
          border: none;

          background: #18181b;

          color: white;
        }

        .botao-imprimir:hover {
          background: #27272a;
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

          padding: 6mm;

          color: #18181b;

          font-family: Arial, Helvetica, sans-serif;
        }

        .cabecalho {
          display: flex;

          align-items: center;
          justify-content: space-between;

          gap: 8mm;

          border-bottom: 2px solid #18181b;

          padding-bottom: 3mm;
        }

        .cabecalho h1 {
          margin: 0;

          font-size: 21px;
          font-weight: 700;

          line-height: 1.1;
        }

        .cabecalho p {
          margin: 2px 0 0;

          font-size: 13px;
        }

        .op {
          min-width: 40mm;

          text-align: center;
        }

        .op span {
          display: block;

          margin-bottom: 1mm;

          font-size: 10px;
          font-weight: 700;

          text-transform: uppercase;
        }

        .op strong {
          display: block;

          font-size: 25px;
          font-weight: 700;

          line-height: 1;
        }

        .dados {
          display: grid;

          grid-template-columns: repeat(3, 1fr);

          gap: 2mm;

          margin-top: 4mm;
        }

        .dados div {
          min-height: 14mm;

          border: 1px solid #52525b;

          padding: 2.5mm;
        }

        .dados span {
          display: block;

          margin-bottom: 1mm;

          font-size: 9px;
          font-weight: 700;

          text-transform: uppercase;
        }

        .dados strong {
          display: block;

          font-size: 14px;
          font-weight: 700;

          line-height: 1.15;
        }

        .grade {
          display: flex;

          flex-wrap: nowrap;

          gap: 2mm;

          margin-top: 4mm;

          overflow: hidden;
        }

        .tamanho {
          flex: 1;

          min-width: 13mm;

          overflow: hidden;

          border: 2px solid #18181b;

          text-align: center;
        }

        .numero {
          background: #18181b;

          color: white;

          padding: 2mm 1mm;

          font-size: 18px;
          font-weight: 700;

          line-height: 1;
        }

        .quantidade {
          padding: 3.5mm 1mm;

          font-size: 22px;
          font-weight: 700;

          line-height: 1;
        }

        .rodape-ficha {
          display: grid;

          grid-template-columns: 24mm 1fr;

          gap: 3mm;

          margin-top: 4mm;
        }

        .total-pares {
          display: flex;

          flex-direction: column;

          align-items: center;
          justify-content: center;

          min-height: 38mm;

          border: 1px solid #52525b;

          padding: 2mm;

          text-align: center;
        }

        .total-pares span {
          display: block;

          font-size: 8px;
          font-weight: 700;

          text-transform: uppercase;
        }

        .total-pares strong {
          display: block;

          margin-top: 1.5mm;

          font-size: 17px;
          font-weight: 700;

          line-height: 1;
        }

        .total-pares small {
          display: block;

          margin-top: 1mm;

          font-size: 8px;
        }

        .observacoes {
          min-height: 38mm;

          border: 1px solid #52525b;

          padding: 3mm;
        }

        .observacoes span {
          display: block;

          margin-bottom: 2mm;

          font-size: 9px;
          font-weight: 700;

          text-transform: uppercase;
        }

        .observacoes p {
          margin: 0;

          font-size: 12px;

          line-height: 1.35;

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

          body {
            overflow: hidden;
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

            padding: 5mm;

            box-shadow: none;
          }

          .cabecalho {
            padding-bottom: 2.5mm;
          }

          .dados {
            margin-top: 3mm;
          }

          .grade {
            margin-top: 3.5mm;
          }

          .rodape-ficha {
            margin-top: 3.5mm;
          }

          .observacoes {
            min-height: 39mm;
          }

          .total-pares {
            min-height: 39mm;
          }
        }

        @media screen and (max-width: 900px) {
          .pagina-impressao {
            overflow-x: auto;

            padding: 12px;
          }

          .ficha {
            transform-origin: top left;
          }
        }
      `}</style>
    </>
  );
}