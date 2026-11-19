(function () {
  "use strict";

  var BUSINESS = "Joe's Roofing & Building";
  var PHONE_DISPLAY = "07348 426709";
  var PHONE_LINK = "tel:+447348426709";
  var WHATSAPP_NUMBER = "447348426709";
  var EMAIL = "joesrnb@gmail.com";

  var SOCIAL = {
    facebook: "https://www.facebook.com/",
    instagram: "https://www.instagram.com/",
    tiktok: "https://www.tiktok.com/",
    google: "https://www.google.com/maps/search/?api=1&query=Joe%27s+Roofing+%26+Building+WN5+8DH"
  };

  var SLIDE_MS = 4200;

  var SEND_GAP_MS = 20000;

  var CHAT_ENDPOINT = "";
  var CHAT_TIMEOUT_MS = 12000;

  var SERVICE_OPTIONS = [
    "Roof installation or re-roof",
    "Roof repair",
    "Flat roofing",
    "Guttering, fascias and soffits",
    "Chimney work",
    "Building or extension",
    "Not sure yet"
  ];
  var PROPERTY_OPTIONS = ["House", "Bungalow", "Flat or apartment", "Commercial premises", "Other"];
  var TIMING_OPTIONS = ["It is leaking now", "Within a few weeks", "Just planning ahead"];
  var CONTACT_OPTIONS = ["Phone", "WhatsApp", "Email", "Any"];

  function sanitizeText(value, maxLength) {
    var text = String(value == null ? "" : value);
    text = text.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "");
    text = text.replace(/[‪-‮⁦-⁩]/g, "");
    text = text.replace(/[<>]/g, "");
    text = text.replace(/[ \t]+\n/g, "\n").trim();
    if (text.length > maxLength) {
      text = text.slice(0, maxLength).trim();
    }
    return text;
  }

  function allow(value, list) {
    return list.indexOf(value) !== -1 ? value : "";
  }

  function isUkPhone(value) {
    var digits = value.replace(/\D/g, "");
    if (digits.indexOf("44") === 0) {
      digits = "0" + digits.slice(2);
    }
    return /^0\d{9,10}$/.test(digits);
  }

  function isEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
  }

  function isUkPostcode(value) {
    return /^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i.test(value);
  }

  function whatsAppUrl(message) {
    return "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + encodeURIComponent(message);
  }

  function mailtoUrl(subject, message) {
    return "mailto:" + EMAIL + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(message);
  }

  function storageGet(key) {
    try {
      return sessionStorage.getItem(key);
    } catch (error) {
      return null;
    }
  }

  function storageSet(key, value) {
    try {
      sessionStorage.setItem(key, value);
    } catch (error) {

    }
  }

  function sentTooRecently() {
    var previous = Number(storageGet("joes-last-send") || 0);
    return previous > 0 && Date.now() - previous < SEND_GAP_MS;
  }

  function markSent() {
    storageSet("joes-last-send", String(Date.now()));
  }

  function honeypotTripped(form) {
    var trap = form.querySelector("[name='joes_hp']");
    return trap && trap.value.trim() !== "";
  }

  function setError(input, errorNode, message) {
    if (!input || !errorNode) {
      return;
    }
    if (message) {
      input.setAttribute("aria-invalid", "true");
      errorNode.hidden = false;
      errorNode.textContent = message;
    } else {
      input.removeAttribute("aria-invalid");
      errorNode.hidden = true;
      errorNode.textContent = "";
    }
  }

  function clearErrors(form) {
    form.querySelectorAll("[aria-invalid]").forEach(function (input) {
      input.removeAttribute("aria-invalid");
    });
    form.querySelectorAll(".field-error").forEach(function (node) {
      node.hidden = true;
      node.textContent = "";
    });
  }

  function openLink(url, newTab) {
    var anchor = document.createElement("a");
    anchor.href = url;
    if (newTab) {
      anchor.target = "_blank";
      anchor.rel = "noopener noreferrer";
    }
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  }

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) {
      node.className = className;
    }
    if (text) {
      node.textContent = text;
    }
    return node;
  }

  function initYear() {
    var yearNode = document.getElementById("year");
    if (yearNode) {
      yearNode.textContent = String(new Date().getFullYear());
    }
  }

  document.documentElement.classList.add("js");

  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function initNav() {
    var header = document.querySelector(".site-header");
    if (!header) {
      return;
    }
    var toggle = header.querySelector(".nav-toggle");
    var nav = document.getElementById("site-nav");
    var label = header.querySelector(".nav-toggle__label");
    var scrim = document.querySelector("[data-nav-scrim]");
    var desktop = window.matchMedia("(min-width: 1101px)");

    function onScroll() {
      header.classList.toggle("is-scrolled", window.scrollY > 8);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    function setOpen(open, returnFocus) {
      header.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      if (label) {
        label.textContent = open ? "Close" : "Menu";
      }
      if (scrim) {
        scrim.classList.toggle("is-on", open);
      }
      if (!open && returnFocus) {
        toggle.focus();
      }
    }

    if (toggle && nav) {
      toggle.addEventListener("click", function () {
        setOpen(toggle.getAttribute("aria-expanded") !== "true", false);
      });

      nav.addEventListener("click", function (event) {
        if (event.target.closest("a") && !desktop.matches) {
          setOpen(false, false);
        }
      });

      if (scrim) {
        scrim.addEventListener("click", function () {
          setOpen(false, false);
        });
      }

      document.addEventListener("keydown", function (event) {
        if (event.key === "Escape" && header.classList.contains("is-open")) {
          setOpen(false, true);
        }
      });

      var onBreakpoint = function () {
        if (desktop.matches) {
          setOpen(false, false);
        }
      };
      if (desktop.addEventListener) {
        desktop.addEventListener("change", onBreakpoint);
      }
    }

    var item = header.querySelector(".has-sub");
    if (!item) {
      return;
    }
    var subToggle = item.querySelector(".sub-toggle");

    function setSub(open) {
      item.classList.toggle("is-open", open);
      item.classList.remove("is-dismissed");
      subToggle.setAttribute("aria-expanded", open ? "true" : "false");
      subToggle.setAttribute("aria-label", open ? "Hide services" : "Show services");
    }

    subToggle.addEventListener("click", function () {
      setSub(!item.classList.contains("is-open"));
    });

    document.addEventListener("click", function (event) {
      if (desktop.matches && !item.contains(event.target)) {
        setSub(false);
      }
    });

    item.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && desktop.matches) {
        setSub(false);
        item.classList.add("is-dismissed");
        subToggle.focus();
      }
    });

    item.addEventListener("mouseleave", function () {
      item.classList.remove("is-dismissed");
    });
  }

  function initSocial() {
    document.querySelectorAll("[data-social]").forEach(function (link) {
      var url = SOCIAL[link.getAttribute("data-social")];
      var holder = link.closest("li") || link;
      if (!url) {
        holder.hidden = true;
        return;
      }
      if (/^https:\/\/[^\s"<>]+$/.test(url)) {
        link.href = url;
      }
    });
  }

  function initSlides() {
    var hero = document.querySelector("[data-slides]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hf-slide"));
    var segs = Array.prototype.slice.call(hero.querySelectorAll(".hf-seg"));
    var tag = hero.querySelector(".reel-tag");
    var button = hero.querySelector("[data-slides-toggle]");
    var side = hero.querySelector(".hf-side");
    var phases = (hero.getAttribute("data-phases") || "").split("|");
    if (slides.length < 2) {
      return;
    }

    var index = 0;
    var timer = null;
    var startedAt = 0;
    var remaining = SLIDE_MS;
    var userPaused = false;
    var offScreen = false;

    function restart(node, cls) {
      node.classList.remove(cls);
      void node.offsetWidth;
      node.classList.add(cls);
    }

    function show(next) {
      index = next;
      slides.forEach(function (slide, i) {
        if (i === index) {
          restart(slide, "is-active");
        } else {
          slide.classList.remove("is-active");
        }
      });
      segs.forEach(function (seg, i) {
        seg.classList.toggle("is-done", i < index);
        if (i === index) {
          restart(seg, "is-current");
        } else {
          seg.classList.remove("is-current");
        }
      });
      if (tag) {
        tag.textContent = phases[index] || "";
      }
      remaining = SLIDE_MS;
    }

    function schedule() {
      clearTimeout(timer);
      if (userPaused || offScreen) {
        return;
      }
      startedAt = Date.now();
      timer = setTimeout(function () {
        show((index + 1) % slides.length);
        schedule();
      }, remaining);
    }

    function hold() {
      clearTimeout(timer);
      remaining = Math.max(0, remaining - (Date.now() - startedAt));
    }

    function updatePaused() {
      var paused = userPaused || offScreen;
      hero.classList.toggle("is-paused", paused);
      if (paused) {
        hold();
      } else {
        schedule();
      }
    }

    if (reduceMotion) {
      show(slides.length - 1);
      segs.forEach(function (seg) {
        seg.classList.add("is-done");
        seg.classList.remove("is-current");
      });
      return;
    }

    hero.style.setProperty("--slide-ms", SLIDE_MS + "ms");
    if (side) {
      side.hidden = false;
    }

    if (button) {
      button.addEventListener("click", function () {
        userPaused = !userPaused;
        button.setAttribute("aria-label", userPaused ? "Play the photo sequence" : "Pause the photo sequence");
        updatePaused();
      });
    }

    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        offScreen = !entries[0].isIntersecting;
        updatePaused();
      }).observe(hero);
    }

    document.addEventListener("visibilitychange", function () {
      offScreen = document.hidden;
      updatePaused();
    });

    show(0);
    schedule();
  }

  function initTabs() {
    document.querySelectorAll("[data-tabs]").forEach(function (root) {
      var tabs = Array.prototype.slice.call(root.querySelectorAll("[role='tab']"));

      function select(tab, moveFocus) {
        tabs.forEach(function (other) {
          var on = other === tab;
          other.setAttribute("aria-selected", on ? "true" : "false");
          other.tabIndex = on ? 0 : -1;
          var panel = document.getElementById(other.getAttribute("aria-controls"));
          if (panel) {
            panel.hidden = !on;
          }
        });
        if (moveFocus) {
          tab.focus();
        }
      }

      tabs.forEach(function (tab, i) {
        tab.addEventListener("click", function () {
          select(tab, false);
        });
        tab.addEventListener("keydown", function (event) {
          var next = null;
          if (event.key === "ArrowDown" || event.key === "ArrowRight") {
            next = tabs[(i + 1) % tabs.length];
          } else if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
            next = tabs[(i - 1 + tabs.length) % tabs.length];
          } else if (event.key === "Home") {
            next = tabs[0];
          } else if (event.key === "End") {
            next = tabs[tabs.length - 1];
          }
          if (next) {
            event.preventDefault();
            select(next, true);
          }
        });
      });
    });
  }

  function initBeforeAfter() {
    document.querySelectorAll("[data-ba]").forEach(function (box) {
      var range = box.querySelector("input[type='range']");
      if (!range) {
        return;
      }
      function update() {
        box.style.setProperty("--pos", range.value + "%");
      }
      range.addEventListener("input", update);
      update();
    });
  }

  function initReveal() {
    var items = document.querySelectorAll(".will-reveal");
    if (!items.length) {
      return;
    }
    if (reduceMotion || !("IntersectionObserver" in window)) {
      items.forEach(function (item) {
        item.classList.add("is-visible");
      });
      return;
    }
    var watcher = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          watcher.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });
    items.forEach(function (item) {
      watcher.observe(item);
    });
  }

  function initMap() {
    document.querySelectorAll("[data-map]").forEach(function (root) {
      var frame = root.querySelector("iframe");
      var now = root.querySelector(".map-now");
      var open = root.querySelector("[data-map-open]");
      var views = root.querySelector("[data-map-views]");
      var controls = Array.prototype.slice.call(root.querySelectorAll("[data-map-q]"));
      if (!frame) {
        return;
      }
      if (views) {
        views.hidden = false;
      }

      controls.forEach(function (control) {

        if (control.tagName === "A") {
          control.setAttribute("role", "button");
          control.setAttribute("aria-pressed", "false");
        }
        control.addEventListener("click", function (event) {
          event.preventDefault();
          var place = control.getAttribute("data-map-q");
          var zoom = parseInt(control.getAttribute("data-map-z"), 10) || 10;
          frame.src = "https://www.google.com/maps?q=" + encodeURIComponent(place) + "&z=" + zoom + "&output=embed";
          if (open) {
            open.href = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(place);
          }
          if (now) {
            now.textContent = control.getAttribute("data-map-label") || "Showing: " + control.textContent;
          }
          controls.forEach(function (other) {
            other.setAttribute("aria-pressed", other === control ? "true" : "false");
          });
        });
      });
    });
  }

  function initHouse() {
    var house = document.querySelector("[data-house]");
    if (!house) {
      return;
    }

    function activate(name) {
      house.querySelectorAll("[data-part]").forEach(function (node) {
        node.classList.toggle("is-active", name !== "" && node.getAttribute("data-part") === name);
      });
    }

    ["mouseover", "focusin"].forEach(function (type) {
      house.addEventListener(type, function (event) {
        var target = event.target.closest("[data-part]");
        if (target) {
          activate(target.getAttribute("data-part"));
        }
      });
    });

    ["mouseleave", "focusout"].forEach(function (type) {
      house.addEventListener(type, function () {
        activate("");
      });
    });
  }

  function initGallery() {
    var gallery = document.querySelector("[data-gallery]");
    var dialog = document.getElementById("lightbox");
    if (!gallery) {
      return;
    }

    var bar = gallery.querySelector("[data-filters]");
    if (bar) {

      bar.hidden = false;
      bar.addEventListener("click", function (event) {
        var button = event.target.closest("[data-filter]");
        if (!button) {
          return;
        }
        var filter = button.getAttribute("data-filter");
        bar.querySelectorAll("[data-filter]").forEach(function (item) {
          item.setAttribute("aria-pressed", item === button ? "true" : "false");
        });
        gallery.querySelectorAll("[data-kind]").forEach(function (tile) {
          tile.hidden = !(filter === "all" || tile.getAttribute("data-kind") === filter);
        });
      });
    }

    if (!dialog || typeof dialog.showModal !== "function") {
      return;
    }

    var image = dialog.querySelector("img");
    var caption = dialog.querySelector("p");
    gallery.addEventListener("click", function (event) {
      var tile = event.target.closest("[data-full]");
      if (!tile) {
        return;
      }
      image.src = tile.getAttribute("data-full");
      image.alt = tile.getAttribute("data-alt") || "";
      caption.textContent = tile.getAttribute("data-caption") || "";
      dialog.showModal();
    });

    dialog.querySelector("[data-close]").addEventListener("click", function () {
      dialog.close();
    });

    dialog.addEventListener("click", function (event) {
      if (event.target === dialog) {
        dialog.close();
      }
    });
  }

  function selectedValues(form, name, list) {
    return Array.prototype.filter.call(
      form.querySelectorAll("input[name='" + name + "']:checked"),
      function (input) {
        return allow(input.value, list);
      }
    ).map(function (input) {
      return input.value;
    });
  }

  function showReady(prefix, subject, message) {
    var success = document.getElementById(prefix + "-success");
    var waLink = document.getElementById(prefix + "-wa-link");
    var mailLink = document.getElementById(prefix + "-mail-link");
    var fallback = document.getElementById(prefix + "-fallback");
    if (waLink) {
      waLink.href = whatsAppUrl(message);
    }
    if (mailLink) {
      mailLink.href = mailtoUrl(subject, message);
    }
    if (fallback) {
      fallback.value = message;
    }
    if (success) {
      success.hidden = false;
      success.focus();
    }
  }

  function initContactForm() {
    var form = document.getElementById("contact-form");
    if (!form) {
      return;
    }
    var status = document.getElementById("contact-status");

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      clearErrors(form);
      status.textContent = "";

      var byEmail = event.submitter && event.submitter.value === "email";

      if (honeypotTripped(form)) {
        form.hidden = true;
        document.getElementById("contact-success").hidden = false;
        return;
      }
      if (sentTooRecently()) {
        status.textContent = "Please wait a few seconds before sending another message.";
        return;
      }

      var nameInput = form.querySelector("#contact-name");
      var phoneInput = form.querySelector("#contact-phone");
      var emailInput = form.querySelector("#contact-email");
      var messageInput = form.querySelector("#contact-message");
      var consent = form.querySelector("#contact-consent");
      var name = sanitizeText(nameInput.value, 80);
      var phone = sanitizeText(phoneInput.value, 20);
      var email = sanitizeText(emailInput.value, 120);
      var message = sanitizeText(messageInput.value, 600);
      var valid = true;

      if (name.length < 2) {
        setError(nameInput, document.getElementById("err-contact-name"), "Please add your name.");
        valid = false;
      }
      if (!isUkPhone(phone)) {
        setError(phoneInput, document.getElementById("err-contact-phone"), "Please add a UK phone number.");
        valid = false;
      }
      if (email && !isEmail(email)) {
        setError(emailInput, document.getElementById("err-contact-email"), "That email does not look complete.");
        valid = false;
      }
      if (message.length < 8) {
        setError(messageInput, document.getElementById("err-contact-message"), "Please add a short note about the job.");
        valid = false;
      }
      if (!consent.checked) {
        setError(consent, document.getElementById("err-contact-consent"), "Please confirm we can use these details to reply.");
        valid = false;
      }
      if (!valid) {
        status.textContent = "Check the highlighted fields and try again.";
        var firstBad = form.querySelector("[aria-invalid='true']");
        if (firstBad) {
          firstBad.focus();
        }
        return;
      }

      var lines = ["Hello " + BUSINESS + ", I have an enquiry.", "Name: " + name, "Phone: " + phone];
      if (email) {
        lines.push("Email: " + email);
      }
      lines.push("Message: " + message);
      var text = lines.join("\n");
      var subject = "Website enquiry from " + name;

      markSent();
      form.hidden = true;
      showReady("contact", subject, text);
      openLink(byEmail ? mailtoUrl(subject, text) : whatsAppUrl(text), !byEmail);
    });
  }

  function initQuoteForm() {
    var form = document.getElementById("quote-form");
    if (!form) {
      return;
    }

    var panels = Array.prototype.slice.call(form.querySelectorAll(".wizard__panel"));
    var stepItems = Array.prototype.slice.call(form.querySelectorAll(".wizard__steps li"));
    var status = document.getElementById("quote-status");
    var stepIndex = 0;

    try {
      var wanted = allow(new URLSearchParams(window.location.search).get("service") || "", SERVICE_OPTIONS);
      if (wanted) {
        form.querySelectorAll("input[name='service']").forEach(function (input) {
          if (input.value === wanted) {
            input.checked = true;
          }
        });
      }
    } catch (error) {

    }

    function showStep(index, moveFocus) {
      stepIndex = index;
      panels.forEach(function (panel, panelIndex) {
        panel.hidden = panelIndex !== index;
      });
      stepItems.forEach(function (item, itemIndex) {
        item.classList.toggle("is-current", itemIndex === index);
        item.classList.toggle("is-done", itemIndex < index);
        if (itemIndex === index) {
          item.setAttribute("aria-current", "step");
        } else {
          item.removeAttribute("aria-current");
        }
      });
      if (index === panels.length - 1) {
        document.getElementById("quote-summary").textContent = buildMessage();
      }
      if (moveFocus) {
        var focusTarget = panels[index].querySelector("legend, h2");
        if (focusTarget) {
          focusTarget.setAttribute("tabindex", "-1");
          focusTarget.focus();
        }
      }
    }

    function validateStep(index) {
      clearErrors(form);
      status.textContent = "";

      if (index === 0) {
        if (!selectedValues(form, "service", SERVICE_OPTIONS).length) {
          var serviceError = document.getElementById("err-service");
          serviceError.hidden = false;
          serviceError.textContent = "Choose at least one type of work.";
          return false;
        }
        return true;
      }

      if (index === 1) {
        var postcodeInput = form.querySelector("#quote-postcode");
        var propertyInput = form.querySelector("#quote-property");
        var timingInput = form.querySelector("#quote-timing");
        var detailsInput = form.querySelector("#quote-details");
        var valid = true;
        if (!isUkPostcode(sanitizeText(postcodeInput.value, 10))) {
          setError(postcodeInput, document.getElementById("err-postcode"), "Please add a full UK postcode.");
          valid = false;
        }
        if (!allow(propertyInput.value, PROPERTY_OPTIONS)) {
          setError(propertyInput, document.getElementById("err-property"), "Please choose the type of property.");
          valid = false;
        }
        if (!allow(timingInput.value, TIMING_OPTIONS)) {
          setError(timingInput, document.getElementById("err-timing"), "Please say how soon the work is needed.");
          valid = false;
        }
        if (sanitizeText(detailsInput.value, 600).length < 10) {
          setError(detailsInput, document.getElementById("err-details"), "Add a few words about the job, at least a sentence.");
          valid = false;
        }
        if (!valid) {
          status.textContent = "Check the property details and try again.";
        }
        return valid;
      }

      if (index === 2) {
        var nameInput = form.querySelector("#quote-name");
        var phoneInput = form.querySelector("#quote-phone");
        var emailInput = form.querySelector("#quote-email");
        var consent = form.querySelector("#quote-consent");
        var email = sanitizeText(emailInput.value, 120);
        var ok = true;
        if (sanitizeText(nameInput.value, 80).length < 2) {
          setError(nameInput, document.getElementById("err-quote-name"), "Please add your name.");
          ok = false;
        }
        if (!isUkPhone(sanitizeText(phoneInput.value, 20))) {
          setError(phoneInput, document.getElementById("err-quote-phone"), "Please add a UK phone number.");
          ok = false;
        }
        if (email && !isEmail(email)) {
          setError(emailInput, document.getElementById("err-quote-email"), "That email does not look complete.");
          ok = false;
        }
        if (!selectedValues(form, "preference", CONTACT_OPTIONS).length) {
          var preferenceError = document.getElementById("err-preference");
          preferenceError.hidden = false;
          preferenceError.textContent = "Tell us how you would like the reply.";
          ok = false;
        }
        if (!consent.checked) {
          setError(consent, document.getElementById("err-quote-consent"), "Please confirm we can use these details to reply.");
          ok = false;
        }
        if (!ok) {
          status.textContent = "Check your contact details and try again.";
        }
        return ok;
      }

      return true;
    }

    function buildMessage() {
      var email = sanitizeText(form.querySelector("#quote-email").value, 120);
      var lines = [
        "Quote request for " + BUSINESS,
        "Work: " + selectedValues(form, "service", SERVICE_OPTIONS).join(", "),
        "Property: " + allow(form.querySelector("#quote-property").value, PROPERTY_OPTIONS),
        "How soon: " + allow(form.querySelector("#quote-timing").value, TIMING_OPTIONS),
        "Postcode: " + sanitizeText(form.querySelector("#quote-postcode").value, 10).toUpperCase(),
        "Details: " + sanitizeText(form.querySelector("#quote-details").value, 600),
        "Name: " + sanitizeText(form.querySelector("#quote-name").value, 80),
        "Phone: " + sanitizeText(form.querySelector("#quote-phone").value, 20),
        "Preferred contact: " + (selectedValues(form, "preference", CONTACT_OPTIONS)[0] || "")
      ];
      if (email) {
        lines.push("Email: " + email);
      }
      return lines.join("\n");
    }

    form.addEventListener("click", function (event) {
      if (event.target.closest("[data-back]")) {
        showStep(Math.max(0, stepIndex - 1), true);
        return;
      }
      if (event.target.closest("[data-next]") && validateStep(stepIndex)) {
        showStep(Math.min(panels.length - 1, stepIndex + 1), true);
      }
    });

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var byEmail = event.submitter && event.submitter.value === "email";

      if (stepIndex < panels.length - 1) {
        if (validateStep(stepIndex)) {
          showStep(stepIndex + 1, true);
        }
        return;
      }

      for (var step = 0; step < 3; step += 1) {
        if (!validateStep(step)) {
          showStep(step, true);
          return;
        }
      }
      if (honeypotTripped(form)) {
        form.hidden = true;
        document.getElementById("quote-success").hidden = false;
        return;
      }
      if (sentTooRecently()) {
        status.textContent = "Please wait a few seconds before sending another message.";
        return;
      }

      var text = buildMessage();
      var subject = "Quote request from " + sanitizeText(form.querySelector("#quote-name").value, 80);
      markSent();
      form.hidden = true;
      showReady("quote", subject, text);
      openLink(byEmail ? mailtoUrl(subject, text) : whatsAppUrl(text), !byEmail);
    });

    showStep(0, false);
  }

  var CHAT_TOPICS = [
    {
      keys: ["re-roof", "reroof", "re roof", "new roof", "replace", "replacement", "install", "tiles", "tile", "slate", "slates", "whole roof"],
      reply: "We fit new roofs and full re-roofs in tile or slate, including the felt, battens and ridge. After a visit you get a clear price before any work starts.",
      links: [["New roofs and re-roofs", "roof-installations.html"], ["Request a quote", "quote.html?service=Roof%20installation%20or%20re-roof"]]
    },
    {
      keys: ["leak", "leaking", "leaks", "drip", "water coming", "storm", "damage", "slipped", "missing", "broken tile", "repair", "repairs", "emergency", "urgent", "damp patch"],
      reply: "For a leak or storm damage, the quickest route is to call or WhatsApp with a photo if you have one. We find the cause first, then quote the repair.",
      links: [["Call " + PHONE_DISPLAY, PHONE_LINK], ["WhatsApp", whatsAppUrl("Hello " + BUSINESS + ", I have a roof problem that needs looking at.")], ["Roof repairs", "roof-repairs.html"]]
    },
    {
      keys: ["flat roof", "flat", "garage roof", "extension roof", "dormer", "rubber", "epdm", "felt", "fibreglass", "grp", "ponding"],
      reply: "We replace and repair flat roofs on garages, extensions, dormers and porches. The options for the covering are talked through on the visit.",
      links: [["Flat roofing", "flat-roofing.html"], ["Request a quote", "quote.html?service=Flat%20roofing"]]
    },
    {
      keys: ["gutter", "gutters", "guttering", "fascia", "fascias", "soffit", "soffits", "downpipe", "roofline", "overflow", "overflowing", "barge"],
      reply: "We replace and repair guttering, fascias and soffits, and clear or re-align gutters that overflow.",
      links: [["Guttering, fascias and soffits", "guttering-fascias-soffits.html"], ["Request a quote", "quote.html?service=Guttering%2C%20fascias%20and%20soffits"]]
    },
    {
      keys: ["chimney", "chimneys", "flashing", "lead", "pointing", "repoint", "pot", "cowl", "stack", "flaunching"],
      reply: "Chimney work covers lead flashing, repointing, pots and cowls, and taking down or capping a stack that is no longer used.",
      links: [["Chimney work", "chimney-work.html"], ["Request a quote", "quote.html?service=Chimney%20work"]]
    },
    {
      keys: ["extension", "extensions", "build", "building", "builder", "porch", "canopy", "brick", "brickwork", "garage conversion", "wall", "structural"],
      reply: "As well as roofing, we take on building work such as extensions, porches and canopies, with the roof built by the same team.",
      links: [["Building and extensions", "building-extensions.html"], ["Request a quote", "quote.html?service=Building%20or%20extension"]]
    },
    {
      keys: ["price", "prices", "cost", "costs", "how much", "quote", "quotes", "estimate", "cheap", "afford", "budget", "charge"],
      reply: "Quotes are free. We pop round to look at the job, or price small jobs from good photos, and the price is agreed before any work starts.",
      links: [["Request a quote", "quote.html"], ["WhatsApp photos", whatsAppUrl("Hello " + BUSINESS + ", I would like a price. I can send photos.")]]
    },
    {
      keys: ["area", "areas", "cover", "where", "location", "locations", "near me", "local", "come out", "travel", "based", "yard", "address", "postcode"],
      reply: "Our yard is in Pemberton, Wigan (WN5 8DH), and we cover the whole North West: Greater Manchester, Merseyside, Lancashire, Cheshire and Cumbria.",
      links: [["Locations", "locations.html"]]
    },
    {
      keys: ["phone", "call", "number", "email", "contact", "whatsapp", "speak", "talk", "human", "person", "someone", "joe"],
      reply: "You can call or WhatsApp " + PHONE_DISPLAY + ", or email " + EMAIL + ".",
      links: [["Call " + PHONE_DISPLAY, PHONE_LINK], ["WhatsApp", whatsAppUrl("Hello " + BUSINESS + ", I would like to ask about some work.")], ["Email", "mailto:" + EMAIL]]
    },
    {
      keys: ["photo", "photos", "pictures", "gallery", "examples", "previous work", "before and after", "portfolio"],
      reply: "There are photos of roofs, flat roofs, chimneys and roofline work in the gallery, including before and after pairs.",
      links: [["Gallery", "gallery.html"]]
    },
    {
      keys: ["review", "reviews", "feedback", "recommend", "rating", "testimonial"],
      reply: "Customer reviews are on the reviews page.",
      links: [["Reviews", "reviews.html"]]
    },
    {
      keys: ["insured", "insurance", "guarantee", "warranty", "accredited", "qualified", "certificate", "vat", "registered", "how long", "when can", "available", "availability", "opening", "hours", "open"],
      reply: "That is one to ask us directly, so you get an exact answer and not a guess from me.",
      links: [["Call " + PHONE_DISPLAY, PHONE_LINK], ["WhatsApp", whatsAppUrl("Hello " + BUSINESS + ", I have a question before booking.")]]
    }
  ];

  var CHAT_TOWNS = [
    "pemberton", "wigan", "manchester", "salford", "stockport", "bolton", "bury", "oldham", "rochdale", "trafford", "tameside",
    "altrincham", "sale", "leigh", "liverpool", "wirral", "birkenhead", "southport", "st helens", "bootle", "knowsley",
    "sefton", "chester", "warrington", "crewe", "macclesfield", "northwich", "widnes", "runcorn", "ellesmere port",
    "preston", "blackburn", "blackpool", "burnley", "lancaster", "chorley", "accrington", "morecambe", "leyland",
    "carlisle", "kendal", "barrow", "penrith", "workington", "whitehaven", "cumbria", "lancashire", "cheshire", "merseyside"
  ];

  var CHAT_FALLBACK = {
    reply: "I can answer questions about our services, the areas we cover and how quotes work. For anything else, a call or WhatsApp will get you a proper answer.",
    links: [["Call " + PHONE_DISPLAY, PHONE_LINK], ["WhatsApp", whatsAppUrl("Hello " + BUSINESS + ", I have a question.")], ["Request a quote", "quote.html"]]
  };

  function localAnswer(question) {
    var text = " " + question.toLowerCase().replace(/[^a-z0-9\s-]/g, " ").replace(/\s+/g, " ") + " ";

    for (var t = 0; t < CHAT_TOWNS.length; t += 1) {
      if (text.indexOf(" " + CHAT_TOWNS[t] + " ") !== -1) {
        var town = CHAT_TOWNS[t].replace(/\b[a-z]/g, function (letter) {
          return letter.toUpperCase();
        });
        return {
          reply: "Yes, we cover " + town + " along with the rest of the North West. Send a postcode with your quote request and we will arrange a visit.",
          links: [["Request a quote", "quote.html"], ["All locations", "locations.html"]]
        };
      }
    }

    var best = null;
    var bestScore = 0;
    CHAT_TOPICS.forEach(function (topic) {
      var score = 0;
      topic.keys.forEach(function (key) {
        if (text.indexOf(" " + key + " ") !== -1 || (key.length > 5 && text.indexOf(key) !== -1)) {
          score += key.indexOf(" ") !== -1 ? 2 : 1;
        }
      });
      if (score > bestScore) {
        best = topic;
        bestScore = score;
      }
    });
    return best || CHAT_FALLBACK;
  }

  function remoteAnswer(history) {
    if (!CHAT_ENDPOINT || typeof fetch !== "function") {
      return Promise.resolve(null);
    }
    var controller = typeof AbortController === "function" ? new AbortController() : null;
    var timer = setTimeout(function () {
      if (controller) {
        controller.abort();
      }
    }, CHAT_TIMEOUT_MS);

    return fetch(CHAT_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "omit",
      signal: controller ? controller.signal : undefined,
      body: JSON.stringify({ messages: history.slice(-10) })
    })
      .then(function (response) {
        return response.ok ? response.json() : null;
      })
      .then(function (data) {
        clearTimeout(timer);

        return data && typeof data.reply === "string" ? sanitizeText(data.reply, 1200) : null;
      })
      .catch(function () {
        clearTimeout(timer);
        return null;
      });
  }

  function initChat() {
    var openers = document.querySelectorAll("[data-chat-open]");
    if (!openers.length) {
      return;
    }

    var panel = null;
    var log = null;
    var input = null;
    var lastOpener = null;
    var history = [];
    var busy = false;

    function addMessage(role, text, links) {
      var bubble = el("div", "chat__msg chat__msg--" + role);
      bubble.appendChild(el("p", "", text));
      if (links && links.length) {
        var row = el("div", "chat__links");
        links.forEach(function (pair) {
          var link = el("a", "", pair[0]);
          link.href = pair[1];
          if (pair[1].indexOf("https://") === 0) {
            link.target = "_blank";
            link.rel = "noopener noreferrer";
          }
          row.appendChild(link);
        });
        bubble.appendChild(row);
      }
      log.appendChild(bubble);
      log.scrollTop = log.scrollHeight;
      return bubble;
    }

    function ask(raw) {
      var question = sanitizeText(raw, 300);
      if (!question || busy) {
        return;
      }
      busy = true;
      addMessage("user", question);
      history.push({ role: "user", content: question });
      var typing = addMessage("bot", "Typing…");
      typing.classList.add("chat__typing");

      remoteAnswer(history).then(function (remote) {
        var answer = remote ? { reply: remote, links: CHAT_FALLBACK.links.slice(0, 2) } : localAnswer(question);

        setTimeout(function () {
          typing.remove();
          addMessage("bot", answer.reply, answer.links);
          history.push({ role: "assistant", content: answer.reply });
          busy = false;
        }, remote ? 0 : 350);
      });
    }

    function build() {
      panel = el("section", "chat");
      panel.id = "chat-panel";
      panel.setAttribute("role", "dialog");
      panel.setAttribute("aria-labelledby", "chat-title");
      panel.hidden = true;

      var head = el("header", "chat__head");
      var logo = document.createElement("img");
      logo.src = "images/logo-mark.webp";
      logo.alt = "";
      logo.width = 320;
      logo.height = 186;
      var titles = el("div");
      var title = el("h2", "chat__title", "Ask our assistant");
      title.id = "chat-title";
      titles.appendChild(title);
      titles.appendChild(el("p", "chat__sub", "Automated answers. For a person, call or WhatsApp."));
      var close = el("button", "chat__close");
      close.type = "button";
      close.setAttribute("aria-label", "Close chat");
      close.textContent = "✕";
      head.appendChild(logo);
      head.appendChild(titles);
      head.appendChild(close);

      log = el("div", "chat__log");
      log.setAttribute("role", "log");
      log.setAttribute("aria-live", "polite");
      log.setAttribute("aria-label", "Conversation");
      log.tabIndex = 0;

      var chips = el("div", "chat__chips");
      ["My roof is leaking", "How much is a new roof?", "Which areas do you cover?", "Flat roof options", "Speak to someone"].forEach(function (label) {
        var chip = el("button", "", label);
        chip.type = "button";
        chips.appendChild(chip);
      });

      var form = el("form", "chat__form");
      form.setAttribute("novalidate", "");
      var label = el("label", "visually-hidden", "Your question");
      label.htmlFor = "chat-input";
      input = document.createElement("input");
      input.id = "chat-input";
      input.type = "text";
      input.maxLength = 300;
      input.autocomplete = "off";
      input.placeholder = "Ask about a roof or building job";
      var send = el("button", "btn btn--primary", "Send");
      send.type = "submit";
      form.appendChild(label);
      form.appendChild(input);
      form.appendChild(send);

      panel.appendChild(head);
      panel.appendChild(log);
      panel.appendChild(chips);
      panel.appendChild(form);
      document.body.appendChild(panel);

      addMessage("bot", "Hello. I am an automated assistant for " + BUSINESS + ". Ask me about our roofing and building work, the areas we cover, or how to get a quote.");

      close.addEventListener("click", closeChat);
      chips.addEventListener("click", function (event) {
        var chip = event.target.closest("button");
        if (chip) {
          ask(chip.textContent);
        }
      });
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        ask(input.value);
        input.value = "";
      });
      panel.addEventListener("keydown", function (event) {
        if (event.key === "Escape") {
          closeChat();
        }
      });
    }

    function setExpanded(open) {
      openers.forEach(function (button) {
        button.setAttribute("aria-expanded", open ? "true" : "false");
      });
    }

    function openChat(event) {
      if (!panel) {
        build();
      }
      lastOpener = event.currentTarget;
      panel.hidden = false;
      setExpanded(true);
      input.focus();
    }

    function closeChat() {
      panel.hidden = true;
      setExpanded(false);
      if (lastOpener) {
        lastOpener.focus();
      }
    }

    openers.forEach(function (button) {

      button.hidden = false;
      button.setAttribute("aria-expanded", "false");
      button.setAttribute("aria-controls", "chat-panel");
      button.addEventListener("click", function (event) {
        if (panel && !panel.hidden) {
          closeChat();
        } else {
          openChat(event);
        }
      });
    });
  }

  initYear();
  initNav();
  initSocial();
  initSlides();
  initTabs();
  initBeforeAfter();
  initReveal();
  initMap();
  initHouse();
  initGallery();
  initContactForm();
  initQuoteForm();
  initChat();
})();
