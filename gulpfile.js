var del = require('del');
var gulp = require('gulp');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var merge = require('merge-stream');

gulp.task('default', [
	'clean',
	'akimbo'
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

	var minified = merge(main, akimbo)
			.pipe(concat('akimbo.min.js'))
			.pipe(uglify())
			.pipe(rename('akimbo.min.js'))
			.pipe(gulp.dest('dist'));

	var unminified = merge(main, akimbo)
			.pipe(concat('akimbo.js'))
			.pipe(rename('akimbo.js'))
			.pipe(gulp.dest('dist'));
};
gulp.task('akimbo', ['clean'], akimbo);
gulp.task('akimbo-watch', akimbo);

gulp.task('watch', function () {
	gulp.watch('src/**/*', ['akimbo-watch']);
});