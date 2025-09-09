from datasette import hookimpl
from . import routes


@hookimpl
def register_routes():
    return [
        (r"^/-/datasette-write-ui/edit-row-details$", routes.edit_row_details),
        (r"^/-/datasette-write-ui/insert-row-details$", routes.insert_row_details),
    ]

@hookimpl
def extra_template_vars(datasette, database, table):
    async def permission_allowed(actor, permission):
        return await datasette.permission_allowed(actor, permission, (database, table))

    return {"permission_allowed": permission_allowed}


