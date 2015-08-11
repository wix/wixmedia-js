wixmedia-js SDK
===================

Wix Media Platform is a collection of services for storing, serving, uploading, and managing image, audio, and video files.

This package is an isomorphic JavaScript library (works in Node and in the browser) that provides a convenient API to access Wix Media Platform image manipulation APIs.

## Prerequisites
To begin working with Wix Media Platform:

- [Get started with Wix Media Platform](http://mediacloud.wix.com/dashboard/index.html)


## Installation
### Using npm ###
    $ npm install wixmedia
### Using bower ###
    $ bower install wixmedia


## Usage ##

### Image Manipulation ###
#### Node.js
````javascript
var BASE_URL = "<your base URL here>";
var WixImage = require('wixmedia').WixImage;
var image = WixImage(BASE_URL, "<your image ID here>", "<image_name>");
var fit = image.fit().w(1000).h(1000);
//prints out the new URL for an image that has width of 1000px and height of 1000px
console.log(fit.toUrl());

````

#### Browser, no AMD
````js
var BASE_URL = "<your base URL here>";
var image = wixmedia.WixImage(BASE_URL, "<your image ID here>", "<image_name>");
var fit = image.fit().w(1000).h(1000);
//prints out the new URL for an image that has width of 1000px and height of 1000px
console.log(fit.toUrl());
````

#### Browser, using require.js
````js
require(['WixMedia'], function(WixMedia) {
    var BASE_URL = "<your base URL here>";
    var image = wixmedia.WixImage(BASE_URL, "<your image ID here>", "<image_name>");
    var fit = image.fit().w(1000).h(1000);
    //prints out the new URL for an image that has width of 1000px and height of 1000px
    console.log(fit.toUrl());
});
````

###Image Uploading, Node only

####Node.js with Callbacks
```js
var API_KEY = "<API KEY>";
var API_SECRET = "<SECRET_KEY>";
var wixmedia = require("wixmedia");

var uploader = wixmedia.uploader(API_KEY, API_SECRET);
uploader.images.uploadFromFile("files/images/wixLogo.jpg", function(data) {
  console.log("New image created:" + data.imageId);
}, function(error) {
  console.log(error);
});

```

####Node.js with Promises
```js
var API_KEY = "<API KEY>";
var API_SECRET = "<SECRET_KEY>";
var wixmedia = require("wixmedia");

var uploader = wixmedia.uploader(API_KEY, API_SECRET);
uploader.images.uploadFromFile("files/images/wixLogo.jpg").then(function(data) {
  console.log("New image created:" + data.imageId);
}, function(error) {
  console.log(error);
});

```

## Read the docs ##
[Read the API docs](http://wix.github.io/wixmedia-js/) to learn more about this library

## Wix Media Platform ##
Wix Media Platform provides powerful image-processing services that support resizing, cropping, rotating, sharpening, watermarking, and face-detection, as well as offer a number of filters and adjustments.

Learn more about image manipulation here: [Wix Media Platform - Images](http://mediacloud.wix.com/docs/images.html).
