import { Meteor } from 'meteor/meteor';
Meteor.methods({
    /**
     * Create an image-share
     * This Meteor method is available from both the client and the server
     */
    ShareAPI: function(apiData) {
        const url = `${Meteor.settings.public.apiRoot}/image_viewer/share/create`;
        console.log("shareAPI");
        console.log(apiData, url);
        try {
            const callResponse = HTTP.post(url,
                {
                    data:{
                        "studyInstanceUID": apiData.studyInstanceUID,
                        "email": apiData.email,
                        "mobile": apiData.mobile,
                        "password": apiData.password,
                        "message": apiData.message,
                        "duration": parseInt(apiData.duration),
                        "url": apiData.url
                    },
                    headers: {
                        'accept': 'application/json',
                        'Authorization': 'Bearer ' + apiData.access_token
                      }
                });
            //console.log(callResponse);
            return callResponse;
        }
        catch (e) {
            console.log("Cannot get " + apiData, e);
            return e.response.statusCode;
        }
    }
});
