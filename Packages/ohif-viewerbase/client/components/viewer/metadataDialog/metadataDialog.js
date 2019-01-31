import { Template } from 'meteor/templating';
import { Tracker } from 'meteor/tracker';
import { ReactiveVar } from 'meteor/reactive-var';
import { Session } from 'meteor/session';
import { $ } from 'meteor/jquery';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { OHIF } from 'meteor/ohif:core';
import { cornerstone, cornerstoneTools } from 'meteor/ohif:cornerstone';
import { Viewerbase } from 'meteor/ohif:viewerbase';

OHIF.viewerbase.getshareDialogAnnotationTools = () => {
    return ['length', 'probe', 'simpleAngle', 'arrowAnnotate', 'ellipticalRoi', 'rectangleRoi'];
};


Template.metadataDialog.onRendered(() => {
    //ShareDialog
    const instance = Template.instance();
    const dialog = instance.$('#metadataDialog');
    dialogPolyfill.registerDialog(dialog.get(0));
});

Template.metadataDialog.events({
    'click .btn-cancel, click .metaDataDialogClose'(event, instance) {
        // Action canceled, just close dialog without calling callback
        //const dialog = instance.$('#metadataDialog');
        //dialog.get(0).close();
        const checkVisible = $('#metadataDialog').is(':visible');
        console.log('checkVisible:::', checkVisible);
        if(checkVisible == true) {
            $('#metadataDialog').css('display', 'none');
        }
    },
});

Template.registerHelper('arrayify',function(obj){
    var result = [];
    for (var key in obj) result.push({name:obj[key][0],value:obj[key][1],tag:obj[key][2]});
    return result;
});

Template.metadataDialog.helpers({
    keepAspect() {
        return Template.instance().keepAspect.get();
    },

    showQuality() {
        const instance = Template.instance();
        instance.changeObserver.depend();
        if (!instance.form) return true;
        return instance.form.item('type').value() === 'jpeg';
    },

    getMetadata() {
      const studyMetadata = new OHIF.metadata.StudyMetadata(OHIF.viewer.studies[0], OHIF.viewer.studies[0].studyInstanceUid);
      const metadata = studyMetadata._data;
      const seriesList = metadata.seriesList;
      let result = [];
      let index = 0
      let currentSeriesInstanceUid = Session.get('currentSeriesInstanceUid');
      if (currentSeriesInstanceUid !== undefined) {
        index = seriesList.findIndex(x => x.seriesInstanceUid === currentSeriesInstanceUid);
      }
      if (index == -1) {
          index = 0;
      }
      console.log('metadata ::', metadata);
      result = seriesList[index].instances[0];
      console.log('metadata result::', result);
      result['patientId'] = metadata.patientId;
      result['patientName'] = metadata.patientName;
      result['patientAge'] = metadata.patientAge;
      result['institutionName'] = metadata.institutionName;
      result['accessionNumber'] = metadata.accessionNumber;
      result['studyDate'] = metadata.studyDate;
      result['studyDescription'] = metadata.studyDescription;
      result['modality'] = seriesList[index].modality;
      result['seriesDate'] = seriesList[index].seriesDate;
      result['seriesDescription'] = seriesList[index].seriesDescription;
      result['seriesInstanceUid'] = seriesList[index].seriesInstanceUid;
      result['seriesNumber'] = seriesList[index].seriesNumber;
      result['seriesTime'] = seriesList[index].seriesTime;
      result['studyTime'] = seriesList[index].studyTime;         
        
      //console.log('length::', metadata.patientBirthDate.Value.length);
      //exit;
      if(typeof metadata.patientSex != 'undefined') {
        if(typeof metadata.patientSex.Value != 'undefined' && metadata.patientSex.Value.length > 0) {
        result['patientSex'] = metadata.patientSex.Value[0];  
        } else {
        result['patientSex'] = metadata.patientSex;  
        }
      }
      
      if(typeof metadata.patientBirthDate != 'undefined') {
        if(typeof metadata.patientBirthDate.Value != 'undefined' && metadata.patientBirthDate.Value.length > 0) {
            result['patientBirthDate'] = metadata.patientBirthDate.Value[0];  
          } else {
            result['patientBirthDate'] = metadata.patientBirthDate;
          }
      }
      if(typeof metadata.patientOrientation  != 'undefined') {
        if(typeof metadata.patientOrientation.Value  != 'undefined' && metadata.patientOrientation.Value.length > 0) {
            result['patientOrientation'] = metadata.patientOrientation.Value[0];
        } 
      }
      if(typeof metadata.referringPhysicianName != 'undefined') {
        if(typeof metadata.referringPhysicianName.Value != 'undefined' && metadata.referringPhysicianName.Value.length > 0) {
            result['referringPhysicianName'] = metadata.referringPhysicianName.Value[0];
          } else {
            result['referringPhysicianName'] = metadata.referringPhysicianName
          }
      }
      if(typeof metadata.referringPhysicianIDSequence != 'undefined') {
        if(typeof metadata.referringPhysicianIDSequence.Value != 'undefined' && metadata.referringPhysicianIDSequence.Value.length > 0) {
            result['referringPhysicianIDSequence'] = metadata.referringPhysicianIDSequence.Value[0]['00401101'].Value[0]['00080100'].Value[0];
          } 
      }
           
      let res = [];
      $.each(result, function(key, value) {
          key = (key === 'sopClassUid') ? 'SOPClassUID' : (key === 'sopInstanceUid') ? 'SOPInstanceUID' : (key === 'patientId') ? 'PatientID' : (key === 'seriesInstanceUid') ?  'SeriesInstanceUID' : (key === 'smallestPixelValue') ?  'SmallestImagePixelValue' : (key === 'largestPixelValue') ?  'LargestImagePixelValue' : key;
          let tagval = key.substr(0,1).toUpperCase()+key.substr(1);
          let code = Viewerbase.DICOMTagDescriptions.find(tagval);          
          let tag = '';
          let middle = 0;
          if (typeof code !== 'undefined') {
            tag = code.tag;
            tag = tag.replace('x', '');
            middle = Math.ceil(tag.length / 2);
            tag = tag.slice(0, middle) + ', ' + tag.slice(middle);
          }
          res.push([key, value, tag]);
      });
      return res;
    }
});
