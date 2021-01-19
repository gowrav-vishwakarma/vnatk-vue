import Vue from 'vue';
// import Vuetify from 'vuetify/lib/framework';
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/dist/vuetify.min.css'
import Vuetify from "vuetify";
// import { Ripple, Intersect, Touch, Resize } from "vuetify/lib/directives";

Vue.use(Vuetify, {
    iconfont: 'md',
});

export default new Vuetify({
});
