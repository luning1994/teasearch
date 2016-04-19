// Copyright (c) 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

// The onClicked callback function.

var doubanBookTemplate = "https://api.douban.com/v2/book/search?q=VALUE&count=1";
var doubanMovieTemplate = "https://api.douban.com/v2/movie/search?q=VALUE&count=1";
var doubanSearchTemplate = "https://www.douban.com/search?q=VALUE";
var imdbSearchTemplate = "http://www.imdb.com/find?q=VALUE";
var goodreadsSearch = "https://www.goodreads.com/search?q=VALUE";



function callbackDoubanBook (text){
  var url = _getUrl(doubanBookTemplate,text);
  _getItemUrl(url, "books",emptyResultCallback,_gotoUrl,errorCallback);
}

function callbackDoubanMovie (text){
  var url = _getUrl(doubanMovieTemplate,text);
  _getItemUrl(url, "subjects",emptyResultCallback,_gotoUrl,errorCallback);
}

function callbackDoubanSearch (text){
  var url = _getUrl(doubanSearchTemplate,text);
  _gotoUrl(url);
}

function callbackImdbSearch (text){
  var url = _getUrl(imdbSearchTemplate,text);
  _gotoUrl(url);
}

function callbackGoodreadsSearch (text){
  var url = _getUrl(goodreadsSearch,text);
  _gotoUrl(url);
}

var serviceMapping = [
  {"id":"tsDoubanBook",   "title":"Go to Douban Page (book)",  "callback":callbackDoubanBook},
  {"id":"tsDoubanMovie",  "title":"Go to Douban Page (movie)", "callback":callbackDoubanMovie},
  {"id":"tsDoubanSearch", "title":"Search Douban",             "callback":callbackDoubanSearch},
  {"id":"tsImdbSearch",   "title":"Search IMDB",               "callback":callbackImdbSearch},
  {"id":"tsGoodreadsSearch",   "title":"Search Goodreads",     "callback":callbackGoodreadsSearch}
]

function onClickHandler(info, tab) {
  for (var i=0;i<serviceMapping.length;i++){
    if(serviceMapping[i].id==info.menuItemId){
      //Debugging
      console.log(JSON.stringify(info));
      //Get the callback
      var callback = serviceMapping[i].callback;
      callback(info.selectionText);
    }
  }
  
};

chrome.contextMenus.onClicked.addListener(onClickHandler);

// Set up context menu tree at install time.
chrome.runtime.onInstalled.addListener(function() {
  // Create parent
  chrome.contextMenus.create({
    "title": "Tea Search...","contexts":["selection"], 
    "id": "tsParent"
  });
  // Create children
  for (var i=0;i<serviceMapping.length;i++){
    var title = serviceMapping[i].title;
    var id = serviceMapping[i].id;
    chrome.contextMenus.create({
      "title": title, "contexts":["selection"],
      "id": id, "parentId": "tsParent"
    });
  }

});

function emptyResultCallback(){}
function errorCallback(text){ console.log(text);}

function _gotoUrl (url){
  var win = window.open(url, '_blank');
  win.onload= function(){
    win.focus();
  };
}

function _getUrl(template, text){
  return template.replace("VALUE", text);
}

function _getItemUrl(apiUrl, type, emptyResultCallback, successCallback, errorCallback) {
  var x = new XMLHttpRequest();
  x.open('GET', apiUrl);
  x.responseType = 'json';
  x.onload = function() {
    // Parse and process the response from Google Image Search.
    var response = x.response;
    console.log("in onload"+ JSON.stringify(response));
    if (!response || !response[type]) {
      errorCallback('No response from douban search!');
      console.log("error 1");
      return;
    }
    if (response[type].length === 0) {
      emptyResultCallback();
      console.log("empty");
      return;
    }
    var firstResult = response[type][0];
    var itemUrl = firstResult.alt;
    
    successCallback(itemUrl);
    console.log("success");
  };
  x.onerror = function() {
    errorCallback('Network error.');
  };
  x.send();
}