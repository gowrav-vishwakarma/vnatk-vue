<template>
  <v-data-table
    :headers="headers.filter((h) => !h.hide)"
    :items="data"
    :loading="loading"
    :options.sync="optionssynced"
    :server-items-length="totalRecordsCount"
    class="elevation-1"
    v-bind="$attrs"
    v-on="$listeners"
    :key="'vnatk_crud_' + `${crudkey}`"
    :show-select="selectionAdded"
    v-model="selectedIds"
    @page-count="pageCount = $event"
    :page.sync="currentPage"
    :footer-props="{
      'items-per-page-options':
        options.ui.datatableoptions &&
        options.ui.datatableoptions.paginator &&
        options.ui.datatableoptions.paginator.itemsPerPageOptions
          ? options.ui.datatableoptions.paginator.itemsPerPageOptions
          : [10, 25, 50, 100, 250, 500, 1000],
    }"
  >
    <template v-slot:top>
      <v-alert
        border="top"
        color="red lighten-2"
        dark
        v-for="(err, i) in errors"
        :key="i"
        dismissible
      >
        {{ err }}
      </v-alert>
      <v-toolbar flat>
        <v-toolbar-title>{{ options.title }}</v-toolbar-title>
        <v-divider class="mx-4" inset vertical></v-divider>
        <span>
          <slot name="MenuTopLeftBefore"></slot>
        </span>
        <span v-for="(action, index) in actionUIs.norecord" :key="index">
          <v-btn color="primary" dark @click="executeAction(action)">
            {{ action.caption ? action.caption : action.name }}
          </v-btn>
        </span>
        <span>
          <slot name="MenuTopLeftAfter"></slot>
        </span>
        <v-spacer></v-spacer>
        <span>
          <slot name="MenuTopRightBefore"></slot>
        </span>
        <span
          v-for="(action, index) in multiRecordActions"
          :key="(index + 1) * 1000"
        >
          <v-btn color="primary" dark @click="executeAction(action)">
            {{ action.caption ? action.caption : action.name }}
          </v-btn>
        </span>

        <span>
          <v-text-field
            v-if="showQuickSearch"
            v-model="quicksearchtext"
            label="Quick Search"
            class="ml-4 mr-4"
            clearable
            v-on:keyup.enter="quickSearchExecute"
            @click:clear="quickSearchExecute(true)"
          ></v-text-field>
        </span>
        <span>
          <vnatk-import
            :options="optionsprop.import"
            v-if="optionsprop.import"
            @before-import="throwBeforeImport"
            @after-import="throwAfterImport"
          >
          </vnatk-import>
        </span>
        <span>
          <vnatk-exporter
            v-bind="optionsprop.export"
            :crudoptions="optionsprop"
            v-if="optionsprop.export"
          >
          </vnatk-exporter>
        </span>
        <span>
          <slot name="MenuTopRightAfter"></slot>
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
                    @click="formEventClick"
                    @input="formEventInput"
                    @change="formEventChanged"
                  />
                </v-form>
                <v-alert
                  border="top"
                  color="red lighten-2"
                  dark
                  v-for="(err, i) in currentActionUI.errors"
                  :key="i"
                  dismissible
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
                :disabled="actionExecuting !== false"
              >
                {{ actionExecuting ? actionExecuting : "Proceed" }}
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-toolbar>
    </template>
    <template v-slot:item.vnatk_actions="{ item }">
      <span
        v-for="(action, index) in applicableActions(buttonGroupActions, item)"
        :key="index"
        class="flex flex-row"
      >
        <v-btn
          v-if="actionApplicable(action, item)"
          @click="executeAction(action, item)"
          v-bind="
            action.attributes
              ? { ...{ 'x-small': 'x-small' }, ...action.attributes }
              : { 'x-small': 'x-small' }
          "
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
          <v-list-item
            v-for="(action, i) in applicableActions(dropDownActions, item)"
            :key="i"
          >
            <v-list-item-title
              @click="executeAction(action, item)"
              v-if="actionApplicable(action, item)"
              v-bind="action.attributes ? action.attributes : ''"
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

    <!-- <template v-slot:footer> -->
    <template
      v-slot:footer.page-text="props"
      v-if="
        !(
          options.ui.datatableoptions &&
          options.ui.datatableoptions.paginator == false
        )
      "
    >
      <v-pagination
        v-model="currentPage"
        :length="pageCount"
        :total-visible="
          options.ui.datatableoptions &&
          options.ui.datatableoptions.paginator &&
          options.ui.datatableoptions.paginator.totalPageVisible
            ? options.ui.datatableoptions.paginator.totalPageVisible
            : totalPageVisible
        "
      ></v-pagination>
    </template>
  </v-data-table>
</template>

<script>
import _ from "lodash";
import VFormBase from "vuetify-form-base";
import VNATKCrud from "../lib-mixins/VNATKCrud";
import VnatkImport from "./Import.vue";
import VnatkExporter from "./Exporter.vue";

export default {
  name: "VnatkCrud",
  extends: "vDataTable",
  mixins: [VNATKCrud],
  components: {
    VFormBase,
    VnatkImport,
    VnatkExporter,
  },
  props: {
    options: [Object],
  },
  data() {
    return {
      crudkey: 1,
      loading: true,
      optionsprop: {},
      crudcontext: {}, // Mandatory options for backend to be send every communication
      errors: [],
      serverheaders: [],
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
      selectionAdded: false,
      selectedIds: [],
      actionExecuting: false,
      quicksearchtext: "",
      currentPage: 1,
      pageCount: 0,
      totalPageVisible: 7,
    };
  },
  created() {
    this.optionsprop = this.options;
  },

  mounted() {
    // this.crudInit(true);
    this.loading = false;
  },

  watch: {
    optionssynced: {
      handler(newVal, oldVal) {
        if (!oldVal.page) return; // its just initial update, skip this to handle
        if (this.options.read.serversidepagination === true) this.crudInit();
      },
      deep: true,
    },
    options: {
      handler() {
        this.optionsprop = this.options;
        // this.crudInit();
      },
      deep: true,
    },
    optionsprop: {
      handler(newValue, OldValue) {
        console.log("changed", newValue, OldValue);
        this.crudInit(true);
      },
      deep: true,
    },
  },

  computed: {
    showQuickSearch: function () {
      return this.optionsprop.quicksearch !== undefined;
    },
  },

  methods: {
    async crudInit(initialCall = false) {
      this.loading = true;
      if (initialCall) {
        if (!this.checkOptionsAndSetDefaults()) return;

        // Override v-data-table option synced with user defined values for data-table
        this.optionssynced = _.merge(
          this.optionssynced,
          this.optionsprop.read.datatableoptions
        );

        // set always sending options with all API calls as options, we say this crudcontext
        // leave ui and override values as these are only useful for frontend
      }

      this.crudcontext = _.omit(JSON.parse(JSON.stringify(this.optionsprop)), [
        "ui",
        "override",
      ]);

      this.setLimitAndSort();

      var response = { data: {} };

      if (this.optionsprop.response == undefined) {
        let APIIdentifier = this.crudcontext.model
          ? this.crudcontext.model
          : "";
        // call initialization from server
        response = await this.optionsprop.service
          .post(
            this.optionsprop.basepath + "/crud?vnatk_api=" + APIIdentifier,
            this.crudcontext
          )
          .catch((error) => {
            this.loading = false;
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
        response.data = this.optionsprop.response;
      }
      this.loading = false;
      await this.emitPromise("on-data-fetch", response.data.data);

      if (response.data.headers) {
        this.serverheaders = response.data.headers;
        this.headers = this.handleHeaderOverrides(
          this.optionsprop.ui && this.optionsprop.ui.headers
            ? this.optionsprop.ui.headers
            : response.data.headers,
          this.optionsprop.override && this.optionsprop.override.headers
            ? this.optionsprop.override.headers
            : []
        );
      }

      //   handle data
      if (this.optionsprop.data !== false) {
        this.data = this.optionsprop.data
          ? this.optionsprop.data
          : response.data.data
          ? response.data.data
          : [];
        if (this.optionsprop.read && this.optionsprop.read.serversidepagination)
          this.totalRecordsCount = response.data.datacount;
      }

      // handle actions
      if (response.data.actions) {
        this.resetActions();
        console.log("response.data.actions", response.data.actions);
        this.actions = this.handleActionsOverridesAndValidations(
          response.data.actions,
          this.optionsprop.override && this.optionsprop.override.actions
            ? this.optionsprop.override.actions
            : []
        );
        // console.log("this.actions", this.actions);
        this.filterActions();
      }
    },

    async executeAction(action, item, submit = false) {
      // check if some records selected for multi records
      if (
        action.type.toLowerCase().includes("multi") &&
        action.type.toLowerCase().includes("single")
      ) {
        alert(
          "Multi and Single both type actions are not implemented yet, please define them separate"
        );
        return;
      }
      if (action.type.toLowerCase().includes("multi") && !item) {
        if (this.selectedIds.length == 0) {
          alert("Please select some records");
          return;
        } else {
          for (let index = 0; index < this.selectedIds.length; index++) {
            const element = this.selectedIds[index];
            if (!this.actionApplicable(action, element)) {
              alert(
                "This action can only work on " +
                  JSON.stringify(action.where) +
                  " conditions, please de-select non-matched records"
              );
              return;
            }
          }
        }
      }

      // check if correct where condition is met for all seleted records for multi actions

      if (submit) {
        this.actionExecuting = "Executing ....";
        await this.emitPromise("before-action-execute", action, item);
        if (!this.$refs.currentActionUIForm.validate()) {
          this.actionExecuting = false;
          return;
        }
      }

      var metaData = this.crudcontext;
      metaData["action_to_execute"] = action;
      metaData["arg_item"] = item ? item : {};
      if (metaData.formdata) delete metaData.formdata;

      var idField = this.serverheaders.find((o) => o.isIdField === true);
      if (idField) idField = idField["text"];
      //   Create Form if Action has formschema and not submitting
      if (action.formschema) {
        // remove all error messages to get fresh errors if still persists
        // action.formschema = JSON.parse(
        //   JSON.stringify(action.formschema, (k, v) =>
        //     k === "error-messages" ? undefined : v
        //   )
        // );
        action.formschema = _.mapValues(action.formschema, (v) =>
          _.isObject(v) ? _.omit(v, "error-messages") : v
        );

        if (!submit) {
          this.currentActionUI.action = action; //JSON.parse(JSON.stringify(action));
          this.currentActionUI.item = {};

          var editing_record = false;
          // For Row based actions set current item to work on

          if (action.type.toLowerCase().includes("single")) {
            this.currentActionUI.item = Object.assign({}, item);
            editing_record = true;
          }
          this.emitPromise(
            "before-dialog-open",
            action,
            this.currentActionUI.item,
            item
          );

          // lets loop through all fields in formschemas
          var formschema_fields = _.keys(action.formschema);
          for (let i = 0; i < formschema_fields.length; i++) {
            const fld = formschema_fields[i];
            // remove idField and system fields if not defined explicitly in modeloptions->attributes
            if (
              (this.currentActionUI.action.formschema[fld].isIdField ||
                this.currentActionUI.action.formschema[fld].isSystem) &&
              _.get(this.options.read.modeloptions, "attributes", []).includes(
                fld
              ) == false
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
              // console.log("Doing autocomplete ", action.formschema[fld]);
              action.formschema[fld].filter = (i) => i;
              if (editing_record) {
                if (item[fld]) {
                  var fieldtext = _.has(item, action.formschema[fld])
                    ? _.get(item, action.formschema[fld].titlefield)
                    : false;
                  if (!fieldtext) {
                    fieldtext =
                      fieldtext ||
                      (_.has(
                        item[action.formschema[fld].association.name.singular],
                        action.formschema[fld].titlefield
                          ? action.formschema[fld].titlefield
                          : "name"
                      )
                        ? item[
                            action.formschema[fld].association.name.singular
                          ][
                            action.formschema[fld].titlefield
                              ? action.formschema[fld].titlefield
                              : "name"
                          ]
                        : false);
                  }
                  if (!fieldtext) fieldtext = fieldtext || "" + item[fld];
                  var existingSelect = [
                    {
                      text: fieldtext,
                      value: item[fld],
                    },
                  ];

                  this.currentActionUI.action.formschema[fld].items =
                    existingSelect;
                  this.currentActionUI.action.formschema[fld].searchInput =
                    fieldtext;
                }
              } else {
                // mostly adding or other action
                if (
                  this.currentActionUI.action.name === "vnatk_add" &&
                  _.has(this.currentActionUI.action.formschema[fld], "items")
                ) {
                  this.currentActionUI.action.formschema[fld].searchInput =
                    this.currentActionUI.action.formschema[fld].items[0].text;
                }
              }

              //with this we skip the first change
              var unwatch = this.$watch(
                "currentActionUI.action.formschema." + fld + ".searchInput",
                this.handleAutoCompletes
              );
              this.currentActionUI.autocompletesUnWacthers.push(unwatch);
            }
          }
          this.currentActionUI.open = true;
          this.emitPromise(
            "after-dialog-open",
            action,
            this.currentActionUI.item,
            item
          );

          // Just keep yourself to show form .... do not go further... thats execute action code

          return;
        } else {
          // Form is being submitted

          if (editing_record && !this.currentActionUI.item[idField]) {
            this.currentActionUI.errors.push(
              "ID Field(" + idField + ") value not found "
            );
          }
          // console.log("picking from ", this.currentActionUI.item);
          metaData["arg_item"] = _.pick(this.currentActionUI.item, [
            ..._.keys(this.currentActionUI.action.formschema),
            ...[idField],
          ]);
          // console.log("picked ", metaData["arg_item"]);
          // console.log("idField ", idField);
        }
      }

      // add selected records in case of multirecords action
      console.log(
        "this.selectedIds.length",
        this.selectedIds.length,
        'action.type.toLowerCase().includes("multi")',
        action.type.toLowerCase().includes("multi"),
        "!item",
        !item,
        "item",
        item
      );
      if (
        this.selectedIds.length > 0 &&
        action.type.toLowerCase().includes("multi")
      ) {
        if (metaData["arg_item"])
          metaData["arg_item"]["vnatk_selected_records"] = this.selectedIds;
        // if (metaData["formdata"])
        //   metaData["formdata"]["vnatk_selected_records"] = this.selectedIds;
      }

      if (action.isClientAction) {
        this.actionExecuting = false;
        return action.execute(item);
      }

      if (action.name == "vnatk_add") {
        // add default values if exists
        if (this.optionsprop.create && this.optionsprop.create.defaultvalues) {
          for (const [field, value] of Object.entries(
            this.optionsprop.create.defaultvalues
          )) {
            if (!_.has(item, field)) {
              if (typeof value === "function") {
                metaData["arg_item"][field] = item[field] = value(item);
              } else {
                metaData["arg_item"][field] = item[field] = value;
              }
            }
          }
        }
      }

      let APIIdentifier =
        (metaData.model ? metaData.model : "") +
        "_" +
        (metaData.action_to_execute ? metaData.action_to_execute.name : "");

      let endpoint =
        this.optionsprop.basepath + "/executeaction?vnatk_api=" + APIIdentifier;

      let postVars = metaData;

      if (
        action.handleviaimport !== undefined &&
        action.handleviaimport === true
      ) {
        if (action.rowformatter && typeof action.rowformatter === "function") {
          metaData = [action.rowformatter(metaData.arg_item)];
        }
        postVars = {
          action_to_execute: {
            execute: "vnatk_autoimport",
            name: "vnatk_autoimport",
          },
          importdata: metaData,
          model: this.optionsprop.model,
          transaction: this.optionsprop.transaction === "row" ? "row" : "file",
        };
      }

      return this.optionsprop.service
        .post(endpoint, postVars)
        .then((response) => {
          if (item && item.id) {
            const currentIndex = this.data.findIndex((p) => p.id === item.id);
            if (response.data.row_data)
              if (currentIndex > -1)
                this.data.splice(currentIndex, 1, response.data.row_data);
              else this.data.unshift(response.data.row_data);
            else {
              this.data.splice(currentIndex, 1);
            }
          }
          this.emitPromise("after-action-execute", postVars, response.data);
          this.actionExecuting = false;
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
          } else if (
            (error.response.status == 500 || error.response.status == 512) &&
            _.has(error.response.data, "name")
          ) {
            // IF ITS A WELL DEFINED ERROR FORMAT FROM SEQUELIZE
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
          this.actionExecuting = false;
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

      // console.log("schema is ", schema);

      // get its serviceoptionsoverrides
      var crudcontext = this.getAutoCompleteServiceOptions(
        schema,
        newValue,
        this.crudcontext
      );

      // console.log("autocomplete crudcontext.service are", crudcontext);

      // call service
      let service = crudcontext.service
        ? crudcontext.service
        : this.optionsprop.service;

      service
        .post(crudcontext.basepath + "/crud", crudcontext)
        .then((response) => {
          schema.items = response.data.data.map((o) => {
            console.log(
              "schema.serviceoptions.titlefield",
              schema.serviceoptions,
              o
            );
            return Object.assign(
              {
                value: o.id,
                text:
                  schema.serviceoptions &&
                  schema.serviceoptions.titlefield &&
                  typeof schema.serviceoptions.titlefield === "function"
                    ? schema.serviceoptions.titlefield(o)
                    : o[
                        schema.serviceoptions &&
                        schema.serviceoptions.searchfield
                          ? Array.isArray(schema.serviceoptions.searchfield)
                            ? schema.serviceoptions.searchfield[0]
                            : schema.serviceoptions.searchfield
                          : schema.titlefield
                          ? schema.titlefield
                          : "name"
                      ],
              },
              _.omit(
                o,
                "id",
                schema.serviceoptions && schema.serviceoptions.searchfield
                  ? schema.serviceoptions.searchfield
                  : schema.titlefield
                  ? schema.titlefield
                  : "name"
              )
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

    applicableActions(actions, item) {
      return actions.filter((i) => this.actionApplicable(i, item));
    },

    filterActions() {
      var finalActions = this.actions;

      var defaultActionPlacement = this.optionsprop.ui.defaultActionPlacement
        ? this.options.ui.defaultActionPlacement
        : "DropDown";
      for (let i = 0; i < finalActions.length; i++) {
        const element = finalActions[i];
        if (element.type == undefined) element.type = "single";
        if (
          element.type.toLowerCase().includes("single") &&
          element.placeIn == undefined
        )
          element.placeIn = defaultActionPlacement;

        // Place action in proper action group
        // console.log(element.type);
        if (
          element.type.toLowerCase().includes("single") &&
          element.placeIn.toLowerCase() == "buttonGroup".toLowerCase()
        )
          this.buttonGroupActions.push(element);

        if (
          element.type.toLowerCase().includes("single") &&
          element.placeIn == "DropDown"
        )
          this.dropDownActions.push(element);

        if (element.type.toLowerCase() == "NoRecord".toLowerCase())
          this.noRecordActions.push(element);

        if (element.type.toLowerCase().includes("multi")) {
          this.multiRecordActions.push(element);
          if (!this.selectionAdded) {
            this.selectionAdded = true;
          }
        }

        // Any action that has formschema needs a ui in dialog to be setup
        if (
          element.formschema ||
          element.type.toLowerCase() == "NoRecord".toLowerCase()
        ) {
          if (element.type.toLowerCase().includes("norecord"))
            this.actionUIs["norecord"].push(element);

          if (element.type.toLowerCase().includes("single"))
            this.actionUIs["single"].push(element);

          if (element.type.toLowerCase().includes("multi"))
            this.actionUIs["multirecords"].push(element);
        }
      }
    },

    formEventClick(obj) {
      this.$emit("formEventClick", obj);
    },

    formEventInput(obj) {
      this.$emit("formEventInput", obj);
    },

    formEventChanged(obj) {
      this.$emit("formEventChanged", obj);
    },

    async emitPromise(method, ...params) {
      let listener =
        this.$listeners[method] || this.$attrs[method] || this[method];
      if (listener) {
        //one can additionally wrap this in try/catch if needed and handle the error further
        let res = await listener(...params);
        return res === undefined || res;
      }
      return false;
    },

    throwBeforeImport(data) {
      this.emitPromise("before-import", data);
    },

    throwAfterImport(data) {
      this.emitPromise("after-import", data);
    },

    quickSearchExecute(clear = false) {
      if (typeof this.optionsprop.quicksearch == "function") {
        return this.optionsprop.quicksearch(this.quicksearchtext);
      }

      if (clear === true) {
        this.quicksearchtext = "";
      }

      var condition = {};
      for (
        let index = 0;
        index < this.optionsprop.quicksearch.length;
        index++
      ) {
        const fieldToSearch = this.optionsprop.quicksearch[index];
        condition[fieldToSearch] = { $like: "%" + this.quicksearchtext + "%" };
      }

      // add structure if not added already
      if (!this.optionsprop.read) this.optionsprop.read = {};
      if (!this.optionsprop.read.modeloptions)
        this.optionsprop.read.modeloptions = {};
      if (!this.optionsprop.read.modeloptions.where)
        this.optionsprop.read.modeloptions.where = {};

      if (!this.optionsprop.read.modeloptions.where.$or)
        this.optionsprop.read.modeloptions.where.$or = {};
      if (this.quicksearchtext) {
        this.$set(this.optionsprop.read.modeloptions.where, "$or", condition);
      } else {
        for (
          let index = 0;
          index < this.optionsprop.quicksearch.length;
          index++
        ) {
          const fieldToSearch = this.optionsprop.quicksearch[index];
          if (this.optionsprop.read.modeloptions.where.$or[fieldToSearch])
            delete this.optionsprop.read.modeloptions.where.$or[fieldToSearch];
        }
      }
      if (_.isEmpty(this.optionsprop.read.modeloptions.where.$or)) {
        delete this.optionsprop.read.modeloptions.where.$or;
      }
      this.crudkey = this.crudkey + 1;
    },
  },
};
</script>
