'use babel';

fs = require ('fs-plus')
decorations = {}

module.exports =  {


  listDecorations: function(editoR) {
    try{
      var path = editoR.getPath()

      for (i = 0; i <  decorations[path].length; i++){
           console.log( decorations[path][i])
      }

    } catch(e){

    }
  },

  destroyAnnotations: function(editoR){
    try{
      var path = editoR.getPath()

      for (i = 0; i <  decorations[path].length; i++){
           decorations[path][i].destroy()
      }

      decorations[path] = []

    } catch(e){

    }
  },

  annotation_line: function(annotation, editoR) {

    var line = annotation.id
    var score = annotation.score

    var range = [[line,0],[line,1]]
    var marker = editoR.markBufferRange(range, {invalidate: 'never'})
    //atom.notifications.addInfo("Marking Line "+line)

    if (score < 0.4) {
        var decoration = editoR.decorateMarker(marker, {type: 'line-number', class: 'line-number-red'})
        console.log(line)
        console.log(decoration)
    } else if (score < 0.6) {
        var decoration = editoR.decorateMarker(marker, {type: 'line-number', class: 'line-number-yellow'})
        console.log(line)
        console.log(decoration)
    } else {
        var decoration = editoR.decorateMarker(marker, {type: 'line-number', class: 'line-number-green'})
        console.log(line)
        console.log(decoration)
    }

    var path = editoR.getPath()
    try{
      decorations[path].push(decoration)
    } catch(e) {
      decorations[path] = []
      decorations[path].push(decoration)
    }



  },

  annotation_key: function(annotation, editoR) {

    var line = annotation.id
    var key_phrases = annotation.key_phrases
    var content = annotation.text

    for (var i = 0; i < key_phrases.length; i++){
        // To highlight the important phrases
        var start = content.indexOf(key_phrases[i])
        var length = key_phrases[i].length
        var end = start + length
        var range = [[line, start], [line, end]]
        var marker = editoR.markBufferRange(range)
        var decoration = editoR.decorateMarker(marker, {type: 'highlight', class: 'highlight-blue'})
        //atom.tooltips.add(marker, {title: "The package version"})

        var path = editoR.getPath()
        try{
          decorations[path].push(decoration)
        } catch(e) {
          decorations[path] = []
          decorations[path].push(decoration)
        }
    }

  },

  annotation_smell (smell, editoR) {
    smell.rows = []

    var path = editoR.getPath()
    var content = editoR.getText()

    var splites = content.split(smell.token)
    var line_nr_overall = 0
    for (i = 0; i < splites.length - 1; i ++){
      var lines = splites[i].split("\n")
      line_nr_local = lines.length - 1
      line_nr_overall += line_nr_local
      smell.rows.push(line_nr_overall)
      var line = lines[line_nr_local]
      var begin = line.length
      var end = begin + smell.token.length
      var range = [[line_nr_overall,begin],[line_nr_overall,end]]
      var marker = editoR.markBufferRange(range)
      var decoration_line_nr = editoR.decorateMarker(marker, {type: 'line-number', class: 'line-number-red'})
      var decoration_token = editoR.decorateMarker(marker, {type: 'highlight', class: 'highlight-red'})

      var path = editoR.getPath()

      try{
        decorations[path].push(decoration_line_nr)
        decorations[path].push(decoration_token)
      } catch(e) {
        decorations[path] = []
        decorations[path].push(decoration_line_nr)
        decorations[path].push(decoration_token)
      }


    }

    return smell

  }

}
