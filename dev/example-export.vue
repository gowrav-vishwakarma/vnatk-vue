<template>
  <div class="home">
    <vnatk-crud :options="crudoptions">
      <template v-slot:MenuTopRightAfter>
        <v-btn color="success">text</v-btn>
      </template>
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
        quickSearch: ["identifier"],
        update: {
          modeloptions: {
            attributes: ["identifier", "isShareable"],
          },
        },
        create: true,
        export: {
          ipp: 100,
          rowformatter: function (row) {
            if (row.CreatedBy) {
              row.CreatedBy = row.CreatedBy.firstName;
            }
            if (row.UpdateBy) {
              row.UpdateBy = row.UpdateBy.firstName;
            }
            if (row.AttributeGroup) {
              row.AttributeGroup = row.AttributeGroup.name;
            }
            return row;
          },
          /**
           * export data save to export file not in memory
           * optional default Value is true
           */
          useStreamSaver: true,
          /**
           * when api res is error or service is not reachable, it auto try request with delay...
           * optional default Value is: 15000 ms
           * */
          retryDelay: 15000,
          /**
           * max retry try count
           * when api respose is error or service is not reachable
           * optional default Value is: 5
           */
          maxRetryCount: 5,
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
            // where: {
            //   status: "Active",
            //   // $or: {},
            // },
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
        override: {},
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
