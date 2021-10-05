# vnatk-crud

```html
<vnatk-crud 
    :options="crudoptions" 
    @before-action-execute='function1', (action,item) args
    @after-action-execute='function2' (metaData,response.data)
    @on-data-fetch='function3' // data as arguments
    @before-dialog-open='function4' // (action,CurrentItemCopy, OriginalRowItem) args
    @after-dialog-open='function4' // (action,CurrentItemCopy, OriginalRowItem) args
    @before-import='function5' // (data) args
    @after-import='function6' // (data) args
>
<!-- also use slots as per vuetify datatable -->
<!-- You will have following slots for adding your own menu buttons -->
<template v-slot:MenuTopLeftBefore>
<template v-slot:MenuTopLeftAfter>
<template v-slot:MenuTopRightBefore>
<template v-slot:MenuTopRightAfter>
```
## Sample crud option passing

A sample crud option can be as follows

```html
<template>
  <vnatk-crud :options="crudoptions"> </vnatk-crud>
</template>

<script>
import { VnatkCrud } from "vnatk-vue";
import customer from "../services/customer";

export default {
  name: "SampleCRUD",
  components: {
    VnatkCrud,
  },
  data() {
    return {
      crudoptions: {
        service: customer,
        model: "User",
        title: "Users",
      },
    };
  },
};
</script>
```

Crud Options
---

### service
`axios_instance` `[Mandatory]` 

Since VNATK is designed aroung microservices, you can have multiple services to deal with, provide any axios instance as service to do requests by vnatk-crud component.

### basepath
`String` `[Optional]`

- defaults to `"/vnatk"` for your service

But since you may have defined some other route for vnatk like `admin/vnatk` or `api/vnatk`. provide this string to route your vnatk request to proper url for provided service.


### model
`String` `[Mandatory]`

Sequelize Model name to work on with this crud, This model will be considered with its default scope. You can change the scope to deal with further options coming.

### title
`String` `[Optional]`

Provides title of your crud

### quicksearch
`Array/Function/Boolean` `[Optional]`

quicksearch adds a input box at top-right of crud and allws you to search in your data.

* `quicksearch: true` will search in your local crud data. (Client side only.)
* `quicksearch: ['field1', 'field2']` This format will work if your pagination is set to server mode, vnatk-crud will perform a like query on the fields provided with user entered value and results will filter in crud.
* `quicksearch: (usertext)=>{ // do some change in read.modeloptions as per your need }` when given as function you can modify crud options based on usertext and vue reactivity will reload crud with new options.

### create
`Boolean/JSON` `[Optional]` - `default true`

When provided just boolean, you just inform if you want to have a create facility or not.

* `true`: If true, system will add a `add` button and will get all Sequelize Model fields with their relations to have a create form populated. on save it does add record too.
* `false`: If false, system will skip add facility for your crud.
* `json`: When provided a json object you can customize create feature, let's see json object options in detail

#### create.uititle
`String` `[Optional]`

Title of Dialog opened

#### create.modeloptions
`JSON` `[Optional]` - `default {}`

Model options to be passed to Sequelize model.create(__HERE__)

```javascript
crudoptions:{
    service: customer,
    model: 'User'
    create: {
        modeloptions: {
            attributes: ["name", "email", "status", "city_id", "password"],
        },
    }
}
```

#### create.defaultvalues
`JSON/Function` `[Optional]` - `default {}`

Lets say you are showing Users that are employee only so you are using `crudoptions.read.modeloptions.modelscope:'employee'` But when you create a new User, you don't want to add userType in create form but this should go as default value. You can do this by following example

Default value as `String`

```javascript
crudoptions:{
    service: customer,
    model: 'User'
    create: {
        modeloptions: {
            attributes: ["name", "email", "status", "city_id", "password"],
        },
        defaultvalues:{
            userType:'employee'
        }
    }
}
```

Default value as `function`

any default value can be provided by function also to do some logic on your data going to submit and set your default value based on that logic

```javascript
crudoptions:{
    service: customer,
    model: 'User'
    create: {
        modeloptions: {
            attributes: ["name", "email", "status", "city_id", "password"],
        },
        defaultvalues:{
            userType: function(item){
                // your logic here like
                // if email contains company-domain.com return 'employee'
                // else return 'user'
                // A return value is must to have
            }
        }
    }
}
```

### read
`JSON` `[Optional]` - `default {}`

Provides information to vnatk-express-seuelize and vnatk-vue to handle your data. You can customize read options by JSON properties.

#### read.modeloptions
`JSON` `[Optional]` - `default {}`

Options for yous sequelize model, Wiht a few minor modifications, you can almost use any Sequelize model's option here what you can use in `model.findAll` (if not using serversidepagination) or you can use in `model.findAndCountAll`. 

Three things are surely different then those model options are how we define `operators`, `scope` and `sequelize.fn` in our read.modeloptions

* For operator - Use operator alias for operators like in example below 
* For scope - Since you define model with string the main model scope is defined by `crudoptions.read.modelscope` property and for include options in your modeloptions you can define separate `scope` property to be populated at server side.
* For fn - you can pass json object with fn, col and as property to rebuild sequelize.fn at server side

Lets have an exmaple to do it now. Please read all the comments to get more about read.modeloptions

```javascript
read: {
    modeloptions: {
        subQuery:false,
        attributes: [
            "name",
            "email",
            "status",
            "state_id",
            "city_id",
            "mobile",
        ],
        // include: ["City", "State"],  // to get all attributes with including without any further customizing (Same as sequelize docs)
        include: [
            {
                model: "City",
                attributes: ["name", "status"], // get only these attributes (Same as sequelize docs)
                required: false, // To have OUTER LEFT JOIN instead INNER JOIN (Same as sequelize docs)
                scope: false, // or text (since we define Models as string, scope can be passed as property here) (VNATK-SPECIFIC )
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
}
```

#### read.modelscope
`Boolean/String` `[Optional]` - `undefined`

Remember this option effects main model defined in crudoptions while individual scopes in include are just with scope property

* `undefined or not defined`: If not defined, the VES will apply defaultscope like what would sequelize do.
* `false`: set this value to false, model at the server end will be unscoped.
* `String`: if set as any string, system will load the scope by defined name, if not found at server model, system will throw an error.

#### read.autoderef
`Boolean` `[Optional]` - `default true`

VNATK finds relations at server side with sequelize models and solves relations to get de-referenced data here. Liek if user belongsTo City, autderef will also return you the city name by including this attribute by default and also shows in crud. You have total control over this also how to display what, that will come in later options.

But if you want to skip it doing all de-ref for you, just set it false.
remember setting this false will also result in all Autocomplete etc not working automatically.

#### read.serversidepagination
`Boolean` `[Optional]` - `default false`

The default behaviour is to get all data and do the pagination at client side, but if the data is big or you want serverside pagination, just set this option to true. rest limit, page number etc will be taken care of. 
For better understanding please see `datatableoptions` exmaple.

#### read.datatableoptions
`JSON` `[Optional]` - `default from v-data-table`

This is synced option with v-data-table options, so you can use the same options here what you use for v-data-table like

```javascript
    serversidepagination: true,
    datatableoptions: {
        page: number,
        itemsPerPage: number,
        sortBy: string[],
        sortDesc: boolean[],
        groupBy: string[],
        groupDesc: boolean[],
        multiSort: boolean,
        mustSort: boolean
    },
```

### update
`Boolean/JSON` `[Optional]` - `default true`

if set to false, Editing option will be unavailable for the crud.
if provided with JSON object, you can customize Editing feature.

* TO edit any field, you must have that in your read.modeloptions.attributes or the system will throw error

#### update.uititle
`String` `[Optional]`

Title of Editing Window

#### update.modeloptions

Mostly used to define what fields you want to edit, rest options will be just passed to your sequelize model.

```javascript
update: {
    uititle: "Edit User - {name}",
    modeloptions: {
    attributes: [
        "name",
        "email",
        "status",
        "city_id", // If autoderef is true, these relations will be converted to autocomplete automatically
        "state_id",
        "mobile",
    ],
    },
},
```

### delete
`Boolean` `[Optional]` - `default true`

If set to false, system will remove deleting facility from crud.

### action
`Boolean` `[Optional]` - `default true`

If set to true, VES (vue-express-sequelize) will send all doable actions and the related actions will be visible in CRUD.
To skip having actions fetched set this value to `false`.

To read about how you can define actions from sequelize model, Please see [Sequelize Model Features](/sequelize-model-features)

### ui
`JSON` `[Optional]` - `default undefiend`
defines options for crud, like default action placement place and headers for v-data-table

#### ui.defaultActionPlacement
`String[DropDown/buttonGroup]` `[Optional]` - `default DropDown`

Where by default you want your actions to be placed in crud, DropwDown will add them in menu at the end of Row, buttonGroup will add actions in buttons in action column. 

#### ui.headers
`Array of Objects` `[Optional]` - `default undefined`

Vantk-crud retrives all headers from sequelize itself, You can even override headers by other options, but many times overriding will be more work to do if you need to show only 2 columns and to hide rest 15 columns, just replace headers coming from server by defining here

```javascript
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
```

#### ui.datatableoptions
`Object` `[Optional]` - `default {datatable options}`

#### ui.datatableoptions.paginator
`Object` `[Optional]` - `default { totalPageVisible: 5, itemsPerPageOptions: [2, 5, 10, 50 - 1]}`

```javascript
{
    read:{},
    ...
    ui:{
        datatableoptions: {
            paginator: {
                totalPageVisible: 5,
                itemsPerPageOptions: [2, 5, 10, 50 - 1],
            },
          },
    }
}
```

set `paginator: false` for default pagination


### override
`JSON` `[Optional]` - `default undefined`

you can always override actions and headers to customize your own need. You just have to override only actions/headers that you want to modify.

### override.actions
`Array of Objects`

define what actions you want to override, each object in this array must have a `name` property to identify which action to override and rest properties shows what to override.

vnatk has a few predefined reserved action names

* vnatk_add
* vnatk_edit
* vnatk_delete

    __To create forms at runtime fromsequelize model details VNATK is using [Vuetify-Form-Base](https://github.com/wotamann/vuetify-form-base) a great plugin to convert your json as beautiful vuetify forms. It will always be a great help to study that also.__

Lets have an complete example and then go each option one by one. Please read comments for better unerstaing in the examples

```javascript
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
            // default titlefield is considered as name or as defined in sequelize model
            titlefield: "City.name", // autocomplete text field from recived data
            label: "Your City",
            serviceoptions: {
                service: customer, // To have data from other service then default service defined for crud
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
    // Override individual field ...
    {
        name: "vnatk_add", // add action is given specially this name
        // use this to merge formschema options
        formschemaoverrides: {
        city_id: {
            label: "Your City ... ",
        },
        },
    },

    // OR override completely with new form and handle it via import way

    {
        name: "vnatk_add",
        formschema: {
        identifier: {
            type: "text",
            label: "Your Identifier",
        },
        name_in_eng: {
            type: "text",
            label: "Name in Eng",
        },
        vendor: {
            lable: "VendorList",
            type: "autocomplete",
            searchInput: "",

            serviceoptions: {
                service: catalog,
                basepath: "/admin/vnatk",
                model: "Vendor",
                modelattributes: ["id", "first_name", "company"],
                searchfield: ["company", "first_name"], // autocomplete search q for like in the field
                limit: 10,
                titlefield: function (o) {
                    return o.company + " of Mr. " + o.first_name;
                },
            },
        },
        },
        handleviaimport: true,
        rowformatter: function (formData) {
        formData.createdById = 1;
        return formData;
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
}
```
#### override.actions[].name
`String` `[Mandatory]`

Used to identify whcih action to override

#### override.actions[].placeIn
`String[buttonGroup/DropDown]` `[Optional]` - `default DropDown`

where you want to place the action, in dropdown menu at the end of row or in buttonGroup.

#### override.actions[].formschemaoverrides
`JSON` `[Optional]`

VES, sends actions and their schema well defined from server, but many times you want to override its scham at client side based on need.
you can override each field's schema by defineing field_id as key and JSON schema to be overrided as value. 

Remember, only values that you override will be overrided and rest values will be taken as recieved from server.

please see override.actions for complete example.

### override.headers
`JSON` `[Optional]`

VES sends all related headrs via initial server call, still you need to hide/add extra header through this options
Lets have a full exmaple of override.headers option, please read the comments for better understanding

VES also sends one header valued `vnatk_actions` to render all actions in it, you can override that too.

```javascript
override: {
          actions: [
            ...
          ],
          headers: {
              /*
                field:{
                    option: value
                }
              */
            city_id: {
              hide: true, // vnatk specific property to hide a column in v-data-table
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
```


### import 
`JSON` `[Optional]` - `default undefined`

If defined as JSON, your crud will have an import button at top to import data. Data will previewed first and when proceeded, sent to VES for importing into defined model at root option. Also you can restructure data as seqlize relations and all deep data create with all relations will be done at server.

Lets have an complete example and then understand each option.

If using import don't forget to use vue-papa-parse to use either on your component or globally on Vue instance

```javascript
<script>

import Vue from "vue";
import VuePapaParse from "vue-papa-parse";
Vue.use(VuePapaParse);

.
.
.
crudoptions:{
    .
    .
    ,
    import: {
        service: catalog,
        basepath: "/admin/vnatk",
        model: "User",
        execute: "vnatk_import", // or any other funtion you want to pass this data to in your model
        autoimport: true, // ignores execute options and just try to bulk create from given data by default vnatk action
        transaction: "file", // defaults to 'file' / or 'row'. In 'file' mode, data will rollback for all rows in case of error in any row, in 'row' mode, rows that are not imported are only rolled back and errored rows are reported back on import dialog.
        rowformatter: function (item) {
            // return false on any condition to skip this particular row.
            if(item.name=='') return false;
            
            item.$vnatk_data_handle = "alwaysCreate"; // 'alwaysCreate' [default], 'findOrCreate','findAndUpdateOrCreate', (For Associations, two more options) 'findToAssociate' [Produce error if not found],'associateIfFound' [Ignores if not found]
            item.$vnatk_find_options = {}; // if not provided, finding will be based on all fields and values defined above, used for where condition on model
            item.$vnatk_cache_records = true; // default to true, set false to find each time even if same condition is already found previously
            item.$vnatk_update_data = {}; // update only fields and their values defined here (if found), if this option is not provided, all fields defined above will be updated.

            item.City = {
                //Data to create or Update (if not defined vnatk_update_data)
                name: item.city_name,
                status: item.city_status,

                $vnatk_data_handle: "alwaysCreate", // 'alwaysCreate' [default], 'findOrCreate','findAndUpdateOrCreate',(For Associations, two more options) 'findToAssociate' [Produce error if not found],'associateIfFound' [Ignores if not found]
                $vnatk_find_options: {
                modeloptions: {
                    where:{} // if required
                },
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
}
```

#### import.service
`axios_instance` `[Optional]` - `default to root service`

if not defined, vnatk will use root service

#### import.basepath
`String` `[Optional]` - `defaults to root basepath`

- defaults to crudoptions basepath

#### import.model
`String` `[Optional]` - `defaults to root model`

Sequelize Model name to import into.


#### import.execute
`String` `[Optional]`

Specify which model class method is to be called to handle the data at server side

#### import.autoimport
`Boolean` `[Optional]` - `default false`

If set to true, import.execute value is ignored and VES will try to import all data by itself, remember, you can always set data in Sequelize data structure and VES will import all nested data with maintaining all relations.

#### import.transaction
`String[file/row]` `[Optional]` - `default file`

How you want to handle import transaction, By default, on any error, no data will be imported and everything will be rollbacked, but if specified `row`, Importer will do every row in different transaction and on error in any row, only that row will be rolled back.

#### import.rowformatter
`function` `[Optional]` - `default undefined`

if defined, importer will map all rows to this function and returned value of this function will be used for that row instead. This way, you can define arrange data from flat csv/excel data to Strcutured data.

For example please see `import` options.

rowformatter allowes you to add $vnatk_ properties in root iyem as well as all nested data, next section describes what are those $vnatk_ handlers for import.

#### import.errorhandler
`function` `[Optional]` - `default undefined`

VV try to manage coming errors well, but in case you want to handle errors by your won, you can create this property

Returned `String` will be shown at the top of import preview page.

```javascript
import: {
          autoimport: true,
          rowformatter: function (item) {
            // set default values in importer
            item.userType = "employee";
            return item;
          },
          errorhandler: function (err) {
            return err.response.data.Exception.errors
              .map((e) => e.message)
              .join("<br/>");
          },
        },
```


#### $vantk_ handlers explained
You can add the following $vnatk_ properties in importing row items (at root level as well as nested level)

This will guide VES how you want to treat a particular relation or row.

* `$vnatk_data_handle` : This property has following options to be passed as string values
    * `alwaysCreate`: with this option, importer will always insert data in table
    * `findOrCreate`: with this option, importer will try to find record in table based on all fields values, if found no data will be inserted. For relations (Nested belongsTo, belongsTomany) founded Id will be used to make relations. if you have another criteria to search not by all fields, you can set `$vnatk_find_options`
    * `findAndUpdateOrCreate`: with this option, importer will find (Either by all fields or as per `$vnatk_find_options` if defined) and if found, values for item will be updated. If not found the record will be instered. For relations, if not created, founded record primary key will be used to set relations as per data.
    * `findToAssociate`: with this option, importer will find record by all fields or as per `$vnatk_find_options` if defined. If found record will be used to associate, like importing users and associating them with existing City. But if not found, this throws error.
    * `associateIfFound`: with this option, importer will try to find record by all fields or as per `$vnatk_find_options` if defined. If found record will be used to associate, like importing users and associating them with existing Group. But if not found, importer will simply skip association.
* `$vnatk_find_options` : This property has following options to be passed as string values.
    If defined, this option guides importer to find a record. If not defined system will find by all items. ike, if you want to find a City, if not found want to create it with status Active. What if the City is already in database but deactivated, you don;t want to find by name and status.
    * `modelscope`: `false` to unscope model before finding, or `String` to set scope for model.
    * `modeloptions`: `JSON`, provides `where` condition for find. This only allows you to define where condition, attributes or include are not permitted here.
 
#### import.success
`function|callback` `[Optional]` - `default undefined`

If defined, once importer is finished with importing, this function will be called by passing response data from VES API.


## Crud Events

`vnatk-crud` extends `v-data-table` from Vuetify, Hence, all attributes and events on v-data-table should work here too. In addition to this vnatk-crud emits two events.

### before-action-execute

This event emits just before any action is about to execute passing two parameters `action` object and `item` object.

```javascript
<vnatk-crud 
    :options="crudoptions" 
    @before-action-execute='function1', 
>
.
.
.

<script>
export default {
    .
    .
    .
    methods: {
        function1(action, item){
            // DO YOUR STUFF HERE
        }
    }
}
</script>
```

### after-action-execute

This event emits when responce is recieved and success callbacl is called. This event passes two parameters to handler function `metaData` object (payload that was sent for this event) and `responseData` (received response data) object.

```javascript
<vnatk-crud 
    :options="crudoptions" 
    @after-action-execute='function2', 
>
.
.
.

<script>
export default {
    .
    .
    .
    methods: {
        function2(metaData, responseData){
            // DO YOUR STUFF HERE
        }
    }
}
</script>
```