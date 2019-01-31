import { Meteor } from 'meteor/meteor';
Meteor.methods({
    /**
     * addPacs image-viewver
     * This Meteor method is available from both the client and the server
     */
    GetImageShareData: function(apiData) {
        const url = `${Meteor.settings.public.apiRoot}/imageviewer/getImageShareData`;
        console.log('---- getImageShareData ----');
        console.log('apiData', apiData);
        console.log('url', url);
        console.log('---- getImageShareData ----');
        try {
            const callResponse = HTTP.get(url, {
                headers: {
                    'accept': 'application/json',
                    'Authorization': 'Bearer ' + apiData
                }                    
            });
            return callResponse;
        }
        catch (e) {
            console.log("Cannot get " + apiData, e);
            return e.response.statusCode;
        }
    },
    SaveImageShareData: function(apiData) {
        const url = `${Meteor.settings.public.apiRoot}/imageviewer/saveImageShareData`;
        console.log('---- saveImageShareData ----');
        console.log('apiData', apiData);
        console.log('url', url);
        console.log('---- saveImageShareData ----');
        try {
            const callResponse = HTTP.post(url,
                {
                  data:apiData,
                  headers: {
                    'accept': 'application/json',
                    'Authorization': 'Bearer ' + apiData.access_token
                  }
                });
            return callResponse;
        }
        catch (e) {
            console.log("Cannot get " + apiData, e);
            return e.response.statusCode;
        }
    },
    CancelShare: function(apiData) {
        const url = `${Meteor.settings.public.apiRoot}/imageviewer/cancelShare`;
        console.log('---- cancelShare ----');
        console.log('apiData', apiData);
        console.log('url', url);
        console.log('---- cancelShare ----');
        try {
            const callResponse = HTTP.post(url,
                {
                  data:apiData,
                  headers: {
                    'accept': 'application/json',
                    'Authorization': 'Bearer ' + apiData.access_token
                 }
                });
            return callResponse;
        }
        catch (e) {
            console.log("Cannot get " + apiData, e);
            return e.response.statusCode;
        }
    },
    UpdateDuration: function(apiData) {
        const url = `${Meteor.settings.public.apiRoot}/imageviewer/updateDuration`;
        console.log('---- updateDuration ----');
        console.log('apiData', apiData);
        console.log('url', url);
        console.log('---- updateDuration ----');
        try {
            const callResponse = HTTP.post(url,
                {
                  data:apiData,
                  headers: {
                    'accept': 'application/json',
                    'Authorization': 'Bearer ' + apiData.access_token
                  }
                });
            return callResponse;
        }
        catch (e) {
            console.log("Cannot get " + apiData, e);
            return e.response.statusCode;
        }
    },
    GetStudyPatientReshare: function(apiData) {
        const url = `${Meteor.settings.public.apiRoot}/imageviewer/getStudyPatient`;
        console.log('---- getStudyPatient ----');
        console.log('apiData', apiData);
        console.log('url', url);
        console.log('---- getStudyPatient ----');
        try {
            const callResponse = HTTP.post(url,
                {
                  data:apiData,
                  headers: {
                    'accept': 'application/json',
                    'Authorization': 'Bearer ' + apiData.access_token
                  }
                });
            return callResponse;
        }
        catch (e) {
            console.log("Cannot get " + apiData, e);
            return e.response.statusCode;
        }
    },
});
