import Vue from "vue";

import _ from "lodash";

export default {
    methods: {
        checkOptions: function (options) {
            var err = [];
            // check for mandatory options
            if (!options.model) err.push('"model" option not defined in crud options');

            if (err.length) return err;
            // put default mendatory options
            if (!options.basepath) options.basepath = '/crud';
            if (!options.title) options.title = options.model;
            if (!options.tableoptions) options.tableoptions = {};
            if (options.autoderef !== false) options.autoderef = true;
            if (!options.tableoptions.modeloptions) options.tableoptions.modeloptions = {};
            if (options.tableoptions.headers !== false) options.tableoptions.headers = true;
            if (options.allowactions !== false) options.allowactions = true;
            if (options.allowadd !== false) options.allowadd = true;
            if (options.allowedit !== false) options.allowedit = true;
            if (options.allowdelete !== false) options.allowdelete = true;
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

        handleActionsOverrides(serveractions, overrideactions) {
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
            serviceoptions.modeloptions = {};
            serviceoptions.modeloptions['where'] = {};
            serviceoptions.modeloptions['attributes'] = overrideserviceoption.modelattributes ? overrideserviceoption.modelattributes : ["id", "name"];
            serviceoptions.modeloptions['where'][overrideserviceoption.searchfield ? overrideserviceoption.searchfield : 'name'] = { $like: "%" + q + "%" };
            serviceoptions.modeloptions['limit'] = overrideserviceoption.limit ? overrideserviceoption.limit : 10;
            return serviceoptions;

        },

        overrideOptionSynced() {
            if (!this.options.tableoptions || !this.options.tableoptions.datatableoptions) return this.optionssynced;
            return Object.assign(this.optionssynced, this.options.tableoptions.datatableoptions)
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