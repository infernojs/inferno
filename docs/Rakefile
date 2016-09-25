require('open-uri')

desc "Get assets"
task :download_assets do 
  IO.copy_stream(
    open("https://cdnjs.cloudflare.com/ajax/libs/normalize/4.2.0/normalize.css"),
    "_sass/vendor/_normalize.scss"
  )
end

desc "Serve development site"
task :default => [ :download_assets ] do
  Process.spawn "jekyll s -w -D -t -P 8080 -H localhost --config _config.yml,_config-dev.yml"
  Process.waitall
end

desc "Build development website for testing"
task :build_dev do
  Process.spawn "jekyll build -t -V --config _config.yml,_config-dev.yml"
  Process.waitall
end

desc "Build production website for release"
task :build_prod do
  Process.spawn "jekyll build -t -V"
  Process.waitall
end
