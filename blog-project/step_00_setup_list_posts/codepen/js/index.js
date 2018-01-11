var blog_api_url = 'https://us-central1-duncan-131.cloudfunctions.net/posts';
var posts_list = document.getElementById('articles-list');
var posts_container = posts_list.querySelector('.articles-container');

var loadJsonFromFirebase = function(url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.addEventListener("load", function () {
        callback(JSON.parse(this.response));
    });
    xhr.open("GET", url);
    xhr.send();
};

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
      <a href="#${key}" data-post="${key}">Read Post</a>
    </article>`;
  });
  posts_container.insertBefore(list, posts_container.firstChild);
});
