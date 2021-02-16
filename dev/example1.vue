<template>
  <div class="home">
    <vnatk-crud :options="crudoptions">
      <template v-slot:[`item.identifier`]="{ item }">
        {{ item.identifier }}<br />
        <small class="text--disabled"
          >({{ item.ParentCategory.identifier }})</small
        >
      </template>
      <template v-slot:[`item.thumbnailImageAbsolutePath`]="{ item }">
        <img :src="item.thumbnailImageAbsolutePath" />
      </template>
    </vnatk-crud>
  </div>
</template>

<script>
// @ is an alias to /src
import { VnatkCrud } from "@/entry";
import catalog from "./services/catalog";

import Vue from "vue";
import VuePapaParse from "vue-papa-parse";
Vue.use(VuePapaParse);

export default {
  name: "Home",
  components: { VnatkCrud },
  data() {
    return {
      crudoptions: {
        service: catalog,
        basepath: "/admin/vnatk",
        model: "Category",
        update: {
          modeloptions: {
            attributes: ["identifier", "isShareable"],
          },
        },
        read: {
          modeloptions: {
            include: [
              {
                model: "CatalogEmployee",
                as: "CreatedBy",
                required: false,
              },
              {
                model: "CatalogEmployee",
                as: "UpdatedBy",
                required: false,
              },
              {
                model: "CatalogEmployee",
                as: "DeletedBy",
                required: false,
              },
            ],
            // attributes: [
            //   "id",
            //   "parentId",
            // ],
          },
          serversidepagination: true,
          modelscope: false,
        },
        import: {
          service: catalog,
          basepath: "/admin/vnatk",
          model: "Category",
          execute: "vnatk_import",
          success: this.reloadPage,
          autoimport: true,
          rowformatter: function (item) {
            return item;
          },
        },
        override: {
          actions: [],
        },
        ui: {
          headers: [
            {
              text: "Identifier",
              value: "identifier",
            },
            {
              text: "Attribute Group",
              value: "AttributeGroup.name",
            },
            {
              text: "Status",
              value: "status",
            },
            {
              text: "EDIT/REMOVE",
              value: "vnatk_actions",
            },
          ],
        },
      },
    };
  },
  methods: {
    clientFunctionCallBack(formData) {
      console.log(formData);
    },
    reloadPage(response) {
      alert("Import successful");
      // window.location.reload();
    },
  },
};
</script>
