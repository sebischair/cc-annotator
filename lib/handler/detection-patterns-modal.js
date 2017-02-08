'use babel';

import detectionPatterns from './detection-patterns'
import query from './query'


patterns = {
    data: [],
    meta: {}
}
current_element = {}
annotator = {}
id_ctr = 0
self_detect_modal = {}

module.exports =  class DetectionPatternModal {

  constructor (at) {
    annotator = at
    this.element = document.createElement('div');
    this.element.classList.add('patterns-modal');
    current_element = this.element;
    self_detect_modal = this;
    self_detect_modal.annotator = annotator;
    console.log(annotator);
    console.log("Loaded");
  }

  build(projectId){
    console.log(annotator);
    url="https://spotlight.in.tum.de/pattern"
    self_detect_modal.projectId = projectId

    query.sebis_services_get(url, projectId).then((response) => {

      patterns = response.data
      for(i = 0; i < patterns.pattern.length; i++){
        id_ctr ++;
        pattern = patterns.pattern[i];
        self_detect_modal.createFiledRow(pattern);
      }
      self_detect_modal.createEmptyRow();

    }).catch((err) => {
      console.log("ERROR: "+JSON.stringify(err))
      self_detect_modal.destroy()
    })/**/
    self_detect_modal.build_content()

  }

  build_content(){
    if (this.modal_form != undefined){
        this.element.removeChild(this.modal_form);
    }

    this.parent = this.element.parentElement;
    this.parent.classList.add('patterns-modal-parent')

    current_element = this.element;

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
    this.header_title.appendChild(document.createTextNode("Update Annotation Patterns"));
    this.modal_header.appendChild(this.header_title);

    /* Content Modal Body */
    this.passed_data = document.createElement('div');
    this.passed_data.classList.add('passed_data');
    this.modal_body.appendChild(this.passed_data)

    this.pattern_container = document.createElement('div')
    this.pattern_container.classList.add('pattern_container')

    this.single_value = document.createElement('span');
    this.single_value.classList.add('editor', 'mini', 'pattern_submit_name', 'patterns-title');
    this.single_value.appendChild(document.createTextNode("Name"));
    this.pattern_container.appendChild(this.single_value);

    this.single_value = document.createElement('span');
    this.single_value.classList.add('editor', 'mini', 'pattern_submit_pattern', 'patterns-title');
    this.single_value.appendChild(document.createTextNode("Regex"));
    this.pattern_container.appendChild(this.single_value);

    this.single_value = document.createElement('span');
    this.single_value.classList.add('editor', 'mini', 'pattern_submit_descr', 'patterns-title');
    this.single_value.appendChild(document.createTextNode("Description"));
    this.pattern_container.appendChild(this.single_value);

    this.single_value = document.createElement('span');
    this.single_value.classList.add('editor', 'mini', 'pattern_submit_tags', 'patterns-title');
    this.single_value.appendChild(document.createTextNode("Tags"));
    this.pattern_container.appendChild(this.single_value);

    this.single_value = document.createElement('span');
    this.single_value.classList.add('editor', 'mini', 'pattern_submit_lang', 'patterns-title');
    this.single_value.appendChild(document.createTextNode("Lang."));
    this.pattern_container.appendChild(this.single_value);

    this.passed_data.appendChild(this.pattern_container)


    /* Content modal-footer */
    this.close_button  = document.createElement('button');
    this.close_button.classList.add('btn', 'btn-default');
    this.close_button.appendChild(document.createTextNode("Close"));
    this.close_button.addEventListener("click", this.destroy);

    this.submit_button  = document.createElement('button');
    this.submit_button.classList.add('btn', 'btn-primary');
    this.submit_button.appendChild(document.createTextNode("Submit"));
    this.submit_button.addEventListener("click", this.submit_patterns);

    this.modal_footer.appendChild(this.close_button);
    this.modal_footer.appendChild(this.submit_button);

  }

  createFiledRow(pattern){

        this.passed_data = current_element.getElementsByClassName('passed_data')[0]

        id_ctr ++;
        this.pattern_container = document.createElement('div')
        this.pattern_container.classList.add('pattern_container', 'pattern_container_data')
        this.pattern_container.setAttribute('id', id_ctr);

        this.single_value = document.createElement('atom-text-editor');
        this.single_value.classList.add('editor', 'mini', 'pattern_submit_name');
        this.single_value.setAttribute("mini", "");
        this.single_value.setAttribute('id', id_ctr);
        this.single_value.getModel().setText(pattern.name);
        this.pattern_container.appendChild(this.single_value);

        this.single_value = document.createElement('atom-text-editor');
        this.single_value.classList.add('editor', 'mini', 'pattern_submit_pattern');
        this.single_value.setAttribute("mini", "");
        this.single_value.setAttribute('id', id_ctr);
        this.single_value.getModel().setText(pattern.regex || "");
        this.pattern_container.appendChild(this.single_value);

        this.single_value = document.createElement('atom-text-editor');
        this.single_value.classList.add('editor', 'mini', 'pattern_submit_descr');
        this.single_value.setAttribute("mini", "");
        this.single_value.setAttribute('id', id_ctr);
        this.single_value.getModel().setText(pattern.description || "");
        this.pattern_container.appendChild(this.single_value);

        this.single_value = document.createElement('atom-text-editor');
        this.single_value.classList.add('editor', 'mini', 'pattern_submit_tags');
        this.single_value.setAttribute("mini", "");
        this.single_value.setAttribute('id', id_ctr);

        var tags = pattern.tags
        for(j = 0; j < tags.length; j++){
          tags[j] = tags[j].trim()
        }

        if (tags.length > 0){
          tags = JSON.stringify(tags).replace("[", "").replace("]", "")
        } else {
          tags = ""
        }

        tags = tags.replace(/\"/g,"").replace(/\\/g,"");

        console.log(tags)
        this.single_value.getModel().setText(tags);
        this.pattern_container.appendChild(this.single_value);

        this.single_value = document.createElement('atom-text-editor');
        this.single_value.classList.add('editor', 'mini', 'pattern_submit_lang');
        this.single_value.setAttribute("mini", "");
        this.single_value.setAttribute('id', id_ctr);
        this.single_value.getModel().setText(pattern.progLanguage  || "");
        this.pattern_container.appendChild(this.single_value);

        this.btn_container = document.createElement('span')
        this.btn_container.classList.add('btn-container')
        this.pattern_icon = document.createElement('span')
        this.pattern_icon.classList.add('icon', 'icon-trashcan', 'new-pattern')
        this.pattern_icon.addEventListener('click', this.remove_line)
        this.pattern_icon.setAttribute('id', id_ctr);
        this.btn_container.appendChild(this.pattern_icon)
        this.pattern_container.appendChild(this.btn_container)

        this.passed_data.appendChild(this.pattern_container)
  }


  createEmptyRow(){

        this.passed_data = current_element.getElementsByClassName('passed_data')[0]

        console.log(current_element.getElementsByClassName('passed_data')[0])
        console.log(current_element)
        id_ctr ++;
        this.pattern_container = document.createElement('div')
        this.pattern_container.classList.add('pattern_container', 'pattern_container_data')
        this.pattern_container.setAttribute('id', id_ctr);

        this.single_value = document.createElement('atom-text-editor');
        this.single_value.classList.add('editor', 'mini', 'pattern_submit_name');
        this.single_value.setAttribute("mini", "");
        this.single_value.setAttribute('id', id_ctr);
        this.pattern_container.appendChild(this.single_value);

        this.single_value = document.createElement('atom-text-editor');
        this.single_value.classList.add('editor', 'mini', 'pattern_submit_pattern');
        this.single_value.setAttribute("mini", "");
        this.single_value.setAttribute('id', id_ctr);
        this.pattern_container.appendChild(this.single_value);

        this.single_value = document.createElement('atom-text-editor');
        this.single_value.classList.add('editor', 'mini', 'pattern_submit_descr');
        this.single_value.setAttribute("mini", "");
        this.single_value.setAttribute('id', id_ctr);
        this.pattern_container.appendChild(this.single_value);

        this.single_value = document.createElement('atom-text-editor');
        this.single_value.classList.add('editor', 'mini', 'pattern_submit_tags');
        this.single_value.setAttribute("mini", "");
        this.single_value.setAttribute('id', id_ctr);
        this.pattern_container.appendChild(this.single_value);

        this.single_value = document.createElement('atom-text-editor');
        this.single_value.classList.add('editor', 'mini', 'pattern_submit_lang');
        this.single_value.setAttribute("mini", "");
        this.single_value.setAttribute('id', id_ctr);
        this.pattern_container.appendChild(this.single_value);

        this.btn_container = document.createElement('span')
        this.btn_container.classList.add('btn-container')
        this.pattern_icon = document.createElement('span')
        this.pattern_icon.classList.add('icon', 'icon-repo-create', 'new-pattern')
        this.pattern_icon.addEventListener('click', this.clicked_new_line)
        this.pattern_icon.setAttribute('id', id_ctr);
        this.btn_container.appendChild(this.pattern_icon)
        this.pattern_container.appendChild(this.btn_container)

        this.passed_data.appendChild(this.pattern_container)
  }

  clicked_new_line(){
    icons = current_element.getElementsByClassName('new-pattern')
    for (i = 0; i < icons.length; i++){
      icons[i].removeEventListener('click', self_detect_modal.clicked_new_line)
      console.log(icons[i])
      icons[i].classList.remove('icon-repo-create')
      icons[i].classList.add('icon-trashcan')
      icons[i].addEventListener('click', self_detect_modal.remove_line)
    }
    self_detect_modal.createEmptyRow()
  }

  remove_line() {

      containers = current_element.getElementsByClassName('pattern_container');
      for (i = 0; i < containers.length; i++){
        container_to_remove = containers[i];
        if (container_to_remove.getAttribute('id') == this.getAttribute('id')){
            container_to_remove.parentNode.removeChild(container_to_remove);
        }
      }
  }

  submit_patterns(){
    console.log(self_detect_modal.passed_data)
    containers = self_detect_modal.passed_data.getElementsByClassName('pattern_submit_name');

    new_patterns = []
    for (i = 1; i < containers.length; i++){

        name =
          self_detect_modal.passed_data.getElementsByClassName('pattern_submit_name')[i].getModel().getText();
        regex =
          self_detect_modal.passed_data.getElementsByClassName('pattern_submit_pattern')[i].getModel().getText();
        descr =
          self_detect_modal.passed_data.getElementsByClassName('pattern_submit_descr')[i].getModel().getText();
        tags  =
          self_detect_modal.passed_data.getElementsByClassName('pattern_submit_tags')[i].getModel().getText().trim().split(",");
        lang  =
          self_detect_modal.passed_data.getElementsByClassName('pattern_submit_lang')[i].getModel().getText();

        for(j = 0; j < tags.length; j++){
          tags[j] = tags[j].trim()
        }

        new_pattern = {
          name: name,
          regex: regex,
          description: descr,
          tags: tags,
          progLanguage: lang
        }

        console.log(new_pattern);

        if (regex != ""){
            new_patterns.push(new_pattern)
        }

    }

    //self_detect_modal.destroy()
    self_detect_modal.annotator.patternsModal.hide();

    submission = {
      projectId: self_detect_modal.projectId,
      pattern: new_patterns
    };

    uri = "https://spotlight.in.tum.de/pattern";
    query.sebis_services(uri ,submission)
    console.log(submission)
  }


  getElement () {
    return this.element;
  }

  destroy () {
    self_detect_modal.annotator.patternsModal.hide();
  }



}
