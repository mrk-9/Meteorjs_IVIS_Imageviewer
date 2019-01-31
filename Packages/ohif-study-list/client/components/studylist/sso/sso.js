import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';
import { ReactiveVar } from 'meteor/reactive-var';
import { ReactiveDict } from 'meteor/reactive-dict';
import { moment } from 'meteor/momentjs:moment';
import { OHIF } from 'meteor/ohif:core';
import { Router } from 'meteor/iron:router';

//Session.setDefault('showLoadingText', true);

Template.sso.onCreated(() => {
	console.log('created');
	const instance = Template.instance();    
});
Template.sso.onRendered(() => {
	const instance = Template.instance();
	console.log('onRendered12');
	if (Router.current().route.getName() == 'singleSignOn') {		
		let instanceId = Router.current().params.studyInstanceUids;			
		let userId = Router.current().params.userId;
		let privilege = Router.current().params.privilege;
		let organization = Router.current().params.organization;
		let physician_id = Router.current().params.physician_id;
		let accessToken = Router.current().params.accessToken;
		Session.clear();
		Session.set('userId', userId);
		Session.set('privilege', privilege);
		Session.set('organization', organization);
		Session.set('access_token', accessToken);	
		Session.set('sso', true);	
		Router.go('/imageviewer/viewer/' + instanceId);
	}
});