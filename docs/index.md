# vnatk (vue-node agile tool kit)

VNATK is a combination of frontend and backend framework to develop APP seemlessly, based on Vuetify & express-sequelize.
While this documentation is dedicated to VNATK-VUE, The forntend part, you have to check its counter express-sequelize part also to get it work.

Being a developer, I have seen developers repeating same tasks again and again and I really wanted to focus on what business needs. So, here I am with this Framework.

## vnatk-vue (VV)
vnatk-vue is an extention of Vuetify and provides a set of Components to do the heavy lifting of your APP development. In this initial reelase we have mostly focused on CRUD component as this single component boosted our Admin development process. But more components/plugins are under development to get things done really quick.

While this framework provides you some componets, you are still free to ignore this and keep continue with venilla Vuetify anytime.

### Dependencies
The framework has the following dependencies

* `Vue ^2.6.11` 
* `Vuetify ^2.2.11` 
* `axios ^0.21.0` 
* `lodash ^4.17.19` 
* `vue-papa-parse ^2.0.0` 
* `vuetify-form-base ^0.3.2` 


## vnatk-express-sequelize (VES)
[vnatk-express-sequelize]((https://github.com/gowrav-vishwakarma/vnatk-express-sequelize)) is the backend of this framework. This can be installed with any new or existing express-sequelize project and start fuling your things. This was inspired from GraphQL and in many sense can be condidered as its replacement for sequelize projects. Thugh, I have just tested it with MySQL but since its just sequelize in back everything should work out of the box.

Even if vnatk-express-sequelize (VES) installed you can simply ignore this and keep conitnue with your existing API system.

To know more about VES please visit [official vnatk-express-sequelize page](https://github.com/gowrav-vishwakarma/vnatk-express-sequelize)
