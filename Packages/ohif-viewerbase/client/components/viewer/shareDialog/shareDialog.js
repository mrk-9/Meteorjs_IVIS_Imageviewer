import { Template } from 'meteor/templating';
import { Tracker } from 'meteor/tracker';
import { ReactiveVar } from 'meteor/reactive-var';
import { Session } from 'meteor/session';
import { $ } from 'meteor/jquery';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { OHIF } from 'meteor/ohif:core';
import { cornerstone, cornerstoneTools } from 'meteor/ohif:cornerstone';
OHIF.viewerbase.getshareDialogAnnotationTools = () => {
    return ['length', 'probe', 'simpleAngle', 'arrowAnnotate', 'ellipticalRoi', 'rectangleRoi'];
};

/**
 * Image Share button event handler
 */
function share(instance) {
    const durationDropdown = document.getElementById("duration");
    const data = {
        studyInstanceUID: OHIF.viewer.studies[0].studyInstanceUid,
        email: document.getElementById("image-share-email").value,
        password: document.getElementById("image-share-password").value,
        mobile: document.getElementById("image-share-mobile").value,
        message: document.getElementById("image-share-message").value,
        duration: durationDropdown.options[durationDropdown.selectedIndex].value,
        url : window.location.protocol + "//" + window.location.host,
        access_token: Session.get('access_token')
    };
    console.log('preshare', data);
    var currentDate = moment().format('YYYY-MM-DD hh:mm a');
    Meteor.call('ShareAPI', data, function(err, response) {
        console.log('ShareAPI::', response);
        //alert(response.content);
        //OHIF.viewerbase.viewportUtils.toggleShareDialog();
        if (response.statusCode == 200) {
            const dialog = instance.$('#shareDialog');
            dialog.get(0).close();            
            $("#vstudyPname").html(instance.data.studies[0].patientName);
            $("#vstudyDesc").html(instance.data.studies[0].studyDescription);
            $("#vstudyMobileNo").html(document.getElementById("image-share-mobile").value);
            $("#vsharedDate").html(currentDate);
            // $("#share-modal").hide();
            $("#viewer-share-success-modal").show();
            $("#image-share-email").val('');
            $("#image-share-password").val('');
            $("#image-share-message").val('');
            $("#image-share-mobile").val('');
        } else {
            toastr.error('The given data is invalid.');
        }
    });
}

Template.shareDialog.onRendered(() => {
    //ShareDialog
    const instance = Template.instance();
    const dialog = instance.$('#shareDialog');
    dialogPolyfill.registerDialog(dialog.get(0));
});

Template.shareDialog.events({
    'click .btn-cancel'(event, instance) {
        // Action canceled, just close dialog without calling callback
        const dialog = instance.$('#shareDialog');
        $("#image-share-email").val('');
        $("#image-share-password").val('');
        $("#image-share-message").val('');
        $("#image-share-mobile").val('');
        dialog.get(0).close();
    },
    'click .btn-confirm'(event, instance) {
        console.log('shareConfirm::', instance.data);        
        share(instance);
    },
    'click .shareDialogClose' (event, instance) {        
        const dialog = instance.$('#shareDialog');
        dialog.get(0).close();        
    },
    'click #vimageshareOK' (event, instance) {
        $("#viewer-share-success-modal").hide();
    }
});

Template.shareDialog.helpers({
    keepAspect() {
        return Template.instance().keepAspect.get();
    },

    showQuality() {
        const instance = Template.instance();
        instance.changeObserver.depend();
        if (!instance.form) return true;
        return instance.form.item('type').value() === 'jpeg';
    }
});
