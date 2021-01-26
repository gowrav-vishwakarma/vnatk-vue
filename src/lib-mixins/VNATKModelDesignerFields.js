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
                        {
                            text: 'Actions',
                            value: 'vnatk_actions'
                        }
                    ],
                    actions: [
                        {
                            name: "Add",
                            type: "NoRecord",
                            isClientAction: true,
                            execute: this.addField,
                            formschema: this.getFieldsSchemas()

                        },
                        {
                            name: "Edit",
                            type: "single",
                            isClientAction: true,
                            execute: this.editField,
                            formschema: this.getFieldsSchemas()
                        },
                        {
                            name: "Delete",
                            type: "single",
                            isClientAction: true,
                            execute: this.deleteField,
                        },
                    ],
                },
                create: true,
            };
            this.modelsData[modelName].fieldsCrud = fieldsCruds;
            // console.log(modelName, this.modelsData[modelName], this.modelsData[modelName].fieldsCrud);
        },
        getFieldsSchemas() {
            return {
                fieldName: { type: 'text', label: 'FieldName' },
                dbField: { type: 'text', label: 'DB Field' },
                type: { type: 'combobox', label: 'Type', items: this.getFieldSequelizeTypes() }
            }
        },
        addField(fields) {
            console.log(fields);
            this.modelsData[this.currentSelecetdModelName].fieldsCrud.response.data.push(fields);
            return true;
        },
        editField(fields) {
            var data = this.modelsData[this.currentSelecetdModelName].fieldsCrud.response.data;
            var index = data.findIndex(a => a.fieldName === fields.fieldName)
            delete this.modelsData[this.currentSelecetdModelName].fieldsCrud.response.data[index]
            this.modelsData[this.currentSelecetdModelName].fieldsCrud.response.data.splice(index, 0, fields);
            return true;
        },
        deleteField(fields) {
            if (confirm('Really delete Field')) {
                var data = this.modelsData[this.currentSelecetdModelName].fieldsCrud.response.data;
                return data.splice(data.findIndex(a => a.fieldName === fields.fieldName), 1)
            }
        },
        getFieldSequelizeTypes() {
            return ['STRING', 'TEXT', 'BOOLEAN', 'INTEGER', 'BIGINT', 'FLOAT', 'REAL', 'DOUBLE', 'DECIMAL', 'DATE', 'DATEONLY', 'UUID', '']
        }
    }
}