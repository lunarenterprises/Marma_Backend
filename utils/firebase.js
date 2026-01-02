const admin = require('firebase-admin');
const fs = require('fs');
var db = require("../config/db");
var util = require("util")
const query = util.promisify(db.query).bind(db);

module.exports.FirebaseSendNotification = async (messages, notifiactionbody, receiver_id, role) => {
    console.log(receiver_id, "receiver_id");

    let admin = await initializeFirebase();

    // getUser should return a single user object, not an array
    let userdata = await getUser(receiver_id, role);

    if (!userdata || !userdata.ft_fcm_token) {
        return 'user not logged in yet';
    }

    const message = {
        notification: notifiactionbody,
        data: messages,
        token: userdata.ft_fcm_token,
    };

    try {
        let response = await admin.messaging().send(message);
        console.log(`Notification sent successfully-${receiver_id}:`, response);
        return 'Notification sent successfully';
    } catch (error) {
        console.error('Error sending notification:', error.message);
        return error.message;
    }
};


let currentApp = null;
// async function initializeFirebase() {
//     // If there's an active app connection, delete it before switching to the new app
//     if (currentApp) {
//         console.log(`Deleting previous app connection: ${currentApp.name}`);
//         await currentApp.delete();
//         currentApp = null;  // Clear the reference to the previous app
//     }

//     // Read the service account credentials from the provided file
//     let serviceAccounts = JSON.parse(fs.readFileSync(process.cwd() + '/config/firebase.json', 'utf8'));

//     // Initialize the Firebase app with the credentials and database URL
//     currentApp = admin.initializeApp({
//         credential: admin.credential.cert(serviceAccounts),
//         databaseURL: `https://${serviceAccounts.project_id}.firebaseio.com`
//     });

//     return currentApp;
// }

async function initializeFirebase() {
    // Delete previous app if it exists
    if (currentApp) {
        console.log(`Deleting previous app connection: ${currentApp.name}`);
        await currentApp.delete();
        currentApp = null;
    }

    // Build service account object from env vars
    const serviceAccount = {
        type: process.env.FIREBASE_TYPE,
        project_id: process.env.FIREBASE_PROJECT_ID,
        private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
        private_key: process.env.FIREBASE_PRIVATE_KEY,
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        client_id: process.env.FIREBASE_CLIENT_ID,
        auth_uri: process.env.FIREBASE_AUTH_URI,
        token_uri: process.env.FIREBASE_TOKEN_URI,
        auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
        client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
        universe_domain: process.env.UNIVERSE_DOMAIN
    };

    // Initialize Firebase
    currentApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`
    });

    return currentApp;
}


let getUser = async (receiver_id, role) => {
    if (role === 'therapist') {
        const Query = `SELECT fcmtokens FROM fcm_tokens_therapist WHERE ft_therapist_id = ? LIMIT 1`;
        const data = await query(Query, [receiver_id]);
        return data && data.length ? data[0] : null;
    }
    if (role === 'user') {
        const Query = `SELECT fcmtokens FROM fcm_tokens WHERE ft_u_id = ? LIMIT 1`;
        const data = await query(Query, [receiver_id]);
        return data && data.length ? data[0] : null;

    }

};
