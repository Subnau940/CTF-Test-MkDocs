// Adds a "Télécharger en PDF" button to any page that contains a Flag
// admonition (i.e. a challenge writeup, not an index/listing page).
// Uses the browser's native print-to-PDF via window.print(), styled with
// dedicated print CSS (see stylesheets/extra.css @media print) — instant,
// no server round-trip, always reflects the live content of the page.
(function () {
  function injectPdfButton() {
    var article = document.querySelector(".md-content__inner");
    if (!article) return;

    var existing = article.querySelector(".pdf-download-btn");
    if (existing) existing.remove();

    var flagBlock = article.querySelector(
      ".admonition.success, details.success"
    );
    if (!flagBlock) return;

    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "pdf-download-btn";
    btn.setAttribute("aria-label", "Télécharger ce writeup en PDF");
    btn.innerHTML =
      '<span class="pdf-download-btn__icon" aria-hidden="true">&#11015;</span>' +
      '<span class="pdf-download-btn__label">Télécharger en PDF</span>';
    btn.addEventListener("click", function () {
      window.print();
    });

    article.insertBefore(btn, article.firstChild);
  }

  if (typeof document$ !== "undefined") {
    // Material's instant-navigation observable: fires on every page swap.
    document$.subscribe(injectPdfButton);
  } else {
    document.addEventListener("DOMContentLoaded", injectPdfButton);
  }
})();
