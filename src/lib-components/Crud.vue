<template>
  <v-data-table
    :headers="headers"
    :items="data"
    :loading="loading"
    :options.sync="optionssynced"
    :server-items-length="totalRecordsCount"
    class="elevation-1"
  >
    <template v-slot:top>
      <v-alert
        border="top"
        color="red lighten-2"
        dark
        v-for="(err, i) in errors"
        :key="i"
      >
        {{ err }}
      </v-alert>
      <v-toolbar flat>
        <v-toolbar-title>{{ options.dataheading }}</v-toolbar-title>
        <v-divider class="mx-4" inset vertical></v-divider>
        <v-spacer></v-spacer>
        <span v-for="(action, index) in actionUIs.norecord" :key="index">
          <v-btn
            color="primary"
            dark
            class="mb-2"
            @click="executeAction(action)"
          >
            {{ action.caption ? action.caption : action.name }}
          </v-btn>
        </span>
        <v-dialog
          v-model="currentActionUI.open"
          style="max-width: 80%"
          :persistent="true"
        >
          <v-card>
            <v-card-title>
              <span class="headline">{{
                options.model +
                " " +
                (currentActionUI.action.caption
                  ? currentActionUI.action.caption
                  : currentActionUI.action.name)
              }}</span>
            </v-card-title>

            <v-card-text>
              <v-container>
                <v-form>
                  <v-form-base
                    :model="currentActionUI.item"
                    :schema="currentActionUI.action.formschema"
                    :col="6"
                  />
                </v-form>
              </v-container>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="blue darken-1" text @click="actionUIClose">
                Cancel
              </v-btn>
              <v-btn
                color="blue darken-1"
                text
                @click="
                  actionUIExecute(currentActionUI.action, currentActionUI.item)
                "
              >
                Save
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-toolbar>
    </template>
    <template v-slot:item.vnatk_actions="{ item }">
      <span
        v-for="(action, index) in buttonGroupActions"
        :key="index"
        class="flex flex-row"
      >
        <v-btn
          v-if="actionApplicable(action, item)"
          x-small
          @click="executeAction(action, item)"
        >
          <v-icon x-small>{{ action.icon ? action.icon : "mdi-cog" }}</v-icon>
          {{ action.caption ? action.caption : action.name }}
        </v-btn>
      </span>
      <v-menu bottom left>
        <template v-slot:activator="{ on, attrs }">
          <v-btn icon v-bind="attrs" v-on="on">
            <v-icon>mdi-dots-vertical</v-icon>
          </v-btn>
        </template>

        <v-list>
          <v-list-item v-for="(action, i) in dropDownActions" :key="i">
            <v-list-item-title
              @click="executeAction(action, item)"
              v-if="actionApplicable(action, item)"
            >
              {{ action.caption ? action.caption : action.name }}
            </v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </template>
    <template v-for="(_, slot) of $scopedSlots" v-slot:[slot]="scope"
      ><slot :name="slot" v-bind="scope"
    /></template>
  </v-data-table>
</template>

<script>
import _ from "lodash";
import VFormBase from "vuetify-form-base";
import VNATKHelpers from "../lib-mixins/vnatkhelpers";

export default {
  name: "VnatkCrud",
  extends: "vDataTable",
  mixins: [VNATKHelpers],
  components: {
    VFormBase,
  },
  props: {
    options: [Object],
  },
  data() {
    return {
      loading: true,
      serveroptions: {}, // Mandatory options for backend to be send every communication
      errors: [],
      headers: [],
      data: [],
      optionssynced: {},
      totalRecordsCount: -1, // -1 for client side pagination and record count for server side SORT AND paginations
      actions: [],
      buttonGroupActions: [], //single record actions
      dropDownActions: [], //single record actions
      noRecordActions: [], // no record actions
      multiRecordActions: [], // multirecord actions
      actionUIs: {
        norecord: [],
        multirecords: [],
        single: [],
      },

      currentActionUI: {
        open: false,
        action: {},
        item: {},
        autocompletesUnWacthers: [],
      },
    };
  },

  mounted() {
    this.crudInit(true);
    this.loading = false;
  },

  watch: {
    optionssynced: {
      handler(newVal, oldVal) {
        if (!oldVal.page) return; // its just initial update, skip this to handle
        if (this.options.tableoptions.serversidepagination === true)
          this.crudInit();
      },
      deep: true,
    },
  },

  methods: {
    crudInit(initialCall = false) {
      if (initialCall) {
        this.optionssynced = this.overrideOptionSynced();
      }
      // check for mandatory options and fill missing default values in options in case user didn't provided
      var err = this.checkOptions(this.options);
      if (err !== true) {
        this.errors = err;
        return;
      }

      // filter options that are needed for client side only

      this.serveroptions = this.filterOptionsForServer();

      // call initialization from server
      this.options.service
        .post(this.options.basepath + "/init", this.serveroptions)
        .then((response) => {
          // Handle headers
          if (response.data.headers) {
            this.headers = this.handleHeaderOverrides(
              response.data.headers,
              this.options.tableoptions.headersoverrides
            );
          }

          //   handle data
          if (this.options.data !== false) {
            this.data = response.data.data ? response.data.data : [];
            if (this.options.tableoptions.serversidepagination)
              this.totalRecordsCount = response.data.datacount;
          }

          // handle actions
          if (response.data.actions) {
            this.resetActions();
            this.actions = this.handleActionsOverrides(
              response.data.actions,
              this.options.actionsoverrides
            );
            this.filterActions();
          }
        });
    },
    executeAction(action, item, submit = false) {
      var metaData = this.serveroptions;
      metaData["action_to_execute"] = action;
      metaData["arg_item"] = item;

      //   Create Form if Action has formschema and not submitting
      if (action.formschema && !submit) {
        this.currentActionUI.action = action;
        this.currentActionUI.item = {};

        var editing_record = false;
        // For Row based actions set current item to work on
        if (action.type == "single".toLowerCase()) {
          this.currentActionUI.item = Object.assign({}, item);
          editing_record = true;
        }

        // lets loop through all fields in formschemas
        var formschema_fields = _.keys(action.formschema);
        for (let i = 0; i < formschema_fields.length; i++) {
          const fld = formschema_fields[i];
          // load default values for non-loaded fields in case of not editing
          if (
            !editing_record &&
            action.formschema[fld].defaultValue &&
            this.currentActionUI.item[fld] == undefined
          ) {
            this.currentActionUI.item[fld] =
              action.formschema[fld].defaultValue;
          }

          // setup prefiled values for autocomplete value:text in case of editing
          if (action.formschema[fld].type == "autocomplete") {
            if (editing_record) {
              if (item[fld]) {
                action.formschema[fld].items = [
                  {
                    text: _.has(action.formschema[fld], "titlefield")
                      ? _.get(item, action.formschema[fld].titlefield)
                      : item[action.formschema[fld].association.name.singular] //Consider Model.name ie City.name as titlefiel by default
                          .name
                      ? item[action.formschema[fld].association.name.singular]
                          .name
                      : "" + item[fld],
                    value: item[fld],
                  },
                ];
              }
            }

            var unwatch = this.$watch(
              "currentActionUI.action.formschema." + fld + ".searchInput",
              this.handleAutoCompletes
            );
            this.currentActionUI.autocompletesUnWacthers.push(unwatch);
          }
        }
        this.currentActionUI.open = true;
        // Just keep yourself to show form .... do not go further... thats execute action code
        return;
      }

      if (action.isClientAction) {
        return action.execute(item);
      }

      this.options.service
        .post(this.options.basepath + "/executeaction", metaData)
        .then((response) => {
          const currentIndex = this.data.findIndex((p) => p.id === item.id);
          if (response.data.row_data)
            if (currentIndex > -1)
              this.data.splice(currentIndex, 1, response.data.row_data);
            else this.data.unshift(response.data.row_data);
          else {
            this.data.splice(currentIndex, 1);
          }
        });
    },

    handleAutoCompletes(newValue) {
      if (!newValue) return;
      // find field first, might be multiple autocompletes in one form
      var schema = this.findActionFormSchemabySearchInputValue(
        this.currentActionUI.action,
        newValue
      );
      // get its serviceoptionsoverrides
      var serviceoptions = this.getAutoCompleteServiceOptions(
        schema,
        newValue,
        this.serveroptions
      );

      // call service
      serviceoptions.service
        .post(serviceoptions.basepath + "/list", serviceoptions)
        .then((response) => {
          schema.items = response.data.map(function (o) {
            return Object.assign(
              {
                value: o.id,
                text: o.name,
              },
              _.omit(o, "id", "name")
            );
          });
        });

      // add data in fields items with proper fields as text and value
      //   serviceoptions = this.
    },

    actionUIClose(/*event, action, item*/) {
      for (
        let index = 0;
        index < this.currentActionUI.autocompletesUnWacthers.length;
        index++
      ) {
        const element = this.currentActionUI.autocompletesUnWacthers[index];
        element();
      }
      this.currentActionUI = {
        open: false,
        action: {},
        item: {},
        autocompletesUnWacthers: [],
      };
    },

    actionUIExecute(action, item) {
      this.executeAction(action, item, true);
      this.actionUIClose(action, item);
    },

    actionApplicable(action, item) {
      if (action.where == undefined) return true;
      var where_field = _.keys(action.where);
      for (let i = 0; i < where_field.length; i++) {
        const field = where_field[i];
        if (
          Array.isArray(action.where[field]) &&
          !action.where[field].includes(item[field])
        ) {
          return false;
        } else if (
          !Array.isArray(action.where[field]) &&
          action.where[field] != item[field]
        ) {
          return false;
        }
      }
      return true;
    },

    filterActions() {
      var finalActions = this.actions;

      var defaultActionPlacement = this.options.defaultActionPlacement
        ? this.options.defaultActionPlacement
        : "DropDown";

      for (let i = 0; i < finalActions.length; i++) {
        const element = finalActions[i];
        if (element.type == undefined) element.type = "single";
        if (
          element.type.toLowerCase() == "single" &&
          element.placeIn == undefined
        )
          element.placeIn = defaultActionPlacement;

        // Place action in proper action group
        switch (true) {
          case element.type.toLowerCase() == "single".toLowerCase() &&
            element.placeIn.toLowerCase() == "buttonGroup".toLowerCase():
            this.buttonGroupActions.push(element);
            break;

          case element.type.toLowerCase() == "single".toLowerCase() &&
            element.placeIn == "DropDown":
            this.dropDownActions.push(element);
            break;

          case element.type.toLowerCase() == "NoRecord".toLowerCase():
            this.noRecordActions.push(element);
            break;

          case element.type.toLowerCase() == "MultiRecords".toLowerCase():
            this.noRecordActions.push(element);
            break;
          default:
            this.dropDownActions.push(element);
            break;
        }

        // Any action that has formschema needs a ui in dialog to be setup
        if (
          element.formschema ||
          element.type.toLowerCase() == "NoRecord".toLowerCase()
        ) {
          this.actionUIs[element.type.toLowerCase()].push(element);
        }
      }
    },
  },
};
</script>