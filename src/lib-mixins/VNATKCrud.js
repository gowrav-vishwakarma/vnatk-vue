import Vue from "vue";

import _ from "lodash";


export default {
    methods: {
        deepRemoveKey: function (obj, key) {
            JSON.parse(
                JSON.stringify(obj, (k, v) =>
                    // k === "error-messages" ? undefined : v
                    k === key ? undefined : v
                )
            )
        },
        checkOptionsAndSetDefaults: function () {

            var err = [];
            // check for mandatory options
            if (!this.options.model) err.push('"model" option not defined in crud options');
            if (!this.options.service) err.push('"service" option not defined in crud options, service must be axios instance');

            if (err.length) {
                this.errors = err;
                return false;
            }
            // put default mendatory options

            if (!this.options.basepath) this.options.basepath = '/vnatk';
            if (!_.has(this.options, 'retrive')) this.options.retrive = {};
            if (!this.options.title) this.options.title = this.options.model;
            if (this.options.retrive.autoderef !== false) this.options.retrive.autoderef = true;
            if (!this.options.retrive.modeloptions) this.options.retrive.modeloptions = {};
            if (this.options.retrive.headers !== false) this.options.retrive.headers = true;
            if (!_.has(this.options, 'actions')) this.options.actions = true;
            if (!_.has(this.options, 'create')) this.options.create = true;
            if (!_.has(this.options, 'update')) this.options.update = true;
            if (!_.has(this.options, 'delete')) this.options.delete = true;
            return true;
        },

        filterOptionsForServer: function () {
            var opt = Object.assign({}, this.options);
            if (opt.actionsoverrides) delete opt.actionsoverrides;
            if (opt.tableoptions !== undefined && opt.tableoptions.headersoverrides !== undefined) delete opt.tableoptions.headeroverrides;
            // merge back datatable optionssynced back to this
            opt.tableoptions.datatableoptions = this.optionssynced;
            return opt;
        },

        handleHeaderOverrides(serverheaders, overrideheaders) {
            if (!overrideheaders) return serverheaders;
            const debug = false;
            // look for server sending hide 
            var finalHeaders = [...serverheaders];
            debug && console.log('serverheader', finalHeaders);
            for (const [field, overrideObj] of Object.entries(overrideheaders)) {
                debug && console.log('field', field);
                const i = finalHeaders.findIndex((p) => { debug && console.log(p, field); return p.value == field });
                debug && console.log('found in server at', i);
                if (i > -1) {
                    debug && console.log('overriding', Object.assign({}, finalHeaders[i]), 'with', Object.assign({}, overrideObj));
                    // look for override
                    finalHeaders[i] = Object.assign(finalHeaders[i], overrideObj);
                } else {
                    // add new header field
                    debug && console.log('adding new', overrideObj);
                    finalHeaders.push(overrideObj)
                }
                if (_.has(overrideObj, 'moveto')) {
                    var moveto = overrideObj.moveto;
                    if (moveto == 'last'.toLocaleLowerCase()) moveto = finalHeaders.length;
                    debug && console.log('moving to ', moveto);

                    finalHeaders.splice(moveto, 0, finalHeaders.splice(i, 1)[0]);
                }
            }
            debug && console.log('finally finalHeaders', finalHeaders);
            return finalHeaders;
        },



        handleActionsOverridesAndValidations(serveractions, overrideactions) {
            // TODO Convert serverside validations to client side 
            if (!overrideactions) return serveractions;
            var finalActions = [...serveractions];

            for (let index = 0; index < overrideactions.length; index++) {
                const to_update = overrideactions[index];
                const i = finalActions.findIndex((p) => p.name === to_update.name);
                if (i > -1) {
                    // Action found in server action list, override this now
                    var thisFinalAction = finalActions[i];

                    // if this finalActions has formschema and overrideactions also has formschema
                    // replace overrided schema in finalActions
                    // remove formschema in overrideactions
                    if (_.has(thisFinalAction, 'formschema') && _.has(to_update, 'formschema')) {
                        finalActions[i].formschema = Object.assign({}, to_update.formschema);
                        delete to_update.formschema;
                    }

                    // if finalActions has formschema and overrideactions has formschemaoverrides
                    // merge formschemaoverrides over formschema in finalAction
                    // remove formschemaoverrides in overrideactions
                    if (_.has(thisFinalAction, 'formschema') && _.has(to_update, 'formschemaoverrides')) {
                        for (const [field, overrideObj] of Object.entries(to_update.formschemaoverrides)) {
                            Object.assign(finalActions[i].formschema[field], overrideObj);
                        }
                        delete to_update.formschemaoverrides
                    }
                    // check if this needs position change
                    // or merge overrideaction over this finalAction
                    finalActions[i] = Object.assign(finalActions[i], to_update);
                } else {
                    // action not found from server list, add new action from user
                    finalActions.push(to_update);
                }
            }
            return finalActions;
        },

        findActionFormSchemabySearchInputValue(action, val) {
            if (!_.has(action, "formschema")) return;
            for (const [field, schema] of Object.entries(action.formschema)) {
                if (schema.searchInput == val) return action.formschema[field];
            }
            return false;
        },

        getAutoCompleteServiceOptions(schema, q, serveroptions) {
            // create service option from schema association info
            // override user defined values
            if (!q) return;
            var overrideserviceoption = {};
            if (_.has(schema, 'serviceoptions')) overrideserviceoption = schema.serviceoptions;
            var serviceoptions = {};
            serviceoptions.service = overrideserviceoption.service ? overrideserviceoption.service : serveroptions.service;
            serviceoptions.basepath = overrideserviceoption.basepath ? overrideserviceoption.basepath : serveroptions.basepath;
            serviceoptions.model = overrideserviceoption.model ? overrideserviceoption.model : schema.association.name.singular;
            serviceoptions.retrive = {}
            serviceoptions.retrive.modeloptions = {};
            serviceoptions.retrive.modeloptions['where'] = {};
            serviceoptions.retrive.modeloptions['attributes'] = overrideserviceoption.modelattributes ? overrideserviceoption.modelattributes : ["id", "name"];
            serviceoptions.retrive.modeloptions['where'][overrideserviceoption.searchfield ? overrideserviceoption.searchfield : 'name'] = { $like: "%" + q + "%" };
            serviceoptions.retrive.modeloptions['limit'] = overrideserviceoption.limit ? overrideserviceoption.limit : 10;
            return serviceoptions;

        },

        setLimitAndSort() {
            // Limit and Offset
            if (this.crudcontext.retrive.serversidepagination === true) {
                this.crudcontext.retrive.modeloptions.limit = this.optionssynced.itemsPerPage;
                this.crudcontext.retrive.modeloptions.offset =
                    (this.optionssynced.page - 1) * this.optionssynced.itemsPerPage;
            }

            // SortBy
            // sortBy: ["City.name", "State.name","mobile"], sortDesc: [false, false]
            var returnValue = { order: false, group: false }
            if (this.optionssynced.sortBy && this.optionssynced.sortBy.length) { // ["City.name", "State.name"]
                returnValue.order = [];
                for (let i = 0; i < this.optionssynced.sortBy.length; i++) {
                    var sortArray = [];
                    const sortBY = this.optionssynced.sortBy[i]; // "City.name", "State.name"
                    var t_sortBy = sortBY.split(".").reverse(); // ['name','City']
                    var fieldDone = false;
                    for (let j = 0; j < t_sortBy.length; j++) {
                        const stringPart = t_sortBy[j]; // "name", "City"
                        if (!fieldDone) {
                            if (this.optionssynced.sortDesc[i]) sortArray.push("DESC"); // Equivalent sortDesc
                            sortArray.push(stringPart); // name done... rest should be model relations path only
                            fieldDone = true;
                        } else {
                            sortArray.push({ model: stringPart }) // {model: 'City'}
                        }
                    }
                    returnValue.order.push(sortArray.reverse());
                }
            }
            if (returnValue.order) this.crudcontext.retrive.modeloptions.order = returnValue.order;

        },

        resetActions() {
            this.actions = [];
            this.buttonGroupActions = [];
            this.dropDownActions = []; //single record actions
            this.noRecordActions = []; // no record actions
            this.multiRecordActions = []; // multirecord actions
            this.actionUIs = {
                norecord: [],
                multirecords: [],
                single: [],
            };
        }
    }
}
