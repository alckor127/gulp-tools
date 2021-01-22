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
const build_root = "./build";
const dist_root = "./dist";
const paths = {
  src: {
    sass: src_root + "/scss/*.scss",
    js: src_root + "/js/**",
  },
  build: {
    clean: build_root + "/",
    css: build_root + "/css",
    js: build_root + "/js",
  },
  dist: {
    clean: dist_root + "/",
  },
};

// --------------------------
// TASK FUNCTIONS
// --------------------------

const tasks = {
  clean: () => {
    return gulp
      .src([paths.build.clean, paths.dist.clean], {
        read: false,
        allowEmpty: true,
      })
      .pipe(rimraf());
  },
  sass: () => {
    return gulp
      .src(paths.src.sass)
      .pipe(gulpif(!production, sourcemaps.init()))
      .pipe(sass({ sourceComments: !production, outputStyle: production ? "compressed" : "nested" }))
      .on("error", handleError("SASS"))
      .pipe(minifycss())
      .pipe(gulpif(!production, sourcemaps.write({ includeContent: false, sourceRoot: "." })))
      .pipe(
        gulpif(
          !production,
          sourcemaps.init({
            loadMaps: true,
          })
        )
      )
      .pipe(sourcemaps.write({ includeContent: true }))
      .pipe(rename("bundle.css"))
      .pipe(gulp.dest(paths.build.css));
  },
  js: () => {
    return gulp.src([paths.src.js]).pipe(concat("bundle.js")).pipe(uglify()).pipe(gulp.dest(paths.build.js));
  },
  distCopy: () => {
    return gulp
      .src([build_root + "/**/*.*", "!" + build_root + "/*.js"], { base: build_root })
      .pipe(gulp.dest(dist_root));
  },
  watch: () => {
    gulp.watch(src_root + "/scss/**/*.scss", gulp.series("sass"));
    gulp.watch(src_root + "/js/**/*.js", gulp.series("js"));
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

gulp.task("dist", gulp.series("build", tasks.distCopy));

gulp.task("default", gulp.series("watch"));
