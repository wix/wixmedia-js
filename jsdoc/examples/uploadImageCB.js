var wms = require('wixmedia');

var uploader = wms.uploader('APP_KEY', 'SECRET_KEY');
uploader.images().uploadFromFile('test1.jpg', function(err, success) {
	console.log(err);
	console.log(success.fileId());
});