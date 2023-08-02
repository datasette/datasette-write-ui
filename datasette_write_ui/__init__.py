from datasette import hookimpl
from datasette.utils.asgi import Response, Forbidden
from starlette.requests import Request
import json

async def edit_post(scope, receive, datasette, request):
  print("post!")
  starlette_request = Request(scope, receive)
  print(starlette_request.query_params)
  formdata = await starlette_request.form()
  for key in formdata.keys():
    if key == 'csrftoken':
        continue
    print(key)

  # https://docs.datasette.io/en/latest/json_api.html#updating-a-row
  update_url =  (datasette.urls.path("/<database>/<table>/<row-pks>/-/update"))
  await datasette.client.post(update_url, data={
    "update": {
       "col": "val",
    }
  })
  return Response.html("yo")

async def edit_get(scope, receive, datasette, request):
  db_name = request.args.get("db")
  table_name = request.args.get("table")
  pks = request.args.getlist("pks")
  print(db_name, table_name, pks)

  db = datasette.get_database(db_name)

  columns = []
  for row in await db.execute("select name, pk, hidden from pragma_table_xinfo(?)", [table_name]):
    name, pk, hidden = row
    columns.append({
      "pk": pk != 0,
      "name": name,
      "editable": pk == 0 and hidden not in [2, 3]
    })##

  fields = []
  select = ", ".join(list(map(lambda column: column.get("name"), columns)))
  where = "rowid = 1"
  results = (await db.execute(f"select {select} from {table_name} where {where}"))

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

  context = {
      "name": "alex 9",
      "db": db_name,
      "table": table_name,
      "pks": json.dumps(pks),
      "fields": fields,
  }
  return Response.html(
      await datasette.render_template("edit.html", context, request=request)
  )

async def edit(scope, receive, datasette, request):
  if request.method == "GET":
    return await edit_get(scope, receive, datasette, request)
  if request.method == "POST":
    return await edit_post(scope, receive, datasette, request)

@hookimpl
def register_routes():
    return [
        (r"^/-/edit$", edit),
    ]
