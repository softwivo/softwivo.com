(() => {
  "use strict";

  // ========== Language Toggle ==========
  const LANG_KEY = "softwivo-lang";
  const defaultLang = "es";

  function detectLang() {
    const browserLang = (navigator.language || navigator.userLanguage || "").toLowerCase();
    return browserLang.startsWith("es") ? "es" : "en";
  }

  function getStoredLang() {
    return localStorage.getItem(LANG_KEY) || detectLang();
  }

  function setLang(lang) {
    localStorage.setItem(LANG_KEY, lang);
    document.documentElement.lang = lang;

    // Toggle text content
    document.querySelectorAll("[data-es]").forEach((el) => {
      el.textContent = el.getAttribute(`data-${lang}`);
    });

    // Toggle placeholder content
    document.querySelectorAll("[data-es-placeholder]").forEach((el) => {
      el.placeholder = el.getAttribute(`data-${lang}-placeholder`);
    });

    // Update toggle buttons
    document.querySelectorAll(".lang-toggle button").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.lang === lang);
    });
  }

  // ========== Mobile Nav ==========
  function initMobileNav() {
    const hamburger = document.querySelector(".navbar__hamburger");
    const navLinks = document.querySelector(".navbar__links");
    if (!hamburger || !navLinks) return;

    hamburger.addEventListener("click", () => {
      hamburger.classList.toggle("open");
      navLinks.classList.toggle("open");
    });

    // Close menu when a link is clicked
    navLinks.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        hamburger.classList.remove("open");
        navLinks.classList.remove("open");
      });
    });
  }

  // ========== Dark Mode ==========
  const THEME_KEY = "softwivo-theme";

  function getSystemTheme() {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }

  function getStoredTheme() {
    return localStorage.getItem(THEME_KEY);
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    document.querySelectorAll(".theme-toggle").forEach((btn) => {
      btn.textContent = theme === "dark" ? "\u2600\uFE0F" : "\uD83C\uDF19";
      btn.setAttribute(
        "aria-label",
        theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
      );
    });
  }

  function setTheme(theme) {
    localStorage.setItem(THEME_KEY, theme);
    applyTheme(theme);
  }

  // ========== Contact Form ==========
  // Configure your cloud endpoint here:
  const CONTACT_API_URL = "https://mkmivua3t9.execute-api.us-east-1.amazonaws.com/contact";

  function initContactForm() {
    const form = document.getElementById("contact-form");
    if (!form) return;

    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const status = document.getElementById("form-status");
      const submitBtn = document.getElementById("contact-submit");
      const lang = document.documentElement.lang || "es";

      const payload = {
        name: form.elements.name.value.trim(),
        email: form.elements.email.value.trim(),
        message: form.elements.message.value.trim(),
      };

      // Show sending state
      submitBtn.disabled = true;
      status.className = "form-status sending";
      status.textContent =
        lang === "es" ? "Enviando..." : "Sending...";

      try {
        const res = await fetch(CONTACT_API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        status.className = "form-status success";
        status.textContent =
          lang === "es"
            ? "Mensaje enviado. Te contactaremos pronto."
            : "Message sent. We'll get back to you soon.";
        form.reset();
      } catch (err) {
        status.className = "form-status error";
        status.textContent =
          lang === "es"
            ? "Error al enviar. Int\u00e9ntalo de nuevo o escr\u00edbenos a hola@softwivo.com."
            : "Failed to send. Please try again or email us at hola@softwivo.com.";
      } finally {
        submitBtn.disabled = false;
      }
    });
  }

  // ========== Init ==========
  document.addEventListener("DOMContentLoaded", () => {
    // Language
    const lang = getStoredLang();
    setLang(lang);

    document.querySelectorAll(".lang-toggle button").forEach((btn) => {
      btn.addEventListener("click", () => setLang(btn.dataset.lang));
    });

    // Dark mode — use stored preference, or fall back to system default
    const storedTheme = getStoredTheme();
    applyTheme(storedTheme || getSystemTheme());

    // Follow system theme changes when user hasn't set a manual preference
    window
      .matchMedia("(prefers-color-scheme: dark)")
      .addEventListener("change", (e) => {
        if (!localStorage.getItem(THEME_KEY)) {
          applyTheme(e.matches ? "dark" : "light");
        }
      });

    document.querySelectorAll(".theme-toggle").forEach((btn) => {
      btn.addEventListener("click", () => {
        const current = document.documentElement.getAttribute("data-theme");
        setTheme(current === "dark" ? "light" : "dark");
      });
    });

    // Mobile nav
    initMobileNav();

    // Contact form
    initContactForm();
  });
})();
