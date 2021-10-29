<template>
  <vnatk-crud :options="crudoptions"> </vnatk-crud>
</template>

<script>
import { VnatkCrud } from "@/entry";
import catalog from "./services/catalog";

export default {
  name: "Example AutoComplete Custom Where Condition",
  components: {
    VnatkCrud,
  },
  data() {
    return {
      crudoptions: {
        service: catalog,
        model: "DataSetProduct",
        title: "Category",
        read: {
          modeloptions: {
            // attributes: ["name"],
            // where: {
            //   $or: {
            //     ticketNo: {
            //       $like: "%" + newValue + "%",
            //     },
            //     via: {
            //       $like: "%" + newValue + "%",
            //     },
            //   },
            // },
            limit: 10,
          },
        },
        override: {
          actions: [
            {
              name: "vnatk_edit",
              formschemaoverrides: {
                data_set_id: {
                  type: "autocomplete",
                  label: "DataSet Id",
                  searchInput: "",
                  association: {
                    name: {
                      singular: "name",
                    },
                  },
                  serviceoptions: {
                    service: catalog,
                    basepath: "/admin/vnatk",
                    model: "DataSet",
                    modelattributes: ["id", "name", "status"],
                    searchfield: ["name"], // autocomplete search q for like in the field
                    limit: 10,
                    modelscope: false,
                    where: function (query, formFields, schema) {
                      return {
                        name: {
                          $like: "%" + query + "%",
                        },
                        status: "Active",
                      };
                    },
                    titlefield: function (o) {
                      return o.name;
                    },
                  },
                },
              },
            },
          ],
        },
      },
    };
  },
};
</script>