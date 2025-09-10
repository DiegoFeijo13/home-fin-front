# Etapa 1: build
FROM node:18-alpine AS build
WORKDIR /app

# copia e instala dependências
COPY package*.json ./
RUN npm install

# copia o restante e gera build
COPY . .
# copia o .env.production para dentro
COPY .env.production .env.production
RUN npm run build

# Etapa 2: servidor Nginx
FROM nginx:stable-alpine
COPY --from=build /app/dist /usr/share/nginx/html

# expõe a porta padrão
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
