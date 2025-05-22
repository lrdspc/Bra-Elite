// Importa o helper de resposta do Netlify
const { Handler } = require('@netlify/functions');

// Usando a nova sintaxe de handler do Netlify Functions v2
exports.handler = async (event, context) => {
  try {
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      },
      body: JSON.stringify({
        message: 'Olá, mundo!',
        environment: process.env.NODE_ENV,
        timestamp: new Date().toISOString(),
      }),
    };
  } catch (error) {
    console.error('Erro na função:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Erro interno do servidor' }),
    };
  }
};
