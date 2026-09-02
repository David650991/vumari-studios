import { initNavigation } from '../components/navigation.js';
import { initForms } from '../components/forms.js';
import { initVideos } from '../components/videos.js';

initNavigation();
initForms();
initVideos();
document.documentElement.classList.add('js-ready');
