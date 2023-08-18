const permissionsElement = document.querySelector(
  "script#datasette-write-ui-config"
) as HTMLScriptElement;

const config = JSON.parse(permissionsElement.textContent as string);

export const PERMISSIONS = config as {
  can_insert: boolean;
  can_delete: boolean;
  can_update: boolean;
};

export const BASE_URL = config.base_url as string;
