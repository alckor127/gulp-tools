const gulp = require("gulp");
const minifycss = require("gulp-clean-css");
const concat = require("gulp-concat");
const gulpif = require("gulp-if");
const notify = require("gulp-notify");
const rename = require("gulp-rename");
const rimraf = require("gulp-rimraf");
const sass = require("gulp-sass");
const sourcemaps = require("gulp-sourcemaps");
const uglify = require("gulp-uglify");
const gutil = require("gulp-util");
const argv = require("yargs").argv;
const babel = require("gulp-babel");

// --------------------------
// CMD ARGUMENTS
// gulp build --prod
// --------------------------

const production = !!argv.prod;

// ----------------------------
// ERROR NOTIFICATION
// ----------------------------

var handleError = (task) => {
  return (err) => {
    notify.onError({
      message: task + " failed, check the logs..",
      sound: false,
    })(err);
    gutil.log(gutil.colors.bgRed(task + " error:"), gutil.colors.red(err));
  };
};

// --------------------------
// PATHS AND GLOBS
// --------------------------

const src_root = "./src";
const dist_root = "./dist";
const paths = {
  src: {
    sass: src_root + "/scss/*.scss",
    sassRecurse: src_root + "/scss/**/*.scss",
    js: src_root + "/js/**",
    jsRecurse: src_root + "/js/**/*.js",
  },
  dist: {
    clean: dist_root + "/",
    css: dist_root + "/css",
    js: dist_root + "/js",
  },
};

// --------------------------
// TASK FUNCTIONS
// --------------------------

const tasks = {
  clean: () => {
    return gulp
      .src(paths.dist.clean, {
        read: false,
        allowEmpty: true,
      })
      .pipe(rimraf());
  },
  sass: () => {
    return gulp
      .src(paths.src.sass)
      .pipe(gulpif(production, sourcemaps.init()))
      .pipe(sass({ sourceComments: !production, outputStyle: production ? "compressed" : "nested" }))
      .on("error", handleError("SASS"))
      .pipe(gulpif(production, minifycss()))
      .pipe(rename("bundle.css"))
      .pipe(gulpif(production, sourcemaps.write(".")))
      .pipe(gulp.dest(paths.dist.css));
  },
  js: () => {
    return gulp
      .src([paths.src.js])
      .pipe(gulpif(production, sourcemaps.init()))
      .pipe(babel({ presets: ["@babel/env"] }))
      .pipe(concat("bundle.js"))
      .pipe(gulpif(production, uglify()))
      .pipe(gulpif(production, sourcemaps.write(".")))
      .pipe(gulp.dest(paths.dist.js));
  },
  watch: () => {
    gulp.watch(paths.src.sassRecurse, gulp.series("sass"));
    gulp.watch(paths.src.jsRecurse, gulp.series("js"));
  },
};

// --------------------------
// TASK DEFINITIONS
// --------------------------

gulp.task("clean", tasks.clean);
gulp.task("sass", tasks.sass);
gulp.task("js", tasks.js);

// build chain builds all to ./build
gulp.task("build", gulp.series("sass", "js"));

gulp.task("watch", tasks.watch);

gulp.task("default", gulp.series("watch"));
