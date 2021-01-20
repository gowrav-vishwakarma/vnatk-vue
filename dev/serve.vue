<template>
  <v-app>
    <vnatk-crud :options="crudoptions2"> </vnatk-crud>
    <vnatk-crud :options="crudoptions">
      <template v-slot:item.email="{ item }">
        {{ "HELLOO" + " " + item.name }}<br />
        {{ item.email }}
      </template>
      <template v-slot:item.City.name="{ item }">
        <div v-if="item.City">
          {{ "HELLOO" + " " + item.City.name }}<br />
          {{ item.City.status }}
        </div>
      </template>
      <template v-slot:item.State.name="{ item }">
        <div v-if="item.State">
          {{ item.State.name }} <br />
          {{ item.State.status }}
        </div>
        <div v-else>NO STATE SELECTED</div>
      </template>
    </vnatk-crud>
  </v-app>
</template>

<script>
import Vue from "vue";
import { VnatkCrud } from "@/entry";
import customer from "./services/customer";

export default Vue.extend({
  name: "ServeDev",
  components: {
    VnatkCrud,
  },
  data() {
    return {
      crudoptions: {
        // NEW OPTIONS
        service: customer,
        basepath: "/crud", // vnatk service base path, default "/crud"
        model: "User",

        tableoptions: {
          title: "Users Management",
          modeloptions: {
            attributes: [
              "name",
              "email",
              "status",
              "state_id",
              "city_id",
              "mobile",
            ],
            // include: ["City", "State"],  // to get all attributes with including
            include: [
              {
                model: "City",
                attributes: ["name", "status"],
              },
              {
                model: "State",
                attributes: ["name", "status"],
              },
            ],
            // order: [[{ model: "City" }, "name", "ASC"]],
            // limit: 2,
          },
          headers: true,
          headersoverrides: {
            city_id: {
              hide: true,
            },
            state_id: {
              hide: true,
            },
            mobile: {
              text: "User Mobile",
              sortable: true,

              // moveto: 0,
            },
            city: {
              text: "City",
              value: "City.name",
              // moveto: 2,
            },
            state: {
              text: "State",
              value: "State.name",
              sortable: true,
              // moveto: 2,
            },
            vnatk_actions: {
              moveto: "last", // move to last or can use -1 , -2 for position from right
            },
          },
          serversidepagination: true, // Skip to fetch all records and do pagination and sorting on client side
          datatableoptions: {
            groupBY: [["status", "name"]],
            groupDesc: [],
            itemsPerPage: 5,
            multiSort: true,
            mustSort: false,
            // page: 1,
            sortBy: [],
            sortDesc: [],
          },
        },

        allowadd: true,
        addoptions: {
          title: "Add New User",
          modeloptions: {
            attributes: ["name", "email", "status", "city_id", "password"],
            include: {
              model: "City",
            },
          },
        },

        allowedit: true,
        editoptions: {
          title: "Edit User - {name}",
          modeloptions: {
            attributes: ["name", "email", "status", "city_id", "state_id"],
            include: {
              model: "City",
            },
          },
        },

        allowdelete: true,
        fieldsmeta: true,
        allowactions: true,
        actionsoverrides: [
          {
            name: "vnatk_edit", // edit action is given specially this name
            placeIn: "buttonGroup", // or "DropDown"
            // use this to merge formschema options
            formschemaoverrides: {
              city_id: {
                // titlefield - only used if field is reference/association type
                // default titlefield is considered as name
                titlefield: "City.name",
                label: "Your City",
                serviceoptions: {
                  service: customer,
                  basepath: "/crud",
                  model: "City",
                  modelattributes: ["id", "name"],
                  searchfield: ["name"],
                  limit: 10,
                },
              },
              // state_id: {
              //   titlefield: "State.name",
              // no state_id related info is overrided, still working good, in this case: using same service to get details if id,name is required with default limit
              // },
            },
          },
          {
            name: "vnatk_add", // add action is given specially this name
            // use this to merge formschema options
            formschemaoverrides: {
              city_id: {
                label: "Your City ... ",
              },
            },
          },
          {
            name: "activate",
            placeIn: "buttonGroup", // or "DropDown"
            icon: "mdi-format-align-left",
            caption: "Activate User",
            // formschema:{} // use this to override complete formschema
            // formschemaoverrides:{} // use this to merge formschema options
          },
          {
            name: "deactivate",
            placeIn: "buttonGroup",
            caption: "Deactivate",
            // icon: "mdi-format-align-left",
          },
          {
            name: "clientFunction",
            type: "NoRecord",
            execute: this.clientFunctionCallBack,
            isClientAction: true,
          },
        ],
        defaultActionPlacement: "DropDown",
      },
      crudoptions2: {
        service: customer,
        model: "City",
        autoderef: true, //default true, set false to avoid solving de-ref fields automatically, ie for city_id populate City.name field also
        // tableoptions: {
        //   modeloptions: {
        //     include: ["State"],
        //   },
        //   headersoverrides: {
        //     state_id: {
        //       hide: true,
        //     },
        //     state: {
        //       text: "Sates",
        //       value: "State.name",
        //       moveto: -1,
        //     },
        //   },
        // },
      },
    };
  },

  methods: {
    clientFunctionCallBack(item) {
      console.log("CLIENT FUNCTION CALLED with item", item);
    },
  },
});
</script>