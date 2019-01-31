import { Meteor } from 'meteor/meteor';
Meteor.methods({
    /**
     * addPacs image-viewver
     * This Meteor method is available from both the client and the server
     */
    AddPacs: function(apiData) {
        const url = `${Meteor.settings.public.apiRoot}/imageviewer/addPacs`;
        console.log('---- addPacs ----');
        console.log('apiData', apiData);
        console.log('url', url);
        console.log('---- addPacs ----');
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
    /**
     * getPacs image-viewver
     * This Meteor method is available from both the client and the server
     */
     GetPacs: function(apiData) {
       const url = `${Meteor.settings.public.apiRoot}/imageviewer/getPacs`;
       console.log('---- getPacs ----');
       console.log('apiData', apiData);
       console.log('url', url);
       console.log('---- getPacs ----');
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
     /**
      * DisablePacs image-viewver
      * This Meteor method is available from both the client and the server
      */
     DisablePacs: function(apiData) {
         const url = `${Meteor.settings.public.apiRoot}/imageviewer/disablePacs`;
         console.log('---- disablePacs ----');
         console.log('apiData', apiData);
         console.log('url', url);
         console.log('---- disablePacs ----');
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
     /**
      * GetPacDetail image-viewver
      * This Meteor method is available from both the client and the server
      */
     GetPacDetail: function(apiData) {
         const url = `${Meteor.settings.public.apiRoot}/imageviewer/getPacDetail`;
         console.log('---- GetPacDetail ----');
         console.log('apiData', apiData);
         console.log('url', url);
         console.log('---- GetPacDetail ----');
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
     /**
      * EditPacs image-viewver
      * This Meteor method is available from both the client and the server
      */
     EditPacs: function(apiData) {
         const url = `${Meteor.settings.public.apiRoot}/imageviewer/editPacs`;
         console.log('---- EditPacs ----');
         console.log('apiData', apiData);
         console.log('url', url);
         console.log('---- EditPacs ----');
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
     /**
      * EditPacs image-viewver
      * This Meteor method is available from both the client and the server
      */
     DeletePac: function(apiData) {
         const url = `${Meteor.settings.public.apiRoot}/imageviewer/deletePac`;
         console.log('---- deletePac ----');
         console.log('apiData', apiData);
         console.log('url', url);
         console.log('---- deletePac ----');
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
     /**
      * EditPacs image-viewver
      * This Meteor method is available from both the client and the server
      */
     AddPacsToOrthanc: function(apiData) {
         const url = `${Meteor.settings.public.apiRoot}/imageviewer/addPacsToOrthanc`;
         console.log('---- addPacsToOrthanc ----');
         console.log('apiData', apiData);
         console.log('url', url);
         console.log('---- addPacsToOrthanc ----');
         try {
             const callResponse = HTTP.post(url,
                 {
                   data:apiData
                 });
             return callResponse;
         }
         catch (e) {
             console.log("Cannot get " + apiData, e);
         }
     },
     PingPacsSetting: function(apiData) {
        //const url = 'https://dev6.scriptsender.com/api/imageviewer/pacs/ping';
        const url = `${Meteor.settings.public.apiRoot}/imageviewer/pacs/ping`;
        console.log('---- ping ----');
        console.log('apiData', apiData);
        console.log('url', url);
        console.log('---- ping ----');
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
    }
});
