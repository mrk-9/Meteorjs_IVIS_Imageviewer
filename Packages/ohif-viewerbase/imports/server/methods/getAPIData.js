import { Meteor } from 'meteor/meteor';

Meteor.methods({
    /**
     * Retrieves Study metadata given a Study Instance UID
     * This Meteor method is available from both the client and the server
     */
    GetAPIData: function(url) {
    
        if(url.includes("=")){
            studyListId = url.split("=")[1];
            url = url.split("&")[0];
        }
        else{
            studyListId = "";
        }

        try {
            var callResponse = HTTP.get(url);

            var result = callResponse.content;
            result = JSON.parse(result);
            studies =[];
            studiesData = {};

            if(result.patientJSON.length > 0){

                patientJSON = JSON.parse(result['patientJSON']);
                if(patientJSON.Studies.length > 0){
                    if(studyListId === ""){
                        studyListId = patientJSON.Studies[0]['MainDicomTags']['AccessionNumber'];    
                    }
                    count_studies = patientJSON.Studies.length;
                    index = 0;
                    for (i = 0; i < count_studies; i++) {
                        study = patientJSON.Studies[i];
                        if(studyListId === study['MainDicomTags']['AccessionNumber']){
                            studies[index] = {};
                            index ++;
                            studies[i]['studyInstanceUid'] = study['MainDicomTags']['StudyInstanceUID'] || '';
                            studies[i]['patientName'] = patientJSON['MainDicomTags']['PatientName'];

                            studiesData['transactionId'] = studyListId;
                            studiesData['pid'] = patientJSON['MainDicomTags']['PatientID'];
                            studiesData['patientName']= patientJSON['MainDicomTags']['PatientName'];
                            studiesData['studyDescription'] = study['MainDicomTags']['StudyDescription'];
                            studiesData['UUID'] = study['ID'];
                            studiesData['studyDate'] = study['MainDicomTags']['StudyDate'];
                            studiesData['studyTime'] = study['MainDicomTags']['StudyTime'];

                            seriesList = [];
                            count_series = study.Series.length;
                            series = study.Series;
                            if(count_series > 0){
                                for(j = 0; j < count_series; j++){
                                    seriesList[j] = {};
                                    if(series[j]['MainDicomTags']['Modality']!=''){
                                        studiesData['modality'] = series[j]['MainDicomTags']['Modality'];
                                    }

                                    seriesList[j]['seriesInstanceUid'] = series[j]['MainDicomTags']['SeriesInstanceUID'];
                                    seriesList[j]['seriesDescription'] = series[j]['MainDicomTags']['SeriesDescription'] || '';
                                    seriesList[j]['seriesNumber'] = series[j].MainDicomTags.SeriesNumber || '' ;
                                    seriesList[j]['seriesDate'] = series[j].MainDicomTags.SeriesDate || '' ;
                                    seriesList[j]['seriesTime'] = series[j].MainDicomTags.SeriesTime || '' ;
                                    instances = [];
                                    count_instances = series[j].Instances.length
                                    
                                    if(count_instances > 0){
                                        sery_instances = series[j].Instances;
                                        for(k = 0; k < count_instances; k++){
                                            instances[k] = {};
                                            instances[k]['sopInstanceUid'] = sery_instances[k].MainDicomTags.SOPInstanceUID; 
                                            instances[k]['rows'] = 1;
                                            instances[k]['instanceNumber'] = sery_instances[k].MainDicomTags.InstanceNumber;
                                            instances[k]['imagePositionPatient'] = sery_instances[k].MainDicomTags.imagePositionPatient || '';
                                            instances[k]['imageOrientationPatient'] = series[j].MainDicomTags.imageOrientationPatient;
                                            /** 
                                                2018.02.13 Modified by Kakha.
                                                Image instance url modified
                                                Original: https://demo.scriptsender.com/images/view/study/get/
                                             **/
                                            instances[k]['url'] = `dicomweb:${Meteor.settings.public.apiRoot}/image/instance/${sery_instances[k]['ID']}/file`;
                                        }
                                    }
                                    seriesList[j]['instances'] = instances;
                                }
                            }
                            studies[i]['seriesList'] = seriesList;
                        }
                    }
                }
            }
            studiesData['studies'] = studies;
            return studiesData;
        }catch ( e ) {
            console.log( "Cannot get " + url, e );
        }

    }
});
