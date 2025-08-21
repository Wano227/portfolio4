document.addEventListener("DOMContentLoaded", () => {
  // ====== BASIC HOOKS ======
  const filterButtons = document.querySelectorAll(".filter button");
  const items = document.querySelectorAll(".gallery .item");
  const modal = document.getElementById("modal");
  const modalTitle = document.getElementById("modal-title");
  const modalMedia = document.getElementById("modal-media");
  const modalDesc = document.getElementById("modal-desc");
  const closeBtn = document.querySelector(".close");
  const loadMoreBtn = document.getElementById("load-more");
  const searchInput = document.getElementById("search-input");
  const themeToggle = document.getElementById("theme-toggle");
  const menuToggle = document.getElementById("menu-toggle");
  const navLinks = document.getElementById("nav-links");
  const backToTop = document.getElementById("back-to-top");
  const yearEl = document.getElementById("year");

  if (yearEl) yearEl.textContent = new Date().getFullYear();

  let currentIndex = 0;
  const itemsArray = Array.from(items);

  // ====== NAV LINKS SMOOTH SCROLL + ACTIVE ======
  document.querySelectorAll('nav a[href^="#"]').forEach(link => {
    link.addEventListener("click", e => {
      e.preventDefault();
      const target = document.querySelector(link.getAttribute("href"));
      if (target) target.scrollIntoView({ behavior: "smooth" });
      navLinks.classList.remove("show"); // close on mobile
      document.querySelectorAll("nav a").forEach(a => a.classList.remove("active"));
      link.classList.add("active");
    });
  });

  // ====== HAMBURGER ======
  if (menuToggle) {
    menuToggle.addEventListener("click", () => {
      navLinks.classList.toggle("show");
    });
  }

  // ====== THEME TOGGLE (persist) ======
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "dark") document.body.classList.add("dark");
  themeToggle?.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    localStorage.setItem("theme", document.body.classList.contains("dark") ? "dark" : "light");
  });

  // ====== TYPING EFFECT (hero) ======
  const roles = ["UI Designer", "Videographer", "Photographer", "Web Developer"];
  let roleIndex = 0;
  let charIndex = 0;
  const typingSpeed = 120, erasingSpeed = 60, delayBetweenRoles = 1200;
  const typingText = document.getElementById("typing-text");
  function typeRole() {
    if (!typingText) return;
    const word = roles[roleIndex];
    if (charIndex < word.length) {
      typingText.textContent += word.charAt(charIndex++);
      setTimeout(typeRole, typingSpeed);
    } else {
      setTimeout(eraseRole, delayBetweenRoles);
    }
  }
  function eraseRole() {
    if (!typingText) return;
    const word = roles[roleIndex];
    if (charIndex > 0) {
      typingText.textContent = word.substring(0, --charIndex);
      setTimeout(eraseRole, erasingSpeed);
    } else {
      roleIndex = (roleIndex + 1) % roles.length;
      setTimeout(typeRole, typingSpeed);
    }
  }
  typeRole();

  // ====== FILTERING ======
  filterButtons.forEach(button => {
    button.addEventListener("click", () => {
      filterButtons.forEach(btn => btn.classList.remove("active"));
      button.classList.add("active");
      const filter = button.getAttribute("data-filter");
      itemsArray.forEach(item => {
        const show = filter === "all" || item.classList.contains(filter);
        item.style.display = show ? "block" : "none";
        item.style.opacity = show ? "1" : "0";
      });
    });
  });

  // ====== SEARCH FILTER ======
  searchInput?.addEventListener("keyup", () => {
    const query = searchInput.value.toLowerCase();
    itemsArray.forEach(item => {
      const title = (item.getAttribute("data-title") || item.querySelector("img")?.alt || "").toLowerCase();
      const match = title.includes(query);
      item.style.display = match ? "block" : "none";
      item.style.opacity = match ? "1" : "0";
    });
  });

  // ====== LOAD MORE ======
  let visibleCount = 8;
  function updateVisibleItems() {
    itemsArray.forEach((item, i) => {
      if (i < visibleCount) {
        item.style.display = "block";
        item.classList.add("fade-in");
      } else {
        item.style.display = "none";
      }
    });
    if (loadMoreBtn) {
      loadMoreBtn.style.display = visibleCount >= itemsArray.length ? "none" : "inline-block";
    }
  }
  updateVisibleItems();
  loadMoreBtn?.addEventListener("click", () => {
    visibleCount += 4;
    updateVisibleItems();
  });

  // ====== OPEN MODAL ======
  function openModalByIndex(index) {
    const item = itemsArray[index];
    if (!item) return;

    currentIndex = index;
    const title = item.getAttribute("data-title") || "";
    const desc = item.getAttribute("data-desc") || "";
    const img = item.getAttribute("data-img");
    const video = item.getAttribute("data-video");
    const watch = item.getAttribute("data-watch"); // external link if present

    modalTitle.textContent = title;
    modalDesc.textContent = desc;
    modalMedia.innerHTML = "";

    if (img) {
      const image = document.createElement("img");
      image.src = img;
      image.alt = title || "Project image";
      modalMedia.appendChild(image);
    } else if (video) {
      // NO inline playback — show link instead
      const link = document.createElement("a");
      if (watch && watch.trim().length > 0) {
        link.href = watch;
        link.target = "_blank";
        link.rel = "noopener";
        link.textContent = "🎬 Click here to watch the video";
        link.className = "watch-link";
      } else {
        link.href = "javascript:void(0)";
        link.textContent = "🔜 Video link coming soon";
        link.className = "watch-link disabled";
        link.setAttribute("aria-disabled", "true");
      }
      modalMedia.appendChild(link);
    }

    modal.classList.add("show");
    modal.setAttribute("aria-hidden", "false");
  }

  itemsArray.forEach((item, index) => {
    item.addEventListener("click", () => openModalByIndex(index));
  });

  // ====== CLOSE MODAL ======
  function closeModal() {
    modal.classList.remove("show");
    modal.setAttribute("aria-hidden", "true");
    modalMedia.innerHTML = "";
  }
  closeBtn.addEventListener("click", closeModal);
  window.addEventListener("click", e => { if (e.target === modal) closeModal(); });
  window.addEventListener("keydown", e => {
    if (!modal.classList.contains("show")) return;
    if (e.key === "Escape") closeModal();
    if (e.key === "ArrowRight") document.getElementById("next-btn").click();
    if (e.key === "ArrowLeft") document.getElementById("prev-btn").click();
  });

  // ====== NEXT & PREVIOUS ======
  document.getElementById("next-btn").addEventListener("click", () => {
    let next = currentIndex + 1;
    if (next >= itemsArray.length) next = 0;
    openModalByIndex(next);
  });
  document.getElementById("prev-btn").addEventListener("click", () => {
    let prev = currentIndex - 1;
    if (prev < 0) prev = itemsArray.length - 1;
    openModalByIndex(prev);
  });

  // ====== SCROLL ANIMATIONS ======
  const scrollElements = document.querySelectorAll(".scroll-animate");
  const inView = (el, dividend = 1.15) => el.getBoundingClientRect().top <= (window.innerHeight / dividend);
  const onScroll = () => {
    scrollElements.forEach(el => {
      if (inView(el)) el.classList.add("scrolled");
    });
  };
  window.addEventListener("scroll", onScroll);
  onScroll();

  // ====== BACK TO TOP ======
  window.addEventListener("scroll", () => {
    if (window.scrollY > 400) backToTop.classList.add("show");
    else backToTop.classList.remove("show");
  });
  backToTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
});
