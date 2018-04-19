var gulp = require("gulp");
// var exec = require("child_process").exec()
var nodemon = require("gulp-nodemon")

gulp.task('default', ["server"])

gulp.task('server', function (cb) {
    nodemon({
        "watch": ["routes", "modules", "app.js", "views"],
        "exec": "node app.js"
    })
})