import Client from "./model/client/client.js";
import { IReservation as Reservation } from "./model/reservation/reservation.js";
import { ClientController } from "./controller/client/ClientController.js";
import { ReservationController } from "./controller/reservation/ReservationController.js";

// Instanciamos los controladores
const clientCtrl = new ClientController();
const reservationCtrl = new ReservationController(clientCtrl);

const appContainer = document.getElementById("app-container") as HTMLElement;
const btnViewClients = document.getElementById("btn-view-clients") as HTMLButtonElement;
const btnViewReservations = document.getElementById("btn-view-reservations") as HTMLButtonElement;

// Función AJAX (fetch asíncrono) para cargar las vistas HTML sin recargar la página
async function loadViewWithAjax(url: string, onLoaded: () => void): Promise<void> {
  try {
    const response = await fetch(url);
    const htmlContent = await response.text();
    appContainer.innerHTML = htmlContent;
    onLoaded();
  } catch (error) {
    appContainer.innerHTML = `<p>Error al cargar la vista con AJAX.</p>`;
  }
}

// ---------------- LÓGICA DE LA VISTA DE CLIENTES ----------------
function initClientView(): void {
  const form = document.getElementById("form-client") as HTMLFormElement;
  const msg = document.getElementById("client-msg") as HTMLElement;
  const tbody = document.getElementById("table-clients") as HTMLElement;

  function renderClients(): void {
    const clients = clientCtrl.getAll();
    tbody.innerHTML = clients
      .map(
        (c) => `
      <tr>
        <td>${c.id}</td>
        <td>${c.type_document}</td>
        <td>${c.document}</td>
        <td>${c.name}</td>
        <td>${c.address}</td>
        <td>${c.phone}</td>
        <td>${c.email}</td>
        <td><button class="btn-delete" data-id="${c.id}">Eliminar</button></td>
      </tr>
    `
      )
      .join("");

    // Botones de eliminar cliente
    tbody.querySelectorAll(".btn-delete").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const id = Number((e.target as HTMLElement).getAttribute("data-id"));
        clientCtrl.delete(id);
        renderClients();
      });
    });
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault(); // Evita que la página se recargue

    const typeDoc = (document.getElementById("client-type-doc") as HTMLSelectElement).value;
    const doc = (document.getElementById("client-doc") as HTMLInputElement).value;
    const name = (document.getElementById("client-name") as HTMLInputElement).value;
    const address = (document.getElementById("client-address") as HTMLInputElement).value;
    const phone = (document.getElementById("client-phone") as HTMLInputElement).value;
    const email = (document.getElementById("client-email") as HTMLInputElement).value;

    const newClient = new Client(0, typeDoc, doc, name, address, phone, email);
    const success = clientCtrl.create(newClient);

    msg.textContent = clientCtrl.lastMessage;
    msg.style.color = success ? "#16a34a" : "#dc2626";

    if (success) {
      form.reset();
      renderClients();
    }
  });

  renderClients();
}

// ---------------- LÓGICA DE LA VISTA DE RESERVAS ----------------
function initReservationView(): void {
  const form = document.getElementById("form-reservation") as HTMLFormElement;
  const selectClient = document.getElementById("res-client-id") as HTMLSelectElement;
  const msg = document.getElementById("res-msg") as HTMLElement;
  const tbody = document.getElementById("table-reservations") as HTMLElement;

  // Llenar el selector con los clientes registrados
  const clients = clientCtrl.getAll();
  selectClient.innerHTML =
    `<option value="">Seleccione un cliente...</option>` +
    clients.map((c) => `<option value="${c.id}">${c.id} - ${c.name} (${c.document})</option>`).join("");

  function renderReservations(): void {
    const reservations = reservationCtrl.getAll();
    tbody.innerHTML = reservations
      .map((r) => {
        const client = clientCtrl.getById(r.client_id);
        const clientName = client ? client.name : "Desconocido";
        return `
        <tr>
          <td>${r.id}</td>
          <td>${r.name}</td>
          <td>${r.description}</td>
          <td>${r.client_id}</td>
          <td>${clientName}</td>
          <td><button class="btn-delete" data-id="${r.id}">Eliminar</button></td>
        </tr>
      `;
      })
      .join("");

    tbody.querySelectorAll(".btn-delete").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const id = Number((e.target as HTMLElement).getAttribute("data-id"));
        reservationCtrl.delete(id);
        renderReservations();
      });
    });
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const clientId = Number(selectClient.value);
    const name = (document.getElementById("res-name") as HTMLInputElement).value;
    const description = (document.getElementById("res-description") as HTMLTextAreaElement).value;

    const newRes: Reservation = {
      id: 0,
      name,
      description,
      client_id: clientId,
    };
    const success = reservationCtrl.create(newRes);

    msg.textContent = reservationCtrl.lastMessage;
    msg.style.color = success ? "#16a34a" : "#dc2626";

    if (success) {
      form.reset();
      renderReservations();
    }
  });

  renderReservations();
}

// ---------------- EVENTOS DEL MENÚ PRINCIPAL ----------------
btnViewClients.addEventListener("click", () => {
  btnViewClients.classList.add("active");
  btnViewReservations.classList.remove("active");
  loadViewWithAjax("view/client/client.html", initClientView);
});

btnViewReservations.addEventListener("click", () => {
  btnViewReservations.classList.add("active");
  btnViewClients.classList.remove("active");
  loadViewWithAjax("view/reservation/reservation.html", initReservationView);
});

// Cargar la vista de clientes por defecto al iniciar
loadViewWithAjax("view/client/client.html", initClientView);