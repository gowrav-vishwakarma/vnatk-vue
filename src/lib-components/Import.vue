<template>
  <div>
    <input
      type="file"
      ref="file"
      style="display: none"
      v-on:change="fileSelected($event)"
    />
    <v-btn
      color="primary"
      v-bind="$attrs"
      v-on="$listeners"
      dark
      @click="$refs.file.click()"
      >Import</v-btn
    >
    <v-dialog
      v-model="openpreviewdialog"
      scrollable
      fullscreen
      persistent
      :overlay="false"
      transition="dialog-transition"
    >
      <v-card>
        <v-card-title primary-title> Import Preview </v-card-title>
        <v-alert type="error" v-if="errors.length">
          {{ errors.join('<br />') }}
        </v-alert>
        <v-card-text>
          <v-data-table
            v-if="filedata.data.length"
            :headers="datatableheaders"
            :items="filedata.data"
            :items-per-page="10"
            class="elevation-1"
          ></v-data-table>
        </v-card-text>
        <v-card-actions>
          <v-btn color="success" @click="sendtoimport">Import</v-btn>
          <v-btn color="warning" @click="closedialog">Cancel</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
export default {
  props: {
    options: [Object, Boolean],
  },
  data() {
    return {
      errors: [],
      openpreviewdialog: false,
      datatableheaders: [],
      filedata: { data: [], meta: { fields: [] } },
    };
  },

  methods: {
    onComplete(results, file) {
      // Your logic here! functions or axios calls
      this.filedata = results;
      for (let index = 0; index < this.filedata.meta.fields.length; index++) {
        const field = this.filedata.meta.fields[index];
        this.datatableheaders.push({ text: field, value: field });
      }
      this.openpreviewdialog = true;
    },

    fileSelected(e) {
      /* return first object in FileList */
      var file = e.target.files[0];
      this.$papa.parse(file, {
        header: true,
        complete: this.onComplete, // your vue methods
      });
    },
    closedialog() {
      this.$refs.file.value = "";
      this.openpreviewdialog = false;
    },
    sendtoimport() {
      this.options.service
        .post(
          (this.options.basepath ? this.options.basepath : "/vnatk") +
            "/executeaction",
          {
            action_to_execute: { execute: this.options.execute },
            formdata: this.filedata.data,
            model: this.options.model,
          }
        )
        .then((response) => {
          if (typeof this.options.success === "function") {
            this.options.success(response.data);
          }
          this.closedialog();
        })
        .catch((error) => {
          console.log(error);
          if (error.response) this.errors.push(error.response.data);
          else this.errors.push(error);
        });
      console.log(this.options);
    },
  },
};
</script>