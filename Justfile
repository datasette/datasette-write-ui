@js:
  ./node_modules/.bin/esbuild \
    --bundle --minify --format=esm \
    datasette_write_ui/table.ts \
    --outfile=datasette_write_ui/static/table.min.js
