const path = require("path");
const resolve = package =>
  path.join(__dirname, "../../packages", package, "src");

module.exports = function(config) {
  config.set({
    basePath: "../../",

    frameworks: ["detectBrowsers", "jasmine", "jasmine-matchers"],

    detectBrowsers: {
      postDetection(browserList) {
        const results = browserList.indexOf("PhantomJS") &&
          browserList.length === 1
          ? ["PhantomJS"]
          : [];

        if (browserList.indexOf("Chrome") > -1) {
          results.push("Chrome");
        }

        if (browserList.indexOf("Firefox") > -1) {
          results.push("Firefox");
        }

        return results;
      }
    },

    files: [
      require.resolve("es5-shim"),
      require.resolve("es6-shim"),
      require.resolve("babel-polyfill/dist/polyfill"),
      "./scripts/test/jasmine-polyfill.js",
      "./scripts/test/globals.js",
      "./packages/*/__tests__/*",
      "./packages/*/__tests__/**/*"
    ],

    preprocessors: {
      "./packages/*/__tests__/**/*": ["webpack", "sourcemap"],
      "./packages/*/__tests__/*": ["webpack", "sourcemap"]
    },

    reporters: [process.env.CI ? "failed" : "progress"],

    browserConsoleLogOptions: {
      level: "warn",
      terminal: false
    },
    colors: true,
    singleRun: true,
    autoWatch: false,
    concurrency: 1,

    webpackMiddleware: {
      stats: "errors-only",
      noInfo: true
    },
    webpack: {
      devtool: "inline-source-map",
      module: {
        rules: [
          {
            test: /\.jsx?$/,
            loader: "babel-loader",
            exclude: /node_modules/
          },
          {
            test: /\.jsx?$/,
            loader: "babel-loader",
            include: /lodash/
          },
          {
            test: /\.tsx?$/,
            loader: "ts-loader",
            options: {
              compilerOptions: {
                target: "es5",
                module: "commonjs"
              }
            }
          }
        ]
      },
      resolve: {
        alias: {
          inferno: resolve("inferno"),
          "inferno-compat": resolve("inferno-compat"),
          "inferno-component": resolve("inferno-component"),
          "inferno-create-class": resolve("inferno-create-class"),
          "inferno-create-element": resolve("inferno-create-element"),
          "inferno-devtools": resolve("inferno-devtools"),
          "inferno-hyperscript": resolve("inferno-hyperscript"),
          "inferno-mobx": resolve("inferno-mobx"),
          "inferno-redux": resolve("inferno-redux"),
          "inferno-router": resolve("inferno-router"),
          "inferno-server": resolve("inferno-server"),
          "inferno-shared": resolve("inferno-shared"),
          "inferno-test-utils": resolve("inferno-test-utils"),
          "inferno-utils": resolve("inferno-utils"),
          "inferno-vnode-flags": resolve("inferno-vnode-flags")
        },
        extensions: [".js", ".jsx", ".ts", ".tsx"],
        mainFields: ["inferno:main", "module", "main"]
      },
      devServer: {
        noInfo: true
      },
      stats: "errors-only",
      performance: {
        hints: false
      }
    }
  });
};
