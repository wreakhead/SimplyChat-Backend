import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import Messages from "./dbChat.js";
import cors from "cors";
import Pusher from "pusher";

dotenv.config();

const URL = process.env.KEY;
const app = express();
const port = process.env.PORT || 2000;

const pusher = new Pusher({
  appId: "1249364",
  key: process.env.PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: "eu",
  useTLS: true,
});

app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "*");
  next();
});

mongoose.connect(URL, {
  useCreateIndex: true,
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

db.once("open", () => {
  console.log("DB connected");
  const chatCollection = db.collection("chatdatas");
  const changeStream = chatCollection.watch();

  changeStream.on("change", (change) => {
    console.log(change);
    if (change.operationType == "insert") {
      const messageDetails = change.fullDocument;
      pusher.trigger("message", "inserted", {
        name: messageDetails.name,
        message: messageDetails.message,
        timestamp: messageDetails.timestamp,
        received: messageDetails.received,
      });
    } else {
      console.log("error");
    }
  });
});

app.get("/", (req, res) => {
  res.status(200);
});

app.post("/message/new", (req, res) => {
  const chat = req.body;
  Messages.create(chat, (err, data) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(201).send(data);
    }
  });
});

app.get("/message/sync", (req, res) => {
  Messages.find((err, data) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(200).send(data);
    }
  });
});

app.listen(port, () => {
  console.log(`server @ ${port}`);
});
