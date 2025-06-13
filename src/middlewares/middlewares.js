const express = require("express");
const corsMiddleware = require("./cors.js");
const helmetMiddleware = require("./helmet.js");
const rateLimiter = require("./rateLimiter.js");


module.exports = (app) => {
  app.use(rateLimiter);
  app.use(corsMiddleware);
  app.use(helmetMiddleware);
  app.use(express.json({ limit: "100mb" }));
  app.use(express.urlencoded({ extended: true, limit: "100mb" }));
};