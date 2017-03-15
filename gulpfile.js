var del = require('del');
var gulp = require('gulp');
var concat = require('gulp-concat');
var headerfooter = require('gulp-headerfooter');
var order = require("gulp-order");
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var merge = require('merge-stream');
var runSequence = require('run-sequence');

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
	return gulp.src(['tester/src/**/*.js'])
			.pipe(concat('app.js'))
			.pipe(gulp.dest('tester'))
			.pipe(uglify())
			.pipe(rename('app.min.js'))
			.pipe(gulp.dest('tester'));
});

gulp.task('combine', ['app'], function () {
	return gulp.src(['dist/akimbo.js', 'tester/app.js'])
			.pipe(order([
				'dist/akimbo.js',
				'tester/app.js'
			]))
			.pipe(concat('combined.min.js'))
			.pipe(uglify())
			.pipe(gulp.dest('tester'));
});

gulp.task('encapsulate', ['combine'], function () {
	return gulp.src('tester/combined.min.js')
			.pipe(headerfooter.header('(function(){\n'))
			.pipe(headerfooter.footer('\n})();'))
			.pipe(gulp.dest('tester'));
});

gulp.task('watch', function () {
	gulp.watch(['src/**/*', 'tester/src/**/*.js'], ['encapsulate']);
});