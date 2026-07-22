const track = document.getElementById("featured-track");
const slides = [...document.querySelectorAll("[data-carousel-slide]")];
const dots = [...document.querySelectorAll("[data-carousel-dot]")];
const previous = document.getElementById("carousel-previous");
const next = document.getElementById("carousel-next");
const carousel = document.querySelector(".catalog-carousel");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

let activeIndex = 0;
let timer = null;

function showSlide(index, { restart = true } = {}) {
  if (!slides.length || !track) return;
  activeIndex = (index + slides.length) % slides.length;
  track.style.transform = `translate3d(-${activeIndex * 100}%, 0, 0)`;
  slides.forEach((slide, slideIndex) => {
    const active = slideIndex === activeIndex;
    slide.classList.toggle("is-active", active);
    slide.setAttribute("aria-hidden", String(!active));
    slide.querySelectorAll("a, button").forEach((control) => {
      control.tabIndex = active ? 0 : -1;
    });
  });
  dots.forEach((dot, dotIndex) => {
    const active = dotIndex === activeIndex;
    dot.classList.toggle("is-active", active);
    if (active) dot.setAttribute("aria-current", "true");
    else dot.removeAttribute("aria-current");
  });
  if (restart) startTimer();
}

function startTimer() {
  window.clearInterval(timer);
  if (reducedMotion || document.hidden) return;
  timer = window.setInterval(() => showSlide(activeIndex + 1, { restart: false }), 5600);
}

previous?.addEventListener("click", () => showSlide(activeIndex - 1));
next?.addEventListener("click", () => showSlide(activeIndex + 1));
dots.forEach((dot) => dot.addEventListener("click", () => showSlide(Number(dot.dataset.carouselDot))));
carousel?.addEventListener("mouseenter", () => window.clearInterval(timer));
carousel?.addEventListener("mouseleave", startTimer);
carousel?.addEventListener("focusin", () => window.clearInterval(timer));
carousel?.addEventListener("focusout", startTimer);
document.addEventListener("visibilitychange", startTimer);

showSlide(0);
