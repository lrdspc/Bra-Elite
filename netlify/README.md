# Estrutura de Pastas do Netlify

Este diretório contém os arquivos de configuração e funções para o deploy no Netlify.

## Estrutura

```
netlify/
├── functions/           # Serverless Functions
│   ├── _headers        # Configurações de cabeçalhos HTTP
│   └── hello.js        # Exemplo de função serverless
├── edge-functions/     # Edge Functions
│   └── hello.js        # Exemplo de edge function
└── README.md           # Este arquivo
```

## Serverless Functions

As Serverless Functions permitem executar código server-side sem gerenciar servidores. Elas são executadas em resposta a eventos HTTP.

### Como criar uma nova função

1. Crie um novo arquivo JavaScript/TypeScript em `netlify/functions/`
2. Exporte uma função assíncrona que lida com a requisição

Exemplo (`netlify/functions/hello.js`):

```javascript
export const handler = async (event, context) => {
  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Hello World" }),
  };
};
```

A função estará disponível em `/.netlify/functions/hello`

## Edge Functions

As Edge Functions são executadas na borda da rede da Cloudflare, mais próximas dos usuários, oferecendo melhor desempenho.

### Como criar uma nova Edge Function

1. Crie um novo arquivo JavaScript/TypeScript em `netlify/edge-functions/`
2. Exporte uma função assíncrona que lida com a requisição

Exemplo (`netlify/edge-functions/hello.js`):

```javascript
export default async (request, context) => {
  return new Response(JSON.stringify({ message: "Hello from the Edge!" }), {
    headers: { 'Content-Type': 'application/json' },
  });
};
```

## Configuração

As configurações do Netlify são definidas no arquivo `netlify.toml` na raiz do projeto.

## Testando Localmente

Para testar as funções localmente, execute:

```bash
npm run dev
```

Isso iniciará o servidor de desenvolvimento do Netlify, que inclui suporte para testar funções localmente.

## Implantação

O deploy é feito automaticamente ao fazer push para o branch configurado no painel do Netlify.

## Recursos Úteis

- [Documentação do Netlify Functions](https://docs.netlify.com/functions/overview/)
- [Documentação do Netlify Edge Functions](https://docs.netlify.com/edge-functions/overview/)
- [Configuração do netlify.toml](https://docs.netlify.com/configure-builds/file-based-configuration/)
