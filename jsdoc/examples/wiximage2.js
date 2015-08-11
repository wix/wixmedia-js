var BASE_URL = "!your base URL here!";
var image = wixmedia.WixImage(BASE_URL, "!your image ID here!", "!image_name!");
var fit = image.fit().w(1000).h(1000);
console.log(fit.toUrl());