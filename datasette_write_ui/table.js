import { html } from "htl";

const permissions = JSON.parse(
  document.querySelector("script#datasette-write-ui-permissions").textContent
);

function pluginApiEditRowDetails(db, table, primaryKeys) {
  return fetch(
    `/-/datasette-write-ui/edit-row-details?${new URLSearchParams({
      db,
      table,
      primaryKeys,
    })}`
  ).then((response) => response.json());
}
function pluginApiInsertRowDetails(db, table) {
  return fetch(
    `/-/datasette-write-ui/insert-row-details?${new URLSearchParams({
      db,
      table,
    })}`
  ).then((response) => response.json());
}
function datasetteApiDelete(db, table, primaryKeys) {
  return fetch(`/${db}/${table}/${primaryKeys}/-/delete`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  })
    .then(async (response) => {
      const data = await response.json();
      if (response.status < 200 || response.status > 299 || !data.ok) {
        throw Error(data.errors);
      }
      return data;
    })
    .catch((error) => {
      throw error;
    });
}
function datasetteApiUpdate(db, table, primaryKeys, body) {
  return fetch(`/${db}/${table}/${primaryKeys}/-/update`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
    .then(async (response) => {
      const data = await response.json();
      if (response.status < 200 || response.status > 299 || !data.ok) {
        throw Error(data.errors);
      }
      return data;
    })
    .catch((error) => {
      throw error;
    });
}
function datasetteApiInsertRow(db, table, row) {
  return fetch(`/${db}/${table}/-/insert`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ row }),
  })
    .then(async (response) => {
      const data = await response.json();
      if (response.status < 200 || response.status > 299 || !data.ok) {
        throw Error(data.errors);
      }
      return data;
    })
    .catch((error) => {
      throw error;
    });
}

class Modal {
  constructor(root) {
    this.root = html`<div class="modal">
      <div class="modal-content">
        <span class="close">&times;</span>
        <h2 class="modal-title"></h2>
        <div class="modal-body"></div>
      </div>
    </div>`;
    document.body.appendChild(this.root);
    this.body = this.root.querySelector(".modal-body");
    this.title = this.root.querySelector(".modal-title");

    this.hide = this.hide.bind(this);
    this.show = this.show.bind(this);
    this.setTitle = this.setTitle.bind(this);
    this.setBody = this.setBody.bind(this);

    // close modal when the close button is pressed
    this.root.querySelector(".close").addEventListener("click", this.hide);

    // close modal when ESCAPE is pressed
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") this.hide();
    });
  }
  hide() {
    this.root.style.display = "none";
    return this;
  }
  show() {
    this.root.style.display = "block";
    return this;
  }
  setTitle(text) {
    this.title.innerText = text;
    return this;
  }
  setBody(element) {
    this.body.innerHTML = "";
    this.body.appendChild(element);
    return this;
  }
}

class RowIcon {
  constructor(target) {
    this.hide = this.hide.bind(this);
    this.show = this.show.bind(this);
    this.toggle = this.toggle.bind(this);
    this.addButton = this.addButton.bind(this);

    this.root = html`<span class="row-icon">
      <button class="icon">&#9881;</button>
      <div class="menu"></div>
    </span>`;
    target.appendChild(this.root);
    this.icon = this.root.querySelector(".icon");
    this.menu = this.root.querySelector(".menu");

    // when icon is clicked, toggle the menu
    this.icon.addEventListener("click", (event) => {
      event.stopPropagation();
      this.toggle();
    });

    // when clicked elsewhere, hide it
    document.addEventListener("click", this.hide);

    // if escape is pressed, hide
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        this.hide();
      }
    });

    // Prevent bubbling up to to the document and closing the menu
    this.menu.addEventListener("click", (event) => {
      event.stopPropagation();
    });
  }

  hide() {
    this.menu.style.display = "none";
  }
  show() {
    this.menu.style.display = "block";
  }
  toggle() {
    if (this.menu.style.display === "block") this.hide();
    else this.show();
  }
  addButton(label, callback) {
    this.menu.appendChild(html`<button onClick=${callback}>${label}</button>`);
    return this;
  }
}

function inputForField(field) {
  if (field.type === "int" || field.type === "float" || field.type === "INT") {
    return html`<input
      type="number"
      value=${field.value}
      name=${field.key}
      id=${field.key}
      disabled=${!field.editable}
      step=${field.type === "int" ? 1 : 0.01}
    />`;
  }
  if (field.type === "str" || field.type == "TEXT") {
    return html`<textarea
        name=${field.key}
        id=${field.key}
        disabled=${!field.editable}>${field.value}`;
  }
  return html`<p>Unsupported type ${field.type} for ${field.key}</p>`;
}

function inputForEmptyField(field) {
  if (
    field.affinity === "int" ||
    field.affinity === "real" ||
    field.affinity === "numeric"
  ) {
    return html`<input
      type="number"
      name=${field.name}
      id=${field.name}
      step=${field.affinity === "int" ? 1 : 0.01}
    />`;
  }
  if (field.affinity == "text") {
    return html`<textarea
        name=${field.name}
        id=${field.name}>${field.value}`;
  }
  return html`<p>Unsupported type ${field.type} for ${field.name}</p>`;
}

//
function createEditHandler(db, table, primaryKeys) {
  return async function onEdit() {
    const data = await pluginApiEditRowDetails(db, table, primaryKeys);
    const inputFields = new Map();

    function onSubmit(event) {
      event.preventDefault();
      const update = {};
      for (const [key, input] of inputFields.entries()) {
        if (input.disabled) continue;
        const value =
          input.type === "number" ? input.valueAsNumber : input.value;
        console.log(key, input, value);
        update[key] = value;
      }
      const body = {
        update,
        return: true,
      };
      datasetteApiUpdate(db, table, primaryKeys, body).then(() =>
        window.location.reload()
      );
    }
    const form = html` <form onSubmit=${onSubmit}>
      <div>
        <div style="display: grid; grid-template-columns: 200px auto;">
          ${data.fields.map((field) => {
            const input = inputForField(field);
            inputFields.set(field.key, input);
            return html.fragment`
                <div> <label for=${field.key}>${field.key}</label> ${
              field.pk ? "🔑" : ""
            } </div>
                <div> ${input} </div>
                `;
          })}
        </div>
      </div>
      <input type="submit" value="Submit" />
    </form>`;

    modal
      .setBody(form)
      .setTitle(`Editing ${db}/${table}/${primaryKeys}`)
      .show();
  };
}
function createInsertHandler(db, table) {
  return async function onInsert() {
    const { fields } = await pluginApiInsertRowDetails(db, table);
    const inputFields = new Map();

    function onSubmit(event) {
      event.preventDefault();

      const row = {};
      for (const [key, input] of inputFields.entries()) {
        if (input.disabled) continue;
        const value =
          input.type === "number" ? input.valueAsNumber : input.value;
        row[key] = value;
      }
      datasetteApiInsertRow(db, table, row).then(() =>
        window.location.reload()
      );
    }
    const form = html` <form onSubmit=${onSubmit}>
      <div>
        <div style="display: grid; grid-template-columns: 200px auto;">
          ${fields.map((field) => {
            const input = inputForEmptyField(field);
            inputFields.set(field.name, input);
            return html.fragment`
                <div> <label for=${field.name}>${field.name}</label></div>
                <div> ${input} </div>
                `;
          })}
        </div>
      </div>
      <input type="submit" value="Submit" />
    </form>`;

    modal.setBody(form).setTitle(`Inserting into ${db}/${table}`).show();
  };
}

function createDeleteHandler(db, table, primaryKeys) {
  return function onDelete() {
    const result = window.confirm(
      `Are you sure you want to delete ${db}/${table}/${primaryKeys}?`
    );
    if (result) {
      datasetteApiDelete(db, table, primaryKeys).then(() =>
        window.location.reload()
      );
    }
  };
}

const modal = new Modal();
const primaryKeyRows = document.querySelectorAll(
  "table.rows-and-columns td.type-pk"
);

if (permissions.can_update || permissions.can_delete) {
  for (const primaryKeyRow of primaryKeyRows) {
    const href = primaryKeyRow.querySelector("a").getAttribute("href");
    const [_, db, table, primaryKeys] = href.split("/");
    const rowIcon = new RowIcon(primaryKeyRow);

    if (permissions.can_update) {
      const onEdit = createEditHandler(db, table, primaryKeys);
      rowIcon.addButton("Edit", onEdit);
    }
    if (permissions.can_delete) {
      const onDelete = createDeleteHandler(db, table, primaryKeys);
      rowIcon.addButton("Delete", onDelete);
    }
  }
}

if (permissions.can_insert) {
  document
    .querySelector("#datasette-write-ui-insert-button")
    .addEventListener("click", async () => {
      const [_, db, table] = window.location.pathname.split("/");
      createInsertHandler(db, table)();
    });
}
