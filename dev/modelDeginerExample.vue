<template>
  <model-designer :service="serviceInfo"> </model-designer>
</template>

<script>
import { ModelDesigner } from "@/entry";
import customer from "./services/catalog";

export default {
  name: "ModelDesginierExample",
  components: {
    ModelDesigner,
  },
  data() {
    return {
      serviceInfo: {
        service: customer,
        basepath: "/vnatk",
      },
    };
  },
};
</script>