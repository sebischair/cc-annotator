{CompositeDisposable} = require 'event-kit'

{ScrollView} = require 'atom-space-pen-views'

Highcharts = require('highcharts')
fs = require('fs')
path = require('path')

module.exports =
class Dashboard extends ScrollView
  @content: ->
     @div class: "test", overflow: "scroll", tabindex: -1, style: "overflow: scroll;", =>
       @div class:'container1', style: 'padding: 20px 20px 20px 20px;'
       @div class:'container2', style: 'padding: 20px 20px 20px 20px;'
       @div class:'container3', style: 'padding: 20px 20px 20px 20px;'

   initialize: (state) ->
     super
     console.log("State path: " + state.path)
     files_ = @getFilesinDirectory(state.path)
     for somefile in files_
       console.log(somefile)
     @getAnnotationCounts(files_ , state.path)
     @addGraph()

  addGraph: ->
    newDiv = document.createElement('div')
    newDiv.style = "width: 80%; height: 40%;"
    @find('div.container1').append(newDiv)
    myChart = new (Highcharts.Chart)(
      chart:
        renderTo: newDiv
        type: 'column'
      title: text: 'Files by number of Annotations'
      xAxis: categories: @set1
      yAxis: title: text: 'Number of Annotations'
      series: [
        {
          name: 'User Generated Annotation'
          data: @set2
        }
        {
          name: 'Machine Generated Annotation'
          data: @set3
        }
      ])

    newSpan1 = document.createElement('div')
    newSpan1.style = "width: 45%; height: 45%; display: inline-block;"
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
      series: [ {
        name: 'Annotations created'
        colorByPoint: true
        data: [
          {
            name: 'Max'
            y: 56
          }
          {
            name: 'Krishna'
            y: 40
            sliced: true
            selected: true
          }
          {
            name: 'Klym'
            y: 17
          }
          {
            name: 'Manoj'
            y: 24
          }
        ]
      } ])

    newSpan2 = document.createElement('div')
    newSpan2.style = "width: 45%; height: 45%; display: inline-block;"
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
        showInLegend: true
      series: [ {
        name: 'Annotations tagged'
        colorByPoint: true
        data: [
          {
            name: 'Cyclomatic complexity'
            y: 21
          }
          {
            name: 'Downcasting'
            y: 34
          }
          {
            name: 'Long method:'
            y: 11
          }
          {
            name: 'Feature envy'
            y: 24
          }
          {
            name: 'Inappropriate intimacy'
            y: 45
            sliced: true
            selected: true
          }
          {
            name: 'Orphan variable'
            y: 11
          }
        ]
      } ])

    newDiv2 = document.createElement('div')
    newDiv2.style = "width: 80%; height: 40%;"
    @find('div.container3').append(newDiv2)
    myChart2 = new (Highcharts.Chart)(
      chart:
        renderTo: newDiv2
        type: 'line'
      title: text: 'Files by number of Annotations'
      xAxis: categories: [
        'January'
        'February'
        'March'
        'April'
        'May'
        'June'
        'July'
      ]
      yAxis: title: text: 'Number of Annotations'
      series: [
        {
          name: 'User Generated Annotation'
          data: [
            1
            4
            4
            2
            8
            5
            7
          ]
        }
        {
          name: 'Machine Generated Annotation'
          data: [
            5
            7
            3
            3
            5
            8
            9
          ]
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
      for annot in annotatedFiles
        macgenAnnots[annot.meta.name] = annot.annotations.length
      for file in files
        @set1.push(file)
        if(typeof macgenAnnots[file] == 'undefined')
          @set2.push(0)
        else
          @set2.push(macgenAnnots[file] )
      for elem in @set1
        console.log('Element: ' + elem)
      for elem in @set2
        console.log('Value: ' + elem)
    catch error
      console.log('Error: ' + error)
