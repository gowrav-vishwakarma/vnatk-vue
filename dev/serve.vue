<template>
  <v-app>
    <simple-example />
  </v-app>
</template>

<script>
import Vue from "vue";
import SimpleExample from "./simple-example.vue";

export default Vue.extend({
  name: "ServeDev",
  components: {
    SimpleExample,
  },
});
</script>