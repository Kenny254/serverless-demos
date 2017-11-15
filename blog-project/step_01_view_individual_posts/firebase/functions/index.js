const cors = require('cors')({origin: true});

// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
const functions = require('firebase-functions');

// The Firebase Admin SDK to access the Firebase Realtime Database.
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);

// The express app used for routing
const app = require('express')();

// List all the posts under the path /posts
app.get(['/', '/:id'], functions.https.onRequest((req, res) => {

  const postid = req.params.id;
  let reference = 'posts';
  reference += postid ? '/' + postid : '';

  cors(req, res, () => {
    return admin.database().ref(reference).once('value').then(function(snapshot) {
      if (snapshot.val() !== null) {
        res.status(200).send(JSON.stringify(snapshot));
      } else {
        res.status(200).send({});
      }
    });
  });
}));

// This works for posts/ and posts/101, but not for /posts
// exports.posts = functions.https.onRequest(app);
// @see https://gist.github.com/cdock1029/9f3a58f352663ea90f8b9675412c4aea

exports.posts = functions.https.onRequest((req, res) => {
  // Handle routing of /posts without a trailing /,
  if (!req.path) {
    // prepending "/" keeps query params, path params intact
    req.url = `/${req.url}`;
  }
  return app(req, res);
});
