# /a03/frontend.Dockerfile

# Estágio 1: Build da Aplicação React
# Usamos uma imagem Node para ter acesso ao npm e construir o projeto.
FROM node:18-alpine as builder

# Define o diretório de trabalho dentro do contêiner
WORKDIR /app

# Copia os arquivos de definição de pacotes
COPY package.json package-lock.json ./

# Instala as dependências do projeto
RUN npm install

# Copia todo o código-fonte do projeto para o contêiner
COPY . .

# IMPORTANTE: Define a URL da API para o ambiente de produção
# Esta variável de ambiente será usada pelo Vite durante o build
ARG VITE_API_BASE_URL=https://api.recrutamentoia.com.br
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

# Executa o script de build para gerar os arquivos estáticos de produção
RUN npm run build

# Estágio 2: Servidor de Produção com Nginx
# Usamos uma imagem Nginx super leve para servir os arquivos estáticos
FROM nginx:stable-alpine

# Remove a configuração padrão do Nginx
RUN rm -rf /etc/nginx/conf.d/*

# Copia o arquivo de configuração customizado do Nginx
# Este arquivo será criado no próximo passo
COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf

# Copia os arquivos estáticos gerados no estágio de build
# A pasta 'dist' é o resultado do 'npm run build'
COPY --from=builder /app/dist /usr/share/nginx/html

# Expõe a porta 80 para permitir o acesso ao Nginx
EXPOSE 80

# Comando para iniciar o Nginx quando o contêiner for executado
CMD ["nginx", "-g", "daemon off;"]