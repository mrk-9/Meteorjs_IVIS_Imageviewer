import { Template } from 'meteor/templating';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { Session } from 'meteor/session';
import { Tracker } from 'meteor/tracker';
import { _ } from 'meteor/underscore';
import { $ } from 'meteor/jquery';
import { OHIF } from 'meteor/ohif:core';
import { viewportUtils } from '../../../lib/viewportUtils';
import { switchToImageRelative } from '../../../lib/switchToImageRelative';
import { switchToImageByIndex } from '../../../lib/switchToImageByIndex';


Template.contextMenu.helpers({
  contextMenuButtons() {
    const contextButton = [];
    contextButton.push({
        id: 'context_wl',
        title: 'Levels',
        classes: 'imageViewerTool',
        svgLink_over: '/images/nav-levels.svg#over',
        svgLink_on:'/images/nav-levels.svg#on',
        svgLink_off:'/images/nav-levels.svg#off'
    });
    contextButton.push({
        id: 'context_pan',
        title: 'Pan',
        classes: 'imageViewerTool',
        svgLink_over: '/images/nav-pan.svg#over',
        svgLink_on:'/images/nav-pan.svg#on',
        svgLink_off:'/images/nav-pan.svg#off'
    });

    contextButton.push({
        id: 'context_zoom',
        title: 'Zoom',
        classes: 'imageViewerTool',
        svgLink_over: '/images/nav-zoom.svg#over',
        svgLink_on:'/images/nav-zoom.svg#on',
        svgLink_off:'/images/nav-zoom.svg#off'
    });
    return contextButton;
  },
  contextMenusvgLink() {
      const instance = Template.instance();
      console.log('instance.data.id::', instance);
      var svgLink;
          if(!Session.get('drawTool')){
                svgLink = instance.getActiveToolSubProperty('svgLink_over', instance.data.id);
          }
          else{
            svgLink = instance.getActiveToolSubProperty('svgLink_over', activeToolId);
          }

      return _.isFunction(svgLink) ? contextMenusvgLink() : svgLink;
  },
  contextMenuiconClasses() {
      Session.get('ToolManagerActiveToolUpdated');
      const instance = Template.instance();
      const activeToolId = OHIF.viewerbase.toolManager.getActiveTool();
      const iconClasses = instance.getActiveToolSubProperty('iconClasses', activeToolId);
      return _.isFunction(iconClasses) ? contextMenuiconClasses() : iconClasses;
  },
});

Template.contextMenu.onCreated(() => {
  const instance = Template.instance();
  instance.getActiveToolSubProperty = (propertyName, activeToolId) => {
      const instance = Template.instance();
      const subTools = instance.data.subTools;
      const defaultProperty = instance.data[propertyName];
      const currentId = instance.data.id;

      if (subTools && activeToolId !== currentId && instance.isActive(activeToolId)) {
          const subTool = _.findWhere(subTools, { id: activeToolId });
          return subTool ? subTool[propertyName] : defaultProperty;
      } else {
          return defaultProperty;
      }
  };
});

Template.contextMenu.onRendered(() => {

});

Template.contextMenu.onDestroyed(() => {
    const instance = Template.instance();
    // remove resize handler...
    instance.setResizeHandler(null);
});

Template.contextMenu.events({
    'click #context_wl'(event){
        let imageUrl = '/imageviewer/images/nav-levels-on.png';
        $("#context_wl").css('background', 'url(' + imageUrl + ')');
        $("#context_wl").css('background-repeat', 'no-repeat');
        let panOff = '/imageviewer/images/nav-pan-off.png';
        $("#context_pan").css('background', 'url(' + panOff + ')');
        $("#context_pan").css('background-repeat', 'no-repeat');
        let zoomOff = '/imageviewer/images/nav-zoom-off.png';
        $("#context_zoom").css('background', 'url(' + zoomOff + ')');
        $("#context_zoom").css('background-repeat', 'no-repeat');
        document.getElementById('wwwc').click();
    },
    'click #context_pan'(event){
        let imageUrl = '/imageviewer/images/nav-pan-on.png';
        $("#context_pan").css('background', 'url(' + imageUrl + ')');
        $("#context_pan").css('background-repeat', 'no-repeat');
        let wlOff = '/imageviewer/images/nav-levels-off.png';
        $("#context_wl").css('background', 'url(' + wlOff + ')');
        $("#context_wl").css('background-repeat', 'no-repeat');
        let zoomOff = '/imageviewer/images/nav-zoom-off.png';
        $("#context_zoom").css('background', 'url(' + zoomOff + ')');
        $("#context_zoom").css('background-repeat', 'no-repeat');
        document.getElementById('pan').click();
    },
    'click #context_zoom'(event){
        let imageUrl = '/imageviewer/images/nav-zoom-on.png';
        $("#context_zoom").css('background', 'url(' + imageUrl + ')');
        $("#context_zoom").css('background-repeat', 'no-repeat');
        let panOff = '/imageviewer/images/nav-pan-off.png';
        $("#context_pan").css('background', 'url(' + panOff + ')');
        $("#context_pan").css('background-repeat', 'no-repeat');
        let wlOff = '/imageviewer/images/nav-levels-off.png';
        $("#context_wl").css('background', 'url(' + wlOff + ')');
        $("#context_wl").css('background-repeat', 'no-repeat');
        document.getElementById('zoom').click();
    },
    'click #context_reset'(event){
        let panOff = '/imageviewer/images/nav-pan-off.png';
        $("#context_pan").css('background', 'url(' + panOff + ')');
        $("#context_pan").css('background-repeat', 'no-repeat');
        let wlOff = '/imageviewer/images/nav-levels-off.png';
        $("#context_wl").css('background', 'url(' + wlOff + ')');
        $("#context_wl").css('background-repeat', 'no-repeat');
        let zoomOff = '/imageviewer/images/nav-zoom-off.png';
        $("#context_zoom").css('background', 'url(' + zoomOff + ')');
        $("#context_zoom").css('background-repeat', 'no-repeat');
        document.getElementById('resetViewport').click();
    },
    'click #context_clear'(event){
        let panOff = '/imageviewer/images/nav-pan-off.png';
        $("#context_pan").css('background', 'url(' + panOff + ')');
        $("#context_pan").css('background-repeat', 'no-repeat');
        let wlOff = '/imageviewer/images/nav-levels-off.png';
        $("#context_wl").css('background', 'url(' + wlOff + ')');
        $("#context_wl").css('background-repeat', 'no-repeat');
        let zoomOff = '/imageviewer/images/nav-zoom-off.png';
        $("#context_zoom").css('background', 'url(' + zoomOff + ')');
        $("#context_zoom").css('background-repeat', 'no-repeat');
        document.getElementById('clearTools').click();
    },
    'click #contextMenu'(event){
        const contextMenu = document.getElementById('contextMenu');
        //contextMenu.style.display = "none";
        OHIF.commands.run('context_pan');
        if(event.which == 1){
            console.log("abc");
        }
    },
    'mousedown #contextMenu'(event){
        if(event.which != 1){
            event.preventDefault();
        }
    }
});

Template.contextMenu.helpers({

});
