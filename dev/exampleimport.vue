<template>
  <div class="home">
    <vnatk-crud :options="crudoptions" :key="crudkey"> </vnatk-crud>
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
  name: "Home",
  components: { VnatkCrud },
  data() {
    return {
      crudkey: 1,
      crudoptions: {
        service: catalog,
        basepath: "/vnatk",
        model: "User",
        update: {
          modeloptions: {
            attributes: [
              "firstName",
              "lastName",
              "email",
              "profilepic",
              "groupId",
            ],
          },
        },
        create: {
          modeloptions: {
            attributes: [
              "firstName",
              "lastName",
              "email",
              "profilepic",
              "groupId",
            ],
          },
        },
        read: {
          modeloptions: {
            subQuery: false,
            attributes: [
              "firstName",
              "lastName",
              "email",
              "profilepic",
              "groupId",
              // { fn: "sum", col: "Projects.id", as: "ProjAdminCount" },
            ],
            include: [
              // {
              //   model: "Project",
              //   as: "ProjectsOwned",
              //   attributes: [{ fn: "count", col: "*", as: "ProjAdminCount" }],
              // },
              {
                model: "Project",
                as: "Projects",
                // attributes: [
                // {
                // fn: "count",
                // col: "*",
                // as: "ProjectPartOf",
                // group: ["UserProjects.UserId"],
                // },
                // ],
                through: { attributes: ["assignedOn"] },
              },
            ],
            // group: ["User.id"],
          },
          serversidepagination: true,
          modelscope: false,
        },
        import: {
          service: catalog,
          basepath: "/vnatk",
          model: "User",
          // execute: "vnatk_import",
          success: this.reloadPage,
          autoimport: true,
          // transaction:'row',
          rowformatter: function (item) {
            item.$vnatk_data_handle = "findOrCreate"; // 'alwaysCreate' [default], 'findOrCreate','findAndUpdateOrCreate', (For Associations, two more options) 'findToAssociate' [Produce error if not found],'associateIfFound' [Ignores if not found]
            item.$vnatk_find_options = {
              modeloptions: {
                // if not provided, finding will be based on all fields and values defined above
                email: item.email,
              },
              modelscope: false,
            };
            if (item.group) {
              item.Group = {
                identifier: item.group,
                $vnatk_data_handle: "findOrCreate",
              };
            }

            item.Skills = []; //hasMany,
            if (item.skill_1) {
              item.Skills.push({
                name: item.skill_1,
                $vnatk_data_handle: "findOrCreate",
              });
              delete item.skill_1;
            }
            if (item.skill_2) {
              item.Skills.push({
                name: item.skill_2,
                $vnatk_data_handle: "findOrCreate",
              });
              delete item.skill_2;
            }

            item.ProjectsOwned = []; //hasMany

            if (item.useradmin_project_1_code) {
              item.ProjectsOwned.push({
                title: item.useradmin_project_1_title,
                description: item.useradmin_project_1_desc,
                code: item.useradmin_project_1_code,
                $vnatk_data_handle: "findAndUpdateOrCreate", // if found, update admin Id to this user id
                $vnatk_find_options: {
                  modeloptions: {
                    code: item.useradmin_project_1_code,
                  },
                  modelscope: false,
                },
              });
            }
            if (item.useradmin_project_2_title) {
              item.ProjectsOwned.push({
                title: item.useradmin_project_2_title,
                description: item.useradmin_project_2_desc,
                code: item.useradmin_project_2_code,
                $vnatk_data_handle: "findAndUpdateOrCreate", // if found, update admin Id to this user id
                $vnatk_find_options: {
                  modeloptions: {
                    code: item.useradmin_project_2_code,
                  },
                  modelscope: false,
                },
              });
            }

            item.Projects = []; //belongsToMany
            if (item.user_project_1) {
              var projects_1 = {
                assignedOn: "1970-01-01", // fields in through table
                isDone: false,
                Project: {
                  // through model belongsTo Project is defined here
                  title: item.user_project_1,
                  $vnatk_data_handle: "findOrCreate",
                  $vnatk_find_options: {
                    modeloptions: {
                      code: item.user_project_1,
                    },
                  },
                },
                // $set_fresh_relations: true, // TODO remove all other relations
                $vnatk_data_handle: "findOrCreate",
                // $vnatk_find_options: {
                //   modeloptions: {
                //     productId: false, // Skip testing the relational field for findOne condition
                //     userId: false, // Skip testing the relational field for findOne condition
                //   },
                // },
                UserProjectRemarks: [],
              };
              if (item.user_project_1_remark_1) {
                projects_1.UserProjectRemarks.push({
                  remarks: item.user_project_1_remark_1,
                });
              }
              if (item.user_project_1_remark_2) {
                projects_1.UserProjectRemarks.push({
                  remarks: item.user_project_1_remark_2,
                });
              }
              item.Projects.push(projects_1);
            }
            if (item.user_project_2) {
              var projects_2 = {
                assignedOn: "1970-01-01",
                isDone: false,
                Project: {
                  title: item.user_project_2,
                  $vnatk_data_handle: "findOrCreate",
                  $vnatk_find_options: {
                    modeloptions: {
                      code: item.user_project_2,
                    },
                  },
                },
                $vnatk_data_handle: "findOrCreate",

                UserProjectRemarks: [],
              };
              if (item.user_project_2_remark_1) {
                projects_2.UserProjectRemarks.push({
                  remarks: item.user_project_2_remark_1,
                });
              }
              if (item.user_project_2_remark_2) {
                projects_2.UserProjectRemarks.push({
                  remarks: item.user_project_2_remark_2,
                });
              }
              item.Projects.push(projects_2);
            }

            return item;
          },
        },
        override: {
          actions: [
            {
              name: "vnatk_edit",
              formschemaoverrides: {
                profilepic: {
                  type: "file",
                  "@change": this.uploadToAWS,
                },
              },
            },
          ],
          headers: {
            prjCount: {
              text: "Project Admins Of",
              value: "ProjectsOwned[0].ProjAdminCount",
              moveto: 3,
            },
            prjPartOfCount: {
              text: "Project Part Of",
              value: "Projects[0].ProjectPartOf",
              moveto: 4,
            },
          },
        },
        // ui: {
        //   headers: [
        //     {
        //       text: "Identifier",
        //       value: "identifier",
        //     },
        //     {
        //       text: "Attribute Group",
        //       value: "AttributeGroup.name",
        //     },
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
      },
    };
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
  },
};
</script>
