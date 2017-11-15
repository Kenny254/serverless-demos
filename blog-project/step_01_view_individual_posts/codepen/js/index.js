var blog_api_url = 'https://us-central1-annie-131.cloudfunctions.net/posts';
var codepen_url = '//' + location.host + location.pathname;  // this is the frame when editing, and the page when done
var posts_list = document.getElementById('posts-list');
var post_full = document.getElementById('post-full');
var posts_container = posts_list.querySelector('.posts-container');

//
// various vanilla functions
// 
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
  posts_list.classList.remove('start-hidden');
}

// handle selecting the links in the list
const showPostClick = (e) => {
  let post_id = e.target.dataset.post;
  
  if (post_id) {
    // load the post from ajax call
    loadJsonFromFirebase(blog_api_url + '/' + post_id, function(data) {
      let div = document.createElement('div');
      div.classList = 'mdl-cell mdl-cell--12-col mdl-cell--6-col-tablet mdl-cell--4-col-desktop';
      // TODO: put into a theming function
      div.innerHTML = '<h4>' + data.title + '</h4>' + 
        '<div>' + data.content + '</div>' + 
        '<div>' + data.author  + '</div>' +
        '<div>' + data.created + '</div>';

      var post = document.getElementById('post-container');
      post.replaceChild(div, post.firstChild);

      // TODO: consider putting these into a toggle function, since we do the opposite in showListClick
      // hide the full list
      posts_list.classList.add('start-hidden');
      // show the single post
      post_full.classList.remove('start-hidden');
    });
  }
};

//
// the page-specific code
// 
document.getElementById('post-view-all').addEventListener('click', showListClick);
posts_list.addEventListener('click', showPostClick);

let post_id = getQueryParam('postid');

loadJsonFromFirebase(blog_api_url + (post_id ? '/' + post_id : ''), function(data) {
  // TODO: extract to theme function and handle initial single post load
  let div = document.createElement('div');
  Object.keys(data).forEach(function(key) {
    // TODO: assume later than IE11, using template literals
    div.innerHTML += `<p>
      <h4><a data-post="${key}">${data[key].title}</a></h4>
      <div>${data[key].content.substr(0, 150)}...</div> 
      <div>${data[key].author}</div>
      <div>${data[key].created}</div>
    </p>`;
  });
  posts_container.insertBefore(div, posts_container.firstChild);
});