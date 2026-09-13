import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validarQuantidades } from '../src/lib/validar-pedido.ts';

test('pedido precisa de pelo menos um tamanho com quantidade positiva', () => {
  for (const input of [{}, { 33: '' }, { 33: '0', 34: '0' }]) {
    assert.match(validarQuantidades(input), /pelo menos um tamanho/);
  }
});

test('rejeita negativos, frações, valores não numéricos e números fora do limite seguro', () => {
  for (const value of ['-1', '1.5', 'abc', 'Infinity', '9007199254740992']) {
    assert.match(validarQuantidades({ 33: value, 34: '10' }), /números inteiros/);
  }
});

test('aceita quantidades inteiras e ignora tamanhos em branco ou zerados', () => {
  assert.equal(validarQuantidades({ 33: '12', 34: '', 35: '0', 36: '7' }), null);
});
