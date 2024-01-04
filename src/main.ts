import { createApp } from 'vue'
import { createPinia } from 'pinia'
import axios from 'axios'
import VueAxios from 'vue-axios'
import App from '@/App.vue'
import router from '@/router'
import PrimeVue from 'primevue/config';
import Card from 'primevue/card';
import Menu from 'primevue/menu';
import Menubar from 'primevue/menubar';
import Sidebar from 'primevue/sidebar';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';

import 'primevue/resources/themes/saga-green/theme.css';
import 'primevue/resources/primevue.min.css';
import 'primeflex/primeflex.min.css'
import 'primeicons/primeicons.css';
import './assets/main.css'

const pinia = createPinia()
const app = createApp(App)
// Install Pinia
app.use(pinia)
// Install Router for SPA
app.use(router)
// Make PrimeVue available throughout the project
app.use(PrimeVue)
// Install Axios for RESTful Webservice calls
app.use(VueAxios, axios)
// Add primefaces components
app.component('PrimeCard', Card)
app.component('PrimeMenu', Menu)
app.component('PrimeMenubar', Menubar)
app.component('PrimeSidebar', Sidebar)
app.component('PrimeInputText', InputText)
app.component('PrimeButton', Button)

app.mount('#app')
