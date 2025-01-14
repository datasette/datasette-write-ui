// @ts-ignore
import { html } from "htl";
import { insertRow, updateRow, deleteRow } from "./write-api";
import {
  EditRowDetailsField,
  InsertRowDetailsField,
  editRowDetails,
  insertRowDetails,
} from "./plugin-api";
import { PERMISSIONS } from "./config";
class Modal {
  root: HTMLElement;
  body: HTMLElement;
  title: HTMLElement;

  constructor() {
    this.root = html`<div class="modal">
      <div class="modal-content">
        <span class="close">&times;</span>
        <h2 class="modal-title"></h2>
        <div class="modal-body"></div>
      </div>
    </div>`;
    document.body.appendChild(this.root);
    this.body = this.root.querySelector(".modal-body") as HTMLElement;
    this.title = this.root.querySelector(".modal-title") as HTMLElement;

    this.hide = this.hide.bind(this);
    this.show = this.show.bind(this);
    this.setTitle = this.setTitle.bind(this);
    this.setBody = this.setBody.bind(this);

    // close modal when the close button is pressed
    (this.root.querySelector(".close") as HTMLElement).addEventListener(
      "click",
      this.hide
    );

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
  setTitle(text: string) {
    this.title.innerText = text;
    return this;
  }
  setBody(element: HTMLElement) {
    this.body.innerHTML = "";
    this.body.appendChild(element);
    return this;
  }
}

class RowIcon {
  root: HTMLElement;
  icon: HTMLElement;
  menu: HTMLElement;

  constructor(target: Element) {
    this.hide = this.hide.bind(this);
    this.show = this.show.bind(this);
    this.toggle = this.toggle.bind(this);
    this.addButton = this.addButton.bind(this);

    this.root = html`<span class="row-icon"><button class="icon">&#9881;</button><div class="datasette-write-ui-menu"></div></span>`;
    target.insertBefore(this.root, target.querySelector("a"));
    this.icon = this.root.querySelector(".icon") as HTMLElement;
    this.menu = this.root.querySelector(".datasette-write-ui-menu") as HTMLElement;

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
    this.menu.isShown = false;
  }
  show() {
    // Close other menus
    Array.from(document.querySelectorAll(".datasette-write-ui-menu")).forEach(
      (menu) => {
        menu.style.display = "none";
        menu.isShown = false;
      }
    );
    const wrapper = document.body;
    this.menu.style.display = "block";
    this.menu.isShown = true;
    absolutelyReparent(this.menu, wrapper);
  }
  toggle() {
    if (this.menu.isShown) {
      this.hide();
    } else {
      this.show();
    }
  }
  addButton(label: string, callback: () => void) {
    this.menu.appendChild(html`<button onClick=${callback}>${label}</button>`);
    return this;
  }
}

function absolutelyReparent(child, parent) {
  // Get the current position of the child element
  const childRect = child.getBoundingClientRect();
  const parentRect = parent.getBoundingClientRect();

  // Calculate the new position of the child relative to the parent
  const newTop = childRect.top - parentRect.top;
  const newLeft = childRect.left - parentRect.left;

  // Set the child to be absolutely positioned within the parent
  child.style.position = 'absolute';
  child.style.top = newTop + 'px';
  child.style.left = newLeft + 'px';

  // Append the child to the parent
  parent.appendChild(child);
}

function inputForField(field: EditRowDetailsField) {
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

function inputForEmptyField(field: InsertRowDetailsField) {
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
        id=${field.name}>`;
  }
  return html`<p>Unsupported type ${field.affinity} for ${field.name}</p>`;
}

//
function createEditHandler(db: string, table: string, primaryKeys: string) {
  return async function onEdit() {
    const data = await editRowDetails(db, table, primaryKeys);
    const inputFields = new Map();

    function onSubmit(event: FormDataEvent) {
      event.preventDefault();
      const update: { [key: string]: any } = {};
      for (const [key, input] of inputFields.entries()) {
        if (input.disabled) continue;
        const value =
          input.type === "number" ? input.valueAsNumber : input.value;
        update[key] = value;
      }
      const body = {
        update,
        return: true,
      };
      updateRow(db, table, primaryKeys, body).then(() =>
        window.location.reload()
      );
    }
    const form = html` <form onSubmit=${onSubmit}>
      <div>
        <div class="form-fields-container">
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
function createInsertHandler(db: string, table: string) {
  return async function onInsert() {
    const { fields } = await insertRowDetails(db, table);
    const inputFields = new Map<string, any>();

    function onSubmit(event: FormDataEvent) {
      event.preventDefault();

      const row: { [key: string]: any } = {};
      for (const [key, input] of inputFields.entries()) {
        if (input.disabled) continue;
        const value =
          input.type === "number" ? input.valueAsNumber : input.value;
        row[key] = value;
      }
      insertRow(db, table, row).then(() => window.location.reload());
    }
    const form = html` <form onSubmit=${onSubmit}>
      <div>
        <div class="form-fields-container">
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

function createDeleteHandler(db: string, table: string, primaryKeys: string) {
  return function onDelete() {
    const result = window.confirm(
      `Are you sure you want to delete ${db}/${table}/${primaryKeys}?`
    );
    if (result) {
      deleteRow(db, table, primaryKeys).then(() => window.location.reload());
    }
  };
}

const modal = new Modal();

if (PERMISSIONS.can_update || PERMISSIONS.can_delete) {
  const tableRows:HTMLTableRowElement[] = Array.from(
    document.querySelectorAll("table.rows-and-columns tbody tr")
  );
  // loop through all tbody rows 
  for (const tableRow of tableRows) {
    const pkCell = tableRow.querySelector('td.type-pk');
    const href = (
      pkCell.querySelector("a") as HTMLAnchorElement
    ).getAttribute("href") as string;
    const [db, table, primaryKeys] = href.split("/").slice(-3);

    
    const rowIcon = new RowIcon(pkCell);
    
    if (PERMISSIONS.can_update) {
      // Add "Edit" button to the row icon
      const onEdit = createEditHandler(db, table, primaryKeys);
      rowIcon.addButton("Edit", onEdit);
      
      // on shift+click, open the edit model for the given row
      tableRow.addEventListener('click', e => {
        if(e.shiftKey) onEdit();
      });
    }
    if (PERMISSIONS.can_delete) {
      // Add "Delete" button to the row icon
      const onDelete = createDeleteHandler(db, table, primaryKeys);
      rowIcon.addButton("Delete", onDelete);
    }
  }
}

if (PERMISSIONS.can_insert) {
  const insertButton = document.querySelector(
    "#datasette-write-ui-insert-button"
  ) as HTMLButtonElement;
  insertButton.addEventListener("click", async () => {
    const [db, table] = window.location.pathname.split("/").slice(-2);
    createInsertHandler(db, table)();
  });
}
