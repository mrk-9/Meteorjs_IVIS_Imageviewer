import { OHIF } from 'meteor/ohif:core';

/**
 * Retrieves metaData for multiple studies at once.
 *
 * This function calls retrieveStudyMetadata several times, asynchronously,
 * and waits for all of the results to be returned.
 *
 * @param studyInstanceUids The UIDs of the Studies to be retrieved
 * @return Promise
 */
OHIF.studies.retrieveStudiesMetadata = (studiesData) => {
    const promise1 = OHIF.studies.retrieveStudyMetadata(studiesData);

    const promise = Promise.all([promise1]);

    // Warn the error on console if some retrieval failed
    promise.catch(error => OHIF.log.warn(error));

    return promise;
};
