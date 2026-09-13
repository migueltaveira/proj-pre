# Pré-Frezado Frederico — Frontend

Interface para autenticação, cadastros e fichas de produção, construída com Next.js App Router, React e TypeScript.

## Desenvolvimento

Na pasta `frontend`, instale as dependências com `npm ci` e execute `npm run dev`.
O frontend fica disponível em `http://localhost:3000`.

Configure `NEXT_PUBLIC_API_URL` em `.env.local` para indicar o endereço do backend.
O endereço padrão é `http://localhost:3001`. A API precisa estar disponível para login e operações de cadastro.

## Organização

```text
src/
  app/                 Rotas, formulários e estado de cada tela
    page.tsx           Login
    dashboard/         Visão geral da produção
    clientes/          Listagem, cadastro e edição de clientes
    cores/             Listagem, cadastro e edição de cores
    materiais/         Listagem, cadastro e edição de materiais
    modelos/           Listagem, cadastro e edição de modelos
    pedidos/           Fichas, criação e impressão/PDF
    globals.css        Importações e regras básicas da aplicação
  components/
    app-header.tsx     Marca, menu ativo, título e navegação de retorno
    form.tsx           Validação de campos com resumo acessível
    error-message.tsx  Mensagens de falha com foco automático
  hooks/
    use-load-data.ts   Inicialização assíncrona do carregamento das telas
  lib/
    api.ts             Endereço da API
    pedidos.ts         Formatação de OP e apresentação dos status
    validar-pedido.ts  Validação das quantidades da ficha
  styles/
    tokens.css         Paleta e variáveis visuais
    components.css     Cabeçalho, botões, campos, cartões e login responsivo
    mobile.css         Adaptação para toque, telas pequenas e erros de formulário
```

## Manutenção

- Altere a paleta em `styles/tokens.css` e os estilos compartilhados em `styles/components.css`.
- Use `AppHeader` nas telas administrativas. O conteúdo deve ter `id="conteudo"` e `tabIndex={-1}` para o atalho de teclado do cabeçalho.
- Use `app-page`, `app-card`, `app-input`, `btn-primary` e `btn-voltar` para manter a aparência consistente. Tailwind complementa espaçamento e disposição.
- Use `Link` para links e `useRouter` para navegação após ações.
- Use `Form` no lugar de `form` para apresentar os erros dos campos obrigatórios e das restrições HTML antes de chamar `onSubmit`. Associe cada campo ao seu `label` usando `id` e `htmlFor`.
- Use `ErrorMessage` para falhas ao salvar. Mantenha o preenchimento quando a API falhar. As regras da ficha também estão em `lib/validar-pedido.ts`.
- Os campos usam fonte de 16px e os controles têm pelo menos 44px de altura para facilitar o toque. A navegação mostra todos os atalhos em duas linhas abaixo de 640px. As prévias de impressão permitem rolagem dentro da ficha, mantendo a largura do papel.
- Passe funções estáveis com `useCallback` para `useLoadData`, incluindo os parâmetros de rota nas dependências. O callback deve tratar falhas da API. O hook cancela o início pendente do carregamento ao desmontar; não cancela requisições já iniciadas.
- Os estilos específicos das fichas permanecem nas rotas de impressão. As duas apresentações existentes devem ser verificadas antes de unificar esses arquivos. `html2canvas` e `jspdf` são usados na exportação e devem ser mantidos.

## Validação

```bash
npm run lint
npm test
npm run build
```

Os testes de validação usam o executor nativo do Node com suporte a TypeScript (Node 22.6+; verificados no Node 24).

Para conferir o fluxo completo, valide login, filtros, criação/edição/inativação dos cadastros e criação de pedido com a API ativa. Confira também a impressão e a exportação de PDF em `/pedidos/[id]` e `/pedidos/[id]/imprimir`, além da navegação em telas pequenas. Ao testar a ficha, envie o formulário vazio, depois com quantidades zeradas e fracionadas; confira mensagens, foco no resumo e preservação dos dados após falha da API.
