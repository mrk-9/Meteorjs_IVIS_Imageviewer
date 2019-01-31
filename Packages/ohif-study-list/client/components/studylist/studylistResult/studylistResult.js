import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';
import { ReactiveVar } from 'meteor/reactive-var';
import { ReactiveDict } from 'meteor/reactive-dict';
import { moment } from 'meteor/momentjs:moment';
import { OHIF } from 'meteor/ohif:core';
import { Router } from 'meteor/iron:router';

Session.setDefault('showLoadingText', true);
Session.setDefault('serverError', false);

Template.registerHelper('isEqual',function(string, target){
  if(string) {
    if( string.match( new RegExp(target, 'g') ) ) {
      return 'selected';
    }
  }
  return '';
});
Template.registerHelper('incremented', function (index) {
    index++;
    return index;
});

Template.studylistResult.helpers({

    /**
     * Returns a ascending sorted instance of the Studies Collection by Patient name and Study Date
     */
    studies() {
        
        const instance = Template.instance();
        let studies;
        let filter = {};
        let sortOption = {
            patientName: 1,
            studyDate: 1
        };        
        
        // Update sort option if session is defined
        if (Session.get('sortOption')) {
            sortOption = Session.get('sortOption');
        }

        // Pagination parameters
        const rowsPerPage = instance.paginationData.rowsPerPage.get();
        const currentPage = instance.paginationData.currentPage.get();
        const offset = rowsPerPage * currentPage;
        const limit = offset + rowsPerPage;
        if (Session.get('privilege') === 'Physician') {
          if (instance.masterList.get() === undefined) {
            Session.set('showLoadingText', false);
            return [];
          }
          filter = {patientId: { $in: instance.masterList.get()}};
        }


        studies = OHIF.studylist.collections.Studies.find(filter, {
            sort: sortOption
        }).fetch();

        if (!studies)
            return;

        // Update record count
        instance.paginationData.recordCount.set(studies.length);

        console.log('studies ::: ', studies);

        // Limit studies
        return studies.slice(offset, limit);
    },

    numberOfStudies() {
        const instance = Template.instance();
        let filter = {};
        if (Session.get('privilege') === 'Physician') {
          if (instance.masterList.get() === undefined)
              return 0;
          filter = {patientId: { $in: instance.masterList.get()}};
        }
        return OHIF.studylist.collections.Studies.find(filter).count();
    },

    sortingColumnsIcons() {
        const instance = Template.instance();

        let sortingColumnsIcons = {};
        Object.keys(instance.sortingColumns.keys).forEach(key => {
            const value = instance.sortingColumns.get(key);

            if (value === 1) {
                sortingColumnsIcons[key] = 'fa fa-fw fa-sort-up';
            } else if (value === -1) {
                sortingColumnsIcons[key] = 'fa fa-fw fa-sort-down';
            } else {
                // fa-fw is blank
                sortingColumnsIcons[key] = 'fa fa-fw';
            }
        });
        return sortingColumnsIcons;
    },

    pacsData() {
        const instance = Template.instance();
        return instance.pacs.get();
    },
    paginationSource() {
      const instance = Template.instance();
  		return instance.pacsPaginationData.totalRecords.get(); //For example, Collection.find({}).fetch() or Collection.find({}).fetch().length
  	},
  	paginationSettings() {
      const instance = Template.instance();
  		return {
  			perPage: 5, //Elements per page
  			pageCount: 5, //Number of showed pages
  			showPages: true, //Show or hide pages
  			showPrevious: false, //Show or hide previous button
  			showNext: false,//Show or hide next button
  			sessionName: 'pagination-current-page', //Session variable name with current page number
  			callback: function(e) { //Callback on click to page number
  				var pageNo = Session.get('pagination-current-page');
          getPaginatePacsData(pageNo, instance);
  			},
  		}
  	},
    pacsCount() {
      const instance = Template.instance();
      if (instance.pacsPaginationData.totalRecords.get() > 5) {
        return true;
      };
    },
    getUserPrivilege() {
      return (Session.get('privilege') === 'Physician') ? true : false;
    },
    myCollection() {
      const instance = Template.instance();
      //getImageShareData(instance);
      return instance.imageShareStudy.get();
    },
    settings() {
      const instance = Template.instance();
      var imageShareStudies = instance.imageShareStudy.get();
      if(typeof imageShareStudies !== 'undefined') {
        return {
          collection: instance.imageShareStudy.get(),
          rowsPerPage: instance.shareRowsPerPage,
          showFilter: true,
          filters: ['shareDateRange'],
          fields: [
            { key: 'index', label: 'Index'},
            { key: 'sharer_name', label: 'Sharer'},
            { key: 'study_description', label: 'Study Description'},
            { key: 'study_date', label: 'Study Date'},
            { key: 'created_at', label: 'Date Shared'},
            { key: 'target_patient_email', label: 'Shared Email'},
            { key: 'duration', label: 'Duration', fn: function (value, object, key) {
              var selected30 = '';
              var selected60 = '';
              var selected90 = '';
              var selected180 = '';
              var selected365 = '';
              if (value == 30) { selected30 = 'selected'; }
              if (value == 60) { selected60 = 'selected'; }
              if (value == 90) { selected90 = 'selected'; }
              if (value == 180) { selected1800 = 'selected'; }
              if (value == 365) { selected365 = 'selected'; }
              return new Spacebars.SafeString("<select id='shareDuration_"+object.share_id+"' class='form-control image-share-duration' name='imageshareduration' title='share-duration-dropdown'><option value='30' "+ selected30 +">30</option><option value='60' "+ selected60 +">60</option><option value='90' "+ selected90 +">90</option><option value='180' "+ selected180 +">180</option><option value='365' "+ selected365 +">365</option></select>");
            }},
            { key: 'activeControls', label: '', fn: function (value) {
              if(value == 0) {
                return new Spacebars.SafeString("<button rel='reshare' class='btn btn-primary btn-sm reshare' style='background: none;border: none;' title='Share this again' data-container='body' aria-expanded='false' data-placement='top' data-toggle='modal' ><div tabindex='1' class='toolbarSectionButton rp-x-1 imageViewerCommand imageViewerReshare' rel='reshare'><div class='svgContainer' title='Share this again' rel='reshare'><svg><use xlink:href='images/nav-share.svg#on-over'></use></svg></div></div></button><button rel='cancel' class='btn btn-default btn-sm share-cancel-button' type='button' disabled data-toggle='tooltip' data-container='body' data-placement='bottom' title='This share was canceled'><div tabindex='1' class='toolbarSectionButton rp-x-1 imageViewerCommand imageViewerCancel' rel='cancel'><img rel='cancel' title='This share was canceled' src='images/cancel.png' style='width: 26px;margin-bottom: 7px;'></div></button>");
              } else {
                return new Spacebars.SafeString("<button rel='reshare' class='btn btn-primary btn-sm reshare' style='background: none;border: none;' title='Share this again' data-container='body' aria-expanded='false' data-placement='top' data-toggle='modal' ><div tabindex='1' class='toolbarSectionButton rp-x-1 imageViewerCommand imageViewerReshare' rel='reshare'><div class='svgContainer' title='Share this again' rel='reshare'><svg><use xlink:href='images/nav-share.svg#on-over'></use></svg></div></div></button><button rel='cancel' style='background: none;' class='btn btn-default btn-sm share-cancel-button' type='button' data-toggle='tooltip' data-container='body' data-placement='bottom' title='Cancel this share'><div tabindex='1' class='toolbarSectionButton rp-x-1 imageViewerCommand imageViewerCancel' rel='cancel'><img rel='cancel' title='Cancel this share' src='images/cancel.png' style='width: 26px;margin-bottom: 7px;'></div></button>");
              }
            }
          }
        ]
      };
      } else {
        return false;
      }       
    },
    imageShareDataMobile() {
      const instance = Template.instance();
      let mShareData = instance.mImageShareArr.get();
      console.log('mShareData::', mShareData);
      if(typeof mShareData !== 'undefined') {        
        return mShareData;
        //return true;
      } else {
        return false;
      }      
    },
    showImageShareBtn() {
      const instance = Template.instance();
      return instance.imageShareBtn.get();
    },
    orderSettings() {
      const instance = Template.instance();
      var ordersMgmtData = instance.ordersMgmt.get();
      if(typeof ordersMgmtData !== 'undefined') {
        return {
            collection: instance.ordersMgmt.get(),
            rowsPerPage: instance.orderRowsPerPage,
            showFilter: true,
            filters: ['orderTypeFilter','order_date_range'],
            fields: [
              { key: 'pdfPath', label: '', fn: function (value) {
                if(value) {
                  return new Spacebars.SafeString("<input type='checkbox' class='checkbox order_delete_checkbox' name='delete_check[]' value='"+value+"'>");
                } else {
                  return new Spacebars.SafeString("<input type='checkbox' disabled class='checkbox order_delete_checkbox' name='delete_check[]' value='"+value+"'>");
                }
              }, sortable: false},
              { key: 'org', label: 'Group', sortable: true},
              { key: 'template', label: 'Format', sortable: true},
              { key: 'RefDr', label: 'Referrer', sortable: true},
              { key: 'patientName', label: 'Patient', sortable: true},
              { key: 'created_at', label: 'Order date', sortable: true},
              { key: 'username', label: 'User', sortable: true},
              { key: 'orderType', label: 'Type', sortable: true},
              // { key: 'queue_name', label: 'Queue'}, //check admin
              // { key: 'ip', label: 'IP'},
              // { key: 'allOrders.created_at', label: 'Accession', hidden: true},
              // { key: 'allOrders.created_at', label: 'Status', hidden: true},
              // { key: 'allOrders.created_at', label: 'HL7'},
              { key: 'pdfPath', label: '', fn: function (value) {
                if(value) {
                  return new Spacebars.SafeString('<div tabindex="1" class="toolbarSectionButton rp-x-1 imageViewerCommand ssPDF" data-file="'+ value +'"><div class="svgContainer" title="View PDF" data-file="'+ value +'"><svg><use xlink:href="images/nav-view-report.svg#on-over"></use></svg></div></div>');
                } else {
                  return new Spacebars.SafeString('<div tabindex="1" class="toolbarSectionButton rp-x-1 imageViewerCommand ssPDF disabled" data-file="'+ value +'"><div class="svgContainer" title="File does not exist or has been moved" data-file="'+ value +'"><svg><use xlink:href="images/nav-view-report.svg#on-over"></use></svg></div></div>');
                }
              }}
          ]
        };
      } else {
        return false;
      }
    },
    orderDataMobile() {
      const instance = Template.instance();
      let mOrderData = instance.mOrderMgmtArr.get();
      console.log('mOrderData::', mOrderData);
      if(typeof mOrderData !== 'undefined') {        
        return mOrderData;
        //return true;
      } else {
        return false;
      }      
    },
    isChecked (disable) {
      return (disable == 0)?'checked': '';
    },
    settingForm () {
      return Session.get('addSetting');
    },
    purgeStudyValue (value) {
      let purgeVal = '';
      if(value == '30_days') {
        purgeVal = '30 Days';
      } else if (value == '60_days') {
        purgeVal = '60 Days';
      } else if (value == '90_days') {
        purgeVal = '90 Days';
      } else if (value == '6_months') {
        purgeVal = '6 months';
      } else if (value == '1_year') {
        purgeVal = '1 year';
      } else if (value == 'never') {
        purgeVal = 'Never';
      }
      return purgeVal;
    },
    reshareCheck () {
      return Session.get('checkReshare');
    },
    disableReshareCancel () {
      if(Session.get('activeControls') == 0) {
        return true;
      } else {
        return false;
      }
    },
    checkMobileDevice () {
      //if($(window).width() < 800) {
      if($(window).width() < 961) {
        console.log('mobile device');
        return true;
      }
    },
    checkPatientId () {
      return Session.get('pid');
    }
});

let studyDateFrom;
let studyDateTo;
let filter;
let pacs;
let orderDateFrom;
let orderDateTo;

function deleteOrder(instance,selectedOrder) {
  var data = {
      selected_value_print: selectedOrder,
      access_token: Session.get('access_token')
  };
  Meteor.call('DeleteOrder', data, (error, resp) => {
    console.log('DeleteOrder error',error);
    console.log('DeleteOrder resp',resp);
    if(resp == 401) {
      Router.go('/imageviewer/login');
    } else {
      let response = JSON.parse(resp.content);
      console.log('DeleteOrder order response',response);
      if (response.status === 1) {
        getOrderData(instance);
        //instance.ordersMgmt.set(response.data.allOrders);
      }
    }
    
  });
}
function getOrderData(instance) {
  var user_id = Session.get('userId');
  var access_token = Session.get('access_token');
  var data = {
      user_id: user_id,
      access_token: access_token
  };
  Meteor.call('GetOrderData', data, (error, resp) => {
    console.log('order error',error);
    console.log('order resp',resp);
    let response = JSON.parse(resp.content);
    console.log('order response',response);
    if (response.status === true) {
      Session.set('showLoaderDocMgmt', false);
      instance.ordersMgmt.set(response.data.allOrders);
      let currentPage = instance.mOrderCurrentPage.get();
      const rowsPerPage = 5;
      const offset = rowsPerPage * currentPage;
      const limit = offset + rowsPerPage;
      let slicedOrderData = response.data.allOrders.slice(offset, limit);      
      let mOrderData = instance.mOrderMgmtArr.get();
      console.log('mOrderData first::', mOrderData);
      instance.mOrderMgmtArr.set(slicedOrderData);
    } else {
      Session.set('showLoaderDocMgmt', false);
    }
  });
}

function cancelShare(share_id, instance) {
  var user_id = Session.get('userId');
  var data = {
      share_id: share_id,
      user_id: user_id,
      access_token: Session.get('access_token')
  };
  Meteor.call('CancelShare', data, (error, resp) => {
    console.log('CancelShare resp:', resp);
    if(resp == 410) {
      Router.go('/imageviewer/login');
    } else {
      let response = JSON.parse(resp.content);
      if (response.status === true) {
        var imageShareData = instance.imageShareStudy.get();
        console.log('imageShareData:', imageShareData);
        imageShareData.find(function(value, index) {
          console.log('find shareid: ', index);
          if(value.share_id == share_id) {
            imageShareData[index].activeControls = '0';
          }
        });
        console.log('updated Data:', imageShareData)
        instance.imageShareStudy.set(imageShareData);
      }
    }    
  });
}

function saveImageShareData(data, instance) {
  // document.getElementById("share-modal").style.display = 'none';
  // $("#share-success-modal").show();
  let reshareData = Session.get('reshareData');
  let resharePatientName = Session.get('resharePatientName');
  var currentDate = moment().format('YYYY-MM-DD hh:mm a');
  $("#studyPname").html(resharePatientName);
  $("#studyDesc").html(reshareData.study_description);
  $("#studyMobileNo").html(data.imageShareMobile);
  $("#sharedDate").html(currentDate);
  Meteor.call('SaveImageShareData', data, (error, resp) => {
    console.log('SaveImageShareData resp:', resp);
    if(resp == 401) {
      Router.go('/imageviewer/login');
    } else if (resp.statusCode == 200) {
      let response = JSON.parse(resp.content);
      console.log('SaveImageShareData response:', response);
      if (response.status === true) {
        document.getElementById("share-modal").style.display = 'none';
        $("#share-success-modal").show();
      }
    } else {
      toastr.error('The given data is invalid.');
    }    
  });
}

function openReshareModal(share_id, instance) {
  console.log('openReshareModal');
  Session.set('checkReshare', true);
  $("#studylistOverlay").show();
  $("#imageShare-modal").hide();
  $("#reshareID").val(share_id);
  getStudyPatientReshare(share_id, instance);
  document.getElementById("share-modal").style.display = 'block';

}
function getStudyPatientReshare(share_id, instance) {
    let data = {
      share_id: share_id,
      access_token: Session.get('access_token')
    };
    Meteor.call('GetStudyPatientReshare', data, (error, resp) => {
      if(resp == 401) {
        Router.go('/imageviewer/login');
      } else {
        console.log('resp getStudyPatientReshare',resp);
        let response = JSON.parse(resp.content);
        console.log('resp',response);
        if (response.status === true) {
          Session.set('resharePatientName', response.data);
          //return response.data;
        }
      }
      
    });
}
function getImageShareData(instance) {
  let accessToken = Session.get('access_token');
  Meteor.call('GetImageShareData', accessToken, (error, resp) => {
    console.log('imageShare error',error);
    console.log('imageShare resp',resp);
    if(resp == 401) {
      Router.go('/imageviewer/login');
    } else {
      let response = JSON.parse(resp.content);
      console.log('imageShare response',response);
      Session.set('showLoaderImageShare', false);
      instance.imageShareStudy.set(response.data);
      //if($(window).width() < 961) {
        let currentPage = instance.mShareCurrentPage.get();
        const rowsPerPage = 5;
        const offset = rowsPerPage * currentPage;
        const limit = offset + rowsPerPage;
        let slicedShareData = response.data.slice(offset, limit);      
        let mShareData = instance.mImageShareArr.get();
        console.log('mShareData first::', mShareData);
        //$.merge(mShareData, slicedShareData);
        //console.log('merge first::', mShareData);
        //instance.mImageShareArr.push(mShareData);
        instance.mImageShareArr.set(slicedShareData);
    }   
  });
}

function getPaginatePacsData(pageNo, instance) {
  var limit = 10;
  var data = {
      page: pageNo,
      limit: limit,
      access_token: Session.get('access_token')
  };
  Meteor.call('GetPacs', data, (error, resp) => {
    console.log('error',error);
    console.log('resp pacs',resp);
    if(resp == 401) {
      Router.go('/imageviewer/login');
    } else {
      let response = JSON.parse(resp.content);
      console.log('resp',response);
      if (response.status === false) {
        return;
      }
      instance.pacsPaginationData.totalRecords.set(response.count);
      instance.pacs.set(response.pacs.data);
    }    
  });
}

function addDataToOrthanc(data) {

  Meteor.call('AddPacsToOrthanc', data, (error, resp) => {
    console.log('error',error);
    console.log('AddPacsToOrthanc',resp);
    //let response = JSON.parse(resp.content);
    //console.log('resp',response);
    // if (response.status === false) {
    //   return;
    // }
  });
}

/**
 * Transforms an input string into a search filter for
 * the StudyList Search call
 *
 * @param filter The input string to be searched for
 * @returns {*}
 */
function getFilter(filter) {
    if (filter && filter.length && filter.substr(filter.length - 1) !== '*') {
        filter += '*';
    }

    return filter;
}

/**
 * Transforms an input string into a search filter for
 * the StudyList Search call
 *
 * @param array Array of objects
 * @param key Key to Search
 * @param value Value of Key
 * @returns boolean
 */
function in_array(array, key, value) {
    for(var i=0;i<array.length;i++) {
        return (array[i][0][key] === value)
    }
    return false;
}

/**
 * Search for a value in a string
 */
function isIndexOf(mainVal, searchVal) {
    if (mainVal === undefined || mainVal === '' || mainVal.indexOf(searchVal) > -1){
        return true;
    }

    return false;
}

/**
 * Replace object if undefined
 */
function replaceUndefinedColumnValue(text) {
    if (text === undefined || text === 'undefined') {
        return '';
    } else {
        return text.toUpperCase();
    }
}

/**
 * Convert string to study date
 */
function convertStringToStudyDate(dateStr) {
    const y = dateStr.substring(0, 4);
    const m = dateStr.substring(4, 6);
    const d = dateStr.substring(6, 8);
    const newDateStr = m + '/' + d + '/' + y;
    return new Date(newDateStr);
}


/**
* Get providers patient
*/

function getPatientList (type, instance) {
  const data = {
      type: type,
      physician_id: Session.get('physician_id'),
      organization: Session.get('organization'),
      access_token: Session.get('access_token')
  };
  Meteor.call('GetPatientList', data, (error, resp) => {
    if(resp == 401) {
      Router.go('/imageviewer/login');
    } else {
      let response = JSON.parse(resp.content);
      // console.log('error',error);
      // console.log('resp',resp);
      if (response.status === false || response.patientList.length === 0) {
        OHIF.studylist.collections.Studies.remove({});
        return;
      }

      instance.masterList.set(response.patientList);
      search(instance);
      let filterList = instance.masterList.get();
      let studies = OHIF.studylist.collections.Studies.find({});
      studies.forEach(study => {
        if (!in_array(filterList, 'patientId', study.patientId))
          OHIF.studylist.collections.Studies.remove(study);
      });
    }
    
  });
}

/**
 * Image Share button event handler
 */
function share() {
    const durationDropdown = document.getElementById("duration");
    const data = {
        studyInstanceUID: Session.get('share_studyInstanceUid'),
        email: document.getElementById("image-share-email").value,
        password: document.getElementById("image-share-password").value,
        mobile: document.getElementById("image-share-mobile").value,
        message: document.getElementById("image-share-message").value,
        duration: durationDropdown.options[durationDropdown.selectedIndex].value,
        url: window.location.protocol + "//" + window.location.host,
        access_token: Session.get('access_token')
    };
    let sharePatientData = Session.get('sharePatientData');
    var currentDate = moment().format('YYYY-MM-DD hh:mm a');
    Meteor.call('ShareAPI', data, function(err, response) {
        console.log('ShareAPI', response);
        if(response == 401) {
          Router.go('/imageviewer/login');
        } else if (response.statusCode == 200) {
          document.getElementById("share-modal").style.display = 'none';
          $("#studyPname").html(sharePatientData.patientName);
          $("#studyDesc").html(sharePatientData.studyDescription);
          $("#studyMobileNo").html(document.getElementById("image-share-mobile").value);
          $("#sharedDate").html(currentDate);
          $("#share-modal").hide();
          $("#share-success-modal").show();
          Session.set('sharePatientData', '');
        } else {
          toastr.error('The given data is invalid.');
        }
    });
}


/**
 * Runs a search for studies matching the studylist query parameters
 * Inserts the identified studies into the Studies Collection
 */
function search(instance) {
    OHIF.log.info('search()', instance);

    console.log('studyDateFrom:', studyDateFrom);
    console.log('studyDateTo:', studyDateTo);
    // Show loading message
    Session.set('showLoadingText', true);

    // Hiding error message
    Session.set('serverError', false);
    let patientID = '';
    if(Session.get('pid')) {
      patientID = Session.get('pid');
    } else {
      patientID = $('input#patientId').val();
    }
    console.log('session pid::', patientID);
    //let pID = '2838496' ;
    // Create the filters to be used for the StudyList Search
      filter = {
        patientName: getFilter($('input#patientName').val()),
        patientId: getFilter(patientID),
        accessionNumber: getFilter($('input#accessionNumber').val()),
        studyDescription: getFilter($('input#studyDescription').val()),
        studyDateFrom,
        studyDateTo,
        modalitiesInStudy: $('input#modality').val() ? $('input#modality').val() : ''
    };

    // Make sure that modality has a reasonable value, since it is occasionally
    // returned as 'undefined'
    const modality = replaceUndefinedColumnValue($('input#modality').val());
  
    console.log('filter desktop::', filter);

    // Clear all current studies
    OHIF.studylist.collections.Studies.remove({});

    Meteor.call('StudyListSearch', filter, (error, studies) => {
        OHIF.log.info('StudyListSearch');
        // Hide loading text

        Session.set('showLoadingText', false);

        if (error) {
            Session.set('serverError', true);

            const errorType = error.error;

            if (errorType === 'server-connection-error') {
                OHIF.log.error('There was an error connecting to the DICOM server, please verify if it is up and running.');
            } else if (errorType === 'server-internal-error') {
                OHIF.log.error('There was an internal error with the DICOM server');
            } else {
                OHIF.log.error('For some reason we could not list the studies.')
            }

            OHIF.log.error(error.stack);
            return;
        }

        if (!studies) {
            OHIF.log.warn('No studies found');
            return;
        }

        // Loop through all identified studies
        studies.forEach(study => {
            // Search the rest of the parameters that aren't done via the server call
            if (isIndexOf(study.modalities, modality) &&
                (new Date(studyDateFrom).setHours(0, 0, 0, 0) <= convertStringToStudyDate(study.studyDate) || !studyDateFrom || studyDateFrom === '') &&
                (convertStringToStudyDate(study.studyDate) <= new Date(studyDateTo).setHours(0, 0, 0, 0) || !studyDateTo || studyDateTo === '')) {

                // Convert numberOfStudyRelatedInstance string into integer
                study.numberOfStudyRelatedInstances = !isNaN(study.numberOfStudyRelatedInstances) ? parseInt(study.numberOfStudyRelatedInstances) : undefined;

                // Insert any matching studies into the Studies Collection
                OHIF.studylist.collections.Studies.insert(study);
            }
        });

    });
}

function studyListMobilesearch(instance) {
    Session.set('showLoadingText', true);
    Session.set('serverError', false);
    // Create the filters to be used for the StudyList Search
    let studySearchType = $("#studySearchType").val();
    let studySearchVal = $("#studySearchValue").val();
    if(studySearchType == 'patientName') {
      filter = {
          patientName: getFilter($('#studySearchValue').val())          
      };      
    } else if (studySearchType == 'patientId') {
      filter = {
        patientId: getFilter($('#studySearchValue').val())        
      };
    } else if (studySearchType == 'accessionNumber') {
      filter = {
        accessionNumber: getFilter($('#studySearchValue').val())        
      };
    } else if(studySearchType == 'studyDescription') {
      filter = {
        studyDescription: getFilter($('#studySearchValue').val())        
      };
    }
    console.log('filter mobile::', filter);
  // Make sure that modality has a reasonable value, since it is occasionally
  // returned as 'undefined'
  const modality = '';  

  // Clear all current studies
  OHIF.studylist.collections.Studies.remove({});

  Meteor.call('StudyListSearch', filter, (error, studies) => {
      // Hide loading text

      Session.set('showLoadingText', false);

      if (error) {
          Session.set('serverError', true);

          const errorType = error.error;

          if (errorType === 'server-connection-error') {
              OHIF.log.error('There was an error connecting to the DICOM server, please verify if it is up and running.');
          } else if (errorType === 'server-internal-error') {
              OHIF.log.error('There was an internal error with the DICOM server');
          } else {
              OHIF.log.error('For some reason we could not list the studies.')
          }

          OHIF.log.error(error.stack);
          return;
      }

      if (!studies) {
          OHIF.log.warn('No studies found');
          return;
      }

      // Loop through all identified studies
      studies.forEach(study => {
          // Search the rest of the parameters that aren't done via the server call
          if (isIndexOf(study.modalities, modality) &&
              (new Date(studyDateFrom).setHours(0, 0, 0, 0) <= convertStringToStudyDate(study.studyDate) || !studyDateFrom || studyDateFrom === '') &&
              (convertStringToStudyDate(study.studyDate) <= new Date(studyDateTo).setHours(0, 0, 0, 0) || !studyDateTo || studyDateTo === '')) {

              // Convert numberOfStudyRelatedInstance string into integer
              study.numberOfStudyRelatedInstances = !isNaN(study.numberOfStudyRelatedInstances) ? parseInt(study.numberOfStudyRelatedInstances) : undefined;

              // Insert any matching studies into the Studies Collection
              OHIF.studylist.collections.Studies.insert(study);
          }
      });

  });
}

function resetSettingFields(instance) {
  $('input#setting-ae-title').val('');
  $('input#setting-ip').val('');
  $('input#setting-port').val('');
  $('input#setting-name').val('');
  $('input#setting-type').val('');
  $('input#purge-studies').val('90_days');
  $("#toggleSettingBtn").prop('checked', true);
}

function validateAccessToken() {
  let access_token = Session.get('access_token');
  Meteor.call('ValidateToken', access_token, (error, resp) => {        
    console.log('ValidateToken resp::', resp);
    //var reponseData = JSON.parse(resp.content);    
  });
}

const getRowsPerPage = () => sessionStorage.getItem('rowsPerPage');
// Wraps ReactiveVar equalsFunc function. Whenever ReactiveVar is
// set to a new value, it will save it in the Session Storage.
// The return is the default ReactiveVar equalsFunc if available
// or values are === compared
const setRowsPerPage = (oldValue, newValue) => {
    sessionStorage.setItem('rowsPerPage', newValue);
    return typeof ReactiveVar._isEqual === 'function' ? ReactiveVar._isEqual(oldValue, newValue) : oldValue === newValue;
};

Template.studylistResult.onCreated(() => {
    const instance = Template.instance();
    instance.sortOption = new ReactiveVar();
    instance.sortingColumns = new ReactiveDict();
    instance.list = new ReactiveVar();
    instance.masterList = new ReactiveVar();
    instance.pacs = new ReactiveVar();
    instance.imageShareStudy = new ReactiveVar();
    instance.imageShareBtn = new ReactiveVar();
    instance.ordersMgmt = new ReactiveVar();
    instance.filter1 = new ReactiveTable.Filter('orderTypeFilter', ['orderType']);
    instance.filter2 = new ReactiveTable.Filter('order_date_range', ['created_at']);
    instance.filter3 = new ReactiveTable.Filter('shareDateRange', ['created_at']);
    instance.shareRowsPerPage = new ReactiveVar(10);
    instance.orderRowsPerPage = new ReactiveVar(10);
    instance.mShareCurrentPage = new ReactiveVar(0);
    instance.mImageShareArr = new ReactiveArray();
    instance.mOrderCurrentPage = new ReactiveVar(0);
    instance.mOrderMgmtArr = new ReactiveArray();
    //Session.set('shareRowsPerPage', );
    // Pagination parameters

    // Rows per page
    // Check session storage or set 25 as default
    const cachedRowsPerPage = getRowsPerPage();
    if (!cachedRowsPerPage) {
        setRowsPerPage(0, 25);
    }

    const rowsPerPage = getRowsPerPage();
    instance.paginationData = {
        class: 'studylist-pagination',
        currentPage: new ReactiveVar(0),
        rowsPerPage: new ReactiveVar(parseInt(rowsPerPage, 10), setRowsPerPage),
        recordCount: new ReactiveVar(0)
    };

    instance.pacsPaginationData = {
        class: 'pacs-pagination',
        totalRecords: new ReactiveVar(0)
    };

    // Set sortOption
    const sortOptionSession = Session.get('sortOption');
    if (sortOptionSession) {
        instance.sortingColumns.set(sortOptionSession);
    } else {
        instance.sortingColumns.set({
            patientName: 1,
            studyDate: 1,
            patientId: 0,
            accessionNumber: 0,
            studyDescription: 0,
            modality: 0
        });
    }
});

Template.studylistResult.onRendered(() => {
    const instance = Template.instance();
    $(".header").show();
    //validateAccessToken();
    getImageShareData(instance);
    getOrderData(instance);
    getPaginatePacsData(1, instance);
    Session.set('addSetting', false);
    Session.set('checkReshare', false);
    Session.set('resharePatientName', '');
    Session.set('showLoaderImageShare', true);
    Session.set('showLoaderDocMgmt', true);
    //Session.set('imageShareCurrentPage', 1);
    //console.log('msettings::', Meteor.settings);
    $('#sidenav a:nth-child(3)').addClass('active');
    $('.mobileView .tab-content:not(:first)').hide();
    // Initialize daterangepicker
    const today = moment();
    const lastWeek = moment().subtract(6, 'days');
    const lastMonth = moment().subtract(29, 'days');
    const last14Days = moment().subtract(14, 'days');
    const startOfMonth = moment().startOf('month');
    const endOfMonth = moment().endOf('month');
    const prevStartOfMonth = moment().subtract(1, 'month').startOf('month');
    const prevEndOfMonth = moment().subtract(1, 'month').endOf('month');
    const last90days = moment().subtract(90, 'days');
    const $studyDate = instance.$('#studyDate');
    const $filterDateRange = instance.$('#filterDateRange');
    const dateFilterNumDays = OHIF.uiSettings.studyListDateFilterNumDays;
    const $orderDateRange = instance.$('#order_date_range');
    const $shareDateRange = instance.$('#shareDateRange');
    const $studyDaterange = instance.$('#studyDaterange');
    let startDate, endDate;

    if (dateFilterNumDays) {
        startDate = moment().subtract(dateFilterNumDays - 1, 'days');
        endDate = today;
    }

    instance.datePicker = $studyDate.daterangepicker({
        maxDate: today,
        autoUpdateInput: true,
        startDate: startDate,
        endDate: endDate,
        ranges: {
            Today: [today, today],
            'Last 7 Days': [lastWeek, today],
            'Last 30 Days': [lastMonth, today]
        }
    }).data('daterangepicker');

    instance.datePicker = $filterDateRange.daterangepicker({
        autoUpdateInput: true,
        startDate: startDate,
        endDate: endDate
    }).data('daterangepicker');

    instance.datePicker = $studyDaterange.daterangepicker({
      autoUpdateInput: true,
      startDate: startDate,
      endDate: endDate
  }).data('daterangepicker');

    instance.datePicker = $orderDateRange.daterangepicker({
        autoUpdateInput: true,
        startDate: startDate,
        endDate: endDate
    }).data('daterangepicker');

    instance.datePicker = $shareDateRange.daterangepicker({
        autoUpdateInput: true,
        startDate: startDate,
        endDate: endDate
    }).data('daterangepicker');

    if (startDate && endDate) {
        instance.datePicker.updateInputText();
    } else {
        // Retrieve all studies
        if (Session.get('privilege') === 'Physician') {
          const data = {
              type: 'myStudies',
              physician_id: Session.get('physician_id'),
              organization: Session.get('organization'),
              access_token: Session.get('access_token')
          };
          Meteor.call('GetPatientList', data, (error, resp) => {
            if(resp == 401) {
              Router.go('/imageviewer/login');
            } else {
              let response = JSON.parse(resp.content);
              // console.log('error',error);
              // console.log('resp',resp);
              if (response.status === false || response.patientList.length === 0)
                return;
              instance.masterList.set(response.patientList);
              search(instance);
            }            
          });
        } else {
           search(instance);
        }
    }

    $(window).on('keydown', function(event){
      if ( event.which == 27 ) {
          const checkReportVisible = $('#view-ss-record-pdf').is(':visible');
          if(checkReportVisible == true) {
              $('#view-ss-record-pdf').css('display', 'none');
              $("#studylistOverlay").hide();
          }
      }
    });
});

Template.studylistResult.onDestroyed(() => {
    const instance = Template.instance();

    // Destroy the daterangepicker to prevent residual elements on DOM
    instance.datePicker.remove();
});

function resetSortingColumns(instance, sortingColumn) {
    Object.keys(instance.sortingColumns.keys).forEach(key => {
        if (key !== sortingColumn) {
            instance.sortingColumns.set(key, null);
        }
    });
}

Template.studylistResult.events({
    'keydown input'(event, instance) {
        if (event.which === 13) { //  Enter
            search(instance);
        }
    },

    'click .orderTypeFilter'(event, template) {
        //var type = $('#order-type-filter').val();
        var type = event.currentTarget.id;
        console.log('type', type);
        if(type == 'all') {
          template.filter1.set("");
        } else {
          template.filter1.set({'$eq': type});
        }
    },

    'change #order_date_range'(event, template) {
        var dateRange = $('#order_date_range').val();
        console.log('dateRange:', dateRange);
        var orders = template.ordersMgmt.get();
        if(dateRange != "") {
          const dates = dateRange.split('-');
          var orderDateFrom = $.trim(dates[0]);
          var orderDateTo = $.trim(dates[1]);
          var from = orderDateFrom.split('/');
          var fromdate = from[2] + '-' + from[0] + '-' + from[1];
          var to = orderDateTo.split('/');
          var todate = to[2]+'-'+to[0]+'-'+to[1];
          console.log('order_date_range:', todate);
          template.filter2.set({ $gte: fromdate, $lt: todate});
        } else {
        //  getOrderData(template);
          template.filter2.set("");
        }
    },

    'change #shareDateRange'(event, template) {
        var dateRange = $('#shareDateRange').val();
        if(dateRange != "") {
          const dates = dateRange.split('-');
          var shareDateFrom = $.trim(dates[0]);
          var shareDateTo = $.trim(dates[1]);
          var from = shareDateFrom.split('/');
          var fromdate = from[2] + '-' + from[0] + '-' + from[1];
          var to = shareDateTo.split('/');
          var todate = to[2]+'-'+to[0]+'-'+to[1];
          template.filter3.set({ $gte: fromdate, $lt: todate});
        } else {
        //  getOrderData(template);
          template.filter3.set("");
        }
    },

    'onsearch input'(event, instance) {
        search(instance);
    },

    'change #studyDate'(event, instance) {
        let dateRange = $(event.currentTarget).val();

        // Remove all space chars
        dateRange = dateRange.replace(/ /g, '');

        // Split dateRange into subdates
        const dates = dateRange.split('-');
        studyDateFrom = dates[0];
        studyDateTo = dates[1];

        if (dateRange !== '') {
            search(instance);
        }
    },

    'click div.sortingCell'(event, instance) {
        const elementId = event.currentTarget.id;

        // Remove _ from id
        const columnName = elementId.replace('_', '');

        let sortOption = {};
        resetSortingColumns(instance, columnName);

        const columnObject = instance.sortingColumns.get(columnName);
        if (columnObject) {
            instance.sortingColumns.set(columnName, columnObject * -1);
            sortOption[columnName] = columnObject * -1;
        } else {
            instance.sortingColumns.set(columnName, 1);
            sortOption[columnName] = 1;
        }

        instance.sortOption.set(sortOption);
        Session.set('sortOption', sortOption);
    },

    // 'click button.filter-buttons'(event, instance) {
    //     const elementId = event.currentTarget.id;
    //     $('#filterDateRange').val('');
    //     console.log(elementId);
    //  },

    'click #myStudies'(event, instance) {
       getPatientList('myStudies', instance);
     },

    'click #myGroupStudies'(event, instance) {
       getPatientList('myGroupStudies', instance);
     },

    'click #allStudies'(event, instance) {
        $("#studylistOverlay").show();
        $("#view-all-studies").show();
     },

    'click .dialogClose'(event, instance) {
         $("#studylistOverlay").hide();
         $(".modal").hide();
         instance.imageShareBtn.set(false);
     },

     'click #confirmBtn'(event, instance) {
          getPatientList('allStudies', instance);
          $("#studylistOverlay").hide();
          $(".modal").hide();
      },

    'change #filterDateRange, change #studyDaterange'(event, instance) {
         let dateRange = $(event.currentTarget).val();

         // Remove all space chars
         dateRange = dateRange.replace(/ /g, '');

         // Split dateRange into subdates
         const dates = dateRange.split('-');
         studyDateFrom = dates[0];
         studyDateTo = dates[1];

         if (dateRange !== '') {
             search(instance);
         }
     },

     'click .daterangeBtn'(event, instance) {
          let selectedOption = $(event.currentTarget).attr('id');
          console.log(selectedOption);
          const today = moment().format('MM/DD/YYYY');
          const lastWeek = moment().subtract(6, 'days').format('MM/DD/YYYY');
          const lastMonth = moment().subtract(29, 'days').format('MM/DD/YYYY');
          const startOfMonth = moment().startOf('month').format('MM/DD/YYYY');
          const last14Days = moment().subtract(14, 'days').format('MM/DD/YYYY');
          const last90days = moment().subtract(90, 'days').format('MM/DD/YYYY');
          const dateFilterNumDays = OHIF.uiSettings.studyListDateFilterNumDays;
          //$('#filterDateRange').css('visibility', 'hidden');
          if (selectedOption == 'today') {
            studyDateFrom = today;
            studyDateTo = today;
          } else if (selectedOption == 'lastweek') {
            studyDateFrom = lastWeek;
            studyDateTo = today;
          } else if (selectedOption == 'thismonth') {
            studyDateFrom = startOfMonth;
            studyDateTo = today;
          } else if (selectedOption == 'last7days') {
            studyDateFrom = lastWeek;
            studyDateTo = today;
          } else if (selectedOption == 'last14days') {
            studyDateFrom = last14Days;
            studyDateTo = today;
          } else if (selectedOption == 'last90days') {
            studyDateFrom = last90days;
            studyDateTo = today;
          } else if (selectedOption == 'custom') {
            $('#filterDateRange').css('visibility', 'visible');
          } else if (selectedOption == 'all') {
            studyDateFrom = '';
            studyDateTo = '';
            search(instance);
          }
          if(studyDateFrom && studyDateTo) {
            search(instance);
          }
      },


    'click .settingBtn'(event, instance) {
      let btn_id = event.currentTarget.id;
      console.log(btn_id);
      let ae_title = $('#setting-ae-title').val();
      console.log('ae_title:', ae_title);
      let ip = $('#setting-ip').val();
      let port = $('#setting-port').val();
      let name = $('#setting-name').val();
      let type = $('#setting-type').val();
      let purgeStudies = $('#purge-studies').val();
      var data = {
          ae_title: ae_title,
          ip: ip,
          port: port,
          name: name,
          type: type,
          purgeStudies: purgeStudies,
          access_token: Session.get('access_token')
      };
      console.log('addPacs data:', data);
      if(btn_id == 'addSetting') {
        Meteor.call('AddPacs', data, (error, resp) => {
          console.log('addpacs:', resp);
          if(resp == 401) {
            Router.go('/imageviewer/login');
          } else {
            let response = JSON.parse(resp.content);
            //console.log('addpacs:', response);
            if (response.status === false) {
              return;
            } else {
              getPaginatePacsData(1, instance);
              resetSettingFields(instance);
              $("#settings-modal").hide();
              $("#studylistOverlay").hide();
            }
          }          
        });
        //add
      } else if (btn_id == 'updateSetting') {
        //update
        let pacid = $("#editpacId").val();
        data.id = parseInt(pacid);
        Meteor.call('EditPacs', data, (error, resp) => {
          console.log('EditPacs:', resp);
          if(resp == 401) {
            Router.go('/imageviewer/login');
          } else {
            let response = JSON.parse(resp.content);
            if (response.status === false) {
              return;
            } else {
              getPaginatePacsData(1, instance);
              resetSettingFields(instance);
              $("#settings-modal").hide();
              $("#studylistOverlay").hide();
            }
          }          
        });
      }
    },
    'click .toggleSettingBtn'(event, instance) {
      let type = 0;
      let pacId = 0;
      let btnid = event.currentTarget.id;

      let formtype = Session.get('addSetting');
      console.log('bb:', formtype);
      if(formtype == false) {
        if(btnid == "toggleSettingBtn") {
          if($(event.currentTarget).prop("checked") == true){
            type = 0;
          }
          else if($(event.currentTarget).prop("checked") == false){
            console.log('false');
            type = 1;
          }
          let pacid = $("#editpacId").val();
          pacId = parseInt(pacid);
        } else {
          let splitbtnid = btnid.split('_');
          let i = parseInt(splitbtnid[1]);
          let pacid = $("#pacid_"+i).val();
          pacId = parseInt(pacid);
          if($(event.currentTarget).prop("checked") == true){
            console.log('true');
            type = 0;
            $("#row_"+ i +" input").prop("disabled", false);
            $("#row_"+ i +" button").prop("disabled", false);
            $("#row_"+ i +" a").removeClass("disabled");
          }
          else if($(event.currentTarget).prop("checked") == false){
            console.log('false');
            type = 1;
            $("#row_"+ i +" input").prop("disabled", true);
            $("#row_"+ i +" button").prop("disabled", true);
            $("#row_"+ i +" a").addClass("disabled");
          }
        }
        var data = {
            pacId: pacId,
            type: type,
            access_token: Session.get('access_token')
        };
        Meteor.call('DisablePacs', data, (error, resp) => {
          if(resp == 401) {
            Router.go('/imageviewer/login');
          } else {
            let response = JSON.parse(resp.content);
            console.log('DisablePacs:', response);
            if (response.status === true) {
              getPaginatePacsData(1, instance);
              if(btnid == "toggleSettingBtn") {
                resetSettingFields(instance);
                $("#settings-modal").hide();
                $("#studylistOverlay").hide();
              }
            }
          }         
        });
      }
   },
   'click .editPac'(event, instance) {
     Session.set('addSetting', false);
     var btnid = event.currentTarget.id;
     var splitId = btnid.split('_');
     var i = parseInt(splitId[1]);
     $(".editSettingHeading").html('Edit AE Settings - <span class="settingCount" style="color: #707070;">'+i+'</span>')
     var pacId = $("#pacid_"+i).val();
     var data = {
         pacId: pacId,
         access_token: Session.get('access_token')
     };
     Meteor.call('GetPacDetail', data, (error, resp) => {
       if(resp == 401) {
        Router.go('/imageviewer/login');
       } else {
        let response = JSON.parse(resp.content);
        console.log('GetPacDetail:', response);
        if (response.status === true) {
          $("#setting-ae-title").val(response.data.ae_title);
          $("#setting-ip").val(response.data.ip);
          $("#setting-port").val(response.data.port);
          $("#setting-name").val(response.data.common_name);
          $("#setting-type").val(response.data.type);
          $("#purge-studies").val(response.data.purge_studies);
          if(response.data.disable == 0) {
            $("#toggleSettingBtn").prop('checked', true);
          } else {
            $("#toggleSettingBtn").prop('checked', false);
          }
          $("#editpacId").val(pacId);
          $("#settings-modal").show();
          $("#studylistOverlay").show();
  
          //$(".saveSettings").attr('id','saveSettings_'+ response.data.id);
        }
       }
      
    });
  },
  'click .delPac'(event, instance) {
    $("#delSetting").val('');
    var btnid = event.currentTarget.id;
    let pacId = 0;
    if(btnid == 'deleteSetting') {
      let pacid = $("#editpacId").val();
      pacId = parseInt(pacid);
      $("#settings-modal").hide();

    } else {
      var splitId = btnid.split('_');
      let i = parseInt(splitId[1]);
      let pacid = $("#pacid_"+i).val();
      pacId = parseInt(pacid);
    //  $("#row_"+i).remove();
    }
    $("#delete-setting-modal").show();
    $("#delSetting").val(pacId);

 },
 'click #confirmDeleteSetting'(event, instance) {
   let pacId = $("#delSetting").val();
   var data = {
       pacId: pacId,
       access_token: Session.get('access_token')
   };
   Meteor.call('DeletePac', data, (error, resp) => {
     if(resp == 401) {
      Router.go('/imageviewer/login');
     } else {
      let response = JSON.parse(resp.content);
      console.log('DeletePac:', response);
      if (response.status === true) {
      var pageNo = 1;
      getPaginatePacsData(pageNo, instance);
      resetSettingFields(instance);
      $("#delete-setting-modal").hide();
      $("#studylistOverlay").hide();
      }
     }    
  });
 },
 'click #closeDelSettingpopup' (event, instance) {
   $("#delSetting").val('');
   $("#delete-setting-modal").hide();
   $("#studylistOverlay").hide();
 },
 'click button.settingsDialogClose'(event, instance) {
   resetSettingFields(instance);
   $("#settings-modal").hide();
   $("#studylistOverlay").hide();
 },
 'click button.closeReportModal'(event) {
   $("#view-ss-record-pdf iframe").attr("src","");
   $("#view-ss-record-pdf").hide();
   $("#studylistOverlay").hide();
 },
 'click button#share'(event) {  
   share();
 },
 'click button#cancel'(event) {
   document.getElementById("share-modal").style.display = 'none';
   document.getElementById("studylistOverlay").style.display = 'none';
 },
 'click #toggleImageShareStudyDialog'(event, instance) {
   getImageShareData(instance);
   instance.imageShareBtn.set(true);
   $("#studylistOverlay").show();
   $("#imageShare-modal").show();
 },
 'click .imageShare-modal tr, click table.imageShareList'(event, instance) {
     let data;
     if($(window).width() < 961) {
       data = {
          sharer_name: $(event.target).closest('table').find('td.sname').text(),
          study_description: $(event.target).closest('table').find('td.sdesc').val(),
          created_at: $(event.target).closest('table').find('td.screated').val(),
          share_id: parseInt($(event.target).closest('table').find('.mshareID').val()),
          activeControls: $(event.target).closest('table').find('.mshareActControls').val()
        }
     } else {
       data = this;
     }  
     console.log('reshareData:', data);
     var share_id = data.share_id;
     console.log('reshareId::', share_id);
     var btnType = $(event.target).attr('rel');
     let reshareData = {
       sharer_name: data.sharer_name,
       study_description: data.study_description,
       shared_date: data.created_at,
     }
     let activeControls = parseInt(data.activeControls);
     console.log('check active:', activeControls);
     Session.set('activeControls', activeControls);
     Session.set('reshareData', reshareData);
     if(btnType == 'reshare') {
       $("#image-share-email").val('');
       $("#image-share-password").val('');
       $("#image-share-message").val('');
       $("#duration").val('90');
       $("#reshareID").val('');
       $("#image-share-mobile").val('');
       openReshareModal(share_id, instance);
     } else if(btnType == 'cancel') {
       cancelShare(share_id, instance);
     }
   },
 'click #reshare'(event, instance) {
     var imageShareEmail = $("#image-share-email").val();
     var imageSharePassword = $("#image-share-password").val();
     var imageShareMobile = $("#image-share-mobile").val();
     var imageShareMessage = $("#image-share-message").val();
     var duration = $("#duration").val();
     var shareID = $("#reshareID").val();
     var user_id = Session.get('userId');
     var newURL = window.location.protocol + "//" + window.location.host;
     console.log('user:', newURL);
     var data = {
         imageShareEmail: imageShareEmail,
         imageSharePassword: imageSharePassword,
         imageShareMobile: imageShareMobile,
         imageShareMessage: imageShareMessage,
         duration: duration,
         shareID: shareID,
         user_id: user_id,
         url: newURL,
         access_token: Session.get('access_token')
     };
     saveImageShareData(data, instance);
   },
 'click .reshareDialogClose'(event, instance) {
   document.getElementById("share-modal").style.display = 'none';
   $("#imageShare-modal").show();
   instance.imageShareBtn.set(false);
 },
 'change .image-share-duration'(event, instance) {
     var selectId = $(event.target).attr('id');
     var splitId = selectId.split('_');
     var share_id = splitId[1];
     var new_duration = $('#'+selectId).val();
     var user_id = Session.get('userId');
     var data = {
         share_id: share_id,
         new_duration: new_duration,
         user_id: user_id,
         access_token: Session.get('access_token')
     };
     Meteor.call('UpdateDuration', data, (error, resp) => {
       console.log('UpdateDuration:', resp);
      if(resp == 401) {
        Router.go('/imageviewer/login');
      } else {
        let response = JSON.parse(resp.content);
        if (response.status === true) {
          var imageShareData = instance.imageShareStudy.get();
          console.log('imageShareData:', imageShareData);
          imageShareData.find(function(value, index) {
            if(value.share_id == share_id) {
              imageShareData[index].duration = new_duration;
            }
          });
          console.log('updated Data:', imageShareData);
          instance.imageShareStudy.set(imageShareData);
        }
      }      
    });
  },
  'click #toggleOrderDialog'(event, instance) {
    getOrderData(instance);
    // instance.ordersMgmt.set(true);
    $("#studylistOverlay").show();
    $("#order-modal").show();
  },
 'click #delete_order'(event, instance) {
   var selectedOrder = new Array();
    $('.order_delete_checkbox:checked').each(function() {
    selectedOrder.push(this.value);
    });
    console.log('selectedOrder:', selectedOrder);
    deleteOrder(instance,selectedOrder);
 },
 'click .ssPDF' (event, instance) {
     console.log('ssPDF::', event.target);
     var fileval = $(event.target).attr('data-file');
     var user_id = Session.get('userId');
     var data = {
          filePath: fileval,
          user_id: user_id,
          access_token: Session.get('access_token')
      };
     Meteor.call('ViewOrderPDF', data, (error, resp) => {
       console.log('ViewOrderPDF:', resp);
       let response = JSON.parse(resp.content);
       if (response.status === true) {
         Session.set('orderpdf_url', `${Meteor.settings.public.apiRoot}/pdf/view/${response.data}`) ;
         $("#view-ss-pdf iframe").attr("src",Session.get('orderpdf_url'));
         $("#order-modal").hide();
         $("#view-ss-pdf").show();
       } else {
         alert(response.data);
       }
    });
  },
 'click .closeOrderModal' (event, instance) {
    $("#order-modal").show();
    $("#view-ss-pdf").hide();
    Session.set('orderpdf_url', '');
  },
 'click #addPacsBtn' (event, instance) {
    $("#settings-modal").show();
    $("#studylistOverlay").show();
    $("#updateSetting").hide();
    $("#addSetting").show();
    $("#deleteSetting").hide();
    resetSettingFields(instance);
    Session.set('addSetting', true);
    var countValue = $( ".settingBox" ).last().find(".countValue").html();
    if (typeof countValue === "undefined") {
      countValue = 1;
    } else {
      countValue = parseInt(countValue) + 1;
    }
    $(".editSettingHeading").html('Add AE Settings - <span class="settingCount" style="color: #707070;">'+countValue+'</span>');
  },
  'click #selectAllOrders' (event, instance) {
      if($(event.currentTarget).prop("checked") == true){
        console.log('all checked');
        $(".order_delete_checkbox").each(function() {
            this.checked = true;
        });
      }
      else if($(event.currentTarget).prop("checked") == false){
        console.log('all unchecked');
        $(".order_delete_checkbox").each(function() {
            this.checked = false;
        });
      }
  },
  'click .shareDialogClose' (event, instance) {
    console.log('close share');
    $("#share-modal").hide();
    $("#studylistOverlay").hide();
  },
  'click #imageshareOK' (event, instance) {
    $("#share-success-modal").hide();
    $("#studylistOverlay").hide();
  },
  'click #closepopup' (event, instance) {
    $("#reshare-cancel-modal").hide();
    $("#studylistOverlay").hide();
  },
  'click #cancelReshare' (event, instance) {
    document.getElementById("share-modal").style.display = 'none';
    $("#reshare-cancel-modal").show();
    let reshareData = Session.get('reshareData');
    let resharePatientName = Session.get('resharePatientName');
    var currentDate = moment().format('YYYY-MM-DD hh:mm a');
    $("#cancelStudyPname").html(resharePatientName);
    $("#cancelStudyDesc").html(reshareData.study_description);
    $("#cancelSharedDate").html(currentDate);
  },
  'click #cancelShare' (event, instance) {
    let share_id = $("#reshareID").val();
    cancelShare(share_id, instance);
    $("#reshare-cancel-modal").hide();
    $("#studylistOverlay").hide();
  },
  'click #loadMoreImageShare' (event, instance) {
      let rows = instance.shareRowsPerPage.get();
      let imageShareStudy = instance.imageShareStudy.get();
      let totalCount = imageShareStudy.length;
      let shareRows = parseInt(rows) + 10;
      if(shareRows <= totalCount) {
        instance.shareRowsPerPage.set(shareRows);
      }
      if(totalCount == shareRows) {
        document.getElementById("loadMoreImageShare").disabled = true;
      }
  },
  'click #loadMoreOrders' (event, instance) {
      let rows = instance.orderRowsPerPage.get();
      let ordersMgmt = instance.ordersMgmt.get();
      let totalCount = ordersMgmt.length;
      let shareRows = parseInt(rows) + 10;
      if(shareRows <= totalCount) {
        instance.orderRowsPerPage.set(shareRows);
      }
      if(totalCount == shareRows) {
        document.getElementById("loadMoreOrders").disabled = true;
      }
  },
  'click #loadImageShareMobile' (event, instance) {
    let rowsPerPage = 5;
    let imageShareStudy = instance.imageShareStudy.get();
    let totalCount = imageShareStudy.length;
    let currentPage = parseInt(instance.mShareCurrentPage.get()) + 1;
    const offset = rowsPerPage * currentPage;
    const limit = offset + rowsPerPage;
    console.log('currentPage: loadImageShareMobile:', currentPage);
    console.log('loadImageShareMobile offset:', offset);
    console.log('loadImageShareMobile limit:', limit);
    let slicedShareData = imageShareStudy.slice(offset, limit);
    console.log('slicedShareData:', slicedShareData);
    let mShareData = instance.mImageShareArr.get();
    console.log('mShareData load more::', mShareData);    
    let arrJoin = mShareData.concat(slicedShareData);  
    console.log('concat::', arrJoin); 
    instance.mImageShareArr.set(arrJoin);
    instance.mShareCurrentPage.set(currentPage);

    // if(shareRows <= totalCount) {
    //   instance.mShareRowsPerPage.set(shareRows);
    // }
    // if(totalCount == shareRows) {
    //   document.getElementById("loadImageShareMobile").disabled = true;
    // }
},
'click #loadOrderDataMobile' (event, instance) {
  let rowsPerPage = 5;
  let ordersMgmt = instance.ordersMgmt.get();
  let totalCount = ordersMgmt.length;
  let currentPage = parseInt(instance.mOrderCurrentPage.get()) + 1;
  const offset = rowsPerPage * currentPage;
  const limit = offset + rowsPerPage;
  let slicedSOrderData = ordersMgmt.slice(offset, limit);
  let mOrderData = instance.mOrderMgmtArr.get();
  console.log('mOrderData load more::', mOrderData);    
  let arrJoin = mOrderData.concat(slicedSOrderData);  
  console.log('concat::', arrJoin); 
  instance.mOrderMgmtArr.set(arrJoin);
  instance.mOrderCurrentPage.set(currentPage);

  // if(shareRows <= totalCount) {
  //   instance.mShareRowsPerPage.set(shareRows);
  // }
  // if(totalCount == shareRows) {
  //   document.getElementById("loadImageShareMobile").disabled = true;
  // }
},
  'click #logoutLink' (event, instance) {      
      let access_token = Session.get('access_token');
      if(Session.get('sso') == true) {
        Session.clear();
      } else {
        Meteor.call('Logout', access_token, (error, resp) => {
          console.log('logout error::', error);
          console.log('logout resp::', resp);
          if (resp.statusCode == 200) {
            var reponseData = JSON.parse(resp.content);
            if(reponseData.status === true) {              
              Session.clear();
              Router.go('/imageviewer/login');
            }          
          } else {
            Router.go('/imageviewer/login');
          }         
        });
      }
  },
  'click .navIcon' (event, instance) {
    document.getElementById("sidenav").style.width = "280px";
  },
  'click .closeSideNav' (event, instance) {
    document.getElementById("sidenav").style.width = "0px";
  },
  'click #searchFilter' (event, instance) {
    $(".searchDiv").show();
  },
  'click #filterCalendar' (event, instance) {
    $('#studyDaterange').data('daterangepicker').toggle();    
  },
  'click #sidenav a' (event, instance) {
    event.preventDefault();
    let content = $(event.target).attr('href');
    $(event.target).addClass('active');
    $(event.target).siblings().removeClass('active');
    $(content).show();
    $(content).siblings('.tab-content').hide();
  },
  'click #pingSetting' (event, instance) {
    let ae_title = $('#setting-ae-title').val();
    let ip = $('#setting-ip').val();
    let port = $('#setting-port').val();    
    let waitSeconds = $('#waitSeconds').val();
    let countErr = 0;
    if(ae_title == "" && ip == "" && port == "") {
      countErr = 1;
      toastr.error('AE Title, IP & Port is required..');     
    } else if (ae_title != "" && ip == "" && port == "") {
      countErr = 1;
      toastr.error('IP & Port is required..');  
    } else if (ae_title == "" && ip != "" && port == "") {
      countErr = 1;
      toastr.error('AE Title & Port is required..'); 
    } else if (ae_title == "" && ip == "" && port != "") {
      countErr = 1;
      toastr.error('AE Title & IP is required..'); 
    } else if (ae_title != "" && ip != "" && port == "") {
      countErr = 1;
      toastr.error('Port is required..');
    } else if (ae_title != "" && ip == "" && port != "") {
      countErr = 1;
      toastr.error('IP is required..');
    } else if (ae_title == "" && ip != "" && port != "") {
      countErr = 1;
      toastr.error('AE Title is required..');
    }
    var data = {
        ae_title: ae_title,
        ip: ip,
        port: port,
        waitSeconds: waitSeconds,
        access_token: Session.get('access_token')        
    };
    if(countErr == 0) {      
      Meteor.call('PingPacsSetting', data, (error, resp) => {
        console.log('PingPacsSetting:', resp);          
          //Session.set('addSetting', true);
          if(resp == 401) {
            Router.go('/imageviewer/login');
          } else {
            $("#updateSetting").hide();
            $("#addSetting").show();
            $("#deleteSetting").hide();
            $("#pingSetting").show(); 
            if(resp) {
              let response = JSON.parse(resp.content);  
              let checkSuccess = response[3];
              console.log('PingPacsSetting checkSuccess:', checkSuccess);
              if(checkSuccess.indexOf('Success') != -1){
                toastr.success('Received Echo Response (Status: Success)..');
              } else {
                toastr.error(response[2]);
              }
            }
          }                 
      });
    }          
  },
  'click #studySearch' (event, instance) {
    console.log('studySearch mobile');
    studyListMobilesearch(instance);
    $(".searchDiv").hide();
    $("#studySearchType").val('');
    $("#studySearchValue").val('');
  },
  'click .modal' (event) {
    let modalID = $(event.target).attr('id');
    console.log('modalID::', modalID);
    if(modalID == 'view-ss-record-pdf') {
      $('.modal').hide();
      $('#studylistOverlay').hide();
    }    
  }  
});
