@js:
  ./node_modules/.bin/esbuild \
    --bundle --minify --format=esm \
    datasette_write_ui/table.js \
    --outfile=datasette_write_ui/static/table.min.js
