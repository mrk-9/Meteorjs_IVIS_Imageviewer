import { Template } from 'meteor/templating';
import { Tracker } from 'meteor/tracker';
import { ReactiveVar } from 'meteor/reactive-var';
import { Session } from 'meteor/session';
import { $ } from 'meteor/jquery';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { OHIF } from 'meteor/ohif:core';
import { cornerstone, cornerstoneTools } from 'meteor/ohif:cornerstone';

OHIF.viewerbase.getreportDialogAnnotationTools = () => {
    return ['length', 'probe', 'simpleAngle', 'arrowAnnotate', 'ellipticalRoi', 'rectangleRoi'];
};

Template.reportDialog.onCreated(() => {
    const instance = Template.instance();

    instance.schema = new SimpleSchema({
        width: { type: Number },
        height: { type: Number },
        name: {
            type: String,
            defaultValue: 'image'
        },
        type: {
            type: String,
            allowedValues: ['jpeg', 'png'],
            valuesLabels: ['JPEG', 'PNG'],
            defaultValue: 'jpeg'
        },
        showAnnotations: {
            type: Boolean,
            label: 'Show Annotations',
            defaultValue: true
        },
        quality: {
            type: Number,
            defaultValue: 100
        }
    });

    instance.changeObserver = new Tracker.Dependency();

    instance.keepAspect = new ReactiveVar(true);
    instance.showAnnotations = new ReactiveVar(false);

    instance.lastImage = {};

    instance.getConfirmCallback = () => () => {
        instance.downloadImage();
    };
});

Template.reportDialog.onRendered(() => {
    const instance = Template.instance();
    const dialog = instance.$('#reportDialog');
    dialogPolyfill.registerDialog(dialog.get(0));
});

Template.reportDialog.helpers({
    PDFUrl() {
        if (
            Session.get('pdf_url_pid') === OHIF.viewer.studies[0].patientId
            && 
            Session.get('pdf_url_study_id') === OHIF.viewer.studies[0].accessionNumber
        ) {
            return Session.get('pdf_url');
        }

        const data = {
            pid: OHIF.viewer.studies[0].patientId,
            study_id: OHIF.viewer.studies[0].accessionNumber
        };

        Session.set('pdf_url_pid', OHIF.viewer.studies[0].patientId);
        Session.set('pdf_url_study_id', OHIF.viewer.studies[0].accessionNumber);

        Meteor.call('GetPDFUrl', data, function(err, response){
            Session.set('pdf_url', `${Meteor.settings.public.apiRoot}/pdf/view/${response}`);
        });
        
        return Session.get('pdf_url');
    }
});

Template.reportDialog.events({
    'keydown':function(e, instance) {
        // Action canceled, just close dialog without calling callback
        console.log("====abcdefg");
        if (e.which === 27) {
            const dialog = instance.$('#reportDialog');
            dialog.get(0).close();
            return false;
        }
    }
});


