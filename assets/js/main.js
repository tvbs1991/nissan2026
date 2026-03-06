let verticalSwiper = null;
let currentHorizontalSwiper = null;

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.swiper-v').forEach((swiperEl) => {
    verticalSwiper = new Swiper(swiperEl, {
      direction: 'vertical',
      loop: false,
      speed: 1500,
      effect: 'creative',
      creativeEffect: {
        prev: {
          shadow: true,
          translate: [0, 0, -400],
        },
        next: {
          shadow: true,
          translate: [0, "100%", 0],
        },
      },
      autoplay: false,
      simulateTouch: false,
      keyboard: false,
      mousewheel: false,
    });
  });

  document.querySelectorAll('.swiper-h').forEach((swiperEl) => {

    const isKicksOrSentra = swiperEl.classList.contains('KICKS') || swiperEl.classList.contains('SENTRA');

    const paginationSetting = isKicksOrSentra
      ? { el: swiperEl.querySelector('.swiper-pagination'), clickable: true, renderBullet: (index, className) => `<span class="${className} custom-bullet">${index + 1}</span>` }
      : { el: swiperEl.querySelector('.swiper-pagination'), clickable: true };

    const swiper = new Swiper(swiperEl, {
      direction: 'horizontal',
      loop: false,
      speed: 1000,
      effect: 'fade',
      fadeEffect: {
        crossFade: true
      },
      autoplay: false,
      pagination: paginationSetting,
      simulateTouch: false,
      keyboard: false,
      mousewheel: false,
    });
  });

  document.addEventListener('wheel', handleWheel, { passive: false });

  const goToTopBtn = document.querySelector('.go-to-top-btn');
  const headerEl = document.querySelector('header');
  
  if (goToTopBtn) {
    verticalSwiper.on('slideChange', () => {
      if (verticalSwiper.activeIndex === 0) {
        goToTopBtn.classList.remove('show');
        if (headerEl) headerEl.classList.remove('hide');
      } else {
        goToTopBtn.classList.add('show');
        if (headerEl) headerEl.classList.add('hide');
      }
    });

    goToTopBtn.addEventListener('click', () => {
      verticalSwiper.slideTo(0);
    });
  }

  const navSentraBtn = document.querySelector('.nav-sentra-btn');
  const kicksNextBtn = document.querySelector('.kicks-next-btn');
  if (kicksNextBtn) {
    kicksNextBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      verticalSwiper.slideTo(3);
    });
  }
  if (navSentraBtn) {
    navSentraBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      verticalSwiper.slideTo(3);
    });
  }

  const navKicksBtn = document.querySelector('.nav-kicks-btn');
  const sentraPreviousBtn = document.querySelector('.sentra-previous-btn');
  if (sentraPreviousBtn) {
    sentraPreviousBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      verticalSwiper.slideTo(2);
    });
  }
  if (navKicksBtn) {
    navKicksBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      verticalSwiper.slideTo(2);
    });
  }

  const popupOverlay = document.getElementById('popupOverlay');
  const popupClose = document.getElementById('popupClose');
  const popupVideo = document.getElementById('popupVideo');
  const tvcPlayButtons = document.querySelectorAll('.tvc-info .play-box .play-btn');

  tvcPlayButtons.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      const videoUrl = btn.dataset.videoUrl || 'https://www.youtube.com/embed/dQw4w9WgXcQ';
      
      popupVideo.src = videoUrl;
      popupOverlay.classList.add('show');
      popupOverlay.classList.remove('hide');
    });
  });

  const closePopup = () => {
    popupOverlay.classList.remove('show');
    popupOverlay.classList.add('hide');
    
    setTimeout(() => {
      popupVideo.src = '';
    }, 600);
  };

  popupClose.addEventListener('click', closePopup);

  popupOverlay.addEventListener('click', (e) => {
    if (e.target === popupOverlay) {
      closePopup();
    }
  });
});

function handleWheel(e) {
  if (!verticalSwiper) return;

  const currentSlide = verticalSwiper.slides[verticalSwiper.activeIndex];
  const horizontalSwiper = currentSlide?.querySelector('.swiper-h')?.swiper;

  const deltaY = e.deltaY;

  e.preventDefault();

  if (horizontalSwiper) {
    const isHSwipperAtStart = horizontalSwiper.activeIndex === 0;
    const isHSwipperAtEnd = horizontalSwiper.activeIndex === horizontalSwiper.slides.length - 1;

    if (deltaY > 0) {
      if (isHSwipperAtEnd) {
        verticalSwiper.slideNext();
      } else {
        horizontalSwiper.slideNext();
      }
    } else {
      if (isHSwipperAtStart) {
        verticalSwiper.slidePrev();
      } else {
        horizontalSwiper.slidePrev();
      }
    }
  } else {
    if (deltaY > 0) {
      verticalSwiper.slideNext();
    } else {
      verticalSwiper.slidePrev();
    }
  }
}


