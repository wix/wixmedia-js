var wixdocs = require('wixdocs-static');

wixdocs({
    dir: __dirname,
    theme : 'odin',
    jsdoc : {
        conf : __dirname + '/jsdoc.conf.json',
        filtering : false
    },
	lessTarget : __dirname + '/jsdoc/stylesheet/main.less',
	sourcePath : __dirname + "/jsdoc/content",
    distPath : "jsdoc/wixdocs",
	logoPath : "images/wixmp.png",
	logoText : "JavaScript API",
	searchText : "Search API",
    siteTitle: "WixMP JavaScript API",
    slidingMenus : false,
    clean : true,
    headingLevel : 2,
    navLevel : 3,
    debug: true,
	themeOptions: {
		logoTitle : 'MP Documentation',
		jumboTitle : 'Wix Media Platform',
		jumboSubTitle: 'The Smartest Way to Host and Deliver Your Media Worldwide'
	}
});