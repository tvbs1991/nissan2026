let verticalSwiper = null;
let wheelAccumulator = 0;
let isSwiping = false;
let isDesktop = true;
const wheelThreshold = 150;
const cooldownTime = 650;

isDesktop = window.innerWidth >= 1180;

document.addEventListener('DOMContentLoaded', () => {

  if (isDesktop) {
      document.querySelectorAll('.swiper-v').forEach((swiperEl) => {
        verticalSwiper = new Swiper(swiperEl, {
          direction: 'vertical',
          loop: false,
          speed: 1500,
          effect: 'slide',
          autoplay: false,
          simulateTouch: false,
          keyboard: false,
          mousewheel: false,
        });
      });

      document.addEventListener('wheel', handleWheel, { passive: false });
  }

  document.querySelectorAll('.swiper-h').forEach((swiperEl) => {

    const isKicksOrSentra = swiperEl.classList.contains('KICKS') || swiperEl.classList.contains('SENTRA');

    const paginationSetting = isKicksOrSentra
      ? { el: swiperEl.querySelector('.swiper-pagination'), clickable: true, renderBullet: (index, className) => `<span class="${className} custom-bullet">${index + 1}</span>` }
      : { el: swiperEl.querySelector('.swiper-pagination'), clickable: true };

    const horizontalSwiper = new Swiper(swiperEl, {
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

    // horizontalSwiper.on('slideChange', () => {
    //   triggerFadeInElements();
    // });

  });

  const goToTopBtn = document.querySelector('.go-to-top-btn');
  const headerEl = document.querySelector('header');
  
  if (goToTopBtn) {
    if(verticalSwiper){
      verticalSwiper.on('slideChange', () => {
        if (verticalSwiper.activeIndex === 0) {
          goToTopBtn.classList.remove('show');
          if (headerEl) headerEl.classList.remove('hide');
        } else {
          goToTopBtn.classList.add('show');
          if (headerEl) headerEl.classList.add('hide');
        }

        triggerFadeInElements();
      });

      goToTopBtn.addEventListener('click', () => {
        verticalSwiper.slideTo(0);
      });
    } else {

      const panelEl = document.querySelector('.swiper-wrapper-v');
      (panelEl || window).addEventListener('scroll', () => {
        const scrollTop = panelEl ? panelEl.scrollTop : window.scrollY;
        if (scrollTop > 0) {
          goToTopBtn.classList.add('show');
          if (headerEl) headerEl.classList.add('hide');
        } else {
          goToTopBtn.classList.remove('show');
          if (headerEl) headerEl.classList.remove('hide');
        }
      });

      goToTopBtn.addEventListener('click', () => {
        if (panelEl) {
          panelEl.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      });
    }
  }

  const navKicksBtn = document.querySelectorAll('.nav-kicks-btn');
  navKicksBtn.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (isDesktop) {
        verticalSwiper.slideTo(2);
      } else {
        const panelEl = document.querySelector('.swiper-wrapper-v');
        const kicksSlide = document.querySelectorAll('.swiper-wrapper-v > .swiper-slide')[2];
        if (panelEl && kicksSlide) {
          panelEl.scrollTo({ top: kicksSlide.offsetTop, behavior: 'smooth' });
        }
      }
    });
  });

  const navSentraBtn = document.querySelectorAll('.nav-sentra-btn');
  navSentraBtn.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (isDesktop) {
        verticalSwiper.slideTo(3);
      } else {
        const panelEl = document.querySelector('.swiper-wrapper-v');
        const sentraSlide = document.querySelectorAll('.swiper-wrapper-v > .swiper-slide')[3];
        if (panelEl && sentraSlide) {
          panelEl.scrollTo({ top: sentraSlide.offsetTop, behavior: 'smooth' });
        }
      }
    });
  });

  const popupOverlay = document.getElementById('popupOverlay');
  const popupClose = document.getElementById('popupClose');
  const popupVideo = document.getElementById('popupVideo');
  const tvcPlayButtons = document.querySelectorAll('.tvc-info .play-box, .banner-box .play-box');

  tvcPlayButtons.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      console.log(btn.dataset)
      const videoUrl = btn.dataset.video_url || 'https://www.youtube.com/embed/dQw4w9WgXcQ';
      
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
  if (!verticalSwiper || isSwiping) return;

  e.preventDefault();

  const deltaY = e.deltaY;
  wheelAccumulator += deltaY;

  if (Math.abs(wheelAccumulator) >= wheelThreshold) {
    const direction = wheelAccumulator > 0 ? 'next' : 'prev';
    performSwipe(direction);
    
    wheelAccumulator = 0;
  }
}

function performSwipe(direction) {
  const currentSlide = verticalSwiper.slides[verticalSwiper.activeIndex];
  const horizontalSwiper = currentSlide?.querySelector('.swiper-h')?.swiper;

  isSwiping = true; // 鎖定

  if (horizontalSwiper) {
    const isAtStart = horizontalSwiper.isBeginning;
    const isAtEnd = horizontalSwiper.isEnd;

    if (direction === 'next') {
      if (isAtEnd) {
        verticalSwiper.slideNext();
      } else {
        horizontalSwiper.slideNext();
      }
    } else {
      if (isAtStart) {
        verticalSwiper.slidePrev();
      } else {
        horizontalSwiper.slidePrev();
      }
    }
  } else {
    if (direction === 'next') {
      verticalSwiper.slideNext();
    } else {
      verticalSwiper.slidePrev();
    }
  }

  setTimeout(() => {
    isSwiping = false;
    wheelAccumulator = 0;
  }, cooldownTime);
}

let wheelTimer = null;
document.addEventListener('wheel', (e) => {
  handleWheel(e);
  
  clearTimeout(wheelTimer);
  wheelTimer = setTimeout(() => {
    if (!isSwiping) wheelAccumulator = 0;
  }, 150);
}, { passive: false });

function triggerFadeInElements() {
  const currentSlide = verticalSwiper.slides[verticalSwiper.activeIndex];
  if (!currentSlide) return;

  const fadeInElements = currentSlide.querySelectorAll('.fade-in, .fade-in-up, .fade-in-up2, .fade-in-down, .fade-in-left,  .fade-in-left2, .fade-in-right, .fade-in-right2');


  fadeInElements.forEach((element) => {
    element.style.animation = 'none';
    setTimeout(() => {
      element.style.animation = '';
    }, 10);
  });
}

window.addEventListener('resize', () => {
  isDesktop = window.innerWidth >= 1180;

  if (isDesktop) {
      document.querySelectorAll('.swiper-v').forEach((swiperEl) => {
        verticalSwiper = new Swiper(swiperEl, {
          direction: 'vertical',
          loop: false,
          speed: 1500,
          effect: 'slide',
          autoplay: false,
          simulateTouch: false,
          keyboard: false,
          mousewheel: false,
        });
      });
      document.addEventListener('wheel', handleWheel, { passive: false });
  } else {
      if (verticalSwiper) {
        verticalSwiper.destroy(true, true);
        verticalSwiper = null;
      }
      document.removeEventListener('wheel', handleWheel, { passive: false });
  }

  //重新綁定全部按鈕事件
  // document.querySelectorAll('.nav-kicks-btn').forEach((btn) => {
  //   btn.removeEventListener('click', handleNavKicksClick);
  //   btn.addEventListener('click', handleNavKicksClick);
  // });

  // document.querySelectorAll('.nav-sentra-btn').forEach((btn) => {
  //   btn.removeEventListener('click', handleNavSentraClick);
  //   btn.addEventListener('click', handleNavSentraClick);
  // });
});
