wixmedia-js SDK
===================

Wix Media Services are a collection of tools and APIs that enable storing, serving, uploading, managing, manipulating and transcoding image, audio and video files.

This package is an isomorphic JavaScript library (works in Node and in the browser) that provides a convenient API to access Wix Media Services image manipulation APIs.

## Prerequisites
To begin working with Wix Media Services:

- [Create a Google Computer Engine application](link) or use an existing app. 
- [Create a Wix Media Services account](link)


## Installation
### Using npm ###
    $ npm install wixmedia-js
### Using bower ###
    $ bower install wixmedia-js


## Wix Media Services API ##

Wix Media Services provides web developers a versatile infrastructure for media file manipulations easily accessible through its RESTful API. 

For more information about the RESTful API, please see the [Wix Media Services developer center](link)

## Usage ##

### Node ###
````js
var BASE_URL = "<your base URL here>";
var WixImage = require('wixmedia').WixImage;
var image = new WixImage(BASE_URL, "<your image ID here>");
image.srz().w(1000).h(1000).name("cats.jpg");
//prints out the new URL for an image that has width of 1000px and height of 1000px
console.log(image.toUrl());

````
### Browser, no AMD ###
````js
var BASE_URL = "<your base URL here>";
var image = WixMedia.WixImage(BASE_URL, "<your image ID here>");
image.srz().w(1000).h(1000).name("cats.jpg");
//prints out the new URL for an image that has width of 1000px and height of 1000px
console.log(image.toUrl());
````

### Browser, using require.js ###
````js
require(['WixMedia'], function(WixMedia) {
    var BASE_URL = "<your base URL here>";
    var image = WixMedia.WixImage(BASE_URL, "<your image ID here>");
    image.srz().w(1000).h(1000).name("cats.jpg");
    //prints out the new URL for an image that has width of 1000px and height of 1000px
    console.log(image.toUrl());
});

````
