js:
  ./node_modules/.bin/esbuild \
    --bundle --minify --format=esm \
    datasette_write_ui/table.ts \
    --outfile=datasette_write_ui/static/table.min.js

students:
  rm tests/students.db || true
  sqlite3 tests/students.db < tests/students.sql

dev: students
  DATASETTE_SECRET=abc123 watchexec --restart --clear -e py,ts,html,js,css -- \
    python3 -m datasette --root --plugins-dir=./datasette_write_ui tests/students.db #--setting base_url /abc/
