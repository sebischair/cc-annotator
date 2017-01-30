'use babel';

import project from './project'

module.exports = class ProjectLinkingModal {

  constructor (annot) {
    annotator = annot;
    modal = this
    this.element = document.createElement('div');
    this.element.classList.add('project-linking-modal');
    current_element = this.element
  }

  serialize () {
    return {
      data: this.data
    };
  }

  destroy () {
    annotator.projectLinkingModal.hide();
  }

  getElement(){
    return this.element;
  }

}
