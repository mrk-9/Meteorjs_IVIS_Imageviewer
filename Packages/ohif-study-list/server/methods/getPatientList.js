import { Meteor } from 'meteor/meteor';
Meteor.methods({
    /**
     * GetPatientList image-viewver
     * This Meteor method is available from both the client and the server
     */
    GetPatientList: function(apiData) {
        const url = `${Meteor.settings.public.apiRoot}/imageviewer/getPatientList`;
        console.log('---- GetPatientList ----');
        console.log('apiData', apiData);
        console.log('url', url);
        console.log('---- GetPatientList ----');
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
