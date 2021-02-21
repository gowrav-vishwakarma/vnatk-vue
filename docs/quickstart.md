# QuickStart

## Pre-requisite

### Setup vnatk-express-sequelize

While there is separate documentation of this project, we will cover basics here to get your minimum setup done.

Just add the vnatk-express-sequelize in your existing express-sequelize project

```bash
#install our dependencies now
$yourProjectRoot/server> npm install --save bcrypt body-parser cookie-parser express-handlebars jsonwebtoken morgan cors dotenv lodash mysql2 sequelize vnatk-express-sequelize
```
it is must have sequelize setup done through 

```bash
#install sequelize cli for easy sequlize setup
$yourProjectRoot/server> npm install --save-dev sequelize-cli
$yourProjectRoot/server> sequelize init
```

### Setup routes

Please add the following code in your `app.js` file. (DON'T COPY PASTE WHOLE CODE, ITS NOT FULL FILE CODE) 

`app.js`
```javascript
// somewhere on the top after 
// var express = require('express'); <= after this line
var cors = require('cors');
const bodyParser = require('body-parser');
const vnatk = require('vnatk-express-sequelize');
...
...
// You can already have body-parser added, no need to add again
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true }));

// add cors is a good way and mostly you might need this also
app.use(cors()); // Use this after the variable declaration

var VnatkRouter = require('./routes/vnatk.js');
app.use('/vnatk', VnatkRouter); // '/vnatk' is called basepath here

```

Now create a new file to export Vnatk Routes
`routes/vnatk.js`

```javascript
var express = require('express');
var router = express.Router();
const vnatk = require('vnatk-express-sequelize');

// Optional to use some auth middleware on this route

//router.use(require('./middleware/adminTokenChecker'));

const Models = require('../../models');
module.exports = vnatk({ 
    Models: Models,
    router: router
});

```
That's it, create your sequelize models and start using VES as alternative to GraphQL.

    There are some additional features you can use in Sequelize model if you are just not using it as API but also using this vnatk-vue. For those please ffollow coming up session.

## Vnatk-Vue Installation

Assuming you have setup your VES (vnatk-express-sequelize) already on server side, please follow the steps below. Steps define setting up a project from scratch, feel free to skip initial steps if you want VV in your existing project.

```bash
# just be sure you are in root of your project
$yourProjectRoot> ls
server

#install vue-cli globally if not installed 
$yourProjectRoot> npm install -g @vue/cli
$yourProjectRoot> vue create client
#follow wizard, I preferred default for beginners

$yourProjectRoot> ls
client  server

$yourProjectRoot> cd client
$yourProjectRoot/client> vue add vuetify
# I prefer defaults for now

#to make better use of views etc just add router
$yourProjectRoot/client> vue add router

$yourProjectRoot/client> npm install --save material-design-icons-iconfont axios lodash vuetify-form-base vue-papa-parse vnatk-vue
```

## Setup project for vnatk

### APP/Vuetify setup

We are all set to use our system with defined model as in Back

First we need to update ```plugins/vuetify.js``` file as per given code

```javascript
import Vue from 'vue';
import 'material-design-icons-iconfont/dist/material-design-icons.css'
import 'vuetify/dist/vuetify.min.css'
import Vuetify from "vuetify";

Vue.use(Vuetify, {
    iconfont: 'md',
});

export default new Vuetify({
});
```

Also the default setup does not usage ```v-app``` from vuetify but just a div in ```src/App.vue```. Lets edit that file also like following

```vue
<template>
<!-- this below v-app was div in starting -->
  <v-app id="app"> 
    <div id="nav">
      <router-link to="/">Home</router-link> |
      <router-link to="/about">About</router-link>
    </div>
    <router-view />
  </v-app>
</template>

```
### axios-services setup

To connect our service/server let's create a folder ```services``` in your project ```src``` folder. Considering server/service we created in express setup above, is for customers. Create a file ```customer.js``` in services folder and place the following code there

```js
import axios from "axios";

const api = axios.create({
  baseURL: process.env.VUE_APP_BASE_URL_CUSTOMER || "http://localhost:3000"
});

export default api;
```

## Your first CRUD

Our system is ready to rock, now we will just create ```models``` and ```methods``` in Sequlize at server side and ```views/page``` in Vue Frontend, The rest logic is well done by itself.

for now open ```views/Home.vue``` file (You will only get this file if you have done `vue add router`, otherwise, please find suitable file for you) and place the following content to see the magic

```vue
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

And your crud will be there with all avilable other actions also like the image below

Notice city_id and state_id is automatically de-refenced to have their respective names from associations and all defined actions are available in drop down menu of each row. For more about additional features for seuelize models for vnatk-vue, please refer [Sequelize Model Features](/sequelize-model-features)

By default system assumes ```name``` as title field that is shown instead of ID, but do not worry if you don't follow these notations, everything is customizable.

![alt text](img/grid_image.png "Logo Title Text 1")

This is how edit form and functionality is created.

![alt text](img/edit_action.png "Logo Title Text 1")