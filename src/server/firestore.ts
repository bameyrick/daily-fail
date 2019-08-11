import * as admin from 'firebase-admin';

admin.initializeApp({
	databaseURL: process.env.DAILY_FAIL_FIREBASE_DATABASE,
	credential: admin.credential.cert({
		privateKey: process.env.DAILY_FAIL_FIREBASE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
		clientEmail: process.env.DAILY_FAIL_FIREBASE_CLIENT_EMAIL,
		projectId: process.env.DAILY_FAIL_FIREBASE_PROJECT_ID,
	}),
});

export const firestore = admin.firestore();
