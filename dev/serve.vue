<template>
  <v-app>
    <h1>Example Import</h1>
    <exampleimport />
    <!-- <h1>Example 1</h1>
    <example1 /> -->
    <!-- <h1>Example 2</h1>
    <example2 /> -->
    <!-- <model-designer-example /> -->
    <!-- <h1>Example Full</h1>
    <example-full /> -->
  </v-app>
</template>

<script>
import Vue from "vue";
import Exampleimport from "./exampleimport.vue";
// import Example2 from "./example2.vue";
// import ExampleFull from "./example-full.vue";
// import modelDesignerExample from "./modelDeginerExample.vue";

export default Vue.extend({
  name: "ServeDev",
  components: {
    Exampleimport,
    // Example2,
    // ExampleFull,
    // modelDesignerExample,
  },
});
</script>