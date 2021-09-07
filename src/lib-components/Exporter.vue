<template>
  <div>
    <!-- <slot name="exportButton"> -->
    <v-btn depressed color="primary" @click.once="fetchData"> Export</v-btn>
    <!-- </slot> -->
    <v-btn @click="exportDataToCSV()" v-if="loader.percentage >= 100">
      Download File
    </v-btn>
    <v-progress-circular
      v-if="loader.percentage > 0 && loader.percentage < 100"
      :rotate="360"
      :size="50"
      :width="3"
      :value="loader.percentage"
      color="teal"
    >
      {{ loader.percentage }}
    </v-progress-circular>
  </div>
</template>


  <!-- 
    // use this
    ----- Template/Html ------------------------
    <Exporter
      :exportData="exportData"
      :dataCallback="dataCallBackFunc" 
      :crudoptions="crudoptions" > 
    </Exporter>
    -------------------------------------------
    
    ----- RowFormatter method ------------------------
    rowformatterMethod(row) {
      // console.log("row formatter inside call function ", row);
      if (row.Lang) {
        row.Lang = row.Lang.name;
      }
      return row;
    },
    -------------------------------------------

    ----- DataCallback Method ------------------------
        /**
     * 
     * async dataCallBackFunc(loader) {
      console.log("callback function called", loader.percentage);
      let docount = 0;
      do {
        console.log("Do while count ", docount);
        docount += 1;
        let lp = await new Promise((resolve) => {
          var interval = setInterval(() => {
            // if (loader.percentage === 50) {
            clearInterval(interval);
            resolve(20 * docount);
            // }
            console.log("percentage ", docount);
          }, 1000);
        });
        loader.percentage = lp;
      } while (docount < 5);

      return this.exportData;
    },
     */
    -------------------------------------------

  -->
    
<script>
// import _ from "lodash";
import { saveAs } from "file-saver";
import { unparse } from "papaparse";

export default {
  name: "ExportComponent",
  props: {
    exportDataFeed: [Array, Boolean],
    dataCallback: [Function, Boolean],
    crudoptions: [Object, Boolean],
    delimiter: {
      type: String,
      default: ",",
      required: false,
    },
    encoding: {
      type: String,
      default: "utf-8",
    },
    /**
     * Should the module add SEP={delimiter}
     *
     * Useful for opening file with Excel
     */
    separatorExcel: {
      type: Boolean,
      default: false,
    },
    /**
     * Advanced options for Papaparse that is used to export to CSV
     */
    parserAdvancedOptions: {
      type: Object,
      default: () => {},
    },
    /**
     * filename to export, default: export.csv
     */
    fielName: {
      type: String,
      default: "export",
    },
    ipp: {
      type: Number,
      default: 100,
    },
    offset: {
      type: Number,
      default: 0,
    },
    rowformatter: {
      type: Function,
    },
  },

  data() {
    return {
      loader: {
        total: 100,
        percentage: 0,
        msg: "",
      },
      interval: function () {},
      exportData: [Array, Boolean],
      cloneCrudOptions: [Object, Boolean],
    };
  },

  computed: {
    postfixDateTime() {
      const d = new Date();
      return (
        d.getFullYear() +
        "-" +
        (d.getMonth() + 1) +
        "-" +
        d.getDate() +
        "-" +
        d.getHours() +
        "-" +
        d.getMinutes() +
        "-" +
        d.getSeconds()
      );
    },
  },

  beforeDestroy() {
    clearInterval(this.interval);
  },
  methods: {
    isType(value, type) {
      return typeof value === type;
    },

    async fetchData() {
      this.loader.percentage = 1;
      //callback function
      if (this.isType(this.dataCallback, "function")) {
        this.exportData = await this.dataCallback(this.loader);
        this.exportDataToCSV();
        return true;
      } else if (this.isType(this.crudoptions, "object")) {
        //callback CRUD options
        // clone CRUDOptions
        // console.log("CRUD Options start", this.crudoptions);
        let crudResData = [];
        let offsetCount = 0;
        let fetchContinue = true;

        this.cloneCrudOptions = JSON.parse(
          JSON.stringify(this.crudoptions, (k, v) =>
            k === "error-messages" ? undefined : v
          )
        );
        this.cloneCrudOptions.read.modeloptions.limit = this.ipp;
        this.cloneCrudOptions.read.modeloptions.offset = 0;
        // console.log("crud options", this.cloneCrudOptions);

        do {
          let tempResData = [];
          // console.log("Do while count offset count", offsetCount);
          // console.log(
          //   "offset count -------",
          //   this.cloneCrudOptions.read.modeloptions.offset
          // );

          var response = { data: {} };

          let APIIdentifier = this.cloneCrudOptions.model
            ? this.cloneCrudOptions.model
            : "";
          // call initialization from server
          response = await this.crudoptions.service
            .post(
              this.cloneCrudOptions.basepath +
                "/crud?vnatk_api=" +
                APIIdentifier,
              this.cloneCrudOptions
            )
            .catch((error) => {
              if (!error.response) {
                throw error;
              }
            });

          tempResData = response.data.data;
          // console.log("crud options response ", tempResData);
          let fetchedRecords = this.ipp + offsetCount * this.ipp;
          if (fetchedRecords >= response.data.datacount) {
            fetchContinue = false;
          } else {
            // update loader percentage
            offsetCount += 1;
          }

          // console.log("fetchedRecords", fetchedRecords);
          // console.log("response.data.datacount", response.data.datacount);
          // console.log(
          //   "this.loader.percentage",
          //   (fetchedRecords / response.data.datacount) * 100
          // );
          this.loader.percentage =
            (fetchedRecords / response.data.datacount) * 100 > 100
              ? 100
              : Math.ceil((fetchedRecords / response.data.datacount) * 100);

          this.cloneCrudOptions.read.modeloptions.offset = fetchedRecords;
          // console.log("rowformatter", this.rowformatter);
          // console.log("rowformatter type", typeof this.rowformatter);
          if (this.rowformatter && typeof this.rowformatter === "function") {
            tempResData = response.data.data
              .map((i) => this.rowformatter(i))
              .filter(function (i) {
                return i !== false;
              });
          }
          crudResData = [].concat(crudResData, tempResData);
        } while (fetchContinue);

        if (!fetchContinue) {
          this.exportData = crudResData;
          // console.log("final data", this.exportData);
          this.exportDataToCSV();
        }
      } else if (this.exportData.length > 0) {
        this.loader.percentage = 100;
        this.exportDataToCSV();
      } else {
        console.log("cannot export data");
        // this.interval = setInterval(() => {
        //   if (this.loader.percentage === 100) {
        //     clearInterval(this.interval);
        //     this.exportDataToCSV();
        //     return true;
        //   }
        //   this.loader.percentage += 10;
        // }, 1000);
      }
    },

    exportDataToCSV() {
      this.$emit("export-started");
      const dataExport = this.exportData;
      if (!dataExport) {
        console.error("No data to export");
        return;
      }
      let csv = unparse(
        dataExport,
        Object.assign(
          {
            delimiter: this.delimiter,
            encoding: this.encoding,
          },
          this.parserAdvancedOptions
        )
      );
      if (this.separatorExcel) {
        csv = "SEP=" + this.delimiter + "\r\n" + csv;
      }
      //Add BOM when UTF-8
      if (this.encoding === "utf-8") {
        csv = "\ufeff" + csv;
      }
      this.$emit("export-finished");
      // if (!this.testing) {
      let blob = new Blob([csv], {
        type: "application/csvcharset=" + this.encoding,
      });

      saveAs(blob, this.fielName + "_" + this.postfixDateTime + ".csv");
      // }
    },
  },

  mounted() {
    console.log("Exporter Data options", this.crudoptions);
    // console.log("CRUD crudoptions", this.crudoptions);
  },
};
</script>

<style scoped>
</style>
