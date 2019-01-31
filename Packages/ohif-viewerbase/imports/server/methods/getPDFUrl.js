import { Meteor } from 'meteor/meteor';

Meteor.methods({
    /**
     * Retrieves Study metadata given a Study Instance UID
     * This Meteor method is available from both the client and the server
     */
    GetPDFUrl: function(url) {
        try {
            console.log(url);
            var pid = JSON.stringify(url.pid);
            var study_id = JSON.stringify(url.study_id);
            const api_url = `${Meteor.settings.public.apiRoot}/image/view_report`;
            var callResponse = HTTP.post(api_url, { data:{"pid": pid,"study_id": study_id}});
            return callResponse.content;

        }catch ( e ) {
            console.log( "Cannot get " + url, e );
        }

    }
});
