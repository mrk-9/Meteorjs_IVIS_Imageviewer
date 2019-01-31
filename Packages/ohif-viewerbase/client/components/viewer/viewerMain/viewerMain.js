import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';
import { OHIF } from 'meteor/ohif:core';
// Local Modules
import { unloadHandlers } from '../../../lib/unloadHandlers';
import { ResizeViewportManager } from '../../../lib/classes/ResizeViewportManager';
import { LayoutManager } from '../../../lib/classes/LayoutManager';
import { StudyPrefetcher } from '../../../lib/classes/StudyPrefetcher';
import { StudyLoadingListener } from '../../../lib/classes/StudyLoadingListener';

Meteor.startup(() => {
    window.ResizeViewportManager = window.ResizeViewportManager || new ResizeViewportManager();

    // Set initial value for OHIFViewerMainRendered
    // session variable. This can used in viewer main template
    Session.set('OHIFViewerMainRendered', false);
});

Template.viewerMain.onCreated(() => {
    // Attach the Window resize listener
    // Don't use jQuery here. "window.onresize" will always be null
    // If its necessary, check all the code for window.onresize getter
    // and change it to jQuery._data(window, 'events')['resize'].
    // Otherwise this function will be probably overrided.
    // See cineDialog instance.setResizeHandler function
    window.addEventListener('resize', window.ResizeViewportManager.getResizeHandler());

    // Add beforeUnload event handler to check for unsaved changes
    window.addEventListener('beforeunload', unloadHandlers.beforeUnload);
});

Template.viewerMain.onRendered(() => {
    const instance = Template.instance();
    const { studies } = instance.data;
    const parentElement = instance.$('#layoutManagerTarget').get(0);
    const studyPrefetcher = StudyPrefetcher.getInstance();
    instance.studyPrefetcher = studyPrefetcher;

    instance.studyLoadingListener = StudyLoadingListener.getInstance();
    instance.studyLoadingListener.clear();
    instance.studyLoadingListener.addStudies(studies);

    OHIF.viewerbase.state = instance.data.state;
    OHIF.viewerbase.layoutManager = new LayoutManager(parentElement, studies);
    studyPrefetcher.setStudies(studies);

    Session.set('OHIFViewerMainRendered', Math.random());


});

Template.viewerMain.onDestroyed(() => {
    const instance = Template.instance();

    OHIF.log.info('viewerMain onDestroyed');

    // Remove the Window resize listener
    window.removeEventListener('resize', window.ResizeViewportManager.getResizeHandler());

    // Remove beforeUnload event handler...
    window.removeEventListener('beforeunload', unloadHandlers.beforeUnload);

    // Destroy the synchronizer used to update reference lines
    OHIF.viewer.updateImageSynchronizer.destroy();

    delete OHIF.viewerbase.layoutManager;
    ProtocolEngine = null;

    Session.set('OHIFViewerMainRendered', false);

    // Stop prefetching when we close the viewer
    instance.studyPrefetcher.destroy();

    // Destroy stack loading listeners when we close the viewer
    instance.studyLoadingListener.clear();

    // Clear references to all stacks in the StackManager
    OHIF.viewerbase.stackManager.clearStacks();

    // @TypeSafeStudies
    // Clears OHIF.viewer.Studies collection
    OHIF.viewer.Studies.removeAll();

    // @TypeSafeStudies
    // Clears OHIF.viewer.StudyMetadataList collection
    OHIF.viewer.StudyMetadataList.removeAll();
});
function drawCoordinates(x,y,event){
    var ctx = event.target.getContext("2d");
    var prevX = Session.get('prevX');
    var prevY = Session.get('prevY');
    ctx.beginPath();
    ctx.moveTo(prevX, prevY);
    ctx.lineTo(x, y);
    ctx.lineWidth = 10;
    ctx.lineJoin = ctx.lineCap = 'round';
    // set line color
    ctx.strokeStyle = 'green';
    ctx.stroke();
    Session.set('prevX',x);
    Session.set('prevY',y);
}
function getOffset(el) {
    const element = el.getBoundingClientRect();
    return {
        left: element.left + window.scrollX,
        top: element.top + window.scrollY
    }
}
function markPoint(event){
    if(Session.get('draw')){
        var offset = getOffset(event.target);
        var x = event.pageX - offset.left;
        var y = event.pageY - offset.top;
        drawCoordinates(x,y,event);
    }
}

Template.viewerMain.events({
    'mousedown .markerPenCanvas'(event){
        console.log("abcdefgh");
        Session.set('draw',true);
        var offset = getOffset(event.target);
        var x = event.pageX - offset.left;
        var y = event.pageY - offset.top;
        Session.set('prevX',x);
        Session.set('prevY',y);
    },
    'mouseup .markerPenCanvas'(event){
        Session.set('draw',false);
        delete Session.keys['prevX'];
        delete Session.keys['prevY'];
    },
    'mousemove .markerPenCanvas'(event){
        if(Session.get('draw')){
            markPoint(event);
        }
    },
    'touchstart .markerPenCanvas'(event){
        Session.set('draw',true);
        var offset = getOffset(event.target);
        event = event.originalEvent.touches[0];
        var x = event.pageX - offset.left;
        var y = event.pageY - offset.top;
        Session.set('prevX',x);
        Session.set('prevY',y);
    },
    'touchend .markerPenCanvas'(event){
        Session.set('draw',false);
        delete Session.keys['prevX'];
        delete Session.keys['prevY'];
    },
    'touchmove .markerPenCanvas'(event){
        event = event.originalEvent.touches[0];
        if(Session.get('draw')){
            markPoint(event);
        }
    },
});
