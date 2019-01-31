import { Meteor } from 'meteor/meteor';
import { OHIF } from 'meteor/ohif:core';
import 'meteor/ohif:viewerbase';

// Define the StudyMetaDataPromises object. This is used as a cache to store study meta data
// promises and prevent unnecessary subsequent calls to the server
const StudyMetaDataPromises = new Map();

/**
 * Retrieves study metadata using a server call
 *
 * @param {String} studyInstanceUid The UID of the Study to be retrieved
 * @returns {Promise} that will be resolved with the metadata or rejected with the error
 */
OHIF.studies.retrieveStudyMetadata = (studiesData) => {

    // Create a promise to handle the data retrieval
    var seriesList = [];
    var seriesMap = {};
    var studyData = {
        seriesList: seriesList,
        patientName: studiesData.patientName,
        patientId: studiesData.pid,
        //patientAge: "0",
        //patientSize: "0",
        //patientWeight: "0",
        selected: true,
        accessionNumber: studiesData.transactionId,
        studyDate: studiesData.studyDate,
        ////modalities: studiesData.modality,
        studyDescription: studiesData.studyDescription,
        studyInstanceUid: studiesData.studies[0].studyInstanceUid,
        UUID:studiesData['UUID'],
        //institutionName: "",
        wadoUriRoot: "",
        referringPhysicianName:studiesData['referringPhysicianName'],
        referringPhysicianAddress:studiesData['referringPhysicianAddress'],
        referringPhysicianTelephoneNumber:studiesData['referringPhysicianTelephoneNumber'],
        referringPhysicianIDSequence:studiesData['referringPhysicianIDSequence'],
        codeValue:studiesData['codeValue'],
        studyID:studiesData['studyID'],
        patientBirthDate:studiesData['patientBirthDate'],
        patientSex:studiesData['patientSex'],
        patientOrientation:studiesData['patientOrientation']
    };

    studiesData.studies[0].seriesList.forEach(function(seriesData){
        var seriesInstanceUid = seriesData.seriesInstanceUid;

        var series = seriesMap[seriesInstanceUid];
        if (!series) {
            series = {
                seriesDescription: seriesData.seriesDescription,
                modality: studiesData.modality,
                seriesInstanceUid: seriesInstanceUid,
                seriesNumber: seriesData.seriesNumber,
                seriesDate: seriesData.seriesDate,
                seriesTime: seriesData.seriesTime,
                instances: []
            };
            seriesMap[seriesInstanceUid] = series;
            seriesList.push(series);
        }

        var sopInstanceUid = "";
        seriesData.instances.forEach(function(instance){
            var instance_url = instance.url.split("dicomweb:")[1];
            var instanceSummary = {
                imageType: "ORIGINAL\\PRIMARY\\\\",
                //sopClassUid: '1.2.840.10008.5.1.4.1.1.6.1',
                modality: studiesData.modality,
                sopInstanceUid: instance.sopInstanceUid,
                instanceNumber: instance.instanceNumber,
                //imagePositionPatient: instance.imagePositionPatient,
                //imageOrientationPatient: instance.imageOrientationPatient,
                //frameOfReferenceUID: undefined,// "1.2.392.200036.9116.2.6.1.48.1214835307.1377566913.718439",
                //sliceLocation: undefined,//98,
                samplesPerPixel: 3,//1,
                photometricInterpretation: "RGB",//"MONOCHROME2",
                planarConfiguration: 0, //undefined,
                rows: 486,//512,
                columns: 640,//512,
                //pixelSpacing: "0.500\\0.500",
                //pixelAspectRatio: 0,
                bitsAllocated: 8,//16,
                bitsStored: 8,//16,
                highBit: 7,//15,
                pixelRepresentation: 0,
                //smallestPixelValue: 30720,
                //largestPixelValue: 32973,
                //windowCenter: 130,
               // windowWidth: 130,
                //rescaleIntercept: -32768,
                //rescaleSlope: 1,
                //rescaleType: undefined,
                //sourceImageInstanceUid: undefined,//getSourceImageInstanceUid(instance),
                //laterality: undefined,
                //viewPosition: undefined,
                //acquisitionDateTime: undefined,
                //numberOfFrames: undefined,
                //frameIncrementPointer: undefined,//getFrameIncrementPointer(instance['00280009']),
                //frameTime: undefined,
                frameTimeVector: [],//parseFloatArray(),
                //sliceThickness: undefined,//2,
                //lossyImageCompression: undefined,
                //derivationDescription: undefined,
                //lossyImageCompressionRatio: undefined,
                //lossyImageCompressionMethod: undefined,
                //echoNumber: undefined,
                //contrastBolusAgent: undefined,
                //radiopharmaceuticalInfo: undefined,//getRadiopharmaceuticalInfo(instance),
                baseWadoRsUri: "",
                wadouri: instance_url,
                wadorsuri: "",
                imageRendering: 'wadouri',
                //thumbnailRendering: undefined
            };
            if (instanceSummary.photometricInterpretation === 'PALETTE COLOR') {
                const redPaletteColorLookupTableDescriptor = "";
                const greenPaletteColorLookupTableDescriptor = "";
                const bluePaletteColorLookupTableDescriptor = "";
                const palettes = "";

                if (palettes) {
                    if (palettes.uid) {
                        instanceSummary.paletteColorLookupTableUID = "";
                    }
                    instanceSummary.redPaletteColorLookupTableData = "";
                    instanceSummary.greenPaletteColorLookupTableData = "";
                    instanceSummary.bluePaletteColorLookupTableData = "";
                    instanceSummary.redPaletteColorLookupTableDescriptor = "";
                    instanceSummary.greenPaletteColorLookupTableDescriptor = "";
                    instanceSummary.bluePaletteColorLookupTableDescriptor = "";
                }
            }
            series.instances.push(instanceSummary);
        });
    });

    var study = {};

    study = studyData;

    const promise = new Promise((resolve, reject) => {
        if (!study) {
            reject(`GetStudyMetadata: No study data returned from server`);
            return;
        }
        
        if (window.HipaaLogger && Meteor.user && Meteor.user()) {
            window.HipaaLogger.logEvent({
                eventType: 'viewed',
                userId: Meteor.userId(),
                userName: Meteor.user().profile.fullName,
                collectionName: 'Study',
                //recordId: studyInstanceUid,
                patientId: study.patientId,
                patientName: study.patientName
            });
        }
        // Once the data was retrieved, the series are sorted by series and instance number
        OHIF.viewerbase.sortStudy(study);

        // Updates WADO-RS metaDataManager
        OHIF.viewerbase.updateMetaDataManager(study);

        // Transform the study in a StudyMetadata object
        const studyMetadata = new OHIF.metadata.StudyMetadata(study);

        // Add the display sets to the study
        study.displaySets = OHIF.viewerbase.sortingManager.getDisplaySets(studyMetadata);

        study.displaySets.forEach(displaySet => {
            OHIF.viewerbase.stackManager.makeAndAddStack(study, displaySet);
        });

        // Resolve the promise with the final study metadata object
        resolve(study);
    });

    // Store the promise in cache
    StudyMetaDataPromises.set(studiesData.studies[0].studyInstanceUid, promise);

    return promise;
};
