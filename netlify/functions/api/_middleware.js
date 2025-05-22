// Middleware para tratamento de erros e CORS
const handleErrors = (handler) => async (event, context) => {
  try {
    // Configuração CORS
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    };

    // Lidar com requisições OPTIONS (pré-voo CORS)
    if (event.httpMethod === 'OPTIONS') {
      return {
        statusCode: 200,
        headers,
        body: '',
      };
    }

    // Executar o handler
    const result = await handler(event, context);

    // Retornar resposta com CORS
    return {
      ...result,
      headers: {
        ...result.headers,
        ...headers,
      },
    };
  } catch (error) {
    console.error('Error:', error);
    
    return {
      statusCode: error.statusCode || 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        message: error.message || 'Internal Server Error',
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
      }),
    };
  }
};

module.exports = { handleErrors };
