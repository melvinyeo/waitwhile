module.exports = function(grunt) {

  require('time-grunt')(grunt);

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    concurrent: {
      target1: ['concat'],
      target2: ['htmlmin', 'imagemin', 'copy', 'ngAnnotate', 'autoprefixer'],
      target3: ['uglify', 'processhtml', 'cssmin'],
      target4: ['clean'],
      // target5: ['shell']
    },
    concat: {
      js: {
        src: ['src/lib/angular/angular.min.js',
              'src/lib/**/*.js', 
              'src/app.js', 
              'src/modules/login/login.js', 
              'src/modules/**/*.js',
              '!src/lib/libphonenumber/libphonenumber.js',
              '!src/lib/underscore/underscore-min.js'],
          dest: 'build/<%= pkg.name %>.js'
        },
        async: {
          src: ['src/lib/libphonenumber/libphonenumber.js',
          'src/lib/underscore/underscore-min.js'],
          dest: 'build/<%= pkg.name %>.async.js'
        },
        css: {
         src: ['src/assets/css/bootstrap.min.css', 'src/assets/css/*.css'],
         dest: 'build/<%= pkg.name %>.css'
       }
     },
     uncss: {
      dist: {
          src: ['src/index.html', 'src/modules/**/*.html'],
          dest: 'build/<%= pkg.name %>.css',
          options: {
            htmlroot: 'src',
            ignore: ['.ui-notification', 
                      '.ui-notification.success',
                      '.ui-notification.killed',
                      '.ui-notification>.message',
                      '.ui-notification.error',
                      '.ui-notification>h3',
                      '.message',
                      '.glyphicon-list-alt',
                      '.glyphicon-th',
                      '.glyphicon-dashboard',
                      '.glyphicon-log-out',
                      '.pagination',
                      '.pagination>li',
                      '.pagination>li>a',
                      '.pagination>li>span',
                      '.pagination>.active>a',
                      '.pagination>.active>span',
                      '.pagination>.disabled>a',
                      '.pagination>.disabled>span',
                      '.pagination-control',
                      '.ng-isolate-scope'],
            report: 'min'
            // compress: true
          }
        }
     },
    ngAnnotate: {
      options: {
        // remove: true,
        // add: true,
        // singleQuotes: true
      },
      app: {
        js: {
          'build/<%= pkg.name %>.js': ['build/<%= pkg.name %>.js']
        },
        async: {
          'build/<%= pkg.name %>.async.js': ['build/<%= pkg.name %>.async.js']
        }
      }
    },
    htmlmin: {
     dist: {
      options: {                                 
        removeComments: true,
        collapseWhitespace: true
      },
      files: [{
       expand: true,
       cwd: 'src/modules',
       src: '**/*.html',
       dest: 'build/modules'
     }]
    }
    },
   imagemin: {
     dist: {
      options: {                    
       optimizationLevel: 5
      },
       files: [{
        expand: true,
        cwd: 'src/assets/img/',
        src: ['**/*.{png,jpg,gif}'],
        dest: 'build/assets/img/'
      }]
    }
  },
    autoprefixer: {
      single_file: {
        options: {
            // Target-specific options go here. 
          },
          src: 'build/<%= pkg.name %>.css',
          dest: 'build/<%= pkg.name %>.autoprefix.css'
        }
     },
     copy: {
      map: {
        files: [{
          expand: true,
          cwd: 'src/',
          src: ['**/*.map'],
          dest: 'build/'
        }]
      },
      fonts: {
         files: [{
          expand: true,
          cwd: 'src/assets/fonts/',
          src: ['**/*.{woff,woff2,eot,ttf}'],
          dest: 'build/assets/fonts/'
        }]
      },
      sitemap: {
        src: 'src/sitemap.xml',
        dest: 'build/sitemap.xml'
      }   
    },
    uglify: {
      options: {
        mangle: true
      },
      js: {
        src: 'build/<%= pkg.name %>.js',
        dest: 'build/<%= pkg.name %>.min.js'
      },
      async: {
        src: 'build/<%= pkg.name %>.async.js',
        dest: 'build/<%= pkg.name %>.async.min.js'
      }
    },
    cssmin: {
      css:{
        src: 'build/<%= pkg.name %>.autoprefix.css',
        dest: 'build/assets/css/<%= pkg.name %>.min.css'
      }
    },
    clean: {
     js: {
       src: [ 'build/<%= pkg.name %>.js', 'build/<%= pkg.name %>.async.js','build/vendor.js']
     },
     css: {
       src: [ 'build/<%= pkg.name %>.css', 'build/<%= pkg.name %>.autoprefix.css']
     },
    },
    processhtml: {
        options: {
          data: {
            // message: 'Hello world!'
          }
        },
        dist: {
          files: {
            'build/index.html': ['src/index.html']
          }
        }
    },
    pagespeed: {
       options: {
         nokey: true,
         url: "https://waitwhile.com"
       },
       desktop: {
         options: {
           url: "https://waitwhile.com",
           locale: "en_US",
           strategy: "desktop",
           threshold: 80
         }
       },
       mobile: {
         options: {
           url: "https://waitwhile.com",
           locale: "en_US",
           strategy: "mobile",
           threshold: 70
         }
       }
     },
     shell: {
       options: {
         stderr: false
       },
       target: {
         command: 'firebase deploy -m "grunt deployed"'
       }
     }
       // watch: {
       //     options: {
       //       livereload: true,
       //     },
       //     css: {
       //       files: ['src/*.css']
       //     },
       //   },
       // exec: {
       //    firebase: 'firebase deploy'
       // }
     });

grunt.loadNpmTasks('grunt-concurrent');
grunt.loadNpmTasks('grunt-contrib-concat');
grunt.loadNpmTasks('grunt-contrib-htmlmin');
grunt.loadNpmTasks('grunt-contrib-uglify');
grunt.loadNpmTasks('grunt-contrib-imagemin');
grunt.loadNpmTasks('grunt-autoprefixer');
grunt.loadNpmTasks('grunt-contrib-cssmin');
grunt.loadNpmTasks('grunt-contrib-clean');
grunt.loadNpmTasks('grunt-ng-annotate');
grunt.loadNpmTasks('grunt-contrib-copy');
grunt.loadNpmTasks('grunt-pagespeed');
grunt.loadNpmTasks('grunt-processhtml');
grunt.loadNpmTasks('grunt-uncss');
grunt.loadNpmTasks('grunt-shell');
  // grunt.loadNpmTasks('grunt-exec');
  // grunt.loadNpmTasks('grunt-contrib-watch');
  // grunt.loadNpmTasks('grunt-contrib-jshint');


  // task setup 
  grunt.registerTask('default', ['concurrent:target1', 'concurrent:target2', 'concurrent:target3', 'concurrent:target4']);
};