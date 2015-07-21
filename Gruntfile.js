module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    babel: {
      options: {
        sourceMap: true
      },
      dist: {
        files: {
          'build/bootstrap.js': 'src/bootstrap.js',
          'build/inferno.js': 'src/inferno.js'
        }
      }
    },
    watch: {
      scripts: {
        files: ['**/*.js'],
        options: {
          spawn: true
        },
      },
    },
    browserify: {
      'dist/inferno.js': ['build/bootstrap.js']
    },
    uglify: {
      options: {
        banner: '/*! InfernoJS <%= grunt.template.today("yyyy-mm-dd") %> */ '
      },
      build: {
        src: 'dist/inferno.js',
        dest: 'dist/inferno.min.js'
      }
    },
    'closure-compiler': {
      frontend: {
        closurePath: 'closure',
        js: 'dist/inferno.js',
        jsOutputFile: 'dist/inferno.min.js',
        maxBuffer: 2500,
        options: {
          compilation_level: 'ADVANCED_OPTIMIZATIONS',
          language_in: 'ECMASCRIPT5_STRICT'
        }
      }
    }
  })

  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-babel');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-closure-compiler');

  grunt.registerTask('build', [
    'babel',
    'browserify',
    // 'closure-compiler'
    'uglify'
  ]);

  grunt.registerTask('watch', [
    'watch',
    'babel',
    'browserify'
  ]);
}
