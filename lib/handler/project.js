'use babel';

fs = require ('fs-plus')

module.exports =  {

    get_cached_mapping: function(){
        return atom.config.get("cc-annotator.projects");
    },

    update_cached_mapping: function(root_directory, project_to_update){
      var mapped_projects = this.get_cached_mapping;
      if (mapped_projects == undefined){
        mapped_projects = [];
      }

      var new_list = [];
      var found = false
      for(i = 0; i < mapped_projects.length; i++){
          var project = mapped_projects[i]
          if (project.root_dir == undefined){
              new_list.append(project)
          } else if (project.root_dir == project_to_update.root_dir) {
              new_list.append(project_to_update)
              found = true
          } else {
              new_list.append(project)
          }
      }

      if (!found){
        new_list.append(project)
      }

      atom.config.set("cc-annotator.projects", new_list);
    },

    project_was_assigned: function(root_dir){
      var mapped_projects = this.get_cached_mapping;
      for(i = 0; i < mapped_projects.length; i++){
          var project = mapped_projects[i]
          if (project.root_dir == root_dir){
            return true
          }
      }

      return false
    },

    
}
