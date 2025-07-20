"use strict";

// config/staffDb.js
var mongoose = require("mongoose");

require("dotenv").config(); // Get the MongoDB connection string from the environment variable

var mongoUrl = process.env.MONGO_URI;
var dbName = "staff"; // Specific database for staff and their properties
// Create a separate connection for staff

var staffConnection = mongoose.createConnection(
  "".concat(mongoUrl).concat(dbName),
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);
staffConnection.on("connected", function () {
  console.log("Staff database connected: ".concat(dbName));
});
staffConnection.on("error", function (err) {
  console.error("Staff database connection error: ".concat(err));
});
staffConnection.on("disconnected", function () {
  console.log("Staff database disconnected");
}); // Export the connection for use in models

module.exports = staffConnection;
