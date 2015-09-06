var wms = require('wixmedia');

var uploader = wms.uploader('APP_KEY', 'SECRET_KEY');
uploader.video().uploadFromFile('test1.mp4').then(function(data) {
	console.log(data.fileId());
});