var wms = require('wixmedia');

var uploader = wms.uploader('APP_KEY', 'SECRET_KEY');
uploader.images().uploadFromFile('test1.jpg').then(function(data) {
	console.log(data.fileId());
});