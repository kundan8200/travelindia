(() => {
  const GA_MEASUREMENT_ID = "G-1H3ZTB5WKP";

  // Initialize dataLayer + gtag
  window.dataLayer = window.dataLayer || [];
  function gtag() {
    window.dataLayer.push(arguments);
  }
  // Expose for other scripts (optional)
  window.gtag = window.gtag || gtag;

  // Load gtag.js asynchronously
  const src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_MEASUREMENT_ID)}`;
  if (!document.querySelector(`script[src="${src}"]`)) {
    const s = document.createElement("script");
    s.async = true;
    s.src = src;
    document.head.appendChild(s);
  }

  // Default pageview
  window.gtag("js", new Date());
  window.gtag("config", GA_MEASUREMENT_ID);
})();
