const currentPath = window.location.pathname.toLowerCase();
const isPagesPath = currentPath.includes("/pages/");
const rootPath = isPagesPath ? "../" : "";
const pageName = currentPath.split("/").pop() || "index.html";
const activePage = pageName === "venta-detalle.html" ? "ventas.html" : pageName;

const topbar = document.getElementById("topbar");

if (topbar) {
    const title = topbar.dataset.title || "Figuroom";
    const subtitle = topbar.dataset.subtitle || "Álbumes y colecciones";
    const backHref = topbar.dataset.backHref || `${rootPath}index.html`;
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
            <button class="icon-button" type="button" aria-label="Notificaciones">
                <i class="fi fi-rr-bell"></i>
            </button>
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