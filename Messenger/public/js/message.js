const {log } = console;

const socket = io();
const notifications = new Map();   // sender Id = [messages] 
const msgHistory = new Map();




let currentChatWindow = null;
let peerConnection;
let localStream;


// to identify public ip
const configuration = {
    iceServers : [
        {urls : "stun:stun.l.google.com:19302"}
    ]
} 


 function createPeerConnection(receiverId){
    peerConnection = new RTCPeerConnection(configuration);
    console.log("peer connection created")
    if(localStream){
        localStream.getTracks().forEach(track=>{
         peerConnection.addTrack(track,localStream);
        });
    }

    peerConnection.ontrack=(event)=>{
        const remoteVideo=document.getElementById("remoteVideo");
        remoteVideo.srcObject = event.streams[0];
    };
    

    peerConnection.onicecandidate=(event)=>{
        if(event.candidate){
            socket.emit('ice-candidate',{ice:event.candidate,to:receiverId});
        }
        console.log("Sent ICE candidate to", receiverId); 
    }
 }



 async function startCall(){ 
    const receiverId = document.getElementById("tools").dataset.senderid;
    await getLocalStream();
    socket.emit('call_request',{receiverId});
 }


 socket.on('call_request', async ({callerId,from}) => {
    const response = confirm(callerId+" "+from.name+" Calling you");
    await getLocalStream();
    createPeerConnection(callerId);
    if(response){
        socket.emit("call_response",{accepted:true,callerId});
    }else{
        socket.emit("call_response",{accepted:false,callerId});
    }
 })


 socket.on('call_response',async ({accepted,from}) => {
    const receiverId = document.getElementById("tools").dataset.senderid;
    if(accepted){
        console.log('call attended');
        createPeerConnection(receiverId);
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);
        socket.emit('offer',{receiverId,offer});
        console.log("Local description set .. Offer sent");
    }else{
        console.log('call denied')
    }
 })

 document.getElementById("callBtn").addEventListener('click',startCall)

 async function getLocalStream(){
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        localVideo.srcObject = stream;
        localStream = stream;
        return stream; 
    } catch (err) {
        console.error("Error accessing media devices.", err);
        throw err;
    }
}



socket.on('connect',() => {
    log("Successfully connected",socket.id)
})

$('#searchBar').on('input', async () => {
    $('#searchResults').show();
    const results = $('#searchResults');
    const name = $('#searchBar').val().trim();
    results.empty();
    if (!name) {
        console.log(name);
        return;
    }

    try {
        const response = await fetch(`/users?name=${encodeURIComponent(name)}`);
        const data = await response.json();

        if (data.length === 0) {
            results.append('<div>No user found</div>');
        } else {
            data.forEach(user => {
                results.append(`<div data-id=${user.id}>${user.username}</div>`);
            });
        }
    } catch (err) {
        console.log('Error fetching users:', err);
        results.append('<div>No users found</div>');
    }
});

$('#searchBar').on('blur', function() {
    setTimeout(() => {
        $('#searchBar').val("");
        $('#searchResults').hide();

    }, 300); 
});

$('#searchResults').on('click', 'div', (e) => {
    
    const friendId = e.target.dataset.id;
    console.log(friendId);
    $('#chat-username').text(e.target.innerText);
    $('#tools').attr('data-senderid',friendId);
    currentChatWindow = friendId;
    $('#chatBoxContainer').empty();
    renderHistory(friendId);
    if(notifications.has(friendId)){
        renderNotificationMessages(friendId);
        notifications.delete(friendId);
    }
});

function renderHistory(id){
   if(msgHistory.has(id)){
        const messages = msgHistory.get(id);
        messages.forEach(msg => {
            $('#chatBoxContainer').append(`<div class="message ${msg.status === "received" ? "received" : "sent" }">${msg.msg}</div>`);
        })
   }
}

function renderNotificationMessages(id){
    console.log("loading");
    console.log(notifications.get(id));
    if(!msgHistory.has(id)){
        msgHistory.set(id, [] );
    }
    notifications.get(id).forEach( val => {
        $('#chatBoxContainer').append(`<div class="message received">${val}</div>`);
        msgHistory.get(id).push({msg : val , status : "received"});
    })
}

socket.on('offer',async ({offer,from}) => {    
    console.log("Offer received.. Creating answer to : ", from.name);
    await peerConnection.setRemoteDescription(offer);     
    const answer = await peerConnection.createAnswer();
    socket.emit("answer",{answer, id: from.id})
    await peerConnection.setLocalDescription(answer);
    console.log("Answer sent for  ",from.id);
})

socket.on('answer',async ({answer,id}) => {
    await peerConnection.setRemoteDescription(answer);
    console.log("Remote description added from ",id);
})


socket.on("ice-candidate",async ({ice,sender_id}) => {
    if(!peerConnection){
        console.log('peer connection not assigned yet');
    }
    await peerConnection.addIceCandidate(ice);
    console.log("ICE candidate added from ",sender_id);
})

socket.on("new_msg", (data) => {
    console.log("New message received:");
    console.log("From:", data.from);
    console.log("Message:", data.msg);

    if(currentChatWindow === data.from){
        $('#chatBoxContainer').append(`<div class="message received">${data.msg}</div>`);
        if(!msgHistory.has(data.from)){
            msgHistory.set(data.from, [] );
        }
        msgHistory.get(data.from).push({msg : data.msg , status : "received"});
    }else{
        console.log(" Notification : " + data.msg)
        if(!notifications.has(data.from)){
            notifications.set(data.from,[]);
        }
        notifications.get(data.from).push(data.msg);
        console.log(notifications)
    }
});



socket.on("msg_not_send", (msg) => {
    console.warn(msg);
});

socket.on("can_not_call",(err) => {
    console.warn(err);
})


function sendMessage() {
    const receiverId = document.getElementById("tools").dataset.senderid;
    const message = document.getElementById("messageInp").value;

    $('#chatBoxContainer').append(
        `<div class="message sent">${message}</div>`
    );

    if(!msgHistory.has(receiverId)){
        msgHistory.set(receiverId, [] );
    }

    msgHistory.get(receiverId).push({msg : message , status : "sended"});

    socket.emit("send_message", {
      receiver_id: receiverId,
      msg: message
    });
}

document.querySelector('button[class="send-btn"]').addEventListener('click',sendMessage);
