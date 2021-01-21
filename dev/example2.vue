<template>
  <vnatk-crud :options="crudoptions"> </vnatk-crud>
</template>

<script>
import { VnatkCrud } from "@/entry";
import customer from "./services/customer";

export default {
  name: "Example2",
  components: {
    VnatkCrud,
  },
  data() {
    return {
      crudoptions: {
        service: customer,
        model: "User",
        title: "Users",
        tableoptions: {
          modeloptions: {
            attributes: ["name", "email", "state_id", "city_id", "status"],
          },
          headersoverrides: {
            status: {
              hide: true,
            },
          },
        },
      },
    };
  },
};
</script>