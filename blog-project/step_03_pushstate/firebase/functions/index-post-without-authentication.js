/**
 * Firebase cloud functions
 *
 * GET  /posts    - view a list of all posts
 * GET  /posts/ID - view a single post
 * POST /posts    - create a new post, include "title" and "message" fields in posted JSON
 *
 * run locally with "firebase serve --only functions"
 * view locally at http://localhost:5000/{PROJECT_NAME}/{PROJECT_REGION}/posts
 */

const cors = require('cors')({origin: true});

// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
const functions = require('firebase-functions');

// The Firebase Admin SDK to access the Firebase Realtime Database.
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);

// The express app used for routing
const app = require('express')();

// List all the posts under the path /posts, and an individual post under /posts/ID
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

// create a new post
app.post('/', functions.https.onRequest((req, res) => {

  // set the content
  let content = req.body.content ? req.body.content.trim() : null;
  if (content === null) {
    res.status(200).send({ "error": "Missing content"});
    return;
  }

  // title can be provided, or extracted from the content
  let title = req.body.title ? req.body.title.trim() : req.body.content.substr(0, 20) + '...';

  // we want the server to set the time on save, so use the firebase timestamp
  let postDate = admin.database.ServerValue.TIMESTAMP;

  let postData = { "title" : title, "content" : content, "created" : postDate };

  // create a new ID with empty values
  let postKey = admin.database().ref('posts').push().key;

  // set() will overwrite all values in the entry, see app.put for update() example
  admin.database().ref('/posts').child(postKey).set(postData, function () {
    // Read the saved data back out
    return admin.database().ref('/posts/' + postKey).once('value').then(function(snapshot) {
      if (snapshot.val() !== null) {
        res.status(200).send(JSON.stringify(snapshot));
      } else {
        res.status(200).send({ "error" : "Unable to save post" });
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
