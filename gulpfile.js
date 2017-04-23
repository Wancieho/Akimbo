var del = require('del');
var gulp = require('gulp');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var strip = require('gulp-strip-comments');
var uglify = require('gulp-uglify');
var merge = require('merge-stream');

gulp.task('default', [
	'app'
]);

gulp.task('dist-clean', function () {
	return del([
		'dist'
	]);
});

gulp.task('demo-clean', function () {
	return del([
		'demo/src/js'
	]);
});

gulp.task('akimbo', ['dist-clean'], function () {
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

gulp.task('app', ['demo-clean'], function () {
	var jQuery = gulp.src('bower_components/jquery/dist/jquery.min.js')
			.pipe(gulp.dest('demo/src/js'));

	var jsrender = gulp.src('bower_components/jsrender/jsrender.min.js')
			.pipe(gulp.dest('demo/src/js'));

	var akimbo = gulp.src('dist/akimbo.min.js')
			.pipe(gulp.dest('demo/src/js'));

	return gulp.src(['demo/src/app/**/*.js'])
			.pipe(concat('app.js'))
			.pipe(gulp.dest('demo/src/js'))
			.pipe(uglify({mangle: false}))
			.pipe(rename('app.min.js'))
			.pipe(gulp.dest('demo/src/js'));
});

gulp.task('watch', function () {
	gulp.watch('src/**/*', ['akimbo']);
	gulp.watch('demo/src/app/**/*.js', ['app']);
});