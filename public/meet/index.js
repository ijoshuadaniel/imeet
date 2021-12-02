const videoContainer = document.querySelector('.main-video');
const myVideo = document.getElementById('myvideo');
const microphone = document.getElementById('microphone');
const videoSpan = document.getElementById('showVideo');
const sidebarIcon = document.getElementById('togglechat');
const allParticipants = document.getElementById('all-participants');
const participants = document.getElementById('participants-window');
const chatWindow = document.getElementById('chat-window');
const chatBoxArea = document.getElementById('chat-box-area');
const inputValue = document.getElementById('msg-text-box');

let myStream;
let myData;
let isMuted = true;
let isVideo = true;
let sidebar = true;

// connection to peer js
const peer = new Peer(undefined);

// conncection to socket
const socket = io('/');
const peers = {}; // all peer connections

//chat box input on key press
inputValue.addEventListener('keydown', (e) => {
  console.log(e);
  if (e.key === 'Enter') sendMessage();
});

// audio Unmted button
const audioUnmuted = document.createElement('i');
audioUnmuted.setAttribute('class', 'fas fa-microphone-alt top-icon');

// audio muted button
const audioMuted = document.createElement('i');
audioMuted.setAttribute('class', 'fas fa-microphone-alt-slash top-icon');

// appending buttons
microphone.append(audioUnmuted);

// show video button
const showVideo = document.createElement('i');
showVideo.setAttribute('class', 'fas fa-video top-icon');

// hide video button
const hideVideo = document.createElement('i');
hideVideo.setAttribute('class', 'fas fa-video-slash top-icon');

// append video button
videoSpan.append(showVideo);

// chat icon button
const chatIcon = document.createElement('i');
chatIcon.setAttribute('class', 'far fa-comment-alt top-icon');

// users icon button
const peeopleIcon = document.createElement('i');
peeopleIcon.setAttribute('class', 'fas fa-users top-icon');

// appending users and chat icon
sidebarIcon.append(chatIcon);

// handling mute and unmute
const handleMuted = () => {
  microphone.innerHTML = '';
  if (isMuted) {
    microphone.append(audioUnmuted);
    myStream.getAudioTracks()[0].enabled = true;
    isMuted = false;
  } else {
    microphone.append(audioMuted);
    myStream.getAudioTracks()[0].enabled = false;
    isMuted = true;
  }
};

// handle show and hide video
const handleVideo = () => {
  videoSpan.innerHTML = '';
  if (isVideo) {
    videoSpan.append(hideVideo);
    myStream.getVideoTracks()[0].enabled = false;
    myStream.innerHTML = 'Hello';
    isVideo = false;
  } else {
    videoSpan.append(showVideo);
    myStream.getVideoTracks()[0].enabled = true;
    isVideo = true;
  }
};

// helper function to handle add video
const handleAddVideo = (video, stream) => {
  video.srcObject = stream;
  video.muted = true;
  video.addEventListener('loadedmetadata', () => {
    video.play();
  });
  videoContainer.append(video);
};

/// on peer connection open sending all the user data and setting mydata
peer.on('open', (id) => {
  socket.emit('my-data', {
    name,
    email,
    roomId,
    id,
  });
  myData = {
    name,
    email,
    roomId,
    id,
  };
});

// connecting to new peer user
const connectToUser = (data, stream, video) => {
  const call = peer.call(data.id, stream);
  call.on('stream', (videoStream) => {
    video.srcObject = videoStream;
    video.addEventListener('loadedmetadata', () => {
      video.play();
    });
    videoContainer.append(video);
  });
  call.on('close', () => {
    video.remove();
  });
  peers[data.id] = call;
};

// getting audio and video stream
navigator.mediaDevices
  .getUserMedia({
    audio: true,
    video: true,
  })
  .then((stream) => {
    myStream = stream;
    handleAddVideo(myVideo, stream);
    socket.on('userConnected', (data) => {
      const video = document.createElement('video');
      connectToUser(data, stream, video);
    });

    /// peer on incomming call answering
    peer.on('call', (call) => {
      call.answer(stream);
      const video = document.createElement('video');
      call.on('stream', (stream) => {
        handleAddVideo(video, stream);
      });
    });
  });

// screen sharing
const shareScreen = () => {
  navigator.mediaDevices
    .getDisplayMedia({
      video: true,
    })
    .then((stream) => {
      myStream = stream;
      handleAddVideo(myVideo, stream);
    });
};

// on allUsers trigger to UI
socket.on('allUsers', (data) => {
  addParticipants(data);
});

// on user disconnect removing the user
socket.on('user-disconnected', (userId) => {
  if (peers[userId]) peers[userId].close();
});

socket.on('userLeft', (data) => {
  // console.log(data);
});

// checking if user exist
socket.on('userExist', (data) => {
  if (data.email === myData.email) {
    alert('user Exist');
    window.location.href = '/';
  }
});

// checking if receving message
socket.on('receivedMsg', (data) => {
  const name = data.email === myData.email ? 'You' : data.name;
  const html = `
  ${
    name === 'You'
      ? "<div style='width:100%;display:flex;align-items:flex-start;justify-content:flex-start;flex-direction:column;'>"
      : "<div style='width:100%;display:flex;align-items:flex-end;justify-content:flex-end;flex-direction:column;'>"
  }
  <div class='message-box'>
  <p class='message-box-msg'>${data.msg}</p>
  </div>
  <p class='message-box-name' style='text-align:end;font-size:8px;color:white;margin:0 0.3rem;'>${name}</p>
  </div>
  `;
  chatBoxArea.innerHTML += html;
});

// on leave meeting
const leaveMeeting = () => {
  socket.emit('leave-meeting', myData);
  window.location.href = '/';
};

// adding participants to ui
const addParticipants = (allUsers) => {
  allParticipants.innerHTML = '';
  allUsers.forEach((user) => {
    if (user.roomId !== myData.roomId) return;
    const loop = `
    <div class='all-participants-data'> 
    <span>${user.name[0]}</span>
    <div class='all-participants-data2'>
    <p>${user.name}</p>
    <p>${user.email}</p>
    </div>
    </div>
    `;
    allParticipants.innerHTML += loop;
  });
};

// toggling chat and users
const toggleChat = () => {
  sidebarIcon.innerHTML = '';
  if (sidebar) {
    chatWindow.classList.remove('none');
    participants.classList.add('none');
    sidebarIcon.append(peeopleIcon);
    sidebar = false;
  } else {
    participants.classList.remove('none');
    chatWindow.classList.add('none');
    sidebarIcon.append(chatIcon);
    sidebar = true;
  }
};

// sending text input
const sendMessage = () => {
  if (inputValue.value === '') return;
  socket.emit('text-message', {
    ...myData,
    msg: inputValue.value,
  });
  document.getElementById('msg-text-box').value = '';
};
