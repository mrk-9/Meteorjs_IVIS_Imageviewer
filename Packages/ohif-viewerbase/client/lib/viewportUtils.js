import { Session } from 'meteor/session';
import { Random } from 'meteor/random';
import { $ } from 'meteor/jquery';
import { _ } from 'meteor/underscore';
import { Meteor } from 'meteor/meteor';
// Local Modules
import { OHIF } from 'meteor/ohif:core';
import { cornerstone, cornerstoneTools } from 'meteor/ohif:cornerstone';
import { updateOrientationMarkers } from './updateOrientationMarkers';
import { getInstanceClassDefaultViewport } from './instanceClassSpecificViewport';
import { viewportOverlayUtils } from './viewportOverlayUtils';
import { HTTP } from 'meteor/http';
import { WLPresets } from './WLPresets';

/**
 * Get a cornerstone enabledElement for a DOM Element
 * @param  {DOMElement} element Element to get the enabledElement from Cornerstone
 * @return {Object}             Cornerstone's enabledElement object for the given
 *                              element or undefined if the element is not enabled
 */
const getEnabledElement = element => {
    let enabledElement;

    try {
        enabledElement = cornerstone.getEnabledElement(element);
    } catch(error) {
        OHIF.log.warn(error);
    }

    return enabledElement;
};

/**
 * Get the active viewport element. It uses activeViewport Session Variable
 * @return {DOMElement} DOMElement of the current active viewport
 */
const getActiveViewportElement = () => {
    const viewportIndex = Session.get('activeViewport') || 0;
    return $('.imageViewerViewport').get(viewportIndex);
};

/**
 * Get a cornerstone enabledElement for the Active Viewport Element
 * @return {Object}  Cornerstone's enabledElement object for the active
 *                   viewport element or undefined if the element
 *                   is not enabled
 */
const getEnabledElementForActiveElement = () => {
    const activeViewportElement = getActiveViewportElement();
    const enabledElement = getEnabledElement(activeViewportElement);

    return enabledElement;
};

const zoomIn = () => {
    const element = getActiveViewportElement();
    if (!element) {
        return;
    }

    const viewport = cornerstone.getViewport(element);
    const scaleIncrement = 0.15;
    const maximumScale = 10;
    viewport.scale = Math.min(viewport.scale + scaleIncrement, maximumScale);
    cornerstone.setViewport(element, viewport);
};

const zoomOut = () => {
    const element = getActiveViewportElement();
    if (!element) {
        return;
    }

    const viewport = cornerstone.getViewport(element);
    const scaleIncrement = 0.15;
    const minimumScale = 0.05;
    viewport.scale = Math.max(viewport.scale - scaleIncrement, minimumScale);
    cornerstone.setViewport(element, viewport);
};

const zoomToFit = () => {
    const element = getActiveViewportElement();
    if (!element) {
        return;
    }

    cornerstone.fitToWindow(element);
};

const rotateL = () => {
    const element = getActiveViewportElement();
    if (!element) {
        return;
    }

    const viewport = cornerstone.getViewport(element);
    viewport.rotation -= 90;
    cornerstone.setViewport(element, viewport);
    updateOrientationMarkers(element, viewport);
};

const rotateR = () => {
    const element = getActiveViewportElement();
    if (!element) {
        return;
    }

    const viewport = cornerstone.getViewport(element);
    viewport.rotation += 90;
    cornerstone.setViewport(element, viewport);
    updateOrientationMarkers(element, viewport);
};

const invert = () => {
    const element = getActiveViewportElement();
    if (!element) {
        return;
    }

    const viewport = cornerstone.getViewport(element);
    viewport.invert = (viewport.invert === false);
    cornerstone.setViewport(element, viewport);
};

const flipV = () => {
    const element = getActiveViewportElement();
    const viewport = cornerstone.getViewport(element);
    viewport.vflip = (viewport.vflip === false);
    cornerstone.setViewport(element, viewport);
    updateOrientationMarkers(element, viewport);
};

const flipH = () => {
    const element = getActiveViewportElement();
    const viewport = cornerstone.getViewport(element);
    viewport.hflip = (viewport.hflip === false);
    cornerstone.setViewport(element, viewport);
    updateOrientationMarkers(element, viewport);
};

const resetViewportWithElement = element => {
    const enabledElement = cornerstone.getEnabledElement(element);
    if (enabledElement.fitToWindow === false) {
        const imageId = enabledElement.image.imageId;
        const instance = cornerstone.metaData.get('instance', imageId);

        enabledElement.viewport = cornerstone.getDefaultViewport(enabledElement.canvas, enabledElement.image);

        const instanceClassDefaultViewport = getInstanceClassDefaultViewport(instance, enabledElement, imageId);
        cornerstone.setViewport(element, instanceClassDefaultViewport);
    } else {
        cornerstone.reset(element);
    }
};

const resetViewport = (viewportIndex=null) => {
    if (viewportIndex === null) {
        resetViewportWithElement(getActiveViewportElement());
    } else if (viewportIndex === 'all') {
        $('.imageViewerViewport').each((index, element) => {
            resetViewportWithElement(element);
        });
    } else {
        resetViewportWithElement($('.imageViewerViewport').get(viewportIndex));
    }
};

const clearTools = () => {
    const element = getActiveViewportElement();
    const toolStateManager = cornerstoneTools.globalImageIdSpecificToolStateManager;
    toolStateManager.clear(element);

    console.log('====clear drawPen');
    activeViewport = Session.get('activeViewport');
    const drawCanvas = document.getElementsByClassName("markerPenCanvas");
    for (var c in drawCanvas) {
      if (drawCanvas[parseInt(c)] !== undefined) {
        const ctx = drawCanvas[parseInt(c)].getContext('2d');
        ctx.clearRect(0, 0, drawCanvas[parseInt(c)].width, drawCanvas[parseInt(c)].height);
      }
    }
    cornerstone.updateImage(element);
};

const linkStackScroll = () => {
    const synchronizer = OHIF.viewer.stackImagePositionOffsetSynchronizer;

    if (!synchronizer) {
        return;
    }

    if (synchronizer.isActive()) {
        synchronizer.deactivate();
    } else {
        synchronizer.activate();
    }
};

// This function was originally defined alone inside client/lib/toggleDialog.js
// and has been moved here to avoid circular dependency issues.
const toggleDialog = (element, closeAction) => {    
    const $element = $(element);    
    if ($element.is('dialog')) {        
        if (element.hasAttribute('open')) {            
            if (closeAction) {
                closeAction();
            }

            element.close();
        } else {
            element.show();
        }
    } else {        
        const isClosed = $element.hasClass('dialog-open');
        $element.toggleClass('dialog-closed', isClosed);
        $element.toggleClass('dialog-open', !isClosed);
    }
};

// Toggle the play/stop state for the cornerstone clip tool
const toggleCinePlay = () => {
    // Get the active viewport element
    const element = getActiveViewportElement();

    // Check if it's playing the clip to toggle it
    if (isPlaying()) {
        cornerstoneTools.stopClip(element);
    } else {
        cornerstoneTools.playClip(element);
    }

    // Update the UpdateCINE session property
    Session.set('UpdateCINE', Math.random());
};

// Show/hide the CINE dialog
const toggleCineDialog = () => {
    const dialog = document.getElementById('cineDialog');

    toggleDialog(dialog, stopAllClips);
    Session.set('UpdateCINE', Random.id());
};

const toggleDownloadDialog = () => {

    stopActiveClip();
    const $dialog = $('#imageDownloadDialog');
    if ($dialog.length) {
        $dialog.find('.close:first').click();
    } else {
        OHIF.ui.showDialog('imageDownloadDialog');
    }
};

const toggleShareDialog = () => {
    const dialog = document.getElementById('shareDialog');
    //const dialog = document.getElementById('share-modal');
    toggleDialog(dialog, stopAllClips);
};

const toggleMetadataDialog = () => {
    //const dialog = document.getElementById('metadataDialog');
    //toggleDialog(dialog, stopAllClips);
    const checkVisible = $('#metadataDialog').is(':visible');
    if(checkVisible == false) {
        $('#metadataDialog').css('display', 'block');
    }
    console.log('checkVisible::', checkVisible);
};

const toggleReportDialog = () => {
    const dialog = document.getElementById('reportDialog');
    toggleDialog(dialog, stopAllClips);
};
const export_file = () => {
    //Export FILE API data
    console.log(OHIF.viewer.studies);
    const studyInstanceUid = OHIF.viewer.studies[0].studyInstanceUid;
    const url = `${Meteor.settings.public.apiRoot}/PACS/export/dicom/${studyInstanceUid}`;

    const link = document.createElement('a');
    link.href = url;

    // Create a 'fake' click event to trigger the download
    if (document.createEvent) {
        const event = document.createEvent('MouseEvents');
        event.initMouseEvent('click', true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
        link.dispatchEvent(event);
    } else if (link.fireEvent) {
        link.fireEvent('onclick');
    }
};
const applyPreset = (element,presetName) => {

    const wlPresets = OHIF.viewer.wlPresets;
    const wlPresetData = cornerstone.getElementData(element, 'wlPreset');
    const viewport = cornerstone.getViewport(element);
    const preset = wlPresets[presetName] || _.findWhere(wlPresets, { id: presetName });
    if (wlPresetData.custom) {
        viewport.voi.windowWidth = wlPresetData.custom.ww;
        viewport.voi.windowCenter = wlPresetData.custom.wc;
    } else if (preset && preset.id) {
        presetName = preset.id;
        viewport.voi.windowWidth = preset.ww;
        viewport.voi.windowCenter = preset.wc;
    }

    wlPresetData.name = presetName;
    wlPresetData.ww = viewport.voi.windowWidth;
    wlPresetData.wc = viewport.voi.windowCenter;
    console.log("WL WC");
    console.log(wlPresetData);

    // Update the viewport
    cornerstone.setViewport(element, viewport);

    OHIF.log.info('WLPresets::Applying WL Preset: ' + presetName);

    // Notify other components about W/L Preset changes
    Session.set('OHIFWlPresetApplied', presetName);
};
const abdomen = () => {
    //W/L Abdomen
    const element = getActiveViewportElement();
    if (!element) {
        return;
    }
    const presetName = 'Abdomen';
    applyPreset(element,presetName);

};
const brain = () => {
    //W/L Brain
    const element = getActiveViewportElement();
    if (!element) {
        return;
    }
    const presetName = 'Brain';
    applyPreset(element,presetName);

};
const bone = () => {
    //W/L Bone
    const element = getActiveViewportElement();
    if (!element) {
        return;
    }
    const presetName = 'Bone';
    applyPreset(element,presetName);

};
const lung = () => {
    //W/L Lung
    const element = getActiveViewportElement();
    if (!element) {
        return;
    }
    const presetName = 'Lung';
    applyPreset(element,presetName);

};
const  default_filter = () => {
    //W/L default
    const element = getActiveViewportElement();
    if (!element) {
        return;
    }
    const WLPreset = OHIF.viewer.wlPresets[6];
    WLPreset.wc = parseInt(OHIF.viewer.studies[0].seriesList[0].instances[0].windowCenter);
    WLPreset.ww = parseInt(OHIF.viewer.studies[0].seriesList[0].instances[0].windowWidth);
    OHIF.viewer.wlPresets[6] = WLPreset;
    const presetName = 'Default';
    applyPreset(element,presetName);

};
const overlay = () => {
    //OverLay function
    const overlay = document.getElementsByClassName('imageViewerViewportOverlay');
    for(i = 0; i < overlay.length; i++){
        if(overlay[i].style.display != "none" )
            overlay[i].style.display = "none";
        else
            overlay[i].style.display = "block";
    }
};

const draw = () => {
    //Pen Draw
    activeViewport = Session.get('activeViewport');
    const drawCanvas = document.getElementsByClassName("markerPenCanvas")[activeViewport];
    drawCanvas.style.display = "block";
    drawCanvas.style.pointerEvents = "auto";
    Session.set('drawTool',true);
};
const isDownloadEnabled = () => {
    const activeViewport = getActiveViewportElement();

    return activeViewport ? true : false;
};

// Check if the clip is playing on the active viewport
const isPlaying = () => {
    // Create a dependency on LayoutManagerUpdated and UpdateCINE session
    Session.get('UpdateCINE');
    Session.get('LayoutManagerUpdated');

    // Get the viewport element and its current playClip tool state
    const element = getActiveViewportElement();
    // Empty Elements throws cornerstore exception
    if (!element || !$(element).find('canvas').length) {
        return;
    }

    const toolState = cornerstoneTools.getToolState(element, 'playClip');

    // Stop here if the tool state is not defined yet
    if (!toolState) {
        return false;
    }

    // Get the clip state
    const clipState = toolState.data[0];

    if (clipState) {
        // Return true if the clip is playing
        return !_.isUndefined(clipState.intervalId);
    }

    return false;
};

// Check if a study has multiple frames
const hasMultipleFrames = () => {
    // Its called everytime active viewport and/or layout change
    Session.get('activeViewport');
    Session.get('LayoutManagerUpdated');

    const activeViewport = getActiveViewportElement();

    // No active viewport yet: disable button
    if (!activeViewport || !$(activeViewport).find('canvas').length) {
        return true;
    }

    // Get images in the stack
    const stackToolData = cornerstoneTools.getToolState(activeViewport, 'stack');

    // No images in the stack, so disable button
    if (!stackToolData || !stackToolData.data || !stackToolData.data.length) {
        return true;
    }

    // Get number of images in the stack
    const stackData = stackToolData.data[0];
    const nImages = stackData.imageIds && stackData.imageIds.length ? stackData.imageIds.length : 1;

    // Stack has just one image, so disable button
    if (nImages === 1) {
        return true;
    }

    return false;
};

// Stop clips on all non-empty elements
const stopAllClips = () => {
    const elements = $('.imageViewerViewport').not('.empty');
    elements.each((index, element) => {
        if ($(element).find('canvas').length) {
            cornerstoneTools.stopClip(element);
        }
    });
};

const stopActiveClip = () => {
    const activeElement = getActiveViewportElement();

    if ($(activeElement).find('canvas').length) {
        cornerstoneTools.stopClip(activeElement);
    }
};

const isStackScrollLinkingDisabled = () => {
    let linkableViewportsCount = 0;

    // Its called everytime active viewport and/or layout change
    Session.get('viewportActivated');
    Session.get('LayoutManagerUpdated');

    const synchronizer = OHIF.viewer.stackImagePositionOffsetSynchronizer;
    if (synchronizer) {
        const linkableViewports = synchronizer.getLinkableViewports();
        linkableViewportsCount = linkableViewports.length;
    }

    return linkableViewportsCount <= 1;
};

const isStackScrollLinkingActive = () => {
    let isActive = true;

    // Its called everytime active viewport layout changes
    Session.get('LayoutManagerUpdated');

    const synchronizer = OHIF.viewer.stackImagePositionOffsetSynchronizer;
    const syncedElements = _.pluck(synchronizer.syncedViewports, 'element');
    const $renderedViewports = $('.imageViewerViewport');
    $renderedViewports.each((index, element) => {
        if (!_.contains(syncedElements, element)) {
            isActive = false;
        }
    });

    return isActive;
};

// Create an event listener to update playing state when a clip stops playing
$(window).on('CornerstoneToolsClipStopped', () => Session.set('UpdateCINE', Math.random()));

/**
 * Export functions inside viewportUtils namespace.
 */

const viewportUtils = {
    getEnabledElementForActiveElement,
    getEnabledElement,
    getActiveViewportElement,
    zoomIn,
    zoomOut,
    zoomToFit,
    rotateL,
    rotateR,
    invert,
    flipV,
    flipH,
    resetViewport,
    clearTools,
    linkStackScroll,
    toggleDialog,
    toggleCinePlay,
    toggleCineDialog,
    toggleDownloadDialog,
    toggleShareDialog,
	toggleMetadataDialog,
    toggleReportDialog,
    export_file,
    abdomen,
    brain,
    bone,
    lung,
    default_filter,
    overlay,
    draw,
    isPlaying,
    isDownloadEnabled,
    hasMultipleFrames,
    stopAllClips,
    isStackScrollLinkingDisabled,
    isStackScrollLinkingActive
};

export { viewportUtils };
