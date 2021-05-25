import Vue from 'vue';
import vuetify from './plugins/vuetify';
import Dev from './serve.vue';

Vue.config.productionTip = false;

Vue.component('vFileUploader', () => import('./FileUploader.vue'))

new Vue({
  vuetify,
  render: (h) => h(Dev),
}).$mount('#app');
