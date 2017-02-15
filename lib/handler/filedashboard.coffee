{CompositeDisposable} = require 'event-kit'

{ScrollView} = require 'atom-space-pen-views'

Highcharts = require('highcharts')
fs = require('fs')
path = require('path')
moment = require('moment')

module.exports =
class FileDashboard extends ScrollView
  @content: ->
     @div class: "test", overflow: "scroll", tabindex: -1, style: "overflow: scroll;", =>
       @div class:'container1', style: 'padding: 20px 20px 20px 20px;'
       @div class:'container2', style: 'padding: 20px 20px 20px 20px;'
       @div class:'container3', style: 'padding: 20px 20px 20px 20px; height: 45%;overflow: scroll;', overflow: "scroll", tabindex: -1

   initialize: (state) ->
     super
     console.log("State path: " + state.path)
     dir = @getParentDirectory(state.path)
     file= state.path.substring(state.path.lastIndexOf(path.sep) + 1)
     console.log("Directory Path: " + dir)
     @getAnnotationandFileSize(dir, file)
     @getUserContributions(dir, file)
     @getTagDistributions(dir, file)
     @addGraph(dir, file, @setFilter)
     @getAnnoationsinFile(dir, file)
     @addListPane(dir, file, @setFilter)

  addGraph: (dir, file, callback) ->
    newDiv1 = document.createElement('div')
    newDiv1.style = "width: 100%; height: 40%;"
    @find('div.container1').append(newDiv1)
    myChart1 = new (Highcharts.Chart)(
      chart:
        renderTo: newDiv1
        type: 'areaspline'
      title: text: 'Annoated lines vs File size comparion over time'
      xAxis: categories: [
        'Week 1'
        'Week 2'
        'Week 3'
        'Week 4'
        'Week 5'
      ]
      yAxis: title: text: 'Number of Lines'
      series:[
        {
          name: 'Total Number of lines in file'
          data: [
            12
            17
            26
            37
            53
          ]
        }
        {
          name: 'Number of Annotated lines in the file'
          data: [
            6
            3
            0
            11
            17
          ]
        }
      ])

    newSpan1 = document.createElement('div')
    newSpan1.style = "width: 33%; height: 45%; display: inline-block;"
    @find('div.container2').append(newSpan1)
    piechart1 = new (Highcharts.Chart)(
      chart:
        renderTo: newSpan1
        type: 'pie'
      title: text: 'User Generated Annotations by Users'
      plotOptions: pie:
        allowPointSelect: true
        cursor: 'pointer'
        dataLabels: enabled: false
        showInLegend: true
        point: events: click: ->
          console.log('value: ' + @name)
          callback(
              path: path.join(dir,file)
              user: @name
            )
      series: [ {
        name: 'Annotations created'
        colorByPoint: true
        data: @set4
      } ])

    newSpan3 = document.createElement('div')
    newSpan3.style = "width: 33%; height: 45%; display: inline-block;"
    @find('div.container2').append(newSpan3)
    piechart1 = new (Highcharts.Chart)(
      chart:
        renderTo: newSpan3
        type: 'pie'
      title: text: 'Machine Generated Annotations by Tags'
      plotOptions: pie:
        allowPointSelect: true
        cursor: 'pointer'
        dataLabels: enabled: false
        showInLegend: true
      series: [ {
        name: 'Annotations tagged'
        innerSize: '50%'
        colorByPoint: true
        data: [
          {
            name: "File Line Count"
            y: @filelinecount
          }
          {
            name: "Annoated Lines Count"
            y: @annotationcount
          }
        ]
      } ])

    newSpan2 = document.createElement('div')
    newSpan2.style = "width: 33%; height: 45%; display: inline-block;"
    @find('div.container2').append(newSpan2)
    piechart1 = new (Highcharts.Chart)(
      chart:
        renderTo: newSpan2
        type: 'pie'
      title: text: 'Machine Generated Annotations by Tags'
      plotOptions: pie:
        allowPointSelect: true
        cursor: 'pointer'
        dataLabels: enabled: false
        point: events: click: ->
          console.log('value: ' + @name)
          callback(
              path: path.join(dir,file)
              tag: @name
            )
        showInLegend: true
      series: [ {
        name: 'Annotations tagged'
        colorByPoint: true
        data: @set5
      } ])

  setFilter: (newstate) =>
    @tag = undefined
    @user = undefined
    if(newstate.tag != undefined)
      @tag = newstate.tag
    else if(newstate.user != undefined)
      @user = newstate.user
    dir = @getParentDirectory(newstate.path)
    file= newstate.path.substring(newstate.path.lastIndexOf(path.sep) + 1)
    @find('div.container3').empty()
    @getAnnoationsinFile(dir, file)
    @addListPane(dir, file, @setFilter)

  getTitle: () ->
    return 'Dashboard'

  getParentDirectory: (somepath) ->
    return somepath.substring(0, somepath.lastIndexOf(path.sep))

  getAnnotationandFileSize: (dir, file) ->
    count = 0
    fileName = path.join(dir, '.annotator')
    try
      json = fs.readFileSync(fileName)
      data = JSON.parse(json)
      annotatedFiles = data.annotated_files
      for annot in annotatedFiles
        if(annot.meta.name == file)
          count += annot.annotations.length
          for cust in annot.custom_annotations
            clength = (cust.range.end.row) - (cust.range.start.row) + 1
            console.log("Clength " + clength)
            count += clength
      console.log("Total length ------------->" + count)
      @annotationcount = count
      contentoffile = fs.readFileSync(path.join(dir,file))
      filelines = contentoffile.toString().split("\n").length
      console.log("File length " + filelines)
      @filelinecount = filelines
    catch error
      console.log('Error: ' + error)

  getUserContributions: (dir, file) ->
    list1 = []
    userCntMap = {}
    @set4 = []
    fileName = path.join(dir, '.annotator')
    console.log(".annotator file " + dir)
    try
      json = fs.readFileSync(fileName)
      data = JSON.parse(json)
      annotatedFiles = data.annotated_files
      for annot in annotatedFiles
        if(annot.meta.name == file)
          for cust in annot.custom_annotations
            console.log("File in .annotator " + annot.meta.name )
            console.log("Actual file .annotator " + file )
            if(annot.meta.name == file)
              if(list1.indexOf(cust.user.name) == -1)
                list1.push(cust.user.name)
              if(typeof userCntMap[cust.user.name] == 'undefined')
                userCntMap[cust.user.name] = 1
              else
                console.log('In else...')
                userCntMap[cust.user.name] += 1
      for usr in list1
        @set4.push({
            name: usr
            y: userCntMap[usr]
          })
      console.log("Formated List --->")
      console.log(@set4)
    catch error
      console.log('Error: ' + error)

  getTagDistributions: (dir, file) ->
    list1 = []
    userCntMap = {}
    @set5 = []
    fileName = path.join(dir, '.annotator')
    try
      json = fs.readFileSync(fileName)
      data = JSON.parse(json)
      annotatedFiles = data.annotated_files
      for annot in annotatedFiles
        if(annot.meta.name == file)
          for mach in annot.annotations
            for tag in mach.tags
              if(list1.indexOf(tag) == -1)
                list1.push(tag)
              if(typeof userCntMap[tag] == 'undefined')
                userCntMap[tag] = 1
              else
                console.log('In else...')
                userCntMap[tag] += 1
          for cust in annot.custom_annotations
            for tag in cust.tags
              if(list1.indexOf(tag) == -1)
                list1.push(tag)
              if(typeof userCntMap[tag] == 'undefined')
                userCntMap[tag] = 1
              else
                console.log('In else...')
                userCntMap[tag] += 1
      for tag in list1
        @set5.push({
            name: tag
            y: userCntMap[tag]
          })
      console.log("Formated List --->")
      console.log(@set5)
    catch error
      console.log('Error: ' + error)

  addListPane: (dir,file, callback) ->
    thisfile = path.join(dir,file)
    @currentfile = thisfile
    newdiv = document.createElement('div')
    newdiv.classList.add('example-rendered')
    list = document.createElement('ul')
    list.classList.add('list-tree')
    list.classList.add('has-collapsable-children')
    for element in @linespresent
      elem1 = document.createElement('li')
      elem1.classList.add('list-nested-item')
      elem1.classList.add('annot-item')
      elemccon = document.createElement('div')
      elemccon.classList.add('list-item')
      con1 = document.createElement('span')
      con1.innerHTML = @annoFile[element].name
      con1.style = "padding: 15px 5px 15px 5px;font-weight: bold;"
      #con1.classList.add('badge')
      #con1.classList.add('badge-info')
      childul = document.createElement('ul')
      childul.classList.add('list-tree')
      childul.classList.add('has-flat-children')
      sublitem = document.createElement('li')
      sublitem.classList.add('list-item')
      subcon1 = document.createElement('div')
      subcon1.classList.add('code-style')
      subcon1.innerHTML = @annoFile[element].line
      subcon2 = document.createElement('div')
      subcon2.style= "width: 80%; overflow:hidden; word-wrap: break-word; display: inline-block;padding: 15px 5px 15px 5px;"
      subcon2.innerHTML = "Description: " + @annoFile[element].desc
      subcon3 = document.createElement('div')
      subcon3.style = "width: 20%;display: inline-block;padding: 15px 25px 15px 5px"
      subbut = document.createElement('button')
      subbut.classList.add('btn')
      subbut.classList.add('btn-primary')
      subbut.innerHTML = "Checkout in file"
      do(element, thisfile) ->
        subbut.addEventListener 'click', =>
          console.log("Element " + element)
          console.log("This File " + thisfile)
          atom.workspace.open thisfile,
           initialLine: element
      subcon3.appendChild(subbut)
      sublitem.appendChild(subcon1)
      sublitem.appendChild(subcon2)
      sublitem.appendChild(subcon3)
      elemccon.appendChild(con1)
      childul.appendChild(sublitem)
      elem1.appendChild(elemccon)
      elem1.appendChild(childul)
      list.appendChild(elem1)
    if(@user != undefined || @tag != undefined)
      filterArea = document.createElement('div')
      filterArea.style = "padding: 5px;"
      filterlabel = @createFilterLabel()
      if(@user != undefined)
        filterelem = @createFilterElement(@user)
      if(@tag != undefined)
        filterelem = @createFilterElement(@tag)
      filterremove = @createFiletrRemoveButton()
      filterremove.addEventListener 'click', ->
        callback(
            path: path.join(dir,file)
          )
      filterArea.appendChild(filterlabel)
      filterArea.appendChild(filterelem)
      filterArea.appendChild(filterremove)
      @find('div.container3').append(filterArea)
    @find('div.container3').append(list)

  createFilterLabel : ->
      filterlabel = document.createElement('span')
      filterlabel.style = "padding: 5px 20px 5px 20px;"
      #filterlabel.classList.add('badge')
      #filterlabel.classList.add('badge-success')
      filterlabel.innerHTML = 'Filtered By'
      return filterlabel

  createFilterElement: (filtertag) ->
      filterelem = document.createElement('span')
      filterelem.style = "padding: 5px 20px 5px 20px;"
      filterelem.classList.add('badge')
      filterelem.classList.add('badge-success')
      filterelem.classList.add('icon')
      filterelem.classList.add('icon-tag')
      filterelem.innerHTML = filtertag
      return filterelem

  createFiletrRemoveButton: ->
    filterremove = document.createElement('span')
    filterremove.style = "margin-left: 30px; padding: 5px 20px 5px 20px;  cursor: pointer; cursor: hand;"
    filterremove.classList.add('badge')
    filterremove.classList.add('badge-error')
    filterremove.classList.add('icon')
    filterremove.classList.add('icon-x')
    filterremove.innerHTML = 'Remove Filter'
    return filterremove

  openParticularLine: (file, line) =>
      atom.workspace.open file,
          initialLine: line

  getAnnoationsinFile: (dir, file) ->
    @annoFile = {}
    @linespresent = []
    fileName = path.join(dir, '.annotator')
    try
      json = fs.readFileSync(fileName)
      data = JSON.parse(json)
      annotatedFiles = data.annotated_files
      if(typeof(@tag) != 'undefined')
        console.log("Tag is " + @tag)
        for annot in annotatedFiles
          if(annot.meta.name == file)
            ourfile = path.join(dir,file)
            curr = fs.readFileSync(ourfile)
            currfile = curr.toString().split("\n")
            console.log("Length " + currfile.length)
            for mach in annot.annotations
              console.log("Tags --> " + mach.tags)
              if(mach.tags.indexOf(@tag) != -1)
                for elem in mach.rows
                  console.log("Elem " + elem)
                  if(@linespresent.indexOf(elem) == -1)
                    @linespresent.push(elem)
                    @annoFile[elem] = {
                        file: ourfile
                        row : elem
                        line: currfile[elem]
                        name: mach.name
                        desc: mach.description
                        }
            for cust in annot.custom_annotations
              console.log("Elem " + cust.range.start.row)
              if(cust.tags.indexOf(@tag) != -1)
                if(@linespresent.indexOf(cust.range.start.row) == -1)
                  @linespresent.push(cust.range.start.row)
                  @annoFile[cust.range.start.row] = {
                        file: ourfile
                        row : cust.range.start.row
                        line: currfile.slice(cust.range.start.row, 1 + cust.range.end.row ).join("</br>")
                        name: 'Custom Annotation'
                        desc: cust.description
                        }
      else if(typeof(@user) != 'undefined')
        console.log("User is " + @user)
        for annot in annotatedFiles
          if(annot.meta.name == file)
            ourfile = path.join(dir,file)
            curr = fs.readFileSync(ourfile)
            currfile = curr.toString().split("\n")
            console.log("Length " + currfile.length)
            for cust in annot.custom_annotations
              if(cust.user.name == @user)
                console.log("Elem " + cust.range.start.row)
                if(@linespresent.indexOf(cust.range.start.row) == -1)
                  @linespresent.push(cust.range.start.row)
                  @annoFile[cust.range.start.row] = {
                        file: ourfile
                        row : cust.range.start.row
                        line: currfile.slice(cust.range.start.row, 1 + cust.range.end.row ).join("</br>")
                        name: 'Custom Annotation'
                        desc: cust.description
                        }
      else
        for annot in annotatedFiles
          if(annot.meta.name == file)
            ourfile = path.join(dir,file)
            curr = fs.readFileSync(ourfile)
            currfile = curr.toString().split("\n")
            console.log("Length " + currfile.length)
            for mach in annot.annotations
              for elem in mach.rows
                console.log("Elem " + elem)
                if(@linespresent.indexOf(elem) == -1)
                  @linespresent.push(elem)
                  @annoFile[elem] = {
                      file: ourfile
                      row : elem
                      line: currfile[elem]
                      name: mach.name
                      desc: mach.description
                    }
            for cust in annot.custom_annotations
              console.log("Elem " + cust.range.start.row)
              if(@linespresent.indexOf(cust.range.start.row) == -1)
                @linespresent.push(cust.range.start.row)
                @annoFile[cust.range.start.row] = {
                      file: ourfile
                      row : cust.range.start.row
                      line: currfile.slice(cust.range.start.row, 1 + cust.range.end.row ).join("</br>")
                      name: 'Custom Annotation'
                      desc: cust.description
                    }
      console.log("Lines " + @linespresent)
      console.log("Annotations Retirved")
      for entry in @linespresent
        console.log(entry)
        console.log(@annoFile[entry])
    catch error
      console.log('Error: ' + error)
