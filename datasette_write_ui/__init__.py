from datasette import hookimpl
from datasette.resources import TableResource
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
        return await datasette.allowed(
            actor=actor,
            action=permission,
            resource=TableResource(database=database, table=table),
        )

    return {"permission_allowed": permission_allowed}
