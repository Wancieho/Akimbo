var del = require('del');
var gulp = require('gulp');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var merge = require('merge-stream');

gulp.task('default', [
	'clean',
	'akimbo',
	'app'
]);

gulp.task('clean', function () {
	return del([
		'dist'
	]);
});

var akimbo = function () {
	var main = gulp.src(['src/Main.js']);

	var akimbo = gulp.src(['src/**/*', '!src/Main.js'])
			.pipe(concat('dependancies.js'));

	return merge(main, akimbo)
			.pipe(concat('akimbo.min.js'))
			.pipe(rename('akimbo.js'))
			.pipe(gulp.dest('dist'))
			.pipe(uglify())
			.pipe(rename('akimbo.min.js'))
			.pipe(gulp.dest('dist'));
};
gulp.task('akimbo', ['clean'], akimbo);
gulp.task('akimbo-watch', akimbo);

var app = function () {
	return gulp.src(['analysis/src/**/*.js'])
			.pipe(concat('app.min.js'))
			.pipe(uglify())
			.pipe(rename('app.min.js'))
			.pipe(gulp.dest('analysis'));
};
gulp.task('app', app);
gulp.task('app-watch', app);

gulp.task('watch', function () {
	gulp.watch('src/**/*', ['akimbo-watch']);
	gulp.watch('analysis/src/**/*.js', ['app-watch']);
});