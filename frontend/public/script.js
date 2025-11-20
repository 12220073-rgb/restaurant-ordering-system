// Carousel Navigation Controls
document.addEventListener("DOMContentLoaded", () => {
  const carousels = document.querySelectorAll('.carousel-wrapper');

  carousels.forEach(wrapper => {
    const carousel = wrapper.querySelector('.carousel');
    const leftBtn = wrapper.querySelector('.nav.left');
    const rightBtn = wrapper.querySelector('.nav.right');

    leftBtn.addEventListener('click', () => {
      carousel.scrollBy({ left: -300, behavior: 'smooth' });
    });

    rightBtn.addEventListener('click', () => {
      carousel.scrollBy({ left: 300, behavior: 'smooth' });
    });
  });
});

window.onload = function() {
  const popup = document.getElementById('popupWelcome');
  if (popup) {
    popup.classList.add('show'); // Show popup

    setTimeout(() => {
      popup.classList.remove('show'); // Hide popup after 4 seconds
    }, 4000);
  }
};
