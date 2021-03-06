{CompositeDisposable} = require 'event-kit'

side_pane = {}

module.exports =
class PaneView extends HTMLElement
  initialize: (@name, @line, @file, @vote, @line_content, @description, @current_row, @type) ->
    side_pane = this

    side_pane.destroy()
    @closeElem = document.createElement('div')
    @closeElem.classList.add('close-container')
    @closeIcon = document.createElement('span')
    @closeIcon.classList.add('close-btn', 'icon', 'icon-remove-close')
    @closeIcon.addEventListener 'click', side_pane.destroy
    @closeElem.appendChild(@closeIcon)
    side_pane.appendChild(@closeElem)


    @nameElem = document.createElement('div')
    @nameElem.classList.add('smell-name', 'icon')
    side_pane.appendChild(@nameElem)

    @nameElem.textContent = @name
    @nameElem.title = @name

    # Token
    @tokenBox = document.createElement('div')
    @tokenBox.classList.add('smell-detail-box')

    @tokenTitle = document.createElement('span')
    @tokenTitle.classList.add('smell-detail-info', 'line')
    @tokenTitle.textContent = "Token:"
    @tokenBox.appendChild(@tokenTitle)

    @tokenSpan = document.createElement('span')
    @tokenSpan.classList.add('smell-detail-text', 'line')
    @tokenBox.appendChild(@tokenSpan)
    side_pane.appendChild(@tokenBox)

    @tokenSpan.textContent = @line_content

    # Lines
    @nameBox = document.createElement('div')
    @nameBox.classList.add('smell-detail-box')

    if(@type.startsWith("Machine"))
      @nameTitle = document.createElement('span')
      @nameTitle.classList.add('smell-detail-info', 'line')
      @nameTitle.textContent = "Lines:"
      @nameBox.appendChild(@nameTitle)

      @nameline = document.createElement('span')
      @nameline.classList.add('smell-detail-text', 'line')
      @nameBox.appendChild(@nameline)
      side_pane.appendChild(@nameBox)

      @nameline.textContent = (" "+(item + 1) for item in @line )
      @nameline.title = @line
    else
      @nameTitle = document.createElement('span')
      @nameTitle.classList.add('smell-detail-info', 'line')
      @nameTitle.textContent = "Line:"
      @nameBox.appendChild(@nameTitle)

      @nameline = document.createElement('span')
      @nameline.classList.add('smell-detail-text', 'line')
      @nameBox.appendChild(@nameline)
      side_pane.appendChild(@nameBox)

      @nameline.textContent = @current_row
      @nameline.title = @line

    # Description
    @descrBox = document.createElement('div')
    @descrBox.classList.add('smell-detail-box')

    @descrTitle = document.createElement('span')
    @descrTitle.classList.add('smell-detail-info', 'line')
    @descrTitle.textContent = "Description:"
    @descrBox.appendChild(@descrTitle)

    @descrTitle = document.createElement('div')
    @descrTitle.classList.add('smell-detail-text', 'line')
    @descrBox.appendChild(@descrTitle)
    side_pane.appendChild(@descrBox)

    @descrTitle.textContent = @description

    # Description
    @votesBox = document.createElement('div')
    @votesBox.classList.add('smell-detail-box')

    @votesTitle = document.createElement('span')
    @votesTitle.classList.add('smell-detail-info', 'line')
    @votesTitle.textContent = "Votes:"
    @votesBox.appendChild(@votesTitle)

    @votesTitle = document.createElement('span')
    @votesTitle.classList.add('smell-detail-text', 'line')
    @votesBox.appendChild(@votesTitle)
    side_pane.appendChild(@votesBox)

    @votesTitle.textContent = @vote

    # Buttons Box
    @buttonsBox = document.createElement('div')
    @buttonsBox.classList.add('buttons-box')

    @upVoteButton = document.createElement('span')
    @upVoteButton.classList.add('vote-title')
    @upVoteIcon = document.createElement('span')
    @upVoteIcon.classList.add('icon', 'icon-arrow-up')
    @upVoteButton.appendChild(@upVoteIcon)
    @buttonsBox.appendChild(@upVoteButton)
    @upVoteButton.textContent = "Vote:"

    @upVoteButton = document.createElement('button')
    @upVoteButton.classList.add('up-btn', 'btn', 'icon', 'icon-arrow-up')
    @upVoteButton.addEventListener 'click', @voteUpClick
    @buttonsBox.appendChild(@upVoteButton)

    #@upVoteButton.textContent = "Up"

    @upVoteButton = document.createElement('button')
    @upVoteButton.classList.add('up-btn', 'btn', 'icon', 'icon-arrow-down')
    @upVoteButton.addEventListener 'click', @voteDownClick
    @buttonsBox.appendChild(@upVoteButton)

    #@upVoteButton.textContent = "Down"

    side_pane.appendChild(@buttonsBox)


  setName: (name) ->
    @name = name

  getName: ->
    return @name

  setLine: (line) ->
    @line = line

  getLine: ->
    return @line

  setFile: (file) ->
    @file = file

  getFile: ->
    return @file

  setVote: (vote) ->
    @vote = vote

  getVote: ->
    return @vote

  setVote: (vote) ->
    @vote = vote

  getVote: ->
    return @vote

  getLineContent: ->
    return @line_content

  getDescription: ->
    return @description

  voteUpClick: ->
    side_pane.vote = side_pane.vote + 1
    side_pane.votesTitle.textContent = side_pane.vote
    atom.notifications.addInfo("Thanks for your feedback!")

  voteDownClick: ->
    side_pane.vote = side_pane.vote - 1
    side_pane.votesTitle.textContent = side_pane.vote
    atom.notifications.addInfo("Thanks for your feedback!")

  attach: ->
    @panel = atom.workspace.addRightPanel
                item: this
                priority: 0
  handleClose: ->
    @destroy()

  destroy: ->
    try
      side_pane.remove()
      side_pane.removeChild(@nameElem)
      side_pane.removeChild(@nameBox)
      side_pane.removeChild(@tokenBox)
      side_pane.removeChild(@descrBox)
      side_pane.removeChild(@buttonsBox)
      side_pane.removeChild(@votesBox)
      side_pane.removeChild(@closeElem)
      side_pane.empty()
      side_pane.panel.destroy()

    catch

module.exports = document.registerElement('side-pane', prototype: PaneView.prototype, extends: 'div')
