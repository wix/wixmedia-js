var wms = require('wixmedia');

var uploader = wms.uploader('APP_KEY', 'SECRET_KEY');
uploader.video().uploadFromFile('test1.mp4', function(err, success) {
	console.log(err);
	console.log(success.fileId());
});