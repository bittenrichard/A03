# /a03/backend.Dockerfile

# Estágio 1: Build do Código TypeScript
# Esta primeira parte é o "ambiente de construção"
FROM node:18-alpine as builder

WORKDIR /app
COPY package.json package-lock.json tsconfig.json ./
# Instala TODAS as dependências, incluindo as de desenvolvimento como o TypeScript
RUN npm install
COPY . .

# --- O PONTO CHAVE ESTÁ AQUI ---
# Este comando executa o script "build" do seu package.json,
# que chama o compilador TypeScript (tsc).
# Ele converte todos os arquivos .ts para .js e os coloca na pasta /dist
RUN npm run build
# --------------------------------

# Estágio 2: Imagem Final de Produção
# Agora, criamos a imagem final, que será menor e mais segura
FROM node:18-alpine

WORKDIR /app
COPY package.json package-lock.json ./
# Instala APENAS as dependências de produção
RUN npm install --omit=dev

# Copia APENAS o JavaScript já compilado do estágio de build
COPY --from=builder /app/dist ./dist

EXPOSE 3001

# Inicia o servidor usando o arquivo JavaScript compilado
CMD ["node", "dist/server.js"]