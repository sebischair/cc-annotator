{CompositeDisposable} = require 'event-kit'

module.exports =
class PaneView extends HTMLElement
  initialize: (@name, @line, @file, @vote, @line_content, @description, @current_row) ->

    @closeElem = document.createElement('div')
    @closeElem.classList.add('close-container')
    @closeIcon = document.createElement('span')
    @closeIcon.classList.add('close-btn', 'icon', 'icon-remove-close')
    @closeIcon.addEventListener 'click', @destroy
    @closeElem.appendChild(@closeIcon)
    #@appendChild(@closeElem)


    @nameElem = document.createElement('div')
    @nameElem.classList.add('smell-name', 'icon')
    @appendChild(@nameElem)

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
    @appendChild(@tokenBox)

    @tokenSpan.textContent = @line_content

    # Lines
    @nameBox = document.createElement('div')
    @nameBox.classList.add('smell-detail-box')

    @nameTitle = document.createElement('span')
    @nameTitle.classList.add('smell-detail-info', 'line')
    @nameTitle.textContent = "Lines:"
    @nameBox.appendChild(@nameTitle)

    @nameline = document.createElement('span')
    @nameline.classList.add('smell-detail-text', 'line')
    @nameBox.appendChild(@nameline)
    @appendChild(@nameBox)

    @nameline.textContent = (" "+(item + 1) for item in @line )
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
    @appendChild(@descrBox)

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
    @appendChild(@votesBox)

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
    @upVoteButton.addEventListener 'click', @voteClick
    @buttonsBox.appendChild(@upVoteButton)

    #@upVoteButton.textContent = "Up"

    @upVoteButton = document.createElement('button')
    @upVoteButton.classList.add('up-btn', 'btn', 'icon', 'icon-arrow-down')
    @upVoteButton.addEventListener 'click', @voteClick
    @buttonsBox.appendChild(@upVoteButton)

    #@upVoteButton.textContent = "Down"

    @appendChild(@buttonsBox)


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

  voteClick: ->
    atom.notifications.addInfo("Thanks for your feedback!")

  attach: ->
    @panel = atom.workspace.addRightPanel
                item: this
                priority: 0
  handleClose: ->
    @destroy()

  destroy: ->
    @remove()
    @removeChild(@nameElem)
    @removeChild(@nameBox)
    @removeChild(@tokenBox)
    @removeChild(@descrBox)
    @removeChild(@buttonsBox)
    @removeChild(@votesBox)
    #@removeChild(@closeElem)
    @panel.destroy()

module.exports = document.registerElement('side-pane', prototype: PaneView.prototype, extends: 'div')
