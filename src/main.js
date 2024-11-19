const express = require('express');
const app = express();
const mongoose = require('mongoose');
const http = require('http');
const cors = require('cors');
require('dotenv').config();
// const { SERVER_PORT } = process.env;
const SERVER_PORT = 3000;
const createError = require('http-errors');
const { AllRouters } = require('./routers/router');
const initSocket = require('./utils/socket.io/socket');

module.exports = class Application {
  constructor() {
    this.configServer();
    this.createServer();
    this.createMongodb();
    this.createRoutes();
    this.errorHandler();
  }

  configServer() {
    app.use(cors());
    app.use(express.urlencoded({ extended: true }));
    app.use(express.json({ limit: '1024mb' }));
  }

  createServer() {
    const server = http.createServer(app);
    initSocket(server);
    server.listen(SERVER_PORT, () => console.log(`server run to PORT : ${SERVER_PORT}`));
  }

  createMongodb() {
    const DATABASE_MONGODB = `mongodb+srv://mmdalam:Mm11337788@cluster0.zf6rcuf.mongodb.net/message_api`;
    mongoose.connect(DATABASE_MONGODB);
    mongoose.set('strictPopulate', true);
    mongoose.set('strictQuery', true);
    mongoose.connection.on('connected', () => console.log(`connect to mongodb `));
    mongoose.connection.on('desconnected', () => console.log(`desconnect to mongodb `));
  }

  createRoutes() {
    app.use(AllRouters);
  }

  errorHandler() {
    app.use((req, res, next) => {
      next(createError.NotFound('آدرس مورد نظر پیدا نشد'));
    });
    app.use((error, req, res, next) => {
      const serverError = createError.InternalServerError('InternalServerError');
      const message = error.message || serverError.message;
      const status = error.status || serverError.status;
      return res.status(status).json({ message: message });
    });
  }
};
