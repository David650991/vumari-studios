export function initForms() {
  document.querySelectorAll('[data-contact-form]').forEach(form => {
    form.addEventListener('submit', event => {
      const status = form.querySelector('[data-form-status]');
      if (!form.checkValidity()) {
        event.preventDefault();
        form.reportValidity();
        if (status) status.textContent = 'Revisa los campos señalados antes de continuar.';
        return;
      }
      const endpoint = form.getAttribute('action');
      if (!endpoint || endpoint === '#') {
        event.preventDefault();
        if (status) status.textContent = 'El envío en línea está pendiente de configuración. Puedes guardar esta información y contactar a VUMARI cuando se publique un canal oficial.';
      }
    });
  });
}
