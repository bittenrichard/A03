# Estágio 1: Build
# Usamos uma imagem base para a compilação do projeto
FROM node:18-alpine AS builder

# Define o diretório de trabalho dentro do contêiner
WORKDIR /app

# Copia os arquivos de configuração do projeto e dependências
COPY package.json package-lock.json tsconfig.json tsconfig.server.json ./

# Instala as dependências do projeto
RUN npm install

# Copia todo o código-fonte
COPY . .

# Instala as definições de tipo para o bcryptjs
RUN npm install --save-dev @types/bcryptjs

# Executa o script de build específico do backend que criamos no package.json
RUN npm run build:backend

# Estágio 2: Imagem de Produção
# Usamos uma imagem mais leve para o ambiente de produção
FROM node:18-alpine

# Define o diretório de trabalho dentro do contêiner
WORKDIR /app

# Copia os arquivos compilados (somente o necessário) do estágio de build
COPY --from=builder /app/dist ./dist
COPY package.json package-lock.json ./

# CORREÇÃO: Copia apenas o arquivo de ambiente de produção
COPY .env.production ./

# Reinstala as dependências, mas apenas as de produção
RUN npm install --only=production

# Expõe a porta em que a aplicação irá rodar
EXPOSE 3001

# Comando para iniciar o servidor
CMD ["node", "dist/server.js"]