from datasette import hookimpl
from datasette.utils.asgi import Response, Forbidden
from starlette.requests import Request
import json

@hookimpl
def extra_template_vars(datasette, database, table):
    async def permission_allowed(actor, permission):
        return await datasette.permission_allowed(actor, permission, (database, table))

    return {"permission_allowed": permission_allowed}

async def edit_row_details(scope, receive, datasette, request):
    db_name = request.args.get("db")
    table_name = request.args.get("table")
    pks = request.args.get("primaryKeys")

    if not await datasette.permission_allowed(request.actor, 'edit-row', (db_name, table_name)):
        return Response.json("{}", status=403)


    db = datasette.get_database(db_name)

    columns = []
    for row in await db.execute("select name, pk, hidden from pragma_table_xinfo(?)", [table_name]):
        name, pk, hidden = row
        columns.append({
          "pk": pk != 0,
          "name": name,
          "editable": pk == 0 and hidden not in [2, 3]
        })##

    column_list = ", ".join(list(map(lambda column: column.get("name"), columns)))

    # TODO only works in single primary key tables
    results = (await db.execute(f"select {column_list} from {table_name} where rowid = ?", [pks[0]]))

    fields = []
    row = results.first()
    for column in columns:
        value = row[column["name"]]
        print("field:", value, type(value))
        fields.append({
          "key": column["name"],
          "value": value,
          "type": type(value).__name__,
          "pk": column["pk"],
          "editable": column["editable"],
        })

    return Response.json({
          "db": db_name,
          "table": table_name,
          "pks": pks,
          "fields": fields,
      })

async def insert_row_details(scope, receive, datasette, request):
    print(request.actor)
    db_name = request.args.get("db")
    table_name = request.args.get("table")

    if not await datasette.permission_allowed(request.actor, 'insert-row', (db_name, table_name)):
        return Response.json("{}", status=403)

    db = datasette.get_database(db_name)

    insertable_columns = []
    for row in await db.execute("select name, [type] from pragma_table_xinfo(?) where pk == 0 and hidden == 0", [table_name]):
        name, type_ = row
        insertable_columns.append({
          "name": name,
          "type": type_
        })

    return Response.json({
          "fields": insertable_columns,
      })

@hookimpl
def register_routes():
    return [
        (r"^/-/edit-row-details$", edit_row_details),
        (r"^/-/insert-row-details$", insert_row_details),
    ]
