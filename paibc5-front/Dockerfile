FROM node:12-slim
ENV PORT 3000
EXPOSE 3000
WORKDIR /usr/src/app
COPY . .
RUN npm install
CMD ["npm", "start", "--prefix", "paibc5-front"]