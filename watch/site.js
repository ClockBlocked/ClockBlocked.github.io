document.addEventListener('DOMContentLoaded', () => {
  const masonryGrid = document.getElementById('masonry-grid');
  const transitionOverlay = document.getElementById('transition-overlay');
  const playerContainer = document.getElementById('video-player-container');
  const mainVideo = document.getElementById('main-video');
  const btnClose = document.getElementById('btn-close');
  const btnMinimize = document.getElementById('btn-minimize');
  const btnPlayPause = document.getElementById('btn-play-pause');
  const btnMute = document.getElementById('btn-mute');
  const btnFullscreen = document.getElementById('btn-fullscreen');
  const volumeSlider = document.getElementById('volume-slider');
  const progressBar = document.getElementById('progress-bar');
  const progressContainer = document.getElementById('progress-container');
  const timeDisplay = document.getElementById('time-display');
  const metaTitle = document.getElementById('meta-title');
  const metaCategory = document.getElementById('meta-category');
  const metaDescription = document.getElementById('meta-description');

  let libraryData = [];

  fetch('./library.json')
    .then(res => res.json())
    .then(data => {
      libraryData = data;
      renderGallery(data);
    })
    .catch(err => console.error(err));

  function renderGallery(data) {
    masonryGrid.innerHTML = '';
    data.forEach(item => {
      const card = document.createElement('div');
      card.className = 'masonry-item';
      card.dataset.id = item.id;

      card.innerHTML = `
        <div class="item-thumbnail-wrapper">
          <img src="${item.cover}" class="item-thumbnail" alt="${item.title}">
          <img src="" class="item-slideshow" alt="">
          <span class="item-duration">${item.duration}</span>
          <div class="item-hover-actions">
            <button class="hover-btn action-upnext ${item.upNext ? 'active' : ''}"><i class="fa-solid fa-list-ul"></i></button>
            <button class="hover-btn action-bookmark ${item.bookmarked ? 'active' : ''}"><i class="fa-solid fa-bookmark"></i></button>
            <button class="hover-btn action-more"><i class="fa-solid fa-ellipsis-vertical"></i></button>
          </div>
        </div>
        <div class="item-details">
          <h3 class="item-title">${item.title}</h3>
          <div class="item-meta">
            <span>${item.category}</span>
          </div>
        </div>
      `;

      const wrapper = card.querySelector('.item-thumbnail-wrapper');
      const slideshowImg = card.querySelector('.item-slideshow');
      
      wrapper.addEventListener('mouseenter', () => {
        let index = 0;
        slideshowImg.src = item.thumbnails[index];
        card._slideshowInterval = setInterval(() => {
          index = (index + 1) % item.thumbnails.length;
          slideshowImg.src = item.thumbnails[index];
        }, 800);
      });

      wrapper.addEventListener('mouseleave', () => {
        clearInterval(card._slideshowInterval);
      });

      const upNextBtn = card.querySelector('.action-upnext');
      upNextBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        upNextBtn.classList.toggle('active');
      });

      const bookmarkBtn = card.querySelector('.action-bookmark');
      bookmarkBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        bookmarkBtn.classList.toggle('active');
      });

      const moreBtn = card.querySelector('.action-more');
      moreBtn.addEventListener('click', (e) => {
        e.stopPropagation();
      });

      card.addEventListener('click', (e) => {
        if (e.target.closest('.item-hover-actions')) return;
        openPlayer(item, card);
      });

      masonryGrid.appendChild(card);
    });
  }

  function openPlayer(item, card) {
    const rect = card.getBoundingClientRect();
    
    transitionOverlay.style.backgroundImage = `url(${item.cover})`;
    transitionOverlay.style.top = `${rect.top}px`;
    transitionOverlay.style.left = `${rect.left}px`;
    transitionOverlay.style.width = `${rect.width}px`;
    transitionOverlay.style.height = `${rect.height}px`;
    transitionOverlay.style.borderRadius = '12px';
    transitionOverlay.classList.remove('hidden');
    
    requestAnimationFrame(() => {
      transitionOverlay.classList.add('active');
      
      requestAnimationFrame(() => {
        const isDesktop = window.innerWidth >= 1024;
        if (isDesktop) {
          transitionOverlay.style.top = `${window.innerHeight - 350}px`;
          transitionOverlay.style.left = '0px';
          transitionOverlay.style.width = '100%';
          transitionOverlay.style.height = '350px';
          transitionOverlay.style.borderRadius = '16px 16px 0 0';
        } else {
          transitionOverlay.style.top = '0px';
          transitionOverlay.style.left = '0px';
          transitionOverlay.style.width = '100%';
          transitionOverlay.style.height = '100%';
          transitionOverlay.style.borderRadius = '0px';
        }

        setTimeout(() => {
          populatePlayer(item);
          playerContainer.classList.remove('hidden');
          
          requestAnimationFrame(() => {
            playerContainer.classList.add('visible');
            playerContainer.classList.remove('minimized');
            transitionOverlay.classList.remove('active');
            setTimeout(() => transitionOverlay.classList.add('hidden'), 600);
          });
        }, 600);
      });
    });
  }

  function populatePlayer(item) {
    mainVideo.src = item.source;
    mainVideo.poster = item.cover;
    metaTitle.textContent = item.title;
    metaCategory.textContent = item.category;
    metaDescription.textContent = item.description;
    
    mainVideo.play().then(() => {
      btnPlayPause.innerHTML = '<i class="fa-solid fa-pause"></i>';
    }).catch(err => console.error(err));
  }

  function formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }

  btnPlayPause.addEventListener('click', () => {
    if (mainVideo.paused) {
      mainVideo.play();
      btnPlayPause.innerHTML = '<i class="fa-solid fa-pause"></i>';
    } else {
      mainVideo.pause();
      btnPlayPause.innerHTML = '<i class="fa-solid fa-play"></i>';
    }
  });

  mainVideo.addEventListener('timeupdate', () => {
    const curr = mainVideo.currentTime;
    const dur = mainVideo.duration;
    if (!dur) return;
    progressBar.style.width = `${(curr / dur) * 100}%`;
    timeDisplay.textContent = `${formatTime(curr)} / ${formatTime(dur)}`;
  });

  progressContainer.addEventListener('click', (e) => {
    const rect = progressContainer.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    mainVideo.currentTime = pos * mainVideo.duration;
  });

  btnMute.addEventListener('click', () => {
    mainVideo.muted = !mainVideo.muted;
    if (mainVideo.muted) {
      btnMute.innerHTML = '<i class="fa-solid fa-volume-xmark"></i>';
      volumeSlider.value = 0;
    } else {
      btnMute.innerHTML = '<i class="fa-solid fa-volume-high"></i>';
      volumeSlider.value = mainVideo.volume;
    }
  });

  volumeSlider.addEventListener('input', (e) => {
    mainVideo.volume = e.target.value;
    mainVideo.muted = e.target.value === '0';
    btnMute.innerHTML = mainVideo.muted ? '<i class="fa-solid fa-volume-xmark"></i>' : '<i class="fa-solid fa-volume-high"></i>';
  });

  btnFullscreen.addEventListener('click', () => {
    if (mainVideo.requestFullscreen) {
      mainVideo.requestFullscreen();
    } else if (mainVideo.webkitRequestFullscreen) {
      mainVideo.webkitRequestFullscreen();
    }
  });

  btnMinimize.addEventListener('click', () => {
    playerContainer.classList.toggle('minimized');
    const isMin = playerContainer.classList.contains('minimized');
    btnMinimize.innerHTML = isMin ? '<i class="fa-solid fa-expand"></i>' : '<i class="fa-solid fa-compress"></i>';
  });

  btnClose.addEventListener('click', () => {
    mainVideo.pause();
    mainVideo.currentTime = 0;
    mainVideo.src = '';
    playerContainer.classList.remove('visible');
    setTimeout(() => {
      playerContainer.classList.add('hidden');
      playerContainer.classList.remove('minimized');
      btnMinimize.innerHTML = '<i class="fa-solid fa-compress"></i>';
    }, 500);
  });
});
