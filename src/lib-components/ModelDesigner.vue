<template>
  <div>
    <v-app-bar app> </v-app-bar>

    <v-card height="400" width="256" class="mx-auto">
      <v-navigation-drawer permanent app>
        <v-list-item>
          <v-list-item-content>
            <v-list-item-title class="title">
              VNATL ModelDesigner
            </v-list-item-title>
            <v-list-item-subtitle> Real agile </v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>

        <v-divider></v-divider>

        <v-list dense nav>
          <v-list-item v-for="(model, name) in models" :key="name" link>
            <v-list-item-icon>
              <v-icon>mdi-cogs</v-icon>
            </v-list-item-icon>

            <v-list-item-content>
              <v-list-item-title>{{ name }}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </v-navigation-drawer>
    </v-card>
    <v-main>
      <v-container> Hello World </v-container>
    </v-main>
  </div>
</template>

<script>
export default {
  name: "ModelDesigner",
  props: {
    service: [Object],
  },

  data() {
    return {
      models: {},
    };
  },

  mounted() {
    this.service.service
      .get(this.service.basepath + "/modeldesigner")
      .then((response) => {
        this.models = response.data;
      });
  },
};
</script>