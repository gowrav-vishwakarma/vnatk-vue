import _ from "lodash";
export default {
    methods: {
        setFieldsCrud(modelName) {
            if (_.has(this.modelsData[modelName], 'fieldsCrud')) {
                return this.modelsData[modelName].fieldsCrud;
            }
            var fieldsArray = [];
            for (const [field, props] of Object.entries(this.modelsData[modelName].rawAttributes)) {
                if (props.primaryKey || props.references) continue;
                fieldsArray.push({
                    fieldName: props.fieldName,
                    type: props.type.key,
                    dbField: props.field
                })
            }

            var fieldsCruds = {
                title: "Fields",
                defaultActionPlacement: 'buttonGroup',
                response: {
                    idfield: 'fieldName',
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
                    model: assos.name.singular,
                    foreignField: assos.foreignKey
                })
            }

            var belongsToCrud = {
                title: "BelongsTo",
                defaultActionPlacement: 'buttonGroup',
                response: {
                    idfield: 'model',
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

        getFieldsSchemas() {
            return {
                fieldName: { type: 'text', label: 'FieldName' },
                dbField: { type: 'text', label: 'DB Field' },
                type: { type: 'combobox', label: 'Type', items: this.getFieldSequelizeTypes() }
            }
        },
        getBelongsToSchemas() {
            return {
                // id: { type: 'number', label: 'ID' },
                model: { type: 'text', label: 'Model' },
                foreignField: { type: 'text', label: 'Field' }
            }
        },
        // addField(fields) {
        //     console.log(fields);
        //     this.modelsData[this.currentSelecetdModelName].fieldsCrud.response.data.push(fields);
        //     return true;
        // },
        // editField(fields) {
        //     var data = this.modelsData[this.currentSelecetdModelName].fieldsCrud.response.data;
        //     var index = data.findIndex(a => a.fieldName === fields.fieldName)
        //     delete this.modelsData[this.currentSelecetdModelName].fieldsCrud.response.data[index]
        //     this.modelsData[this.currentSelecetdModelName].fieldsCrud.response.data.splice(index, 0, fields);
        //     return true;
        // },
        // deleteField(fields) {
        //     if (confirm('Really delete Field')) {
        //         var data = this.modelsData[this.currentSelecetdModelName].fieldsCrud.response.data;
        //         return data.splice(data.findIndex(a => a.fieldName === fields.fieldName), 1)
        //     }
        // },
        getFieldSequelizeTypes() {
            return ['STRING', 'TEXT', 'BOOLEAN', 'INTEGER', 'BIGINT', 'FLOAT', 'REAL', 'DOUBLE', 'DECIMAL', 'DATE', 'DATEONLY', 'UUID', '']
        }
    }
}