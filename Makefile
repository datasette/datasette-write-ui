tests/students.db: tests/students.sql
	rm $@ || true
	sqlite3 $@ < $<

dev: tests/students.db
	watchexec --signal SIGKILL --restart --clear -e py,html -- \
		python3 -m datasette --root --secret yo --plugins-dir=./datasette_write_ui tests/students.db

.PHONY: dev
