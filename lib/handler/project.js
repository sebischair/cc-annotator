'use babel';

import storage from './storage'

fs = require ('fs-plus')

module.exports =  {

    get_cached_mapping: function(){
        return atom.config.get("cc-annotator.projects");
    },

    update_cached_mapping: function(project_to_update){
      var mapped_projects = this.get_cached_mapping();
      if (mapped_projects === undefined){
        mapped_projects = [];
      }

      var new_list = [];
      var found = false
      /*
      * Running through the list and replace the project if it was found
      * and leave the other project unchanged
      */
      for(i = 0; i < mapped_projects.length; i++){
          var project = mapped_projects[i]
          if (project.root_dir == undefined){
              new_list.push(project)
          } else if (project.root_dir == project_to_update.root_dir) {
              new_list.push(project_to_update)
              found = true
          } else {
              new_list.push(project)
          }
      }

      /* If the project was not found yet append it to the list */
      if (!found){
        new_list.push(project_to_update)
      }

      atom.config.set("cc-annotator.projects", new_list);
    },

    project_was_assigned: function(root_dir){
      var mapped_projects = this.get_cached_mapping();
      for(i = 0; i < mapped_projects.length; i++){
          var project = mapped_projects[i]
          if (project.root_dir == root_dir){
            return true
          }
      }

      return false
    },

    get_project_for_file: function(file_path){
      var root_dir = storage.get_root_dir_for_file(file_path)

      var mapped_projects = this.get_cached_mapping();
      for(i = 0; i < mapped_projects.length; i++){
          var project = mapped_projects[i]
          if (project.root_dir == root_dir){
            console.log(project)
            return project
          }
      }
      return undefined;
    },

    get_cached_user_info(){
        var user = atom.config.get("cc-annotator.user");
        if (user == undefined){
          return {name: "", mail: ""};
        } else {
          return user;
        }
    },

    update_cached_user(user){
      atom.config.set("cc-annotator.user", user);
    }


}
