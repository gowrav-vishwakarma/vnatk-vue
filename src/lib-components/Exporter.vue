<template>
  <div>
    <!-- <slot name="exportButton"> -->
    <v-btn depressed color="primary" @click.once="fetchData"> Export</v-btn>
    <!-- </slot> -->

    <v-btn
      @click="exportDataToCSV()"
      v-if="
        (useStreamSaver == false || useStreamSaver == 'false') &&
        loader.percentage >= 100
      "
    >
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
    <Exporter
      :exportData="exportData"
      :dataCallback="dataCallBackFunc" 
      :crudoptions="crudoptions" > 
    </Exporter>
    ----- Template/Html ------------------------
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
//import streamSaver from "streamsaver";
const streamSaver = require("streamsaver");
// const windowStreamSaver = window.streamSaver;

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
    fileName: {
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

    /**
     * export data save to export file not in memory
     */
    useStreamSaver: {
      type: [Boolean, String],
      default: true,
    },
    /**
     * when api res is error or service is not reachable, it auto try request with delay...
     */
    retryDelay: {
      type: [Number, String],
      default: 15000,
    },

    /**
     * max retry try count
     * when api respose is error or service is not reachable
     */
    maxRetryCount: {
      type: [Number, String],
      default: 5,
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
      streamWriteObject: false,
      fetchContinue: true,
      serverFailureCount: 1,
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
        // let fetchContinue = true;

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

          let response = { data: {} };

          let APIIdentifier = this.cloneCrudOptions.model
            ? this.cloneCrudOptions.model
            : "";
          // console.log("crud options response 1..1 " + this.serverFailureCount);
          // call initialization from server
          response = await this.crudoptions.service
            .post(
              this.cloneCrudOptions.basepath +
                "/crud?vnatk_api=" +
                APIIdentifier,
              this.cloneCrudOptions
            )
            .catch((error) => {
              //throw
              if (
                (this.useStreamSaver == true ||
                  this.useStreamSaver == "true") &&
                this.serverFailureCount >= this.maxRetryCount
              ) {
                this.streamWriteObject.close();
                if (!error.response) {
                  throw error;
                }
              } else {
                if (!error.response) {
                  throw error;
                }
              }
            });

          /**
           * managing response error handling  for 3 times and with time interval
           *
           *  system will try 3 time to wait for api response in case of server failure
           */
          // this.serverFailureCount = 0;

          if (typeof response !== "undefined" && response != null) {
            // console.log("response server ", response);
            tempResData = response.data.data;
            this.serverFailureCount = 0;
            let fetchedRecords = this.ipp + offsetCount * this.ipp;
            if (fetchedRecords >= response.data.datacount) {
              this.fetchContinue = false;
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

            // write data to files direct
            if (this.useStreamSaver) {
              this.exportData = tempResData;
              this.exportDataToCSV();
              this.exportData = [];
            } else {
              crudResData = [].concat(crudResData, tempResData);
            }
          } else {
            // api response failure count;
            this.serverFailureCount += 1;

            //api Request delay
            await new Promise((res) => setTimeout(res, this.retryDelay));
          }
        } while (this.fetchContinue);

        if (!this.fetchContinue && !this.useStreamSaver) {
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

      let csvprefix = "";
      // if streamWriteObject is running means pagination is working
      let overrideHeader = {};
      if (this.streamWriteObject) {
        overrideHeader = { header: false };
      }

      let csv = unparse(
        dataExport,
        Object.assign(
          {
            delimiter: this.delimiter,
            encoding: this.encoding,
          },
          Object.assign(
            this.parserAdvancedOptions ? this.parserAdvancedOptions : {},
            overrideHeader
          )
        )
      );

      if (this.separatorExcel) {
        csvprefix = "SEP=" + this.delimiter + "\r\n";
      }
      // if (this.encoding === "utf-8") {
      //   csvprefix += "\ufeff";
      // }

      //Add BOM when UTF-8

      // console.log("csv -----", csv);
      this.$emit("export-finished");
      // if (!this.testing) {

      if (this.useStreamSaver) {
        // console.log("streamSaver save function called");
        let writer = null;

        if (this.streamWriteObject) {
          writer = this.streamWriteObject;
          csv = csvprefix + "\r\n" + csv; // appending \r\n to chunks data from second counting
        } else {
          const fileStream = streamSaver.createWriteStream(
            this.fileName + "_" + this.postfixDateTime + ".csv"
          );
          writer = this.streamWriteObject = fileStream.getWriter();
        }

        writer.write(new TextEncoder().encode(csv));
        if (!this.fetchContinue) writer.close();
        // console.log("streamSaver save function called");
      } else {
        csv = csvprefix + csv;
        let blob = new Blob([csv], {
          type: "application/csvcharset=" + this.encoding,
        });
        saveAs(blob, this.fileName + "_" + this.postfixDateTime + ".csv");
      }

      // }
    },
  },
};
</script>

<style scoped>
</style>
