<template>
  <div class="home">
    <vnatk-crud
      :options="crudoptions"
      @before-action-execute="checkFileUpload"
      :single-expand="singleExpand"
      :expanded.sync="expanded"
      show-expand
      @update:expanded="expandedFunc"
    >
      <template v-slot:[`item.identifier`]="{ item }">
        {{ item.identifier }}<br />
        <small class="text--disabled" v-if="item.ParentCategory"
          >({{ item.ParentCategory.identifier }})</small
        >
      </template>
      <template v-slot:[`item.thumbnailImageAbsolutePath`]="{ item }">
        <img :src="item.thumbnailImageAbsolutePath" style="max-width: 50px" />
      </template>
      <template v-slot:expanded-item="{ headers, item }">
        <td :colspan="headers.length">
          More info about {{ item.identifier }}
          <vnatk-crud
            :options="categoryDetail_crudoptions"
            :key="item.data_set_id"
          >
            <template v-slot:item.thumbnailImageAbsolutePath="{ item }">
              <img
                style="max-width: 60px; max-length: 60px"
                :src="item.thumbnailImageAbsolutePath"
              />
            </template>
            <template v-slot:item.vnatk_actions="{ item }">
              <v-card>
                <v-dialog
                  v-model="category_details_dialog"
                  :overlay="false"
                  transition="dialog-transition"
                >
                  <product-variation-details
                    :variation="selected_category_details"
                  >
                  </product-variation-details>
                  <v-card>
                    <v-spacer></v-spacer>
                    <v-btn
                      block
                      large
                      color="primary"
                      text
                      @click="category_details_dialog = false"
                    >
                      close
                    </v-btn>
                  </v-card>
                </v-dialog>
              </v-card>
              <v-btn
                color="success"
                dark
                @click="showDetails(item)"
                elevation="2"
              >
                DETAILS
              </v-btn>
            </template>
          </vnatk-crud>
        </td>
      </template>
    </vnatk-crud>
  </div>
</template>

<script>
// @ is an alias to /src
import { VnatkCrud } from "@/entry";
import catalog from "./services/catalog";

import Vue from "vue";
import VuePapaParse from "vue-papa-parse";
Vue.use(VuePapaParse);

export default {
  name: "Test",
  components: { VnatkCrud },
  data() {
    return {
      expanded: [],
      singleExpand: true,

      crudoptions: {
        service: catalog,
        basepath: "/admin/vnatk",
        model: "Category",
        quickSearch: ["identifier", "$AttributeGroup.name$"],
        create: {
          modeloptions: {
            attributes: [
              "identifier",
              "isShareable",
              "parent_id",
              "attribute_group_id",
              "redirectUrl",
              "appLayout",
              "sequenceOrder",
              "coverImageUrl",
              "thumbnailImageUrl",
              "brand",
              "isRoot",
              "includeSubcategorySpecificationInFilter",
              "includeSubcategoryAttributeInFilter",
              "isAppRootCategory",
              "code",
            ],
          },
          defaultvalues: {
            userType: "employee",
          },
        },
        update: {
          modeloptions: {
            attributes: [
              "identifier",
              "isShareable",
              "thumbnailImageUrl",
              "parent_id",
            ],
          },
        },
        read: {
          modeloptions: {
            subQuery: false,
            include: [
              {
                model: "CatalogEmployee",
                as: "CreatedBy",
                required: false,
                attributes: [],
              },
              {
                model: "CatalogEmployee",
                as: "UpdatedBy",
                required: false,
                attributes: [],
              },
              {
                model: "CatalogEmployee",
                as: "DeletedBy",
                required: false,
                attributes: [],
              },
              {
                model: "Category",
                as: "ParentCategory",
                required: false,
                scope: false,
                attributes: ["id", "identifier"],
              },
              {
                model: "AttributeGroup",
                required: false,
                attributes: ["id", "name"],
              },
              {
                model: "CategoryLangData",
                as: "CategoryLangDatas",
                required: false,
                attributes: ["id", "langId", "name"],
              },
            ],
            // attributes: [
            //   "id",
            //   "parentId",
            // ],
          },
          serversidepagination: true,
          modelscope: false,
        },
        // import: {
        //   service: catalog,
        //   basepath: "/admin/vnatk",
        //   model: "Category",
        //   // execute: "foo_bar_function",
        //   autoimport: true,
        //   transaction: "row",
        //   rowformatter: function (item) {
        //     item.$vnatk_data_handle = "findOrCreate"; // 'alwaysCreate' [default], 'findOrCreate','findAndUpdateOrCreate', (For Associations, two more options) 'findToAssociate' [Produce error if not found],'associateIfFound' [Ignores if not found]
        //     item.$vnatk_find_options = {
        //       modeloptions: {
        //         identifier: item.identifier,
        //       },
        //       modelscope: false,
        //     };

        //     if (item.parent_id) {
        //       item.ParentCategory = {
        //         $vnatk_data_handle: "findToAssociate",
        //         $vnatk_find_options: {
        //           modeloptions: {
        //             identifier: item.parent_id,
        //           },
        //         },
        //       };
        //     } else {
        //       delete item.parent_id;
        //     }
        //     if (item.image) {
        //       item.thumbnailImageUrl = item.image;
        //       delete item.image;
        //     }
        //     return item;
        //   },
        //   success: this.reloadPage,
        // },

        import: {
          autoimport: true,
          rowformatter: function (item) {
            if (!item.identifier) return false;
            item.$vnatk_data_handle = "findOrCreate";
            item.createdById = 1;
            //item.identifier = "test123123";
            item.$vnatk_find_options = {
              modeloptions: {
                identifier: item.identifier,
              },
              modelscope: false,
            };

            item.CategoryLangDatas = [];

            if (item.parent_identifier) {
              item.ParentCategory = {
                $vnatk_data_handle: "findToAssociate",
                $vnatk_find_options: {
                  modeloptions: {
                    identifier: item.parent_identifier,
                  },
                  modelscope: false,
                },
              };
            } else {
              delete item.parent_identifier;
            }
            if (item.image) {
              item.thumbnailImageUrl = item.image;
              delete item.image;
            }

            if (item.identifier) {
              let t = {
                name: item.name,
                description: item.description,
                createdById: 1,
                Lang: {
                  $vnatk_data_handle: "findToAssociate",
                  $vnatk_find_options: {
                    modeloptions: {
                      locale: "en",
                    },
                    modelscope: false,
                  },
                },
                $vnatk_data_handle: "findAndUpdateOrCreate",
                $vnatk_find_options: {
                  modeloptions: {
                    langId: true,
                  },
                },
              };
              item.CategoryLangDatas.push(t);
            }
            return item;
          },
        },
        override: {
          actions: [
            {
              name: "vnatk_add",
            },
          ],
        },
        ui: {
          headers: [
            {
              text: "Id",
              value: "id",
            },
            {
              text: "Image",
              value: "thumbnailImageAbsolutePath",
            },
            {
              text: "Identifier",
              value: "identifier",
            },
            {
              text: "Attribute Group",
              value: "AttributeGroup.name",
            },
            {
              text: "Status",
              value: "status",
            },
            {
              text: "EDIT/REMOVE",
              value: "vnatk_actions",
            },
          ],
        },
      },
      categoryDetail_crudoptions: {
        service: catalog,
        basepath: "/admin/vnatk",
        model: "Category",
        create: false,
        update: false,
        delete: false,
        actions: false,
        limit: false,
        //  limit: false,
        read: {
          modeloptions: {
            subQuery: false,
            include: [
              {
                model: "CatalogEmployee",
                as: "CreatedBy",
                required: false,
                attributes: [],
              },
              {
                model: "CatalogEmployee",
                as: "UpdatedBy",
                required: false,
                attributes: [],
              },
              {
                model: "CatalogEmployee",
                as: "DeletedBy",
                required: false,
                attributes: [],
              },
              {
                model: "Category",
                as: "ParentCategory",
                required: false,
                scope: false,
                attributes: ["id", "identifier"],
              },
              {
                model: "AttributeGroup",
                required: false,
                attributes: ["id", "name"],
              },
              {
                model: "CategoryLangData",
                as: "CategoryLangDatas",
                required: false,
                attributes: ["id", "langId", "name"],
              },
            ],
            where: {
              id: 0,
            },
            // attributes: [
            //   "id",
            //   "parentId",
            // ],
          },
          serversidepagination: false,
          modelscope: false,
        },
        override: {
          actions: [
            {
              name: "vnatk_add",
            },
          ],
        },
        ui: {
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
              text: "Status",
              value: "status",
            },
            {
              text: "Parent Id",
              value: "parentId",
            },
            {
              text: "Redirect URL",
              value: "redirect_url",
            },
            {
              text: "Is Shareable",
              value: "isShareable",
            },
            {
              text: "Is Root",
              value: "isRoot",
            },
            {
              text: "Is Popular",
              value: "isPopular",
            },
            {
              text: "isAppRootCategory",
              value: "isAppRootCategory",
            },
            {
              text: "code",
              value: "code",
            },
            {
              text: "App Layout",
              value: "appLayout",
            },
            {
              text: "path",
              value: "path",
            },
          ],
        },
      },
      category_details_dialog: false,
      selected_category_details: {},
    };
  },
  methods: {
    clientFunctionCallBack(formData) {
      console.log(formData);
    },
    expandedFunc(item) {
      if (item.length) {
        //  alert(item[0].id);
        this.categoryDetail_crudoptions.read.modeloptions.where.id = item[0].id;
      }
    },
    async checkFileUpload(action, item) {
      if (item.thumbnailImageUrl instanceof File) {
        // send to upload and set proper value in field to be save in database
        // let ext = item.thumbnailImageUrl.name.split(".").pop();

        var resp = await this.uploadToS3(
          catalog,
          item.thumbnailImageUrl,
          process.env.VUE_APP_AWS_BUCKET,
          // "temp/" + "cat_" + Date.now().toString() + "." + ext,
          "category/" + item.thumbnailImageUrl.name,
          "300,100" // copy resized image and upload with filename_300.ext and filename_100.ext
        ).catch((err) => {
          throw err;
        });
        item.thumbnailImageUrl = resp.data[0].key;
      }
    },
    showDetails(item) {
      this.selected_category_details = item;
      this.category_details_dialog = true;
    },
  },
};
</script>
