var blog_api_url = 'https://us-central1-annie-131.cloudfunctions.net/posts';
var posts_list = document.getElementById('posts-list');
var posts_container = posts_list.querySelector('.posts-container');

var loadJsonFromFirebase = function(url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.addEventListener("load", function () {
        callback(JSON.parse(this.response));
    });
    xhr.open("GET", url);
    xhr.send();
};

loadJsonFromFirebase(blog_api_url, function(data) {
  let div = document.createElement('div');
  Object.keys(data).forEach(function(key) {
    div.innerHTML += '<h4>' + data[key].title + '</h4>' + 
      '<div>' + data[key].content.substr(0, 150) + '...</div>' + 
      '<div>' + data[key].author + '</div>' +
      '<div>' + data[key].created + '</div>';
  });
  posts_container.insertBefore(div, posts_container.firstChild);
});