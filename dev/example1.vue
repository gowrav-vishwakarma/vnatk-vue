<template>
  <div class="home">
    <vnatk-crud :options="crudoptions">
      <template v-slot:item.identifier="{ item }">
        Name: {{ item.identifier }}<br />
        <div v-if="item.ParentCategory">
          ({{ item.ParentCategory.identifier }})
        </div>
      </template>
      <template v-slot:item.thumbnailImageAbsolutePath="{ item }">
        <img :src="item.thumbnailImageAbsolutePath" />
      </template>
    </vnatk-crud>
  </div>
</template>

<script>
// @ is an alias to /src
import { VnatkCrud } from "@/entry";
import catalog from "./services/customer";

export default {
  name: "Home",
  components: { VnatkCrud },
  data() {
    return {
      crudoptions: {
        service: catalog,
        basepath: "/admin/vnatk",
        model: "Category",
        retrive: {
          modeloptions: {
            include: [
              "ParentCategory",
              "AttributeGroup",
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
  },
};
</script>
