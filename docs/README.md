# Inferno Documentation Website

This website is developed using Jekyll to deploy on Github Pages. 

## Development 

Github provides great [documentation](https://help.github.com/articles/setting-up-your-github-pages-site-locally-with-jekyll/) 
on making sure that you're setup to develop sites locally for github pages. Once you have Ruby installed you can run `bundle install` to install all of the development dependencies.

### Rakefile
We have a custom rakefile that we use for running 
tasks to automate certain processes. A quick overview is:

|Command | Description |
|---|---|
`rake` | Runs a development instance of the server at `http://localhost:8080` which will automatically update based upon file changes. 
`rake build_prod` | Builds a production version of the website with the correct site url (currently `https://infernojs.github.io/docs`). 
`rake build_dev` | Builds a static version of the development instance which can be run from the `_site` directory to test functionality.
`rake download_assets` | Downloads the vendor normalize CSS into the `_sass` folder for use in development. 
