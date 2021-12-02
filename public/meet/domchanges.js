const leaveModal = document.getElementById('leave-modal');

// handle modal leave
const handleLeave = () => {
  leaveModal.classList.add('is-active');
};

// handle modal cancel
const cancleLeave = () => {
  leaveModal.classList.remove('is-active');
};
