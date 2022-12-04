const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

const colors = {
  red: 0,
  blue: 0,
  green: 0,
  coral: 1,
  purple: 0,
  orange: 1,
  black: 0,
}

const messages = [
    { username: 'John', color: 'coral', message: 'Hello' },
    { username: 'Jane', color: 'orange', message: 'Hi' },
    { username: 'John', color: 'coral', message: 'How are you?' },
    { username: 'Jane', color: 'orange', message: 'I am fine, thanks' },
    { username: 'John', color: 'coral', message: 'chillin, you?' },
    { username: 'Jane', color: 'orange', message: 'Bored haha' },
    { username: 'John', color: 'coral', message: 'Got a new computer though!' }
];

let interval = null;

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
  console.log('a user connected');

  if (!interval) {
    setInterval(() => {
      emitRandomMessage(socket);
    }, 4000);

    interval = true;
  }

  socket.emit('colors', toJson(colors));

  handleColorChoice(socket);


  const start = messages.length - 10 || 0;
  const end = messages.length;
  socket.emit('messages', toJson(messages.slice(start, end)));

  socket.on('chat message', (payload) => {
      const result = JSON.parse(payload);
      messages.push(result);

      socket.emit('messages', toJson([result]));
      socket.broadcast.emit('messages', toJson([result]));
  });
});

server.listen(3000, () => {
  console.log('listening on *:3000');
});

function handleColorChoice(socket) {
  socket.on('color choice', (color) => {
    colors[color] = 1;
    socket.broadcast.emit('colors', toJson(colors));
  });
}

function emitRandomMessage(socket) {
  const randomMessage = messages[Math.floor(Math.random() * 7)];
  socket.broadcast.emit('messages', toJson([randomMessage]));
}

function toJson(d) {
  return JSON.stringify(d);
}

