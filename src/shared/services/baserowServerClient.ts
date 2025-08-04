// Local: /a03/src/shared/services/baserowServerClient.ts

import fetch from 'node-fetch';
import FormData from 'form-data';
import { Stream } from 'stream';

// CORREÇÃO: Lendo as variáveis de ambiente corretas para o backend
const { BASEROW_API_KEY, BASEROW_API_URL } = process.env;

if (!BASEROW_API_KEY || !BASEROW_API_URL) {
  throw new Error('ERRO CRÍTICO: BASEROW_API_KEY ou BASEROW_API_URL não estão definidas no ambiente.');
}

const fetchApi = async (endpoint: string, options: any = {}, isFileUpload: boolean = false): Promise<any> => {
  const url = `${BASEROW_API_URL}${endpoint}`;
  
  const headers: any = {
    'Authorization': `Token ${BASEROW_API_KEY}`,
  };

  if (!isFileUpload) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      ...headers,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.text();
    console.error(`Erro na API Baserow: URL=${url}, Status=${response.status}, Resposta=${errorData}`);
    throw new Error(`Erro na API Baserow: ${response.statusText} - ${errorData}`);
  }

  if (response.status === 204) {
    return {};
  }
  
  return response.json();
};

export const sendToBaserow = async (tableId: string, data: any) => {
    const endpoint = `/api/database/rows/table/${tableId}/?user_field_names=true`;
    return fetchApi(endpoint, {
        method: 'POST',
        body: JSON.stringify(data),
    });
};

export const baserowServer = {
  get: (tableId: string, params: string = '') => {
    return fetchApi(`/api/database/rows/table/${tableId}/${params}`);
  },
  getRow: (tableId: string, rowId: number, params: string = '') => {
    return fetchApi(`/api/database/rows/table/${tableId}/${rowId}/${params}`);
  },
  post: (tableId: string, data: any) => {
    return fetchApi(`/api/database/rows/table/${tableId}/?user_field_names=true`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  patch: (tableId: string, rowId: number, data: any) => {
    return fetchApi(`/api/database/rows/table/${tableId}/${rowId}/?user_field_names=true`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },
  delete: (tableId: string, rowId: number) => {
    return fetchApi(`/api/database/rows/table/${tableId}/${rowId}/`, {
      method: 'DELETE',
    });
  },
  uploadFileFromBuffer: async (buffer: Buffer, fileName: string, mimetype: string) => {
    const form = new FormData();
    const bufferStream = new Stream.PassThrough();
    bufferStream.end(buffer);
    form.append('file', bufferStream, { filename: fileName, contentType: mimetype });

    return fetchApi('/api/user-files/upload-file/', {
      method: 'POST',
      body: form,
    }, true);
  },
};