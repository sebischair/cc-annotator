'use babel';

import project from './project'
import storage from './storage'
import query from './query'

self_pcm = {}
path = ""
module.exports = class ProjectCreationModal {

  constructor (annot) {
    modal = this
    this.element = document.createElement('div');
    this.element.classList.add('project-creation-modal');
    current_element = this.element
    self_pcm = this
    self_pcm.annotator = annot;

  }

  serialize () {
    return {
      data: this.data
    };
  }

  build(){
    console.log("BUILD")
    if (this.modal_form != undefined){
        this.element.removeChild(this.modal_form);
    }

    //this.parent = this.element.parentElement;
    //this.parent.classList.add('patterns-modal-parent')

    this.modal_form = document.createElement('form');
    this.modal_form.classList.add('patterns_update')
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
    this.header_title.appendChild(document.createTextNode("Create New Procect"));
    this.modal_header.appendChild(this.header_title);

    this.header_title = document.createElement('h3');
    this.header_title.classList.add('modal_header_title')
    this.header_title.appendChild(document.createTextNode("This will create a new project on the server and assign it to "+path));
    this.modal_header.appendChild(this.header_title);

    this.dropdown =  document.createElement('div');
    this.dropdown.classList.add('project-selection');
    this.modal_body.appendChild(this.dropdown);

    this.additional_data = document.createElement('div');
    this.additional_data.classList.add('additional_data');

    this.data_title = document.createElement('div');
    this.data_title.classList.add('additional_data_title');
    this.data_title.appendChild(document.createTextNode("Additional Information:"));
    this.additional_data.appendChild(this.data_title);

    this.single_data = document.createElement('div');
    this.single_data.classList.add('data_container');
    this.data_title = document.createElement('div');
    this.data_title.classList.add('data_title', 'input_data_title')
    this.data_title.appendChild(document.createTextNode("Project Name:"))
    this.single_value = document.createElement('atom-text-editor');
    this.single_value.classList.add('editor');
    this.single_value.classList.add('mini');
    this.single_value.classList.add('submit_project_name');
    this.single_value.setAttribute("mini", "");
    this.single_data.appendChild(this.data_title);
    this.single_data.appendChild(this.single_value);
    this.additional_data.appendChild(this.single_data);

    this.single_data = document.createElement('div');
    this.single_data.classList.add('data_container');
    this.data_title = document.createElement('div');
    this.data_title.classList.add('data_title');
    this.data_title.appendChild(document.createTextNode("Description:"))
    this.single_value = document.createElement('atom-text-editor');
    this.single_value.classList.add('editor');
    this.single_value.classList.add('mini');
    this.single_value.classList.add('submit_descr');
    this.single_data.appendChild(this.data_title);
    this.single_data.appendChild(this.single_value);
    this.additional_data.appendChild(this.single_data);

    this.data_title = document.createElement('div');
    this.data_title.classList.add('additional_data_user');
    this.data_title.appendChild(document.createTextNode("User Information:"));
    this.additional_data.appendChild(this.data_title);

    this.modal_body.appendChild(this.additional_data);

    /* Content modal-footer */
    this.close_button  = document.createElement('button');
    this.close_button.classList.add('btn', 'btn-default');
    this.close_button.appendChild(document.createTextNode("Close"));
    this.close_button.addEventListener("click", this.destroy);

    this.create_button  = document.createElement('button');
    this.create_button.classList.add('btn', 'btn-primary');
    this.create_button.appendChild(document.createTextNode("Create"));
    this.create_button.addEventListener("click", this.create_new_project);

    this.modal_footer.appendChild(this.close_button);
    this.modal_footer.appendChild(this.create_button);
  }

  assign_project(){
      if (self_pcm.selected_project != undefined){
        project.update_cached_mapping(self_pcm.selected_project)
        self_pcm.destroy()
        self_pcm.callback()
      }
  }

  displayProject(project){
    this.dropdown_li =  document.createElement('li');
    this.dropdown_li.appendChild(document.createTextNode(project.name))
    this.dropdown_li.style.display = "inherit";
    this.dropdown_li.addEventListener('click', function() {self_pcm.select_project(project)});
    this.dropdown_ul.appendChild(this.dropdown_li);
  }

  create_new_project(){

    var description_model = current_element.getElementsByClassName('submit_descr')[0].getModel()
    var description = description_model.getText()

    var project_name_model = current_element.getElementsByClassName('submit_project_name')[0].getModel()
    var project_name = project_name_model.getText()

    var data = {
      description: description,
      name: project_name
    };

    var url =  "https://spotlight.in.tum.de/project"
    query.sebis_services(url, data).then((response) => {
        self_pcm.destroy();
        self_pcm.annotator.annotate_code()
    }).catch((err) => {
        atom.notifications.addError("Could not create new project!")
    })

  }

  destroy () {
    self_pcm.annotator.projectCreationModal.hide();
  }

  getElement(){
    return this.element;
  }

}
