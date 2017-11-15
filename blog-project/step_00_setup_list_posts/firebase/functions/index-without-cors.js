// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
const functions = require('firebase-functions');

// The Firebase Admin SDK to access the Firebase Realtime Database.
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);

// List all the posts under the path /posts/
exports.posts = functions.https.onRequest((req, res) => {
  return admin.database().ref('/posts').once('value').then(function(snapshot) {
    res.status(200).send(JSON.stringify(snapshot));
  });
});
