/**
 * LUXURY EDITORIAL BIRTHDAY EXPERIENCE
 * ====================================
 * Configurable Content Store
 * Edit all names, dates, photos, memories, and letter below without touching UI logic.
 */

const birthdayData = {
  girlfriendName: "YOUR GIRLFRIEND",
  yourName: "SANJAY",
  
  heroPhoto: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=2000&q=85",
  heroSubtitle: "A little collection of moments, memories and everything in between.",

  story: {
    chapterNumber: "01",
    chapterLabel: "THE BEGINNING",
    title: "Every story has a beginning.\nOurs has more than one.",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=85",
    caption: "SUMMER MEMORIES",
    text: [
      "Looking back, every path we took seemed to quietly point toward each other. From our very first quiet conversations to the days that followed, everything fell into place with a natural, effortless grace.",
      "You brought warmth into ordinary moments and turned simple days into memories I carry with me everywhere.",
      "This digital journal is a tribute to your grace, your laugh, and every single second we have shared so far."
    ]
  },

  timeline: [
    {
      number: "01",
      label: "FIRST HELLO",
      title: "Where It All Began",
      date: "THE FIRST MOMENT",
      text: "A simple introduction that quietly changed everything. Neither of us knew then how much those first few words would mean.",
      image: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=1200&q=85"
    },
    {
      number: "02",
      label: "FIRST MEMORY",
      title: "The Evening Time Stood Still",
      date: "AN UNFORGETTABLE DAY",
      text: "Hours passed like minutes. We talked about everything and nothing at all, losing track of time in the quiet stillness.",
      image: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=1200&q=85"
    },
    {
      number: "03",
      label: "UNFILTERED JOY",
      title: "The Day We Couldn't Stop Laughing",
      date: "A RANDOM AFTERNOON",
      text: "No plans, no agenda. Just pure, unscripted happiness and a smile on your face that I will never forget.",
      image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1200&q=85"
    },
    {
      number: "04",
      label: "FOREVER AHEAD",
      title: "Growing Together",
      date: "PRESENT DAY",
      text: "Through every season and every milestone, you continue to inspire me. The journey is just getting started.",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=1200&q=85"
    }
  ],

  photos: [
    {
      id: "01",
      title: "A RANDOM AFTERNOON",
      subtitle: "Soft sunlight & quiet moments",
      url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1200&q=85",
      aspect: "portrait"
    },
    {
      id: "02",
      title: "THE DAY WE COULDN'T STOP LAUGHING",
      subtitle: "Pure spontaneous joy",
      url: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1200&q=85",
      aspect: "landscape"
    },
    {
      id: "03",
      title: "SOMEWHERE BETWEEN EVERYTHING",
      subtitle: "Golden hour glow",
      url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=85",
      aspect: "square"
    },
    {
      id: "04",
      title: "ONE OF MY FAVOURITE PHOTOS OF YOU",
      subtitle: "Unfiltered elegance",
      url: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=1200&q=85",
      aspect: "portrait"
    },
    {
      id: "05",
      title: "MIDNIGHT CONVERSATIONS",
      subtitle: "Underneath the city lights",
      url: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=1200&q=85",
      aspect: "landscape"
    },
    {
      id: "06",
      title: "QUIET OBSERVATIONS",
      subtitle: "The way you look when thinking",
      url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=1200&q=85",
      aspect: "portrait"
    }
  ],

  reasons: [
    {
      number: "01",
      title: "YOUR SMILE",
      detail: "How it effortlessly lights up the room and instantly turns my day around.",
      previewImage: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=600&q=80"
    },
    {
      number: "02",
      title: "THE WAY YOU LAUGH",
      detail: "Unfiltered, genuine, and completely contagious. It's my favorite sound.",
      previewImage: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80"
    },
    {
      number: "03",
      title: "THE WAY YOU CARE",
      detail: "Your empathy and the subtle ways you show kindness to everyone around you.",
      previewImage: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80"
    },
    {
      number: "04",
      title: "YOUR LITTLE HABITS",
      detail: "The adorable quirks and small rituals that make you entirely unique.",
      previewImage: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=600&q=80"
    },
    {
      number: "05",
      title: "HOW YOU MAKE ORDINARY DAYS SPECIAL",
      detail: "Even simple walks or coffee runs feel like meaningful adventures with you.",
      previewImage: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=600&q=80"
    }
  ],

  memories: [
    {
      category: "CONVERSATIONS",
      title: "The 3 AM Phone Calls",
      preview: "Talking about everything from deep philosophies to silly stories until the sun came up.",
      text: "I still remember those late-night calls where time seemed to completely lose all meaning. We talked about our childhoods, our dreams, and everything in between. Those quiet hours laid the foundation for everything we have today.",
      image: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=1000&q=85"
    },
    {
      category: "LATE NIGHTS",
      title: "City Lights & Late Drives",
      preview: "Windows down, music playing softly, and no specific destination in mind.",
      text: "Driving through quiet city streets late at night, watching the yellow lights blur past while your favorite playlist played in the background. It was simple, calm, and perfect.",
      image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1000&q=85"
    },
    {
      category: "FUNNY MOMENTS",
      title: "The Inside Jokes",
      preview: "That one phrase that makes us instantly burst out laughing in public.",
      text: "We have developed our own secret language over time. Just a single look across a crowded room is enough to send us into fits of laughter while everyone else wonders what's so funny.",
      image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1000&q=85"
    },
    {
      category: "PLACES",
      title: "Our Quiet Corner",
      preview: "The cozy spot where we spent endless afternoons drinking tea and reading.",
      text: "Tucked away from the noise of the world, that little corner table became our sanctuary. Every time I visit, I am instantly reminded of your warmth.",
      image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1000&q=85"
    }
  ],

  conversations: [
    {
      quote: "I still remember when you said, 'I think some people enter our lives exactly when they are supposed to.'",
      date: "OCTOBER 14, 2024"
    },
    {
      quote: "You smiled and said, 'It's the little quiet moments that matter the most.'",
      date: "DECEMBER 28, 2024"
    },
    {
      quote: "You looked at me and whispered, 'Thank you for making me feel so understood.'",
      date: "FEBRUARY 14, 2025"
    }
  ],

  letterDate: "SEPTEMBER 16",
  letter: `
    <p><span class="first-letter">D</span>ear ${"HER NAME"},</p>
    <p>As I sit down to write this, I wanted to create something timeless — a quiet space dedicated entirely to you and the incredible person you are.</p>
    <p>Happy Birthday. Thank you for filling my world with so much warmth, grace, and genuine joy. From our small everyday conversations to the bigger milestones, sharing life with you has been one of the greatest privileges I have ever known.</p>
    <p>You have an extraordinary gift for making ordinary moments feel like poetry. The way you listen, the way you smile when you're truly happy, and the kindness you extend to everyone around you is something I admire more than words can express.</p>
    <p>As you step into another beautiful year, I hope it brings you all the peace, ambition, happiness, and love that you deserve. Whatever lies ahead, I am so grateful to walk alongside you.</p>
    <p>Happy Birthday, my love.</p>
  `,

  finalPhoto: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=1800&q=85"
};

/* ==========================================================================
   UI CONTROLLER & EDITORIAL INTERACTION LOGIC
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initDataBinding();
  initCustomCursor();
  initNavbarScroll();
  initMobileMenu();
  initRenderTimeline();
  initRenderArchive();
  initRenderReasons();
  initRenderMemories();
  initRenderConversations();
  initScrollAnimations();
  initLightboxModal();
  initMemoryModal();
  initLetterToggle();
});

/* 1. Populate Text & Names Across DOM */
function initDataBinding() {
  const gName = birthdayData.girlfriendName || "HER NAME";
  const yName = birthdayData.yourName || "SANJAY";

  // Navigation Brand
  const brandHer = document.getElementById('brandHer');
  const brandSanjay = document.getElementById('brandSanjay');
  if (brandHer) brandHer.textContent = gName;
  if (brandSanjay) brandSanjay.textContent = yName;

  // Hero Section
  const heroHerName = document.getElementById('heroHerName');
  const heroSubtitle = document.getElementById('heroSubtitle');
  const heroImage = document.getElementById('heroImage');
  if (heroHerName) heroHerName.textContent = gName;
  if (heroSubtitle) heroSubtitle.textContent = birthdayData.heroSubtitle;
  if (heroImage && birthdayData.heroPhoto) heroImage.src = birthdayData.heroPhoto;

  // Story Section
  const storyTitle = document.getElementById('storyTitle');
  const storyPhoto = document.getElementById('storyPhoto');
  const storyTextContainer = document.getElementById('storyText');
  const storyCaption = document.getElementById('storyCaption');

  if (storyTitle && birthdayData.story.title) {
    storyTitle.innerHTML = birthdayData.story.title.replace(/\n/g, '<br>');
  }
  if (storyPhoto && birthdayData.story.image) storyPhoto.src = birthdayData.story.image;
  if (storyCaption && birthdayData.story.caption) storyCaption.textContent = birthdayData.story.caption;

  if (storyTextContainer && Array.isArray(birthdayData.story.text)) {
    storyTextContainer.innerHTML = birthdayData.story.text
      .map(paragraph => `<p>${paragraph}</p>`)
      .join('');
  }

  // Final Section
  const finalHerName = document.getElementById('finalHerName');
  const finalSignature = document.getElementById('finalSignature');
  const finalPhoto = document.getElementById('finalPhoto');
  if (finalHerName) finalHerName.textContent = gName;
  if (finalSignature) finalSignature.textContent = `— ${yName}`;
  if (finalPhoto && birthdayData.finalPhoto) finalPhoto.src = birthdayData.finalPhoto;
}

/* 2. Custom Cursor */
function initCustomCursor() {
  const dot = document.getElementById('cursorDot');
  const follower = document.getElementById('cursorFollower');
  const text = document.getElementById('cursorText');

  if (!dot || !follower || window.matchMedia('(max-width: 991px)').matches) return;

  let mouseX = 0, mouseY = 0;
  let followerX = 0, followerY = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
  });

  function renderCursor() {
    followerX += (mouseX - followerX) * 0.15;
    followerY += (mouseY - followerY) * 0.15;
    follower.style.transform = `translate(${followerX}px, ${followerY}px)`;
    requestAnimationFrame(renderCursor);
  }
  renderCursor();

  // Hover triggers for images and links
  document.querySelectorAll('a, button, .archive-item, .reason-item, .memory-card').forEach(el => {
    el.addEventListener('mouseenter', () => {
      follower.classList.add('active');
      if (el.classList.contains('archive-item')) {
        follower.classList.add('cursor-view');
        if (text) text.textContent = 'VIEW';
      }
    });

    el.addEventListener('mouseleave', () => {
      follower.classList.remove('active', 'cursor-view');
      if (text) text.textContent = '';
    });
  });
}

/* 3. Header Scroll Glass Effect */
function initNavbarScroll() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 80) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });
}

/* 4. Mobile Drawer Menu */
function initMobileMenu() {
  const toggle = document.getElementById('mobileToggle');
  const drawer = document.getElementById('mobileDrawer');
  const links = document.querySelectorAll('.drawer-link');

  if (!toggle || !drawer) return;

  toggle.addEventListener('click', () => {
    toggle.classList.toggle('open');
    drawer.classList.toggle('open');
    document.body.classList.toggle('menu-open');
  });

  links.forEach(link => {
    link.addEventListener('click', () => {
      toggle.classList.remove('open');
      drawer.classList.remove('open');
      document.body.classList.remove('menu-open');
    });
  });
}

/* 5. Render Editorial Timeline Spreads */
function initRenderTimeline() {
  const container = document.getElementById('timelineContainer');
  if (!container || !Array.isArray(birthdayData.timeline)) return;

  container.innerHTML = birthdayData.timeline.map((item, idx) => {
    const isEven = idx % 2 === 1;
    return `
      <div class="timeline-spread reveal ${isEven ? 'spread-reverse' : ''}">
        <div class="spread-image-col">
          <div class="spread-frame">
            <img src="${item.image}" alt="${item.title}" class="spread-image">
            <span class="spread-num">${item.number}</span>
          </div>
        </div>
        <div class="spread-text-col">
          <span class="spread-label">${item.label}</span>
          <h3 class="spread-title font-serif">${item.title}</h3>
          <span class="spread-date">${item.date}</span>
          <p class="spread-text">${item.text}</p>
        </div>
      </div>
    `;
  }).join('');
}

/* 6. Render Asymmetric Photo Archive Grid */
function initRenderArchive() {
  const container = document.getElementById('archiveGallery');
  if (!container || !Array.isArray(birthdayData.photos)) return;

  container.innerHTML = birthdayData.photos.map((photo, idx) => {
    return `
      <div class="archive-item archive-${photo.aspect || 'portrait'} reveal" data-index="${idx}">
        <div class="archive-image-wrapper">
          <img src="${photo.url}" alt="${photo.title}" class="archive-img">
          <div class="archive-overlay">
            <span class="archive-number">${photo.id || (idx + 1).toString().padStart(2, '0')}</span>
            <div class="archive-caption-box">
              <h4 class="archive-title font-serif">${photo.title}</h4>
              <p class="archive-subtitle">${photo.subtitle || ''}</p>
            </div>
            <span class="archive-action">VIEW MEMORY →</span>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

/* 7. Render Numbered Reflections / Reasons List */
function initRenderReasons() {
  const container = document.getElementById('reasonsContainer');
  if (!container || !Array.isArray(birthdayData.reasons)) return;

  container.innerHTML = birthdayData.reasons.map((item) => {
    return `
      <div class="reason-item reveal">
        <div class="reason-left">
          <span class="reason-num">${item.number}</span>
          <h3 class="reason-title font-serif">${item.title}</h3>
        </div>
        <div class="reason-right">
          <p class="reason-detail">${item.detail}</p>
        </div>
        ${item.previewImage ? `
          <div class="reason-preview-pop">
            <img src="${item.previewImage}" alt="${item.title}">
          </div>
        ` : ''}
        <div class="reason-border-line"></div>
      </div>
    `;
  }).join('');
}

/* 8. Render Keepsake Memories Cards */
function initRenderMemories() {
  const grid = document.getElementById('memoriesGrid');
  const filterBtns = document.querySelectorAll('#memoryFilters .filter-btn');
  if (!grid || !Array.isArray(birthdayData.memories)) return;

  function renderGrid(cat = 'ALL') {
    const filtered = cat === 'ALL'
      ? birthdayData.memories
      : birthdayData.memories.filter(m => m.category === cat);

    grid.innerHTML = filtered.map((mem, idx) => {
      return `
        <div class="memory-card reveal" data-index="${idx}" data-category="${mem.category}">
          <span class="memory-category">${mem.category}</span>
          <h4 class="memory-title font-serif">${mem.title}</h4>
          <p class="memory-preview">${mem.preview}</p>
          <div class="memory-card-footer">
            <span class="memory-read-btn">READ KEEPSAKE →</span>
          </div>
        </div>
      `;
    }).join('');

    // Re-attach scroll reveal observer to new items
    initScrollAnimations();
    attachMemoryCardListeners();
  }

  renderGrid('ALL');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const category = btn.getAttribute('data-category');
      renderGrid(category);
    });
  });
}

/* 9. Render Editorial Quote Conversations */
function initRenderConversations() {
  const container = document.getElementById('conversationsContainer');
  if (!container || !Array.isArray(birthdayData.conversations)) return;

  container.innerHTML = birthdayData.conversations.map((item) => {
    return `
      <blockquote class="quote-card">
        <span class="quote-mark">“</span>
        <p class="quote-text font-serif">${item.quote}</p>
        <cite class="quote-date">${item.date}</cite>
      </blockquote>
    `;
  }).join('');
}

/* 10. Scroll Reveal Observer */
function initScrollAnimations() {
  const reveals = document.querySelectorAll('.reveal');
  const observerOptions = {
    threshold: 0.15,
    rootMargin: "0px 0px -50px 0px"
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, observerOptions);

  reveals.forEach(el => observer.observe(el));
}

/* 11. Lightbox Fullscreen Image Viewer */
function initLightboxModal() {
  const modal = document.getElementById('lightboxModal');
  const closeBtn = document.getElementById('lightboxClose');
  const img = document.getElementById('lightboxImg');
  const indexEl = document.getElementById('lightboxIndex');
  const titleEl = document.getElementById('lightboxTitle');
  const descEl = document.getElementById('lightboxDesc');

  if (!modal) return;

  document.addEventListener('click', (e) => {
    const archiveItem = e.target.closest('.archive-item');
    if (archiveItem) {
      const idx = parseInt(archiveItem.getAttribute('data-index'), 10);
      const photo = birthdayData.photos[idx];
      if (photo) {
        img.src = photo.url;
        indexEl.textContent = `${(idx + 1).toString().padStart(2, '0')} / ${birthdayData.photos.length.toString().padStart(2, '0')}`;
        titleEl.textContent = photo.title;
        descEl.textContent = photo.subtitle || '';
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
      }
    }
  });

  function closeModal() {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) closeModal();
  });
}

/* 12. Memory Modal Reader */
function initMemoryModal() {
  const modal = document.getElementById('memoryModal');
  const closeBtn = document.getElementById('memoryClose');
  const catEl = document.getElementById('memoryModalCategory');
  const titleEl = document.getElementById('memoryModalTitle');
  const textEl = document.getElementById('memoryModalText');
  const imgWrap = document.getElementById('memoryModalImgWrap');
  const img = document.getElementById('memoryModalImg');

  if (!modal) return;

  window.attachMemoryCardListeners = function() {
    document.querySelectorAll('.memory-card').forEach(card => {
      card.addEventListener('click', () => {
        const cat = card.getAttribute('data-category');
        const title = card.querySelector('.memory-title').textContent;
        const memory = birthdayData.memories.find(m => m.title === title);

        if (memory) {
          catEl.textContent = memory.category;
          titleEl.textContent = memory.title;
          textEl.innerHTML = `<p>${memory.text}</p>`;

          if (memory.image) {
            img.src = memory.image;
            imgWrap.classList.remove('hidden');
          } else {
            imgWrap.classList.add('hidden');
          }

          modal.classList.add('active');
          document.body.style.overflow = 'hidden';
        }
      });
    });
  };

  attachMemoryCardListeners();

  function closeModal() {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });
}

/* 13. Private Letter Reveal Toggle */
function initLetterToggle() {
  const openBtn = document.getElementById('openLetterBtn');
  const closeBtn = document.getElementById('closeLetterBtn');
  const teaser = document.getElementById('letterTeaser');
  const paper = document.getElementById('letterPaper');
  const body = document.getElementById('letterBody');
  const dateEl = document.getElementById('letterDate');
  const sigEl = document.getElementById('letterSignature');

  if (!openBtn || !paper) return;

  const gName = birthdayData.girlfriendName || "HER NAME";
  const yName = birthdayData.yourName || "SANJAY";

  if (dateEl && birthdayData.letterDate) dateEl.textContent = birthdayData.letterDate;
  if (sigEl) sigEl.textContent = yName;

  let formattedLetter = birthdayData.letter;
  if (formattedLetter) {
    formattedLetter = formattedLetter.replace(/\${"HER NAME"}/g, gName);
    formattedLetter = formattedLetter.replace(/HER NAME/g, gName);
    if (body) body.innerHTML = formattedLetter;
  }

  openBtn.addEventListener('click', () => {
    teaser.classList.add('fade-out');
    setTimeout(() => {
      teaser.classList.add('hidden');
      paper.classList.remove('hidden');
      paper.classList.add('active');
    }, 400);
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      paper.classList.remove('active');
      setTimeout(() => {
        paper.classList.add('hidden');
        teaser.classList.remove('hidden', 'fade-out');
      }, 400);
    });
  }
}
