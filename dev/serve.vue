<template>
  <v-app>
    <h1>Test</h1>
    <example-export />
    <!-- <h1>Example Import</h1> -->
    <!-- <exampleimport /> -->
    <!-- <h1>Example 1</h1>
    <example1 /> -->
    <!-- <h1>Example 2</h1>
    <example2 /> -->
    <!-- <h1>Example 3</h1>
    <example3 /> -->
    <!-- <model-designer-example /> -->
    <!-- <h1>Example Full</h1>
    <example-full /> -->
  </v-app>
</template>

<script>
import Vue from "vue";
// import Exampleimport from "./exampleimport.vue";
// import Test from "./test.vue";
import ExampleExport from "./example-export.vue";
// import Example1 from "./example1.vue";
// import Example2 from "./example2.vue";
// import Example3 from "./example3.vue";
// import ExampleFull from "./example-full.vue";
// import modelDesignerExample from "./modelDeginerExample.vue";

export default Vue.extend({
  name: "ServeDev",
  components: {
    // Exampleimport,
    "example-export": ExampleExport,
    // Test,
    // Example1,
    // Example2,
    // Example3,
    // ExampleFull,
    // modelDesignerExample,
  },
});
</script>