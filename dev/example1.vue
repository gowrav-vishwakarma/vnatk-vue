<template>
  <v-card>
    <v-tabs
      v-model="tab"
      background-color="primary"
      dark
      center-active
      centered
    >
      <v-tab>Price</v-tab>
      <v-tab>Attributes</v-tab>
      <!-- <v-tab>Media</v-tab> -->
      <!-- <v-tab>Product Specification</v-tab> -->
      <!-- <v-tab>Product Review</v-tab> -->
      <!-- <v-tab>Vendor</v-tab> -->
      <!-- <v-tab>Sku Details</v-tab> -->
    </v-tabs>

    <v-tabs-items v-model="tab">
      <v-tab-item>
        <v-card flat>
          <v-card-text>
            <vnatk-crud :options="variations_price_crud_options"> </vnatk-crud>
          </v-card-text>
        </v-card>
      </v-tab-item>
      <v-tab-item>
        <v-card flat>
          <v-card-text>
            <vnatk-crud :options="variations_attribute_crud_options">
            </vnatk-crud>
          </v-card-text>
        </v-card>
      </v-tab-item>

      <!-- 
      <v-tab-item>
        <v-card flat>
          <v-card-text>
            <vnatk-crud :options="variations_media_crud_options"> </vnatk-crud>
          </v-card-text>
        </v-card>
      </v-tab-item>
      <v-tab-item>
        <v-card flat>
          <v-card-text>
            <vnatk-crud
              :options="variations_product_specification_crud_options"
            >
            </vnatk-crud>
          </v-card-text>
        </v-card>
      </v-tab-item>
      <v-tab-item>
        <v-card flat>
          <v-card-text>
            <vnatk-crud :options="variations_product_review_crud_options">
            </vnatk-crud>
          </v-card-text>
        </v-card>
      </v-tab-item>
      <v-tab-item>
        <v-card flat>
          <v-card-text>
            <vnatk-crud :options="variations_sku_details_crud_options">
            </vnatk-crud>
          </v-card-text>
        </v-card>
      </v-tab-item> -->
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
          id: 17391,
          identifier: "Life Go Hand Sanitizer 50 ml x 2",
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
      // attribute tab
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
          autoderef: false,
          modeloptions: {
            include: [
              { model: "Product", attributes: ["identifier"], scope: false },
              {
                model: "AttributeSpecification",
                attributes: ["identifier"],
                scope: false,
              },
            ],
            where: {
              product_id: this.variation.id,
            },
          },
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
                  titlefield: "identifier",
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
            attribute_id: {
              hide: true,
            },
            product_id: {
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
            vnatk_actions: {
              moveto: "last",
            },
          },
        },
      },

      // price Tab
      variations_price_crud_options: {
        service: catalog,
        basepath: "/admin/vnatk",
        model: "ProductPrice",
        create: {
          modeloptions: {
            attributes: [
              "product_id",
              "mrp",
              "dataset_id",
              "salePrice",
              "minQty",
              "maxQty",
              "status",
              "comboQty",
              "unitPrice",
              "commissionValue",
              "commissionAmount",
              "isPercent",
              // "pincode",
              // "stateId",
              // "cityId",
              // "partnerId",
            ],
          },
        },
        retrive: {
          modeloptions: {
            attributes: [
              "mrp",
              "frendyPrice",
              "minQty",
              "maxQty",
              "salePrice",
              "product_id",
              "dataset_id",
              "isPercent",
            ],
            include: [
              {
                model: "Product",
                attributes: ["identifier", "status"],
                scope: false,
              },
              {
                model: "DataSet",
                attributes: ["name"],
                required: false,
              },
            ],
            where: {
              productId: this.variation.id,
            },
          },
          serversidepagination: true,
        },
        update: {
          modeloptions: {
            attributes: [
              "product_id",
              "mrp",
              "dataset_id",
              "salePrice",
              "minQty",
              "maxQty",
              "status",
              "comboQty",
              "unitPrice",
              "commissionValue",
              "commissionAmount",
              "isPercent",
              // "pincode",
              // "stateId",
              // "cityId",
              // "partnerId",
            ],
          },
        },
        actions: true,
        override: {
          actions: [
            {
              name: "vnatk_add",
              formschemaoverrides: {
                dataset_id: {
                  titlefield: "name",
                  serviceoptions: {
                    searchfield: "name",
                  },
                },
                product_id: {
                  disabled: true,
                  titlefield: "identifier",
                  serviceoptions: {
                    searchfield: "identifier",
                    modelscope: false,
                  },
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
              name: "vnatk_edit",
              formschemaoverrides: {
                dataset_id: {
                  titlefield: "name",
                  serviceoptions: {
                    searchfield: "name",
                  },
                },
                product_id: {
                  disabled: true,
                  titlefield: "identifier",
                  serviceoptions: {
                    searchfield: "identifier",
                    modelscope: false,
                  },
                },
                // isPercent: {
                //   "v-false-value": "0",
                // },
              },
            },
          ],
          headers: {
            "Product.identifier": {
              text: "Product",
              value: "Product.identifier",
              moveto: 0,
            },
            "Product.status": {
              text: "Status",
              value: "Product.status",
              moveto: 6,
            },
          },
        },
      },
      // Media tab
      variations_media_crud_options: {
        service: catalog,
        basepath: "/admin/vnatk",
        model: "Media",
        retrive: {
          modeloptions: {
            attributes: ["fileUri", "status"],
          },
          where: {
            productId: this.variation.id,
          },
          serversidepagination: true,
        },
        actions: true,
      },

      // product specification tab
      variations_product_specification_crud_options: {
        service: catalog,
        basepath: "/admin/vnatk",
        model: "ProductSpecification",
        retrive: {
          modeloptions: {
            attributes: ["productId", "value"],
          },
          where: {
            productId: this.variation.id,
          },
          serversidepagination: true,
        },
        actions: true,
      },

      // product Review Tab
      variations_product_review_crud_options: {
        service: catalog,
        basepath: "/admin/vnatk",
        model: "ProductReview",
        retrive: {
          modeloptions: {
            attributes: ["rating", "review", "status"],
          },
          where: {
            productId: this.variation.id,
          },
          serversidepagination: true,
        },
        actions: true,
      },

      // sku datails tab
      variations_sku_details_crud_options: {
        service: catalog,
        basepath: "/admin/vnatk",
        model: "ProductDetailInLanguage",
        retrive: {
          modeloptions: {
            attributes: ["productId", "langId", "name", "description"],
          },
          where: {
            productId: this.variation.id,
          },
          serversidepagination: true,
        },
        actions: true,
      },
    };
  },
};
</script>

