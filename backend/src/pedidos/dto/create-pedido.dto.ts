export class TamanhoPedidoDto {
  tamanho: number;
  quantidade: number;
}

export class CreatePedidoDto {
  clienteId: number;
  modeloId: number;
  materialId: number;
  corId: number;

  observacoes?: string;

  tamanhos: TamanhoPedidoDto[];
}