async function resultOf(response) {
  const data = await response.json();
  if (response.status < 200 || response.status > 299 || !data.ok) {
    throw Error(data.errors);
  }
  return data;
}

export function deleteRow(db: string, table: string, primaryKeys: string) {
  return fetch(`/${db}/${table}/${primaryKeys}/-/delete`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  }).then(resultOf);
}
export async function updateRow(
  db: string,
  table: string,
  primaryKeys: string,
  body: {}
) {
  return fetch(`/${db}/${table}/${primaryKeys}/-/update`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }).then(resultOf);
}
export async function insertRow(
  db: string,
  table: string,
  row: { [key: string]: any }
) {
  return fetch(`/${db}/${table}/-/insert`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ row }),
  }).then(resultOf);
}
