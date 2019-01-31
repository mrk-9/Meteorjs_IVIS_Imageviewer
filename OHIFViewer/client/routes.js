import { Router } from 'meteor/iron:router';
import { OHIF } from 'meteor/ohif:core';
import { Session } from 'meteor/session'

Router.configure({
    layoutTemplate: 'layout',
    loadingTemplate: 'layout'
});

Router.onBeforeAction('loading');
Router.onBeforeAction(function () {
  console.log('req:', this.request);
  var req = this.request.url;
  //var params = this.params;  
  var userId = Session.get('userId');
  let access_token = Session.get('access_token');
  console.log('Router ::', Router.current().route.getName()); 
  console.log('userId::', userId); 
  //console.log('access_token::', access_token);
  if(Router.current().route.getName() === 'singleSignOn') {
	  let instanceId = Router.current().params.studyInstanceUids;
	  let userId = Router.current().params.userId;
	  let privilege = Router.current().params.privilege;
	  let organization = Router.current().params.organization;
	  let physician_id = Router.current().params.physician_id;
  }  else {
      console.log('index::', req.indexOf("login"));
      if (typeof userId === 'undefined' && Router.current().route.getName() == 'viewerStudiesOrthanc') {
          console.log('here1');
        Router.go('login', {}, { replaceState: true });
      } if (typeof userId === undefined && req.indexOf("login") ==-1) {
        console.log('here2');
		Router.go('login', {}, { replaceState: true });
	  } else if (Router.current().route.getName() != 'imageSharelogin' && typeof access_token == 'undefined') {
        console.log('here3');
        Router.go('login', {}, { replaceState: true });
      }
  }
  
  this.next();
});

Router.route('/imageviewer/', function() {
    Router.go('login', {}, { replaceState: true });
}, { name: 'home1' });

Router.route('/studylist', function() {
    Router.go('login', {}, { replaceState: true });
}, { name: 'home2' });

Router.route('/studylist/login', function() {
    Router.go('login', {}, { replaceState: true });
}, { name: 'home3' });

Router.route('/imageviewer/login', function() {
    this.render('ohifViewer', { data: { template: 'login' } });
}, { name: 'login' });

Router.route('/imageviewer/login/:shareId', function() {
  const shareId = this.params.shareId;
  this.render('ohifViewer', { data: { template: 'login' } });
}, { name: 'imageSharelogin' });

Router.route('/imageviewer/studylist', function() {
    this.render('ohifViewer', { data: { template: 'studylist' } });
}, { name: 'studylist' });

Router.route('/imageviewer/study/:studyInstanceUid', function() {
    /*const studyInstanceUids = this.params.studyInstanceUids.split(';');*/
    const studyInstanceUid = this.params.studyInstanceUid;
    OHIF.viewerbase.renderViewer(this, studyInstanceUid, 'ohifViewer');
}, { name: 'viewerStudies' });

Router.route('/imageviewer/viewer/:studyInstanceUids', function() {
    let checkAccesstoken = Session.get('access_token');
    if(typeof checkAccesstoken !== 'undefined') {
        const studyInstanceUids = this.params.studyInstanceUids.split(';');
        OHIF.viewerbase.renderViewerOrthanc(this, { studyInstanceUids }, 'ohifViewer');
    }    
}, { name: 'viewerStudiesOrthanc' });

Router.route('/imageviewer/sso/:studyInstanceUids/:userId/:privilege/:organization/:physician_id/:accessToken', function() {
    const studyInstanceUids = this.params.studyInstanceUids.split(';');
	const userId = this.params.userId;
	const privilege = this.params.privilege;
	const organization = this.params.organization;
	const physician_id = this.params.physician_id;	
	this.render('ohifViewer', { data: { template: 'sso' } });
}, { name: 'singleSignOn' });
/*Router.route('/study/:studyInstanceUid', function() {
    const studyInstanceUid = this.params.studyInstanceUid;
    OHIF.studybase.renderViewer(this, studyInstanceUid, 'ohifStudyViewer');
}, { name: 'viewerStudybase' });*/

// OHIF #98 Show specific series of study
/*Router.route('/study/:studyInstanceUid/series/:seriesInstanceUids', function () {
    const studyInstanceUid = this.params.studyInstanceUid;
    const seriesInstanceUids = this.params.seriesInstanceUids.split(';');
    OHIF.viewerbase.renderViewer(this, { studyInstanceUids: [studyInstanceUid], seriesInstanceUids }, 'ohifViewer');
}, { name: 'viewerSeries' });*/
