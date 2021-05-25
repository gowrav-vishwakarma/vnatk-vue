<template>
  <span>
    <v-text-field
      :label="$attrs.label"
      @click="pickFile"
      v-model="imageNameComp"
      prepend-icon="attach_file"
      v-bind="$attrs"
      v-on="$listeners"
      :ref="$attrs.label"
    ></v-text-field>
    <input
      type="file"
      style="display: none"
      ref="image"
      accept="image/*"
      @change="onFilePicked"
    />
  </span>
</template>


<script>
export default {
  name: "FileUploader",
  extends: "vTextField",

  data: () => ({
    title: "Image Upload",
    dialog: false,
    imageName: "",
    imageUrl: "",
    imageFile: "",
  }),

  mounted() {
    // this.imageName = this.$attr.value;
  },

  computed: {
    imageNameComp: {
      get: function () {
        return this.imageName && this.imageName.length
          ? this.imageName
          : this.$attrs.value;
      },
      // setter
      set: function (newValue) {
        this.imageName = newValue;
      },
    },
  },

  methods: {
    pickFile() {
      this.$refs.image.click();
    },

    onFilePicked(e) {
      const files = e.target.files;
      if (files[0] !== undefined) {
        this.imageName = files[0].name;
        if (this.imageName.lastIndexOf(".") <= 0) {
          return;
        }
        const fr = new FileReader();
        fr.readAsDataURL(files[0]);
        fr.addEventListener("load", () => {
          this.imageUrl = fr.result;
          this.$emit("input", files[0]);
          this.imageFile = files[0]; // this is an image file that can be sent to server...
        });
      } else {
        this.$emit("input", "");
        this.imageName = "";
        this.imageFile = "";
        this.imageUrl = "";
      }
    },
  },
};
</script>