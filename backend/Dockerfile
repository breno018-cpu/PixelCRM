# Dockerfile de Produção para o Backend PixelCRM
FROM node:20-alpine

# Dependências nativas básicas para compilação e SSL
RUN apk add --no-cache openssl python3 make g++

WORKDIR /app

# Copia arquivos de dependência
COPY package*.json ./
COPY prisma ./prisma/

# Instala dependências do projeto
RUN npm install --production=false

# Gera o cliente Prisma para Linux x64
RUN npx prisma generate

# Copia código fonte
COPY src ./src

# Garante a existência do diretório de autenticação do Baileys
RUN mkdir -p /app/baileys_auth_info

EXPOSE 5000

ENV NODE_ENV=production
ENV PORT=5000
ENV DATABASE_URL="file:./dev.db"

CMD ["node", "src/index.js"]
