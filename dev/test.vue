<template>
  <div>
    <vnatk-crud
      :options="crudoptions"
      @before-action-execute="saveDaysFormat"
      @before-dialog-open="dialogOpenDaysFormat"
      @after-dialog-open="dialogClosedDaysFormat"
    >
    </vnatk-crud>
  </div>
</template>

<script>
import { VnatkCrud } from "@/entry";
import partner from "./services/partner";
import wms from "./services/wms";

import Vue from "vue";
import VuePapaParse from "vue-papa-parse";
Vue.use(VuePapaParse);

// Helper & Partial Functions
const minLen = (l) => (v) => (v && v.length >= l) || `min. ${l} Characters`;
const maxLen = (l) => (v) => (v && v.length <= l) || `max. ${l} Characters`;
const required = (msg) => (v) => !!v || msg;
const requiredArray = (msg) => (v) => (Array.isArray(v) && v.length > 1) || msg;
// Rules
const rules = {
  requiredEmail: required("E-mail is required"),
  requiredSel: required("Selection is required"),
  requiredSelMult: requiredArray("2 Selections are required"),
  max12: maxLen(12),
  min6: minLen(6),
  validEmail: (v) => /.+@.+\..+/.test(v) || "E-mail must be valid",
};

export default {
  name: "PartnerCrud",
  //   props: {   },
  components: { VnatkCrud },
  data() {
    return {
      crudoptions: {
        service: partner,
        basepath: "/admin/vnatk",
        model: "Partner",
        quicksearch: ["name", "email", "mobile"],
        read: {
          modeloptions: {
            attributes: [
              "firstName",
              "lastName",
              "name",
              "email",
              "mobile",
              "building",
              "area",
              "areaId",
              "zoneId",
              "zoneName",
              "address",
              "pincode",
              "latitude",
              "longitude",
              //"accessToken",
              "status",
              "paymentMode",
              //   "stateId",
              //   "cityId",
              "stateName",
              "cityName",
              "emailVerifiedAt",
              "createdAt",
              "partnerId",
              "gstin",
              "deliveryDays",
              //  "profileImage",
              "allowedExtended",
              "timeSlot",
              "partnerType",
              "path",
              "imageAbsolutePath",
              "gender",
            ],
            include: [
              { model: "Partner", as: "ParentPartner", required: false },
            ],
            where: {
              gstin: { $is: null },
            },
            modelscope: false,
          },
          serversidepagination: true,
        },
        create: {
          modeloptions: {
            attributes: [
              "firstName",
              "lastName",
              //"name",
              "email",
              "mobile",
              "building",
              "area",
              //   "areaId",
              //   "zoneId",
              "zoneName",
              "address",
              "pincode",
              "latitude",
              "longitude",
              //"accessToken",
              "status",
              "paymentMode",
              //   "stateId",
              //   "cityId",
              "stateName",
              "cityName",
              "partnerId",
              "gstin",
              "deliveryDays",
              //  "profileImage",
              "allowedExtended",
              "timeSlot",
              "partnerType",
              //"path",
              //"imageAbsolutePath",
              "gender",
            ],
          },
        },
        update: {
          modeloptions: {
            attributes: [
              "firstName",
              "lastName",
              //"name",
              "email",
              "mobile",
              "building",
              "area",
              //   "areaId",
              //   "zoneId",
              "zoneName",
              "address",
              "pincode",
              "latitude",
              "longitude",
              //"accessToken",
              "status",
              "paymentMode",
              //   "stateId",
              //   "cityId",
              "stateName",
              "cityName",
              //"emailVerifiedAt",
              //"createdAt",
              "partnerId",
              "gstin",
              "deliveryDays",
              //  "profileImage",
              "allowedExtended",
              "timeSlot",
              "partnerType",
              //"path",
              //"imageAbsolutePath",
              "gender",
            ],
          },
        },
        import: false,
        override: {
          actions: [
            {
              name: "vnatk_add",
              formschema: {
                partnerId: {
                  type: "autocomplete",
                  label: "Parent Partner",
                  searchInput: "",
                  serviceoptions: {
                    service: partner,
                    basepath: "/admin/vnatk",
                    model: "Partner",
                    modelattributes: ["id", "partnerId", "name"],
                    searchfield: ["name"],
                    limit: 10,
                    titlefield: function (o) {
                      return o.name;
                    },
                  },
                },
                firstName: {
                  type: "text",
                  label: "First Name",
                  rules: [rules.min6, rules.requiredEmail, rules.validEmail],
                },
                lastName: {
                  type: "text",
                  label: "Last Name",
                },
                email: {
                  type: "text",
                  label: "Email",
                },
                mobile: {
                  type: "text",
                  label: "Mobile Number",
                },
                building: {
                  type: "textarea",
                  label: "Building Address",
                },
                area: {
                  type: "text",
                  label: "Area Name",
                },
                zoneName: {
                  type: "text",
                  label: "Zone Name",
                },
                address: {
                  type: "textarea",
                  label: "Address",
                },
                pincode: {
                  type: "text",
                  label: "Pincode",
                },
                latitude: {
                  type: "text",
                  label: "Latitude",
                },
                // stateName: {
                //   type: "text",
                //   label: "State Name",
                // },
                stateName: {
                  type: "autocomplete",
                  label: "State Name",
                  searchInput: "",
                  serviceoptions: {
                    service: wms,
                    basepath: "/admin/vnatk",
                    model: "State",
                    modelattributes: ["id", "name"],
                    searchfield: ["name"],
                    limit: 10,
                    titlefield: function (o) {
                      return o.name;
                    },
                  },
                },
                cityName: {
                  type: "text",
                  label: "City Name",
                },
                gstin: {
                  type: "text",
                  label: "GSTIN",
                },
                allowedExtended: {
                  type: "checkbox",
                  label: "Allowed Extended",
                },
                timeSlot: {
                  type: "text",
                  label: "Time Slot",
                },
                deliveryDays: {
                  items: [
                    "Sunday",
                    "Monday",
                    "Tuesday",
                    "Wednesday",
                    "Thursday",
                    "Friday",
                    "Saturday",
                  ],
                  type: "select",
                  multiple: true,
                  label: "Delivery Days",
                },
                paymentMode: {
                  items: [
                    "Cash on Delivery",
                    "Pre-Paid",
                    "Cash Or Online",
                    "Credit",
                    "Payment within 24 hrs",
                  ],
                  type: "select",
                  label: "paymentMode",
                },
                partnerType: {
                  items: ["Partner", "Frenchise", "Dost"],
                  type: "select",
                  label: "Partner Type",
                },
                gender: {
                  items: ["Male", "Female"],
                  type: "select",
                  label: "Gender",
                },
                status: {
                  items: ["Applied", "InActive", "Active", "Blocked"],
                  type: "select",
                  label: "Status",
                },
                // profileImage: {
                //   type: "file-uploader",
                //   label: "Profile Image",
                //   accept: "image/*",
                // },
              },
              //  handleviaimport: true,
            },
            {
              name: "vnatk_edit",
              formschema: {
                partnerId: {
                  type: "autocomplete",
                  label: "Parent Partner",
                  searchInput: "",
                  association: {
                    name: {
                      singular: "Partner",
                    },
                  },
                },
                firstName: {
                  type: "text",
                  label: "First Name",
                },
                lastName: {
                  type: "text",
                  label: "Last Name",
                },
                email: {
                  type: "text",
                  label: "Email",
                },
                mobile: {
                  type: "text",
                  label: "Mobile Number",
                },
                building: {
                  type: "textarea",
                  label: "Building Address",
                },
                area: {
                  type: "text",
                  label: "Area Name",
                },
                zoneName: {
                  type: "text",
                  label: "Zone Name",
                },
                address: {
                  type: "textarea",
                  label: "Address",
                },
                pincode: {
                  type: "text",
                  label: "Pincode",
                },
                latitude: {
                  type: "text",
                  label: "Latitude",
                },
                stateName: {
                  type: "text",
                  label: "State Name",
                },
                cityName: {
                  type: "text",
                  label: "City Name",
                },
                gstin: {
                  type: "text",
                  label: "GSTIN",
                },
                allowedExtended: {
                  type: "checkbox",
                  label: "Allowed Extended",
                },
                timeSlot: {
                  type: "text",
                  label: "Time Slot",
                },
                deliveryDays: {
                  items: [
                    "Sunday",
                    "Monday",
                    "Tuesday",
                    "Wednesday",
                    "Thursday",
                    "Friday",
                    "Saturday",
                  ],
                  type: "select",
                  multiple: true,
                  label: "Delivery Days",
                },
                paymentMode: {
                  items: [
                    "Cash on Delivery",
                    "Pre-Paid",
                    "Cash Or Online",
                    "Credit",
                    "Payment within 24 hrs",
                  ],
                  type: "select",
                  label: "paymentMode",
                },
                partnerType: {
                  items: ["Partner", "Frenchise", "Dost"],
                  type: "select",
                  label: "Partner Type",
                },
                gender: {
                  items: ["Male", "Female"],
                  type: "select",
                  label: "Gender",
                },
                status: {
                  items: ["Applied", "InActive", "Active", "Blocked"],
                  type: "select",
                  label: "Status",
                },

                // profileImage: {
                //   type: "file-uploader",
                //   label: "Profile Image",
                //   accept: "image/*",
                // },
              },
              handleviaimport: true,
              rowformatter: function (formData) {
                console.log("formData.mobile", formData.mobile);
                formData.$vnatk_data_handle = "findandupdateorcreate";
                formData.$vnatk_find_options = {
                  modeloptions: {
                    mobile: formData.mobile,
                  },
                  modelscope: false,
                };
                if (formData.mobile) delete formData.mobile;

                if (formData.partnerId) {
                  formData.ParentPartner = {
                    $vnatk_data_handle: "findToAssociate",
                    $vnatk_find_options: {
                      modeloptions: {
                        id: formData.partnerId,
                      },
                      modelscope: false,
                    },
                  };
                } else {
                  delete formData.partnerId;
                }
                return formData;
              },
            },
          ],
        },
        // ui: {
        //   headers: [
        //     // {
        //     //   text: "Attribute Group",
        //     //   value: "AttributeGroup.name",
        //     // },
        //     {
        //       text: "Status",
        //       value: "status",
        //     },
        //     {
        //       text: "EDIT/REMOVE",
        //       value: "vnatk_actions",
        //     },
        //   ],
        // },

        actions: true,
      },
    };
  },
  methods: {
    dialogOpenDaysFormat(action, item) {
      if (action.name == "vnatk_edit") {
        item.deliveryDays = item.deliveryDays.split(",");
        // item.mobile = item.mobile;
      }
    },

    // dialogClosedDaysFormat(action, item) {
    //   if (action.name == "vnatk_edit") {
    //     item.deliveryDays = item.deliveryDays.join(",");
    //   }
    // },

    saveDaysFormat(action, item) {
      if (action.name == "vnatk_add" || action.name == "vnatk_edit") {
        item.deliveryDays = item.deliveryDays.join(",");
      }
    },
  },
};
</script>