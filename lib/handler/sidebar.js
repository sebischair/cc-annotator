var CompositeDisposable, SidebarView, View;
var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
  for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
  function ctor() { this.constructor = child; }
  ctor.prototype = parent.prototype;
  child.prototype = new ctor;
  child.__super__ = parent.prototype;
  return child;
}, __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

registerOrUpdateElement = require('atom-utils').registerOrUpdateElement;
View = require('atom-space-pen-views').View;
CompositeDisposable = require('atom').CompositeDisposable;

title = "HELLO WORLD";

module.exports = SidebarView = (function() {
        __extends(SidebarView, View);

        function SidebarView() {
          SidebarView.__super__.constructor.apply(this, arguments);
          SidebarView.prototype.disposables = new CompositeDisposable()
        }

        SidebarView.prototype.activated = false;

        SidebarView.content = function() {
          return this.div({
            "class": 'annotation-panel panel-right side-pane'
          }, __bind(function() {

            this.div({
                "class": 'annotation-box'
              }, __bind(function() {

                this.div({'class':'title', 'id':'title_id'}, title)

                return this.button({
                  outlet: 'gutterColorCycle',
                  "class": 'btn'
                }, 'Wooop Wooop ');
              }, this));



            // BOTTON BOX
            return this.div({
              "class": 'btn-toolbar'
            }, __bind(function() {
              this.div({
                "class": 'btn-group'
              }, __bind(function() {
                this.button({
                  outlet: 'gutterToggle',
                  "class": 'btn'
                }, '<< Back');
                this.button({
                  outlet: 'gutterColorCycle',
                  "class": 'btn'
                }, 'Prev');
                return this.button({
                  outlet: 'gutterColorCycle',
                  "class": 'btn'
                }, 'Next');
              }, this));

            }, this));
          }, this));
        };

        SidebarView.prototype.initialize = function() {

        };

        SidebarView.prototype.update = function() {

        }

        SidebarView.prototype.attach = function() {
            return atom.workspace.addRightPanel({
              item: this,
              priority: 0
            })
        };

        SidebarView.prototype.display_annotation = function(annotation) {
          atom.notifications.addSuccess("Would update sidebar: \n"+JSON.stringify(annotation))
          if (!SidebarView.prototype.activated){
              this.attach();
              SidebarView.prototype.activated = true;
          } else {
              SidebarView.prototype.title = "Update";
              var panels = atom.workspace.getRightPanels();
              for (i = 0; i < panels.length; i++){
                console.log(panels[i])
                panels[i].destroy()
                title = "Update "+i;
              }
              SidebarView.prototype.activated = false;
          }
        };

        return SidebarView;
})();
