'use babel';

import AnnotatorView from './annotator-view';
import query from './handler/query';
import decoration from './handler/decoration';
import comment from './handler/comment';
import storage from './handler/storage';
import * as project_lib from './handler/project';
import SidebarView from './handler/sidebar';
import PaneView from './handler/side-pane';
import SettingsView from './handler/settings-view';
import AnnotationModal from './handler/annotation-modal';
import DetectionPatternModal from './handler/detection-patterns-modal'
import ProjectLinkingModal from './handler/project-linking-modal';
import ProjectCreationModal from './handler/project-creation-modal';
import { CompositeDisposable } from 'atom';
import request from 'request';

fs = require ('fs-plus')
path_lib = require('path')

export default {

  annotatorView: null,
  modalPanel: null,
  subscriptions: null,
  annotations_code: {},
  callback: undefined,

  activate(state) {
    self = this
    self_annotator = this
    this.annotatorView = new AnnotatorView(state.annotatorViewState);
    this.modalPanel = atom.workspace.addModalPanel({
      item: this.annotatorView.getElement(),
      visible: false
    });

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    /* Preparing the modal dialogs and side panes */
    this.modalView = new AnnotationModal({ content: ""}, self);
    this.modal = atom.workspace.addModalPanel({
       item: this.modalView.getElement(),
       visible: false
     });

     this.patternsView = new DetectionPatternModal(self);
     this.patternsModal = atom.workspace.addModalPanel({
        item: this.patternsView.getElement(),
        visible: false
      });

      this.projectLinkingView = new ProjectLinkingModal(this);
      this.projectLinkingModal = atom.workspace.addModalPanel({
         item: this.projectLinkingView.getElement(),
         visible: false
       });

       this.projectCreationView = new ProjectCreationModal(this);
       this.projectCreationModal = atom.workspace.addModalPanel({
          item: this.projectCreationView.getElement(),
          visible: false
        });

      this.SidebarView = new PaneView();

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'annotator:annotate_code': () => this.annotate_code()
    }));
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'annotator:submit_annotation': () => this.submit_annotation()
    }));
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'annotator:update_patterns': () => this.update_patterns()
    }));

    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'annotator:remove_annotations': () => this.destroy_annoation()
    }))

    atom.notifications.addSuccess("Started Annotator Plugin in my-dev")
  },

  deactivate() {
    this.modalPanel.destroy();
    this.subscriptions.dispose();
    this.annotatorView.destroy();
  },

  serialize() {
    return {
      annotatorViewState: this.annotatorView.serialize()
    };
  },

  annotate_comment() {
    self = this
    let editoR
    if (editoR = atom.workspace.getActiveTextEditor()){

      self.editoR = editoR

      // Save open editor to ensure the right data is send to the server

      var content = comment.generate_base_content(editoR);

      url_sentiment = "https://westus.api.cognitive.microsoft.com/text/analytics/v2.0/sentiment"
      // No sentiment for German language
      query.ms_services(url_sentiment, content).then((response) => {

        comment.update_content_sentiment(content, response)
        overall_sentiment = comment.calc_overall_sentiment(response)

        return overall_sentiment

      }).then((sentiment) => {

        if (sentiment < 0.4){
            atom.notifications.addWarning("The overall sentiment is negative!")
        } else if (sentiment < 0.6) {
            atom.notifications.addInfo("The overall sentiment is neither positive nor negative!")
        } else {
            atom.notifications.addSuccess("The overall sentiment is positive!")
        }

      }).catch((err) => {
        console.log("ERROR: "+JSON.stringify(err))
        atom.notifications.addWarning(JSON.stringify(err))

      })/**/

      url_key_phrases = "https://westus.api.cognitive.microsoft.com/text/analytics/v2.0/keyPhrases"
      query.ms_services(url_key_phrases, content).then((response) => {
        comment.update_content_keyphrases(content, response)
      }).catch((err) => {
        console.log("ERROR: "+JSON.stringify(err))
      })/**/

      return
    }
  },

  /* WEBAPP Praktikum */

  /**
  * Creates the annotaions retrieved from the sebis servers.
  * The following steps are done in this method:
  *     1. Get the code from the currently active editor
  *     2. Sending the code to the server
  *     3. Highlighting all annitations in the code
  *     4. Storing all annations in annotations_code and .annotator file
  *     5. Creating new listener for the file to allow clicking on annations
  */
  annotate_code() {

    let editoR
    if (editoR = atom.workspace.getActiveTextEditor()){

      /* Extracting information from the editor */
      self_annotator.editoR = editoR
      /* Save open editor to ensure the right data is send to the server */
      var path = storage.get_root_dir_for_file(editoR.getPath())
      var file_content = editoR.getText()
      var file_name = path.substring(path.lastIndexOf(path_lib.sep) + 1)
      var file_lang = storage.get_file_lang(file_name)
      var project = project_lib.get_project_for_file(editoR.getPath())
      if (project == undefined){
        self_annotator.callback = self_annotator.annotate_code
        self_annotator.link_project(self_annotator.annotate_code)
        return
      }

      var project_id = project.id
      var path = editoR.getPath()

      var content = {
        "content": file_content,
        "progLanguage": file_lang,
        "fileName": file_name,
        "projectId": project_id,
        "path": path
      }

      self_annotator.annotations_code[path] = []

      /* Sending post request to the sebis server */
      url_sentiment = "https://spotlight.in.tum.de/processCode"
      query.sebis_services(url_sentiment, content).then((response) => {

            /* Extracting information from the response */
            response_parsed = JSON.parse(response)

            var smells = response_parsed.data
            var path = editoR.getPath()
            self_annotator.annotations_code[path] = []
            decoration.destroyAnnotations(editoR)

            /* Processing all annotations found by the server */
            for (var i = 0; i < smells.length; i++){
              var smell = smells[i]
              smell = decoration.annotation_smell(smell, editoR)
              self_annotator.annotations_code[path].push(smell)
            }

            /* Storing new annotations to annotator file */
            response_parsed.annotations   = smells
            response_parsed.meta['name']  = content.fileName
            response_parsed.meta['lang']  = content.progLanguage
            response_parsed.meta['hash']  = storage.createHash(content.content)
            delete response_parsed['data']
            delete response_parsed['status']

            storage.store_annotator_file(editoR.getPath(), response_parsed)

            //self_annotator.get_custom_annotations();

      }).catch((err) => {
        console.log("ERROR: "+JSON.stringify(err))
        atom.notifications.addError("Could not annotate code!")
      })


      /* Finished highlighting and data extraction from the response */

      /*
      * Adding listeners for the cursor to check for clicks on annotations and
      * a listner to check for change of the file and update the annotations
      * properly
      */
      self_annotator.SidebarViewInitialized = false
      editoR.onDidChangeCursorPosition(self_annotator.handle_changed_cursor_position);
      editoR.onDidChange(self_annotator.update_annotation_indices);
    }
  },

  get_custom_annotations(){

    var editoR = atom.workspace.getActiveTextEditor()
    var path = editoR.getPath()
    var relative_path = storage.get_relative_file_name(path)
    var fileId = storage.createHash(relative_path);

    qs = {
      fileId: fileId
    }

    url_sentiment = "https://spotlight.in.tum.de/codeToken"
    query.sebis_services_get_with_parameter(url_sentiment, qs).then((response) => {

          /* Extracting information from the response */
          var smells = response
          var editoR = atom.workspace.getActiveTextEditor()
          var path = editoR.getPath()
          //self_annotator.annotations_code[path] = []
          decoration.destroyAnnotations(editoR)

          /* Processing all annotations found by the server */
          matching_annotations = []
          for (var i = 0; i < smells.length; i++){
            var smell = smells[i]
            console.log(smell)
            try{
              smell.range = JSON.parse(smell.range)
              console.log(smell)
              smell.lines = [smell.range.start.row]
            } catch(e){
              continue
            }

            console.log(smell)
            if (self_annotator.token_matches(smell, editoR)){
                decoration.annotation_custom_smell(smell, editoR)
            }
            self_annotator.annotations_code[path].push(smell)
          }

          /* Storing new annotations to annotator file */
          update_content = {}
          update_content.annotations   = matching_annotations
          update_content.name  = path

          storage.store_annotator_file(editoR.getPath(), response_parsed)

    }).catch((err) => {
      console.log("ERROR: "+JSON.stringify(err))
    })/**/

  },

  token_matches(smell, editoR){
        var relative_filename = storage.get_relative_file_name(editoR.getPath());

        if (smell.path != relative_filename){
          return false
        }
        return true
  },

  handle_changed_cursor_position(event){

      /* Get event information and active editor */
      var cursor = event.cursor
      var position = event.cursor.getBufferPosition();
      var editoR = atom.workspace.getActiveTextEditor();
      var path = editoR.getPath();

      self_annotator.clicked_annotated_line_number(position, path, function (smell) {

        /* destroys the sidebar if it is initialized */
        if (!self_annotator.SidebarViewInitialized){
          self_annotator.SidebarViewInitialized = true
        } else {
          self_annotator.SidebarView.destroy()
        }

        /* Setting dummy values */
        // TODO replace dummy variables asa the server provides this information
        smell.description = "Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet."
        smell.votes = 0
        if (smell.name == "Hardcoded system name detected"){
          smell.votes = 3
        }

        /* Display sidebar with information about the currently clicked annotation */
        self_annotator.SidebarView.initialize(smell.name, smell.rows, path, smell.votes, smell.token, smell.description, position.row)
        self_annotator.SidebarView.attach()

      });
  },

  get_range(smell, file_content) {
    var prev_content = file_content.substring(smell.begin)
    var line = (prev_content.match(/\n/g) || []).length;
  },


  clicked_annotated_line_number(position, path, callback){
      var row = position.row - 1

      /* The column position of the line number is zero. There for only check
      * if an annotation is in the line if the column equlas 0
      */
      if (position.column == 0) {

          /* Check all annotations in file if it occures in this line */
          for(var i = 0; i < this.annotations_code[path].length; i++){
              var smell = this.annotations_code[path][i]
              var rows = smell.rows

              /* In case the clicked row is in the rows array of a smell
              * display the annotation by running the callback
              */
              if (this.isInArray(row, rows)) {
                callback(smell)
                return
              }
          }

      }

      return false

  },

  /* Checks is a value is in the given array */
  isInArray(value, array) {
    return array.indexOf(value) > -1;
  },

  /*
  * Updating the already retrieved annotation within a texteditor
  */
  update_annotation_indices(){
    /* Getting information about the active editor and its annotations */
    var editoR = atom.workspace.getActiveTextEditor()
    var path = editoR.getPath()
    var smells = self_annotator.annotations_code[path]
    self_annotator.annotations_code[path] = []

    /* To have no duplicate annotations destory exisitin decoration */
    decoration.destroyAnnotations(editoR)

    /* New decoration of annotations */
    for (var i = 0; i < smells.length; i++){
      var smell = smells[i]
      smell = decoration.annotation_smell(smell, editoR)
      self_annotator.annotations_code[path].push(smell)
    }
  },

  /*
  * Gets an selected range from the active text editor and opens a modal
  * submission dialog.
  */
  submit_annotation(){
    self = self_annotator;
    let editoR
    if (editoR = atom.workspace.getActiveTextEditor()){

        /* Getting information for submission modal dialog */
        var range = editoR.getSelectedBufferRange();
        var token = editoR.getSelectedText();
        var code  = editoR.getText();
        var lines = fs.readFileSync(editoR.getPath()).toString().split("\n");
        var path  = editoR.getPath();
        var lang  = storage.get_file_lang(path);
        var annotation = {
          range: range,
          token: token,
          lines: lines,
          path: path,
          progLang: lang,
          code: code
        }

        /* */
        var assigned_project = project_lib.get_project_for_file(path)
        if (assigned_project == undefined){
          self_annotator.callback = self_annotator.annotate_code
          self_annotator.link_project(self_annotator.submit_annotation)
          return
        }

        annotation.projectId = assigned_project.id

        /* Display modal dialoge */
        if ((range.end.column - range.start.column) > 1 || (range.end.row - range.start.row) > 0){
          self_annotator.modalView.show(annotation);
          self_annotator.modal.show();
        }
    }
  },

  destroy_annoation(){
    var editoR = atom.workspace.getActiveTextEditor()
    if (editoR != undefined){
      var path = editoR.getPath()
      self_annotator.annotations_code[path] = []
      decoration.destroyAnnotations(editoR)
    }
  },

  /*
  * Opens the modal dialoge for updating reqular expressions on
  * the server side
  */
  update_patterns(){
      projectId = "Test_Max"
      this.patternsView.build(projectId);
      this.patternsModal.show();
  },

  link_project(callback){
    path = atom.workspace.getActiveTextEditor().getPath();
    this.projectLinkingView.build(path, callback);
    this.projectLinkingModal.show();
  },

  create_new_project(callback){
    this.projectCreationView.build(callback)
    this.projectCreationModal.show()
  }

};
