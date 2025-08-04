// Local: /a03/src/shared/services/baserowServerClient.ts

import fetch from 'node-fetch';

const { BASEROW_API_KEY, BASEROW_API_URL } = process.env;

if (!BASEROW_API_KEY || !BASEROW_API_URL) {
  throw new Error('A chave da API ou a URL do Baserow não estão definidas nas variáveis de ambiente.');
}

const baserowServerFetch = async (endpoint: string, options: any = {}) => {
  const url = `${BASEROW_API_URL}/api/database/${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Token ${BASEROW_API_KEY}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`Erro na API Baserow: ${response.statusText} - ${errorData}`);
  }

  // Verifica se a resposta tem conteúdo antes de tentar fazer o parse do JSON
  const responseText = await response.text();
  return responseText ? JSON.parse(responseText) : {};
};

// --- CORREÇÃO APLICADA AQUI ---
// Adicionamos a palavra-chave "export" para que a função possa ser importada por outros arquivos.
export const sendToBaserow = async (tableId: string, data: any) => {
  // A rota correta para criar uma linha, usando nomes de campo de usuário
  const endpoint = `rows/table/${tableId}/?user_field_names=true`; 
  return baserowServerFetch(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};