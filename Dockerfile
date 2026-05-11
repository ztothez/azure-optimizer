FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

EXPOSE 7860

ENV PORT=7860
ENV HOSTNAME=0.0.0.0

CMD ["npm", "run", "start"]