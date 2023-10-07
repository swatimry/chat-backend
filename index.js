//importing necessary libraries and files
const express=require("express");
require('dotenv').config();
const socketio=require("socket.io");
const http=require("http");
const router=require("./router");
const cors=require("cors");
const {addUser,removeUser,getUser,getUsersInRoom}=require("./users.js");


//setting up socketio not setting up app tradtionally
const PORT=process.env.PORT || 5000;
const app=express();
app.use(cors());
const server=http.createServer(app); 
const io=socketio(server,{
    cors:{
        origin: process.env.FRONTEND_URL ||"http://localhost:3000",
        methods:["GET","POST"]
    }
}); //socketinstance

//built-in keyword connection and disconnect
io.on('connection',(socket)=>{

socket.once('join',({name,room},callback)=>{
    console.log("connection");
   const {user,error}=addUser({id:socket.id,name,room});
   if(error){  return callback(error); }
    socket.join(user.room); 
    console.log("user added",user,error);
    socket.emit('message',{user:'admin',text:`Hey !! ${user.name} welcome to ${user.room}`});
    socket.broadcast.to(user.room).emit('message',{user:'admin',text:`${user.name} has joined the chat`});
    callback();
 });
   

socket.on('sendMessage',(message,callback)=>{
      const user=getUser(socket.id);
      io.to(user.room).emit('message',{user:user.name,text:message});
      callback();     
    });

socket.on('disconnect',()=>{
        const user=removeUser(socket.id);
        if(user){
            io.to(user.room).emit('message',{user:'admin',text:`${user.name} has left the chat`}); }
            console.log("user left"); })

});
 

app.use(router);
server.listen(PORT,function(){
    console.log("server started");
}) 