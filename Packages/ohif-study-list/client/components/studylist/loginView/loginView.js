import { Template } from 'meteor/templating';
import { Blaze } from 'meteor/blaze';
import Hammer from 'hammerjs';
import { OHIF } from 'meteor/ohif:core';
import { Router } from 'meteor/iron:router';
import { Session } from 'meteor/session'

Template.loginView.helpers({
   checkShareID() {
       return Router.current().params.shareId;
    }
});

function getUserDetails(accessToken) {    
    Meteor.call('UserDetails', accessToken, (error, resp) => {        
        console.log('UserDetails resp::', resp);
        var reponseData = JSON.parse(resp.content);
        if(reponseData.status === true) {
            Session.set('userId', reponseData.user_id);
            Session.set('privilege', reponseData.Privilege);
            Session.set('organization', reponseData.Organization);
            if (reponseData.Privilege === 'Physician') {
              Session.set('physician_id', reponseData.physician_id);
            }            
            if (reponseData.Privilege === 'Share') {
              Router.go('/imageviewer/viewer/' + reponseData.studyInstanceUid);
            } else {
              Router.go('/imageviewer/studylist');
            }
        }
    });
}

Template.loginView.onRendered(() => {
    $('body').addClass('loginPage');
    $(".brand").hide();
    $("#errMsg").hide();
    $(".header").hide();
    Session.set('showLoginLoader', false);
    //console.log('routeParams:', Router.current().params.shareId);
    //var color = Router.current().params.color;
});

Template.loginView.events({
    'click #signInButton': function (event, template){
	  Session.clear();
      Session.set('showLoginLoader', true);
      var email = (Router.current().params.shareId === undefined) ? template.$('#emailAddress').val() : '';
      const data = {
          email: email,
          password: template.$('#password').val(),
          imageshare: Router.current().params.shareId
      };
      if(Router.current().route.getName() == 'imageSharelogin') {
        Meteor.call('ImageShareAuthenticate', data, function(err, response) {
            console.log('ImageShareAuthenticate err::', err);
            console.log('ImageShareAuthenticate response::', response);
            var reponseData = JSON.parse(response.content);
            console.log('ImageShareAuthenticate reponseData:', reponseData);
            if(reponseData.access_token) {
              Session.set('access_token', reponseData.access_token);
              Session.set('showLoginLoader', false);
              $('body').removeClass('loginPage');
              $(".brand").hide();
              $(".header").show();
              Session.set('userId', reponseData.user_id);
              Session.set('privilege', reponseData.Privilege);
              Session.set('organization', reponseData.Organization);
              Session.set('pid', reponseData.pid);
              if (reponseData.Privilege === 'Share') {
                Router.go('/imageviewer/viewer/' + reponseData.studyInstanceUid);
              } else {
                Router.go('/imageviewer/studylist');
              }
              //getUserDetails(reponseData.access_token);
              
            } else {
               $("#errMsg").fadeOut(3000).show();
             }
        });
      } else {
        Meteor.call('Authenticate', data, function(err, response) {
            console.log(err);
            console.log(response);
            var reponseData = JSON.parse(response.content);
            console.log('reponseData:', reponseData);
            if(reponseData.access_token) {
              Session.set('access_token', reponseData.access_token);
              Session.set('showLoginLoader', false);
              $('body').removeClass('loginPage');
              $(".brand").hide();
              getUserDetails(reponseData.access_token);
              
            } else {
              $("#errMsg").fadeOut(3000).show();
            }
        });
      }
     
      // Router.go('/studylist');
      // ActiveEntry.signIn(emailValue, passwordValue);
      event.preventDefault();
    },

    'mousedown tr.studylistStudy'(event, instance) {
        // This event handler is meant to handle middle-click on a study
        if (event.which !== 2) {
            return;
        }

        const middleClickOnStudy = OHIF.studylist.callbacks.middleClickOnStudy;
        if (middleClickOnStudy && typeof middleClickOnStudy === 'function') {
            middleClickOnStudy(instance.data);
        }
    },

    'dblclick tr.studylistStudy, doubletap tr.studylistStudy'(event, instance) {
        if (event.which !== undefined && event.which !== 1) {
            return;
        }

        const dblClickOnStudy = OHIF.studylist.callbacks.dblClickOnStudy;

        if (dblClickOnStudy && typeof dblClickOnStudy === 'function') {
            dblClickOnStudy(instance.data);
        }
    },

    'contextmenu tr.studylistStudy, press tr.studylistStudy'(event, instance) {
        const $studyRow = $(event.currentTarget);

        if (!instance.data.selected) {
            doSelectSingleRow($studyRow, instance.data);
        }

        event.preventDefault();
        OHIF.ui.showDropdown(OHIF.studylist.dropdown.getItems(), {
            event,
            menuClasses: 'dropdown-menu-left'
        });
        return false;
    }
});
