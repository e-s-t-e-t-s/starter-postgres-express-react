
FROM node:14.19
WORKDIR /server
COPY ./package.json .
RUN npm install
COPY . .
EXPOSE ${PORT}
EXPOSE ${CLIENT_PORT}
CMD npm run dev