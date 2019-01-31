import { OHIF } from 'meteor/ohif:core';
import { Meteor } from 'meteor/meteor';
/**
 * Render the viewer with the given routing context and parameters
 *
 * @param {Context} context Context of the router
 * @param {Object} params Parameters that will be used to prepare the viewer data
 */
export const renderViewer = (context, params, layoutTemplate='app') => {
    // Wait until the viewer data is ready to render it
    /*const promise = OHIF.viewerbase.prepareViewerData(params);

    // Show loading state while preparing the viewer data
    OHIF.ui.showDialog('dialogLoading', { promise });*/
    const url = "https://demo.scriptsender.com/images/view/study/get/" + params;

    // Retrieve the studies metadata
    if(url.includes("=")){
        studyListId = url.split("=")[1];
        url = url.split("&")[0];
    }
    else{
        studyListId = "";
    }

//--------------------------------------------------------------------------------------------//
    Meteor.call('GetAPIData', url, function(err, studiesData) {

        if(studiesData.studies.length > 0)
        {

            //-------------------------------For Testing--------------------------
            studyInstanceUids = [studiesData['studies'][0].studyInstanceUid];

            count_series = studiesData['studies'][0].seriesList.length;
            seriesInstanceUids = [];
            /*for(i = 0; i < count_series; i++){
                seriesInstanceUids[i] = {}
                seriesInstanceUids[i] = studiesData['studies'][0].seriesList[i].seriesInstanceUid;
            }*/

            const promise = OHIF.viewerbase.prepareViewerData({studiesData});
            //OHIF.ui.showDialog('dialogLoading', { promise });

            // Render the viewer when the data is ready
            promise.then(({ studies, viewerData }) => {
            OHIF.viewer.data = viewerData;
            OHIF.viewer.studies = studies;
            context.render(layoutTemplate, {
                    data: {
                        template: 'viewer',
                        studies
                    }
                });
            }).catch(error => {
                context.render(layoutTemplate, {
                    data: {
                        template: 'errorText',
                        error
                    }
                });
            });
        }
    });
};
