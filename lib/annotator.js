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
glob = require('glob')
q = require('q')
annotator_self = {}
dashUri = 'atom://dashboard';

export default {

  annotatorView: null,
  modalPanel: null,
  subscriptions: null,
  annotations_code: {},
  custom_annotations_code: {},
  callback: undefined,

  activate(state) {
    self = this
    annotator_self = this
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

      this.subscriptions.add(atom.workspace.addOpener((function(_this) {
          return function(filePath, dir) {
            if (filePath === dashUri) {
              return _this.createDashboardView({
                uri: dashUri,
                path: dir
              });
            }
          };
        })(this)));

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
      'annotator:open_dashboard': () => this.open_dashboard()
    }));


    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'annotator:remove_annotations': () => this.destroy_annoation()
    }))

    atom.notifications.addSuccess("Started Annotator Plugin")

    var directories = atom.project.getDirectories()
    for (i = 0; i < directories.length; i++){
      var rootPath = directories[i].getPath()
      console.log("Root Path " + rootPath)
      this.getAnnotatedFilesUnderaDirectory(rootPath)
    }

  },

  createDashboardView: function(state) {
    var DashboardView;
    DashboardView = require('./handler/dashboard');
    return new DashboardView(state);
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


  applyCSSStyling(file_path) {
    var updatedaPath = self.modifyPath(file_path)
    console.log("Updated Path " + updatedaPath )

    var fileHasAnnotatations = self.getAnnotatedFiles(file_path)
    console.log("File has Annottations? : " + fileHasAnnotatations)
    if(fileHasAnnotatations){
      var children = new Array()
      annotator_self.setListnersonParent(file_path, children)
    }
  },

  getAnnotatedFiles(file_path) {
      var fileHasAnnotatations = false
      var dir_path  = annotator_self.getParentDirectory(file_path)
      var file_name = file_path.substring(file_path.lastIndexOf(path_lib.sep) + 1)
      var annotationPath = path_lib.join(dir_path, ".annotator")
      console.log("Annotation Path " + annotationPath)
      var json = fs.readFileSync(annotationPath)
      var data = JSON.parse(json)
      console.log(data)
      var annotatedFiles = data.annotated_files
      var filesList = new Array()
      console.log("Getting annotations...")
      for (i = 0; i < annotatedFiles.length; i++){
        console.log("Entry " + annotatedFiles[i].meta.name)
        console.log("Length " + annotatedFiles[i].annotations.length)
        if ((file_name == annotatedFiles[i].meta.name) && (annotatedFiles[i].annotations.length > 0)){
          fileHasAnnotatations = true
        }
      }
      return fileHasAnnotatations
  },
  setListnersonParent(parent, children){
    var updatedaParent = annotator_self.modifyPath(parent)
    console.log("Updated Parent " + updatedaParent)
    console.log("Children " + children)
    var query = annotator_self.getSpanElementsforDataPath(updatedaParent)
    console.log("Parent length " + query.length)
    try{
      annotator_self.setColoronelement(query[0])
      query[0].addEventListener('click', function(){
        annotator_self.getAnnotatedFilesUnderaDirectory(parent)
      });
    }catch(err){
        console.log("ERROR::: " + err)
    }finally{
      var newParent = annotator_self.getParentDirectory(parent)
      children[children.length] = parent
      if(newParent != ""){
        annotator_self.setListnersonParent(newParent,children)
      }
    }
  },
  searchAnnoatedFilesUnderFolder(dirpath){
    console.log("Path " + dirpath)
    var deferred, pattern;
    deferred = q.defer();
    pattern = dirpath + "/**/.annotator";
    console.log("****PATTERN****")
    console.log(pattern)
    glob(pattern, function(err, files) {
      var data, entry, i, j, json, len, len1, ref, resp, sfilem;
      var listofFiles = new Array()
      if (err) {
        console.log("ERROR" + err)
        return deferred.reject(err);
      } else {
        console.log("Files lnegth " + files.length)
        if (files.length > 0) {
          for (i = 0, len = files.length; i < len; i++) {
            sfile = files[i];
            json = fs.readFileSync(sfile);
            try {
              data = JSON.parse(json);
              ref = data.annotated_files;
              for (j = 0, len1 = ref.length; j < len1; j++) {
                entry = ref[j];
                if (entry.annotations.length > 0) {
                  console.log("SFile " + sfile)
                  var updatedsfile = annotator_self.convertUnixPathtoWindows(sfile)
                  console.log("Updated SFile" + updatedsfile)
                  var dir = annotator_self.getParentDirectory(updatedsfile)
                  console.log("Directory " + dir)
                  var newpath = path_lib.join(dir, entry.meta.name)
                  console.log("New Path " + newpath)
                  listofFiles[listofFiles.length] = newpath
                }
              }
            } catch (_error) {
              err = _error;
            }
          }
          return deferred.resolve(listofFiles);
        } else {
          return deferred.resolve(listofFiles);
        }
      }
    });
    return deferred.promise;
  },
  getAnnotatedFilesUnderaDirectory(dirpath){
    console.log("Clicked...Waiting for promise")
    console.log(annotator_self);
    annotator_self.searchAnnoatedFilesUnderFolder(dirpath).then(function(filesList) {
      console.log("FileList " + filesList)
      var updatedParent = annotator_self.modifyPath(dirpath)
      var superParent = annotator_self.getParentDirectory(dirpath)
      var updatedsuperParent = annotator_self.modifyPath(superParent)
      console.log("Super Parent " + updatedsuperParent)
      if (filesList.length > 0) {
        for(i=0;i<filesList.length;i++){
          var updatedFile = annotator_self.modifyPath(filesList[i])
          var curr = updatedFile
            do{
              console.log("Updated Parent " + updatedFile)
              var revFile1 = annotator_self.demodifyPath(curr)
              var query = annotator_self.getSpanElementsforDataPath(curr)
              if(query.length > 0){
                annotator_self.setColoronelement(query[0])
                query[0].addEventListener('click', function(){
                  annotator_self.getAnnotatedFilesUnderaDirectory(revFile1)
                });
              }
              var revFile = annotator_self.demodifyPath(curr)
              var tempfile = annotator_self.getParentDirectory(revFile)
              curr = annotator_self.modifyPath(tempfile)
            } while(curr != updatedsuperParent);
        }
      }
    }).catch(function(e){
      console.log(e)
      console.log("Promise rejected")
    });
  },

  setColoronelement(element){
    console.log("Setting Color to Blue")
    element.style.color = 'blue'
  },

  demodifyPath(somepath){
    if(path_lib.sep == "\\"){
      return somepath.replace(/\\\\/g , '\\')
    }else{
      return somepath
    }
  },
  modifyPath(somepath){
    if(path_lib.sep == "\\"){
      return somepath.replace(/\\/g , '\\\\')
    }else{
      return somepath
    }
  },

  getParentDirectory(somepath){
    return somepath.substring(0, somepath.lastIndexOf(path_lib.sep))
  },

  getSpanElementsforDataPath(datapath){
    return document.querySelectorAll("span[data-path='" + datapath + "']")
  },

  convertUnixPathtoWindows(unixpath){
    if(path_lib.sep == "\\"){
      return unixpath.replace(/\//g , '\\')
    }else{
      return unixpath
    }
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
      var path = storage.get_relative_file_name(editoR.getPath())
      var full_path = editoR.getPath()
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
      console.log(JSON.stringify(content))
      self_annotator.annotations_code[path] = []
      self_annotator.custom_annotations_code[path] = []

      /* Sending post request to the sebis server */
      url_sentiment = "https://spotlight.in.tum.de/processCode"
      query.sebis_services(url_sentiment, content).then((response) => {

            /* Extracting information from the response */
            response_parsed = JSON.parse(response)
            console.log(response_parsed)
            var smells = response_parsed.data
            var path = editoR.getPath()
            var file_name = path.substring(path.lastIndexOf(path_lib.sep) + 1)
            var file_lang = storage.get_file_lang(file_name)
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
            response_parsed.meta['name']  = file_name
            response_parsed.meta['lang']  = file_lang
            response_parsed.meta['hash']  = storage.createHash(editoR.getText())
            delete response_parsed['data']
            delete response_parsed['status']

            storage.store_annotator_file(editoR.getPath(), response_parsed)

            self_annotator.get_custom_annotations();
            self_annotator.applyCSSStyling(full_path);

      })/*.catch((err) => {
        console.log("ERROR: "+JSON.stringify(err))
        atom.notifications.addError("Could not annotate code!")
      })/**/


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
    var fileId = storage.createHash(relative_path)
    var project = project_lib.get_project_for_file(editoR.getPath())

    qs = {
      //fileId: fileId
    }

    url_sentiment = "https://spotlight.in.tum.de/codeTokenInProject?projectId="+project.id
    query.sebis_services_get_with_parameter(url_sentiment, qs).then((response) => {

          /* Extracting information from the response */
          var smells = response
          var editoR = atom.workspace.getActiveTextEditor()
          var path = editoR.getPath()
          var full_path = editoR.getPath()
          path = storage.get_relative_file_name(path)
          var file_name = path.substring(path.lastIndexOf(path_lib.sep) + 1)
          var file_lang = storage.get_file_lang(file_name)
          var project = project_lib.get_project_for_file(editoR.getPath())

          /* Processing all annotations found by the server */
          matching_annotations = []
          if (self_annotator.custom_annotations_code === undefined){
            self_annotator.custom_annotations_code = {}
            self_annotator.custom_annotations_code[full_path] = []
          } else if (self_annotator.custom_annotations_code[full_path] === undefined) {
            self_annotator.custom_annotations_code[full_path] = []
          }
          for (var i = 0; i < smells.length; i++){
            var smell = smells[i]
            var re = new RegExp("/","g");
            smell.path = relative_path.replace(re, path_lib.sep)

            if (smell.path === path){
              matching_annotations.push(smell)
              smell.range.start.row = parseInt(smell.range.start.row)
              smell.range.start.column = parseInt(smell.range.start.column)
              smell.range.end.row = parseInt(smell.range.end.row)
              smell.range.end.column = parseInt(smell.range.end.column)
              delete smell['lines']

              var actuall_token = editoR.getTextInRange(smell.range)
              if (actuall_token === smell.token){
                decoration.annotation_custom_smell(smell, editoR)
              }

              self_annotator.custom_annotations_code[full_path].push(smell)
            }
            /*if (self_annotator.token_matches(smell, editoR)){
                decoration.annotation_custom_smell(smell, editoR)
            }
            */
            //self_annotator.annotations_code[path].push(smell)
            self_annotator.applyCSSStyling(full_path)
          }

          /* Storing new annotations to annotator file */
          update_content = {}
          update_content.custom_annotations = matching_annotations
          update_content.name  = path
          update_content.path = path
          update_content.meta = {}
          update_content.meta['name']  = file_name
          update_content.meta['lang']  = file_lang
          update_content.meta['hash']  = ""//content.hash

          storage.store_custom_annotator_file(editoR.getPath(), update_content)
  })/*.catch((err) => {
      console.log("ERROR: "+JSON.stringify(err))
    })/**/

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
        smell.votes = 0
        console.log(smell)
        /* Display sidebar with information about the currently clicked annotation */
        self_annotator.SidebarView.initialize(smell.name, smell.rows, path, smell.votes, smell.token, smell.description, position.row, "Machine Generated")
        self_annotator.SidebarView.attach()

      });

      self_annotator.clicked_custom_annotated_line_number(position, path, function (smell) {
          if (!self_annotator.SidebarViewInitialized){
            self_annotator.SidebarViewInitialized = true
          } else {
            self_annotator.SidebarView.destroy()
          }

          smell.votes = 0

          /* Display sidebar with information about the currently clicked annotation */
          self_annotator.SidebarView.initialize("User Generated", smell.range, path, smell.votes, smell.token, smell.description, position.row, "User Generated")
          self_annotator.SidebarView.attach()
      });

      editoR.onDidChange(self_annotator.update_annotation_indices)
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

  clicked_custom_annotated_line_number(position, path, callback){
      var row = position.row - 1

      /* The column position of the line number is zero. There for only check
      * if an annotation is in the line if the column equlas 0
      */
      if (position.column == 0) {

          /* Check all annotations in file if it occures in this line */
          for(var i = 0; i < this.custom_annotations_code[path].length; i++){
              var smell = this.custom_annotations_code[path][i]
              if (smell.range.start.row <= row && row <= smell.range.end.row) {
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

    var custom_smells = self_annotator.custom_annotations_code[path]
    for (var i = 0; i < custom_smells.length; i++){
      var smell = custom_smells[i]
      var actuall_token = editoR.getTextInRange(smell.range)
      if (actuall_token === smell.token){
        decoration.annotation_custom_smell(smell, editoR)
      }
    }

  },

  open_dashboard(){
    console.log("Creating Panel..")
    editor = atom.workspace.getActiveTextEditor()
    filepath = editor.getPath()
    parentpath = filepath.substring(0, filepath.lastIndexOf(path_lib.sep))
    atom.workspace.open(dashUri, parentpath)
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
        } else {
          atom.notifications.addInfo("Please Selecet at least one character!")
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
      var editoR = atom.workspace.getActiveTextEditor()
      var path = editoR.getPath()

      var assigned_project = project_lib.get_project_for_file(path)
      if (assigned_project == undefined){
        self_annotator.callback = self_annotator.update_patterns
        self_annotator.link_project(self_annotator.annotate_code)
        return
      }
      console.log(assigned_project)
      this.patternsView.build(assigned_project.id);
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
