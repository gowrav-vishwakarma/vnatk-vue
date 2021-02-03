<template>
  <v-data-table
    :headers="headers.filter((h) => !h.hide)"
    :items="data"
    :loading="loading"
    :options.sync="optionssynced"
    :server-items-length="totalRecordsCount"
    class="elevation-1"
    v-bind="$attrs"
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
        <v-toolbar-title>{{ options.title }}</v-toolbar-title>
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
                <v-form ref="currentActionUIForm" lazy-validation>
                  <v-form-base
                    :model="currentActionUI.item"
                    :schema="currentActionUI.action.formschema"
                    :col="6"
                  />
                </v-form>
                <v-alert
                  border="top"
                  color="red lighten-2"
                  dark
                  v-for="(err, i) in currentActionUI.errors"
                  :key="i"
                >
                  {{ err }}
                </v-alert>
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
      <v-menu bottom left v-if="dropDownActions.length">
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
import VNATKCrud from "../lib-mixins/VNATKCrud";

export default {
  name: "VnatkCrud",
  extends: "vDataTable",
  mixins: [VNATKCrud],
  components: {
    VFormBase,
  },
  props: {
    options: [Object],
  },
  data() {
    return {
      loading: true,
      crudcontext: {}, // Mandatory options for backend to be send every communication
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
        errors: [],
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
        if (this.options.retrive.serversidepagination === true) this.crudInit();
      },
      deep: true,
    },
    options: {
      handler() {
        this.crudInit();
      },
    },
  },

  methods: {
    async crudInit(initialCall = false) {
      if (initialCall) {
        if (!this.checkOptionsAndSetDefaults()) return;

        // Override v-data-table option synced with user defined values for data-table
        this.optionssynced = _.merge(
          this.optionssynced,
          this.options.retrive.datatableoptions
        );

        // set always sending options with all API calls as options, we say this crudcontext
        // leave ui and override values as these are only useful for frontend
        this.crudcontext = _.omit(JSON.parse(JSON.stringify(this.options)), [
          "ui",
          "override",
        ]);
      }

      this.setLimitAndSort();

      var response = { data: {} };

      if (this.options.response == undefined) {
        // call initialization from server
        response = await this.options.service
          .post(this.options.basepath + "/crud", this.crudcontext)
          .catch((error) => {
            if (!error.response) {
              throw error;
            }
            if (
              error.response.status == 500 &&
              _.has(error.response.data, "name")
            ) {
              if (_.isEmpty(this.currentActionUI.action)) {
                this.errors.push(
                  error.response.data.original.code +
                    " : " +
                    error.response.data.original.sqlMessage
                );
              } else {
                this.currentActionUI.errors.push(
                  error.response.data.original.code +
                    " : " +
                    error.response.data.original.sqlMessage
                );
              }
            } else {
              this.currentActionUI.errors.push(
                JSON.stringify(error.response.data)
              );
            }
          });
      } else {
        response.data = this.options.response;
      }

      if (response.data.headers) {
        this.headers = this.handleHeaderOverrides(
          this.options.ui && this.options.ui.headers
            ? this.options.ui.headers
            : response.data.headers,
          this.options.override && this.options.override.headers
            ? this.options.override.headers
            : []
        );
      }

      //   handle data
      if (this.options.data !== false) {
        this.data = this.options.data
          ? this.options.data
          : response.data.data
          ? response.data.data
          : [];
        if (this.options.retrive && this.options.retrive.serversidepagination)
          this.totalRecordsCount = response.data.datacount;
      }

      // handle actions
      if (response.data.actions) {
        this.resetActions();
        this.actions = this.handleActionsOverridesAndValidations(
          response.data.actions,
          this.options.override && this.options.override.actions
            ? this.options.override.actions
            : []
        );
        this.filterActions();
      }
    },

    executeAction(action, item, submit = false) {
      var metaData = this.crudcontext;
      metaData["action_to_execute"] = action;
      //   Create Form if Action has formschema and not submitting
      if (action.formschema) {
        // remove all error messages to get fresh errors if still persists

        action.formschema = JSON.parse(
          JSON.stringify(action.formschema, (k, v) =>
            k === "error-messages" ? undefined : v
          )
        );

        if (!submit) {
          this.currentActionUI.action = action; //JSON.parse(JSON.stringify(action));

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
            // remove primary and system fields if not defined explicitly in modeloptions->attributes
            if (
              (this.currentActionUI.action.formschema[fld].primaryKey ||
                this.currentActionUI.action.formschema[fld].isSystem) &&
              _.get(
                this.options.retrive.modeloptions,
                "attributes",
                []
              ).includes(fld) == false
            ) {
              delete this.currentActionUI.action.formschema[fld];
              continue;
            }

            // load default values for non-loaded fields in case of not editing
            if (
              (!editing_record || action.name === "vnatk_delete") &&
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
                  var fieldtext = _.has(item, action.formschema[fld])
                    ? _.get(item, action.formschema[fld].titlefield)
                    : false;
                  fieldtext =
                    fieldtext ||
                    (_.has(
                      item[action.formschema[fld].association.name.singular],
                      "name"
                    )
                      ? item[action.formschema[fld].association.name.singular]
                          .name
                      : false);
                  fieldtext = fieldtext || "" + item[fld];
                  this.$set(
                    this.currentActionUI.action.formschema[fld],
                    "items",
                    [
                      {
                        text: fieldtext,
                        value: item[fld],
                      },
                    ]
                  );
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
        } else {
          // Form is being submitted
          var primaryKey = this.options.headers.find(
            (o) => o.primaryKey == true
          )["text"];
          metaData["arg_item"] = metaData["formdata"] = _.pick(
            this.currentActionUI.item,
            [..._.keys(this.currentActionUI.action.formschema), ...[primaryKey]]
          );
        }
      }

      if (action.isClientAction) {
        return action.execute(item);
      }
      return this.options.service
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
          return true;
        })
        .catch((error) => {
          if (error.response.status == 422) {
            for (let i = 0; i < error.response.data.errors.length; i++) {
              const err = error.response.data.errors[i];
              if (_.has(this.currentActionUI.action.formschema, err.path)) {
                this.$set(
                  this.currentActionUI.action.formschema[err.path],
                  "error-messages",
                  err.message
                );
              } else {
                // NO FIELD FOUND, JUST PUSH ERROR IN COMMOON ERROR AREA
                this.currentActionUI.errors.push(JSON.stringify(error));
              }
            }
          }

          // IF ITS A WELL DEFINED ERROR FORMAT FROM SEQUELIZE
          if (
            (error.response.status == 500 || error.response.status == 512) &&
            _.has(error.response.data, "name")
          ) {
            if (_.isEmpty(this.currentActionUI.action)) {
              this.errors.push(
                error.response.data.original.code +
                  " : " +
                  error.response.data.original.sqlMessage
              );
            } else {
              this.currentActionUI.errors.push(
                JSON.stringify(error.response.data)
              );
            }
          } else {
            this.currentActionUI.errors.push(error.response.data);
          }
          return false;
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
      var crudcontext = this.getAutoCompleteServiceOptions(
        schema,
        newValue,
        this.crudcontext
      );

      // call service
      this.options.service
        .post(crudcontext.basepath + "/crud", crudcontext)
        .then((response) => {
          schema.items = response.data.data.map(function (o) {
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
        errors: [],
      };
    },

    async actionUIExecute(action, item) {
      var response = await this.executeAction(action, item, true);
      if (response) {
        this.actionUIClose(action, item);
      }
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

      var defaultActionPlacement = this.options.ui.defaultActionPlacement
        ? this.options.ui.defaultActionPlacement
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