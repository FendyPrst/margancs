    (function () {
      "use strict";

      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      /* -------------------------------------------------------
         INTRO:
         1) N -> C -> S dengan pertindihan separuh (huruf ke-2 "in" separuh
            bila huruf ke-1 "out" separuh, begitu juga C -> S).
         2) Selepas semua huruf "out", NCS muncul serentak (1.56s).
         Garisan tamat ~2.62s, jadi layar mula pudar pada 2.64s.
         ------------------------------------------------------- */
      const intro = document.getElementById("intro");
      let introDone = false;

      function hideIntro() {
        if (introDone || !intro) return;
        introDone = true;
        intro.classList.add("is-hidden");
        document.body.classList.remove("is-loading");

        const remove = () => intro.remove();
        intro.addEventListener("transitionend", remove, { once: true });
        window.setTimeout(remove, reduceMotion ? 60 : 760);
      }

      window.setTimeout(hideIntro, reduceMotion ? 200 : 2640);

      /* -------------------------------------------------------
         STAGGER: delay 70ms per item di dalam grup
         ------------------------------------------------------- */
      document.querySelectorAll(".stagger").forEach((group) => {
        Array.from(group.children).forEach((child, index) => {
          if (child.classList.contains("reveal")) {
            child.style.setProperty("--i", String(Math.min(index, 14)));
          }
        });
      });

      /* -------------------------------------------------------
         REVEAL IN / OUT: IntersectionObserver + blur(10px → 0)
         ------------------------------------------------------- */
      const revealItems = document.querySelectorAll(".reveal");

      if (reduceMotion || !("IntersectionObserver" in window)) {
        revealItems.forEach((el) => el.classList.add("is-visible"));
      } else {
        const revealObserver = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              entry.target.classList.toggle("is-visible", entry.isIntersecting);
            });
          },
          { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
        );
        revealItems.forEach((el) => revealObserver.observe(el));
      }

      /* -------------------------------------------------------
         NAVBAR: tandai section aktif + geser chip aktif ke tengah
         ------------------------------------------------------- */
      const nav = document.querySelector(".nav-links");
      const navLinks = Array.from(document.querySelectorAll(".nav-links a"));
      const navSections = navLinks
        .map((link) => document.querySelector(link.getAttribute("href")))
        .filter(Boolean);

      if ("IntersectionObserver" in window) {
        const navObserver = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (!entry.isIntersecting) return;
              const hash = "#" + entry.target.id;
              let activeLink = null;

              navLinks.forEach((link) => {
                const isActive = link.getAttribute("href") === hash;
                link.classList.toggle("active", isActive);
                if (isActive) activeLink = link;
              });

              if (activeLink && nav) {
                const target = activeLink.offsetLeft - nav.clientWidth / 2 + activeLink.clientWidth / 2;
                nav.scrollTo({ left: Math.max(0, target), behavior: reduceMotion ? "auto" : "smooth" });
              }
            });
          },
          { rootMargin: "-35% 0px -55% 0px", threshold: 0 }
        );
        navSections.forEach((section) => navObserver.observe(section));
      }

      /* -------------------------------------------------------
         LIQUID GLASS: pantulan cahaya mengikuti pointer/jari
         ------------------------------------------------------- */
      document.querySelectorAll(".liquid").forEach((card) => {
        const track = (event) => {
          const rect = card.getBoundingClientRect();
          card.style.setProperty("--x", (event.clientX - rect.left) + "px");
          card.style.setProperty("--y", (event.clientY - rect.top) + "px");
          card.classList.add("is-tracking");
        };

        const clear = (event) => {
          if (!event || event.pointerType !== "mouse") card.classList.remove("is-tracking");
        };

        card.addEventListener("pointermove", track, { passive: true });
        card.addEventListener("pointerdown", track, { passive: true });
        card.addEventListener("pointerleave", () => card.classList.remove("is-tracking"));
        card.addEventListener("pointercancel", () => card.classList.remove("is-tracking"));
        card.addEventListener("pointerup", clear);
      });

      /* -------------------------------------------------------
         COPY: Clipboard API + fallback, toast "Tersalin!"
         ------------------------------------------------------- */
      const toast = document.getElementById("toast");
      let toastTimer;

      function showToast(message) {
        if (!toast) return;
        toast.textContent = message;
        toast.classList.add("is-show");
        window.clearTimeout(toastTimer);
        toastTimer = window.setTimeout(() => toast.classList.remove("is-show"), 1800);
      }

      async function copyToClipboard(text) {
        try {
          if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(text);
            return true;
          }
        } catch (error) {
          /* lanjut ke fallback */
        }

        try {
          const field = document.createElement("textarea");
          field.value = text;
          field.setAttribute("readonly", "");
          field.style.position = "fixed";
          field.style.top = "-9999px";
          field.style.opacity = "0";
          document.body.appendChild(field);
          field.select();
          field.setSelectionRange(0, field.value.length);
          const ok = document.execCommand("copy");
          field.remove();
          return ok;
        } catch (error) {
          return false;
        }
      }

      document.querySelectorAll("[data-copy]").forEach((trigger) => {
        trigger.addEventListener("click", async () => {
          const ok = await copyToClipboard(trigger.dataset.copy || "");
          showToast(ok ? "Tersalin!" : "Gagal menyalin");
          if (!ok) return;

          const label = trigger.querySelector(".js-copy-label");
          if (!label) return;
          /* Simpan label asal sekali sahaja — elak "Tersalin!" jadi label asal
             apabila butang diklik lebih daripada sekali dengan pantas. */
          if (!trigger.dataset.originalLabel) {
            trigger.dataset.originalLabel = label.textContent;
          }
          label.textContent = "Tersalin!";
          trigger.classList.add("is-copied");
          window.clearTimeout(trigger._labelTimer);
          trigger._labelTimer = window.setTimeout(() => {
            label.textContent = trigger.dataset.originalLabel;
            trigger.classList.remove("is-copied");
          }, 1300);
        });
      });

      /* -------------------------------------------------------
         CN PARTNER: generator ala Zynthera (format asal kekal)
         ------------------------------------------------------- */
      const cnPartnerInput = document.getElementById("cnPartnerName");
      const cnPartnerPreview = document.getElementById("cnPartnerPreview");

      if (cnPartnerInput && cnPartnerPreview) {
        const cnTemplates = [
          "Namalu 𝖋𝖙 𝐍𝐂𝐒࿐",
          "『𝐍𝐂𝐒』𝑵𝒂𝒎𝒂𝒍𝒖",
          "𝑵𝒂𝒎𝒂𝒍𝒖 ✘ 𝐍𝐂𝐒",
          "茶 𝑵𝒂𝒎𝒂𝒍𝒖 // 𝐍𝐂𝐒"
        ];

        /* A–Z / a–z / 0–9 -> mathematical sans-serif bold italic */
        function stylize(text) {
          return Array.from(text).map((char) => {
            const code = char.codePointAt(0);
            if (code >= 65 && code <= 90) return String.fromCodePoint(0x1d63c + code - 65);
            if (code >= 97 && code <= 122) return String.fromCodePoint(0x1d656 + code - 97);
            if (code >= 48 && code <= 57) return String.fromCodePoint(0x1d7ec + code - 48);
            return char;
          }).join("");
        }

        /* Huruf, nombor & ruang sahaja — emoji/simbol dibuang.
           RegExp dibina secara dinamik supaya enjin lama yang tidak
           menyokong \p{L} tidak gagal memuatkan seluruh skrip. */
        function sanitizePartner(input) {
          let pattern;
          try {
            pattern = new RegExp("[^\\p{L}\\p{N} ]", "gu");
          } catch (error) {
            pattern = /[^A-Za-z0-9 ]/g;
          }
          input.value = input.value
            .replace(pattern, "")
            .replace(/\s+/g, " ");
        }

        function buildCnPartnerLines() {
          const name = stylize(cnPartnerInput.value.trim());
          if (!name) return cnTemplates.slice();

          /* Hanya placeholder "Namalu" dalam variasi style yang tinggal yang ditukar */
          return cnTemplates.map((line) =>
            line.replace(/(?:Namalu|𝑵𝒂𝒎𝒂𝒍𝒖|NAMALU)/g, name)
          );
        }

        function updateCnPartnerPreview() {
          const lines = buildCnPartnerLines();
          cnPartnerPreview.querySelectorAll(".cn-line__text").forEach((el, index) => {
            el.textContent = lines[index] || "";
          });
        }

        cnPartnerInput.addEventListener("input", () => {
          sanitizePartner(cnPartnerInput);
          updateCnPartnerPreview();
        });

        document.querySelectorAll("[data-cn-copy]").forEach((button) => {
          button.addEventListener("click", async () => {
            const index = Number(button.dataset.cnCopy);
            const text = buildCnPartnerLines()[index] || "";
            const ok = await copyToClipboard(text);
            showToast(ok ? "Tersalin!" : "Gagal menyalin");
            if (ok && navigator.vibrate) navigator.vibrate(15);
          });
        });
      }

      /* -------------------------------------------------------
         RAHSIA: 10 tekanan pada nama CYAA -> page rahsia
         (Butang asli menyokong klik, tap, Enter & Space)
         ------------------------------------------------------- */
      const cyaaTrigger = document.getElementById("cyaaTrigger");
      if (cyaaTrigger) {
        const SECRET_HITS = 10;
        const RESET_MS = 5000;
        let hits = 0;
        let resetTimer;

        cyaaTrigger.addEventListener("click", () => {
          window.clearTimeout(resetTimer);
          hits += 1;
          if (navigator.vibrate) navigator.vibrate(10);

          if (hits >= SECRET_HITS) {
            cyaaTrigger.classList.add("is-primed");
            window.location.assign("secret.html");
            return;
          }

          /* Isyarat halus semasa menghampiri 10 tekanan */
          if (hits >= 6) cyaaTrigger.classList.add("is-primed");
          resetTimer = window.setTimeout(() => {
            hits = 0;
            cyaaTrigger.classList.remove("is-primed");
          }, RESET_MS);
        });
      }
    })();
