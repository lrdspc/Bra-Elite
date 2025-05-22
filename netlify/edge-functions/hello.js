// Netlify Edge Function example
export default async (request, context) => {
  return new Response(JSON.stringify({
    message: "Olá do Edge Function!",
    timestamp: new Date().toISOString(),
    location: context.geo,
    userAgent: context.userAgent,
  }), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    },
  });
};

// Configuração de rota para a Edge Function
export const config = {
  path: '/api/edge-hello',
};
