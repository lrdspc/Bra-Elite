// Arquivo de configuração para Cloudflare Pages Functions

export async function onRequest(context) {
  const { request, env, params } = context;
  
  try {
    // Configuração de CORS
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    };

    // Tratamento de requisições OPTIONS (CORS preflight)
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: corsHeaders
      });
    }

    // Verificação de autenticação
    const authHeader = request.headers.get('Authorization');
    if (!authHeader && !request.url.includes('/login')) {
      return new Response('Não autorizado', {
        status: 401,
        headers: corsHeaders
      });
    }

    // Roteamento dinâmico baseado no path
    const url = new URL(request.url);
    const path = url.pathname;

    // Adicione aqui suas rotas específicas
    if (path.startsWith('/api/')) {
      // Encaminhar para Workers
      const workerResponse = await fetch(`${env.WORKER_URL}${path}`, {
        method: request.method,
        headers: request.headers,
        body: request.body
      });

      const response = new Response(workerResponse.body, {
        status: workerResponse.status,
        headers: {
          ...corsHeaders,
          ...Object.fromEntries(workerResponse.headers)
        }
      });

      return response;
    }

    // Fallback para arquivos estáticos
    return env.ASSETS.fetch(request);

  } catch (error) {
    return new Response(`Erro: ${error.message}`, {
      status: 500,
      headers: corsHeaders
    });
  }
}