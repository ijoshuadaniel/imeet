const name = document.getElementById('userName');
const email = document.getElementById('email');
const inputRoomId = document.getElementById('roomId');

const joinMeeting = document.getElementById('joinMeeting');

joinMeeting.addEventListener('click', (e) => {
  const nameValue = name.value;
  const emailValue = email.value;
  const roomValue = inputRoomId.value;
  let roomValueId;
  if (nameValue === '' || emailValue === '') return;
  if (roomValue === '') {
    roomValueId = roomId;
  } else {
    roomValueId = roomValue;
  }

  const isValidEmail = emailValue.match(
    /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  );

  const emailError = document.getElementById('error-email');

  if (!isValidEmail) {
    emailError.innerText = 'please enter a valid email.';
    setTimeout(() => {
      emailError.innerText = '';
    }, 2000);
    return;
  }

  e.preventDefault();
  const url = `/meet/${nameValue}/${emailValue}/${roomValueId}`;
  window.location.href = url;
});
