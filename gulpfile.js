var del = require('del');
var gulp = require('gulp');
var concat = require('gulp-concat');
var headerfooter = require('gulp-headerfooter');
var order = require("gulp-order");
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var merge = require('merge-stream');

gulp.task('default', [
	'dist-clean',
	'tester-clean',
	'encapsulate'
]);

gulp.task('dist-clean', function () {
	return del([
		'dist'
	]);
});

gulp.task('tester-clean', function () {
	return del([
		'tester/src/js'
	]);
});

gulp.task('build', function () {
	var main = gulp.src(['src/Main.js']);

	var others = gulp.src(['src/**/*', '!src/Main.js'])
			.pipe(concat('second.js'));

	return merge(main, others)
			.pipe(concat('akimbo.js'))
			.pipe(gulp.dest('dist'))
			.pipe(uglify())
			.pipe(rename('akimbo.min.js'))
			.pipe(gulp.dest('dist'));
});

gulp.task('app', ['build'], function () {
	var jquery = gulp.src('bower_components/jquery/dist/jquery.min.js')
			.pipe(gulp.dest('tester/src/js'));

	var json = gulp.src('bower_components/JSON-js/json2.js')
			.pipe(uglify())
			.pipe(rename('json.min.js'))
			.pipe(gulp.dest('tester/src/js'));

	return gulp.src(['tester/src/app/**/*.js'])
			.pipe(concat('app.js'))
			.pipe(gulp.dest('tester/src/js'))
			.pipe(uglify())
			.pipe(rename('app.min.js'))
			.pipe(gulp.dest('tester/src/js'));
});

gulp.task('combine', ['app'], function () {
	return gulp.src(['dist/akimbo.js', 'tester/src/js/app.js'])
			.pipe(order([
				'dist/akimbo.js',
				'tester/src/js/app.js'
			]))
			.pipe(concat('combined.min.js'))
			.pipe(uglify())
			.pipe(gulp.dest('tester/src/js'));
});

gulp.task('encapsulate', ['combine'], function () {
	return gulp.src('tester/src/js/combined.min.js')
			.pipe(headerfooter.header('(function(){\n'))
			.pipe(headerfooter.footer('\n})();'))
			.pipe(gulp.dest('tester/src/js'));
});

gulp.task('watch', function () {
	gulp.watch(['src/**/*', 'tester/src/app/**/*.js'], ['encapsulate']);
});