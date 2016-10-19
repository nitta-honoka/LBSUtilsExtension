
const gulp = require('gulp')
const eslint = require('gulp-eslint')
const babel = require('gulp-babel')
const uglify = require('gulp-uglify')
const concat = require('gulp-concat')

gulp.task('lint', () => {
  return gulp.src('source/*.js')
    .pipe(eslint())
    .pipe(eslint.format())
})

gulp.task('build', () => {
  return gulp.src('source/*.js')
    .pipe(babel({
      presets: ['es2015', 'stage-0']
    }))
    .pipe(concat('index.js'))
    .pipe(gulp.dest('build/'))
    .pipe(uglify())
    .pipe(concat('index.min.js'))
    .pipe(gulp.dest('build/'))
})

gulp.task('default', ['lint', 'build'], () => {})
