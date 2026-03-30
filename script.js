const toneButtons = document.querySelectorAll(".tone-switch__btn");
const heroTitle = document.getElementById("hero-title");
const heroSubtitle = document.getElementById("hero-subtitle");
const ctaTitle = document.getElementById("cta-title");
const ctaText = document.getElementById("cta-text");

const toneContent = {
  direct: {
    heroTitle: "Как ты — платформа для подростков и молодых взрослых",
    heroSubtitle:
      "Помогаем разобраться в эмоциях, мотивации, отношениях и повторяющихся трудностях, чтобы выбрать помощь без стыда и давления.",
    ctaTitle: "Начни с четкого шага",
    ctaText: "5 минут на self-check, затем конкретный маршрут: коучинг, терапия или консультация психиатра."
  },
  soft: {
    heroTitle: "Как ты — можно бережно подойти к себе, даже если сейчас сложно",
    heroSubtitle:
      "Помогаем спокойно разобраться в чувствах, мотивации, отношениях и паттернах, а затем выбрать подходящую поддержку в своем темпе.",
    ctaTitle: "Первый шаг без давления",
    ctaText: "Начни анонимно. Когда появится готовность, перейдем к регулярной поддержке вместе."
  }
};

function setTone(tone) {
  const content = toneContent[tone];
  if (!content || !heroTitle || !heroSubtitle || !ctaTitle || !ctaText) return;

  heroTitle.textContent = content.heroTitle;
  heroSubtitle.textContent = content.heroSubtitle;
  ctaTitle.textContent = content.ctaTitle;
  ctaText.textContent = content.ctaText;

  toneButtons.forEach((btn) => {
    const isActive = btn.dataset.tone === tone;
    btn.classList.toggle("tone-switch__btn--active", isActive);
    btn.setAttribute("aria-pressed", String(isActive));
  });
}

toneButtons.forEach((btn) => {
  btn.addEventListener("click", () => setTone(btn.dataset.tone));
});
