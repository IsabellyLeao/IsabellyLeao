
/* =========================================
   CARROSSEL DE TEMAS
========================================= */

document.addEventListener("DOMContentLoaded", () => {
  document.documentElement.classList.add("js-ready");

  // Tema claro e escuro
  const themeToggle = document.querySelector("#theme-toggle");
  const themeStorageKey = "economia-sustentavel-theme";
  let storedTheme = null;
  try {
    storedTheme = localStorage.getItem(themeStorageKey);
  } catch {
    storedTheme = null;
  }
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const initialTheme = storedTheme || (prefersDark ? "dark" : "light");

  function applyTheme(theme) {
    const isDark = theme === "dark";
    document.documentElement.dataset.theme = theme;
    themeToggle?.setAttribute("aria-pressed", String(isDark));
    themeToggle?.setAttribute(
      "aria-label",
      isDark ? "Ativar modo claro" : "Ativar modo escuro"
    );
  }

  applyTheme(initialTheme);

  themeToggle?.addEventListener("click", () => {
    const nextTheme =
      document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    applyTheme(nextTheme);
    try {
      localStorage.setItem(themeStorageKey, nextTheme);
    } catch {
      // O tema continua funcionando sem persistência.
    }
  });

  // Revela os elementos conforme entram na tela
  const revealItems = document.querySelectorAll(".reveal");
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px" }
  );

  revealItems.forEach((item, index) => {
    item.style.setProperty("--reveal-delay", `${Math.min(index % 4, 3) * 70}ms`);
    revealObserver.observe(item);
  });

  // Halo de luz que acompanha o ponteiro em telas com mouse
  if (window.matchMedia("(pointer: fine)").matches) {
    document.body.classList.add("pointer-effects");

    window.addEventListener("pointermove", (event) => {
      document.body.style.setProperty("--pointer-x", `${event.clientX}px`);
      document.body.style.setProperty("--pointer-y", `${event.clientY}px`);
    });
  }

  // Navegação responsiva
  const menuToggle = document.querySelector(".menu-toggle");
  const navLinks = document.querySelector(".nav-links");

  menuToggle?.addEventListener("click", () => {
    const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!isOpen));
    navLinks?.classList.toggle("open", !isOpen);
  });

  navLinks?.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      menuToggle?.setAttribute("aria-expanded", "false");
      navLinks.classList.remove("open");
    });
  });

  // Caixas selecionáveis: lista de práticas de TI
  const itChecks = Array.from(
    document.querySelectorAll("[data-it-check]")
  );
  const itCount = document.querySelector("#it-count");
  const itProgress = document.querySelector("#it-progress");
  const resetIt = document.querySelector("#reset-it");
  const IT_STORAGE_KEY = "economia-sustentavel-it-checks";

  function readStoredSelection(key) {
    try {
      const stored = JSON.parse(localStorage.getItem(key) || "[]");
      return Array.isArray(stored) ? stored : [];
    } catch {
      return [];
    }
  }

  function saveSelection(key, checks) {
    try {
      localStorage.setItem(
        key,
        JSON.stringify(checks.map((check) => check.checked))
      );
    } catch {
      // A seleção continua funcionando mesmo quando o armazenamento não está disponível.
    }
  }

  function updateItProgress() {
    const selected = itChecks.filter((check) => check.checked).length;
    const total = itChecks.length;
    const percentage = total > 0 ? (selected / total) * 100 : 0;

    if (itCount) {
      itCount.textContent = `${selected} de ${total} concluídas`;
    }
    if (itProgress) {
      itProgress.style.width = `${percentage}%`;
    }

    saveSelection(IT_STORAGE_KEY, itChecks);
  }

  const storedItSelection = readStoredSelection(IT_STORAGE_KEY);
  itChecks.forEach((check, index) => {
    check.checked = storedItSelection[index] === true;
    check.addEventListener("change", updateItProgress);
  });

  resetIt?.addEventListener("click", () => {
    itChecks.forEach((check) => {
      check.checked = false;
    });
    updateItProgress();
  });

  updateItProgress();

  // Caixas selecionáveis: plano semanal
  const weekChecks = Array.from(
    document.querySelectorAll("[data-week-check]")
  );
  const weekPercent = document.querySelector("#week-percent");
  const weekProgress = document.querySelector("#week-progress");
  const WEEK_STORAGE_KEY = "economia-sustentavel-week-checks";

  function updateWeekProgress() {
    const selected = weekChecks.filter((check) => check.checked).length;
    const total = weekChecks.length;
    const percentage = total > 0 ? Math.round((selected / total) * 100) : 0;

    if (weekPercent) {
      weekPercent.textContent = `${percentage}%`;
    }
    if (weekProgress) {
      weekProgress.style.width = `${percentage}%`;
    }

    saveSelection(WEEK_STORAGE_KEY, weekChecks);
  }

  const storedWeekSelection = readStoredSelection(WEEK_STORAGE_KEY);
  weekChecks.forEach((check, index) => {
    check.checked = storedWeekSelection[index] === true;
    check.addEventListener("change", updateWeekProgress);
  });

  updateWeekProgress();

  const carousels = document.querySelectorAll(".carousel");

  carousels.forEach((carousel) => {
    const track = carousel.querySelector(".carousel-track");
    const slides = Array.from(
      carousel.querySelectorAll(".carousel-slide")
    );

    const previousButton = carousel.querySelector(".carousel-button.prev");
    const nextButton = carousel.querySelector(".carousel-button.next");

    const dotsContainer = carousel.parentElement.querySelector(
      ".carousel-dots"
    );

    const counter = carousel.parentElement.querySelector(
      ".carousel-count"
    );

    // Verifica se os elementos necessários existem
    if (!track || slides.length === 0 || !dotsContainer) {
      return;
    }

    let currentIndex = 0;

    // Cria os indicadores de navegação
    slides.forEach((slide, index) => {
      const dot = document.createElement("button");

      dot.type = "button";
      dot.classList.add("carousel-dot");
      dot.setAttribute("aria-label", `Ir para o slide ${index + 1}`);

      dot.addEventListener("click", () => {
        goToSlide(index);
      });

      dotsContainer.appendChild(dot);
    });

    const dots = Array.from(
      dotsContainer.querySelectorAll(".carousel-dot")
    );

    // Atualiza o carrossel
    function updateCarousel() {
      track.style.transform = `translateX(-${currentIndex * 100}%)`;

      slides.forEach((slide, index) => {
        const isActive = index === currentIndex;

        slide.classList.toggle("active", isActive);
        slide.setAttribute("aria-hidden", String(!isActive));
        slide.inert = !isActive;
      });

      dots.forEach((dot, index) => {
        const isActive = index === currentIndex;

        dot.classList.toggle("active", isActive);

        if (isActive) {
          dot.setAttribute("aria-current", "true");
        } else {
          dot.removeAttribute("aria-current");
        }
      });

      // Atualiza o contador: 01 / 03
      if (counter) {
        const current = String(currentIndex + 1).padStart(2, "0");
        const total = String(slides.length).padStart(2, "0");

        counter.textContent = `${current} / ${total}`;
      }
    }

    // Vai para um slide específico
    function goToSlide(index) {
      currentIndex = (index + slides.length) % slides.length;
      updateCarousel();
    }

    // Slide anterior
    function previousSlide() {
      goToSlide(currentIndex - 1);
    }

    // Próximo slide
    function nextSlide() {
      goToSlide(currentIndex + 1);
    }

    // Eventos dos botões
    previousButton?.addEventListener("click", previousSlide);
    nextButton?.addEventListener("click", nextSlide);

    // Navegação pelo teclado
    carousel.addEventListener("keydown", (event) => {
      if (event.key === "ArrowLeft") {
        previousSlide();
      }

      if (event.key === "ArrowRight") {
        nextSlide();
      }
    });

    // Inicializa no primeiro slide
    updateCarousel();
  });
});
