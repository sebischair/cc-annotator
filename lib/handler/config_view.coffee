{CompositeDisposable} = require 'event-kit'
{ScrollView} = require 'atom-space-pen-views'
{$$, TextEditorView} = require 'atom-space-pen-views'
query = require './query'
project_lib = require './project'


fs = require('fs')
path_lib = require('path')
moment = require('moment')

self_config= {}
projects_mapping = {}

module.exports =
class ConfigView extends ScrollView
  @content: ->
     @div class: "configuration", overflow: "scroll", tabindex: -1, style: "overflow: scroll;", =>
       @div class:"general-information", style:"padding: 20px; padding-bottom: 10px;", =>
         @h1 class:"configuration-title", style:'font-size: 2em; font-weight: bold;', 'cc-annotator configuration'
       @div class:'project-mapping', style: 'padding: 20px; padding-top: 0px;', =>
         @h1 class:'section-title', "Projects"
         @table class: 'project_table', outlet:'projectTable',  =>
           @tr class: 'table-header-row', =>
             @th '', 'Opened Project'
             @th class: 'project-selection', 'Mapped Project'
         @div class:'btn btn-primary', outlet:'save_projects_button', 'Save'
       @div class:'user-information', style: 'padding: 20px; padding-top: 0px;', =>
         @h1 class:'section-title', "User Information"
         @div class:'information-container-name', outlet:'nameContainer', =>
           @div class:'information-title', 'Name:'
         @div class:'information-container-mail', =>
           @div class:'information-title', 'E-Mail:'
         @div class:'btn btn-primary', outlet:'save_user_button', 'Save'


  initialize: (state) ->
     super
     self_config = @

     url = "https://spotlight.in.tum.de/project"
     query.sebis_services_get(url, "")
          .then (response) ->
              self_config.handle_projects(response)
              self_config.add_user_information()
          #.catch (err) ->
          #     atom.notifications.addError("Could not get projects from server")

     @save_projects_button.on 'click', =>
       @save_project_mapping()

     @save_user_button.on 'click', =>
        @save_user_information()


  getTitle: () ->
    return 'Annotator Configuration'

  handle_projects: (response) ->
    self_config.projects_querried = response

    projects_mapping = atom.workspace.config.get('cc-annotator.projects')
    projects_querried = response
    projects_open = atom.project.rootDirectories
    for project in projects_open

      project_block = document.createElement('tr')
      project_block.classList.add('data_row')
      project_name = document.createElement('td')
      project_name.setAttribute('project_path', project.path)
      project_name.classList.add('project-name');
      project_name.textContent = project.path.substring(project.path.lastIndexOf(path_lib.sep) + 1)
      project_block.appendChild(project_name)

      mapped = false
      project_mapped_entry = document.createElement('td')
      project_block.appendChild(project_mapped_entry)
      select_block = document.createElement('select')
      select_block.classList.add('form-control', 'btn')
      project_mapped_entry.appendChild(select_block)

      for project_querried in projects_querried

        option = document.createElement('option')
        option.classList.add('dropdown-toggle');
        option.setAttribute("is", "space-pen-option");
        option.setAttribute("value", project_querried.id);
        option.setAttribute("project_name", project_querried.name);
        option.setAttribute("project_description", project_querried.description)
        option.textContent = project_querried.name
        select_block.appendChild(option)

        for project_mapped in projects_mapping
          if project_mapped.root_dir == project.path && project_mapped.id == project_querried.id
            console.log(project_mapped)
            option.setAttribute("selected", "selected");
            mapped = true

      if !mapped
        console.log(project_mapped)
        option = document.createElement('option')
        option.classList.add('dropdown-toggle');
        option.setAttribute("is", "space-pen-option");
        option.setAttribute("value", 'none');
        option.setAttribute("project_name", 'none');
        option.setAttribute("project_description", 'none');
        option.setAttribute("selected", "selected");
        option.textContent = "Select"
        select_block.appendChild(option)
      @find('table').append(project_block)


  save_project_mapping: () ->
    atom.notifications.addInfo("message")

    new_mappings = []

    rows = self_config.find('tr.data_row')
    for row in rows
      project = row.children[0]
      project_selection = row.children[1]


      selector = project_selection.getElementsByClassName('form-control')[0]
      selected_index = selector.selectedIndex
      options = project_selection.getElementsByClassName('dropdown-toggle')
      option = options[selected_index]

      new_mapping = {root_dir: project.getAttribute('project_path')}
      new_mapping.id = option.getAttribute('value')
      new_mapping.name = option.getAttribute('project_name')
      new_mapping.description = option.getAttribute('project_description')
      new_mappings.push(new_mapping)

    atom.workspace.config.set('cc-annotator.projects', new_mappings)

  add_user_information: () ->

    user = project_lib.get_cached_user_info();
    @textEditorName = document.createElement 'atom-text-editor'
    @textEditorName.classList.add('editor', 'mini', 'submit_name_information', 'text_editor');
    @textEditorName.setAttribute("mini", "");
    @textEditorName.getModel().setText(user.name)
    container = document.getElementsByClassName('information-container-name')[0]
    container.appendChild(@textEditorName)

    @textEditorEMail = document.createElement 'atom-text-editor'
    @textEditorEMail.classList.add('editor', 'mini', 'submit_mail_information', 'text_editor');
    @textEditorEMail.setAttribute("mini", "");
    @textEditorEMail.getModel().setText(user.mail)
    container = document.getElementsByClassName('information-container-mail')[0]
    container.appendChild(@textEditorEMail)

  save_user_information: () ->
    user = {}
    user.name = @textEditorName.getModel().getText()
    user.mail = @textEditorEMail.getModel().getText()
    project_lib.update_cached_user(user)
