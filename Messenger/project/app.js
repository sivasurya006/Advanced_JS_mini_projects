import http from 'http';
import express from 'express';
import { Server } from 'socket.io';                                              
import cookieParser from 'cookie-parser';                                        
import jwt from 'jsonwebtoken';                                                  
import 'dotenv/config'
import * as uuid from 'uuid';     
import cookie from 'cookie';                                                    
import { json } from 'node:stream/consumers';
import { name } from 'ejs';

const { log } = console;
const port = 2040;
const app = express();

const httpServer = http.createServer(app);
const io = new Server(httpServer);

const userNameMap = new Map();  // userName : uuid
const userMap = new Map();   // uuid = { username, socketId, expiresAt }
const userDetailsMap = new Map(); // uuid =  {nickname,friends: [uuid1, uuid2],groups: [groupId1, groupId2]}
const groupDetails = new Map(); //GroupMap => groupId : {members: [uuid1, uuid2],createdAt,expiresAt}
const socketMap = new Map(); //  socketId = uuid 
const onlineUsers = new Map();  // uuid = socket id

const ONE_HOUR = 60*60*1000;


app.set('view engine','ejs')
app.use(express.static('public'));
app.use(express.json());
app.use(cookieParser());

app.get('/login',(req,res) => {
    res.render('index');
})


app.post('/login',(req,res) => {
    const { username , nickname } = req.body || {};
    if(!username || !nickname){
        res.status(400).json({ok : false,msg : "username and nickname are important"});
    }
    if(userMap.has(username)){
        return res.json({ok : false,msg : "Username already taken!"});
    }

    const id = uuid.v7();
    const token = createToken({id});

    res.cookie('token',token,{
        httpOnly : true,
        maxAge : 60 * 60 * 1000
    })

    userNameMap.set(username,id);
    userMap.set(id,{
        "username" : username,
        expireAt : Date.now() + ONE_HOUR
    });
    log(...userMap.entries());
    return res.json({ok:true,msg:"successfully login!"})
})

function cleanUp(){
    for(const [id,{username,expireAt}] of userMap.entries()){
        if(expireAt < Date.now()){
            userMap.delete(id);
            userDetailsMap.delete(id);
            groupDetails.forEach( ({members}) => {
                const index = members.index(id);
                if(index != -1){
                    members.splice(index,1);
                }
            })
            console.log("deleted user ",username)
        }
        console.log(username);
    }
}

setInterval(cleanUp,60000);

function verifyToken(req,res,next){
    const token = req.cookies.token;
    if (!token) {
        return res.redirect('/login'); 
    }
    try {
        const decoded =  jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; 
        next();
    } catch (err) {
        return res.redirect('/login');
    }
}




app.get('/',verifyToken,(req,res) => {
    res.render('messagepage');
})


app.get('/users',verifyToken,(req,res) => {
    const name =  req.query.name;
    if(!name){
        return res.status(400).json({ok:false,msg:"User name is mandatory"});
    }
    let result = [];
    userNameMap.entries().forEach(([username,id]) => {
        if(username.toLowerCase().includes(name.toLowerCase()) && id !== req.user.id){
            result.push({username,id});
        }
    }); 
    return res.json(result);
});

function verifiedUser(socket, next) {
    const cookies = socket.handshake.headers.cookie;
    if (!cookies) {
      return next(new Error("NO_COOKIE"));
    }
    const token = cookie.parse(cookies).token;
    if (!token) {
      return next(new Error("NO_TOKEN"));
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded;
      next(); 
    } catch (err) {
      return next(new Error("INVALID"));
    }
}


  



io.use(verifiedUser)

io.on('connection',(socket) => {
    log("User connected :",socket.user.id)
    
    socketMap.set(socket.id,socket.user.id);
    onlineUsers.set(socket.user.id,socket.id);

    socket.on('disconnect',() => {
        console.log("User disconnected",socket.user.id);
        socketMap.delete(socket.id);
        onlineUsers.delete(socket.user.id);
    })


    socket.on('send_message',({receiver_id,msg}) => {

        const sender_id = socket.user.id;

        if(!onlineUsers.has(receiver_id)){
            socket.emit('msg_not_send','Message not send user offline');
            return;
        }

        socket.to(onlineUsers.get(receiver_id)).emit('new_msg',{from:sender_id,msg});
    });

    socket.on('offer', ({receiverId,offer}) => {
        const sender_id = socket.user.id;
        if(!onlineUsers.has(receiverId)){
            socket.emit("can_not_call",'Call not forwarded user offline');
            return;
        }
        const name = userMap.get(sender_id).username;
        socket.to(onlineUsers.get(receiverId)).emit('offer',{offer,from:{id : sender_id,name}});
    })

    socket.on('answer',({answer,id}) =>{
        const sender_id = socket.user.id;
        if(!onlineUsers.has(id)){
            socket.emit("can_not_call",'Call not forwarded user offline');
            return;
        }
        socket.to(onlineUsers.get(id)).emit('answer',{answer,id:sender_id});
    });

    socket.on('ice-candidate',({ice,to}) => {
        const sender_id = socket.user.id;
        if(!onlineUsers.has(to)){
            socket.emit("can_not_call",'ICE candidate exchange error');
            return;
        }
        socket.to(onlineUsers.get(to)).emit('ice-candidate',{ice,sender_id});
    })

    socket.on('call_request',({receiverId}) => {
        
        const sender_id = socket.user.id;
        console.log("call requested "+sender_id)
        if(!onlineUsers.has(receiverId)){
            socket.emit("can_not_call",'Call not forwarded user offline');
            return;
        }
        const name = userMap.get(sender_id).username;
        socket.to(onlineUsers.get(receiverId)).emit('call_request',{callerId:sender_id,from:{name}});
    })


    socket.on('call_response',({accepted,callerId}) => {
        const sender_id = socket.user.id;
        console.log("responded with "+accepted+" emit to "+callerId)
        if(!onlineUsers.has(callerId)){
            socket.emit("can_not_call",'Call not forwarded user offline');
            return;
        }
        const name = userMap.get(sender_id).username;
        socket.to(onlineUsers.get(callerId)).emit('call_response',{accepted,from:{name}});
    });
})


io.on('connect_err',(err) => {
    log(err);
});



httpServer.listen(port,() => {
    log(`Server running on ${port}`);
});


httpServer.on('error', (err) => {
    if (err.code === 'EACCES') {
      console.error('Permission denied. Try a different port.');
    }
});
  
function createToken(user) {
    return jwt.sign(
      { id: user.id },     
      process.env.JWT_SECRET,               
      {
        expiresIn: '1h',
      }
    );
}
  

/**
 * 
 * Socket Id need for message 
 * 
 * Set of usernames .
 * UserMap =>  uuid : username 
 * UserDetailsMap => username : {
 *                      nickname : siva,
 *                      friends  : uuid1, uuid2 ,uuid3, uuid4
 *                      groups   : uuid1, uuid2, 
 *              }
 * 
 * NOTE: Why I choose uuid even though all names are unique.
 *        because our chats are valid for one hour 
 *        if you speak with one and he becomes your current chat if he expired 
 *        that time if we check by username that is possible to another person comes under that user name
 *        so if we use uuid if any user expired that entry exit if another user comes under that name not 
 *        loaded in the person 
 *         
 * UserMap => uuid : {
  username,
  socketId,
  expiresAt
}

UserDetailsMap => uuid : {
  nickname,
  friends: [uuid1, uuid2],
  groups: [groupId1, groupId2]
}

GroupMap => groupId : {
  members: [uuid1, uuid2],
  createdAt,
  expiresAt
}


 */