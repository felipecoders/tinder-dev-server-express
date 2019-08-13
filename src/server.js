require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const routes = require("./routes");
const RealTimeController = require("./controllers/RealTimeController");

mongoose.connect(
  "mongodb+srv://omnistack:1q2w3e@cluster0-rw5hr.mongodb.net/omnistack8?retryWrites=true&w=majority",
  {
    useNewUrlParser: true,
    useFindAndModify: false
  }
);

const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);

// o ideal seria armazenar no banco de dados
// const connectedUsers = {};

io.on("connection", socket => RealTimeController.store(socket, io));

app.use((req, res, next) => {
  req.io = io;
  return next();
});

app.use(cors());
app.use(express.json());
app.use(routes);

server.listen(process.env.PORT, () =>
  console.log(`http://localhost:${process.env.PORT}`)
);
