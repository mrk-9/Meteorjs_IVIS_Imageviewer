import { Meteor } from 'meteor/meteor';
Meteor.methods({
    /**
     * Authenticate image-viewver
     * This Meteor method is available from both the client and the server
     */
    Authenticate: function(apiData) {
        const url = `${Meteor.settings.public.apiRoot}/imageviewer/auth`;
        //const url = `https://dev6.scriptsender.com/api/imageviewer/auth`;
        console.log("AuthenticateAPI");
        console.log(apiData, url);
        try {
            const callResponse = HTTP.post(url,
                {
                    data:apiData
                });
            console.log(callResponse);
            return callResponse;
        }
        catch (e) {
            console.log("Cannot get " + apiData, e);
        }
    },
    UserDetails: function(apiData) {
        const url = `${Meteor.settings.public.apiRoot}/imageviewer/user`;
        console.log('---- user ----');
        console.log('apiData', apiData);
        console.log('url', url);
        console.log('---- user ----');
        try {
            const callResponse = HTTP.get(url,
                {
                    headers: {
                        'accept': 'application/json',
                        'Authorization': 'Bearer ' + apiData
                    }
                });
            return callResponse;
        }
        catch (e) {
            console.log("Cannot get " + apiData, e);
        }
    },
    Logout: function(apiData) {
        const url = `${Meteor.settings.public.apiRoot}/imageviewer/logout`;
        console.log('---- logout ----');
        console.log('apiData', apiData);
        console.log('url', url);
        console.log('---- logout ----');
        try {
            const callResponse = HTTP.get(url,
                {
                    headers: {
                        'accept': 'application/json',
                        'Authorization': 'Bearer ' + apiData
                    }                    
                });
            return callResponse;
        }
        catch (e) {
            console.log(e);
            return e.response.statusCode;
        }
    },
    ValidateToken: function(apiData) {
        const url = `${Meteor.settings.public.apiRoot}/imageviewer/validate-token`;
        console.log('---- validateToken ----');
        console.log('apiData', apiData);
        console.log('url', url);
        console.log('---- validateToken ----');
        try {
            const callResponse = HTTP.get(url,
                {
                    headers: {
                        'accept': 'application/json',
                        'Authorization': 'Bearer ' + apiData
                    }                    
                });
            return callResponse;
        }
        catch (e) {
            console.log(e);
            return e.response;
        }
    },
    ImageShareAuthenticate: function(apiData) {
        const url = `${Meteor.settings.public.apiRoot}/imageviewer/shareAuth`;        
        console.log("shareAuth API");
        console.log(apiData, url);
        try {
            const callResponse = HTTP.post(url,
                {
                    data:apiData
                });
            console.log(callResponse);
            return callResponse;
        }
        catch (e) {
            console.log("Cannot get " + apiData, e);
        }
    },
});
