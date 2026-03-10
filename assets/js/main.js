const triggeredSlides = new Set();
const wheelThreshold = 150;
const cooldownTime = 650;
const mobileWindowWidth = 1180;
const fadeInCooldowns = new Map();
const fadeInCooldownTime = 3000;

let verticalSwiper = null;
let isSwiping = false;
let isDesktop = window.innerWidth >= mobileWindowWidth;
let isLandscape = window.matchMedia('(orientation: landscape)').matches;
let resizeTimer = null;
let wheelTimer = null;
let wheelAccumulator = 0;
let mobileCurrentSlideIndex = -1;
let mobileLastScrollTop = 0;

// =============================================
// Handler Functions
// =============================================

function handleLandscapeChange() {
  window.matchMedia('(orientation: landscape)').addEventListener('change', (e) => {
    isLandscape = e.matches;
    if(isLandscape){
      document.body.classList.add('landscape');
    } else {
      document.body.classList.remove('landscape');
    }
  });
}

function handleNavKicksClick(e) {
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
}

function handleNavSentraClick(e) {
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
}

function handleGoToTopClick() {
  if (isDesktop && verticalSwiper) {
    verticalSwiper.slideTo(0);
  } else {
    const panelEl = document.querySelector('.swiper-wrapper-v');
    if (panelEl) {
      panelEl.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }
}



function handleMobilePanelScroll() {
  const panelEl = document.querySelector('.swiper-wrapper-v');
  const headerEl = document.querySelector('header');
  const goToTopBtn = document.querySelector('.go-to-top-btn');
  const scrollTop = panelEl ? panelEl.scrollTop : window.scrollY;
  const scrollingDown = scrollTop > mobileLastScrollTop;
  mobileLastScrollTop = scrollTop;

  if (scrollTop > 0) {
    if (headerEl) headerEl.classList.add('hide');
    if (goToTopBtn) goToTopBtn.classList.add('show');
  } else {
    if (headerEl) headerEl.classList.remove('hide');
    if (goToTopBtn) goToTopBtn.classList.remove('show');
  }

  if (panelEl) {
    const slides = panelEl.querySelectorAll(':scope > .swiper-slide');
    const panelHeight = panelEl.clientHeight;
    
    slides.forEach((slide, i) => {
      const slideTop = slide.offsetTop - scrollTop;
      const slideRatio = slideTop / panelHeight;      
      if (scrollingDown) {
        if (slideRatio >= 0.9 && slideRatio <= 1.0){
          triggerFadeInElements(slides[i]);
        };
      } else {
        if (slideRatio >= 0.0 && slideRatio <= 0.1){        
          triggerFadeInElements(slides[i-1]);
        }
      }
    });
  }
}

function handleWheel(e) {
  if (!verticalSwiper || isSwiping) return;
  e.preventDefault();
  wheelAccumulator += e.deltaY;
  if (Math.abs(wheelAccumulator) >= wheelThreshold) {
    performSwipe(wheelAccumulator > 0 ? 'next' : 'prev');
    wheelAccumulator = 0;
  }
}

// =============================================
// Bind / Unbind
// =============================================

function bindNavButtons() {
  document.querySelectorAll('.nav-kicks-btn').forEach((btn) => {
    btn.removeEventListener('click', handleNavKicksClick);
    btn.addEventListener('click', handleNavKicksClick);
  });
  document.querySelectorAll('.nav-sentra-btn').forEach((btn) => {
    btn.removeEventListener('click', handleNavSentraClick);
    btn.addEventListener('click', handleNavSentraClick);
  });
}

function bindGoToTop() {
  const goToTopBtn = document.querySelector('.go-to-top-btn');  
  goToTopBtn.classList.remove('show');
  if (!goToTopBtn) return;
  goToTopBtn.removeEventListener('click', handleGoToTopClick);
  goToTopBtn.addEventListener('click', handleGoToTopClick);
}

function bindMobileScroll() {
  mobileCurrentSlideIndex = -1;
  mobileLastScrollTop = 0;
  triggeredSlides.clear();
  const panelEl = document.querySelector('.swiper-wrapper-v');
  const target = panelEl || window;
  target.removeEventListener('scroll', handleMobilePanelScroll);
  target.addEventListener('scroll', handleMobilePanelScroll);
}

function unbindMobileScroll() {
  const panelEl = document.querySelector('.swiper-wrapper-v');
  const target = panelEl || window;
  target.removeEventListener('scroll', handleMobilePanelScroll);
}

// =============================================
// Swiper Init / Destroy
// =============================================

function initVerticalSwiper() {
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

  const goToTopBtn = document.querySelector('.go-to-top-btn');
  const headerEl = document.querySelector('header');
  if (goToTopBtn && verticalSwiper) {
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
  }

  document.addEventListener('wheel', handleWheel, { passive: false });
}

function destroyVerticalSwiper() {
  if (verticalSwiper) {
    verticalSwiper.destroy(true, true);
    verticalSwiper = null;
  }
  triggeredSlides.clear();
  document.removeEventListener('wheel', handleWheel);
}

// =============================================
// DOMContentLoaded
// =============================================

document.addEventListener('DOMContentLoaded', () => {
  if (isDesktop) {
    initVerticalSwiper();
  } else {
    bindMobileScroll();
  }

  if(isLandscape){
    document.body.classList.add('landscape');
  } else {
    document.body.classList.remove('landscape');
  }

  handleLandscapeChange();

  document.querySelectorAll('.swiper-h').forEach((swiperEl) => {
    const isKicks  = swiperEl.classList.contains('KICKS');
    const isSentra = swiperEl.classList.contains('SENTRA');
    const isKicksOrSentra = isKicks || isSentra;
    const paginationSetting = isKicksOrSentra
      ? {
          el: swiperEl.querySelector('.swiper-pagination'),
          clickable: true,
          renderBullet: (index, className) => {
            const trackingClass = isSentra
              ? `US_N_202603_brand_sp_usp2_${index + 1}`
              : `US_N_202603_brand_sp_usp1_${index + 1}`;
            return `<span class="${className} custom-bullet ${trackingClass}">${index + 1}</span>`;
          },
        }
      : { el: swiperEl.querySelector('.swiper-pagination'), clickable: true };

    new Swiper(swiperEl, {
      direction: 'horizontal',
      loop: false,
      speed: 1000,
      effect: 'fade',
      fadeEffect: { crossFade: true },
      autoplay: false,
      pagination: paginationSetting,
      simulateTouch: false,
      keyboard: false,
      mousewheel: false,
      navigation: {
        nextEl: swiperEl.querySelector('.swiper-button-next'),
        prevEl: swiperEl.querySelector('.swiper-button-prev'),
      },
    });
  });

  bindGoToTop();
  bindNavButtons();

  // Mobile Menu
  const mobMenuOverlay = document.getElementById('mobMenuOverlay');
  const mobMenuBtn = document.querySelector('.mob-menu-btn');
  const mobMenuClose = document.getElementById('mobMenuClose');

  const openMobMenu = () => {
    mobMenuOverlay.classList.remove('hide');
    mobMenuOverlay.classList.add('show');
  };

  const closeMobMenu = () => {
    mobMenuOverlay.classList.remove('show');
    mobMenuOverlay.classList.add('hide');
  };

  if (mobMenuBtn) mobMenuBtn.addEventListener('click', openMobMenu);
  if (mobMenuClose) mobMenuClose.addEventListener('click', closeMobMenu);

  document.querySelectorAll('.mob-nav-kicks-btn, .mob-nav-sentra-btn').forEach((btn) => {
    btn.addEventListener('click', closeMobMenu);
  });

  const popupOverlay = document.getElementById('popupOverlay');
  const popupClose = document.getElementById('popupClose');
  const popupVideo = document.getElementById('popupVideo');
  const tvcPlayButtons = document.querySelectorAll('.tvc-info .play-box, .banner-box .play-box');

  tvcPlayButtons.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const videoUrl = btn.dataset.video_url || 'https://www.youtube.com/embed/fu7wIkQ95_M?autoplay=1&mute=1';
      popupVideo.src = videoUrl;
      popupOverlay.classList.add('show');
      popupOverlay.classList.remove('hide');
    });
  });

  const closePopup = () => {
    popupOverlay.classList.remove('show');
    popupOverlay.classList.add('hide');
    setTimeout(() => { popupVideo.src = ''; }, 600);
  };

  popupClose.addEventListener('click', closePopup);
  popupOverlay.addEventListener('click', (e) => {
    if (e.target === popupOverlay) closePopup();
  });
});

// =============================================
// Resize
// =============================================

window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    const wasDesktop = isDesktop;
    isDesktop = window.innerWidth >= mobileWindowWidth;

    if (isDesktop && !wasDesktop) {
      unbindMobileScroll();
      initVerticalSwiper();
      bindGoToTop();
    } else if (!isDesktop && wasDesktop) {
      destroyVerticalSwiper();
      bindMobileScroll();
      bindGoToTop();
    }
  }, 200);
});

// =============================================
// Wheel / Swipe
// =============================================

document.addEventListener('wheel', (e) => {
  if (!isDesktop) return;
  handleWheel(e);
  clearTimeout(wheelTimer);
  wheelTimer = setTimeout(() => {
    if (!isSwiping) wheelAccumulator = 0;
  }, 150);
}, { passive: false });

function performSwipe(direction) {
  const currentSlide = verticalSwiper.slides[verticalSwiper.activeIndex];
  const horizontalSwiper = currentSlide?.querySelector('.swiper-h')?.swiper;

  isSwiping = true;

  if (horizontalSwiper) {
    const isAtStart = horizontalSwiper.isBeginning;
    const isAtEnd = horizontalSwiper.isEnd;
    if (direction === 'next') {
      isAtEnd ? verticalSwiper.slideNext() : horizontalSwiper.slideNext();
    } else {
      isAtStart ? verticalSwiper.slidePrev() : horizontalSwiper.slidePrev();
    }
  } else {
    direction === 'next' ? verticalSwiper.slideNext() : verticalSwiper.slidePrev();
  }

  setTimeout(() => {
    isSwiping = false;
    wheelAccumulator = 0;
  }, cooldownTime);
}

// =============================================
// Fade In
// =============================================


function triggerFadeInElements(slideEl) {
  const targetSlide = slideEl || (verticalSwiper ? verticalSwiper.slides[verticalSwiper.activeIndex] : null);
  if (!targetSlide) return;

  if (fadeInCooldowns.has(targetSlide)) return;
  fadeInCooldowns.set(targetSlide, true);
  setTimeout(() => fadeInCooldowns.delete(targetSlide), fadeInCooldownTime);

  targetSlide.querySelectorAll('.fade-in, .fade-in-up, .fade-in-up2, .fade-in-down, .fade-in-down2, .fade-in-left, .fade-in-left2, .fade-in-right, .fade-in-right2')
    .forEach((el) => {
      el.style.animation = 'none';
      setTimeout(() => { el.style.animation = ''; }, 10);
    });
}

