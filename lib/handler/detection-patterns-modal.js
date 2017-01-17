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
self

module.exports =  class DetectionPatternModal {

  constructor (at) {
    annotator = at
    this.element = document.createElement('div');
    this.element.classList.add('patterns-modal');
    current_element = this.element
    self = this
  }

  build(projectId){
    url="https://spotlight.in.tum.de/pattern"
    query.sebis_services_get(url, projectId).then((response) => {
      patterns = response
    }).catch((err) => {
      console.log("ERROR: "+JSON.stringify(err))
    })
    this. build_content()
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

    for(i = 0; i < patterns.data.length; i++){
      id_ctr ++;
      pattern = patterns.data[i]
    }

    this.createEmptyRow()

    /* Content modal-footer */
    this.close_button  = document.createElement('button');
    this.close_button.classList.add('btn', 'btn-default');
    this.close_button.appendChild(document.createTextNode("Close"));
    this.close_button.addEventListener("click", this.destroy);

    this.submit_button  = document.createElement('button');
    this.submit_button.classList.add('btn', 'btn-primary');
    this.submit_button.appendChild(document.createTextNode("Submit"));
    this.submit_button.addEventListener("click", this.destroy);

    this.modal_footer.appendChild(this.close_button);
    this.modal_footer.appendChild(this.submit_button);

  }

  createEmptyRow(){

        this.passed_data = current_element.getElementsByClassName('passed_data')[0]

        console.log(current_element.getElementsByClassName('passed_data')[0])
        console.log(current_element)
        id_ctr ++;
        this.pattern_container = document.createElement('div')
        this.pattern_container.classList.add('pattern_container')
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
      icons[i].removeEventListener('click', self.clicked_new_line)
      console.log(icons[i])
      icons[i].classList.remove('icon-repo-create')
      icons[i].classList.add('icon-trashcan')
      icons[i].addEventListener('click', self.remove_line)
    }
    self.createEmptyRow()
  }

  remove_line() {
      console.log("HELLO")
      console.log(this.getAttribute('id'))
  }


  getElement () {
    return this.element;
  }

  destroy () {
    annotator.patternsModal.hide();
  }



}
