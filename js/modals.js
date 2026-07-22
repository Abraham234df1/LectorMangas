export function openModal(modal) {
  if (!modal) return;
  modal.hidden = false;
  document.body.classList.add("modal-open");

  // Focus the first interactive element or the close button
  const focusable = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex="0"]');
  if (focusable.length > 0) {
    focusable[0].focus();
  }
}

export function closeModal(modal) {
  if (!modal) return;
  modal.hidden = true;
  document.body.classList.remove("modal-open");
}

export function setupModalBackdrop(modal, closeButton) {
  if (!modal) return;

  if (closeButton) {
    closeButton.addEventListener("click", () => closeModal(modal));
  }

  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      closeModal(modal);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !modal.hidden) {
      closeModal(modal);
    }
  });
}
