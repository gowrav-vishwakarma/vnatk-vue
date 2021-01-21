<template>
  <v-app>
    <h1>Example 1</h1>
    <example1 />
    <h1>Example 2</h1>
    <example2 />
  </v-app>
</template>

<script>
import Vue from "vue";
import Example1 from "./example1.vue";
import Example2 from "./example2.vue";

export default Vue.extend({
  name: "ServeDev",
  components: {
    Example1,
    Example2,
  },
});
</script>