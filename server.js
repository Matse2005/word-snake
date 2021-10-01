const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);
const fs = require("fs");
const wordList = JSON.parse(fs.readFileSync("./words.json", "utf8"));

let currentWord = wordList[Math.floor(Math.random() * wordList.length)];
const messages = [
  {
    user: {
      name: "System",
    },
    text: currentWord,
  },
];
const players = [];

app.use(express.static("public"));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

io.on("connection", (socket) => {
  socket.emit("messages", messages);

  socket.on("user_joined", (name) => {
    const player = {
      id: socket.id,
      name,
    };

    console.log(player, "joined");

    players.push(player);
  });

  socket.on("message", (message) => {
    const word = message;

    messages.push({
      user: players.find((player) => socket.id === player.id),
      text: word,
    });

    if (currentWord.slice(-1) === word.charAt(0)) {
      currentWord = word;
    } else {
      messages.push({
        user: {
          name: "System",
        },
        text: "You failed. Game Restarted!",
      });
      currentWord = wordList[Math.floor(Math.random() * wordList.length)];
      messages.push({
        user: {
          name: "System",
        },
        text: currentWord,
      });
    }

    io.emit("messages", messages);
  });
});

http.listen(3000, () => {
  console.log("listening on http://localhost:3000");
});
