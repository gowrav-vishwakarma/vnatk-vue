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
        quickSearch: ["field1", "field2", "field3"],
        // response: {idfield:'no', data:[{no:1,name:'x',age:20},{no:2,name:'y',age:20}],headers:[{text:'ID',value:'no',hide:true},{text,value},{}],actions:[{name,cation,type,formschema},{},{}]} // Provide data to skip service calling and managing Array dased data crud
        title: "Users",
        basepath: "/vnatk",
        create: {
          uititle: "Add New User",
          modeloptions: {
            attributes: ["name", "email", "status", "city_id", "password"],
          },
          defaultvalues: {
            // if no value is passed from Create Form, this will be merged in sending data, if Form data contains this value, that will be used instead.
            userType: "Employee",
          },
        },
        read: {
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
                scope: false, // or text (since we define Models as string, scope can be passed as property here)
              },
              {
                model: "State",
                attributes: ["name", "status", "gst_code"],
                required: false,
              },
              {
                // No relations and wrong models but just to write somewhere till we create proper documentation
                model: "Project",
                as: "ProjectsOwned",
                attributes: [{ fn: "count", col: "*", as: "ProjAdminCount" }],
              },
              {
                model: "Project",
                as: "Projects",
                attributes: [
                  {
                    fn: "count",
                    col: "*",
                    as: "ProjectPartOf",
                    through: { attributes: [] },
                  },
                ],
              },
            ],
            group: ["User.id"],
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
        import: {
          service: catalog,
          basepath: "/admin/vnatk",
          model: "User",
          execute: "vnatk_import", // or any other funtion you want to pass this data to in your model
          autoimport: true, // ignores execute options and just try to bulk create from given data by default vnatk action
          transaction: "file", // defaults to 'file' / or 'row'. In 'file' mode, data will rollback for all rows in case of error in any row, in 'row' mode, rows that are not imported are only rolled back and errored rows are reported back on import dialog.
          rowformatter: function (item) {
            item.$vnatk_data_handle = "alwaysCreate"; // 'alwaysCreate' [default], 'findOrCreate','findAndUpdateOrCreate', (For Associations, two more options) 'findToAssociate' [Produce error if not found],'associateIfFound' [Ignores if not found]
            item.$vnatk_find_options = {}; // if not provided, finding will be based on all fields and values defined above
            item.$vnatk_cache_records = true; // default to true, set false to find each time even if same condition is already found previously
            item.$vnatk_update_data = {}; // update only fields and their values defined here (if found), if this option is not provided, all fields defined above will be updated.

            item.City = {
              //Data to create or Update (if not defined vnatk_update_data)
              name: item.city_name,
              status: item.city_status,

              $vnatk_data_handle: "alwaysCreate", // 'alwaysCreate' [default], 'findOrCreate','findAndUpdateOrCreate',(For Associations, two more options) 'findToAssociate' [Produce error if not found],'associateIfFound' [Ignores if not found]
              $vnatk_find_options: {
                modeloptions: {},
                modescope: false,
              }, // if not provided, finding will be based on all fields and values defined above
              $vnatk_cache_records: true, // default to true, set false to find each time even if same condition is already found previously
              $vnatk_update_data: {}, // update only fields and their values defined here (if found), if this option is not provided, all fields defined above will be updated.
            };

            item.FavPlaces = [
              //hasMany relations: set as Array of Object, Each object defines one hasMany/many2many entry
              {
                //Data to create or Update (if not defined vnatk_update_data)
                name: item.fav_place_name_1,
                $vnatk_data_handle: "alwaysCreate", // 'alwaysCreate' [default],'findToAssociate' [Produce error if not found],'findOrCreate','findAndUpdateOrCreate','associateIfFound' [Ignores if not found]
                $vnatk_find_options: {},
                $vnatk_cache_records: true, // default to true, set false to find each time even if same condition is already found previously
                $vnatk_update_data: {},
                $set_fresh_relations: false, // default to false, if set true all data with this relation will be removed first
              },
              {
                //Data to create or Update (if not defined vnatk_update_data)
                name: item.fav_place_name_2,
                $vnatk_data_handle: "alwaysCreate", // 'alwaysCreate' [default],'findToAssociate' [Produce error if not found],'findOrCreate','findAndUpdateOrCreate','associateIfFound' [Ignores if not found]
                $vnatk_find_options: {},
                $vnatk_cache_records: true, // default to true, set false to find each time even if same condition is already found previously
                $vnatk_update_data: {},
              },
              {
                //Data to create or Update (if not defined vnatk_update_data)
                name: item.fav_place_name_3,
                $vnatk_data_handle: "alwaysCreate", // 'alwaysCreate' [default],'findToAssociate' [Produce error if not found],'findOrCreate','findAndUpdateOrCreate','associateIfFound' [Ignores if not found]
                $vnatk_find_options: {},
                $vnatk_cache_records: true, // default to true, set false to find each time even if same condition is already found previously
                $vnatk_update_data: {},
              },
            ];

            delete item.city_name;
            delete item.city_status;

            return i;
          },
          success: this.reloadPage,
        },
        delete: true,
        actions: true,
        ui: {
          defaultActionPlacement: "DropDown",
          // Skip headeres received from server and use these as base to mix with override later
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
              // Don't forget to add actions column manually in case of heaers defined in ui and
              // actions: true (default)
              text: "Actions",
              value: "vnatk_actions",
            },
          ],
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
                  titlefield: "City.name", // autocomplete text field from recived data
                  label: "Your City",
                  serviceoptions: {
                    service: customer,
                    basepath: "/vnatk",
                    model: "City",
                    modelattributes: ["id", "name"],
                    searchfield: "name", // autocomplete search q for like in the field
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

    reloadPage(response) {
      console.log(response);
      // this.$router.push('.');
      window.location.reload();
    },
  },
};
</script>