<template>
  <vnatk-crud :options="crudoptions"> </vnatk-crud>
</template>

<script>
import { VnatkCrud } from "@/entry";
import customer from "./services/catalog";

import Vue from "vue";
import VuePapaParse from "vue-papa-parse";
Vue.use(VuePapaParse);

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
        quicksearch: ["firstName", "lastName", "email"],
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
        import: {
          autoimport: true,
          rowformatter: function (item) {
            item.mobile = parseInt(Math.random() * 1000);
            item.userType = "employee";
            return item;
          },
        },
      },
    };
  },
};
</script>