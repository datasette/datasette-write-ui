// helper function to suss out "real" datasette errors
async function resultOf(response: Response) {
  const data: { ok: boolean; errors?: string[] } = await response.json();
  if (response.status < 200 || response.status > 299 || !data.ok) {
    throw Error(data.errors ? data.errors.join(", ") : "Unknown error");
  }
  return data;
}

// https://docs.datasette.io/en/latest/json_api.html#deleting-a-row
export async function deleteRow(
  db: string,
  table: string,
  primaryKeys: string
) {
  return fetch(`${baseUrl()}/${db}/${table}/${primaryKeys}/-/delete`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  }).then(resultOf);
}

// https://docs.datasette.io/en/latest/json_api.html#updating-a-row
export async function updateRow(
  db: string,
  table: string,
  primaryKeys: string,
  body: {}
) {
  return fetch(`${baseUrl()}/${db}/${table}/${primaryKeys}/-/update`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }).then(resultOf);
}

// https://docs.datasette.io/en/latest/json_api.html#inserting-rows
export async function insertRow(
  db: string,
  table: string,
  row: { [key: string]: any }
) {
  return fetch(`${baseUrl()}/${db}/${table}/-/insert`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ row }),
  }).then(resultOf);
}
