export function initNavigation() {
  const button = document.querySelector('[data-nav-toggle]');
  const navigation = document.querySelector('[data-navigation]');
  if (!button || !navigation) return;

  const close = () => {
    button.setAttribute('aria-expanded', 'false');
    navigation.dataset.open = 'false';
  };

  button.addEventListener('click', () => {
    const isOpen = button.getAttribute('aria-expanded') === 'true';
    button.setAttribute('aria-expanded', String(!isOpen));
    navigation.dataset.open = String(!isOpen);
  });
  navigation.addEventListener('click', event => {
    if (event.target.closest('a')) close();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') close();
  });
}
