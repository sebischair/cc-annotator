{CompositeDisposable} = require 'event-kit'

{ScrollView} = require 'atom-space-pen-views'

Highcharts = require('highcharts')
fs = require('fs')
path = require('path')
moment = require('moment')

module.exports =
class Dashboard extends ScrollView
  @content: ->
     @div class: "test", overflow: "scroll", tabindex: -1, style: "overflow: scroll;", =>
       @div class:'filters',    style: 'padding: 20px 20px 5px 20px;'
       @div class:'container1', style: 'padding: 20px 20px 20px 20px;'
       @div class:'container2', style: 'padding: 20px 20px 20px 20px;'
       @div class:'container3', style: 'padding: 20px 20px 20px 20px;'

   initialize: (state) ->
     super
     console.log("State path: " + state.path)
     @updateState(state)

  updateState: (newstate) =>
    @destroyScene()
    console.log("Is user undefined? " + @user)
    console.log("Is tag undefined? " + @tag)
    console.log("State path: " + newstate.path)
    files_ = @getFilesinDirectory(newstate.path)
    if(typeof(newstate.user) != 'undefined')
      console.log("Setting user")
      @user = newstate.user
    if(typeof(newstate.tag) != 'undefined')
      console.log("Setting tag")
      @tag = newstate.tag
    for somefile in files_
      console.log(somefile)
    @getAnnotationCounts(files_ , newstate.path)
    @getUserContributions(newstate.path)
    @getTagDistributions(newstate.path)
    @getAnnotationsCountbyTime(newstate.path)
    @addFilter(newstate.path, @updateState)
    @addGraph(newstate.path, @updateState)

  destroyScene:  ->
    @user = undefined;
    @tag = undefined;
    @find('div.filters').empty()
    @find('div.container1').empty()
    @find('div.container2').empty()
    @find('div.container3').empty()

  addGraph: (directory ,callback) ->
    newDiv = document.createElement('div')
    newDiv.style = "width: 100%; height: 40%;"
    @find('div.container1').append(newDiv)
    myChart = new (Highcharts.Chart)(
      chart:
        renderTo: newDiv
        type: 'column'
      title: text: 'Files by number of Annotations'
      xAxis: categories: @set1
      yAxis: title: text: 'Number of Annotations'
      plotOptions: series:
        cursor: 'pointer'
        point: events: click: ->
          console.log('Category: ' + @category + ', value: ' + @y)
          return
      series: [
        {
          name: 'User Generated Annotation'
          data: @set3
        }
        {
          name: 'Machine Generated Annotation'
          data: @set2
        }
      ])

    newSpan1 = document.createElement('div')
    newSpan1.style = "width: 50%; height: 45%; display: inline-block;"
    @find('div.container2').append(newSpan1)
    piechart1 = new (Highcharts.Chart)(
      chart:
        renderTo: newSpan1
        type: 'pie'
      title: text: 'User Generated Annotations by Users'
      plotOptions: pie:
        allowPointSelect: true
        cursor: 'pointer'
        point: events: click: ->
          console.log('value: ' + @name)
          callback(
            uri: 'test'
            path: directory
            user: @name)
        dataLabels: enabled: false
        showInLegend: true
      series: [ {
        name: 'Annotations created'
        colorByPoint: true
        data: @set4
      } ])

    newSpan2 = document.createElement('div')
    newSpan2.style = "width: 50%; height: 45%; display: inline-block;"
    @find('div.container2').append(newSpan2)
    piechart1 = new (Highcharts.Chart)(
      chart:
        renderTo: newSpan2
        type: 'pie'
      title: text: 'Machine Generated Annotations by Tags'
      plotOptions: pie:
        allowPointSelect: true
        cursor: 'pointer'
        point: events: click: ->
          console.log('value: ' + @name)
          callback(
            uri: 'test'
            path: directory
            tag: @name)
        dataLabels: enabled: false
        showInLegend: true
      series: [ {
        name: 'Annotations tagged'
        colorByPoint: true
        data: @set5
      } ])

    newDiv2 = document.createElement('div')
    newDiv2.style = "width: 100%; height: 40%;"
    @find('div.container3').append(newDiv2)
    myChart2 = new (Highcharts.Chart)(
      chart:
        renderTo: newDiv2
        type: 'line'
      title: text: 'Files by number of Annotations'
      xAxis: categories: @set9
      yAxis: title: text: 'Number of Annotations'
      series: [
        {
          name: 'User Generated Annotation'
          data: @set7
        }
        {
          name: 'Machine Generated Annotation'
          data: @set8
        }
      ])

  getTitle: () ->
    return 'Dashboard'

  getFilesinDirectory: (dir) ->
    onlyFiles = []
    allFiles = fs.readdirSync(dir)
    for elem in allFiles
      fileobj = path.join(dir , elem)
      if(!fs.statSync(fileobj).isDirectory())
        onlyFiles.push(elem)
      else
        console.log(elem + " is a directory!!")
    return onlyFiles

  getAnnotationCounts: (files, dir) ->
    customAnnots = {}
    macgenAnnots = {}
    @set1 = []
    @set2 = []
    @set3 = []
    fileName = path.join(dir, '.annotator')
    try
      json = fs.readFileSync(fileName)
      data = JSON.parse(json)
      annotatedFiles = data.annotated_files
      if(typeof(@user) != 'undefined')
        for annot in annotatedFiles
          macgenAnnots[annot.meta.name] = annot.annotations.length
          for cust in annot.custom_annotations
            if(cust.user.name == @user)
              if(typeof(customAnnots[annot.meta.name]) == 'undefined' )
                customAnnots[annot.meta.name] = 0
              else
                customAnnots[annot.meta.name] += 1
      else if(typeof(@tag) != 'undefined')
        for annot in annotatedFiles
          macgenAnnots[annot.meta.name] = annot.annotations.length
          for cust in annot.custom_annotations
            if(cust.tags.indexOf(@tag) != -1)
              if(typeof(customAnnots[annot.meta.name]) == 'undefined' )
                customAnnots[annot.meta.name] = 0
              else
                customAnnots[annot.meta.name] += 1
      else
        for annot in annotatedFiles
          macgenAnnots[annot.meta.name] = annot.annotations.length
          customAnnots[annot.meta.name] = annot.custom_annotations.length
      for file in files
        if(file != '.annotator')
          @set1.push(file)
          if(typeof macgenAnnots[file] == 'undefined')
            @set2.push(0)
          else
            @set2.push(macgenAnnots[file] )
          if(typeof customAnnots[file] == 'undefined')
            @set3.push(0)
          else
            @set3.push(customAnnots[file] )
      for elem in @set1
        console.log('Element: ' + elem)
      for elem in @set2
        console.log('Annot Value: ' + elem)
      for elem in @set3
        console.log('Custo Value: ' + elem)
    catch error
      console.log('Error: ' + error)

  getUserContributions: (dir) ->
    list1 = []
    userCntMap = {}
    @set4 = []
    fileName = path.join(dir, '.annotator')
    try
      json = fs.readFileSync(fileName)
      data = JSON.parse(json)
      annotatedFiles = data.annotated_files
      if(typeof(@user) != 'undefined')
        for annot in annotatedFiles
          for cust in annot.custom_annotations
            if(cust.user.name == @user)
              if(list1.indexOf(cust.user.name) == -1)
                list1.push(cust.user.name)
              if(typeof userCntMap[cust.user.name] == 'undefined')
                userCntMap[cust.user.name] = 1
              else
                console.log('In else...')
                userCntMap[cust.user.name] += 1
      else if(typeof(@tag) != 'undefined')
        for annot in annotatedFiles
          for cust in annot.custom_annotations
            if(cust.tags.indexOf(@tag) != -1)
              if(list1.indexOf(cust.user.name) == -1)
                list1.push(cust.user.name)
              if(typeof userCntMap[cust.user.name] == 'undefined')
                userCntMap[cust.user.name] = 1
              else
                console.log('In else...')
                userCntMap[cust.user.name] += 1
      else
        for annot in annotatedFiles
          for cust in annot.custom_annotations
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

  addFilter: (directory, callback) ->
    if(typeof(@user) != 'undefined')
      filterlabel = @createFilterLabel()
      filterelem =  @createFilterElement(@user)
      filterremove = @createFiletrRemoveButton()
      filterremove.addEventListener 'click', ->
        callback(
          uri: 'test'
          path: directory
        )
      @find('div.filters').empty()
      @find('div.filters').append(filterlabel)
      @find('div.filters').append(filterelem)
      @find('div.filters').append(filterremove)
    else if(typeof(@tag) != 'undefined')
      filterlabel = @createFilterLabel()
      filterelem =  @createFilterElement(@tag)
      filterremove = @createFiletrRemoveButton()
      filterremove.addEventListener 'click', ->
        callback(
          uri: 'test'
          path: directory
        )
      @find('div.filters').empty()
      @find('div.filters').append(filterlabel)
      @find('div.filters').append(filterelem)
      @find('div.filters').append(filterremove)

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

  getTagDistributions: (dir) ->
    list1 = []
    userCntMap = {}
    @set5 = []
    fileName = path.join(dir, '.annotator')
    try
      json = fs.readFileSync(fileName)
      data = JSON.parse(json)
      annotatedFiles = data.annotated_files
      if(typeof(@user) != 'undefined')
        for annot in annotatedFiles
          for cust in annot.custom_annotations
            if(cust.user.name == @user)
              for tag in cust.tags
                if(list1.indexOf(tag) == -1)
                  list1.push(tag)
                if(typeof userCntMap[tag] == 'undefined')
                  userCntMap[tag] = 1
                else
                  console.log('In else...')
                  userCntMap[tag] += 1
      else if(typeof(@tag) != 'undefined')
        for annot in annotatedFiles
          for cust in annot.custom_annotations
            for tag in cust.tags
              if(tag == @tag)
                if(list1.indexOf(tag) == -1)
                  list1.push(tag)
                if(typeof userCntMap[tag] == 'undefined')
                  userCntMap[tag] = 1
                else
                  console.log('In else...')
                  userCntMap[tag] += 1
      else
        for annot in annotatedFiles
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


  getAnnotationsCountbyTime: (dir) ->
    customAnnots = {}
    macgenAnnots = {}
    @set6 = []
    @set7 = []
    @set8 = []
    @set9 = []
    @set6.push(moment().subtract(28, 'days'))
    @set6.push(moment().subtract(21, 'days'))
    @set6.push(moment().subtract(14, 'days'))
    @set6.push(moment().subtract(7 , 'days'))
    @set6.push(moment())
    fileName = path.join(dir, '.annotator')
    try
      json = fs.readFileSync(fileName)
      data = JSON.parse(json)
      annotatedFiles = data.annotated_files
      if(typeof(@user) != 'undefined')
        for annot in annotatedFiles
          for cust in annot.custom_annotations
            if(cust.user.name == @user)
              createdDate = @parseDate(cust.createdAt)
              console.log("Created Date " + createdDate)
              for timing in @set6
                if(timing.isAfter(createdDate))
                  if(typeof customAnnots[timing] == 'undefined')
                    customAnnots[timing] = 1
                  else
                    customAnnots[timing] += 1
                else
                  customAnnots[timing] = 0
      else if(typeof(@tag) != 'undefined')
        for annot in annotatedFiles
          for cust in annot.custom_annotations
            if(cust.tags.indexOf(@tag) != -1)
              createdDate = @parseDate(cust.createdAt)
              console.log("Created Date " + createdDate)
              for timing in @set6
                if(timing.isAfter(createdDate))
                  if(typeof customAnnots[timing] == 'undefined')
                    customAnnots[timing] = 1
                  else
                    customAnnots[timing] += 1
                else
                  customAnnots[timing] = 0
      else
        for annot in annotatedFiles
          for cust in annot.custom_annotations
            createdDate = @parseDate(cust.createdAt)
            console.log("Created Date " + createdDate)
            for timing in @set6
              if(timing.isAfter(createdDate))
                if(typeof customAnnots[timing] == 'undefined')
                  customAnnots[timing] = 1
                else
                  customAnnots[timing] += 1
              else
                customAnnots[timing] = 0
      for timing in @set6
        @set7.push(customAnnots[timing])
      for timing in @set6
        @set9.push('Week Ending ' + timing.format('ll'))
      console.log(@set6)
      console.log(@set7)
    catch error
      console.log('Error: ' + error)

  parseDate: (ufDate) ->
    date = ufDate.substring(8,10)
    month = ufDate.substring(4,7)
    year = ufDate.substring(ufDate.length - 4,ufDate.length)
    return moment(month + ' ' + date + ', ' + year).format('ll')
