<template>
  <vnatk-crud :options="crudoptions">
    <template v-slot:item.itemX="{ item }"> Newss: {{ item.name }} </template>
  </vnatk-crud>
</template>

<script>
import { VnatkCrud } from "@/entry";
import customer from "./services/customer";

export default {
  name: "SampleCRUD",
  components: {
    VnatkCrud,
  },
  data() {
    return {
      crudoptions: {
        service: customer,
        basepath: "/admin/vnatk",
        model: "Banner",
        create: {
          modeloptions: {
            attributes: ["name", "heading", "status", "isShareable"],
          },
        },
        retrive: {
          modeloptions: {
            // attributes: ["name", "heading", "status", "isShareable"],
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
              {
                model: "Lang",
                attributes: ["name"],
                required: false,
              },
            ],
          },
        },
        update: {
          modeloptions: {
            attributes: ["name", "heading", "status", "isShareable"],
          },
        },
        defaultActionPlacement: "buttonGroup",
        override: {
          headers: {
            itemX: {
              text: "NEW...",
              value: "itemX",
              moveTo: -1,
            },
          },
          //   actions: [
          //     {
          //       name: "vnatk_edit",
          //       formschemaoverrides: {
          //         isShareable: {
          //           lable: "Can you Share?",
          //           "false-value": "false",
          //           hint: "On whatsapp",
          //         },
          //       },
          //     },
          //   ],
        },
      },
    };
  },
};
</script>