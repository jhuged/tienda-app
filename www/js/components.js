const currentPath = window.location.pathname.toLowerCase();
const isPagesPath = currentPath.includes("/pages/");
const rootPath = isPagesPath ? "../" : "";
const pageName = currentPath.split("/").pop() || "index.html";
const sectionByPage = {
    "venta-detalle.html": "ventas.html",
    "nueva-venta.html": "ventas.html",
    "cliente-detalle.html": "clientes.html",
    "cliente-ventas.html": "clientes.html",
    "nuevo-cliente.html": "clientes.html",
    "coleccion-dashboard.html": "colecciones.html",
    "inventario.html": "colecciones.html",
    "inventario-figuritas.html": "colecciones.html",
    "inventario-sobres.html": "colecciones.html",
    "inventario-albums.html": "colecciones.html",
    "inventario-cards.html": "colecciones.html",
    "inventario-paquetones.html": "colecciones.html",
    "inventario-promociones.html": "colecciones.html",
    "preventa.html": "colecciones.html",
    "nueva-coleccion.html": "colecciones.html"
};
const activePage = sectionByPage[pageName] || pageName;

const topbar = document.getElementById("topbar");

if (topbar) {
    const title = topbar.dataset.title || "Figuroom";
    const subtitle = topbar.dataset.subtitle || "Álbumes y colecciones";
    const collectionId = new URLSearchParams(window.location.search).get("collection");
    let backHref = topbar.dataset.backHref || `${rootPath}index.html`;
    if (collectionId && backHref.includes("coleccion-dashboard.html")) {
        const backUrl = new URL(backHref, window.location.href);
        backUrl.searchParams.set("collection", collectionId);
        backHref = backUrl.href;
    }
    const inventoryFormPages = ["nuevo-producto.html", "nueva-figurita.html", "nuevo-album.html", "crear-card.html", "nueva-presentacion.html", "agregar-sobre.html", "agregar-paqueton.html", "nueva-promocion.html"];
    if (collectionId && inventoryFormPages.includes(pageName)) {
        backHref = `coleccion-dashboard.html?collection=${encodeURIComponent(collectionId)}`;
    }
    const backButton = activePage === "index.html"
        ? ""
        : `<a class="back-button" href="${backHref}" aria-label="Volver"><i class="fi fi-rr-angle-left"></i></a>`;

    topbar.innerHTML = `
        <header class="topbar">
            <div class="topbar-left">
                ${backButton}
                <div class="topbar-brand">
                    <h1>${title}</h1>
                    <span>${subtitle}</span>
                </div>
            </div>
            <div class="topbar-actions">
                <a class="cart-button" href="${isPagesPath ? "preparar-carrito.html" : "pages/preparar-carrito.html"}"><i class="fi fi-rr-shopping-cart"></i><span>Carrito</span></a>
                <button class="icon-button" type="button" aria-label="Notificaciones"><i class="fi fi-rr-bell"></i></button>
            </div>
        </header>
    `;
}

const bottomNav = document.getElementById("bottom-nav");

if (bottomNav) {
    const navigationItems = [
        ["index.html", "Inicio", "fi-rr-home"],
        ["pages/colecciones.html", "Colecciones", "fi-rr-books"],
        ["pages/clientes.html", "Clientes", "fi-rr-user"],
        ["pages/ventas.html", "Ventas", "fi-rr-receipt"],
        ["pages/dashboard.html", "Dashboard", "fi-rr-chart-histogram"]
    ];

    bottomNav.innerHTML = `
        <nav class="bottom-nav" aria-label="Navegación principal">
            ${navigationItems.map(([href, label, icon]) => {
                const target = href.split("/").pop();
                const isActive = target === activePage;
                const relativeHref = isPagesPath
                    ? (href === "index.html" ? "../index.html" : href.replace("pages/", ""))
                    : href;

                return `
                    <a href="${relativeHref}" class="nav-item${isActive ? " active" : ""}"${isActive ? ' aria-current="page"' : ""}>
                        <i class="fi ${icon}"></i>
                        <small>${label}</small>
                    </a>
                `;
            }).join("")}
        </nav>
    `;
}

if (!document.querySelector('script[src$="js/app.js"]')) {
    const appScript = document.createElement("script");
    appScript.src = `${rootPath}js/app.js`;
    document.body.appendChild(appScript);
}

const categoryIntro = document.querySelector(".category-page .category-intro");
if (categoryIntro && !document.querySelector(".category-cart-action")) {
    const cartAction = document.createElement("a");
    cartAction.className = "primary-button category-cart-action";
    cartAction.href = "preparar-carrito.html";
    cartAction.innerHTML = '<i class="fi fi-rr-shopping-cart-add"></i> Añadir al carrito';
    categoryIntro.appendChild(cartAction);
}

const categoryAddTargets = {
    "inventario-figuritas.html": ["nueva-figurita.html", "Nueva figurita"],
    "inventario-albums.html": ["nuevo-album.html", "Nuevo álbum"],
    "inventario-cards.html": ["crear-card.html", "Crear card"],
    "inventario-sobres.html": ["agregar-sobre.html", "Agregar sobre"],
    "inventario-paquetones.html": ["agregar-paqueton.html", "Agregar paquetón"],
    "inventario-promociones.html": ["nueva-promocion.html", "Nueva promoción"]
};
const categoryTarget = categoryAddTargets[pageName];
if (categoryIntro && categoryTarget && !categoryIntro.querySelector(".category-add-link")) {
    const addLink = document.createElement("a");
    addLink.className = "primary-button category-add-link";
    const targetUrl = new URL(categoryTarget[0], window.location.href);
    const collectionParam = new URLSearchParams(window.location.search).get("collection");
    if (collectionParam) targetUrl.searchParams.set("collection", collectionParam);
    addLink.href = targetUrl.href;
    addLink.textContent = categoryTarget[1];
    categoryIntro.appendChild(addLink);
}