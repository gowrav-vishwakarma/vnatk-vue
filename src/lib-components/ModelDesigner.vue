<template>
  <div>
    <v-app-bar app> 
      <v-spacer></v-spacer>
      <v-btn color="success" @click="saveModels">Save</v-btn>
    </v-app-bar>

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
      <v-btn color="success" @click="newModel">Add New Model</v-btn>
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

        <v-tabs v-model="tab" background-color="primary" dark>
          <v-tab
            v-for="item in [
              'Fields',
              'BelongsTo',
              'HasMany',
              'BelongsToMany',
              'Scopes',
              'Actions',
              'Extra'
            ]"
            :key="item"
          >
            {{ item }}
          </v-tab>
        </v-tabs>

        <v-tabs-items v-model="tab">
          <v-tab-item key="Fields" :transition="false">
            <v-card flat>
              <v-card-text>
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
              </v-card-text>
            </v-card>
          </v-tab-item>
          <v-tab-item key="BelongsTo" :transition="false">
            <v-card flat>
              <v-card-text>
                <vnatk-crud
                  :options="currentModel.belongsToCrud"
                  dense
                ></vnatk-crud>
              </v-card-text>
            </v-card>
          </v-tab-item>
          <v-tab-item key="HasMany" :transition="false">
            <v-card flat>
              <v-card-text
                ><vnatk-crud
                  :options="currentModel.HasManyCrud"
                  dense
                ></vnatk-crud
              ></v-card-text>
            </v-card>
          </v-tab-item>
          <v-tab-item key="BelongsToMany" :transition="false">
            <v-card flat>
              <v-card-text><vnatk-crud
                  :options="currentModel.BelongsToManyCrud"
                  dense
                ></vnatk-crud
              ></v-card-text></v-card-text>
            </v-card>
          </v-tab-item>
          <v-tab-item key="Scopes" :transition="false">
            <v-card flat>
              <v-card-text>
                <vnatk-crud
                  :options="currentModel.scopesCrud"
                  dense
                ></vnatk-crud>
              </v-card-text>
            </v-card>
          </v-tab-item>
          <v-tab-item key="Actions" :transition="false">
            <v-card flat>
              <v-card-text>
                <vnatk-crud
                  :options="currentModel.actionsCrud"
                  dense
                ></vnatk-crud>
              </v-card-text>
            </v-card>
          </v-tab-item>
          <v-tab-item key="Extra" :transition="false">
            <v-card flat>
              <v-card-text>
                <v-form >
                  <v-form-base
                    :model="currentModel"
                    :schema="setextraFormSchema(this.currentSelecetdModelName)"
                    :col="6"
                  />
                </v-form>
              </v-card-text>
            </v-card>
          </v-tab-item>
        </v-tabs-items>
      </v-container>
    </v-main>
  </div>
</template>

<script>
import _ from "lodash";
import VnatkCrud from "./Crud.vue";
import VNATKModelDesignerFields from "../lib-mixins/VNATKModelDesignerFields";
import VFormBase from "vuetify-form-base";

export default {
  name: "ModelDesigner",
  components: { VnatkCrud, VFormBase },
  props: {
    service: [Object],
  },
  mixins: [VNATKModelDesignerFields],

  data() {
    return {
      tab: "Fields",
      modelsData: {},
      currentSelecetdModelName: null,
      rules: {
        age: [(val) => val < 10 || `I don't believe you!`],
        animal: [(val) => (val || "").length > 0 || "This field is required"],
        name: [(val) => (val || "").length > 0 || "This field is required"],
      },
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
          this.setHasManyToCrud(modelName);
          this.setBelongsToManyToCrud(modelName);
          this.setScopesCrud(modelName);
          this.setActionsCrud(modelName);
        }
      });
  },
  computed: {
    currentModel: function () {
      return this.modelsData[this.currentSelecetdModelName];
    },
  },
  methods: {
    validate(force, value) {
      console.log(force, value);
    },
    setCurrentModel(modelName) {
      this.currentSelecetdModelName = modelName;
    },
    saveModels() {
      this.service.service
        .post(this.service.basepath + "/modeldesigner/save", {
          modelsData: this.modelsData,
        })
        .then((response) => {
          console.log(response.data);
        });
    },
    newModel() {
      var name = prompt("Model Name ?");

      var newModelData = {
        actions: [],
        associations: [],
        name: name,
        rawAttributes: {},
        scopes: { scopes: {} },
        response: {
          data: [],
        },
      };
      this.$set(this.modelsData, name, newModelData);

      this.setFieldsCrud(name);
      this.setBelongsToCrud(name);
      this.setHasManyToCrud(name);
      this.setBelongsToManyToCrud(name);
      this.setScopesCrud(name);
      this.setActionsCrud(name);
    },
  },
};
</script>