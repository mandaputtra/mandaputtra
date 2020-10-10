const { src, dest, watch, task } = require("gulp");
const sass = require("gulp-sass");

// function to generate css from sass
function buildSass() {
  return src('./_sass/main.scss')
    .pipe(sass({
      outputStyle: 'compressed'
    }) 
    .on('error', sass.logError))
    .pipe(dest('./css/'));
}

task('build-sass', buildSass)
task('watch-sass', function() {
  watch('./_sass/*.scss', buildSass);
})
