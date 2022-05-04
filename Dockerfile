# selected an older NodeJS version as newer ones 
# do not seem to be able to handle the outdated dependencies
FROM node:14.19
WORKDIR /server
COPY ./package.json .
RUN npm install
COPY . .
EXPOSE ${PORT}
EXPOSE ${CLIENT_PORT}
CMD npm run dev