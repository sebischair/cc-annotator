'use babel';

import project from './project'
import storage from './storage'
import query from './query'

self_plm = {}
path = ""
module.exports = class ProjectLinkingModal {

  constructor (annot) {
    modal = this
    this.element = document.createElement('div');
    this.element.classList.add('project-linking-modal');
    current_element = this.element
    self_plm = this
    self_plm.annotator = annot;

  }

  serialize () {
    return {
      data: this.data
    };
  }

  build(file_path, callback){
    self_plm.callback = callback
    path = storage.get_root_dir_for_file(file_path)
    url = "https://spotlight.in.tum.de/project"
    query.sebis_services_get(url, "").then((response) => {
        console.log(response)
          /* Extracting information from the response */
          projects = response
          for(i = 0; i < projects.length; i++) {
            this.displayProject(projects[i])
          }

    }).catch((err) => {
      atom.notifications.addError("Could not get projects from server")
    })

    if (this.modal_form != undefined){
        this.element.removeChild(this.modal_form);
    }

    this.parent = this.element.parentElement;
    this.parent.classList.add('project-linking-modal-parent')

    this.modal_form = document.createElement('form');
    this.modal_form.classList.add('project-linking-modal')
    this.modal_header = document.createElement('div');
    this.modal_header.classList.add('modal-header');
    this.modal_body = document.createElement('div');
    this.modal_body.classList.add('modal-body');
    this.modal_footer = document.createElement('div');
    this.modal_footer.classList.add('modal-footer');

    this.modal_form.appendChild(this.modal_header);
    this.modal_form.appendChild(this.modal_body);
    this.modal_form.appendChild(this.modal_footer);
    this.element.appendChild(this.modal_form);

    /* Content Modal Header */
    this.header_title = document.createElement('h2');
    this.header_title.classList.add('modal_header_title')
    this.header_title.appendChild(document.createTextNode("Assign Project to Folder"));
    this.modal_header.appendChild(this.header_title);

    this.header_title = document.createElement('h3');
    this.header_title.classList.add('modal_header_title')
    this.header_title.appendChild(document.createTextNode("Select a Project for the path: "+path));
    this.modal_header.appendChild(this.header_title);

    this.dropdown =  document.createElement('div');
    this.dropdown.classList.add('project-selection');
    this.modal_body.appendChild(this.dropdown);

    /*
    this.dropdown_button = document.createElement('div');
    this.dropdown_button.classList.add('btn', 'dropdown-toggle');
    this.dropdown_button.setAttribute('type', 'button');
    this.dropdown_button.addEventListener('click', this.toggle_list);
    this.dropdown_button.appendChild(document.createTextNode('Select Your Project'))
    this.dropdown.appendChild(this.dropdown_button);
    /**/

    this.dropdown_span =  document.createElement('ul');
    this.dropdown_span.classList.add('dropdown-menu');
    this.dropdown_span.classList.toggle("show");
    this.dropdown.appendChild(this.dropdown_span);

    this.dropdown_ul =  document.createElement('ul');
    this.dropdown_ul.classList.add('dropdown-menu');
    this.dropdown_ul.setAttribute('id', 'dropdown-menu');
    this.dropdown.appendChild(this.dropdown_ul);


    /* Content modal-footer */
    this.close_button  = document.createElement('button');
    this.close_button.classList.add('btn', 'btn-default');
    this.close_button.appendChild(document.createTextNode("Close"));
    this.close_button.addEventListener("click", this.destroy);

    this.create_button  = document.createElement('button');
    this.create_button.classList.add('btn', 'btn-primary');
    this.create_button.appendChild(document.createTextNode("New Project"));
    this.create_button.addEventListener("click", this.create_new_project);

    this.submit_button  = document.createElement('button');
    this.submit_button.classList.add('btn', 'btn-primary');
    this.submit_button.appendChild(document.createTextNode("Submit"));
    this.submit_button.addEventListener("click", this.assign_project);

    this.modal_footer.appendChild(this.close_button);
    this.modal_footer.appendChild(this.create_button);
    this.modal_footer.appendChild(this.submit_button);
  }

  toggle_list(){

    li_elements = current_element.getElementsByTagName('li');
    visibility = li_elements[0].style.display;
    console.log(visibility);
    if (visibility == "none"){
      set_to = "inherit";
    } else {
      set_to = "none";
    }

    for (i = 0; i < li_elements.length; i++){
      li_elements[i].style.display = set_to;
    }
  }

  select_project(project){

    project.root_dir = path;
    self_plm.selected_project = project

    li_elements = self_plm.element.getElementsByTagName('li');
    for (i = 0; i < li_elements.length; i++){
      li_elements[i].style.fontWeight = "inherit";
    }

    clicked_li = self_plm.element.getElementsByClassName(project.id)[0];
    console.log(clicked_li)
    clicked_li.style.fontWeight = "bold"

    console.log(project)
  }

  assign_project(){
      if (self_plm.selected_project != undefined){
        project.update_cached_mapping(self_plm.selected_project)
        self_plm.destroy()
        self_plm.callback()
      }
  }

  displayProject(project){
    this.dropdown_li =  document.createElement('li');
    this.dropdown_li.appendChild(document.createTextNode(project.name))
    this.dropdown_li.style.display = "inherit";
    this.dropdown_li.classList.add(project.id, 'project-list-item')
    this.dropdown_li.addEventListener('click', function() {self_plm.select_project(project)});
    this.dropdown_ul.appendChild(this.dropdown_li);
  }

  create_new_project(){
    self_plm.annotator.create_new_project()
    self_plm.destroy()
  }

  destroy () {
    console.log(self_plm)
    self_plm.annotator.projectLinkingModal.hide();
  }

  getElement(){
    return this.element;
  }

}
