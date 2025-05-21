// Middleware para Cloudflare Pages Functions
export async function onRequest(context) {
  const { request, env, next } = context;
  
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
  const url = new URL(request.url);
  
  // Permitir acesso a rotas públicas
  const publicPaths = ['/login', '/api/auth'];
  const isPublicPath = publicPaths.some(path => url.pathname.startsWith(path));

  if (!authHeader && !isPublicPath) {
    return new Response('Não autorizado', {
      status: 401,
      headers: corsHeaders
    });
  }

  // Adicionar headers CORS à resposta
  const response = await next();
  Object.entries(corsHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
}
