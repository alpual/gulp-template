// Gulpfile

var watchDelay = 100; // delay after watcher sees files but before it starts processing them.


var path = {
    jsFolder: 'js', 
    cssFolder: 'css', 
    sassFolder: 'scss', 
    distFolder: 'dist',
    jsOutput: 'sum-of-all.js', //just the filename.  This file should be in the directory specified in jsFolder
    cssOutput: 'sum-of-all.css', // just the filename.  This file should be in the directory specified in cssFolder
    mainScssFile: 'styles.scss' // the main scss file.  This file should pull in all the partial scss files to generate the custom css code.
}
// These are the files in the js source folder.  The order matters.  
// the current setup assumes jquery is loaded in from a CDN prior to the concatenated js file. 
var jsScripts = [
    path.jsFolder + '/bootstrap.min.js',
    path.jsFolder + '/owl-carousel/owl.carousel.min.js',
    path.jsFolder + '/fancybox/jquery.fancybox.pack.js',
    path.jsFolder + '/easyResponsiveTabs.js',
    path.jsFolder + '/jquery.smartmenus.min.js',
    path.jsFolder + '/jquery.smartmenus.bootstrap.min.js',
    path.jsFolder + '/main.js'

    //path.jsFolder + '/!(' + path.jsOutput + ')*.js', // do not include jsOutput file
    //path.jsFolder + '/**/*.js', // catchall for all js files in path.jsFolder or subfolders
];

/* The Css source files required.  Order matters.
    The styles.scss file generated will be appended to these in the concatenated sum-of-all.css file. */
var cssFiles = [
    path.cssFolder + '/bootstrap.min.css',
    path.cssFolder + '/jquery.smartmenus.bootstrap.css',
    path.cssFolder + '/calendar.css',
    path.cssFolder + '/easy-responsive-tabs.css',
    path.jsFolder + '/owl-carousel/assets/owl.carousel.css',
    path.jsFolder + '/fancybox/jquery.fancybox.css',
    path.cssFolder + '/print.css'
];


var imgFolders = [
    "uploads/images/**/*",
    "images/**/*",
    "css/images/**/*"   
];
var imageTypes = ['.jpg', '.jpeg', '.gif', '.png'];
var cssTimestampFile = "./xyn_system/user/templates/default_site/_variables/var_css_cache_timestamp.html";

/*****************/
/* Start gulping
 */
 
/* These are required additions onto gulp which perform the various tasks we want */
var gulp = require('gulp'), 
    fs = require('fs'),
    gutil = require('gulp-util'),
    sass = require('gulp-sass'),
    uglify = require('gulp-uglify'),
    uglifycss = require ('gulp-uglifycss'),
    concat = require('gulp-concat'),
    sourcemaps = require('gulp-sourcemaps')
    pump = require('pump'),
    rename = require('gulp-rename'),
    merge = require('merge-stream'),
    lec = require('gulp-line-ending-corrector'),
    autoprefixer = require('gulp-autoprefixer'),
    imagemin = require('gulp-imagemin'),
    pngquant = require('imagemin-pngquant'),
    jpegtran = require('imagemin-jpegtran'),
    gifsicle = require('imagemin-gifsicle'),
    imageminZopfli = require('imagemin-zopfli'),
    imageminMozjpeg = require('imagemin-mozjpeg'), 
    imageminGiflossy = require('imagemin-giflossy'),
    lossymin = require('lossy-imagemin'),
    optipng = require('imagemin-optipng');
    

/* Creates a timestamp variable file in the EE variables folder defined above in cssTimestampFile */
/* EE Template uses this as a query sting appended to the sum-of-all.css file to prevent cacheing from 
    confusing our clients*/ 
var cssTimestamp = function(cb){
    var timeStamp = Math.floor(Date.now() / 1000); 
    gutil.log(timeStamp);
    fs.writeFile(cssTimestampFile, timeStamp, cb);
} 
gulp.task('cssTimestamp', cssTimestamp);
   
/* Compiles styles.scss, then concatenates all files in cssFiles together, including the styles.scss output
 * that was just processed.  
 */
var sassConcat = function(){
    var sassStream, cssStream;
    
    cssTimestamp();
    
    sassStream = gulp.src(path.sassFolder + '/' + path.mainScssFile)    // load in the main scss file
        .pipe(lec({eolc: 'LF', encoding:'utf8'}))                       // make sure all line endings are consistent (developing across platforms)
        .pipe(sourcemaps.init())                                        // initialize sourcemaps
        .pipe(sass().on('error', sass.logError))                        // compile the scss.
        .pipe(sourcemaps.write('.').on('error', gutil.log));            // write the sourcemap data to the stream.  Do not write to file yet.
        
    cssStream = gulp.src(cssFiles);                                     // load in the rest of the css files
        
    return merge(cssStream, sassStream)                                 // merge the css file stream with the sass output stream.  Compiled scss comes after the cssFiles
        .pipe(concat(path.cssOutput))                                   // concatenate all data in the stream into one file with the path.cssOutput filename
        .on('error', gutil.log)
        .pipe(lec({eolc: 'LF', encoding:'utf8'}))                       // make sure all line endings are consistent (developing across platforms)
        .pipe(gulp.dest(path.cssFolder));                               // write the compiled and concatenated css to the path.cssFolder location (filename previously defined when concatenating)
};
gulp.task('sassConcat', sassConcat);


/* concatenates all js files listed in jsScripts into one large js file.  Outputs to jsFolder folder
    
   The pump plugin pipes all of the parameters passed in into one another in the order they are given.
   Unlike regular tasks, though, it handles errors more gracefully, so we can actually see from whence the 
   error originates.
   */

var jsConcat = function(callback){
    //gutil.log("Scripts: " + jsScripts);
    pump ([
            gulp.src(jsScripts),
            concat(path.jsOutput),
            gulp.dest(path.jsFolder)
        ],
        callback
    );  
};
gulp.task('jsConcat', jsConcat);


/* Uglifys (minifies) jsOutput file.  This is SLOW.
   Outputs to distFolder
    
   The pump plugin pipes all of the parameters passed in into one another in the order they are given.
   Unlike regular tasks, though, it handles errors more gracefully, so we can actually see from whence the 
   error originates.
   */
   
gulp.task('jsUglify', function(callback){
    pump([
            gulp.src(path.jsOutput),
            uglify(),
            rename({suffix: '.min'}),
            gulp.dest(path.distFolder)
        ],
        callback
    );
});


/* Uglifys (minifies) cssOutput file. 
   Outputs to distFolder
   
   Dependent upon sassConcat task - will not run until that has finished
    
   The pump plugin pipes all of the parameters passed in into one another in the order they are given.
   Unlike regular tasks, though, it handles errors more gracefully, so we can actually see from whence the 
   error originates.
   */
   
gulp.task('cssUglify', ['sassConcat'], function(callback){
    pump([
            gulp.src(path. cssOutput),
            uglifycss({"maxLineLen": 80,
                "uglyComments": true}),
            rename({suffix: '.min'}),
            gulp.dest(path.distFolder)
        ],
        callback
    );
});

/****************************************/
/* Image optimization utility functions */
/****************************************/
var appendSuffix = function (input, suffix) {
    var imgSrc =[];
    for(var i = 0; i < input.length; i++){
        imgSrc.push( input[i] + suffix);
    }

    return imgSrc;
}
var suffixMatrix = function (input, suffixList){
    var theList = [];
    for (var i = 0; i < suffixList.length; i++){
        var withSuffix = appendSuffix(input, suffixList[i]);
        theList = theList.concat(withSuffix);
    }
    return theList;
}

/****************************************/
/* Optimize all images found in imgFolders */
/****************************************/
gulp.task('optimize-images', function () {
    var theSrc = suffixMatrix(imgFolders, imageTypes);
    gutil.log(theSrc);
    return gulp.src(imgFolders)
        .pipe(imagemin({
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            //optimizationLevel: 3,
            verbose: true,
            use: [pngquant(), jpegtran(), optipng(), gifsicle()]
        }))
        .pipe(gulp.dest('dist'));
});


gulp.task('lossy-images', function () {
    var theSrc = suffixMatrix(imgFolders, imageTypes);
    gutil.log(theSrc);
    return gulp.src(theSrc)
        .pipe(imagemin([
            //png
            pngquant({
                speed: 1,
                quality: 98 //lossy settings
            }),
            imageminZopfli({
                more: true
            }),
            //gif
            // imagemin.gifsicle({
            //     interlaced: true,
            //     optimizationLevel: 3
            // }),
            //gif very light lossy, use only one of gifsicle or Giflossy
            imageminGiflossy({
                optimizationLevel: 3,
                optimize: 3, //keep-empty: Preserve empty transparent frames
                lossy: 2
            }),
            //svg
            imagemin.svgo({
                plugins: [{
                    removeViewBox: false
                }]
            }),
            //jpg lossless
            imagemin.jpegtran({
                progressive: true
            }),
            //jpg very light lossy, use vs jpegtran
            imageminMozjpeg({
                quality: 85
            })
        ]))
        .pipe(gulp.dest('dist'));
});

gulp.task('lossymin', function(){
    var theSrc = suffixMatrix(imgFolders, imageTypes);
    gutil.log(theSrc);

    lossymin(theSrc,'dist', 
             { jpgQuality: '70', cache: false },
             function(err) {}
    )
});

/* Watches for changes to scss or js files.  Compiles, concatenates files.  
    Note: delay is necessary for some IDEs, which save stragely behind the scenes to try to prevent data loss.  This can 
    result in bizarre behavior, where it will compile blank files instead of the real thing, or will trigger watch twice.
*/
var smartwatcher = function(theTask, timer) {
    return gulp.watch(
        path.sassFolder + "/**/*.scss", // what to watch - all scss files
        // Callback triggered whatever the event type is (added / changed / deleted)
        function(event) { // .path | .type
            // If the timer was assigned a timeout id few time ago..
            // Prevent last postpone task to be run
            if(timer){
                clearTimeout(timer);
            }
            // Postpone the task
            timer = setTimeout(
                function(){
                    theTask();
                    timer=0;
                }, watchDelay
            );
        });
};
gulp.task ('watch', function(){
    var timer, timer2, // delay is necessary to prevent some editors from *^@*#! things up by saving temporary files or clearing the file before writing.
    cssWatcher = smartwatcher(sassConcat, timer);
    
    var jsWatcher = smartwatcher(jsConcat, timer2);

    gutil.log("/!\\ Watching job "+ Array(25).join('~'));
});

gulp.task('uglify', ['cssUglify', 'jsUglify']);

gulp.task('dist', ['jsConcat', 'sassConcat', 'uglify']);

gulp.task('default', ['jsConcat', 'sassConcat', 'watch']);