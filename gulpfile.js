var del = require('del');
var gulp = require('gulp');
var concat = require('gulp-concat');
var headerfooter = require('gulp-headerfooter');
var order = require("gulp-order");
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var merge = require('merge-stream');

gulp.task('default', [
	'encapsulate'
]);

gulp.task('clean', function () {
	return del([
		'dist'
	]);
});

gulp.task('build', function () {
	var first = gulp.src(['src/Main.js']);

	var second = gulp.src(['src/**/*', '!src/Main.js'])
			.pipe(concat('second.js'));

	return merge(first, second)
			.pipe(concat('akimbo.js'))
			.pipe(gulp.dest('dist'))
			.pipe(uglify())
			.pipe(rename('akimbo.min.js'))
			.pipe(gulp.dest('dist'));
});

gulp.task('app', ['build'], function () {
	del([
		'tester/src/js'
	]);

	var jquery = gulp.src('bower_components/jquery/dist/jquery.min.js')
			.pipe(gulp.dest('tester/src/js'));

	var app = gulp.src(['tester/src/**/*.js'])
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
	gulp.watch(['src/**/*', 'tester/src/**/*.js'], ['encapsulate']);
});