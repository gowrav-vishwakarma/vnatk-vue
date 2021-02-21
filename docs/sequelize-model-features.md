# Aditional Model Features
If you are using VES (vnatk-express-sequelize) as your API powerhouse only, you can keep using Sequelize model system and it will work fine. But if you are using `vantk-vue`, you can add some more features on your sequelize models to automate a few things here on frontend.

## Model Specific

### titlefield
`Class Property` `[Optional]` - `default name`

VES will de-reference all realtions and try to find proper name to idetify related record. Default, it assumes your `name` field if defined in model is your title field.

If, `User belongsTo City`, we have `CityId` in `Users` Table. if City has name field, VNATK will show City's name in data grid etc and even in autocomplete dropdown to type, while when saving its appropriate Id will be saved in User.

But, if you have different field in Model that defines name for that record like `identifier` in Products table. you can create `titlefield` property to be value `identifier`, And rest VNATK will doing de-referencing with this firld now.


example 
```javascript
module.exports = (sequelize, DataTypes) => {
    const Project = sequelize.define('Project', {
        // This field is supposed to be titlefield
        code: DataTypes.STRING,
        title: DataTypes.STRING,
        imageUrl: DataTypes.STRING,
        description: DataTypes.TEXT,
        adminId: DataTypes.INTEGER
    }, {});

    // This is how you define your title field for model
    Project.titlefield = 'code';

    Project.associate = function (models) {
        Project.belongsTo(models.User, {
            foreignKey: 'adminId',
            onDelete: 'CASCADE',
            as: 'ProjectAdmin'
        })
        Project.belongsToMany(models.User, {
            foreignKey: 'adminId',
            onDelete: 'CASCADE',
            as: 'ProjectUsers',
            through: models.UserProjects
        })
    };
    return Project;
};
```
### vnAtkGetActions
`Class Method`

If defined this method returns various actions doable on records based on condition at vantk-crud frontend.


```javascript

module.exports = (sequelize, DataTypes) => {
    const Project = sequelize.define('Project', {
        // This field is supposed to be titlefield
        code: DataTypes.STRING,
        title: DataTypes.STRING,
        imageUrl: DataTypes.STRING,
        description: DataTypes.TEXT,
        adminId: DataTypes.INTEGER
    }, {});

    // This is how you define your title field for model
    Project.titlefield = 'code';

    Project.associate = function (models) {
        Project.belongsTo(models.User, {
            foreignKey: 'adminId',
            onDelete: 'CASCADE',
            as: 'ProjectAdmin'
        })
        Project.belongsToMany(models.User, {
            foreignKey: 'adminId',
            onDelete: 'CASCADE',
            as: 'ProjectUsers',
            through: models.UserProjects
        })
    };

    Project.vnAtkGetActions = function (models) {
        return [{
            name: "deactivate", // identifier of action
            type: 'single', // type Single, NoRecord, MultiRecord
            where: { // Condition to show action on frontend
                status: 'Active'
            },
            execute: 'deActivate' // Model instance method to be called 
        },
        {
            name: "activate",
            type: 'single',
            where: {
                status: 'InActive'
            },
            execute: 'Activate'
        },
        {
            name: "doSomething",
            type: 'single',
            where: {
                status: 'InActive'
            },
            formschema: { // pass formschema to display a form on action btn click and receive the data in method below
                "name": {
                    "type": "text",
                    "label": "name"
                },
                "password": {
                    "type": "password",
                    "clearable": true,
                    "solo": true,
                    "class": "mx-1 mt-1"
                },
            },
            execute: 'doSomething'
        },
        ];
    };

    Project.prototype.deActivate = async function () {
        this.status = 'InActive'
        return await this.save().then(self => {
            return self;
        });
    };

    Project.prototype.Activate = async function () {
        this.status = 'Active'
        return await this.save().then(self => {
            return self;
        });
    };
    Project.prototype.doSomething = function (formData) {
        console.log(formData);
    };

    return Project;
};
```

Action type can be one of three 

* `Single` - Performable on one record, record will be loaded before executing, on frontend, these action will be displayed at row level. like activate/deactivate etc.
* `NoRecord` - Performable on NO record, Will be executed on non-loaded models, like `vnatk_add` etc
* `MultiRecord` - Under development, DO NOT USE FOR NOW

To study more about formschema please read more at [Vuetify-Form-Base](https://github.com/wotamann/vuetify-form-base)

## Field Specific

Field specific features/properties can be added on field to effect frontend display
### caption
`String`

if specified will show better caption for field like 

```javascript

    .
    .
    .
    isDumped: {
        type: DataType.Boolean,
        caption: 'Dumped Project'
    }
    .
    .
    .

```
### ext
`String`

[Vuetify-Form-Base](https://github.com/wotamann/vuetify-form-base) specific attribute, please read more at Vuetify-Form-base for more.
### ui
`JSON`

VES try to guess best ui information from model, but you can pass the ui property in field itself and VES will just return this without trying to guess best ui header.

```javascript

    .
    .
    .
    isDumped: {
        type: DataType.Boolean,
        ui:{
            type: 'Checkbox',
            text: 'Dumped Project'
        }
    }
    .
    .
    .

```