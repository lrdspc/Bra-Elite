// Utilitário para parsear o corpo da requisição
const parseBody = (event) => {
  if (!event.body) return {};
  
  try {
    return typeof event.body === 'string' 
      ? JSON.parse(event.body) 
      : event.body;
  } catch (error) {
    console.error('Error parsing request body:', error);
    return {};
  }
};

// Utilitário para obter parâmetros de consulta
const getQueryParams = (event) => {
  return event.queryStringParameters || {};
};

// Utilitário para obter parâmetros de rota
const getPathParams = (event) => {
  return event.pathParameters || {};
};

// Utilitário para obter cabeçalhos
const getHeaders = (event) => {
  return event.headers || {};
};

// Utilitário para obter o método HTTP
const getMethod = (event) => {
  return event.httpMethod;
};

// Utilitário para obter o caminho da URL
const getPath = (event) => {
  return event.path.replace(new RegExp('^/.netlify/functions'), '');
};

// Utilitário para criar resposta de sucesso
const success = (data, statusCode = 200) => {
  return {
    statusCode,
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json',
    },
  };
};

// Utilitário para criar resposta de erro
const error = (message, statusCode = 400) => {
  return {
    statusCode,
    body: JSON.stringify({ error: message }),
    headers: {
      'Content-Type': 'application/json',
    },
  };
};

module.exports = {
  parseBody,
  getQueryParams,
  getPathParams,
  getHeaders,
  getMethod,
  getPath,
  success,
  error,
};
