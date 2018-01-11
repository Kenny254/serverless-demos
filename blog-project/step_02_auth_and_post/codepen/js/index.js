var blog_api_url = 'https://us-central1-duncan-131.cloudfunctions.net/posts';
var posts_list = document.getElementById('articles-list');
var post_full = document.getElementById('article-whole');
var posts_container = posts_list.querySelector('.articles-container');

// track authenticated user to avoid triggering on refresh
var currentUID;

var loadJsonFromFirebase = function(url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.addEventListener("load", function () {
        callback(JSON.parse(this.response));
    });
    xhr.open("GET", url);
    xhr.send();
};

var getQueryParam = function(param) {
  let params = window.location.search.substr(1);
  params = params.split("&");
  let paramList = {};
  for (let i = 0; i < params.length; i++) {
    let tmp = params[i].split("=");
    paramList[tmp[0]] = decodeURI(tmp[1]);
  }
  return paramList[param];
}


// hide the individual post and show the list of posts
const showListClick = (e) => {
  // hide the single post
  post_full.classList.add('start-hidden');
  // show the full list
  posts_container.classList.remove('start-hidden');
}


// handle selecting the links in the list
const showPostClick = (e) => {
  let post_id = e.target.dataset.post;

  if (post_id) {
    // load the post from ajax call
    loadJsonFromFirebase(blog_api_url + '/' + post_id, function(data) {
      let div = document.createElement('div');
      let ts = new Date(data.created);
      div.innerHTML = `<article class="article-block">
            <h2>${data.title}</h2>
            <time>${ts.toDateString()}</time>
            <div class="excerpt">
              <p>${data.content}</p>
            </div>
          </article>`;
      post_full.replaceChild(div, post_full.firstChild);

      // hide the full list
      posts_container.classList.add('start-hidden');
      // show the single post
      post_full.classList.remove('start-hidden');
    });
  }
};

// toggle buttons on sign in/out auth changes
const onLogInOutChange = function(user) {

  // Ignore token refresh events
  if (user && currentUID === user.uid) {
    return;
  }

  // If logged in, show the new post button
  if (user) {
    currentUID = user.uid;
    document.getElementById('sign-in-button').style.display = 'none';
    document.getElementById('new-post-button').style.display = 'block';
  } else {
    currentUID = null;
    document.getElementById('sign-in-button').style.display = 'block';
    document.getElementById('new-post-button').style.display = 'none';
  }
}

//document.getElementById('post-view-all').addEventListener('click', showListClick);
posts_list.addEventListener('click', showPostClick);

loadJsonFromFirebase(blog_api_url, function(data) {
  let list = document.createElement('div');
  Object.keys(data).forEach(function(key) {
    let ts = new Date(data[key].created);
    list.innerHTML += `<article class="article-block">
      <h2>${data[key].title}</h2>
      <time>${ts.toDateString()}</time>
      <div class="excerpt">
        <p>${data[key].content.substr(0, 150)}...</p>
      </div>
      <a data-post="${key}">Read Post</a>
    </article>`;
  });
  posts_container.insertBefore(list, posts_container.firstChild);
});

// Bindings on load.
document.addEventListener('DOMContentLoaded', function() {

  document.getElementById('sign-in-button').addEventListener('click', function() {
    var provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithPopup(provider);
  });

  // Listen for auth state changes
  firebase.auth().onAuthStateChanged(onLogInOutChange);

  // show the new post form
  document.getElementById('new-post-button').addEventListener('click', function() {
    document.getElementById('new-post').style.display = '';
  });

  // Saves message on form submit.
  let messageForm = document.getElementById('message-form');
  messageForm.onsubmit = function(e) {

    e.preventDefault();
    let postTitle = document.getElementById('new-post-title');
    let postContent = document.getElementById('new-post-content');
    let title = postTitle.value;
    let content = postContent.value;

    if (content) {
      firebase.auth().currentUser.getIdToken(/* forceRefresh */ true).then(function (idToken) {
        var xhr = new XMLHttpRequest();
        xhr.addEventListener("load", function () {
          // on success, display the post at the top of the list & hide the form
          postTitle.value = '';
          postContent.value = '';
          document.getElementById('new-post').style.display = 'none';

          let postDetails = JSON.parse(this.response);
          let div = document.createElement('div');
          let ts = new Date(postDetails.created);
          div.innerHTML += `<article class="article-block">
            <h2>${postDetails.title}</h2>
            <time>${ts.toDateString()}</time>
            <div class="excerpt">
              <p>${postDetails.content}</p>
            </div>
          </article>`;
          posts_container.insertBefore(div, posts_container.firstChild);
        });
        xhr.open("POST", blog_api_url);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.send(JSON.stringify({"title": title, "content": content, "token": idToken}));
      }).catch(function (error) {
        // TODO: handle error, not authorized
      });
    } else {
      // TODO: display box around the missing content field
    }
  }

});
