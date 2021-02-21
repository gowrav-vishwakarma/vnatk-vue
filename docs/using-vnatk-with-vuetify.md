This page shows more power of `VES` (`vnatk-express-sequelize`) and how you can leverage that as API less system for your  queries from frontend.

Considering you have installed `VES` on your server side, you can simply ask for any data without creating APIs for each and every trivial things. Lets just have an exmaple to understand, how you can use VES with vuetify, even not using `vnatk-vue`.

This component code shows how you can use VES `BASE_PATH/crud` api to read anything.

```html
<template>
  <v-toolbar dense>
    <v-combobox
      v-model="selected_customer"
      :items="customers_list"
      :search-input.sync="customer_search_input"
      item-text="title"
      item-value="id"
      hide-details
      clearable
      no-data-text="No Customer Found. Please try again!"
      label="Search Customer Name"
      class="pa-4 mb-4"
    ></v-combobox>
  </v-toolbar>
</template>
<script>
import customer from "../services/customer";

export default {
  name: "CustomerSearch",
  data() {
    return {
      customer_search_input: "",
      customers_list: [],
      selected_customer: null,
    };
  },
  
  watch: {
    //customer search
    customer_search_input: function (newValue) {
      if (!newValue) return;
      var postOptions = {
        model: "User",
        read: {
          modeloptions: {
            attributes: ["mobile", "firstName", "lastName", "id"],
            where: {
              $or: {
                mobile: {
                  $like: "%" + newValue + "%",
                },
                firstName: {
                  $like: "%" + newValue + "%",
                },
                lastName: {
                  $like: "%" + newValue + "%",
                },
              },
            },
            limit: 10,
          },
        },
      };
      customer.post("/admin/vnatk/crud", postOptions).then((response) => {
        this.customers_list = response.data.data.map((i) => {
          i.title = i.firstName + " " + i.lastName + " " + i.mobile;
          return i;
        });
      });
    },
};
</script>
```

Interstingly, here we just created what we want from VES and recived data. also play attention how we just created new property title on fly and used that as `item-text` for `v-combobox`.

Once installed VES, you can use it as alternative to GraphQL for sequlize. To know more about VES please visit [Official Page of Vnatk-Express-Sequelize](https://github.com/gowrav-vishwakarma/vnatk-express-sequelize)