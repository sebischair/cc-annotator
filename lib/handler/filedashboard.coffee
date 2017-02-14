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
       @div class:'container3', style: 'padding: 20px 20px 20px 20px;'

   initialize: (state) ->
     super
     console.log("State path: " + state.path)
     dir = @getParentDirectory(state.path)
     file= state.path.substring(state.path.lastIndexOf(path.sep) + 1)
     console.log("Directory Path: " + dir)
     @getAnnotationandFileSize(dir, file)
     @getUserContributions(dir, file)
     @getTagDistributions(dir, file)
     @getAnnotationsCountbyTime(dir, file)
     @addGraph()

  addGraph: ->
    newDiv1 = document.createElement('div')
    newDiv1.style = "width: 80%; height: 40%;"
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
            67
          ]
        }
        {
          name: 'Number of Annotated lines in the file'
          data: [
            6
            3
            15
            0
            3
          ]
        }
      ])

    newSpan1 = document.createElement('div')
    newSpan1.style = "width: 30%; height: 45%; display: inline-block;"
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
        data: @set4
      } ])

    newSpan3 = document.createElement('div')
    newSpan3.style = "width: 30%; height: 45%; display: inline-block;"
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
        data: @set5
      } ])

    newSpan2 = document.createElement('div')
    newSpan2.style = "width: 30%; height: 45%; display: inline-block;"
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
        data: @set5
      } ])

    newDiv2 = document.createElement('div')
    newDiv2.style = "width: 80%; height: 40%;"
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
          for mach in annot.annotations
            if(typeof(mach.rows[1]) != 'undefined')
              alength = (mach.rows[1]) - (mach.rows[0]) + 1
            else alength = 1
            console.log("Alength " + alength)
            count += alength
          for cust in annot.custom_annotations
            clength = (cust.range.end.row) - (cust.range.start.row) + 1
            console.log("Clength " + clength)
            count += clength
      console.log("Total length ------------->" + count)
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
        for cust in annot.custom_annotations
          if(annot.meta.name == file)
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


  getAnnotationsCountbyTime: (dir, file) ->
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
      for annot in annotatedFiles
        for cust in annot.custom_annotations
          if(annot.meta.name == file)
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
