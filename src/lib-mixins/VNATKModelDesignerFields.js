import _ from "lodash";

// Helper & Partial Functions
const minLen = l => v => (v && v.length >= l) || `min. ${l} Characters`
const maxLen = l => v => (v && v.length <= l) || `max. ${l} Characters`
const required = msg => v => !!v || msg
const requiredArray = msg => v => (Array.isArray(v) && v.length > 1) || msg
// Rules
const rules = {
    requiredEmail: required('E-mail is required'),
    requiredSel: required('Selection is required'),
    requiredSelMult: requiredArray('2 Selections are required'),
    max12: maxLen(12),
    min6: minLen(6),
    validEmail: v => /.+@.+\..+/.test(v) || 'E-mail must be valid'
}

export default {
    methods: {
        setFieldsCrud(modelName) {
            if (_.has(this.modelsData[modelName], 'fieldsCrud')) {
                return this.modelsData[modelName].fieldsCrud;
            }
            var fieldsArray = [];
            var i = 0;
            for (const [field, props] of Object.entries(this.modelsData[modelName].rawAttributes)) {
                if (props.primaryKey || props.references) continue;
                fieldsArray.push({
                    id: i++,
                    fieldName: props.fieldName,
                    type: props.type.key,
                    dbField: props.field,
                    caption: props.caption,
                    validate: JSON.stringify(props.validate),
                    defaultValue: props.defaultValue,
                })
            }

            var fieldsCruds = {
                title: "Fields",
                defaultActionPlacement: 'buttonGroup',
                response: {
                    idfield: 'id',
                    data: fieldsArray,
                    headers: [
                        {
                            text: "Field",
                            value: "fieldName",
                        },
                        {
                            text: "Type",
                            value: "type",
                        },
                        {
                            text: "DB Field",
                            value: "dbField",
                            hide: true
                        },
                    ],
                    actions: true,
                },
                override: {
                    actions: [
                        {
                            name: 'Add',
                            value: 'vnatk_add',
                            formschema: this.getFieldsSchemas()
                        },
                        {
                            name: 'Edit',
                            value: 'vnatk_edit',
                            formschema: this.getFieldsSchemas()
                        }
                    ]
                },
                create: true,
            };
            this.modelsData[modelName].fieldsCrud = fieldsCruds;
        },

        setBelongsToCrud(modelName) {
            if (_.has(this.modelsData[modelName], 'belongsToCrud')) {
                return this.modelsData[modelName].belongsToCrud;
            }
            var belongsToArray = [];
            for (let index = 0; index < this.modelsData[modelName]['associations'].length; index++) {
                const assos = this.modelsData[modelName]['associations'][index];
                if (assos.associationType !== 'BelongsTo') continue;
                belongsToArray.push({
                    id: index,
                    model: assos.model,
                    foreignField: assos.foreignKey,
                    as: assos.as ? assos.as : assos.name.singular
                })
            }

            var belongsToCrud = {
                title: "BelongsTo",
                defaultActionPlacement: 'buttonGroup',
                response: {
                    idfield: 'id',
                    data: belongsToArray,
                    headers: [
                        {
                            text: "Id",
                            value: "id",
                            hide: true
                        },
                        {
                            text: "Model",
                            value: "model",
                        },
                        {
                            text: "Field",
                            value: "foreignField",
                        },
                        {
                            text: "As",
                            value: "as",
                        }
                    ],
                    actions: true,
                },
                override: {
                    actions: [
                        {
                            name: 'Add',
                            value: 'vnatk_add',
                            formschema: this.getBelongsToSchemas()
                        },
                        {
                            name: 'Edit',
                            value: 'vnatk_edit',
                            formschema: this.getBelongsToSchemas()
                        }
                    ]
                },
                create: true,
            };
            this.modelsData[modelName].belongsToCrud = belongsToCrud;
        },
        setHasManyToCrud(modelName) {
            if (_.has(this.modelsData[modelName], 'HasMany')) {
                return this.modelsData[modelName].HasMany;
            }
            var HasManyArray = [];
            for (let index = 0; index < this.modelsData[modelName]['associations'].length; index++) {
                const assos = this.modelsData[modelName]['associations'][index];
                if (assos.associationType !== 'HasMany') continue;
                HasManyArray.push({
                    id: index,
                    model: assos.model,
                    foreignField: assos.foreignKey,
                    as: assos.as ? assos.as : assos.name.plural
                })
            }

            var HasManyCrud = {
                title: "HasMany",
                defaultActionPlacement: 'buttonGroup',
                response: {
                    idfield: 'id',
                    data: HasManyArray,
                    headers: [
                        {
                            text: "Id",
                            value: "id",
                            hide: true
                        },
                        {
                            text: "Model",
                            value: "model",
                        },
                        {
                            text: "Field",
                            value: "foreignField",
                        },
                        {
                            text: "As",
                            value: "as",
                        }
                    ],
                    actions: true,
                },
                override: {
                    actions: [
                        {
                            name: 'Add',
                            value: 'vnatk_add',
                            formschema: this.getHasManySchemas()
                        },
                        {
                            name: 'Edit',
                            value: 'vnatk_edit',
                            formschema: this.getHasManySchemas()
                        }
                    ]
                },
                create: true,
            };
            this.modelsData[modelName].HasManyCrud = HasManyCrud;
        },

        setBelongsToManyToCrud(modelName) {
            if (_.has(this.modelsData[modelName], 'BelongsToMany')) {
                return this.modelsData[modelName].BelongsToMany;
            }
            var BelongsToManyArray = [];
            for (let index = 0; index < this.modelsData[modelName]['associations'].length; index++) {
                const assos = this.modelsData[modelName]['associations'][index];
                if (assos.associationType !== 'BelongsToMany') continue;
                BelongsToManyArray.push({
                    id: index,
                    model: assos.model,
                    through: assos.through.model,
                    foreignField: assos.foreignKey,
                    as: assos.as ? assos.as : assos.name.plural
                })
            }

            var BelongsToManyCrud = {
                title: "BelongsToMany",
                defaultActionPlacement: 'buttonGroup',
                response: {
                    idfield: 'id',
                    data: BelongsToManyArray,
                    headers: [
                        {
                            text: "Id",
                            value: "id",
                            hide: true
                        },
                        {
                            text: "Model",
                            value: "model",
                        },
                        {
                            text: "Through",
                            value: "through",
                        },
                        {
                            text: "Field",
                            value: "foreignField",
                        },
                        {
                            text: "As",
                            value: "as",
                        }
                    ],
                    actions: true,
                },
                override: {
                    actions: [
                        {
                            name: 'Add',
                            value: 'vnatk_add',
                            formschema: this.getBelongsToManySchemas()
                        },
                        {
                            name: 'Edit',
                            value: 'vnatk_edit',
                            formschema: this.getBelongsToManySchemas()
                        }
                    ]
                },
                create: true,
            };
            this.modelsData[modelName].BelongsToManyCrud = BelongsToManyCrud;
        },

        setScopesCrud(modelName) {

            var ScopesArray = [];
            ScopesArray.push({
                id: 0,
                scope: 'defaultScope',
                code: JSON.stringify(this.modelsData[modelName].scopes.defaultScope, undefined, 4),
            })
            var i = 1;
            for (const [scopeName, scopeCode] of Object.entries(this.modelsData[modelName].scopes.scopes)) {
                ScopesArray.push({
                    id: i++,
                    scope: scopeName,
                    code: JSON.stringify(scopeCode, undefined, 4),
                })
            }

            var scopesCrud = {
                title: "Scopes",
                defaultActionPlacement: 'buttonGroup',
                response: {
                    idfield: 'id',
                    data: ScopesArray,
                    headers: [
                        {
                            text: "Scope",
                            value: "scope",
                        },
                        {
                            text: "Code",
                            value: "code",
                        },
                    ],
                    actions: true,
                },
                override: {
                    actions: [
                        {
                            name: 'Add',
                            value: 'vnatk_add',
                            formschema: this.getScopesSchemas()
                        },
                        {
                            name: 'Edit',
                            value: 'vnatk_edit',
                            formschema: this.getScopesSchemas()
                        }
                    ]
                },
                create: true,
            };
            this.modelsData[modelName].scopesCrud = scopesCrud;
        },

        setActionsCrud(modelName) {

            var ActionsArray = [];
            if (_.has(this.modelsData[modelName], 'actions')) {
                for (let index = 0; index < this.modelsData[modelName]['actions'].length; index++) {
                    const action = this.modelsData[modelName]['actions'][index];
                    ActionsArray.push({
                        id: index,
                        name: action.name,
                        type: action.type,
                        where: JSON.stringify(action.where),
                        execute: action.execute,
                        code: action.code,
                        formschema: JSON.stringify(action.formschema, undefined, 4),
                    });
                }
            }


            var actionsCrud = {
                title: "Actions",
                defaultActionPlacement: 'buttonGroup',
                response: {
                    idfield: 'id',
                    data: ActionsArray,
                    headers: [
                        {
                            text: "Action",
                            value: "name",
                        },
                        {
                            text: "Type",
                            value: "type",
                        },
                        {
                            text: "Where",
                            value: "where",
                        },
                        {
                            text: "Execute",
                            value: "execute",
                        },
                    ],
                    actions: true,
                },
                override: {
                    actions: [
                        {
                            name: 'Add',
                            value: 'vnatk_add',
                            formschema: this.getActionsSchemas()
                        },
                        {
                            name: 'Edit',
                            value: 'vnatk_edit',
                            formschema: this.getActionsSchemas()
                        }
                    ]
                },
                create: true,
            };
            this.modelsData[modelName].actionsCrud = actionsCrud;
        },

        setextraFormSchema(modelName) {
            return {
                tableName: { type: 'text', label: 'Table Name' }
            }
        },

        getActionsSchemas() {
            return {
                name: { type: 'text', label: 'Action name' },
                type: { type: 'select', label: 'Type', items: ['NoRecord', 'single', 'MultiRecord'] },
                code: { type: 'textarea', label: 'Code' },
                where: { type: 'textarea', label: 'Where (JSON)' },
                formschema: { type: 'textarea', label: 'Form Schema' },
                execute: { type: 'text', label: 'Execute Method' },
            }
        },

        getScopesSchemas() {
            return {
                scope: { type: 'text', label: 'ScopeName' },
                code: { type: 'textarea', label: 'Code' },
            }
        },
        required() {
            return (v) => !!v || 'This field is required'
        },
        getFieldsSchemas() {

            return {
                fieldName: { type: 'text', label: 'FieldName', color: 'red' },
                dbField: { type: 'text', label: 'DB Field', hint: "If DB field is different then Field, or leave empty" },
                type: { type: 'combobox', label: 'Type', items: this.getFieldSequelizeTypes() },
                caption: { type: 'text', label: 'Caption' },
                validate: { type: 'textarea', label: 'Validate (JSON)' },
                defaultValue: { type: 'text', label: 'Default Value' },
            }
        },
        getBelongsToSchemas() {
            return {
                model: { type: 'select', label: 'Model', items: _.keys(this.modelsData) },
                foreignField: { type: 'text', label: 'Field' },
                as: { type: 'text', label: 'As' }
            }
        },
        getHasManySchemas() {
            return {
                model: { type: 'select', label: 'Model', items: _.keys(this.modelsData) },
                foreignField: { type: 'text', label: 'Field' },
                as: { type: 'text', label: 'As' }
            }
        },
        getBelongsToManySchemas() {
            return {
                model: { type: 'select', label: 'Model', items: _.keys(this.modelsData) },
                through: { type: 'select', label: 'Through', items: _.keys(this.modelsData) },
                foreignField: { type: 'text', label: 'Field' },
                as: { type: 'text', label: 'As' }
            }
        },

        getFieldSequelizeTypes() {
            return ['STRING', 'TEXT', 'BOOLEAN', 'INTEGER', 'BIGINT', 'FLOAT', 'REAL', 'DOUBLE', 'DECIMAL', 'DATE', 'DATEONLY', 'UUID', '']
        }
    }
}