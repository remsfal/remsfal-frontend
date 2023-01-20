import { createApp } from 'vue'
import axios from 'axios'
import VueAxios from 'vue-axios'
import App from './App.vue'
import router from './router'
import PrimeVue from 'primevue/config';
import Menubar from 'primevue/menubar';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';

import 'primevue/resources/themes/saga-green/theme.css';
import 'primevue/resources/primevue.min.css';
import 'primeflex/primeflex.min.css'
import 'primeicons/primeicons.css';
import './assets/main.css'

const app = createApp(App)
// Install Router for SPA
app.use(router)
// Make PrimeVue available throughout the project
app.use(PrimeVue)
// Install Axios for RESTful Webservice calls
app.use(VueAxios, axios)
// Add primefaces components
app.component('Menubar', Menubar)
app.component('InputText', InputText)
app.component('Button', Button)

app.mount('#app')
