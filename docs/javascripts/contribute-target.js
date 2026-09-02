// On the "Contribuer" page, reads the ?edit_url=... query param (set by
// the per-page "Suggérer une amélioration" button — see
// overrides/partials/actions.html) and shows a direct link to that exact
// file on GitHub. Lets a visitor land on Contribuer first, understand why
// and how to contribute, then jump straight to the file they came from.
//
// edit_url comes from the URL query string, i.e. from whoever crafted the
// link — never trust it. It's validated against this exact repo's GitHub
// edit-URL shape before use, and every DOM node below is built with
// createElement/textContent (never innerHTML) so nothing in it can ever
// be interpreted as markup.
(function () {
  var EDIT_URL_PATTERN =
    /^https:\/\/github\.com\/Subnau940\/CTF-Test-MkDocs\/edit\/main\/docs\/[A-Za-z0-9._\/-]+\.md$/;

  function injectContributeTarget() {
    if (!/\/contributing\/?(?:index\.html)?$/.test(window.location.pathname)) {
      return;
    }

    var existing = document.querySelector(".contribute-target");
    if (existing) existing.remove();

    var params = new URLSearchParams(window.location.search);
    var editUrl = params.get("edit_url");
    if (!editUrl || !EDIT_URL_PATTERN.test(editUrl)) return;

    var fileLabel = editUrl.split("/docs/")[1];

    var box = document.createElement("div");
    box.className = "contribute-target";

    var label = document.createElement("p");
    label.className = "contribute-target__label";
    label.appendChild(document.createTextNode("Tu viens de "));
    var code = document.createElement("code");
    code.textContent = fileLabel;
    label.appendChild(code);

    var link = document.createElement("a");
    link.className = "contribute-target__btn";
    link.href = editUrl;
    var icon = document.createElement("span");
    icon.className = "contribute-target__icon";
    icon.setAttribute("aria-hidden", "true");
    icon.textContent = "↗";
    var linkText = document.createElement("span");
    linkText.textContent = "Ouvrir ce fichier sur GitHub";
    link.appendChild(icon);
    link.appendChild(linkText);

    box.appendChild(label);
    box.appendChild(link);

    var slot = document.getElementById("contribute-target-slot");
    if (slot) {
      slot.replaceWith(box);
    }
  }

  if (typeof document$ !== "undefined") {
    document$.subscribe(injectContributeTarget);
  } else {
    document.addEventListener("DOMContentLoaded", injectContributeTarget);
  }
})();
