import { Template } from 'meteor/templating';
import { Blaze } from 'meteor/blaze';
import Hammer from 'hammerjs';
import { OHIF } from 'meteor/ohif:core';
import { Session } from 'meteor/session';

Template.studylistStudy.helpers({
    checkMobileDevice () {
        //if($(window).width() < 800) {
        if($(window).width() < 961) {            
            return true;
        }
    },
    checkPatientId () {
      return Session.get('pid');
    }
});

// Clear all selected studies
function doClearStudySelections() {
    OHIF.studylist.collections.Studies.update({}, {
        $set: { selected: false }
    }, { multi: true });
}

function doSelectRow($studyRow, data) {
    // Mark the current study as selected if it's not marked yet
    if (!data.selected) {
        const filter = { studyInstanceUid: data.studyInstanceUid };
        const modifiers = { $set: { selected: true } };
        OHIF.studylist.collections.Studies.update(filter, modifiers);
    }

    // Set it as the previously selected row, so the user can use Shift to select from this point on
    OHIF.studylist.$lastSelectedRow = $studyRow;
}

function doSelectSingleRow($studyRow, data) {
    // Clear all selected studies
    doClearStudySelections();

    // Add selected row to selection list
    doSelectRow($studyRow, data);
}

function doUnselectRow($studyRow, data) {
    // Find the current studyInstanceUid in the stored list and mark as unselected
    const filter = { studyInstanceUid: data.studyInstanceUid };
    const modifiers = { $set: { selected: false } };
    OHIF.studylist.collections.Studies.update(filter, modifiers);
}

function handleShiftClick($studyRow, data) {
    let study;
    let $previousRow = OHIF.studylist.$lastSelectedRow;
    if ($previousRow && $previousRow.length > 0) {
        study = Blaze.getData($previousRow.get(0));
        if (!study.selected) {
            $previousRow = $(); // undefined
            OHIF.studylist.$lastSelectedRow = $previousRow;
        }
    }

    // Select all rows in between these two rows
    if ($previousRow.length) {
        let $rowsInBetween;
        if ($previousRow.index() < $studyRow.index()) {
            // The previously selected row is above (lower index) the
            // currently selected row.

            // Fill in the rows upwards from the previously selected row
            $rowsInBetween = $previousRow.nextAll('tr');
        } else if ($previousRow.index() > $studyRow.index()) {
            // The previously selected row is below the currently
            // selected row.

            // Fill in the rows upwards from the previously selected row
            $rowsInBetween = $previousRow.prevAll('tr');
        } else {
            // nothing to do since $previousRow.index() === $studyRow.index()
            // the user is shift-clicking the same row...
            return;
        }

        // Loop through the rows in between current and previous selected studies
        $rowsInBetween.each((index, row) => {
            const $row = $(row);

            // Retrieve the data context through Blaze
            const data = Blaze.getData(row);

            // If we find one that is already selected, do nothing
            if (data.selected) return;

            // Set the current study as selected
            doSelectRow($row, data);

            // When we reach the currently clicked-on $row, stop the loop
            return !$row.is($studyRow);
        });
    } else {
        // Set the current study as selected
        doSelectSingleRow($studyRow, data);
    }
}

function handleCtrlClick($studyRow, data) {
    const handler = data.selected ? doUnselectRow : doSelectRow;
    handler($studyRow, data);
}

/**
 * Image Share button event handler
 */
function share(studyInstanceUID) {
    const durationDropdown = document.getElementById("duration");
    const data = {
        studyInstanceUID: studyInstanceUID,
        email: document.getElementById("image-share-email").value,
        password: document.getElementById("image-share-password").value,
        mobile: document.getElementById("image-share-mobile").value,
        message: document.getElementById("image-share-message").value,
        duration: durationDropdown.options[durationDropdown.selectedIndex].value,
        url: window.location.protocol + "//" + window.location.host,
        access_token: Session.get('access_token')
    };
    console.log('share shareAPI', data);
    Meteor.call('ShareAPI', data, function(err, response) {
        console.log(err);
        console.log(response);
        alert(response.content);
        OHIF.viewerbase.viewportUtils.toggleShareDialog();
    });
}

Template.studylistStudy.onRendered(() => {
    const instance = Template.instance();
    const data = instance.data;
    let $row;
    
    $row = instance.$('tr.studylistStudy').first();
       
    let touchtime = 0;
    // Enable HammerJS to allow touch support
    const mc = new Hammer.Manager($row.get(0));
    const doubleTapRecognizer = new Hammer.Tap({
        event: 'doubletap',
        taps: 2,
        interval: 500,
        threshold: 30,
        posThreshold: 30
    });
    mc.add(doubleTapRecognizer);

    // Check if current row has been previously selected
    if (data.selected) {
        doSelectRow($row, data);
    }
});

Template.studylistStudy.events({
    'click tr.studylistStudy, click table.studylistStudy'(event, instance) {
        const $studyRow = $(event.currentTarget);
        const data = instance.data;
        //console.log('clicked45');
        //console.log('window width::', $(window).width());
        // Remove the ID so we can directly insert this into our client-side collection
        delete data._id;

        if (event.shiftKey) {
            handleShiftClick($studyRow, data);
        } else if (event.ctrlKey || event.metaKey) {
            handleCtrlClick($studyRow, data);
        } else {
            doSelectSingleRow($studyRow, data);
        }

        if (touchtime == 0) {
            touchtime = new Date().getTime();
        } else {
            // compare first click to this click and see if they occurred within double click threshold
            if (((new Date().getTime()) - touchtime) < 800) {
                // double click occurred
                
                if($(window).width() < 961) {
                //if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
                  console.log('mobile device dbl click');
                  const dblClickOnStudy = OHIF.studylist.callbacks.dblClickOnStudy;

                  if (dblClickOnStudy && typeof dblClickOnStudy === 'function') {
                      dblClickOnStudy(instance.data);
                  }
                }
                touchtime = 0;
            } else {
                // not a double click so set as a new first click
                touchtime = new Date().getTime();
            }
        }
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
    },
    'click .imageViewerReport'(event, instance) {
      const ins = instance.data;
      const patientId = ins.patientId;
      const accessionNumber = ins.accessionNumber;
      const studyId = ins.studyId;
      const pdfurl = '';
      const data = {
          pid: patientId,
          study_id: accessionNumber
      };
      console.log('pdffff');
      console.log('pdfdata::', data);
      Session.set('pdf_url_pid', patientId);
      Session.set('pdf_url_study_id', accessionNumber);

      Meteor.call('GetPDFUrl', data, function(err, response){
          console.log('err', err);
          console.log('response', response);
          Session.set('pdf_url', `${Meteor.settings.public.apiRoot}/pdf/view/${response}`);
          //Session.set('pdf_url', `http://dev6.scriptsender.com/pdf/view/${response}`);
          //console.log('url:', Session.get('pdf_url'));
          $("#view-ss-record-pdf iframe").attr("src",Session.get('pdf_url'));
          $("#view-ss-record-pdf").show();
          $("#studylistOverlay").show();
      });
    },
    'click .imageViewerShare'(event, instance) {
        if(!$(event.target).hasClass('disabled')) {
            $("#image-share-email").val('');
            $("#image-share-password").val('');
            $("#image-share-message").val('');
            $("#duration").val('90');
            $("#reshareID").val('');
            $("#image-share-mobile").val('');
            const ins = instance.data;
            let patientdata = {
                patientName : instance.data.patientName,
                studyDescription: instance.data.studyDescription
            }
            console.log('instance',instance.data);
            Session.set('checkReshare', false);
            Session.set('sharePatientData', patientdata);
            Session.set('share_studyInstanceUid', ins.studyInstanceUid);
            document.getElementById("share-modal").style.display = 'block';
            document.getElementById("studylistOverlay").style.display = 'block';
        }        
     }
});
