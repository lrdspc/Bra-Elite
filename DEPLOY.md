# Instruções para Deploy no Netlify

Este guia explica como fazer o deploy da aplicação no Netlify.

## Pré-requisitos

- Conta no [Netlify](https://www.netlify.com/)
- Acesso ao repositório do projeto no GitHub
- Node.js 18+ instalado localmente
- npm ou yarn instalado

## Passos para Deploy

1. **Conectar ao GitHub**
   - Acesse [app.netlify.com](https://app.netlify.com/)
   - Clique em "Sites" e depois em "Import an existing project"
   - Selecione o provedor (GitHub) e autorize o acesso ao repositório

2. **Configurações do Build**
   - **Repositório**: Selecione o repositório do projeto
   - **Branch para deploy**: `main` ou `master`
   - **Comando de build**: `npm run build`
   - **Diretório de publicação**: `dist`

3. **Variáveis de Ambiente**

   Adicione as seguintes variáveis de ambiente nas configurações do site no Netlify:

   ```env
   NODE_VERSION=20
   NPM_FLAGS=--legacy-peer-deps
   NPM_VERBOSE=true
   NODE_ENV=production
   VITE_API_URL=/.netlify/functions
   VITE_BASE_URL=/
   VITE_PUBLIC_URL=/
   ```

4. **Deploy**

   - Clique em "Deploy site"
   - O Netlify fará o build e o deploy automaticamente

## Configurações Avançadas

### Funções Serverless

As funções serverless devem ser colocadas na pasta `netlify/functions/`.

### Edge Functions

As Edge Functions devem ser colocadas na pasta `netlify/edge-functions/`.

### Domínios Personalizados

- Vá para "Domain settings" no painel do Netlify
- Siga as instruções para configurar seu domínio personalizado

## Solução de Problemas

- **Erros de Build**: Verifique os logs de build no painel do Netlify
- **Problemas com rotas**: Certifique-se de que o redirecionamento SPA está configurado corretamente no `netlify.toml`
- **Variáveis de ambiente**: Verifique se todas as variáveis de ambiente necessárias estão configuradas

## Suporte

Para suporte, entre em contato com a equipe de desenvolvimento.
