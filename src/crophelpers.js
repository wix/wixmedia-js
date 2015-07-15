/**
 * Takes image and box dimensions, and return the result layout
 * that the image should be in order to be contained and centered
 * inside the box.
 *
 * @param {number} imageWidth original image width
 * @param {number} imageHeight original image height
 * @param {number} boxWidth box width to fit image into
 * @param {number} boxHeight box height to fit image into
 * @returns {{x:number, y:number, w:number, h:number }}
 */
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
/**
 * Takes image and box dimensions, and return the result layout
 * that the image should be in order to cover (center) the box.
 *
 * @param {number} imageWidth original image width
 * @param {number} imageHeight original image height
 * @param {number} boxWidth box width that the image should cover
 * @param {number} boxHeight box height that the image should cover
 * @returns {{x:number, y:number, w:number, h:number }}
 */
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

