import Vue from 'vue';
import vuetify from './plugins/vuetify';
import Dev from './serve.vue';

Vue.config.productionTip = false;

new Vue({
  vuetify,
  render: (h) => h(Dev),
}).$mount('#app');
