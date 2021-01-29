<template>
  <vnatk-crud :options="crudoptions">
    <template v-slot:item.City.name="{ item }">
      <div v-if="item.City">
        City: {{ item.City.name }}<br />
        City Status : {{ item.City.status }}
      </div>
    </template>
  </vnatk-crud>
</template>

<script>
import { VnatkCrud } from "@/entry";
import customer from "./services/customer";

export default {
  name: "ServeDev",
  components: {
    VnatkCrud,
  },
  data() {
    return {
      crudoptions: {
        service: customer,
        model: "User",
        // response: {idfield:'no', data:[{no:1,name:'x',age:20},{no:2,name:'y',age:20}],headers:[{text:'ID',value:'no',hide:true},{text,value},{}],actions:[{name,cation,type,formschema},{},{}]} // Provide data to skip service calling and managing Array dased data crud
        title: "Users",
        basepath: "/vnatk",
        create: {
          uititle: "Add New User",
          modeloptions: {
            attributes: ["name", "email", "status", "city_id", "password"],
          },
        },
        retrive: {
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
                required: false,
              },
              {
                model: "State",
                attributes: ["name", "status", "gst_code"],
                required: false,
              },
            ],
          },
          modelscope: false, // String for scope name and Boolean for default(true) and unscoped(false)
          autoderef: true,
          headers: true,
          serversidepagination: true, // Skip to fetch all records and do pagination and sorting on client side
          datatableoptions: {
            multiSort: true,
            mustSort: false,
          },
        },
        update: {
          uititle: "Edit User - {name}",
          modeloptions: {
            attributes: [
              "name",
              "email",
              "status",
              "city_id",
              "state_id",
              "mobile",
            ],
          },
        },
        delete: true,
        actions: true,
        ui: {
          defaultActionPlacement: "DropDown",
        },
        override: {
          actions: [
            {
              name: "vnatk_edit", // edit action is given specially this name
              placeIn: "buttonGroup", // or "DropDown"
              // use this to merge formschema options
              formschemaoverrides: {
                mobile: {
                  label: "Mobile Number",
                },
                city_id: {
                  // titlefield - only used if field is reference/association type
                  // default titlefield is considered as name
                  titlefield: "City.name",
                  label: "Your City",
                  serviceoptions: {
                    service: customer,
                    basepath: "/vnatk",
                    model: "City",
                    modelattributes: ["id", "name"],
                    searchfield: ["name"],
                    limit: 10,
                  },
                },
                email: {
                  clearable: true,
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
          headers: {
            city_id: {
              hide: true,
            },
            state_id: {
              hide: true,
            },
            mobile: {
              text: "User Mobile",
              sortable: true,
              // value: "mobile",
              // moveto: 0,
            },
            City: {
              // Override DeReferanced Fields (received from server due to autoderef)
              text: "Primary City", //Overrided header caption/text
              value: "City.name", // Value does not have effect as alrady overrided column by slot in template above
              // moveto: 2,
            },
            "State.gst_code": {
              text: "State GST Code",
              value: "State.gst_code",
              sortable: true,
              moveto: 4,
            },
            vnatk_actions: {
              moveto: "last",
            },
          },
        },
      },
    };
  },

  methods: {
    clientFunctionCallBack(item) {
      console.log("CLIENT FUNCTION CALLED with item", item);
    },
  },
};
</script>