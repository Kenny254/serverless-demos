var blog_api_url = 'https://us-central1-duncan-131.cloudfunctions.net/posts';
var posts_list = document.getElementById('articles-list');
var post_full = document.getElementById('article-whole');
var posts_container = posts_list.querySelector('.articles-container');

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
      let ts = new Date(data.created);
      let div = document.createElement('div');
      div.innerHTML = `
        <h1>${data.title}</h1>
        <time>${ts.toDateString()}</time>
        <div class="article-body">
            <p>${data.content}</p>
        </div>
      `;
      post_full.replaceChild(div, post_full.firstChild);

      // hide the full list
      posts_container.classList.add('start-hidden');
      // show the single post
      post_full.classList.remove('start-hidden');
    });
  }
};

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
