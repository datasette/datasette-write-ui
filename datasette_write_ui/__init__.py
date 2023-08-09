from datasette import hookimpl, Response, Forbidden
from datasette.utils import escape_sqlite
from typing import Any, TypedDict


@hookimpl
def register_routes():
    return [
        (r"^/-/datasette-write-ui/edit-row-details$", edit_row_details),
        (r"^/-/datasette-write-ui/insert-row-details$", insert_row_details),
    ]


@hookimpl
def extra_template_vars(datasette, database, table):
    async def permission_allowed(actor, permission):
        return await datasette.permission_allowed(actor, permission, (database, table))

    return {"permission_allowed": permission_allowed}


def affinity_from_type(type):
    """
    Return the "affinity" a SQLite column type has.

    Rules based on: https://www.sqlite.org/datatype3.html#determination_of_column_affinity

    type - string name of the column type, ex "varchar" or "real" or "text"
    """

    type = type.lower()
    if "int" in type:
        return "int"
    if any([x in type for x in ["char", "clob", "text"]]):
        return "text"
    if "blob" in type or type == "":
        return "blob"
    if any(x in type for x in ["real", "floa", "doub"]):
        return "real"
    return "numeric"


class EditRowDetailsField(TypedDict):
    """
    Each "field" returned for every editable column in the edit-row-details route.
    """

    key: str
    value: Any
    type: str
    pk: bool
    editable: bool


async def edit_row_details(scope, receive, datasette, request):
    db_name = request.args.get("db")
    table_name = request.args.get("table")
    pks = request.args.get("primaryKeys")

    if not await datasette.permission_allowed(
        request.actor, "edit-row", (db_name, table_name)
    ):
        raise Forbidden("edit-row permissions required")

    db = datasette.get_database(db_name)

    columns = []
    for row in await db.execute(
        "select name, pk, hidden from pragma_table_xinfo(?)", [table_name]
    ):
        name, pk, hidden = row
        columns.append(
            {"pk": pk != 0, "name": name, "editable": pk == 0 and hidden not in [2, 3]}
        )  ##

    column_list = ", ".join(
        list(map(lambda column: escape_sqlite(column.get("name")), columns))
    )

    # TODO only works in single primary key tables
    results = await db.execute(
        f"select {column_list} from {table_name} where rowid = ?", [pks]
    )

    fields = []
    row = results.first()
    for column in columns:
        value = row[column["name"]]
        fields.append(
            EditRowDetailsField(
                key=column["name"],
                value=value,
                type=type(value).__name__,
                pk=column["pk"],
                editable=column["editable"],
            )
        )

    return Response.json(
        {
            "fields": fields,
        }
    )


class InsertRowDetailField(TypedDict):
    name: str
    affinity: str


async def insert_row_details(scope, receive, datasette, request):
    """
    Query Parameters:
      db: string
      table: string

    Returns:
      fields: List[InsertRowDetailField]
    """
    db_name = request.args.get("db")
    table_name = request.args.get("table")

    if not await datasette.permission_allowed(
        request.actor, "insert-row", (db_name, table_name)
    ):
        raise Forbidden("insert-row permissions required")

    db = datasette.get_database(db_name)

    insertable_columns = []
    for row in await db.execute(
        "select name, [type] from pragma_table_xinfo(?) where pk == 0 and hidden == 0",
        [table_name],
    ):
        name, type = row
        insertable_columns.append(
            InsertRowDetailField(name=name, affinity=affinity_from_type(type))
        )

    return Response.json(
        {
            "fields": insertable_columns,
        }
    )
