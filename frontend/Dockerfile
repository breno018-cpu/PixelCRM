# Estágio 1: Compilação dos arquivos estáticos com Vite
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Compila o frontend React para a pasta dist
RUN npm run build

# Estágio 2: Servidor Web Nginx de Produção
FROM nginx:alpine

# Remove a configuração padrão do Nginx
RUN rm -rf /etc/nginx/conf.d/default.conf

# Copia a configuração customizada com suporte a SPA e WebSocket
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copia os arquivos compilados do estágio anterior
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
