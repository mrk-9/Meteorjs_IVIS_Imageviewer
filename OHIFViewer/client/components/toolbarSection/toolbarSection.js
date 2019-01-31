import { Template } from 'meteor/templating';
import { $ } from 'meteor/jquery';

import { OHIF } from 'meteor/ohif:core';
import 'meteor/ohif:viewerbase';

function isThereSeries(studies) {
    if (studies.length === 1) {
        const study = studies[0];

        if (study.seriesList && study.seriesList.length > 1) {
            return true;
        }

        if (study.displaySets && study.displaySets.length > 1) {
            return true;
        }
    }

    return false;
}

Template.toolbarSection.onCreated(() => {
    const instance = Template.instance();

    if (OHIF.uiSettings.leftSidebarOpen && isThereSeries(instance.data.studies)) {
        instance.data.state.set('leftSidebar', 'studies');
    }
    const width = $(window).width();
    Session.set('oldwidth',width);
});

Template.toolbarSection.helpers({
    leftSidebarToggleButtonData() {
        const instance = Template.instance();
        return {
            toggleable: true,
            key: 'leftSidebar',
            value: instance.data.state,
            options: [{
                value: 'studies',
                svgLink: '/packages/ohif_viewerbase/assets/icons.svg#icon-studies',
                svgWidth: 15,
                svgHeight: 13,
                bottomLabel: 'Series'
            }]
        };
    },

    rightSidebarToggleButtonData() {
        const instance = Template.instance();
        return {
            toggleable: true,
            key: 'rightSidebar',
            value: instance.data.state,
            options: [{
                value: 'hangingprotocols',
                iconClasses: 'fa fa-cog',
                bottomLabel: 'Hanging'
            }]
        };
    },

    toolbarButtons() {
        const extraTools = [];
        extraTools.push({
            id: 'stackScroll',
            title: 'Stack Scroll',
            classes: 'imageViewerTool',
            iconClasses: 'fa fa-bars'
        });

        extraTools.push({
            id: 'magnify',
            title: 'Magnify',
            classes: 'imageViewerTool toolbarSectionButton',
            iconClasses: 'fa fa-circle'
        });

        extraTools.push({
            id: 'wwwcRegion',
            title: 'ROI Window',
            classes: 'imageViewerTool',
            iconClasses: 'fa fa-square'
        });

        extraTools.push({
            id: 'dragProbe',
            title: 'Probe',
            classes: 'imageViewerTool',
            iconClasses: 'fa fa-dot-circle-o'
        });

        extraTools.push({
            id: 'ellipticalRoi',
            title: 'Ellipse',
            classes: 'imageViewerTool',
            iconClasses: 'fa fa-circle-o'
        });

        extraTools.push({
            id: 'rectangleRoi',
            title: 'Rectangle',
            classes: 'imageViewerTool',
            iconClasses: 'fa fa-square-o'
        });

        extraTools.push({
            id: 'toggleDownloadDialog',
            title: 'Download',
            classes: 'imageViewerCommand',
            iconClasses: 'fa fa-camera',
            active: () => $('#downloadDialog').is(':visible')
        });


        const filterData = [];
        filterData.push({
            id: 'abdomen',
            title: 'Abdomen',
            classes:'imageViewerCommand',
            //iconClasses:'fa fa-adjust',
            svgLink_over: '/images/nav-wl-filters-abdoment.svg#on-over',
            svgLink_on: '/images/nav-wl-filters-abdoment.svg#on-over',
            svgLink_off: '/images/nav-wl-filters-abdoment.svg#off',
        });

        filterData.push({
            id: 'brain',
            title: 'Brain',
            classes:'imageViewerCommand',
            iconClasses:'fa fa-adjust',
            svgLink_over: '/images/nav-wl-filters-brain.svg#on-over',
            svgLink_on: '/images/nav-wl-filters-brain.svg#on-over',
            svgLink_off: '/images/nav-wl-filters-brain.svg#off',
        });

        filterData.push({
            id: 'bone',
            title: 'Bone',
            classes:'imageViewerCommand',
            iconClasses:'fa fa-adjust',
            svgLink_over: '/images/nav-wl-filters-bone.svg#on-over',
            svgLink_on: '/images/nav-wl-filters-bone.svg#on-over',
            svgLink_off: '/images/nav-wl-filters-bone.svg#off',
        });

        filterData.push({
            id: 'lung',
            title: 'Lung',
            classes:'imageViewerCommand',
            iconClasses:'fa fa-adjust',
            svgLink_over: '/images/nav-wl-filters-lung.svg#on-over',
            svgLink_on: '/images/nav-wl-filters-lung.svg#on-over',
            svgLink_off: '/images/nav-wl-filters-lung.svg#off',
        });

        filterData.push({
            id: 'default_filter',
            title: 'Default',
            classes: 'imageViewerCommand',
            svgLink_over: '/images/nav-wl-filters.svg#on-over',
            svgLink_on: '/images/nav-wl-filters.svg#on-over',
            svgLink_off: '/images/nav-wl-filters.svg#off'
        });
        const advancedData = [];

        advancedData.push({
            id: 'clearTools',
            title: 'Clear',
            classes: 'imageViewerCommand',
            iconClasses: 'fa fa-th-large',
            svgLink_over: '/images/nav-clear.svg#on-over',
            svgLink_on: '/images/nav-clear.svg#on-over',
            svgLink_off: '/images/nav-clear.svg#off',
        });

        advancedData.push({
            id: 'wwwcRegion',
            title: 'ROI Window',
            classes: 'imageViewerTool',
            iconClasses: 'fa fa-square',
            svgLink_over: '/images/nav-advanced-roi-window.svg#over',
            svgLink_on: '/images/nav-advanced-roi-window.svg#on',
            svgLink_off: '/images/nav-advanced-roi-window.svg#off',

        });

        advancedData.push({
            id: 'dragProbe',
            title: 'Probe',
            classes: 'imageViewerTool',
            iconClasses: 'fa fa-dot-circle-o',
            svgLink_over: '/images/nav-advanced-probe.svg#over',
            svgLink_on: '/images/nav-advanced-probe.svg#on',
            svgLink_off: '/images/nav-advanced-probe.svg#off',
        });

        advancedData.push({
            id: 'ellipticalRoi',
            title: 'Ellipse',
            classes: 'imageViewerTool',
            iconClasses: 'fa fa-circle-o',
            svgLink_over: '/images/nav-advanced-ellipse.svg#over',
            svgLink_on: '/images/nav-advanced-ellipse.svg#on',
            svgLink_off: '/images/nav-advanced-ellipse.svg#off',
        });

        advancedData.push({
            id: 'rectangleRoi',
            title: 'Rectangle',
            classes: 'imageViewerTool',
            iconClasses: 'fa fa-square-o',
            svgLink_over: '/images/nav-advanced-rectangle.svg#over',
            svgLink_on: '/images/nav-advanced-rectangle.svg#on',
            svgLink_off: '/images/nav-advanced-rectangle.svg#off',
        });

        advancedData.push({
            id: 'angle',
            title: 'Angle',
            classes: 'imageViewerTool',
            iconClasses: 'fa fa-angle-left',
            svgLink_over: '/images/nav-advanced-angle.svg#over',
            svgLink_on: '/images/nav-advanced-angle.svg#on',
            svgLink_off: '/images/nav-advanced-angle.svg#off',
        });

        advancedData.push({
            id: 'toggleMetadataDialog',
            title: 'DICOMHeader',
            iconClasses: 'fa fa-th-large',
            svgLink_over: '/images/nav-share.svg#on-over',
            svgLink_on: '/images/nav-share.svg#on-over',
            svgLink_off: '/images/nav-share.svg#off',
            classes: 'imageViewerCommand',
            active: () => $('#metadataDialog').is(':visible')
        });

        advancedData.push({
            id: 'abdomen',
            title: 'Abdomen',
            classes:'imageViewerCommand',
            iconClasses:'fa fa-adjust',
            svgLink_over: '/images/nav-wl-filters-abdoment.svg#on-over',
            svgLink_on: '/images/nav-wl-filters-abdoment.svg#on-over',
            svgLink_off: '/images/nav-wl-filters-abdoment.svg#off',
        });

        advancedData.push({
            id: 'brain',
            title: 'Brain',
            classes:'imageViewerCommand',
            iconClasses:'fa fa-adjust',
            svgLink_over: '/images/nav-wl-filters-brain.svg#on-over',
            svgLink_on: '/images/nav-wl-filters-brain.svg#on-over',
            svgLink_off: '/images/nav-wl-filters-brain.svg#off',
        });

        advancedData.push({
            id: 'bone',
            title: 'Bone',
            classes:'imageViewerCommand',
            iconClasses:'fa fa-adjust',
            svgLink_over: '/images/nav-wl-filters-bone.svg#on-over',
            svgLink_on: '/images/nav-wl-filters-bone.svg#on-over',
            svgLink_off: '/images/nav-wl-filters-bone.svg#off',
        });

        advancedData.push({
            id: 'lung',
            title: 'Lung',
            classes:'imageViewerCommand',
            iconClasses:'fa fa-adjust',
            svgLink_over: '/images/nav-wl-filters-lung.svg#on-over',
            svgLink_on: '/images/nav-wl-filters-lung.svg#on-over',
            svgLink_off: '/images/nav-wl-filters-lung.svg#off',
        });

        advancedData.push({
            id: 'default_filter',
            title: 'Default',
            classes: 'imageViewerCommand',
            svgLink_over: '/images/nav-wl-filters.svg#on-over',
            svgLink_on: '/images/nav-wl-filters.svg#on-over',
            svgLink_off: '/images/nav-wl-filters.svg#off'
        });
        
        advancedData.push({
            id: 'length',
            title: 'Length',
            classes: 'imageViewerTool toolbarSectionButton',
            svgLink_over: '/images/nav-length.svg#over',
            svgLink_on: '/images/nav-length.svg#on',
            svgLink_off: '/images/nav-length.svg#off',
        });

        advancedData.push({
            id: 'annotate',
            title: 'Annotate',
            classes: 'imageViewerTool',
            svgLink_over: '/images/nav-annotate.svg#over',
            svgLink_on: '/images/nav-annotate.svg#on',
            svgLink_off: '/images/nav-annotate.svg#off',
        });

        advancedData.push({
            id: 'magnify',
            title: 'Magnify',
            classes: 'imageViewerTool toolbarSectionButton',
            svgLink_over: '/images/nav-magnify.svg#over',
            svgLink_on: '/images/nav-magnify.svg#on',
            svgLink_off: '/images/nav-magnify.svg#off',
            iconClasses: 'fa fa-circle'
        });
        advancedData.push({
            id: 'draw',
            title: 'Draw',
            classes: 'imageViewerTool toolbarSectionButton',
            svgLink_over: '/images/nav-draw.svg#over',
            svgLink_on: '/images/nav-draw.svg#on',
            svgLink_off: '/images/nav-draw.svg#off',
        });
        advancedData.push({
            id: 'layout',
            title: 'Layout',
            svgLink: '/images/nav-layout.svg#on-over',
            buttonTemplateName: 'layoutButton'
        });

        if(Session.get('pid')) {
            advancedData.push({
                id: 'toggleShareDialog',
                title: 'Share',
                iconClasses: 'fa fa-th-large',
                svgLink_over: '/images/nav-share.svg#on-over',
                svgLink_on: '/images/nav-share.svg#on-over',
                svgLink_off: '/images/nav-share.svg#off',
                seperator:'seperator',
                classes: 'imageViewerCommand disabled',
                active: () => $('#shareDialog').is(':visible')
            });
        } else {
            advancedData.push({
                id: 'toggleShareDialog',
                title: 'Share',
                iconClasses: 'fa fa-th-large',
                svgLink_over: '/images/nav-share.svg#on-over',
                svgLink_on: '/images/nav-share.svg#on-over',
                svgLink_off: '/images/nav-share.svg#off',
                seperator:'seperator',
                classes: 'imageViewerCommand',
                active: () => $('#shareDialog').is(':visible')
            });
        }        

        advancedData.push({
            id: 'export_file',
            title: 'Export',
            iconClasses: 'fa fa-th-large',
            svgLink_over: '/images/nav-export.svg#on-over',
            svgLink_on: '/images/nav-export.svg#on-over',
            svgLink_off: '/images/nav-export.svg#off',
        });

        advancedData.push({
            id: 'toggleReportDialog',
            title: 'View Report',
            iconClasses: 'fa fa-th-large',
            pdf_url:'',
            svgLink_over: '/images/nav-view-report.svg#on-over',
            svgLink_on: '/images/nav-view-report.svg#on-over',
            svgLink_off: '/images/nav-view-report.svg#off',
            classes: 'imageViewerCommand',
            active: () => $('#reportDialog').is(':visible')
        });
        
        advancedData.push({
            id: 'toggleReferenceLines',
            title: 'Reference',
            iconClasses: 'fa fa-th-large',
            svgLink_over: '/images/nav-reference.svg#over',
            svgLink_on: '/images/nav-reference.svg#on',
            svgLink_off: '/images/nav-reference.svg#off',
            classes: 'imageViewerTool',
        });

        advancedData.push({
            id: 'toggleCineDialog',
            title: 'CINE',
            classes: 'imageViewerCommand',
            iconClasses: 'fa fa-youtube-play',
            active: () => $('#cineDialog').is(':visible'),
            svgLink_over: '/images/nav-cine.svg#on-over',
            svgLink_on: '/images/nav-cine.svg#on-over',
            svgLink_off: '/images/nav-cine.svg#off',
        });

        advancedData.push({
            id: 'overlay',
            title: 'Overlay',
            iconClasses: 'fa fa-th-large',
            svgLink_over: '/images/nav-overlay.svg#on-over',
            svgLink_on: '/images/nav-overlay.svg#on-over',
            svgLink_off: '/images/nav-overlay.svg#off',
            seperator:'seperator'
        });

        advancedData.push({
            id: 'resetViewport',
            title: 'Reset',
            classes: 'imageViewerCommand',
            iconClasses: 'fa fa-th-large',
            svgLink_over: '/images/nav-reset.svg#on-over',
            svgLink_on: '/images/nav-reset.svg#on-over',
            svgLink_off: '/images/nav-reset.svg#off',
        });

        const buttonData = [];

        buttonData.push({
            id: 'zoom',
            title: 'Zoom',
            classes: 'imageViewerTool',
            svgLink_over: '/images/nav-zoom.svg#over',
            svgLink_on:'/images/nav-zoom.svg#on',
            svgLink_off:'/images/nav-zoom.svg#off'
        });

        buttonData.push({
            id: 'pan',
            title: 'Pan',
            classes: 'imageViewerTool',
            svgLink_over: '/images/nav-pan.svg#over',
            svgLink_on:'/images/nav-pan.svg#on',
            svgLink_off:'/images/nav-pan.svg#off'
        });

        buttonData.push({
            id: 'wwwc',
            title: 'Levels',
            classes: 'imageViewerTool',
            svgLink_over: '/images/nav-levels.svg#over',
            svgLink_on:'/images/nav-levels.svg#on',
            svgLink_off:'/images/nav-levels.svg#off'
        });

        buttonData.push({
            id: 'filter',
            title: 'W/L Filters',
            classes: 'rp-x-1 rm-l-3',
            svgLink_over: '/images/nav-wl-filters.svg#on-over',
            svgLink_on: '/images/nav-wl-filters.svg#on-over',
            svgLink_off: '/images/nav-wl-filters.svg#off',
            subTools: filterData
        });

        buttonData.push({
            id: 'stackScroll',
            title: 'Stack Scroll',
            classes: 'imageViewerTool',
            svgLink_over: '/images/nav-stack-scroll.svg#on-over',
            svgLink_on: '/images/nav-stack-scroll.svg#on-over',
            svgLink_off: '/images/nav-stack-scroll.svg#off',
            iconClasses: 'fa fa-bars'
        });

        buttonData.push({
            id: 'length',
            title: 'Length',
            classes: 'imageViewerTool toolbarSectionButton',
            svgLink_over: '/images/nav-length.svg#over',
            svgLink_on: '/images/nav-length.svg#on',
            svgLink_off: '/images/nav-length.svg#off',
        });

        buttonData.push({
            id: 'draw',
            title: 'Draw',
            classes: 'imageViewerTool toolbarSectionButton',
            svgLink_over: '/images/nav-draw.svg#over',
            svgLink_on: '/images/nav-draw.svg#on',
            svgLink_off: '/images/nav-draw.svg#off',
        });

        buttonData.push({
            id: 'annotate',
            title: 'Annotate',
            classes: 'imageViewerTool',
            svgLink_over: '/images/nav-annotate.svg#over',
            svgLink_on: '/images/nav-annotate.svg#on',
            svgLink_off: '/images/nav-annotate.svg#off',
        });

        buttonData.push({
            id: 'magnify',
            title: 'Magnify',
            classes: 'imageViewerTool toolbarSectionButton',
            svgLink_over: '/images/nav-magnify.svg#over',
            svgLink_on: '/images/nav-magnify.svg#on',
            svgLink_off: '/images/nav-magnify.svg#off',
            iconClasses: 'fa fa-circle'
        });

        buttonData.push({
            id: 'toggleReferenceLines',
            title: 'Reference',
            iconClasses: 'fa fa-th-large',
            svgLink_over: '/images/nav-reference.svg#over',
            svgLink_on: '/images/nav-reference.svg#on',
            svgLink_off: '/images/nav-reference.svg#off',
            classes: 'imageViewerTool',
        });

        buttonData.push({
            id: 'layout',
            title: 'Layout',
            svgLink: '/images/nav-layout.svg#on-over',
            buttonTemplateName: 'layoutButton'
        });

        if(Session.get('pid')) {
            buttonData.push({
                id: 'toggleShareDialog',
                title: 'Share',
                iconClasses: 'fa fa-th-large',
                svgLink_over: '/images/nav-share.svg#on-over',
                svgLink_on: '/images/nav-share.svg#on-over',
                svgLink_off: '/images/nav-share.svg#off',
                seperator:'seperator',
                classes: 'imageViewerCommand disabled',
                active: () => $('#shareDialog').is(':visible')
            });
        } else {
            buttonData.push({
                id: 'toggleShareDialog',
                title: 'Share',
                iconClasses: 'fa fa-th-large',
                svgLink_over: '/images/nav-share.svg#on-over',
                svgLink_on: '/images/nav-share.svg#on-over',
                svgLink_off: '/images/nav-share.svg#off',
                seperator:'seperator',
                classes: 'imageViewerCommand',
                active: () => $('#shareDialog').is(':visible')
            });
        }
        

        buttonData.push({
            id: 'export_file',
            title: 'Export',
            iconClasses: 'fa fa-th-large',
            svgLink_over: '/images/nav-export.svg#on-over',
            svgLink_on: '/images/nav-export.svg#on-over',
            svgLink_off: '/images/nav-export.svg#off',
        });

        buttonData.push({
            id: 'toggleReportDialog',
            title: 'View Report',
            iconClasses: 'fa fa-th-large',
            pdf_url:'',
            svgLink_over: '/images/nav-view-report.svg#on-over',
            svgLink_on: '/images/nav-view-report.svg#on-over',
            svgLink_off: '/images/nav-view-report.svg#off',
            classes: 'imageViewerCommand',
            active: () => $('#reportDialog').is(':visible')
        });

        if (!OHIF.uiSettings.displayEchoUltrasoundWorkflow) {
            buttonData.push({
                id: 'toggleCineDialog',
                title: 'CINE',
                classes: 'imageViewerCommand',
                iconClasses: 'fa fa-youtube-play',
                active: () => $('#cineDialog').is(':visible'),
                svgLink_over: '/images/nav-cine.svg#on-over',
                svgLink_on: '/images/nav-cine.svg#on-over',
                svgLink_off: '/images/nav-cine.svg#off',
            });
        }

        buttonData.push({
            id: 'toggleAdvanced',
            title: 'Advanced',
            classes: 'rp-x-1 rm-l-3',
            svgLink: '/packages/ohif_viewerbase/assets/icon.svg#icon-tools-more',
            svgLink_over: '/images/nav-advanced.svg#on-over',
            svgLink_on: '/images/nav-advanced.svg#on-over',
            svgLink_off: '/images/nav-advanced.svg#off',
            subTools: advancedData
        });

        buttonData.push({
            id: 'overlay',
            title: 'Overlay',
            iconClasses: 'fa fa-th-large',
            svgLink_over: '/images/nav-overlay.svg#on-over',
            svgLink_on: '/images/nav-overlay.svg#on-over',
            svgLink_off: '/images/nav-overlay.svg#off',
            seperator:'seperator'
        });

        buttonData.push({
            id: 'resetViewport',
            title: 'Reset',
            classes: 'imageViewerCommand',
            iconClasses: 'fa fa-th-large',
            svgLink_over: '/images/nav-reset.svg#on-over',
            svgLink_on: '/images/nav-reset.svg#on-over',
            svgLink_off: '/images/nav-reset.svg#off',
        });

        buttonData.push({
            id: 'clearTools',
            title: 'Clear',
            classes: 'imageViewerCommand',
            iconClasses: 'fa fa-th-large',
            svgLink_over: '/images/nav-clear.svg#on-over',
            svgLink_on: '/images/nav-clear.svg#on-over',
            svgLink_off: '/images/nav-clear.svg#off',
        });

        return buttonData;
    },

    hangingProtocolButtons() {
        let buttonData = [];

        buttonData.push({
            id: 'previousPresentationGroup',
            title: 'Prev. Stage',
            iconClasses: 'fa fa-step-backward',
            buttonTemplateName: 'previousPresentationGroupButton'
        });

        buttonData.push({
            id: 'nextPresentationGroup',
            title: 'Next Stage',
            iconClasses: 'fa fa-step-forward',
            buttonTemplateName: 'nextPresentationGroupButton'
        });

        return buttonData;
    }

});

Template.toolbarSection.onRendered(function() {
    const instance = Template.instance();

    instance.$('#layout').dropdown();

    if (OHIF.uiSettings.displayEchoUltrasoundWorkflow) {
        OHIF.viewerbase.viewportUtils.toggleCineDialog();
    }

    // Set disabled/enabled tool buttons that are set in toolManager
    const states = OHIF.viewerbase.toolManager.getToolDefaultStates();
    const disabledToolButtons = states.disabledToolButtons;
    const allToolbarButtons = $('#toolbar').find('button');
    if (disabledToolButtons && disabledToolButtons.length > 0) {
        for (let i = 0; i < allToolbarButtons.length; i++) {
            const toolbarButton = allToolbarButtons[i];
            $(toolbarButton).prop('disabled', false);

            const index = disabledToolButtons.indexOf($(toolbarButton).attr('id'));
            if (index !== -1) {
                $(toolbarButton).prop('disabled', true);
            }
        }
    }
    //Insert <br>
    var element = document.querySelector("#toggleAdvanced #angle");
    var space_angle = document.createElement('div');
    space_angle.style.display = "none";
    space_angle.id = "space_angle";
    element.after(space_angle);

    var lung = document.querySelector("#toggleAdvanced #lung");
    var space_lung = document.createElement('div');
    space_lung.style.display = "none";
    space_lung.id = "space_lung";
    lung.after(space_lung);

});
