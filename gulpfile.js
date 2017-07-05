var gulp = require('gulp');
var bsmain = require('browser-sync').create('bsmain')
  , plumber = require('gulp-plumber')
  , nodemon = require('gulp-nodemon')
  , bsapi = require('browser-sync').create('bsapi')
  , DEV_PORT = 3020
  , MAIN_PORT = 3020
  , API_PORT = 3020;

/*文件路径配置*/
var fpath = {
  src: ''
};

gulp.task('js', function () {
  return gulp.src('js/**/*.js')
    .pipe(plumber())
    .pipe(gulp.dest(fpath.dest +'/js'))
    .pipe(bsmain.stream());
});


gulp.task('js-watch', ['js'], function() {
  bsmain.reload();
});

/*文件改动监听*/
gulp.task('watch',  function() {
  gulp.watch(fpath.src + 'routers/*.js',['js-watch']);
  gulp.watch(fpath.src + 'hs/*.js',['js-watch']);
  gulp.watch(fpath.src + 'js/*.js', ['js-watch']);
  gulp.watch(fpath.src + '/app.js', ['js-watch']);
});




gulp.task('nodemon', function(cb) {
  var called = false;
  return nodemon({
      // nodemon our expressjs server
      script: 'app.js',
      // watch core se1rver file( s) that require server restart on change
      watch: ['hs/', 'app.js', 'routers/*'],
      ext: 'js',
      // exec: 'node-debug',
      env: {
        'PORT':DEV_PORT,
        'MAINPORT': MAIN_PORT,
        'APIPORT': API_PORT
      }
    })
    .on('start', function onStart() {
      // ensure start only got called once
      if (!called) {
        cb();
      }
      called = true;
    })
    .on('restart', function onRestart() {
      // reload connected browsers after a slight delay
      setTimeout(function reload() {
        bsmain.reload({
          stream: false
        });
      }, 500);
    });
});

/**
 * browser-sync配置
 */
function initBrowsersyncMain() {
  bsmain.init({
    port: MAIN_PORT,
    proxy: 'localhost:' + DEV_PORT,
    browser: ['google-chrome']
  });
}

function initBrowsersyncApi() {
  var API_SERVER = require('./conf/config').server;
  bsapi.init({
    ui: false,
    port: API_PORT,
    proxy: {
      target: API_SERVER,
      proxyRes: [
        function(res) {
          res.headers["Access-Control-Allow-Origin"] = '*';
        }
      ]
    },
    browser: ['google-chrome']
  }, initBrowsersyncMain);
}

gulp.task('browser-sync',['nodemon'], initBrowsersyncApi);


// /*任务执行*/
// gulp.task('output', ['js'], function() {
//   gulp.start('watch');
// });


/*启动*/
gulp.task('default', function() {
  gulp.start('watch');
  gulp.start('nodemon');
  
});