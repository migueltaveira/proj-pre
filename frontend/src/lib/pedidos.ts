export type StatusPedido = 'EM_PRODUCAO' | 'CONCLUIDO' | 'CANCELADO';

const statusPedido = {
  EM_PRODUCAO: { label: 'Em produção', className: 'bg-amber-100 text-amber-700' },
  CONCLUIDO: { label: 'Concluído', className: 'bg-green-100 text-green-700' },
  CANCELADO: { label: 'Cancelado', className: 'bg-red-100 text-red-700' },
} satisfies Record<StatusPedido, { label: string; className: string }>;

export function formatarOP(numero: number) {
  return String(numero).padStart(6, '0');
}

export function nomeStatus(status: StatusPedido) {
  return statusPedido[status].label;
}

export function classeStatus(status: StatusPedido) {
  return statusPedido[status].className;
}
