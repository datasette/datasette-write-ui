js *options:
  ./node_modules/.bin/esbuild \
    --bundle --minify --format=esm \
    datasette_write_ui/table.ts \
    --outfile=datasette_write_ui/static/table.min.js \
    {{options}}

students:
  rm tests/students.db || true
  sqlite3 tests/students.db < tests/students.sql

dev *options: students
  DATASETTE_SECRET=abc123 \
    uv run \
      --with-editable ".[test]" \
      datasette \
        --root \
        tests/students.db \
        {{options}}

watch *options:
  watchexec \
    -e py,ts,html,js,css \
    --restart --clear --stop-signal SIGKILL \
    --ignore '*.db' --ignore '*.db-journal' --ignore '*.db-wal' -- \
      just dev {{options}}