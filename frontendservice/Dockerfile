FROM node:18-alpine AS build

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# Fix vite permission
RUN chmod +x node_modules/.bin/vite

RUN npm run build

FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 8084

CMD ["nginx", "-g","npm","dev","--","--host","0.0.0.0","--port","8084","daemon off;"]