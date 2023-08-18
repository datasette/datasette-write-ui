import { BASE_URL } from "./config";

export interface EditRowDetailsField {
  key: string;
  value: any;
  type: string;
  pk: boolean;
  editable: boolean;
}
export interface EditRowDetailsResponse {
  fields: EditRowDetailsField[];
}
export async function editRowDetails(
  db: string,
  table: string,
  primaryKeys: string
): Promise<EditRowDetailsResponse> {
  return fetch(
    `${BASE_URL}/-/datasette-write-ui/edit-row-details?${new URLSearchParams({
      db,
      table,
      primaryKeys,
    })}`
  ).then((response) => response.json());
}

export interface InsertRowDetailsField {
  name: string;
  affinity: string;
}
export interface InsertRowDetailsResponse {
  fields: InsertRowDetailsField[];
}
export async function insertRowDetails(
  db: string,
  table: string
): Promise<InsertRowDetailsResponse> {
  return fetch(
    `${BASE_URL}/-/datasette-write-ui/insert-row-details?${new URLSearchParams({
      db,
      table,
    })}`
  ).then((response) => response.json());
}
