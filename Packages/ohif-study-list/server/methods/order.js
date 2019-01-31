import { Meteor } from 'meteor/meteor';
Meteor.methods({
    /**
     * addPacs image-viewver
     * This Meteor method is available from both the client and the server
     */
    GetOrderData: function(apiData, access_token) {
      const url = `${Meteor.settings.public.apiRoot}/imageviewer/getOrderData`;
      console.log('---- GetOrderData ----');
      console.log('apiData', apiData);
      console.log('url', url);
      console.log('---- GetOrderData ----');
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
    FilterOrderData: function(apiData) {
      const url = `${Meteor.settings.public.apiRoot}/imageviewer/filterOrderData`;
      console.log('---- filterOrderData ----');
      console.log('apiData', apiData);
      console.log('url', url);
      console.log('---- filterOrderData ----');
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
    DeleteOrder: function(apiData) {
      const url = `${Meteor.settings.public.apiRoot}/imageviewer/deleteOrder`;
      console.log('---- deleteOrder ----');
      console.log('apiData', apiData);
      console.log('url', url);
      console.log('---- deleteOrder ----');
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
    ViewOrderPDF: function(apiData) {
      const url = `${Meteor.settings.public.apiRoot}/imageviewer/viewOrderPDF`;
      console.log('---- viewOrderPDF ----');
      console.log('apiData', apiData);
      console.log('url', url);
      console.log('---- viewOrderPDF ----');
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
