const { handleErrors } = require('./_middleware');
const { success } = require('./_utils/request');

// Exemplo de função de API
const handler = async (event, context) => {
  return success({
    message: 'Olá, mundo!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
};

// Exporta o handler com tratamento de erros
module.exports.handler = handleErrors(handler);
