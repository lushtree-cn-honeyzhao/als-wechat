//var gulp = require('gulp');
//var gutil = require('gulp-util');
//var bower = require('bower');
//var concat = require('gulp-concat');
//var sass = require('gulp-sass');
//var minifyCss = require('gulp-minify-css');
//var rename = require('gulp-rename');
//var sh = require('shelljs');

//var paths = {
//  sass: ['./scss/**/*.scss']
//};
//
//gulp.task('default', ['sass']);
//
//gulp.task('sass', function(done) {
//  gulp.src('./scss/ionic.app.scss')
//    .pipe(sass({
//      errLogToConsole: true
//    }))
//    .pipe(gulp.dest('./www/css/'))
//    .pipe(minifyCss({
//      keepSpecialComments: 0
//    }))
//    .pipe(rename({ extname: '.min.css' }))
//    .pipe(gulp.dest('./www/css/'))
//    .on('end', done);
//});
//
//gulp.task('watch', function() {
//  gulp.watch(paths.sass, ['sass']);
//  gulp.watch('./www/modules/**/js/*.js', function(event) {
//    console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
//  })
//
//});
//
//gulp.task('install', ['git-check'], function() {
//  return bower.commands.install()
//    .on('log', function(data) {
//      gutil.log('bower', gutil.colors.cyan(data.id), data.message);
//    });
//});
//
//gulp.task('git-check', function(done) {
//  if (!sh.which('git')) {
//    console.log(
//      '  ' + gutil.colors.red('Git is not installed.'),
//      '\n  Git, the version control system, is required to download Ionic.',
//      '\n  Download git here:', gutil.colors.cyan('http://git-scm.com/downloads') + '.',
//      '\n  Once git is installed, run \'' + gutil.colors.cyan('gulp install') + '\' again.'
//    );
//    process.exit(1);
//  }
//  done();
//}
//);

//gulp.task('sass', function(done) {
//  gulp.src('./scss/ionic.app.scss')
//    .pipe(sass({errLogToConsole: true}))
//    .pipe(gulp.dest('./www/css/'))
//    .pipe(minifycss({keepSpecialComments: 0}))
//    .pipe(rename({ extname: '.min.css' }))
//    .pipe(gulp.dest('./www/css/')).on('end', done);
//});

var gulp = require('gulp');
var ngHtml2Js = require("gulp-ng-html2js");
var minifyHtml = require("gulp-minify-html");
var concat = require("gulp-concat");
var uglify = require("gulp-uglify");

var minifycss = require('gulp-minify-css');
var rename = require('gulp-rename');
var jshint = require('gulp-jshint');

var csso = require('gulp-csso');
var imagemin = require('gulp-imagemin');
var merge = require('merge-stream');
var spritesmith = require('gulp.spritesmith');

var useref = require('gulp-useref');
var gulpif = require('gulp-if');
//var sass = require('gulp-sass');
var htmlreplace = require('gulp-html-replace');
var replace = require('gulp-replace');
var del = require('del');

var now = new Date().getTime()

var version = {
    js: 'v0.0.3.'+now,   //js文件版本
    css: 'v0.0.3.'+now,   //css文件版本
    tep: 'v0.0.3'+now    //模板文件版本
}
var production = false
var distDir = "./dist"
var www = "./www"

//默认任务,开发完成后部署时运行
gulp.task('default', function () {
    production = true
    del([distDir], {force: true}).then(function () {
        console.log('clear')
        gulp.run('deploy')
    })
})

gulp.task('deploy', ['sprite', 'copy', 'templates', 'main'],function () {
    console.log('deploy')
})

gulp.task('cc', function () {
    distDir = "/home/cc/ev-wechat2/www"
    dev = true
    del([distDir], {force: true}).then(function () {
        console.log(distDir+'--->:del')
        gulp.run('deploy')
    });
})

gulp.task('main', function () {
    //方法一
    var assets = useref.assets();
    gulp.src(www + '/index.html')
        //替换模块js代码为js文件
        .pipe(replace('<script>angular.module("partials", [])</script>','<script src="client/js/tep.' + version.tep + '.js"></script>'))
        //正式部署前替去掉socket.io
        .pipe(gulpif(production, replace("<script src='http://cdn.bootcss.com/socket.io/1.3.6/socket.io.min.js'></script>", '')))

        .pipe(replace('{version.js}', 'client/js/bundle.' + version.js + '.js'))
        .pipe(replace('{version.css}', 'client/css/bundle.' + version.css + '.css'))
        .pipe(assets)
        .pipe(gulpif('*.js', gulpif(production, uglify())))
        .pipe(gulpif('*.css', minifycss()))
        .pipe(assets.restore())
        .pipe(useref())
        .pipe(gulp.dest(distDir));

    //方法二
    //gulp.src(www+'/index.html')
    //    .pipe(htmlreplace({
    //        'css':  'css/bundle.'+version.css+'.css',
    //        'js':   'js/bundle.'+version.js+'.js',
    //        'tep':  'tep/tep.'+version.tep+'.js'
    //    }))
    //    .pipe(gulp.dest(distDir));

    ////语法检查
    //gulp.src('./www/js/**/*.js')
    //    .pipe(jshint())
    //    .pipe(jshint.reporter('default'));

    ////压缩css
    //gulp.src(www+'/css/**/*.css')    //需要操作的文件
    //    .pipe(concat('bundle.'+version.css+'.css'))   //rename压缩后的文件名
    //    .pipe(minifycss())   //执行压缩
    //    .pipe(gulp.dest(distDir+'/css'));   //输出文件夹
    //
    //////压缩,合并js
    //gulp.src(www+'/js/**/*.js')      //需要操作的文件
    //    .pipe(concat('bundle.'+version.css+'.js'))    //合并所有js
    //    //.pipe(gulp.dest('js'))       //输出到文件夹
    //    //.pipe(rename({suffix: version.js}))   //rename压缩后的文件名
    //    .pipe(uglify())    //压缩
    //    .pipe(gulp.dest(distDir+'/js'));  //输出
});

gulp.task('templates', function () {
    //模板压缩合并成一个angular模块
    gulp.src(www + "/client/templates/**/**/*.html")
        .pipe(minifyHtml({
            empty: true,
            spare: true,
            quotes: true
        }))
        .pipe(ngHtml2Js({
            moduleName: "partials",
            prefix: "client/templates/"
        }))
        .pipe(concat("tep." + version.tep + ".js"))
        .pipe(uglify())
        .pipe(gulp.dest(distDir + "/client/js/"));
})

gulp.task('copy', function () {

    //复制日志查看
    gulp.src([www + '/log.html'], {base: 'www'}).pipe(gulp.dest(distDir));
    //复制图片
    gulp.src([www + '/img/**/*'], {base: 'www'}).pipe(gulp.dest(distDir));
    //复制字体
    gulp.src(www + '/lib/ionic/fonts/*').pipe(gulp.dest(distDir + '/client/fonts/'));
    //复制雪碧图
    gulp.src(www + '/client/css/*.png').pipe(gulp.dest(distDir + '/client/css/'));

})

//雪碧图,开发之前运行
gulp.task('sprite', function () {
    // Generate our spritesheet
    var spriteData = gulp.src(www + '/img/sprite/**/*.png').pipe(spritesmith({
        imgName: 'sprite.png',
        cssName: 'sprite.css'
    }));

    // Pipe image stream through image optimizer and onto disk
    var imgStream = spriteData.img
        .pipe(imagemin())
        .pipe(gulp.dest(www + '/client/css/'));

    // Pipe CSS stream through CSS optimizer and onto disk
    var cssStream = spriteData.css
        //.pipe(csso())
        .pipe(gulp.dest(www + '/client/css/'));

    // Return a merged stream to handle both `end` events
    return merge(imgStream, cssStream);
});


//var livereload = require('gulp-livereload');
//var http = require('http');
//var st = require('st');
//
//gulp.task('watch', ['server'], function() {
//    livereload.listen({ basePath: www });
//    gulp.watch(www+'/**/*.html',['load']);
//});
//
//gulp.task('load', function() {
//    gulp.src(www+'/**/*').pipe(livereload());
//});
//

