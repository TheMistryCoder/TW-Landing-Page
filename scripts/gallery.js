// scripts/gallery.js
(function () {
  const viewport = document.querySelector('.embla.gallery-carousel');
  const prevBtn = document.querySelector('.gallery-prev');
  const nextBtn = document.querySelector('.gallery-next');
  const dotsContainer = document.querySelector('.gallery-dots');

  if (!viewport || !prevBtn || !nextBtn || !dotsContainer) return;
  if (viewport.__emblaInitialised) return;
  viewport.__emblaInitialised = true;

  // Autoplay keeps running after manual interaction
  const autoplay = EmblaCarouselAutoplay({
    delay: 4000,
    stopOnInteraction: false,
    stopOnMouseEnter: true, // pause on hover; resumes on mouse leave
  });

  const embla = EmblaCarousel(
    viewport,
    {
      loop: true,
      align: 'center',
      dragFree: false,
      duration: 20,
      skipSnaps: false,
    },
    [autoplay]
  );

  // Build dots
  const slideCount = embla.slideNodes().length;
  const dots = [];
  const frag = document.createDocumentFragment();

  for (let i = 0; i < slideCount; i++) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.setAttribute('aria-label', `Go to slide ${i + 1}`);
    btn.addEventListener('click', () => {
      embla.scrollTo(i);
      autoplay && autoplay.reset(); // restart timer after manual nav
    });
    dots.push(btn);
    frag.appendChild(btn);
  }
  dotsContainer.innerHTML = '';
  dotsContainer.appendChild(frag);

  // Active dot sync
  function setActiveDot() {
    const selected = embla.selectedScrollSnap();
    dots.forEach((d, i) => {
      if (i === selected) {
        d.classList.add('active');
        d.setAttribute('aria-current', 'true');
      } else {
        d.classList.remove('active');
        d.removeAttribute('aria-current');
      }
    });
  }

  // Prev/Next
  prevBtn.addEventListener('click', () => {
    embla.scrollPrev();
    autoplay && autoplay.reset(); // keep autoplay alive after click
  });
  nextBtn.addEventListener('click', () => {
    embla.scrollNext();
    autoplay && autoplay.reset();
  });

  // Sync
  embla.on('select', setActiveDot);
  embla.on('reInit', setActiveDot);
  setActiveDot();
})();
