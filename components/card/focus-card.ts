// Moves keyboard focus to a card inside `container`: its flip button (the control whose
// accessible name is the card label), else the card article (tabindex -1). Plain DOM, no
// React, so Collection, Browse and the portal can share one hand-off rule. Returns true only
// when focus actually landed there.
export function focusCard(container: Element | null | undefined): boolean {
  if (!container) return false;
  const target =
    container.querySelector<HTMLElement>(".card-flip") ??
    container.querySelector<HTMLElement>("article");
  if (target === null) return false;
  target.focus();
  return document.activeElement === target;
}
