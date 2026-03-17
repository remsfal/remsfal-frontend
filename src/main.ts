import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from '@/App.vue';
import router from '@/router';

import PrimeVue from 'primevue/config';
import Aura from '@primevue/themes/aura';
import BadgeDirective from 'primevue/badgedirective';
import ConfirmationService from 'primevue/confirmationservice';
import DialogService from 'primevue/dialogservice';
import Ripple from 'primevue/ripple';
import StyleClass from 'primevue/styleclass';
import ToastService from 'primevue/toastservice';
import Tooltip from 'primevue/tooltip';

import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faList, faListCheck, faLightbulb, faTriangleExclamation, faRocket, faScrewdriverWrench, faFileLines, faChartLine, faBuildingUser } from '@fortawesome/free-solid-svg-icons';
import { faRectangleList } from '@fortawesome/free-regular-svg-icons';

import '@/assets/styles.scss';
import '@/assets/tailwind.css';
import { initDB } from '@/helper/indexeddb';
import { addOnlineEventListener, registerServiceWorker } from '@/helper/service-worker-init';
import i18n from '@/i18n/i18n';

// Add Font Awesome Icons to the Library (only icons actually used in the app)
library.add(faList, faListCheck, faLightbulb, faTriangleExclamation, faRocket, faScrewdriverWrench, faFileLines, faChartLine, faBuildingUser, faRectangleList);

const pinia = createPinia();
const app = createApp(App);
// Install Pinia first (needed for stores)
app.use(pinia);

// Initialize session BEFORE installing the router.
// Vue Router 4 triggers the initial navigation synchronously during app.use(router),
// which fires the beforeEach guard. The session must be populated at that point.
const { useUserSessionStore } = await import('@/stores/UserSession');
const { useProjectStore } = await import('@/stores/ProjectStore');
const sessionStore = useUserSessionStore();
await sessionStore.refreshSessionState();
useProjectStore().refreshProjectList();

// Install Router for SPA (initial navigation fires here — session is already set)
app.use(router);
// Make PrimeVue available throughout the project
app.use(PrimeVue, {
  theme: {
    preset: Aura,
    // https://primevue.org/theming/styled/
    options: {darkModeSelector: '.app-dark',},
  },
});
app.use(ToastService);
app.use(DialogService);
app.use(ConfirmationService);

// Install Internationalization
app.use(i18n);

// Add primevue directives
app.directive('badge', BadgeDirective);
app.directive('ripple', Ripple);
app.directive('styleclass', StyleClass);
app.directive('tooltip', Tooltip);

// Register Font Awesome Icon globally
// PrimeVue components are auto-imported via PrimeVueResolver (vite.config.ts)
app.component('FontAwesomeIcon', FontAwesomeIcon);

app.mount('#app');

initDB(); // Initialize IndexedDB when the app starts

// Register Service Worker
registerServiceWorker();

// Add Online Event Listener
addOnlineEventListener();
