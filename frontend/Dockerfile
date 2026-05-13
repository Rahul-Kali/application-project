FROM node:18

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN chmod -R 755 node_modules/.bin

RUN npm run build

EXPOSE 8084

CMD ["npm", "run", "dev", "--", "--host"]