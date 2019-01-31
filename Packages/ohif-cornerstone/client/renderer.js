import { Meteor, OHIF } from '../namespace';
//2018-11-12
const rendererPath = 'canvas';
OHIF.cornerstone.renderer = OHIF.utils.ObjectPath.get(Meteor, rendererPath) || '';
