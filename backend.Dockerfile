# /a03/backend.Dockerfile

# Estágio 1: Build do Código TypeScript
# Usamos uma imagem Node para compilar o TypeScript para JavaScript.
FROM node:18-alpine AS builder

WORKDIR /app

# Copia os arquivos de definição de pacotes e os tsconfigs
COPY package.json package-lock.json tsconfig.json tsconfig.server.json ./

# Instala todas as dependências (incluindo as de desenvolvimento)
RUN npm install

# Copia todo o código-fonte (respeitando o .dockerignore)
COPY . .

# Executa o script de build específico do backend que criamos no package.json
RUN npm run build:backend

# Estágio 2: Imagem de Produção
# Usamos uma imagem Node mais leve para a produção
FROM node:18-alpine

WORKDIR /app

# Copia os arquivos de definição de pacotes
COPY package.json package-lock.json ./

# Instala apenas as dependências de produção para uma imagem menor
RUN npm install --omit=dev

# Copia o código JavaScript já compilado do estágio de build
COPY --from=builder /app/dist ./dist

# Expõe a porta em que a API será executada
EXPOSE 3001

# Comando para iniciar o servidor Node.js
# O servidor principal está em dist/server.js após a compilação
CMD ["node", "dist/server.js"]