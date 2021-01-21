<template>
  <v-app>
    <h1>Example 1</h1>
    <example1 />
    <h1>Example 2</h1>
    <example2 />
    <h1>Extended</h1>
    <extended />
  </v-app>
</template>

<script>
import Vue from "vue";
import Example1 from "./example1.vue";
import Example2 from "./example2.vue";
import Extended from "./extended-exanmple";

export default Vue.extend({
  name: "ServeDev",
  components: {
    Example1,
    Example2,
    Extended,
  },
});
</script>