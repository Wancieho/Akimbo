var del = require('del');
var gulp = require('gulp');
var concat = require('gulp-concat');
var headerfooter = require('gulp-headerfooter');
var order = require("gulp-order");
var rename = require('gulp-rename');
var strip = require('gulp-strip-comments');
var uglify = require('gulp-uglify');
var merge = require('merge-stream');

gulp.task('default', [
	'dist-clean',
	'implement-clean',
	'encapsulate'
]);

gulp.task('dist-clean', function () {
	return del([
		'dist'
	]);
});

gulp.task('implement-clean', function () {
	return del([
		'implement/src/js'
	]);
});

gulp.task('build', function () {
	var main = gulp.src(['src/Main.js']);

	var others = gulp.src(['src/**/*', '!src/Main.js'])
			.pipe(concat('second.js'));

	return merge(main, others)
			.pipe(concat('akimbo.js'))
			.pipe(strip())
			.pipe(gulp.dest('dist'))
			.pipe(uglify({mangle: false}))
			.pipe(rename('akimbo.min.js'))
			.pipe(gulp.dest('dist'));
});

gulp.task('app', ['build'], function () {
	var jQuery = gulp.src('bower_components/jquery/dist/jquery.min.js')
			.pipe(gulp.dest('implement/src/js'));

	var jsrender = gulp.src('bower_components/jsrender/jsrender.min.js')
			.pipe(gulp.dest('implement/src/js'));

	return gulp.src(['implement/src/app/**/*.js'])
			.pipe(concat('app.js'))
			.pipe(gulp.dest('implement/src/js'))
			.pipe(uglify({mangle: false}))
			.pipe(rename('app.min.js'))
			.pipe(gulp.dest('implement/src/js'));
});

gulp.task('combine', ['app'], function () {
	return gulp.src(['dist/akimbo.js', 'implement/src/js/app.js'])
			.pipe(order([
				'dist/akimbo.js',
				'implement/src/js/app.js'
			]))
			.pipe(concat('combined.min.js'))
			.pipe(uglify({mangle: false}))
			.pipe(gulp.dest('implement/src/js'));
});

gulp.task('encapsulate', ['combine'], function () {
	return gulp.src('implement/src/js/combined.min.js')
			.pipe(headerfooter.header('(function(){\n'))
			.pipe(headerfooter.footer('\n})();'))
			.pipe(gulp.dest('implement/src/js'));
});

gulp.task('watch', function () {
	gulp.watch(['src/**/*', 'implement/src/app/**/*.js'], ['encapsulate']);
});