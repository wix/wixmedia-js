function getContainLayout(imageWidth, imageHeight, boxWidth, boxHeight){
	var layout = { x:0, y:0 };
	var imageRatio = imageWidth / imageHeight;
	var boxRatio = boxWidth / boxHeight;
	if(imageRatio < boxRatio){
		layout.w = boxHeight * imageRatio;
		layout.h = boxHeight;
		layout.x = Math.round(boxWidth/2 - layout.w/2);
	} else {
		layout.w = boxWidth;
		layout.h = boxWidth / imageRatio;
		layout.y = Math.round(boxHeight/2 - layout.h/2);
	}
	return layout;
}
function getCoverLayout(imageWidth, imageHeight, boxWidth, boxHeight){
	var layout = { x:0, y:0 };
	var imageRatio = imageWidth / imageHeight;
	var boxRatio = boxWidth / boxHeight;
	if(imageRatio < boxRatio){
		layout.w = boxWidth;
		layout.h = Math.round(boxWidth / imageRatio);
		layout.y = Math.round(boxHeight/2 - layout.h/2);
	} else {
		layout.w = Math.round(boxHeight * imageRatio);
		layout.h = boxHeight;
		layout.x = Math.round(boxWidth/2 - layout.w/2);
	}
	return layout;
}

module.exports = {
	getContainLayout: getContainLayout,
	getCoverLayout: getCoverLayout
};

