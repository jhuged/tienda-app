const initialCollections = [
    { id: "COL-001", name: "Mundial 2026", figures: 340, publisher: "Panini", year: 2026, image: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=600&q=80" },
    { id: "COL-002", name: "Thundercats", figures: 180, publisher: "Figuroom", year: 2026, image: "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=600&q=80" },
    { id: "COL-003", name: "Dragon Ball", figures: 240, publisher: "Toei", year: 2025, image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=80" }
];

const initialClients = [];

const sampleProducts = [
    { name: "Álbum Mundial 2026", price: 20 },
    { name: "Sobre de figuritas", price: 5 },
    { name: "Figurita especial", price: 3 },
    { name: "Paquetón colección", price: 45 }
];

if (localStorage.getItem("figuroom-data-version") !== "empty-state-v2") {
    localStorage.removeItem("figuroom-clients");
    localStorage.removeItem("figuroom-sales");
    localStorage.removeItem("figuroom-income");
    localStorage.removeItem("figuroom-cart");
    localStorage.removeItem("figuroom-client-sequence");
    localStorage.setItem("figuroom-data-version", "empty-state-v2");
}

function getStored(key, fallback) {
    try {
        const stored = JSON.parse(localStorage.getItem(key));
        return Array.isArray(stored) ? stored : fallback;
    } catch {
        return fallback;
    }
}

function saveStored(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

function goToCart() {
    window.location.assign(new URL("preparar-carrito.html", window.location.href).href);
}

if (!localStorage.getItem("figuroom-collections")) saveStored("figuroom-collections", initialCollections);
if (!localStorage.getItem("figuroom-clients")) saveStored("figuroom-clients", initialClients);

function getCollections() {
    return getStored("figuroom-collections", initialCollections);
}

function getClients() {
    return getStored("figuroom-clients", initialClients);
}

const inventoryCategories = ["figuritas", "sobres", "albums", "cards", "paquetones", "promociones", "preventa"];

function getInventory(collectionId) {
    const empty = Object.fromEntries(inventoryCategories.map((category) => [category, []]));
    const stored = JSON.parse(localStorage.getItem(`figuroom-inventory-${collectionId}`) || "null");
    return { ...empty, ...(stored || {}) };
}

function saveInventory(collectionId, inventory) {
    localStorage.setItem(`figuroom-inventory-${collectionId}`, JSON.stringify(inventory));
}

const sampleClients = getClients();

function nextClientId() {
    const stored = getClients().length + 1;
    localStorage.setItem("figuroom-client-sequence", String(stored));
    return `CLI-${String(stored).padStart(3, "0")}`;
}

function setupClientForm() {
    const form = document.querySelector("[data-form='client']");
    if (!form) return;
    const idField = form.querySelector("[name='clientId']");
    if (idField) idField.value = nextClientId();
    if (!form.querySelector("[name='image']")) {
        const imageField = document.createElement("div");
        imageField.className = "field full";
        imageField.innerHTML = '<label>Imagen opcional (URL)</label><input name="image" type="url" placeholder="https://...">';
        form.querySelector(".form-grid")?.append(imageField);
    }
    form.addEventListener("submit", (event) => {
        event.preventDefault();
        const data = Object.fromEntries(new FormData(form));
        saveStored("figuroom-clients", [...getClients(), { id: data.clientId, name: data.name, phone: data.phone, address: data.address, type: data.type, image: data.image || "", debt: 0 }]);
        window.location.href = "clientes.html";
    });
}

function setupGenericForm() {
    const form = document.querySelector("[data-form]");
    if (!form || form.dataset.form === "client" || form.dataset.form === "sale") return;
    const params = new URLSearchParams(window.location.search);
    const collectionField = form.querySelector("[name='collectionId']");
    if (collectionField) {
        collectionField.innerHTML = getCollections().map((collection) => `<option value="${collection.id}">${collection.name}</option>`).join("");
        if (params.get("collection")) collectionField.value = params.get("collection");
    }
    const categoryField = form.querySelector("[name='category']");
    if (categoryField && params.get("category")) categoryField.value = params.get("category");
    if (form.dataset.form === "preorder") {
        const clientField = form.querySelector("[name='clientId']");
        getClients().forEach((client) => clientField?.add(new Option(`${client.name} · ${client.id}`, client.id)));
    }
    if (form.dataset.form === "promotion") form.querySelector("[name='stock']")?.closest(".field")?.remove();
    if (form.dataset.form === "income" && !form.querySelector("[name='image']")) {
        const imageField = document.createElement("div");
        imageField.className = "field full";
        imageField.innerHTML = '<label>Imagen opcional (URL)</label><input name="image" type="url" placeholder="https://...">';
        form.querySelector(".form-grid")?.append(imageField);
    }
    if (["collection", "product", "bundle", "promotion"].includes(form.dataset.form) && !form.querySelector("[name='image']")) {
        const imageField = document.createElement("div");
        imageField.className = "field full";
        imageField.innerHTML = '<label>Imagen opcional (URL)</label><input name="image" type="url" placeholder="https://...">';
        form.querySelector(".form-grid")?.append(imageField);
    }
    form.addEventListener("submit", (event) => {
        event.preventDefault();
        const data = Object.fromEntries(new FormData(form));
        if (form.dataset.form === "collection") {
            const collectionId = `COL-${String(getCollections().length + 1).padStart(3, "0")}`;
            saveStored("figuroom-collections", [...getCollections(), { id: collectionId, name: data.name, figures: Number(data.figures), publisher: data.publisher, year: Number(data.year), image: "https://images.unsplash.com/photo-1523398002811-999ca8dec234?auto=format&fit=crop&w=600&q=80" }]);
            saveStored(`figuroom-inventory-${collectionId}`, { figuritas: [], sobres: [], albums: [], cards: [], paquetones: [], promociones: [], preventa: [] });
        } else if (form.dataset.form === "product") {
            const collectionId = data.collectionId || "COL-001";
            const inventory = getInventory(collectionId);
            const category = data.category;
            inventory[category].push({ id: `PRD-${Date.now()}`, name: data.name, number: data.number || "", type: data.type || "", price: Number(data.price || 0), stock: Number(data.stock || 0) });
            saveInventory(collectionId, inventory);
        } else if (form.dataset.form === "bundle") {
            const inventory = getInventory(data.collectionId || "COL-001");
            inventory[data.category].push({ id: `BND-${Date.now()}`, name: `${data.quantity} ${data.category === "sobres" ? "sobres" : "paquetones"}`, quantity: Number(data.quantity), price: Number(data.price || 0), stock: Number(data.stock || 0) });
            saveInventory(data.collectionId || "COL-001", inventory);
        } else if (form.dataset.form === "promotion") {
            const inventory = getInventory(data.collectionId || "COL-001");
            const requestedProducts = data.products.split(",").map((entry) => entry.trim()).filter(Boolean);
            const availableStock = requestedProducts.length ? Math.min(...requestedProducts.map((entry) => {
                const match = entry.match(/(.+?)(?:\s+x\s*(\d+))?$/i);
                const product = inventoryCategories.filter((category) => category !== "promociones").flatMap((category) => inventory[category]).find((item) => item.name.toLowerCase() === match[1].trim().toLowerCase());
                return product ? Math.floor(Number(product.stock || 0) / Number(match[2] || 1)) : 0;
            })) : 0;
            inventory.promociones.push({ id: `PROM-${Date.now()}`, name: data.name, products: data.products, price: Number(data.price || 0), stock: availableStock, image: data.image || "" });
            saveInventory(data.collectionId || "COL-001", inventory);
        } else if (form.dataset.form === "preorder") {
            const collectionId = data.collectionId || "COL-001";
            const inventory = getInventory(collectionId);
            inventory.preventa.push({ id: `PRE-${Date.now()}`, clientId: data.clientId, products: data.products, quantity: Number(data.quantity), deliveryDate: data.deliveryDate || "", image: data.image || "", stock: 0 });
            saveInventory(collectionId, inventory);
        } else if (form.dataset.form === "income") {
            saveStored("figuroom-income", [...getStored("figuroom-income", []), { id: `ING-${Date.now()}`, ...data, amount: Number(data.amount), date: new Date().toLocaleDateString("es-PE") }]);
        } else {
            localStorage.setItem(`figuroom-${form.dataset.form}`, JSON.stringify(data));
        }
        window.location.href = form.dataset.successUrl || "../index.html";
    });
}

function setupSaleForm() {
    const form = document.querySelector("[data-form='sale']");
    if (!form) return;
    const clientSelect = form.querySelector("[name='client']");
    const phone = form.querySelector("[name='phone']");
    const address = form.querySelector("[name='address']");
    const productSearch = form.querySelector("[name='productSearch']");
    const productResults = form.querySelector("[data-product-results]");
    const lines = form.querySelector("[data-sale-lines]");
    const total = form.querySelector("[data-sale-total]");

    getClients().forEach((client) => {
        const option = document.createElement("option");
        option.value = client.id;
        option.textContent = `${client.name} · ${client.id}`;
        option.dataset.phone = client.phone;
        option.dataset.address = client.address;
        clientSelect.appendChild(option);
    });

    clientSelect.addEventListener("change", () => {
        const selected = clientSelect.selectedOptions[0];
        if (clientSelect.value === "new") {
            window.location.href = "nuevo-cliente.html";
            return;
        }
        phone.value = selected?.dataset.phone || "";
        address.value = selected?.dataset.address || "";
    });

    function updateTotal() {
        const amount = [...lines.querySelectorAll("[data-price]")].reduce((sum, input) => sum + Number(input.value || 0), 0);
        total.textContent = `S/ ${amount.toFixed(2)}`;
    }

    function addProduct(product) {
        if (lines.querySelector(`[data-product='${product.name}']`)) return;
        const row = document.createElement("div");
        row.className = "sale-line";
        row.dataset.product = product.name;
        row.innerHTML = `<span>${product.name}</span><input data-price type="number" min="0" step="0.01" value="${product.price}" aria-label="Precio de ${product.name}"><button type="button" class="remove-line" aria-label="Quitar producto">×</button>`;
        row.querySelector("[data-price]").addEventListener("input", updateTotal);
        row.querySelector(".remove-line").addEventListener("click", () => { row.remove(); updateTotal(); });
        lines.appendChild(row);
        updateTotal();
        productSearch.value = "";
        productResults.hidden = true;
    }

    productSearch.addEventListener("input", () => {
        const query = productSearch.value.toLowerCase().trim();
        productResults.innerHTML = "";
        if (!query) { productResults.hidden = true; return; }
        sampleProducts.filter((product) => product.name.toLowerCase().includes(query)).forEach((product) => {
            const option = document.createElement("button");
            option.type = "button";
            option.className = "search-result";
            option.textContent = `${product.name} · S/ ${product.price.toFixed(2)}`;
            option.addEventListener("click", () => addProduct(product));
            productResults.appendChild(option);
        });
        productResults.hidden = productResults.childElementCount === 0;
    });

    form.addEventListener("submit", (event) => {
        event.preventDefault();
            const sale = { id: `VEN-${Date.now()}`, client: clientSelect.value, products: [...lines.children].filter((line) => line.dataset.product).map((line) => ({ name: line.dataset.product, price: Number(line.querySelector("[data-price]").value) })), total: Number(total.textContent.replace("S/ ", "")), date: new Date().toLocaleDateString("es-PE") };
            saveStored("figuroom-sales", [...getStored("figuroom-sales", []), sale]);
        window.location.href = "ventas.html";
    });
}

function renderCollections() {
    const grid = document.querySelector("[data-collections-grid]");
    if (!grid) return;
    grid.innerHTML = getCollections().map((collection) => `<a href="coleccion-dashboard.html?collection=${encodeURIComponent(collection.id)}" class="collection-grid-card"><div class="collection-image" style="background-image:url('${collection.image}')"></div><strong>${collection.name}</strong><small>${collection.publisher} · ${collection.figures} figuritas</small><small>Año: ${collection.year}</small></a>`).join("");
}

function renderHomeCollections() {
    const slider = document.querySelector("[data-home-collections]");
    if (!slider) return;
    slider.innerHTML = getCollections().slice(-4).reverse().map((collection) => `<a href="pages/coleccion-dashboard.html?collection=${encodeURIComponent(collection.id)}" class="home-collection-card"><div class="home-collection-image" style="background-image:url('${collection.image}')"></div><strong>${collection.name}</strong><small>${collection.publisher} · ${collection.figures} figuritas</small></a>`).join("");
}

function renderClients() {
    const list = document.querySelector("[data-clients-list]");
    const clients = getClients();
    if (list) list.innerHTML = clients.length ? clients.map((client) => `<a href="cliente-detalle.html?id=${client.id}" class="client-card"><div class="client-avatar">${client.name.split(" ").map((part) => part[0]).slice(0, 2).join("")}</div><div class="client-info"><strong>${client.name}${Number(client.debt) > 0 ? ` <em class="debt-badge">Debe S/ ${Number(client.debt).toFixed(2)}</em>` : ""}</strong><span>${client.id} · ${client.type}</span><small>${client.phone} · Compras: 0</small></div><span class="client-arrow"><i class="fi fi-rr-angle-right"></i></span></a>`).join("") : '<div class="sales-empty"><i class="fi fi-rr-user"></i><strong>Aún no hay clientes</strong><span>Registra el primer cliente para comenzar.</span></div>';
    document.querySelectorAll("[data-client-count]").forEach((element) => { element.textContent = clients.length; });
}

function renderSales() {
    const list = document.querySelector("[data-sales-list]");
    if (!list) return;
    const sales = getStored("figuroom-sales", []);
    const total = sales.reduce((sum, sale) => sum + Number(sale.total || 0), 0);
    document.querySelectorAll("[data-home-sales-total]").forEach((element) => { element.textContent = `S/ ${total.toFixed(2)}`; });
    if (!sales.length) return;
    const clients = getClients();
    list.innerHTML = sales.slice().reverse().map((sale) => {
        const client = clients.find((item) => item.id === sale.client);
        return `<a href="venta-detalle.html?id=${sale.id}" class="sale-card"><div class="sale-main"><strong>${client?.name || sale.client}</strong><span>${sale.date}</span></div><div class="sale-money"><strong>S/ ${Number(sale.total).toFixed(2)}</strong><span class="sale-due">Venta registrada</span></div><span class="sale-arrow"><i class="fi fi-rr-angle-right"></i></span></a>`;
    }).join("");
    document.querySelectorAll("[data-sales-total]").forEach((element) => { element.textContent = `S/ ${total.toFixed(2)}`; });
    document.querySelectorAll("[data-sales-count]").forEach((element) => { element.textContent = `${sales.length} ventas`; });
}

function renderHomeIncome() {
    const income = getStored("figuroom-income", []);
    const received = income.filter((item) => item.type === "Ingreso").reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const spent = income.filter((item) => item.type === "Gasto").reduce((sum, item) => sum + Number(item.amount || 0), 0);
    document.querySelectorAll("[data-home-income-total]").forEach((element) => { element.textContent = `S/ ${received.toFixed(2)}`; });
    document.querySelectorAll("[data-home-expense-total]").forEach((element) => { element.textContent = `S/ ${spent.toFixed(2)}`; });
}

function renderCollectionDashboard() {
    const cover = document.querySelector(".collection-cover");
    if (!cover) return;
    const id = new URLSearchParams(window.location.search).get("collection");
    const collection = getCollections().find((item) => item.id === id) || getCollections()[0];
    if (!collection) return;
    const title = cover.querySelector("h2");
    const meta = cover.querySelector("span");
    if (title) title.textContent = collection.name;
    if (meta) meta.textContent = `${collection.publisher} · ${collection.year}`;
    cover.style.backgroundImage = `linear-gradient(135deg, rgba(23,23,23,.86), rgba(155,116,34,.8)), url('${collection.image}')`;
    document.querySelectorAll(".category-card").forEach((card) => {
        const url = new URL(card.href, window.location.href);
        card.href = url.href;
        const label = card.querySelector("strong")?.textContent || "";
        const action = document.createElement("button");
        action.type = "button";
        action.className = "category-add-link";
        if (label.includes("Figuritas") || label.includes("Álbumes") || label.includes("Cards")) {
            action.dataset.href = label.includes("Figuritas") ? `nueva-figurita.html?collection=${collection.id}` : label.includes("Álbumes") ? `nuevo-album.html?collection=${collection.id}` : `crear-card.html?collection=${collection.id}`;
            action.textContent = label.includes("Figuritas") ? "Nueva figurita" : label.includes("Álbumes") ? "Nuevo álbum" : "Crear card";
        } else if (label.includes("Sobres") || label.includes("Paquetones")) {
            action.dataset.href = `nueva-presentacion.html?collection=${collection.id}`;
            action.textContent = label.includes("Sobres") ? "Agregar sobre" : "Agregar paquetón";
        } else if (label.includes("Promociones")) {
            action.dataset.href = `nueva-promocion.html?collection=${collection.id}`;
            action.textContent = "Nueva promoción";
        } else if (label.includes("Preventa")) {
            action.dataset.href = `nueva-preventa.html?collection=${collection.id}`;
            action.textContent = "Añadir preventa";
        } else {
            return;
        }
        action.addEventListener("click", (event) => { event.preventDefault(); event.stopPropagation(); window.location.href = action.dataset.href; });
        card.append(action);
    });
}

function renderInventoryPage() {
    const page = window.location.pathname.split("/").pop();
    const categoryByPage = {
        "inventario-figuritas.html": "figuritas",
        "inventario-sobres.html": "sobres",
        "inventario-albums.html": "albums",
        "inventario-cards.html": "cards",
        "inventario-paquetones.html": "paquetones",
        "inventario-promociones.html": "promociones",
        "preventa.html": "preventa"
    };
    const category = categoryByPage[page];
    const grid = document.querySelector(".product-grid, .preorder-list");
    if (!category || !grid) return;
    const collectionId = new URLSearchParams(window.location.search).get("collection") || "COL-001";
    const inventory = JSON.parse(localStorage.getItem(`figuroom-inventory-${collectionId}`) || "{}");
    const products = Array.isArray(inventory[category]) ? inventory[category] : [];
    if (!products.length) {
        grid.innerHTML = '<div class="sales-empty"><i class="fi fi-rr-box-open"></i><strong>Inventario vacío</strong><span>Esta colección aún no tiene productos registrados.</span></div>';
        return;
    }
    if (category === "figuritas") {
        grid.className = "product-grid figure-grid";
        grid.innerHTML = products.map((product) => `<article class="figure-card" data-product="${product.name}"><div class="figure-image" style="background-image:url('https://images.unsplash.com/photo-1523398002811-999ca8dec234?auto=format&fit=crop&w=500&q=80')"><span class="figure-number">${product.number || "-"}</span></div><div class="figure-info"><h3>${product.name}</h3><span>Stock: <strong data-stock>${product.stock || 0}</strong></span><strong class="figure-price">S/ ${Number(product.price || 0).toFixed(2)}</strong><div class="figure-actions"><button type="button" class="edit-stock">Editar</button><button type="button" class="sell-product">Vender</button></div></div></article>`).join("");
        return;
    }
    grid.innerHTML = products.map((product) => `<article class="product-option"><h3>${product.name || "Producto"}</h3><span>${product.type || "Producto"} · Stock: ${product.stock || 0}</span><strong>Venta S/ ${Number(product.price || 0).toFixed(2)}</strong><button class="primary-button inventory-sell" data-product-id="${product.id}">Vender</button></article>`).join("");
}

function setupCartPage() {
    const clientSelect = document.querySelector("#cart-client");
    const cartLines = document.querySelector("#cart-lines");
    const confirm = document.querySelector("#confirm-cart");
    if (!clientSelect || !cartLines || !confirm) return;
    const cart = getStored("figuroom-cart", []);
    getClients().forEach((client) => clientSelect.add(new Option(`${client.name} · ${client.id}`, client.id)));
        cart.forEach((product, index) => { const row = document.createElement("div"); row.className = "sale-line"; row.innerHTML = `<span>${product.name} x${product.quantity || 1}</span><input data-cart-price data-index="${index}" type="number" min="0" step="0.01" value="${Number(product.price || 0).toFixed(2)}" aria-label="Precio de ${product.name}"><strong data-line-total>S/ ${(Number(product.price) * Number(product.quantity || 1)).toFixed(2)}</strong>`; cartLines.append(row); });
        const updateCartTotal = () => { const current = [...cartLines.querySelectorAll("[data-cart-price]")].reduce((sum, input) => sum + Number(input.value || 0) * Number(cart[input.dataset.index].quantity || 1), 0); const totalElement = document.querySelector("#cart-total"); if (totalElement) totalElement.textContent = `S/ ${current.toFixed(2)}`; return current; };
        cartLines.querySelectorAll("[data-cart-price]").forEach((input) => input.addEventListener("input", () => { cart[input.dataset.index].price = Number(input.value || 0); saveStored("figuroom-cart", cart); input.nextElementSibling.textContent = `S/ ${(Number(input.value || 0) * Number(cart[input.dataset.index].quantity || 1)).toFixed(2)}`; updateCartTotal(); }));
    updateCartTotal();
    confirm.addEventListener("click", () => {
        if (!clientSelect.value || !cart.length) return;
        cart.forEach((product) => {
            if (!product.collectionId || !product.category) return;
            const inventory = getInventory(product.collectionId);
            const item = inventory[product.category].find((entry) => entry.id === product.productId || entry.name === product.name);
            if (item) item.stock = Math.max(0, Number(item.stock || 0) - Number(product.quantity || 1));
            saveInventory(product.collectionId, inventory);
        });
        const sales = getStored("figuroom-sales", []);
        const confirmedTotal = cart.reduce((sum, product) => sum + Number(product.price || 0) * Number(product.quantity || 1), 0);
        sales.push({ id: `VEN-${Date.now()}`, client: clientSelect.value, products: cart, total: confirmedTotal, date: new Date().toLocaleDateString("es-PE") });
        saveStored("figuroom-sales", sales);
        localStorage.removeItem("figuroom-cart");
        window.location.href = "ventas.html";
    });
}

function setupFigureCards() {
    const grid = document.querySelector(".figure-grid");
    if (!grid) return;
    const collectionId = new URLSearchParams(window.location.search).get("collection") || "COL-001";
    grid.querySelectorAll(".figure-card").forEach((card) => {
        card.querySelector(".edit-stock")?.addEventListener("click", () => {
            const input = window.prompt("Nuevo stock", card.querySelector("[data-stock]").textContent);
            if (input === null) return;
            card.querySelector("[data-stock]").textContent = input;
            const inventory = getInventory(collectionId);
            const name = card.dataset.product;
            const item = inventory.figuritas.find((entry) => entry.name === name);
            if (item) item.stock = Number(input);
            else inventory.figuritas.push({ id: `FIG-${Date.now()}`, name, price: Number(card.querySelector(".figure-price").textContent.replace("S/ ", "")), stock: Number(input) });
            saveInventory(collectionId, inventory);
        });
        card.querySelector(".sell-product")?.addEventListener("click", () => {
            const cart = getStored("figuroom-cart", []);
            cart.push({ name: card.dataset.product, productId: card.dataset.product, category: "figuritas", collectionId, price: Number(card.querySelector(".figure-price").textContent.replace("S/ ", "")), quantity: 1 });
            saveStored("figuroom-cart", cart);
            goToCart();
        });
    });
}

function setupInventoryProducts() {
    document.querySelectorAll(".inventory-sell").forEach((button) => button.addEventListener("click", () => {
        const card = button.closest(".product-option");
        const collectionId = new URLSearchParams(window.location.search).get("collection") || "COL-001";
        const page = window.location.pathname.split("/").pop();
        const categoryMap = { "inventario-albums.html": "albums", "inventario-cards.html": "cards", "inventario-sobres.html": "sobres", "inventario-paquetones.html": "paquetones", "inventario-promociones.html": "promociones" };
        const category = categoryMap[page];
        const inventory = getInventory(collectionId);
        const product = inventory[category]?.[0];
        const cart = getStored("figuroom-cart", []);
        cart.push({ name: product?.name || card.querySelector("h3")?.textContent || "Producto", productId: product?.id, category, collectionId, price: Number(product?.price || card.querySelector("strong")?.textContent.replace("Venta S/ ", "") || 0), quantity: 1 });
        saveStored("figuroom-cart", cart);
        goToCart();
    }));
}

function renderDashboard() {
    const root = document.querySelector("[data-dashboard]");
    if (!root) return;
    const collections = getCollections();
    const clients = getClients();
    const sales = getStored("figuroom-sales", []);
    const income = getStored("figuroom-income", []);
    const totalSales = sales.reduce((sum, sale) => sum + Number(sale.total || 0), 0);
    const expenses = income.filter((item) => item.type === "Gasto").reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const received = income.filter((item) => item.type === "Ingreso").reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const debt = clients.reduce((sum, client) => sum + Number(client.debt || 0), 0);
    const inventoryCount = collections.reduce((sum, collection) => inventoryCategories.reduce((inner, category) => inner + getInventory(collection.id)[category].length, sum), 0);
    root.querySelectorAll("[data-dashboard-value='collections']").forEach((el) => { el.textContent = collections.length; });
    root.querySelectorAll("[data-dashboard-value='clients']").forEach((el) => { el.textContent = clients.length; });
    root.querySelectorAll("[data-dashboard-value='sales']").forEach((el) => { el.textContent = sales.length; });
    root.querySelectorAll("[data-dashboard-value='income']").forEach((el) => { el.textContent = `S/ ${received.toFixed(2)}`; });
    root.querySelectorAll("[data-dashboard-value='profit']").forEach((el) => { el.textContent = `S/ ${(totalSales - expenses).toFixed(2)}`; });
    root.querySelectorAll("[data-dashboard-value='expenses']").forEach((el) => { el.textContent = `S/ ${expenses.toFixed(2)}`; });
    root.querySelectorAll("[data-dashboard-value='debt']").forEach((el) => { el.textContent = `S/ ${debt.toFixed(2)}`; });
    root.querySelectorAll("[data-dashboard-value='sold']").forEach((el) => { el.textContent = `S/ ${totalSales.toFixed(2)}`; });
    root.querySelectorAll("[data-dashboard-value='stock']").forEach((el) => { el.textContent = inventoryCount; });
}

function renderClientDetail() {
    const profile = document.querySelector(".profile-card");
    if (!profile) return;
    const id = new URLSearchParams(window.location.search).get("id");
    const client = getClients().find((item) => item.id === id);
    if (!client) {
        const main = document.querySelector(".detail-layout");
        if (main) main.innerHTML = '<div class="sales-empty"><i class="fi fi-rr-user"></i><strong>Cliente no encontrado</strong><span>Registra un cliente para consultar su ficha.</span><a class="primary-button" href="nuevo-cliente.html">Nuevo cliente</a></div>';
        return;
    }
    profile.querySelector("h2").textContent = client.name;
    profile.querySelector("small").textContent = `${client.id} · ${client.type}`;
    const values = profile.querySelectorAll(".profile-meta strong");
    values[0].textContent = client.phone;
    values[1].textContent = client.address;
    values[2].textContent = `Cliente ${client.type.toLowerCase()}`;
    const debt = document.querySelector(".debt-card > strong:last-child");
    if (debt) debt.textContent = `S/ ${Number(client.debt || 0).toFixed(2)}`;
}

function renderSaleDetail() {
    const header = document.querySelector(".sale-header");
    if (!header) return;
    const saleId = new URLSearchParams(window.location.search).get("id");
    const sale = getStored("figuroom-sales", []).find((item) => item.id === saleId);
    if (!sale) {
        const main = document.querySelector(".main-content");
        if (main) main.innerHTML = '<div class="sales-empty"><i class="fi fi-rr-receipt"></i><strong>No hay detalle de venta</strong><span>Confirma un pedido desde el carrito para ver sus productos y precios.</span><a class="primary-button" href="preparar-carrito.html">Abrir carrito</a></div>';
    }
}

renderCollections();
renderClientDetail();
renderSaleDetail();
renderHomeCollections();
renderClients();
renderSales();
renderHomeIncome();
renderCollectionDashboard();
renderInventoryPage();
renderDashboard();
setupCartPage();
setupFigureCards();
setupInventoryProducts();

setupClientForm();
setupSaleForm();
setupGenericForm();
