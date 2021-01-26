<template>
  <div>
    <v-app-bar app> </v-app-bar>

    <v-navigation-drawer permanent app>
      <v-list-item>
        <v-list-item-content>
          <v-list-item-title class="title">
            VNATK ModelDesigner
          </v-list-item-title>
          <v-list-item-subtitle> Real agile </v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
      <v-divider></v-divider>
      <v-list dense nav>
        <v-list-item
          v-for="(m, name) in modelsData"
          :key="name"
          link
          @click="setCurrentModel(name)"
        >
          <v-list-item-icon>
            <v-icon>mdi-cogs</v-icon>
          </v-list-item-icon>

          <v-list-item-content>
            <v-list-item-title>{{ name }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
    <v-main>
      <v-container v-if="currentSelecetdModelName"
        ><v-system-bar height="30" dark color="primary">
          <b>{{ currentModel.name }}</b>
          <span class="pl-4"
            >[table:
            <i
              ><b>{{ currentModel.tableName }} </b></i
            >
            ]
          </span>
          <v-spacer></v-spacer>
        </v-system-bar>
        <v-row>
          <v-col cols="8">
            <vnatk-crud :options="currentModel.fieldsCrud" dense>
              <template v-slot:item.fieldName="{ item }" felx>
                {{ item.fieldName }}
                <v-subheader
                  v-if="item.fieldName != item.dbField"
                  class="d-inline"
                >
                  {{ item.dbField }}
                </v-subheader>
              </template>
            </vnatk-crud>
          </v-col>
          <v-col cols="4">
            <v-list flat subheader three-line>
              <vnatk-crud
                :options="currentModel.belongsToCrud"
                dense
              ></vnatk-crud>
            </v-list>
            <v-list flat subheader three-line>
              <v-subheader>HasMany</v-subheader>
            </v-list>
            <v-list flat subheader three-line>
              <v-subheader>Many To Many</v-subheader>
            </v-list>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </div>
</template>

<script>
import _ from "lodash";
import VnatkCrud from "./Crud.vue";
import VNATKModelDesignerFields from "../lib-mixins/VNATKModelDesignerFields";

export default {
  name: "ModelDesigner",
  components: { VnatkCrud },
  props: {
    service: [Object],
  },
  mixins: [VNATKModelDesignerFields],

  data() {
    return {
      modelsData: {},
      currentSelecetdModelName: null,
      editedmodels: {},
      sequlizeConstants: { DataTypes: {} },
    };
  },

  mounted() {
    this.service.service
      .get(this.service.basepath + "/modeldesigner")
      .then((response) => {
        this.modelsData = response.data.models;
        for (const [modelName, obj] of Object.entries(this.modelsData)) {
          this.setFieldsCrud(modelName);
          this.setBelongsToCrud(modelName);
        }
      });
  },
  computed: {
    currentModel: function () {
      return this.modelsData[this.currentSelecetdModelName];
    },
  },
  methods: {
    setCurrentModel(modelName) {
      this.currentSelecetdModelName = modelName;
    },
  },
};
</script>