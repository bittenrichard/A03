# /a03/frontend.Dockerfile

# Estágio 1: Build da Aplicação React
FROM node:18-alpine as builder

WORKDIR /app

# Copia os arquivos de definição de pacotes
COPY package.json package-lock.json ./

# --- CORREÇÃO APLICADA AQUI ---
# Removemos a instalação antiga e o lock file para forçar uma instalação 100% limpa.
# Esta é a solução definitiva para o erro do @rollup/rollup-linux-x64-musl.
RUN rm -f package-lock.json
RUN npm cache clean --force

# Instala as dependências do projeto
RUN npm install

# Copia todo o código-fonte do projeto para o contêiner
COPY . .

# Define a URL da API para o ambiente de produção
ARG VITE_API_BASE_URL=https://api.recrutamentoia.com.br
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

# Executa o script de build para gerar os arquivos estáticos de produção
RUN npm run build

# Estágio 2: Servidor de Produção com Nginx
FROM nginx:stable-alpine

# Remove a configuração padrão do Nginx
RUN rm -rf /etc/nginx/conf.d/*

# Copia o arquivo de configuração customizado do Nginx
COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf

# Copia os arquivos estáticos gerados no estágio de build
COPY --from=builder /app/dist /usr/share/nginx/html

# Expõe a porta 80 para permitir o acesso ao Nginx
EXPOSE 80

# Comando para iniciar o Nginx quando o contêiner for executado
CMD ["nginx", "-g", "daemon off;"]