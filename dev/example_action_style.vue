<template>
  <vnatk-crud :options="crudoptions"> </vnatk-crud>
</template>

<script>
import { VnatkCrud } from "@/entry";
import Partner from "./services/partner";

export default {
  name: "Example2",
  components: {
    VnatkCrud,
  },
  data() {
    return {
      crudoptions: {
        basepath: "admin/vnatk",
        service: Partner,
        model: "Partner",
        title: "Users",
        read: {
          modeloptions: {
            attributes: ["firstName", "lastName", "mobile", "status"],
          },
          // headersoverrides: {
          //   status: {
          //     hide: true,
          //   },
          // },
        },
        override: {
          actions: [
            {
              name: "activate",
              placeIn: "buttonGroup", // or "DropDown"
              // icon: "mdi-format-align-left",
              caption: "Activate User",
              type: "NoRecord",
              isClientAction: true,
              attributes: {
                color: "success",
                dark: false,
                style: {
                  border: "1px solid red",
                  color: "red",
                },
              },
              // formschema:{} // use this to override complete formschema
              // formschemaoverrides:{} // use this to merge formschema options
            },
          ],
        },
      },
    };
  },
};
</script>
