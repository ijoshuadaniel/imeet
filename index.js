const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const socket = require('socket.io');
const io = socket(server);
const { v4: uuid, v4 } = require('uuid');

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.json());

let users = [];

io.on('connection', (socket) => {
  socket.on('my-data', (data) => {
    const isUser = users.find(
      (user) => user.email === data.email && user.roomId === data.roomId
    );
    if (!isUser) users.push(data);
    if (isUser) socket.to(data.roomId).emit('userExist', data);
    socket.join(data.roomId);
    socket.to(data.roomId).emit('userConnected', data);
    socket.to(data.roomId).emit('allUsers', users);
    socket.emit('allUsers', users);

    socket.on('text-message', (data) => {
      socket.emit('receivedMsg', data);
      socket.to(data.roomId).emit('receivedMsg', data);
    });

    socket.on('leave-meeting', (data) => {
      const allUser = users.filter((user) => data.id !== user.id);
      users = allUser;
      socket.to(data.roomId).emit('userLeft', data);
      socket.to(data.roomId).emit('allUsers', users);
      socket.emit('allUsers', users);
    });

    socket.on('disconnect', () => {
      socket.to(data.roomId).emit('user-disconnected', data.id);
      socket.to(data.roomId).emit('allUsers', users);
      const allUser = users.filter((user) => data.id !== user.id);
      users = allUser;
      socket.to(data.roomId).emit('userLeft', data);
      socket.to(data.roomId).emit('allUsers', users);
      socket.emit('allUsers', users);
    });
  });
});

app.get('/', (req, res) => {
  res.render('home', { roomId: v4() });
});

app.get('/meet/:name/:email/:id', (req, res) => {
  const { name, email, id } = req.params;
  res.render('meet', { name, email, id });
});

server.listen(3000, () => console.log('l:80'));
