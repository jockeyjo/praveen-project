const path = require ('path');
const http = require ('http');
const express = require ('express');
const socketIO = require ('socket.io');
const {generateMessage,generateLocationMessage} = require ('./utils/message');
const{isRealString} = require ('./utils/validation');

const publicPath = path.join(__dirname,'../public');
const port = process.env.PORT || 3000;
var app = express();
var server = http.createServer(app);
var io = socketIO(server);

app.use(express.static(publicPath));

io.on('connection',(socket) =>{
  console.log('new user has been connected');
  socket.emit('newMessage',generateMessage ('admin','welcome to the chat app'));

  socket.broadcast.emit('newMessage',generateMessage('admin','new user joined'));

//for login users
socket.on('join',(params, callback)  => {
if(!isRealString (params.name)||!isRealString(params.room)) {
  callback('name and room name are required');
}
callback();
});

  //server side operation
  socket.on('createMessage', (message, call) => {
    console.log('create message', message);
    io.emit('newMessage',generateMessage(message.from, message.text));
    call('this is from the server');
});
socket.on('createLocationMessage', (coords) => {
  io.emit('newLocationMessage',generateLocationMessage('admin',coords.latitude,coords.longitude));
})

  socket.on('disconnect',() => {
    console.log('user was disconnected');
  });
});
server.listen(port, () => {
  console.log(`server is up on ${port}`);
});
