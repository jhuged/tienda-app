
// ========================================
// COMPONENTES REUTILIZABLES
// ========================================


// ========================================
// TOP BAR
// ========================================

const topbar = document.getElementById("topbar");

if (topbar) {

    topbar.innerHTML = 
        <header class="topbar">

            <div class="topbar-left">

                <button class="icon-button" type="button">
                    ☰
                </button>

                <div>
                    <h1>Mi Tienda</h1>
                    <span>Álbumes y colecciones</span>
                </div>

            </div>

            <button class="icon-button" type="button">
                🔔
            </button>

        </header>
    ;
}


// ========================================
// BOTTOM NAVIGATION
// ========================================

const bottomNav = document.getElementById("bottom-nav");

if (bottomNav) {

    bottomNav.innerHTML = 
        <nav class="bottom-nav">

            <a href="index.html" class="nav-item active">
                <span>🏠</span>
                <small>Inicio</small>
            </a>

            <a href="pages/colecciones.html" class="nav-item">
                <span>📚</span>
                <small>Colecciones</small>
            </a>

            <a href="pages/clientes.html" class="nav-item">
                <span>👤</span>
                <small>Clientes</small>
            </a>

            <a href="pages/ventas.html" class="nav-item">
                <span>🧾</span>
                <small>Ventas</small>
            </a>

            <a href="pages/dashboard.html" class="nav-item">
                <span>📊</span>
                <small>Dashboard</small>
            </a>

        </nav>
    ;
}

