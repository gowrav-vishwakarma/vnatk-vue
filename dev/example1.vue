<template>
  <v-card>
    <v-tabs
      v-model="tab"
      background-color="primary"
      dark
      center-active
      centered
    >
      <v-tab>Attributes</v-tab>
      <v-tab>Price</v-tab>
      <v-tab>Media</v-tab>
      <v-tab>Product Specification</v-tab>
      <v-tab>Product Review</v-tab>
      <v-tab>Vendor</v-tab>
      <v-tab>Sku Details</v-tab>
    </v-tabs>

    <v-tabs-items v-model="tab">
      <v-tab-item>
        <v-card flat>
          <v-card-text>
            <vnatk-crud :options="variations_attribute_crud_options">
            </vnatk-crud>
          </v-card-text>
        </v-card>
      </v-tab-item>
    </v-tabs-items>
  </v-card>
</template>
<script>
import { VnatkCrud } from "@/entry";
import catalog from "./services/customer";

export default {
  props: {
    variation: {
      type: Object,
      default: function () {
        return {
          id: 4,
          identifier: "Godrej Expert Rich Creame Dark Brown 20 gm + 20 ml",
        };
      },
    },
  },
  components: {
    VnatkCrud,
  },
  data() {
    return {
      tab: null,
      variations_attribute_crud_options: {
        service: catalog,
        basepath: "/admin/vnatk",
        model: "ProductAttributeValue",
        create: {
          modeloptions: {
            attributes: ["attribute_id", "value", "product_id"],
          },
        },
        retrive: {
          autoderef: true,
          modeloptions: {
            include: [
              { model: "Product", attributes: ["identifier"] },
              { model: "AttributeSpecification", attributes: ["identifier"] },
            ],
          },
          where: {
            product_id: this.variation.id,
          },
          limit: 4,
        },
        update: {
          modeloptions: {
            attributes: ["attribute_id", "value", "product_id"],
          },
        },
        serversidepagination: true,
        actions: true,
        override: {
          actions: [
            {
              name: "vnatk_add", // edit action is given specially this name
              // use this to merge formschema options
              formschemaoverrides: {
                attribute_id: {
                  serviceoptions: {
                    searchfield: "identifier",
                  },
                },
                product_id: {
                  disabled: true,
                  items: [
                    {
                      text: this.variation.identifier,
                      value: this.variation.id,
                    },
                  ],
                  defaultValue: this.variation.id,
                },
              },
            },
            {
              name: "vnatk_edit", // edit action is given specially this name
              // use this to merge formschema options
              formschemaoverrides: {
                attribute_id: {
                  titlefield: "identifier",
                  serviceoptions: {
                    searchfield: "identifier",
                  },
                },
                product_id: {
                  disabled: true,
                  titlefield: "identifier",
                  serviceoptions: {
                    searchfield: "identifier",
                  },
                },
              },
            },
          ],
          headers: {
            attributeId: {
              hide: true,
            },
            productId: {
              hide: true,
            },
            "Product.name": {
              text: "Product",
              value: "Product.identifier",
            },
            "AttributeSpecification.name": {
              text: "Attribute",
              value: "AttributeSpecification.identifier",
            },
          },
        },
      },
    };
  },
};
</script>

