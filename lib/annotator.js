'use babel';

import AnnotatorView from './annotator-view';
import query from './handler/query';
import decoration from './handler/decoration';
import comment from './handler/comment';
import Dashboard from './handler/dashboard';
import storage from './handler/storage';
import SidebarView from './handler/sidebar';
import PaneView from './handler/side-pane';
import AnnotationModal from './handler/annotation-modal';
import DetectionPatternModal from './handler/detection-patterns-modal'
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

  activate(state) {
    self = this
    annotator_self = this
    this.annotatorView = new AnnotatorView(state.annotatorViewState);
    this.modalPanel = atom.workspace.addModalPanel({
      item: this.annotatorView.getElement(),
      visible: false
    });

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();
    this.modalView = new AnnotationModal({ content: "HEllo World"}, self);
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
        return function(filePath) {
          if (filePath === dashUri) {
            return _this.createDashboardView({
              uri: dashUri
            });
          }
        };
      })(this)));

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'annotator:annotate_code': () => this.annotate_code()
    }));
    /*this.subscriptions.add(atom.commands.add('atom-workspace', {
      'annotator:annotate_comment': () => this.annotate_comment()
    }));*/
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'annotator:submit_annotation': () => this.submit_annotation()
    }));
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'annotator:update_patterns': () => this.update_patterns()
    }));

    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'annotator:open_dashboard': () => this.open_dashboard()
    }));

    this.SidebarView = new PaneView();

    atom.notifications.addSuccess("Started Annotator Plugin")

    var directories = atom.project.getDirectories()
    for (i = 0; i < directories.length; i++){
      var rootPath = directories[i].getPath()
      console.log("Root Path " + rootPath)
      this.getAnnotatedFilesUnderaDirectory(rootPath)
    }

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
  annotate_code() {
    self = this
    let editoR
    if (editoR = atom.workspace.getActiveTextEditor()){

      self.editoR = editoR
      // Save open editor to ensure the right data is send to the server

      var path = editoR.getPath()
      var full_path = editoR.getPath()
      var file_content = editoR.getText()
      var file_name = path.substring(path.lastIndexOf(path_lib.sep) + 1)
      var file_lang = storage.get_file_lang(file_name)
      var project_id = "5834589c88695d217c1eed1a"

      var content = {
        "content": file_content,
        "progLanguage": file_lang,
        "fileName": file_name,
        "projectId": project_id
      }

      var path = editoR.getPath()
      this.annotations_code[path] = []

      url_sentiment = "https://spotlight.in.tum.de/processCode"
      //atom.notifications.addInfo("Requesting annotation!")
      query.sebis_services(url_sentiment, content).then((response) => {
            //atom.notifications.addSuccess(response)
            response_parsed = JSON.parse(response)
            var smells = response_parsed.data

            var path = editoR.getPath()
            this.annotations_code[path] = []
            decoration.destroyAnnotations(editoR)

            for (var i = 0; i < smells.length; i++){
              var smell = smells[i]
              smell = decoration.annotation_smell(smell, editoR)
              self.annotations_code[path].push(smell)
            }

            response_parsed.annotations   = smells
            response_parsed.meta['name']  = content.fileName
            response_parsed.meta['lang']  = content.progLanguage
            response_parsed.meta['hash']  = storage.createHash(content.content)
            delete response_parsed['data']
            delete response_parsed['status']

            storage.store_annotator_file(editoR.getPath(), response_parsed)

      }).catch((err) => {
        console.log("ERROR: "+JSON.stringify(err))
      })/**/

      self.SidebarViewInitialized = false

      editoR.onDidChangeCursorPosition(function(event){
            var cursor = event.cursor
            var position = event.cursor.getBufferPosition();
            var editoR = atom.workspace.getActiveTextEditor();
            var path = editoR.getPath();
            self.clicked_annotated_line_number(position, path, function (smell) {
                //atom.notifications.addWarning(smell.name+" at line " +position.row)
                //self.SidebarView.display_annotation(smell);
                if (!self.SidebarViewInitialized){
                  self.SidebarViewInitialized = true
                } else {
                  self.SidebarView.destroy()
                }

                smell.description = "Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet."
                smell.votes = 0
                if (smell.name == "Hardcoded system name detected"){
                  smell.votes = 3
                }
                self.SidebarView.initialize(smell.name, smell.rows, "@file", smell.votes, smell.token, smell.description, position.row)
                self.SidebarView.attach()

            });

      });

      editoR.onDidChange(this.update_annotation_indices);
      self.applyCSSStyling(full_path)
    }
  },

  open_dashboard(){
    console.log("Creating Panel..")
    atom.workspace.open(dashUri)
  },

  get_range(smell, file_content) {
    var prev_content = file_content.substring(smell.begin)
    var line = (prev_content.match(/\n/g) || []).length;
  },

  clicked_annotated_line_number(position, path, callback){
      var row = position.row - 1
      console.log(row+","+position.column)

      if (position.column == 0) {

          for(var i = 0; i < this.annotations_code[path].length; i++){
              var smell = this.annotations_code[path][i]
              var rows = smell.rows
              console.log(JSON.stringify(rows))
              if (this.isInArray(row, rows)) {
                callback(smell)
                return
              }
          }

      }

      return false

  },

  isInArray(value, array) {
    return array.indexOf(value) > -1;
  },

  update_annotation_indices(){
    var editoR = atom.workspace.getActiveTextEditor()

    var path = editoR.getPath()
    var smells = self.annotations_code[path]
    self.annotations_code[path] = []
    decoration.destroyAnnotations(editoR)

    for (var i = 0; i < smells.length; i++){
      var smell = smells[i]
      smell = decoration.annotation_smell(smell, editoR)
      self.annotations_code[path].push(smell)
    }
  },

  submit_annotation(){
    self = this;
    let editoR
    if (editoR = atom.workspace.getActiveTextEditor()){
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
          lang: lang,
          code: code
        }

        if ((range.end.column - range.start.column) > 1){
          this.modalView.show(annotation);
          this.modal.show();
        }
    }
  },


    update_patterns(){
        projectId = ""
        this.patternsView.build(projectId);
        this.patternsModal.show();
    },

  toogle_modal(){
    if (this.modal.isVisible()) {
      this.modal.hide();
    }
    else {
      this.modal.show();
    }
  }

};
