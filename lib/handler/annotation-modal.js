'use babel';

import storage from './storage'
import project from './project'
import query from './query'

path_lib = require('path');

var modal = {};
var annotator = {};
var current_element = {};
var found_annotation = {};

module.exports = class AnnotationModal {

  constructor (state, annot) {
    annotator = annot;
    this.data = state;
    modal = this
    console.log(self);
    console.log(annotator);
    this.element = document.createElement('div');
    this.element.classList.add('annotation-modal');
    current_element = this.element
  }

  serialize () {
    return {
      data: this.data
    };
  }

  destroy () {
    annotator.modal.hide();
  }

  show(f_a) {
    found_annotation = f_a
    if (this.modal_form != undefined){
        this.element.removeChild(this.modal_form);
    }
    this.modal_form = document.createElement('form');
    this.modal_header = document.createElement('div');
    this.modal_header.classList.add('modal-header');
    this.modal_body = document.createElement('div');
    this.modal_body.classList.add('modal-body');
    this.modal_footer = document.createElement('div');
    this.modal_footer.classList.add('modal-footer');

    /* Content Modal Header */
    this.header_title = document.createElement('h2');
    this.header_title.classList.add('modal_header_title')
    this.header_title.appendChild(document.createTextNode("Submit New Code Annotation"));
    this.modal_header.appendChild(this.header_title);

    /* Content Modal Body */
    this.passed_data = document.createElement('div');
    this.passed_data.classList.add('passed_data');
    /* Adding visible data fields */
    this.single_data = document.createElement('div');
    this.single_data.classList.add('data_container');
    this.data_title = document.createElement('div');
    this.data_title.classList.add('data_title');
    this.data_title.appendChild(document.createTextNode("Token:"))
    this.single_value = document.createElement('div');
    this.single_value.classList.add('data_value');
    this.single_value.appendChild(document.createTextNode(JSON.stringify(found_annotation.token)));
    this.single_data.appendChild(this.data_title);
    this.single_data.appendChild(this.single_value);
    this.passed_data.appendChild(this.single_data);

    this.single_data = document.createElement('div');
    this.single_data.classList.add('data_container');
    this.data_title = document.createElement('div');
    this.data_title.classList.add('data_title');
    this.data_title.appendChild(document.createTextNode("Line:"))
    this.single_value = document.createElement('div');
    this.single_value.classList.add('data_value');
    this.single_value.appendChild(document.createTextNode(JSON.stringify(found_annotation.range.start.row)));
    this.single_data.appendChild(this.data_title);
    this.single_data.appendChild(this.single_value);
    this.passed_data.appendChild(this.single_data);

    this.additional_data = document.createElement('div');
    this.additional_data.classList.add('additional_data');

    this.data_title = document.createElement('div');
    this.data_title.classList.add('additional_data_title');
    this.data_title.appendChild(document.createTextNode("Additional Information:"));
    this.additional_data.appendChild(this.data_title);

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

    this.single_data = document.createElement('div');
    this.single_data.classList.add('data_container');
    this.data_title = document.createElement('div');
    this.data_title.classList.add('data_title', 'input_data_title')
    this.data_title.appendChild(document.createTextNode("Tags:"))
    this.single_value = document.createElement('atom-text-editor');
    this.single_value.classList.add('editor');
    this.single_value.classList.add('mini');
    this.single_value.classList.add('submit_tags');
    this.single_value.setAttribute("mini", "");
    this.single_data.appendChild(this.data_title);
    this.single_data.appendChild(this.single_value);
    this.additional_data.appendChild(this.single_data);

    this.data_title = document.createElement('div');
    this.data_title.classList.add('additional_data_user');
    this.data_title.appendChild(document.createTextNode("User Information:"));
    this.additional_data.appendChild(this.data_title);

    var user = project.get_cached_user_info();

    this.single_data = document.createElement('div');
    this.single_data.classList.add('data_container');
    this.data_title = document.createElement('div');
    this.data_title.classList.add('data_title', 'input_data_title')
    this.data_title.appendChild(document.createTextNode("Name:"))
    this.single_value = document.createElement('atom-text-editor');
    this.single_value.classList.add('editor');
    this.single_value.classList.add('mini');
    this.single_value.classList.add('submit_name');
    this.single_value.setAttribute("mini", "");
    this.single_data.appendChild(this.data_title);
    this.single_value.getModel().setText(user.name);
    this.single_data.appendChild(this.single_value);
    this.additional_data.appendChild(this.single_data);

    this.single_data = document.createElement('div');
    this.single_data.classList.add('data_container');
    this.data_title = document.createElement('div');
    this.data_title.classList.add('data_title', 'input_data_title')
    this.data_title.appendChild(document.createTextNode("E-Mail:"))
    this.single_value = document.createElement('atom-text-editor');
    this.single_value.classList.add('editor');
    this.single_value.classList.add('mini');
    this.single_value.classList.add('submit_mail');
    this.single_value.setAttribute("mini", "");
    this.single_value.getModel().setText(user.mail);
    this.single_data.appendChild(this.data_title);
    this.single_data.appendChild(this.single_value);
    this.additional_data.appendChild(this.single_data);

    this.modal_body.appendChild(this.passed_data);
    this.modal_body.appendChild(this.additional_data);

    /* Content modal-footer */
    this.close_button  = document.createElement('button');
    this.close_button.classList.add('btn');
    this.close_button.classList.add('btn-default');
    this.close_button.appendChild(document.createTextNode("Close"));
    this.close_button.addEventListener("click", modal.destroy);

    this.submit_button  = document.createElement('button');
    this.submit_button.classList.add('btn');
    this.submit_button.classList.add('btn-primary');
    this.submit_button.appendChild(document.createTextNode("Submit"));
    this.submit_button.addEventListener("click", modal.submit);

    this.modal_footer.appendChild(this.close_button);
    this.modal_footer.appendChild(this.submit_button);

    /* Appending Sections */
    this.element.appendChild(this.modal_form);
    this.modal_form.appendChild(this.modal_header);
    this.modal_form.appendChild(this.modal_body);
    this.modal_form.appendChild(this.modal_footer);

  }

  submit() {
    modal.destroy();

    // Extract data from HTML
    var mail_model = current_element.getElementsByClassName('submit_mail')[0].getModel()
    var mail = mail_model.getText()
    var name_model = current_element.getElementsByClassName('submit_name')[0].getModel()
    var name = name_model.getText()
    var user = {
      name: name,
      mail: mail
    }
    var description_model = current_element.getElementsByClassName('submit_descr')[0].getModel()
    var description = description_model.getText()
    var relative_path = storage.get_relative_file_name(found_annotation.path)
    var re = new RegExp("\\"+path_lib.sep,"g");
    relative_path = relative_path.replace(re,"/")
    var tags_model = current_element.getElementsByClassName('submit_tags')[0].getModel()
    var tags = tags_model.getText().split(",")
    for (i = 0; i < tags.length; i++){
      tags[i] = tags[i].trim()
    }

    var data = {
      range:  found_annotation.range,
      token: found_annotation.token,
      lines: found_annotation.lines,
      projectId: found_annotation.projectId,
      fileId: storage.createHash(path),
      path: relative_path,
      lang: found_annotation.lang,
      //code: found_annotation.code,
      user: user,
      description: description,
      tags: tags
    };
    project.update_cached_user(user)
    //atom.notifications.addSuccess("Will send message: "+JSON.stringify(data))
    var url = "https://spotlight.in.tum.de/codeToken"
    query.sebis_services(url, data);
    console.log(data);
  }

  getElement () {
    return this.element;
  }

}
