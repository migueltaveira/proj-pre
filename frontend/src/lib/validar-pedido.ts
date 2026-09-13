export function validarQuantidades(quantidades: Record<number, string>): string | null {
  const valores = Object.values(quantidades).filter((value) => value.trim() !== '').map(Number);
  if (valores.some((value) => !Number.isSafeInteger(value) || value < 0)) {
    return 'As quantidades devem ser números inteiros, iguais ou maiores que zero.';
  }
  if (!valores.some((value) => value > 0)) {
    return 'Informe a quantidade de pelo menos um tamanho para criar a ficha.';
  }
  return null;
}
