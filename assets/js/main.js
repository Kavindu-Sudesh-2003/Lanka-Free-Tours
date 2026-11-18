const CONFIG = {
  whatsapp: "94762131020",
  email: "info@lankafreetours.com",
  ga4MeasurementId: "G-REPLACE_WITH_MEASUREMENT_ID",
  googleAdsId: "AW-REPLACE_WITH_GOOGLE_ADS_ID",
  adsConversionLabels: {
    whatsappClick: "REPLACE_WITH_WHATSAPP_CLICK_LABEL",
    tourEnquiry: "REPLACE_WITH_TOUR_ENQUIRY_LABEL",
    transportEnquiry: "REPLACE_WITH_TRANSPORT_ENQUIRY_LABEL",
    qualifiedEnquiry: "REPLACE_WITH_QUALIFIED_ENQUIRY_LABEL"
  }
};

const reduceMotion = Boolean(
  window.matchMedia &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches
);
const supportsReveal = !reduceMotion && "IntersectionObserver" in window;
const supportsParallax = Boolean(
  window.matchMedia &&
  window.matchMedia("(hover: hover) and (pointer: fine)").matches
);
const validTrackingId = (value, pattern) =>
  pattern.test(value) && !value.includes("REPLACE");
const ga4Configured = validTrackingId(CONFIG.ga4MeasurementId, /^G-[A-Z0-9]+$/);
const adsConfigured = validTrackingId(CONFIG.googleAdsId, /^AW-\d+$/);
const allowedEvents = new Set([
  "page_view",
  "whatsapp_click",
  "enquiry_form_start",
  "enquiry_form_submit",
  "tour_package_view",
  "tour_enquiry",
  "transport_enquiry"
]);
const allowedParameters = new Set([
  "page_type",
  "tour_id",
  "enquiry_type",
  "form_location",
  "action_location"
]);

function whatsappUrl(message) {
  const defaultMessage = "Hello Lanka Free Tours! I'd like to plan a trip to Sri Lanka.";
  return `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(message || defaultMessage)}`;
}

function safePageLocation() {
  return `${window.location.origin}${window.location.pathname}`;
}

function trackEvent(name, parameters = {}) {
  if (!allowedEvents.has(name) || typeof window.gtag !== "function") return;

  const safeParameters = { page_location: safePageLocation() };
  Object.entries(parameters).forEach(([key, value]) => {
    if (
      allowedParameters.has(key) &&
      typeof value === "string" &&
      /^[a-z0-9_-]{1,48}$/i.test(value)
    ) {
      safeParameters[key] = value;
    }
  });
  window.gtag("event", name, safeParameters);
}

function trackAdsConversion(labelKey) {
  const label = CONFIG.adsConversionLabels[labelKey];
  if (
    !adsConfigured ||
    !label ||
    label.includes("REPLACE") ||
    typeof window.gtag !== "function"
  ) return;
  window.gtag("event", "conversion", {
    send_to: `${CONFIG.googleAdsId}/${label}`,
    page_location: safePageLocation()
  });
}

function loadGoogleTag() {
  if (!ga4Configured && !adsConfigured) return;

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () {
    window.dataLayer.push(arguments);
  };
  window.gtag("js", new Date());
  window.gtag("consent", "default", {
    analytics_storage: "denied",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied"
  });
  if (ga4Configured) {
    window.gtag("config", CONFIG.ga4MeasurementId, {
      send_page_view: false,
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
      page_location: safePageLocation()
    });
  }
  if (adsConfigured) {
    window.gtag("config", CONFIG.googleAdsId, {
      send_page_view: false,
      allow_enhanced_conversions: false,
      page_location: safePageLocation()
    });
  }

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(
    ga4Configured ? CONFIG.ga4MeasurementId : CONFIG.googleAdsId
  )}`;
  script.onerror = () => {
    console.error("Google tag failed to load; analytics and ad events were not sent.");
  };
  document.head.appendChild(script);
}

function pageType() {
  const file = window.location.pathname.split("/").pop() || "index.html";
  return file.replace(/\.html$/i, "").toLowerCase();
}

loadGoogleTag();
window.LFTTracking = Object.freeze({
  track: trackEvent,
  updateConsent(consent) {
    if (!consent || typeof consent.analytics !== "boolean" || typeof consent.ads !== "boolean") {
      throw new TypeError("Pass boolean analytics and ads consent choices.");
    }
    if (typeof window.gtag !== "function") return;
    window.gtag("consent", "update", {
      analytics_storage: consent.analytics ? "granted" : "denied",
      ad_storage: consent.ads ? "granted" : "denied",
      ad_user_data: consent.ads ? "granted" : "denied",
      ad_personalization: consent.ads ? "granted" : "denied"
    });
  }
});

if (supportsReveal) document.documentElement.classList.add("motion-ready");

document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.querySelector(".menu");
  const nav = document.querySelector(".links");
  const header = document.querySelector(".header");
  const backToTop = document.createElement("button");
  backToTop.type = "button";
  backToTop.className = "back-to-top";
  backToTop.setAttribute("aria-label", "Back to top");
  backToTop.setAttribute("aria-hidden", "true");
  backToTop.tabIndex = -1;
  const backToTopIcon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  backToTopIcon.setAttribute("viewBox", "0 0 24 24");
  backToTopIcon.setAttribute("aria-hidden", "true");
  backToTopIcon.setAttribute("focusable", "false");
  const backToTopPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
  backToTopPath.setAttribute(
    "d",
    "M12 5l-7 7 1.4 1.4 4.6-4.6V20h2V8.8l4.6 4.6L19 12z"
  );
  backToTopIcon.appendChild(backToTopPath);
  backToTop.appendChild(backToTopIcon);
  document.body.appendChild(backToTop);

  backToTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
  });

  function closeMenu() {
    if (!toggle || !nav) return;
    nav.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
  }

  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const isOpen = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });
    nav.querySelectorAll("a").forEach(link => link.addEventListener("click", closeMenu));
    document.addEventListener("keydown", event => {
      if (event.key === "Escape") closeMenu();
    });
    document.addEventListener("click", event => {
      if (
        nav.classList.contains("open") &&
        !nav.contains(event.target) &&
        !toggle.contains(event.target)
      ) closeMenu();
    });
  }

  document.querySelectorAll("[data-wa]").forEach(link => {
    link.href = whatsappUrl(link.dataset.msg);
    link.target = "_blank";
    link.rel = "noopener";
  });

  const currentPageType = pageType();
  trackEvent("page_view", { page_type: currentPageType });
  const tourMatch = currentPageType.match(/^(tour-\d+-day)$/);
  if (tourMatch) trackEvent("tour_package_view", { tour_id: tourMatch[1] });

  document.addEventListener("click", event => {
    const link = event.target.closest("a[href]");
    if (!link) return;

    let targetUrl;
    try {
      targetUrl = new URL(link.href, window.location.href);
    } catch (error) {
      console.error("Unable to validate the contact link.", error);
      return;
    }
    const action = link.dataset.trackingAction ||
      (targetUrl.pathname.endsWith("/transport.html") ? "transport_enquiry" : "") ||
      (tourMatch && targetUrl.pathname.endsWith("/custom-tours.html") ? "tour_enquiry" : "");
    const validAction = action === "tour_enquiry" || action === "transport_enquiry";
    if (validAction) {
      trackEvent(action, {
        enquiry_type: action === "tour_enquiry" ? "tour_package" : "transport",
        action_location: link.dataset.trackingLocation || "link"
      });
    }

    if (targetUrl.hostname !== "wa.me") return;

    trackEvent("whatsapp_click", {
      action_location: link.dataset.trackingLocation || "link"
    });
    if (validAction && link.dataset.noConversion !== "true") {
      trackAdsConversion(action === "tour_enquiry" ? "tourEnquiry" : "transportEnquiry");
    } else if (link.dataset.noConversion !== "true") {
      trackAdsConversion("whatsappClick");
    }
  });

  document.querySelectorAll("form[data-inquiry]").forEach(form => {
    const submitButton = form.querySelector('button[type="submit"]');
    const status = form.querySelector("[data-form-status]");
    const fallbackLink = form.querySelector("[data-wa-fallback]");
    const messagePreview = form.querySelector("[data-message-preview]");
    const arrival = form.elements.namedItem("Arrival Date");
    const departure = form.elements.namedItem("Departure Date");
    let started = false;
    let submissionPending = false;
    const enquiryTypeSelect = form.elements.namedItem("Enquiry Type");

    if (enquiryTypeSelect) {
      enquiryTypeSelect.value = form.dataset.serviceDefault === "transport"
        ? "Private Transport & Driver Service"
        : "Complete Tour Packages";
    }

    function updateDateLimits() {
      const today = new Date();
      const todayText = new Date(
        today.getTime() - today.getTimezoneOffset() * 60000
      ).toISOString().slice(0, 10);
      if (arrival) arrival.min = todayText;
      if (departure) {
        departure.min = arrival && arrival.value ? arrival.value : todayText;
        departure.setCustomValidity(
          arrival && arrival.value && departure.value && departure.value < arrival.value
            ? "Departure date must be on or after the arrival date."
            : ""
        );
      }
    }

    function clearPendingMessage() {
      if (!submissionPending) return;
      submissionPending = false;
      if (submitButton) submitButton.disabled = false;
      if (status) status.textContent = "";
      if (messagePreview) {
        messagePreview.value = "";
        messagePreview.hidden = true;
      }
      if (fallbackLink) {
        fallbackLink.hidden = true;
        fallbackLink.removeAttribute("href");
      }
    }

    updateDateLimits();
    if (arrival) arrival.addEventListener("change", updateDateLimits);
    if (departure) departure.addEventListener("change", updateDateLimits);

    form.addEventListener("focusin", () => {
      if (started) return;
      started = true;
      trackEvent("enquiry_form_start", {
        form_location: form.dataset.formLocation || "website"
      });
    });
    form.addEventListener("invalid", () => {
      if (status) status.textContent = "Please check the required fields and try again.";
    }, true);
    form.addEventListener("input", clearPendingMessage);
    form.addEventListener("change", clearPendingMessage);
    form.addEventListener("submit", event => {
      event.preventDefault();
      updateDateLimits();
      if (!form.checkValidity()) {
        form.reportValidity();
        if (status) status.textContent = "Please check the required fields and dates.";
        return;
      }
      if (submissionPending) return;

      const formData = new FormData(form);
      const lines = [
        "Hello Lanka Free Tours! I'd like to enquire about a Sri Lanka trip.",
        ""
      ];
      for (const [key, value] of formData.entries()) {
        if (String(value).trim()) lines.push(`${key}: ${String(value).trim()}`);
      }
      const enquiryType = formData.get("Enquiry Type") === "Private Transport & Driver Service"
        ? "transport"
        : "tour_package";
      const message = lines.join("\n");
      const destination = whatsappUrl();

      trackEvent("enquiry_form_submit", {
        enquiry_type: enquiryType,
        form_location: form.dataset.formLocation || "website"
      });
      trackEvent(
        enquiryType === "transport" ? "transport_enquiry" : "tour_enquiry",
        { enquiry_type: enquiryType, form_location: form.dataset.formLocation || "website" }
      );
      trackAdsConversion(enquiryType === "transport" ? "transportEnquiry" : "tourEnquiry");

      if (fallbackLink) {
        fallbackLink.href = destination;
        fallbackLink.target = "_blank";
        fallbackLink.rel = "noopener";
        fallbackLink.dataset.trackingAction = enquiryType === "transport"
          ? "transport_enquiry"
          : "tour_enquiry";
        fallbackLink.dataset.noConversion = "true";
        fallbackLink.hidden = false;
      }
      if (messagePreview) {
        messagePreview.value = message;
        messagePreview.hidden = false;
      }
      submissionPending = true;
      if (submitButton) submitButton.disabled = true;
      if (status) {
        status.textContent =
          "Your message is ready below. Paste it into WhatsApp, review it and tap Send; this site cannot confirm delivery.";
      }
      try {
        window.open(destination, "_blank", "noopener");
      } catch (error) {
        console.error("Unable to open the WhatsApp enquiry window.", error);
        if (status) {
          status.textContent =
            "WhatsApp could not be opened automatically. Copy the prepared message below, then use the link to open WhatsApp.";
        }
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        let copyPromise;
        try {
          copyPromise = navigator.clipboard.writeText(message);
        } catch (error) {
          console.error("Unable to copy the prepared WhatsApp message.", error);
        }
        if (copyPromise) Promise.resolve(copyPromise).then(() => {
          if (status) {
            status.textContent =
              "Your message was copied. Paste it into WhatsApp, review it and tap Send. This site cannot confirm delivery.";
          }
        }).catch(error => {
          console.error("Unable to copy the prepared WhatsApp message.", error);
          if (status) {
            status.textContent =
              "Your message is shown below. Copy it into WhatsApp, review it and tap Send. This site cannot confirm that it was sent.";
          }
        });
      } else if (status) {
        status.textContent =
          "Your message is shown below. Copy it into WhatsApp, review it and tap Send. This site cannot confirm that it was sent.";
      }
    });
  });

  let scrollFrame = 0;
  const heroImages = supportsParallax && !reduceMotion
    ? [...document.querySelectorAll(".hero-bg,.detail-hero>img")]
    : [];

  function updateScrollEffects() {
    scrollFrame = 0;
    if (header) header.classList.toggle("is-scrolled", window.scrollY > 24);
    const showBackToTop = window.scrollY > 400;
    backToTop.classList.toggle("is-visible", showBackToTop);
    backToTop.setAttribute("aria-hidden", String(!showBackToTop));
    backToTop.tabIndex = showBackToTop ? 0 : -1;
    heroImages.forEach(image => {
      const bounds = image.getBoundingClientRect();
      if (bounds.bottom < 0 || bounds.top > window.innerHeight) return;
      const progress = (bounds.top + bounds.height / 2 - window.innerHeight / 2) /
        window.innerHeight;
      const offset = Math.max(-8, Math.min(8, -progress * 12));
      image.style.setProperty("--parallax-offset", `${offset.toFixed(1)}px`);
    });
  }

  window.addEventListener("scroll", () => {
    if (!scrollFrame) scrollFrame = window.requestAnimationFrame(updateScrollEffects);
  }, { passive: true });
  updateScrollEffects();

  if (supportsReveal) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.05 });

    function reveal(selector, direction = "up") {
      document.querySelectorAll(selector).forEach((element, index) => {
        element.dataset.reveal = typeof direction === "function"
          ? direction(index)
          : direction;
        element.style.setProperty("--reveal-delay", `${Math.min(index % 4, 3) * 75}ms`);
        observer.observe(element);
      });
    }

    reveal(".intro-inner");
    reveal(".section-head");
    reveal(".tour-card");
    reveal(".feature-photo", "left");
    reveal(".feature-copy", "right");
    reveal(".dest", "scale");
    reveal(".why-grid>*", index => index % 2 ? "right" : "left");
    reveal(".cta");
    reveal(".pagehero .wrap");
    reveal(".detail-layout>*", index => index % 2 ? "right" : "left");
    reveal(".place", index => index % 2 ? "right" : "left");
    reveal(".inquiry-layout>*", index => index % 2 ? "right" : "left");
    reveal(".transport-benefit");
    reveal(".package-facts");
    reveal(".testimonial-placeholder");
    reveal(".experience-links");
    reveal(".faq");
    reveal(".footer-main>*");
    reveal(".footer-bottom");
  }
});
