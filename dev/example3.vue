<template>
  <vnatk-crud :options="crudoptions"> </vnatk-crud>
</template>

<script>
import { VnatkCrud } from "@/entry";
import customer from "./services/catalog";

export default {
  name: "Example3",
  components: {
    VnatkCrud,
  },
  data() {
    return {
      crudoptions: {
        service: customer,
        model: "User",
        basepath: "admin/vnatk",
        create: {
          modeloptions: {
            attributes: ["firstName", "lastName", "email"],
          },
          defaultvalues: {
            userType: "employee",
            mobile: function (item) {
              console.log("callback function");
              console.log(item);
              return item.firstName.length;
            },
          },
        },
        read: {
          modeloptions: {
            attributes: [
              "firstName",
              "lastName",
              "email",
              "userType",
              "mobile",
            ],
          },
          modelscope: "employees",
          serversidepagination: true,
        },
        update: {
          modeloptions: {
            attributes: ["firstName", "lastName", "email"],
          },
        },
        delete: true,
        //   title: "Users",
        //   tableoptions: {
        //     modeloptions: {
        //       attributes: ["name", "email", "state_id", "city_id", "status"],
        //     },
        //     headersoverrides: {
        //       status: {
        //         hide: true,
        //       },
        //     },
        //   },
      },
    };
  },
};
</script>