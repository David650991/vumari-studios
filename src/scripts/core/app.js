import { initNavigation } from '../components/navigation.js';
import { initForms } from '../components/forms.js';

initNavigation();
initForms();
document.documentElement.classList.add('js-ready');
