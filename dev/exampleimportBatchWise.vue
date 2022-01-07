<template>
  <div class="home">
    <vnatk-crud :options="crudoptions" :key="crudkey"> </vnatk-crud>
  </div>
</template>

<script>
// @ is an alias to /src
import { VnatkCrud } from "@/entry";
import catalog from "./services/catalog";
import wms from "./services/wms";
import _ from "lodash";

import Vue from "vue";
import VuePapaParse from "vue-papa-parse";
Vue.use(VuePapaParse);

export default {
  name: "Home",
  components: { VnatkCrud },
  data() {
    return {
      crudkey: 1,
      hubList: null,
    };
  },
  computed: {
    crudoptions() {
      let prodCondn = {
        isDefinition: true,
      };
      let vendorCondn = {};
      let catCondn = {};
      let self = this.hubList;
      return {
        service: catalog,
        basepath: "/admin/vnatk",
        model: "Product",
        quicksearch: ["identifier"],
        order: [["createdAt", "DESC"]],
        read: {
          modeloptions: {
            attributes: [
              "id",
              "imageAbsolutePath",
              "identifier",
              "status",
              "sku",
              "shippingMethod",
              "isDeliverable",
              "status",
            ],
            include: [
              {
                model: "Category",
                attributes: ["identifier"],
                where: catCondn,
              },
              {
                model: "ProductVendor",
                as: "ProductVendorsAssociation",
                attributes: ["productId"],
                where: vendorCondn,
              },
            ],
            where: prodCondn,
            scope: false,
          },

          serversidepagination: true,
        },
        create: false,
        update: {
          modeloptions: {
            attributes: ["id", "identifier", "isDeliverable"],
          },
        },
        delete: false,
        actions: true,
        override: {
          headers: {
            id: {
              text: "ID",
              value: "id",
              moveto: 0,
            },
            "Category.identifier": {
              text: "Category",
              value: "Category.identifier",
              moveto: 3,
            },
          },
          actions: [
            {
              name: "create Variation",
              execute: this.productVariationAdd,
              isClientAction: true,
              type: "single",
              formschema: {
                identifier: {
                  type: "select",
                  label: "select Identifier",
                  items: this.productList,
                },
              },
            },
            {
              name: "vnatk_edit",
              formschemaoverrides: {
                id: {
                  disabled: true,
                },
              },
            },
          ],
        },
        // transaction: "row",
        //new create
        import: {
          batchSize: 1,
          rowformatter: function (item) {
            if (!item.sku) return false;

            item.$vnatk_data_handle = "findAndUpdateOrCreate";
            //item.isDefinition = true;
            console.log("------------------------------", item);
            item.$vnatk_find_options = {
              modeloptions: {
                //identifier: item.identifier,
                sku: item.sku,
                // isDefinition: item.isDefinition,
              },
              modelscope: false,
            };

            //if (item.isDefinition == 0) {
            // this is not definition, attach with proper definetion
            // item.ProductDefinition = {
            //   $vnatk_data_handle: "findToAssociate",
            //   $vnatk_find_options: {
            //     modeloptions: {
            //       identifier: item.identifier,
            //       // sku:item.sku,
            //       isDefinition: 1,
            //     },
            //     modelscope: false,
            //   },
            // };
            //  }

            if (!item.sku) {
              item.sku = nanoid(10);
            }

            item.Attributes = [];
            item.ProductSpecifications = [];

            for (const [field, value] of Object.entries(item)) {
              if (field.includes("attribute_")) {
                let attrib = field.replace("attribute_", "");
                console.log("checking attrib ", attrib);
                let t = {
                  $vnatk_data_handle: "findAndUpdateOrCreate",
                  value: value,
                  AttributeSpecification: {
                    $vnatk_data_handle: "findToAssociate",
                    $vnatk_find_options: {
                      modeloptions: {
                        identifier: attrib,
                      },
                      modelscope: false,
                    },
                  },
                  $vnatk_find_options: {
                    modeloptions: {
                      product_id: true,
                    },
                    modelscope: false,
                  },
                };
                item.Attributes.push(t);

                //ProductSpecification
                let t1 = {
                  $vnatk_data_handle: "findAndUpdateOrCreate",
                  value: attrib,
                  AttributeSpecification: {
                    $vnatk_data_handle: "findToAssociate",
                    $vnatk_find_options: {
                      modeloptions: {
                        identifier: attrib,
                      },
                      modelscope: false,
                    },
                  },
                  $vnatk_find_options: {
                    modeloptions: {
                      product_id: true,
                    },
                    modelscope: false,
                  },
                };
                item.ProductSpecifications.push(t1);
              }
            }
            if (!item.hsn) delete item.hsn;
            if (!item.isbn) delete item.isbn;
            if (item.brand) {
              item.Brand = {
                $vnatk_data_handle: "findToAssociate",
                $vnatk_find_options: {
                  modeloptions: {
                    name: item.brand,
                  },
                  modelscope: false,
                },
              };
            }
            delete item.brand;
            if (!item.weight) delete item.weight;
            if (!item.height) delete item.height;
            if (!item.length) delete item.length;
            if (!item.width) delete item.width;
            if (!item.depth) delete item.depth;
            if (item.tax_rule) {
              item.TaxationRule = {
                $vnatk_data_handle: "findOrCreate",
                name: item.tax_rule,
                $vnatk_find_options: {
                  modeloptions: {
                    name: item.tax_rule,
                  },
                  modelscope: false,
                },
              };
            }
            delete item.tax_rule;
            if (item.cod_available) item.codAvailable = item.cod_available;
            delete item.cod_available;
            if (item.shipping_method)
              item.shippingMethod = item.shipping_method;
            delete item.shipping_method;
            if (item.expiry_date) item.expiryDate = item.expiry_date;
            delete item.expiry_date;
            // if (!item.status) delete item.status;
            if (item.return_policy) {
              item.ReturnPolicy = {
                $vnatk_data_handle: "findOrCreate",
                name: item.return_policy,
                $vnatk_find_options: {
                  modeloptions: {
                    name: item.return_policy,
                  },
                  modelscope: false,
                },
              };
            }
            if (item.expected_logistic_price)
              item.expectedLogisticPrice = item.expected_logistic_price;
            delete item.expected_logistic_price;

            item.ProductVendors = [];
            let tempVendor = {};
            for (const [field, value] of Object.entries(item)) {
              console.log("lopp value", value);
              if (field.includes("vendor_")) {
                let fieldArry = field.split("_");
                console.log("111", tempVendor[fieldArry[1]]);
                if (tempVendor[fieldArry[1]] != undefined) {
                  continue;
                }
                if (item["vendor_" + fieldArry[1] + "_vendor_name"]) {
                  let t = {
                    vendorSku: item["vendor_" + fieldArry[1] + "_vendor_sku"],
                    vendorPrice:
                      item["vendor_" + fieldArry[1] + "_vendor_price"],
                    warehouse: fieldArry[1],
                    Vendor: {
                      $vnatk_data_handle: "findToAssociate",
                      $vnatk_find_options: {
                        modeloptions: {
                          company:
                            item["vendor_" + fieldArry[1] + "_vendor_name"],
                        },
                        modelscope: false,
                      },
                    },
                  };
                  tempVendor[fieldArry[1]] = t;
                  item.ProductVendors.push(t);
                }
              }
            }

            item.ProductDetailInLanguages = [];
            //EN
            if (item.lang_En_name) {
              let t = {
                $vnatk_data_handle: "findAndUpdateOrCreate",
                name: item.lang_En_name,
                description: item.lang_En_description,
                shortDesc: item.lang_En_short_desc,
                Lang: {
                  $vnatk_data_handle: "findToAssociate",
                  $vnatk_find_options: {
                    modeloptions: {
                      iso_code: "En",
                      // name: item.lang_En_name,
                    },
                    modelscope: false,
                  },
                },
                $vnatk_find_options: {
                  modeloptions: {
                    lang_id: true,
                  },
                },
              };
              item.ProductDetailInLanguages.push(t);
            }
            //Hi
            if (item.lang_Hi_name) {
              let t = {
                $vnatk_data_handle: "findAndUpdateOrCreate",
                name: item.lang_Hi_name,
                description: item.lang_Hi_description,
                shortDesc: item.lang_Hi_short_desc,
                Lang: {
                  $vnatk_data_handle: "findToAssociate",
                  $vnatk_find_options: {
                    modeloptions: {
                      iso_code: "Hi",
                    },
                    modelscope: false,
                  },
                },
                $vnatk_find_options: {
                  modeloptions: {
                    lang_id: true,
                  },
                },
              };
              item.ProductDetailInLanguages.push(t);
            }
            //Guj
            if (item.lang_Guj_name) {
              let t = {
                $vnatk_data_handle: "findAndUpdateOrCreate",
                name: item.lang_Guj_name,
                description: item.lang_Guj_description,
                shortDesc: item.lang_Guj_short_desc,
                Lang: {
                  $vnatk_data_handle: "findToAssociate",
                  $vnatk_find_options: {
                    modeloptions: {
                      iso_code: "Guj",
                    },
                    modelscope: false,
                  },
                },
                $vnatk_find_options: {
                  modeloptions: {
                    lang_id: true,
                  },
                },
              };
              item.ProductDetailInLanguages.push(t);
            }

            item.ProductPrices = [];
            //if (item.price_mrp) {
            let tempPrice = {};
            for (const [field, value] of Object.entries(item)) {
              console.log("321321", value);
              if (field.includes("price_")) {
                let fieldArry = field.split("_");
                if (tempPrice[fieldArry[1]] != undefined) {
                  continue;
                }
                let commAmount =
                  item["price_" + fieldArry[1] + "_commission_value"];
                if (item["price_" + fieldArry[1] + "is_percent"] == 1) {
                  commAmount =
                    (item["price_" + fieldArry[1] + "_frendy_price"] *
                      item["price_" + fieldArry[1] + "_commission_value"]) /
                    100;
                }
                let t = {
                  $vnatk_data_handle: "findAndUpdateOrCreate",
                  $vnatk_find_options: {
                    modeloptions: {
                      warehouse: fieldArry[1],
                    },
                    modelscope: false,
                  },
                  // product price defination id is comming from before save hook

                  frendyPrice: item["price_" + fieldArry[1] + "_frendy_price"],
                  unitPrice: item["price_" + fieldArry[1] + "_frendy_price"],
                  minQty: item["price_" + fieldArry[1] + "_min_qty"],
                  maxQty: item["price_" + fieldArry[1] + "_max_qty"],
                  mrp: item.price_mrp,
                  warehouse: fieldArry[1],
                  commissionValue:
                    item["price_" + fieldArry[1] + "_commission_value"],
                  isPercent: item["price_" + fieldArry[1] + "is_percent"],
                  commissionAmount: commAmount,
                };
                tempPrice[fieldArry[1]] = t;
                if (item["price_" + fieldArry[1] + "_frendy_price"]) {
                  let currenPricetWarehouse = _.find(self, function (obj) {
                    if (obj.code == fieldArry[1]) {
                      return true;
                    }
                  });
                  t["warehouseId"] = currenPricetWarehouse.id;
                  item.ProductPrices.push(t);
                }
              }
            }

            //}
            item.Categories = [];
            if (item.category) {
              let t = {
                $vnatk_data_handle: "findOrCreate",
                isPrimary: 1,
                createdById: 1,
                Category: {
                  $vnatk_data_handle: "findToAssociate",
                  $vnatk_find_options: {
                    modeloptions: {
                      code: item.primary_category,
                    },
                    modelscope: false,
                  },
                },
                $vnatk_find_options: {
                  modeloptions: {
                    category_id: true,
                    product_id: true,
                  },
                },
              };
              item.Categories.push(t);
            }

            item.ProductImages = [];
            if (item.images) {
              console.log("image for storing");
              let imgs = item.images.split(",");
              for (let index = 0; index < imgs.length; index++) {
                const img = imgs[index];
                let t = {
                  fileUri: img,
                  mimeType: "jpg",
                };
                item.ProductImages.push(t);
              }
              // item.image = imgs[0];
            } else {
              console.log("image not storing");
              delete item.images;
            }
            // if (item.isDefinition == 1) {
            // item.Variations = [];
            // let vrt = JSON.parse(JSON.stringify(item));
            // vrt.$vnatk_find_options = {
            //   modeloptions: {
            //     identifier: vrt.identifier,
            //     isDefinition: 0,
            //   },
            //   modelscope: false,
            // };

            // vrt.isDefinition = 0;
            // vrt.ProductDefinition = {
            //   $vnatk_data_handle: "findToAssociate",
            //   $vnatk_find_options: {
            //     modeloptions: {
            //       identifier: vrt.identifier,
            //       isDefinition: 1,
            //     },
            //     modelscope: false,
            //   },
            // };

            // item.Variations.push(vrt);
            // }
            return item;
          },
        },
      };
    },
  },
  methods: {
    clientFunctionCallBack(formData) {
      console.log(formData);
    },
    reloadPage(response) {
      alert("Import successful");
      this.crudkey = this.crudkey + 1;
      // window.location.reload();
    },
    uploadToAWS(e, files) {
      console.log(e, files);
    },
    async getHubList() {
      var postOptions = {
        model: "User",
        read: {
          modeloptions: {
            attributes: ["id", "code", "userType"],
            where: {
              userType: "warehouse",
            },
          },
        },
      };
      await wms.post("/admin/vnatk/crud", postOptions).then((response) => {
        this.hubList = response.data.data;
        console.log("123456789", this.hubList);
      });
    },
  },
  async mounted() {
    await this.getHubList();
  },
};
</script>
