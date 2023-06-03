import firebase from 'firebase/compat/app';

export default interface Clip {
	docID?: string;
	uid: string;
	displayName: string;
	title: string;
	fileName: string;
	url: string;
	timestamp: firebase.firestore.FieldValue;
	screenshotURL: string;
	screenshotFileName: string;
}
