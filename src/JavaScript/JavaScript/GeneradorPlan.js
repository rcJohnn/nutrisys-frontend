/* =============================================================
   GeneradorPlan.js
   ============================================================= */

// Variables globales para el filtrado de despensa
var gpUsuarioDespensaActual = null;
var gpDespensaHtmlOriginal = "";

$(document).ready(function () {
    var PageName = window.location.pathname.split('/').pop();

    if (PageName == 'frmGeneradorPlan.aspx') {
        inicializarFormulario();
        gpInitTabs();
        lucide.createIcons();

        // Recalcular kcal meta al editar los inputs de macro manualmente
        $(document).on('input', '#gpMetaCarb, #gpMetaProt, #gpMetaGras, #gpMetaFibr', function () {
            gpActualizarMetaKcal();
        });
    }
});

function gpActualizarMetaKcal() {
    var cho   = parseFloat(document.getElementById("gpMetaCarb").value) || 0;
    var prot  = parseFloat(document.getElementById("gpMetaProt").value) || 0;
    var grasa = parseFloat(document.getElementById("gpMetaGras").value) || 0;
    var kcal  = Math.round((cho * 4) + (prot * 4) + (grasa * 9));
    var display = document.getElementById("gpMetaKcalDisplay");
    var span    = document.getElementById("gpMetaKcal");
    if (!display || !span) return;
    if (cho + prot + grasa > 0) {
        span.textContent = kcal;
        display.style.display = "";
    } else {
        display.style.display = "none";
    }
}

// ========================================
// BÚSQUEDA DE USUARIOS (para Admin y Médico)
// ========================================
var gpUsuariosData = []; // [{id, text}, ...]

function cargaUsuarios() {
    jQuery.ajax({
        type: "POST",
        url: "frmGeneradorPlan.aspx/CargaListaUsuarios",
        data: JSON.stringify({ 'obj_Parametros_JS': [] }),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        cache: false,
        success: function (msg) {
            var res = msg.d;
            if (!res || res.indexOf("Error") !== -1) return;
            // Parsear las <option> que devuelve el WebMethod
            var temp = document.createElement("select");
            temp.innerHTML = res;
            gpUsuariosData = [];
            Array.from(temp.options).forEach(function (o) {
                if (o.value && o.value !== "0")
                    gpUsuariosData.push({ id: o.value, text: o.text });
            });
        }
    });
}

function gpFiltrarUsuarios(query) {
    var panel = document.getElementById("divResultadosUsuario");
    if (!query || query.trim().length < 1) {
        // Mostrar todos si el campo está vacío
        var todos = gpUsuariosData;
        if (todos.length === 0) { panel.style.display = "none"; return; }
        gpRenderResultadosUsuario(todos, panel);
        return;
    }
    var q = query.toLowerCase();
    var filtrados = gpUsuariosData.filter(function (u) {
        return u.text.toLowerCase().indexOf(q) !== -1;
    });
    if (filtrados.length === 0) {
        panel.innerHTML = '<div class="gp-search-no-results">Sin resultados</div>';
        panel.style.display = "block";
        return;
    }
    gpRenderResultadosUsuario(filtrados, panel);
}

function gpRenderResultadosUsuario(lista, panel) {
    var html = lista.map(function (u) {
        return '<div class="gp-search-item" onmousedown="gpSeleccionarUsuario(\'' + u.id + '\', \'' +
            u.text.replace(/'/g, "\\'") + '\')">' + u.text + '</div>';
    }).join("");
    panel.innerHTML = html;
    panel.style.display = "block";
}

function gpSeleccionarUsuario(id, nombre) {
    document.getElementById("hdnIdUsuario").value = id;
    document.getElementById("txtBuscarUsuario").value = nombre;
    document.getElementById("lblUsuarioBadge").textContent = nombre;
    document.getElementById("divUsuarioBadge").style.display = "block";
    document.getElementById("divResultadosUsuario").style.display = "none";
    mostrarInfoUsuario();
}

function gpLimpiarUsuario() {
    document.getElementById("hdnIdUsuario").value = "0";
    document.getElementById("txtBuscarUsuario").value = "";
    document.getElementById("divUsuarioBadge").style.display = "none";
    document.getElementById("infoUsuario").style.display = "none";
}

// Cerrar panel al hacer click fuera
$(document).on("click", function (e) {
    if (!$(e.target).closest(".gp-search-wrapper").length)
        $("#divResultadosUsuario").hide();
});

// ========================================
// MOSTRAR INFO USUARIO (desde búsqueda)
// ========================================
function gpMostrarInfoUsuario() {
    mostrarInfoUsuario();
}

/* ============================================================
   TABS
   ============================================================ */
function gpInitTabs() {
    $('.gp-tab-btn').on('click', function () {
        $('.gp-tab-btn').removeClass('active');
        $('.gp-tab-panel').removeClass('active');
        $(this).addClass('active');
        var tab = $(this).data('tab');
        $('#tab-' + tab).addClass('active');
        if (tab === 'lista') gpCargarAlimentosLista();
    });

    $('#gpFilterChips .gp-chip').on('click', function () {
        $('#gpFilterChips .gp-chip').removeClass('active');
        $(this).addClass('active');
        gpRenderLista(gpTodosAlimentos, $(this).data('filter'), $('#gpSearchFood').val());
    });

    $('#gpSearchFood').on('input', function () {
        var f = $('#gpFilterChips .gp-chip.active').data('filter');
        gpRenderLista(gpTodosAlimentos, f, $(this).val());
    });
}

/* ============================================================
   USUARIOS — SIN CAMBIOS, IGUAL QUE ANTES
   ============================================================ */
function inicializarFormulario() {
    var tipoUsuario = $.cookie("GLBTYP");

    if (tipoUsuario == "A" || tipoUsuario == "M") {
        $("#divComboUsuarios").show();
        $("#divInfoUsuarioFija").hide();
        cargaUsuarios();
    } else if (tipoUsuario == "U") {
        $("#divComboUsuarios").hide();
        $("#divInfoUsuarioFija").hide(); // ✅ Ocultar hasta que cargue
        cargarUsuarioActual();
    }
}

function cargarUsuarioActual() {
    var idUsuario = $.cookie("GLBUNI");
    var nombreUsuario = $.cookie("GLBDSC");

    $("#divInfoUsuarioFija").hide();
    $("#lblUsuarioSeleccionado").text(nombreUsuario);

    var obj_Parametros_JS = new Array();
    obj_Parametros_JS[0] = idUsuario;

    var parametros = JSON.stringify({ 'obj_Parametros_JS': obj_Parametros_JS });

    jQuery.ajax({
        type: "POST",
        url: "frmGeneradorPlan.aspx/ObtenerPadecimientosUsuario",
        data: parametros,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        cache: false,
        success: function (msg) {
            var res = msg.d;
            if (res === undefined || res.indexOf("Error") > -1) {
                $("#lblPadecimientos").text("Error al cargar");
            } else {
                $("#lblPadecimientos").text(res);
            }
            $("#infoUsuario").slideDown();
        },
        error: function (msg) { }
    });
}

function mostrarInfoUsuario() {
    var idUsuario = $("#hdnIdUsuario").val();

    if (!idUsuario || idUsuario == "0") {
        $("#infoUsuario").hide();
        return;
    }

    var nombreUsuario = $("#lblUsuarioBadge").text();
    $("#lblUsuarioSeleccionado").text(nombreUsuario);

    var obj_Parametros_JS = new Array();
    obj_Parametros_JS[0] = idUsuario;

    var parametros = JSON.stringify({ 'obj_Parametros_JS': obj_Parametros_JS });

    jQuery.ajax({
        type: "POST",
        url: "frmGeneradorPlan.aspx/ObtenerPadecimientosUsuario",
        data: parametros,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        cache: false,
        success: function (msg) {
            var res = msg.d;
            if (res === undefined || res.indexOf("Error") > -1) {
                $("#lblPadecimientos").text("Error al cargar");
            } else {
                $("#lblPadecimientos").text(res);
            }
            $("#infoUsuario").slideDown();
        },
        error: function (msg) { }
    });
}

/* ============================================================
   LISTA DE INTERCAMBIO — carga desde BD
   ============================================================ */
var gpTodosAlimentos = [];

var gpListaCargada = false;

function gpCargarAlimentosLista() {
    if (gpListaCargada) return;

    var params = JSON.stringify({ 'obj_Parametros_JS': [] });

    $.ajax({
        type: "POST",
        url: "frmGeneradorPlan.aspx/ObtenerListaAlimentosJSON",
        data: params,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (msg) {
            try {
                var response = msg.d;
                
                // Verificar si hay error de autenticación
                if (response && response.indexOf && response.indexOf("AUTH<SPLITER>") === 0) {
                    window.location.href = "/Login/frmInicioSesion.aspx";
                    return;
                }
                
                gpTodosAlimentos = JSON.parse(response);
                gpListaCargada = true;
                gpRenderLista(gpTodosAlimentos, "all", "");
            } catch (e) {
                document.getElementById("gpFoodGroupsContainer").innerHTML =
                    '<div style="text-align:center;padding:2rem;color:#c0392b;">Error al procesar: ' + (msg.d || e.message) + '</div>';
            }
        },
        error: function (xhr, status, error) {
            document.getElementById("gpFoodGroupsContainer").innerHTML =
                '<div style="text-align:center;padding:2rem;color:#c0392b;">Error: ' + (xhr.responseText || error || 'Error de conexión') + '</div>';
        }
    });
}

var GP_MEAL_META = {
    "Desayuno":   { icon: "coffee",   esPrincipal: true  },
    "MeriendaAM": { icon: "apple",    esPrincipal: false },
    "Almuerzo":   { icon: "sun",      esPrincipal: true  },
    "MeriendaPM": { icon: "cookie",   esPrincipal: false },
    "Cena":       { icon: "moon",     esPrincipal: true  }
};

function gpMealIconHtml(mealKey, size) {
    var iconName = (GP_MEAL_META[mealKey] && GP_MEAL_META[mealKey].icon) || "utensils";
    size = size || 18;
    return '<i data-lucide="' + iconName + '" width="' + size + '" height="' + size + '" style="flex-shrink:0;vertical-align:middle;"></i>';
}

function gpRenderLista(alimentos, filterCat, search) {
    var container = document.getElementById("gpFoodGroupsContainer");
    if (!alimentos || alimentos.length === 0) {
        container.innerHTML = '<div style="text-align:center;padding:2rem;color:#7a9a78;">' +
            '<div class="gp-spinner"></div><p style="margin-top:0.5rem;">Cargando...</p></div>';
        return;
    }

    var filtered = alimentos.filter(function (a) {
        var mc = filterCat === "all" || a.Macrogrupo === filterCat;
        var ms = !search || a.Nombre.toLowerCase().indexOf(search.toLowerCase()) > -1;
        return mc && ms;
    });

    var grupos = {};
    filtered.forEach(function (a) {
        var key = a.Macrogrupo || "Sin clasificar";
        if (!grupos[key]) grupos[key] = [];
        grupos[key].push(a);
    });

    var html = "";
    var abrir = filterCat !== "all" || !!search;

    Object.keys(grupos).forEach(function (cat) {
        var info = GP_MACROGRUPOS[cat] || { emoji: "🍽️", color: "#f0f0f0" };
        var items = grupos[cat];

        html += '<div class="gp-food-group ' + (abrir ? "open" : "") + '">';
        html += '<div class="gp-fg-header" onclick="this.parentElement.classList.toggle(\'open\')">';
        html += '<div class="gp-fg-left">';
        html += '<div class="gp-fg-icon" style="background:' + info.color + '">' + info.emoji + '</div>';
        html += '<div><div class="gp-fg-title">' + cat + '</div>';
        html += '<div class="gp-fg-count">' + items.length + ' alimentos</div></div></div>';
        html += '<span class="gp-fg-chevron">▾</span></div>';

        html += '<div class="gp-fg-body">';
        items.forEach(function (a) {
            html += '<div class="gp-food-item">';

            // Header colapsable — solo nombre
            html += '<div class="gp-food-item-header" onclick="this.parentElement.classList.toggle(\'open\')">';
            html += '<span class="gp-food-item-name">' + a.Nombre + '</span>';
            html += '<span class="gp-food-item-chevron">▾</span>';
            html += '</div>';

            // Body — detalle nutricional (oculto por defecto)
            html += '<div class="gp-food-item-body gp-food-item-detail">';

            // Macros principales
            html += '<div class="gp-fid-section-title">Macronutrientes <span class="gp-fid-unit">por 100g</span></div>';
            html += '<div class="gp-fid-macros">';
            html += gpFidTag("⚡", "Energía", a.Energia_kcal, "kcal", "#fff3cd", "#856404");
            html += gpFidTag("💪", "Proteína", a.Proteina_g, "g", "#d1e7dd", "#0f5132");
            html += gpFidTag("🌾", "Carbohidratos", a.Carbohidratos_g, "g", "#cfe2ff", "#084298");
            html += gpFidTag("🥑", "Grasas", a.Grasa_g, "g", "#f8d7da", "#842029");
            html += gpFidTag("🌿", "Fibra", a.Fibra_g, "g", "#d1e7dd", "#0a3622");
            html += gpFidTag("🫀", "Colesterol", a.Colesterol_mg, "mg", "#f8d7da", "#842029");
            html += '</div>';

            // Minerales
            html += '<div class="gp-fid-section-title">Minerales</div>';
            html += '<div class="gp-fid-macros">';
            html += gpFidTag("🦴", "Calcio", a.Calcio_mg, "mg", "#e8f4fd", "#0c4a6e");
            html += gpFidTag("🔋", "Fósforo", a.Fosforo_mg, "mg", "#e8f4fd", "#0c4a6e");
            html += gpFidTag("🩸", "Hierro", a.Hierro_mg, "mg", "#fce8e8", "#7f1d1d");
            html += gpFidTag("⚗️", "Potasio", a.Potasio_mg, "mg", "#fef5e7", "#78350f");
            html += gpFidTag("🧲", "Magnesio", a.Magnesio_mg, "mg", "#e6f5e6", "#14532d");
            html += gpFidTag("🧂", "Sodio", a.Sodio_mg, "mg", "#fef9c3", "#713f12");
            html += gpFidTag("💎", "Zinc", a.Zinc_mg, "mg", "#f0fdf4", "#14532d");
            html += '</div>';

            // Vitaminas
            html += '<div class="gp-fid-section-title">Vitaminas</div>';
            html += '<div class="gp-fid-macros">';
            html += gpFidTag("🌞", "Vit. C", a.Vit_C_mg, "mg", "#fff3cd", "#78350f");
            html += gpFidTag("👁️", "Vit. A", a.Vit_A_ug, "µg", "#fef5e7", "#92400e");
            html += gpFidTag("🧬", "Tiamina/B1", a.Tiamina_mg, "mg", "#fce8f0", "#831843");
            html += gpFidTag("🔆", "Riboflavina/B2", a.Riboflavina_mg, "mg", "#fdf4ff", "#6b21a8");
            html += gpFidTag("⚙️", "Niacina/B3", a.Niacina_mg, "mg", "#fff7ed", "#7c2d12");
            html += gpFidTag("🔩", "Vit. B6", a.Vit_B6_mg, "mg", "#f0e8fd", "#4c1d95");
            html += gpFidTag("🔬", "Vit. B12", a.Vit_B12_ug, "µg", "#e8f0fd", "#1e3a5f");
            html += gpFidTag("🍃", "Folato", a.Folato_ug, "µg", "#f0fdf4", "#065f46");
            html += '</div>';

            // Ácidos grasos
            html += '<div class="gp-fid-section-title">Ácidos Grasos</div>';
            html += '<div class="gp-fid-macros">';
            html += gpFidTag("🔴", "Saturados", a.Ac_Grasos_Saturados_g, "g", "#fee2e2", "#991b1b");
            html += gpFidTag("🟡", "Monoinsaturados", a.Ac_Grasos_Monoinsaturados_g, "g", "#fefce8", "#854d0e");
            html += gpFidTag("🟢", "Poliinsaturados", a.Ac_Grasos_Poliinsaturados_g, "g", "#f0fdf4", "#166534");
            html += '</div>';

            html += '</div>'; // gp-food-item-body
            html += '</div>'; // gp-food-item
        });
        html += '</div>'; // gp-fg-body
        html += '</div>'; // gp-food-group
    });

    if (!html) {
        html = '<div style="text-align:center;padding:2rem;color:#7a9a78;">No se encontraron alimentos</div>';
    }
    container.innerHTML = html;
}

// Helper para cada tag de nutriente
function gpFidTag(emoji, label, valor, unidad, bg, color) {
    return '<div class="gp-fid-tag" style="background:' + bg + ';color:' + color + ';">' +
        '<span class="gp-fid-emoji">' + emoji + '</span>' +
        '<div class="gp-fid-info">' +
        '<div class="gp-fid-label">' + label + '</div>' +
        '<div class="gp-fid-valor">' + valor + ' <span class="gp-fid-unidad">' + unidad + '</span></div>' +
        '</div>' +
        '</div>';
}

/* ============================================================
   TOGGLE FILTRO EN CASA
   ============================================================ */
var gpFiltroActivo = false;
var gpAlimentosFiltro = {};
var gpFiltroSeleccionados = {};

function gpHandleToggleFiltro() {
    gpFiltroActivo = document.getElementById("gpToggleFiltro").checked;
    var panel = document.getElementById("gpPanelFiltro");
    var badge = document.getElementById("gpSelectedBadge");

    if (gpFiltroActivo) {
        panel.style.display = "block";
        badge.style.display = "inline-block";
        gpCargarAlimentosFiltro();
    } else {
        panel.style.display = "none";
        badge.style.display = "none";
        gpFiltroSeleccionados = {};
    }
}

// Macrogrupos para el panel de despensa
var GP_MACROGRUPOS = {
    "Lácteos y derivados": { emoji: "🥛", color: "#e8f4fd" },
    "Proteínas animales":  { emoji: "🍗", color: "#fce8e8" },
    "Vegetales":           { emoji: "🥦", color: "#e6f5e6" },
    "Grasas y semillas":   { emoji: "🥑", color: "#f0f7e6" },
    "Frutas":              { emoji: "🍎", color: "#fce8f0" },
    "Cereales y harinas":  { emoji: "🍞", color: "#fef5e7" },
    "Azúcares y dulces":   { emoji: "🍯", color: "#fef9e0" },
    "Sin clasificar":      { emoji: "🍽️", color: "#f0f0f0" }
};

function gpCargarAlimentosFiltro() {
    var tipo = $.cookie("GLBTYP");
    var id   = (tipo === "A" || tipo === "M") ? ($("#hdnIdUsuario").val() || "1") : $.cookie("GLBUNI");

    var container = document.getElementById("gpFiltroContainer");
    container.innerHTML = '<div style="text-align:center;padding:2rem;color:#7a9a78;">' +
        '<div class="gp-spinner"></div><p style="margin-top:0.5rem;">Cargando despensa...</p></div>';

    var params = JSON.stringify({ 'obj_Parametros_JS': [id.toString()] });

    $.ajax({
        type: "POST",
        url: "frmGeneradorPlan.aspx/CargarAlimentosDespensa",
        data: params,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (msg) {
            container.innerHTML = msg.d;

            // Inicializar gpFiltroSeleccionados desde los checkboxes pre-marcados
            gpFiltroSeleccionados = {};
            container.querySelectorAll('.chk-despensa:checked').forEach(function (chk) {
                gpFiltroSeleccionados[parseInt(chk.value)] = true;
            });
            gpActualizarBadge();

            // Escuchar cambios en los checkboxes
            $(container).off('change.despensa').on('change.despensa', '.chk-despensa', function () {
                var itemId = parseInt($(this).val());
                if ($(this).is(':checked')) {
                    gpFiltroSeleccionados[itemId] = true;
                } else {
                    delete gpFiltroSeleccionados[itemId];
                }
                gpActualizarBadge();
            });
        },
        error: function () {
            container.innerHTML = '<div style="color:#c0392b;padding:1rem;">Error al cargar la despensa.</div>';
        }
    });
}

function gpSeleccionarTodos() {
    var container = document.getElementById("gpFiltroContainer");
    gpFiltroSeleccionados = {};
    container.querySelectorAll('.chk-despensa').forEach(function (chk) {
        chk.checked = true;
        gpFiltroSeleccionados[parseInt(chk.value)] = true;
    });
    gpActualizarBadge();
}

function gpDeseleccionarTodos() {
    var container = document.getElementById("gpFiltroContainer");
    container.querySelectorAll('.chk-despensa').forEach(function (chk) {
        chk.checked = false;
    });
    gpFiltroSeleccionados = {};
    gpActualizarBadge();
}

function gpGuardarDespensa() {
    var tipo = $.cookie("GLBTYP");
    var id   = (tipo === "A" || tipo === "M") ? ($("#hdnIdUsuario").val() || "1") : $.cookie("GLBUNI");
    var ids  = Object.keys(gpFiltroSeleccionados).join(",");

    var params = JSON.stringify({ 'obj_Parametros_JS': [id.toString(), ids] });

    $.ajax({
        type: "POST",
        url: "frmGeneradorPlan.aspx/GuardarDespensa",
        data: params,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (msg) {
            var arr = msg.d.split("<SPLITER>");
            gpShowToast(arr[0] === "1" ? "✅ " + arr[1] : "⚠️ " + arr[1]);
            // Colapsar el panel de filtro después de guardar
            $("#gpPanelFiltro").slideUp(300);
            $("#gpToggleFiltro").prop("checked", false);
        },
        error: function () { gpShowToast("⚠️ Error al guardar la despensa"); }
    });
}
function gpActualizarBadge() {
    document.getElementById("gpSelectedBadge").textContent = Object.keys(gpFiltroSeleccionados).length + " seleccionados";
}

/* ============================================================
   FILTRAR DESPENSA POR NOMBRE
   ============================================================ */
function gpFiltrarDespensa(texto) {
    var container = document.getElementById("gpFiltroContainer");
    var busqueda = texto.toLowerCase().trim();
    
    // Mostrar/ocultar el contador de resultados
    var countBadge = document.getElementById("gpBuscadorCount");
    if (!busqueda) {
        countBadge.style.display = "none";
        // Restaurar todos los grupos
        container.querySelectorAll(".gp-food-group").forEach(function (g) { g.style.display = ""; });
        container.querySelectorAll(".gp-food-item-check").forEach(function (item) { item.style.display = ""; });
        // Restaurar filas del grid
        container.querySelectorAll(".gp-fila-grid").forEach(function (fila) { fila.style.display = ""; });
        return;
    }
    
    countBadge.style.display = "";
    var totalVisibles = 0;
    
    // Filtrar cada item de comida
    container.querySelectorAll(".gp-food-item-check").forEach(function (item) {
        var nombre = item.querySelector(".gp-food-name");
        if (!nombre) { item.style.display = "none"; return; }
        
        var textoItem = nombre.textContent.toLowerCase();
        if (textoItem.includes(busqueda)) {
            item.style.display = "";
            totalVisibles++;
        } else {
            item.style.display = "none";
        }
    });
    
    // Ocultar categorías vacías y filas del grid que quedaron vacías
    container.querySelectorAll(".gp-food-group").forEach(function (grupo) {
        var visibles = grupo.querySelectorAll(".gp-food-item-check:not([style*='display: none'])").length;
        grupo.style.display = visibles > 0 ? "" : "none";
    });
    
    // Ocultar filas vacías del grid
    container.querySelectorAll(".gp-fila-grid").forEach(function (fila) {
        var visibles = fila.querySelectorAll(".gp-food-group:not([style*='display: none'])").length;
        fila.style.display = visibles > 0 ? "" : "none";
    });
    
    // Actualizar contador
    countBadge.querySelector(".input-group-text").textContent = totalVisibles + " encontrados";
}

/* ============================================================
   SELECCIÓN TIEMPO DE COMIDA
   ============================================================ */
var gpSelectedMeal = null;

function gpSelectMeal(btn) {
    document.querySelectorAll(".gp-meal-btn").forEach(function (b) { b.classList.remove("active"); });
    btn.classList.add("active");
    gpSelectedMeal = btn.dataset.meal;

    var meta = GP_MEAL_META[gpSelectedMeal];
    var nombre = gpSelectedMeal.replace("AM", " AM").replace("PM", " PM");
    document.getElementById("gpMacrosTitle").innerHTML = gpMealIconHtml(gpSelectedMeal, 16) + " " + nombre + " — Metas nutricionales";
    lucide.createIcons();
    document.getElementById("gpRulesInfo").innerHTML = meta.esPrincipal
        ? "<strong>Reglas para " + nombre + ":</strong> El plan incluirá obligatoriamente <strong>mínimo 1 harina</strong>, <strong>1 verdura</strong> y <strong>1 proteína</strong>."
        : "<strong>Merienda:</strong> Combinación flexible que se aproximará a las metas ingresadas.";

    // Limpiar campos de macros del tiempo anterior
    document.getElementById("gpMetaCarb").value = "";
    document.getElementById("gpMetaProt").value = "";
    document.getElementById("gpMetaGras").value = "";
    document.getElementById("gpMetaFibr").value = "";
    document.getElementById("gpMetaKcalDisplay").style.display = "none";
    gpMetaKcalPlan = 0;

    document.getElementById("gpMacrosCard").style.display = "block";
    document.getElementById("gpConfirmarDiv").style.display = "none";
    document.getElementById("gpResultados").innerHTML = "";
    document.getElementById("gpSidebarCurrent").innerHTML = "";
    document.getElementById("gpPlanWrapper").style.display = gpPlanesAcumulados.length > 0 ? "flex" : "none";
    gpPlanGenerado = null;

    // Auto-traer distribución de la última cita para este tiempo de comida
    gpTraerDistribucionCita();
}

/* ============================================================
   GENERAR PLAN
   ============================================================ */
var gpPlanGenerado    = null;
var gpPlanConfirmado  = null;
var gpPlanesAcumulados = [];   // planes confirmados en la sesión
var gpMealTimesUsados  = {};   // { "Desayuno": true, ... }
var gpMetaKcalPlan     = 0;    // kcal meta traída de la distribución de última cita

function gpGenerarPlan() {
    if (!gpSelectedMeal) { gpShowToast("⚠️ Seleccioná un tiempo de comida"); return; }

    var metaCarb = parseFloat(document.getElementById("gpMetaCarb").value) || 0;
    var metaProt = parseFloat(document.getElementById("gpMetaProt").value) || 0;
    var metaGras = parseFloat(document.getElementById("gpMetaGras").value) || 0;
    var metaFibr = parseFloat(document.getElementById("gpMetaFibr").value) || 0;

    if (!metaCarb && !metaProt && !metaGras && !metaFibr) {
        gpShowToast("⚠️ Ingresá al menos una meta nutricional"); return;
    }

    var tipo = $.cookie("GLBTYP");
    var id = (tipo === "A" || tipo === "M") ? ($("#hdnIdUsuario").val() || "0") : $.cookie("GLBUNI");

    if (!id || id === "0") { gpShowToast("⚠️ Seleccioná un usuario primero"); return; }

    var idsFiltrados = "";
    if (gpFiltroActivo) {
        var ids = Object.keys(gpFiltroSeleccionados);
        if (ids.length === 0) { gpShowToast("⚠️ Seleccioná al menos un alimento"); return; }
        idsFiltrados = ids.join(",");
    }

    // Mover acumulados al sidebar ahora que se está generando
    gpRenderSidebarAcumulado();

    document.getElementById("gpResultados").innerHTML =
        '<div style="text-align:center;padding:2rem;color:#7a9a78;"><div class="gp-spinner"></div><p style="margin-top:0.5rem;">Generando plan...</p></div>';
    document.getElementById("gpSidebarCurrent").innerHTML = "";
    document.getElementById("gpPlanWrapper").style.display = "flex";
    document.getElementById("gpConfirmarDiv").style.display = "none";

    var esVegano = document.getElementById("gpToggleVegano").checked ? "1" : "0";

    var params = JSON.stringify({
        'obj_Parametros_JS': [
            id.toString(), gpSelectedMeal,
            metaCarb.toString(), metaProt.toString(),
            metaGras.toString(), metaFibr.toString(),
            idsFiltrados,
            esVegano
        ]
    });

    $.ajax({
        type: "POST",
        url: "frmGeneradorPlan.aspx/GenerarPlanNutricional",
        data: params,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (msg) {
            try {
                var plan = JSON.parse(msg.d);
                if (plan.Error) {
                    gpShowToast("❌ " + plan.Error);
                    document.getElementById("gpPlanWrapper").style.display = "none";
                    return;
                }

                gpPlanGenerado = {
                    tiempo: gpSelectedMeal,
                    metas: { carb: metaCarb, prot: metaProt, grasa: metaGras, fibra: metaFibr },
                    alimentos: plan.Alimentos.map(function (a, i) {
                        return {
                            id: a.Id_Alimento || (i + 1),
                            id_bd: a.Id_Alimento || (i + 1),
                            nombre: a.Nombre, categoria: a.Categoria, macrogrupo: a.Macrogrupo || "",
                            porcion_g: a.Porcion_g,
                            factor_coccion: a.Factor_Coccion || 1.0,
                            carb: a.Carbohidratos_g, prot: a.Proteina_g,
                            grasa: a.Grasa_g, fibra: a.Fibra_g, energia: a.Energia_kcal
                        };
                    }),
                    totales: {
                        carb: plan.TotalCarbohidratos, prot: plan.TotalProteina,
                        grasa: plan.TotalGrasa, fibra: plan.TotalFibra, energia: plan.TotalEnergia
                    },
                    estadoAlimentos: {},
                    panelCambio: {}
                };

                gpPlanGenerado.alimentos.forEach(function (a) {
                    gpPlanGenerado.estadoAlimentos[a.id] = null;
                });

                gpRenderResultados();
                document.getElementById("gpConfirmarDiv").style.display = "block";
            } catch (e) {
                gpShowToast("❌ Error al procesar el plan");
                document.getElementById("gpPlanWrapper").style.display = "none";
            }
        },
        error: function () {
            gpShowToast("❌ Error de conexión");
            document.getElementById("gpPlanWrapper").style.display = "none";
        }
    });
}

/* ============================================================
   RENDER RESULTADOS
   ============================================================ */
function gpRenderResultados() {
    if (!gpPlanGenerado) return;
    var p = gpPlanGenerado;
    var meta = GP_MEAL_META[p.tiempo];
    var nombre = p.tiempo.replace("AM", " AM").replace("PM", " PM");

    function barHtml(label, val, metaVal, unit, type) {
        unit = unit || 'g';
        type = type || 'macro';
        var rawPct = metaVal > 0 ? (val / metaVal * 100) : 0;
        var dev = Math.abs(rawPct - 100);
        var color;
        if (type === 'kcal') {
            color = dev <= 10 ? '#4e9a42' : '#d9534f';
        } else if (type === 'grasa') {
            color = dev <= 20 ? '#4e9a42' : (dev <= 35 ? '#f59e0b' : '#d9534f');
        } else {
            color = dev <= 10 ? '#4e9a42' : (dev <= 20 ? '#f59e0b' : '#d9534f');
        }
        var lbl = metaVal > 0 ? rawPct.toFixed(1) + "%" : "—";
        return '<div class="gp-bar-row">' +
            '<div class="gp-bar-label">' +
            '<span class="gp-bar-name">' + label + '</span>' +
            '<span><span style="color:#7a9a78">' + val + unit + ' / ' + metaVal + unit + '</span>' +
            ' <span class="gp-bar-pct" style="color:' + color + '">' + lbl + '</span></span>' +
            '</div><div class="gp-bar-track"><div class="gp-bar-fill" style="width:' + Math.min(rawPct, 100) + '%;background:' + color + '"></div></div>' +
            '</div>';
    }

    var alimentosHtml = p.alimentos.map(function (a) {
        var estado = p.estadoAlimentos[a.id] || "";
        var panelOpen = p.panelCambio[a.id] !== undefined;
        var catSel = p.panelCambio[a.id];

        var esVeganoActivo = document.getElementById("gpToggleVegano") && document.getElementById("gpToggleVegano").checked;
        var GP_MACROGRUPOS_ANIMAL = { "Proteínas animales": true, "Lácteos y derivados": true };

        var catChips = Object.keys(GP_MACROGRUPOS).filter(function (cat) {
            return !(esVeganoActivo && GP_MACROGRUPOS_ANIMAL[cat]);
        }).map(function (cat) {
            var info = GP_MACROGRUPOS[cat];
            return '<span class="gp-cat-chip ' + (catSel === cat ? 'active' : '') + '"' +
                ' onclick="gpSeleccionarCategoria(' + a.id + ',\'' + cat + '\')">' +
                info.emoji + ' ' + cat + '</span>';
        }).join("");

        return '<div class="gp-rfi ' + (estado === 'confirmed' ? 'confirmed' : '') + ' ' +
            (estado === 'to-change' ? 'to-change' : '') + '" id="gp-rfi-' + a.id + '">' +
            '<div class="gp-rfi-accent"></div>' +
            '<div class="gp-rfi-body">' +
            '<div class="gp-rfi-name">' + a.nombre + '</div>' +
            '<div class="gp-rfi-cat">' + (a.macrogrupo || a.categoria) + '</div>' +

            // controles de porción inline
            (function() {
                var fc = a.factor_coccion || 1.0;
                var displayPorcion = fc > 1 ? +(a.porcion_g * fc).toFixed(1) : a.porcion_g;
                var labelUnidad = fc > 1 ? 'g cocido' : 'g';
                return '<div style="display:flex;align-items:center;gap:0.5rem;margin:0.4rem 0;">' +
                '<button onclick="gpCambiarPorcionPlan(' + a.id + ', -5)" class="gp-porcion-btn">−</button>' +
                '<input type="number" class="gp-porcion-input" value="' + displayPorcion + '" min="1" max="1500" step="1" ' +
                'onchange="gpEditarPorcionPlan(' + a.id + ', +this.value)" onclick="this.select()" />' +
                '<span class="gp-porcion-unit">' + labelUnidad + '</span>' +
                '<button onclick="gpCambiarPorcionPlan(' + a.id + ', 5)" class="gp-porcion-btn">+</button>' +
                '</div>';
            })() +

            '<div class="gp-rfi-macros">' +
            '<span class="gp-macro-tag">🌾 ' + a.carb + 'g</span>' +
            '<span class="gp-macro-tag">💪 ' + a.prot + 'g</span>' +
            '<span class="gp-macro-tag">🥑 ' + a.grasa + 'g</span>' +
            '<span class="gp-macro-tag">🌿 ' + a.fibra + 'g</span>' +
            '<span class="gp-macro-tag">⚡ ' + a.energia + 'kcal</span>' +
            '</div></div>' +

            '<div class="gp-rfi-actions">' +
            '<button class="gp-btn-confirm ' + (estado === 'confirmed' ? 'active' : '') +
            '" onclick="gpToggleConfirmar(' + a.id + ')" title="Confirmar">✅</button>' +
            '<button class="gp-btn-change ' + (estado === 'to-change' ? 'active' : '') +
            '" onclick="gpToggleCambiar(' + a.id + ')" title="Cambiar">🔄</button>' +
            '<button class="gp-btn-delete" onclick="gpEliminarAlimento(' + a.id + ')" title="Eliminar">🗑️</button>' +
            '</div></div>' +

            '<div class="gp-change-panel ' + (panelOpen ? 'open' : '') + '">' +
            '<div class="gp-change-panel-title">🔄 Elegí el grupo para reemplazar <strong>' +
            a.nombre + '</strong></div>' +
            '<div class="gp-cat-chips">' + catChips + '</div>' +
            '<button class="gp-btn gp-btn-orange gp-btn-sm" onclick="gpEjecutarCambio(' + a.id +
            ')">⚡ Cambiar alimento</button>' +
            '</div>';
    }).join("");

    // ── Sidebar: header + barras de progreso ──────────────────
    document.getElementById("gpSidebarCurrent").innerHTML =
        '<div class="gp-result-card" style="margin-bottom:0;">' +
        '<div class="gp-result-header">' +
        '<div class="gp-result-title">' + gpMealIconHtml(gpSelectedMeal, 16) + ' ' + nombre + '</div>' +
        '<button style="background:rgba(255,255,255,0.15);color:#fff;border:1px solid rgba(255,255,255,0.3);border-radius:8px;padding:0.4rem 0.85rem;font-size:0.77rem;font-weight:700;cursor:pointer;" onclick="gpGenerarPlan()">🎲 Regenerar</button>' +
        '</div>' +
        '<div class="gp-result-body">' +
        barHtml("🌾 Carbohidratos", p.totales.carb, p.metas.carb, 'g', 'macro') +
        barHtml("💪 Proteínas", p.totales.prot, p.metas.prot, 'g', 'macro') +
        barHtml("🥑 Grasas", p.totales.grasa, p.metas.grasa, 'g', 'grasa') +
        barHtml("🌿 Fibra", p.totales.fibra, p.metas.fibra, 'g', 'macro') +
        (gpMetaKcalPlan > 0
            ? '<div style="margin-top:0.6rem;padding-top:0.6rem;border-top:1px solid rgba(255,255,255,0.15);">' +
              barHtml("⚡ Energía", p.totales.energia, gpMetaKcalPlan, 'kcal', 'kcal') +
              '</div>'
            : '<div style="text-align:right;font-size:0.83rem;font-weight:700;color:#4e9a42;margin-top:0.5rem;">⚡ ' + p.totales.energia + ' kcal totales</div>') +
        '</div></div>';
    lucide.createIcons();

    // ── Main: alimentos ────────────────────────────────────────
    var todosConfirmados = p.alimentos.length > 0 && p.alimentos.every(function (a) {
        return p.estadoAlimentos[a.id] === "confirmed";
    });

    var bannerOptimizar = todosConfirmados
        ? '<div style="margin-top:1rem;padding:1rem 1.25rem;border-radius:12px;background:linear-gradient(135deg,#e8f4ed 0%,#d4ece0 100%);border:1.5px solid #4a9a78;display:flex;align-items:center;gap:1rem;flex-wrap:wrap;">' +
          '<div style="flex:1;min-width:0;">' +
          '<div style="font-weight:700;color:#1a4a2e;font-size:0.95rem;">🎯 ¡Todos los alimentos confirmados!</div>' +
          '<div style="font-size:0.82rem;color:#4a6a48;margin-top:0.25rem;">El algoritmo puede ajustar las porciones para acercarse al 100% de tus metas de macros.</div>' +
          '</div>' +
          '<button class="gp-btn gp-btn-primary" onclick="gpOptimizarGramos()" style="white-space:nowrap;">⚡ Optimizar porciones</button>' +
          '</div>'
        : '';

    document.getElementById("gpResultados").innerHTML =
        '<div style="font-size:0.82rem;font-weight:700;color:#4a6a48;margin-bottom:0.75rem;">✅ Confirmá los que te gustaron · 🔄 Cambiá los que no</div>' +
        '<div class="gp-food-result-list">' + alimentosHtml + '</div>' +
        bannerOptimizar;

    document.getElementById("gpPlanWrapper").style.display = "flex";
}

/* ============================================================
   CONFIRMAR / CAMBIAR
   ============================================================ */
function gpToggleConfirmar(id) {
    var actual = gpPlanGenerado.estadoAlimentos[id];
    gpPlanGenerado.estadoAlimentos[id] = actual === "confirmed" ? null : "confirmed";
    if (gpPlanGenerado.estadoAlimentos[id] === "confirmed") delete gpPlanGenerado.panelCambio[id];
    gpRenderResultados();
}

function gpToggleCambiar(id) {
    var actual = gpPlanGenerado.estadoAlimentos[id];
    if (actual === "to-change") {
        gpPlanGenerado.estadoAlimentos[id] = null;
        delete gpPlanGenerado.panelCambio[id];
    } else {
        gpPlanGenerado.estadoAlimentos[id] = "to-change";
        gpPlanGenerado.panelCambio[id] = null;
    }
    gpRenderResultados();
}

/* ============================================================
   OPTIMIZAR PORCIONES
   ============================================================ */
function gpOptimizarGramos() {
    if (!gpPlanGenerado || gpPlanGenerado.alimentos.length === 0) return;
    var p = gpPlanGenerado;
    var mC = p.metas.carb, mP = p.metas.prot, mG = p.metas.grasa;
    var C = p.totales.carb, P = p.totales.prot, G = p.totales.grasa;

    if (C + P + G === 0) {
        Swal.fire({ icon: 'info', title: 'Sin datos', text: 'No hay macros para optimizar.' });
        return;
    }

    // Factor de escala basado en energía: ajusta todo proporcionalmente
    var kcalMeta   = 4 * mC + 4 * mP + 9 * mG;
    var kcalActual = 4 * C  + 4 * P  + 9 * G;
    var k = kcalMeta / kcalActual;

    // Limitar a rango razonable para evitar porciones absurdas
    var kLimitado = k !== Math.min(Math.max(k, 0.35), 3.0);
    var kClamp = Math.min(Math.max(k, 0.35), 3.0);

    if (Math.abs(kClamp - 1) < 0.02) {
        Swal.fire({ icon: 'success', title: '¡El plan ya está optimizado!', text: 'Las porciones actuales están muy cerca de las metas. No es necesario ajustar.' });
        return;
    }

    // Proyectar nuevas porciones y macros
    var proyeccion = p.alimentos.map(function (a) {
        return {
            id: a.id,
            nombre: a.nombre,
            categoria: a.categoria,
            macrogrupo: a.macrogrupo,
            id_bd: a.id_bd,
            factor_coccion: a.factor_coccion,
            porcionActual: a.porcion_g,
            porcionNueva: +(a.porcion_g * kClamp).toFixed(1),
            carb:    +(a.carb    * kClamp).toFixed(2),
            prot:    +(a.prot    * kClamp).toFixed(2),
            grasa:   +(a.grasa   * kClamp).toFixed(2),
            fibra:   +(a.fibra   * kClamp).toFixed(2),
            energia: +(a.energia * kClamp).toFixed(2)
        };
    });

    var nuevoCarb   = +(C               * kClamp).toFixed(2);
    var nuevoProt   = +(P               * kClamp).toFixed(2);
    var nuevoGrasa  = +(G               * kClamp).toFixed(2);
    var nuevaFibra  = +(p.totales.fibra  * kClamp).toFixed(2);
    var nuevaEnergia= +(p.totales.energia* kClamp).toFixed(2);

    var pctCarbNueva  = mC > 0 ? nuevoCarb  / mC * 100 : 100;
    var pctProtNueva  = mP > 0 ? nuevoProt  / mP * 100 : 100;
    var pctGrasaNueva = mG > 0 ? nuevoGrasa / mG * 100 : 100;
    var pctCarbActual = mC > 0 ? (C / mC * 100).toFixed(0) : '—';
    var pctProtActual = mP > 0 ? (P / mP * 100).toFixed(0) : '—';
    var pctGrasActual = mG > 0 ? (G / mG * 100).toFixed(0) : '—';

    // Detectar advertencias
    var advertencias = [];
    var parEliminar = [];
    proyeccion.forEach(function (item) {
        if (item.porcionNueva < 15) parEliminar.push(item.nombre + ' (' + item.porcionNueva + 'g)');
        else if (item.porcionNueva > 600) advertencias.push('⚠️ <strong>' + item.nombre + '</strong> quedaría con ' + item.porcionNueva + 'g, revisá si es razonable.');
    });
    if (parEliminar.length > 0)
        advertencias.unshift('⚠️ Estos alimentos quedarían con menos de 15g, te recomendamos eliminarlos:<br><ul style="text-align:left;margin:0.3rem 0 0 1rem;padding:0;">' +
            parEliminar.map(function (s) { return '<li>' + s + '</li>'; }).join('') + '</ul>');
    if (pctCarbNueva  < 78) advertencias.push('🌾 CHO quedaría al '   + pctCarbNueva.toFixed(0)  + '% — considerá agregar un alimento fuente de carbohidratos.');
    if (pctProtNueva  < 78) advertencias.push('💪 Proteínas quedarían al ' + pctProtNueva.toFixed(0) + '% — considerá agregar una fuente proteica.');
    if (pctGrasaNueva < 78) advertencias.push('🥑 Grasas quedarían al ' + pctGrasaNueva.toFixed(0) + '% — considerá agregar una fuente de grasas saludables.');
    if (kLimitado)          advertencias.push('⚙️ El factor fue limitado a ' + kClamp.toFixed(2) + 'x para evitar porciones extremas (ideal: ' + k.toFixed(2) + 'x). Puede que necesites revisar la selección de alimentos.');

    // Tabla antes/después
    var filas = proyeccion.map(function (item) {
        var diff  = item.porcionNueva - item.porcionActual;
        var color = diff > 0 ? '#2d7a50' : '#c0392b';
        var flecha = diff > 0 ? '⬆' : '⬇';
        var flag  = item.porcionNueva < 15 ? ' ⚠️' : '';
        return '<tr style="border-bottom:1px solid #eee;">' +
            '<td style="text-align:left;padding:0.35rem 0.5rem;font-size:0.83rem;">' + item.nombre + flag + '</td>' +
            '<td style="padding:0.35rem 0.5rem;font-size:0.83rem;color:#555;">' + item.porcionActual + 'g</td>' +
            '<td style="padding:0.35rem 0.5rem;font-size:0.83rem;font-weight:700;color:' + color + ';">' + flecha + ' ' + item.porcionNueva + 'g</td>' +
            '</tr>';
    }).join('');

    var html =
        '<div style="margin-bottom:0.6rem;font-size:0.82rem;color:#555;">' +
        'Factor de ajuste: <strong>' + kClamp.toFixed(2) + 'x</strong>' +
        '</div>' +
        '<div style="overflow-x:auto;">' +
        '<table style="width:100%;border-collapse:collapse;margin-bottom:0.85rem;">' +
        '<thead><tr style="background:#f0f7f4;">' +
        '<th style="padding:0.35rem 0.5rem;text-align:left;font-size:0.82rem;">Alimento</th>' +
        '<th style="padding:0.35rem 0.5rem;font-size:0.82rem;">Actual</th>' +
        '<th style="padding:0.35rem 0.5rem;font-size:0.82rem;">Nuevo</th>' +
        '</tr></thead><tbody>' + filas + '</tbody></table></div>' +
        '<div style="font-size:0.82rem;margin-bottom:' + (advertencias.length ? '0.75rem' : '0') + ';">' +
        '<span style="margin-right:0.75rem;">🌾 CHO: <strong>' + pctCarbActual + '%</strong> → <strong style="color:#2d7a50">' + pctCarbNueva.toFixed(0) + '%</strong></span>' +
        '<span style="margin-right:0.75rem;">💪 Prot: <strong>' + pctProtActual + '%</strong> → <strong style="color:#2d7a50">' + pctProtNueva.toFixed(0) + '%</strong></span>' +
        '<span>🥑 Grasa: <strong>' + pctGrasActual + '%</strong> → <strong style="color:#2d7a50">' + pctGrasaNueva.toFixed(0) + '%</strong></span>' +
        '</div>' +
        (advertencias.length
            ? '<div style="background:#fff8e1;border-radius:8px;padding:0.6rem 0.75rem;font-size:0.81rem;color:#7a5800;text-align:left;">' +
              advertencias.join('<br>') + '</div>'
            : '');

    Swal.fire({
        title: '⚡ Optimizar porciones',
        html: html,
        icon: 'info',
        showCancelButton: true,
        confirmButtonText: '✅ Aplicar cambios',
        cancelButtonText: '❌ Mantener actuales',
        confirmButtonColor: '#006c49',
        cancelButtonColor: '#6c757d',
        width: '580px'
    }).then(function (r) {
        if (!r.isConfirmed) return;

        proyeccion.forEach(function (item) {
            var idx = gpPlanGenerado.alimentos.findIndex(function (a) { return a.id === item.id; });
            if (idx === -1) return;
            var a = gpPlanGenerado.alimentos[idx];
            gpPlanGenerado.alimentos[idx] = {
                id: a.id, id_bd: item.id_bd, nombre: a.nombre,
                categoria: item.categoria, macrogrupo: item.macrogrupo,
                porcion_g: item.porcionNueva,
                factor_coccion: item.factor_coccion,
                carb: item.carb, prot: item.prot, grasa: item.grasa,
                fibra: item.fibra, energia: item.energia
            };
        });

        gpPlanGenerado.totales = {
            carb: nuevoCarb, prot: nuevoProt, grasa: nuevoGrasa,
            fibra: nuevaFibra, energia: nuevaEnergia
        };

        gpRenderResultados();
        gpShowToast('⚡ Porciones optimizadas correctamente');
    });
}

function gpEliminarAlimento(id) {
    Swal.fire({
        title: '¿Eliminar alimento?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
    }).then(function (r) {
        if (!r.isConfirmed) return;
        gpPlanGenerado.alimentos = gpPlanGenerado.alimentos.filter(function (a) { return a.id !== id; });
        delete gpPlanGenerado.estadoAlimentos[id];
        delete gpPlanGenerado.panelCambio[id];
        var carbT = 0, protT = 0, grasT = 0, fibrT = 0, enT = 0;
        gpPlanGenerado.alimentos.forEach(function (al) {
            carbT += al.carb; protT += al.prot;
            grasT += al.grasa; fibrT += al.fibra; enT += al.energia;
        });
        gpPlanGenerado.totales = {
            carb: +carbT.toFixed(2), prot: +protT.toFixed(2),
            grasa: +grasT.toFixed(2), fibra: +fibrT.toFixed(2), energia: +enT.toFixed(2)
        };
        gpRenderResultados();
        gpShowToast("🗑️ Alimento eliminado del plan");
    });
}

function gpEditarPorcionPlan(idAlimento, nuevaPorcionDisplay) {
    // nuevaPorcionDisplay: gramos tal como el usuario los ve
    // (cocidos si factor_coccion > 1, brutos si factor_coccion = 1)
    if (isNaN(nuevaPorcionDisplay)) return;
    if (nuevaPorcionDisplay < 1) nuevaPorcionDisplay = 1;
    if (nuevaPorcionDisplay > 1500) nuevaPorcionDisplay = 1500;

    var idx = gpPlanGenerado.alimentos.findIndex(function (a) { return a.id === idAlimento; });
    if (idx === -1) return;
    var a = gpPlanGenerado.alimentos[idx];

    var factorCoccion = a.factor_coccion || 1.0;
    // Convertir display → peso bruto (lo que se usa para calcular nutrientes)
    var porcionBruta = factorCoccion > 1
        ? +(nuevaPorcionDisplay / factorCoccion).toFixed(2)
        : nuevaPorcionDisplay;

    var base = gpTodosAlimentos.find(function (t) { return t.Id_Alimento === (a.id_bd || a.id); });
    var fc;
    if (!base) {
        // Los nutrientes actuales ya tienen FC incorporado (vinieron del servidor).
        // Derivamos la densidad efectiva por gramo bruto directo.
        var factor100 = a.porcion_g > 0 ? 100 / a.porcion_g : 1;
        base = {
            Carbohidratos_g: +(a.carb * factor100).toFixed(4),
            Proteina_g:      +(a.prot * factor100).toFixed(4),
            Grasa_g:         +(a.grasa * factor100).toFixed(4),
            Fibra_g:         +(a.fibra * factor100).toFixed(4),
            Energia_kcal:    +(a.energia * factor100).toFixed(4),
            Fraccion_Comestible: 1.0  // FC ya está incorporada en los valores derivados
        };
        fc = 1.0;
    } else {
        fc = base.Fraccion_Comestible !== undefined ? base.Fraccion_Comestible : 1.0;
    }

    var porcionComestible = porcionBruta * fc;

    gpPlanGenerado.alimentos[idx] = {
        id: a.id, id_bd: a.id_bd, nombre: a.nombre, categoria: a.categoria, macrogrupo: a.macrogrupo,
        porcion_g: +porcionBruta.toFixed(1),
        factor_coccion: factorCoccion,
        carb:    +((base.Carbohidratos_g / 100) * porcionComestible).toFixed(2),
        prot:    +((base.Proteina_g      / 100) * porcionComestible).toFixed(2),
        grasa:   +((base.Grasa_g         / 100) * porcionComestible).toFixed(2),
        fibra:   +((base.Fibra_g         / 100) * porcionComestible).toFixed(2),
        energia: +((base.Energia_kcal    / 100) * porcionComestible).toFixed(2)
    };
    gpPlanGenerado.estadoAlimentos[gpPlanGenerado.alimentos[idx].id] = gpPlanGenerado.estadoAlimentos[a.id];
    var carbT = 0, protT = 0, grasT = 0, fibrT = 0, enT = 0;
    gpPlanGenerado.alimentos.forEach(function (al) {
        carbT += al.carb; protT += al.prot;
        grasT += al.grasa; fibrT += al.fibra; enT += al.energia;
    });
    gpPlanGenerado.totales = {
        carb: +carbT.toFixed(2), prot: +protT.toFixed(2),
        grasa: +grasT.toFixed(2), fibra: +fibrT.toFixed(2), energia: +enT.toFixed(2)
    };
    gpRenderResultados();
}

function gpSeleccionarCategoria(id, categoria) {
    gpPlanGenerado.panelCambio[id] = categoria;
    gpRenderResultados();
}

function gpEjecutarCambio(idInterno) {
    var categoriaNueva = gpPlanGenerado.panelCambio[idInterno];
    if (!categoriaNueva) { gpShowToast("⚠️ Seleccioná una categoría primero"); return; }

    var tipo = $.cookie("GLBTYP");
    var id = (tipo === "A" || tipo === "M") ? ($("#hdnIdUsuario").val() || "0") : $.cookie("GLBUNI");

    var alOriginal = gpPlanGenerado.alimentos.find(function (a) { return a.id === idInterno; });
    var idBDOriginal = alOriginal ? (alOriginal.id_bd || 0) : 0;

    var carbConf = 0, protConf = 0, grasConf = 0, fibrConf = 0;
    gpPlanGenerado.alimentos.forEach(function (a) {
        if (gpPlanGenerado.estadoAlimentos[a.id] === "confirmed") {
            carbConf += a.carb; protConf += a.prot; grasConf += a.grasa; fibrConf += a.fibra;
        }
    });

    var idsEnPlan = gpPlanGenerado.alimentos.map(function (a) { return a.id_bd || a.id; }).join(",");
    var idsFiltro = gpFiltroActivo ? Object.keys(gpFiltroSeleccionados).join(",") : "";

    var esVegano = document.getElementById("gpToggleVegano") && document.getElementById("gpToggleVegano").checked ? "1" : "0";

    var params = JSON.stringify({
        'obj_Parametros_JS': [
            id.toString(), gpSelectedMeal, categoriaNueva, idBDOriginal.toString(),
            idsEnPlan, idsFiltro,
            Math.max(0, gpPlanGenerado.metas.carb - carbConf).toString(),
            Math.max(0, gpPlanGenerado.metas.prot - protConf).toString(),
            Math.max(0, gpPlanGenerado.metas.grasa - grasConf).toString(),
            Math.max(0, gpPlanGenerado.metas.fibra - fibrConf).toString(),
            esVegano
        ]
    });

    $.ajax({
        type: "POST",
        url: "frmGeneradorPlan.aspx/CambiarAlimento",
        data: params,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (msg) {
            if (!msg.d || msg.d.indexOf("Error") > -1) {
                gpShowToast("⚠️ No hay más alimentos de esa categoría");
                return;
            }
            try {
                var nuevo = JSON.parse(msg.d);
                var idx = gpPlanGenerado.alimentos.findIndex(function (a) { return a.id === idInterno; });

                delete gpPlanGenerado.estadoAlimentos[idInterno];
                delete gpPlanGenerado.panelCambio[idInterno];

                var nuevoItem = {
                    id: nuevo.Id_Alimento, id_bd: nuevo.Id_Alimento,
                    nombre: nuevo.Nombre, categoria: nuevo.Categoria, macrogrupo: nuevo.Macrogrupo || "",
                    porcion_g: nuevo.Porcion_g,
                    factor_coccion: nuevo.Factor_Coccion || 1.0,
                    carb: nuevo.Carbohidratos_g, prot: nuevo.Proteina_g,
                    grasa: nuevo.Grasa_g, fibra: nuevo.Fibra_g, energia: nuevo.Energia_kcal
                };

                gpPlanGenerado.alimentos[idx] = nuevoItem;
                gpPlanGenerado.estadoAlimentos[nuevoItem.id] = null;

                var carbT = 0, protT = 0, grasT = 0, fibrT = 0, enT = 0;
                gpPlanGenerado.alimentos.forEach(function (a) {
                    carbT += a.carb; protT += a.prot; grasT += a.grasa; fibrT += a.fibra; enT += a.energia;
                });
                gpPlanGenerado.totales = {
                    carb: +carbT.toFixed(2), prot: +protT.toFixed(2),
                    grasa: +grasT.toFixed(2), fibra: +fibrT.toFixed(2), energia: +enT.toFixed(2)
                };

                gpRenderResultados();
                gpShowToast("✅ Cambiado por: " + nuevoItem.nombre);
            } catch (e) {
                gpShowToast("❌ Error al procesar el cambio");
            }
        },
        error: function () { gpShowToast("❌ Error de conexión"); }
    });
}

/* ============================================================
   TRAER DISTRIBUCIÓN DE ÚLTIMA CITA
   ============================================================ */
function gpTraerDistribucionCita() {
    if (!gpSelectedMeal) { gpShowToast("⚠️ Seleccioná un tiempo de comida primero"); return; }

    var tipo = $.cookie("GLBTYP");
    var id = (tipo === "A" || tipo === "M") ? ($("#hdnIdUsuario").val() || "0") : $.cookie("GLBUNI");
    if (!id || id === "0") { gpShowToast("⚠️ Seleccioná un usuario primero"); return; }

    Swal.fire({ title: 'Buscando distribución...', allowOutsideClick: false,
        showConfirmButton: false, willOpen: function () { Swal.showLoading(); } });

    $.ajax({
        type: "POST",
        url: "frmGeneradorPlan.aspx/ObtenerDistribucionUltimaCita",
        data: JSON.stringify({ 'obj_Parametros_JS': [id.toString(), gpSelectedMeal] }),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (msg) {
            Swal.close();
            if (!msg || !msg.d) {
                Swal.fire({ icon: "error", title: "Error", text: "Respuesta inesperada del servidor." });
                return;
            }
            var a = msg.d.split("<SPLITER>");
            if (a[0] === "0") {
                Swal.fire({ icon: "warning", title: "Sin datos", text: a[1] });
                return;
            }
            var cho   = parseFloat(a[1]) || 0;
            var prot  = parseFloat(a[2]) || 0;
            var grasa = parseFloat(a[3]) || 0;
            var fibra = parseFloat(a[4]) || 0;
            var fecha = a[5] || "";
            var kcal  = Math.round((cho * 4) + (prot * 4) + (grasa * 9));

            document.getElementById("gpMetaCarb").value = cho;
            document.getElementById("gpMetaProt").value = prot;
            document.getElementById("gpMetaGras").value = grasa;
            document.getElementById("gpMetaFibr").value = fibra;
            gpMetaKcalPlan = kcal;  // guardar para comparación en sidebar
            gpActualizarMetaKcal();

            Swal.fire({
                icon: "success",
                title: "Distribución cargada",
                html: "Cita del <strong>" + fecha + "</strong><br>" +
                      "CHO: " + cho + "g &nbsp;|&nbsp; Prot: " + prot + "g &nbsp;|&nbsp; Grasa: " + grasa + "g &nbsp;|&nbsp; Fibra: " + fibra + "g<br>" +
                      "<strong style='color:#4e9a42;'>⚡ " + kcal + " kcal</strong>",
                timer: 3500,
                showConfirmButton: false
            });
        },
        error: function () {
            Swal.close();
            Swal.fire({ icon: "error", title: "Error de conexión", text: "No se pudo contactar el servidor." });
        }
    });
}

/* ============================================================
   CONFIRMAR PLAN FINAL — dos acciones separadas
   ============================================================ */
function gpConfirmarPlan() {
    if (!gpPlanGenerado) return;
    gpPlanConfirmado = JSON.parse(JSON.stringify(gpPlanGenerado));
}

function gpConfirmarYGenerarIA() {
    if (!gpPlanGenerado) return;
    gpConfirmarPlan();

    $('.gp-tab-btn').removeClass('active');
    $('.gp-tab-panel').removeClass('active');
    $('[data-tab="recetas"]').addClass('active');
    $('#tab-recetas').addClass('active');

    gpRenderIAPanel();
    gpShowToast("✅ Plan confirmado");
}

function gpConfirmarYEnviarCorreo() {
    if (!gpPlanGenerado) return;
    gpConfirmarPlan();

    var tipo = $.cookie("GLBTYP");
    var idUsuario = (tipo === "A" || tipo === "M") ? ($("#hdnIdUsuario").val() || "0") : $.cookie("GLBUNI");
    if (!idUsuario || idUsuario === "0") { gpShowToast("⚠️ No hay usuario seleccionado"); return; }

    var planJSON = JSON.stringify({
        tiempo: gpPlanConfirmado.tiempo,
        alimentos: gpPlanConfirmado.alimentos,
        totales: gpPlanConfirmado.totales,
        metas: gpPlanConfirmado.metas
    });

    Swal.fire({ title: 'Enviando plan...', allowOutsideClick: false,
        showConfirmButton: false, willOpen: function () { Swal.showLoading(); } });

    $.ajax({
        type: "POST",
        url: "frmGeneradorPlan.aspx/EnviarPlanPorCorreo",
        data: JSON.stringify({ 'obj_Parametros_JS': [idUsuario.toString(), "0", gpPlanConfirmado.tiempo, planJSON] }),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (msg) {
            Swal.close();
            var a = msg.d.split("<SPLITER>");
            if (a[0] === "1") {
                Swal.fire({ icon: "success", title: "¡Enviado!", text: a[1],
                    timer: 2500, showConfirmButton: false });
            } else {
                Swal.fire({ icon: "error", title: "Error", text: a[1] });
            }
        },
        error: function () {
            Swal.close();
            Swal.fire({ icon: "error", title: "Error", text: "No se pudo enviar el correo." });
        }
    });
}

/* ============================================================
   ACUMULAR PLAN Y PREGUNTAR SI CONTINUAR
   ============================================================ */
function gpAcumularPlan() {
    if (!gpPlanGenerado) return;
    gpConfirmarPlan();

    // Guardar copia profunda con el tiempo de comida
    var planCopia = JSON.parse(JSON.stringify(gpPlanConfirmado));
    gpPlanesAcumulados.push(planCopia);

    // Marcar el botón del tiempo de comida como completado
    gpMealTimesUsados[gpSelectedMeal] = true;
    document.querySelectorAll(".gp-meal-btn").forEach(function (b) {
        if (b.dataset.meal === gpSelectedMeal) b.classList.add("gp-meal-done");
    });

    // Renderizar acumulado en sidebar
    gpRenderSidebarAcumulado();

    var nombre = gpSelectedMeal.replace("AM", " AM").replace("PM", " PM");
    var cantAcum = gpPlanesAcumulados.length;

    // Tiempos restantes (los que no fueron usados aún)
    var GP_TODOS_TIEMPOS = [
        { key: "Desayuno",   label: "Desayuno"    },
        { key: "MeriendaAM", label: "Merienda AM" },
        { key: "Almuerzo",   label: "Almuerzo"    },
        { key: "MeriendaPM", label: "Merienda PM" },
        { key: "Cena",       label: "Cena"        }
    ];
    var restantes = GP_TODOS_TIEMPOS.filter(function (t) { return !gpMealTimesUsados[t.key]; });

    if (restantes.length === 0) {
        // Ya generamos todos los tiempos — ir directo a enviar
        gpEnviarTodosLosPlanes();
        return;
    }

    // Construir tarjetas de tiempos disponibles para el picker
    var mealCards = restantes.map(function (t) {
        return '<button class="gp-swal-meal-btn" data-meal="' + t.key + '"' +
            ' style="display:flex;align-items:center;gap:10px;width:100%;text-align:left;' +
            'background:#f8faf8;border:2px solid #dee2e6;border-radius:10px;' +
            'padding:11px 16px;margin-bottom:8px;cursor:pointer;' +
            'font-size:14px;font-weight:600;color:#131b2e;transition:border-color 0.15s;"' +
            ' onmouseover="this.style.borderColor=\'#006c49\'"' +
            ' onmouseout="this.style.borderColor=\'#dee2e6\'">' +
            gpMealIconHtml(t.key, 20) +
            '<span>' + t.label + '</span>' +
            '</button>';
    }).join("");

    var resumenAcum = '<div style="background:#e8f5e9;border-radius:8px;padding:8px 12px;margin-bottom:14px;font-size:13px;color:#2e7d32;">' +
        '✅ <strong>' + cantAcum + '</strong> tiempo' + (cantAcum > 1 ? 's' : '') + ' guardado' + (cantAcum > 1 ? 's' : '') + ': ' +
        gpPlanesAcumulados.map(function (p) { return p.tiempo.replace('AM', ' AM').replace('PM', ' PM'); }).join(', ') +
        '</div>';

    Swal.fire({
        title: '✅ Plan de ' + nombre + ' guardado',
        html: resumenAcum +
            '<p style="font-size:13px;color:#6b7280;margin:0 0 12px;">¿Qué tiempo de comida generamos ahora?</p>' +
            '<div style="text-align:left;">' + mealCards + '</div>',
        showConfirmButton: false,
        showCancelButton: true,
        cancelButtonText: '📧 Enviar ' + cantAcum + ' plan' + (cantAcum > 1 ? 'es' : '') + ' por correo',
        cancelButtonColor: '#6366f1',
        showCloseButton: true,
        didOpen: function () {
            lucide.createIcons();
            Swal.getHtmlContainer().querySelectorAll('.gp-swal-meal-btn').forEach(function (btn) {
                btn.addEventListener('click', function () {
                    var mealKey = btn.dataset.meal;
                    Swal.close();

                    // Resetear el generador
                    document.getElementById("gpConfirmarDiv").style.display = "none";
                    document.getElementById("gpResultados").innerHTML = "";
                    document.getElementById("gpSidebarCurrent").innerHTML = "";
                    document.getElementById("gpMacrosCard").style.display = "none";
                    document.getElementById("gpPanelAgregar").style.display = "none";
                    document.getElementById("gpPlanWrapper").style.display = "none";
                    gpPlanGenerado = null;
                    gpMetaKcalPlan = 0;

                    // Auto-seleccionar el tiempo de comida elegido
                    var mealBtn = document.querySelector('.gp-meal-btn[data-meal="' + mealKey + '"]');
                    if (mealBtn) {
                        gpSelectMeal(mealBtn);
                        gpRenderSidebarAcumulado(); // mover acumulados al sidebar
                        // Scroll suave al card de macros
                        var macrosCard = document.getElementById("gpMacrosCard");
                        if (macrosCard) macrosCard.scrollIntoView({ behavior: "smooth", block: "start" });
                    }
                });
            });
        }
    }).then(function (r) {
        // Botón cancelar = enviar por correo
        if (r.isDismissed && r.dismiss === Swal.DismissReason.cancel) {
            gpEnviarTodosLosPlanes();
        }
        // dismiss === 'close' (X) → no hacer nada, el usuario cierra y ve la pantalla
    });
}

function gpBuildAcumuladoCardsHtml(esCenter) {

    var cant = gpPlanesAcumulados.length;
    var cardsHtml = "";

    gpPlanesAcumulados.forEach(function (p) {
        var nombre = p.tiempo.replace("AM", " AM").replace("PM", " PM");
        var maxNameWidth = esCenter ? "200px" : "140px";

        var alimentosList = (p.alimentos || []).map(function (a) {
            return '<div style="display:flex;justify-content:space-between;align-items:center;padding:2px 0;font-size:0.74rem;">' +
                '<span style="color:#374151;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:' + maxNameWidth + ';" title="' + a.nombre + '">' + a.nombre + '</span>' +
                '<span style="color:#006c49;font-weight:700;white-space:nowrap;margin-left:4px;">' + a.porcion_g + 'g</span>' +
                '</div>';
        }).join("");

        cardsHtml += '<div style="background:#fff;border-radius:10px;padding:12px 14px;box-shadow:0 1px 6px rgba(19,27,46,0.08);border-left:3px solid #006c49;">' +
            '<div style="display:flex;align-items:center;gap:6px;margin-bottom:8px;">' +
            gpMealIconHtml(p.tiempo, 18) +
            '<span style="font-weight:700;font-size:0.85rem;color:#131b2e;">' + nombre + '</span>' +
            '<span style="margin-left:auto;font-size:0.75rem;font-weight:700;color:#6366f1;">⚡ ' + p.totales.energia + ' kcal</span>' +
            '</div>' +
            '<div style="border-top:1px solid #f3f4f6;padding-top:6px;">' + alimentosList + '</div>' +
            '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:8px;padding-top:6px;border-top:1px solid #f3f4f6;">' +
            '<span style="font-size:0.7rem;background:#e8f5e9;color:#2e7d32;padding:1px 6px;border-radius:99px;font-weight:600;">🌾 ' + p.totales.carb + 'g</span>' +
            '<span style="font-size:0.7rem;background:#e3f2fd;color:#1565c0;padding:1px 6px;border-radius:99px;font-weight:600;">💪 ' + p.totales.prot + 'g</span>' +
            '<span style="font-size:0.7rem;background:#fff8e1;color:#f57f17;padding:1px 6px;border-radius:99px;font-weight:600;">🥑 ' + p.totales.grasa + 'g</span>' +
            '</div>' +
            '</div>';
    });

    var btnEnviar = '<button class="gp-btn gp-btn-primary" style="' + (esCenter ? 'margin-top:12px;' : 'width:100%;justify-content:center;margin-top:4px;') + '" onclick="gpEnviarTodosLosPlanes()">' +
        '📧 Enviar ' + cant + ' plan' + (cant > 1 ? 'es' : '') + ' por correo</button>';

    if (esCenter) {
        return '<div style="margin-bottom:0.5rem;">' +
            '<span style="font-size:0.75rem;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;">📦 Planes acumulados (' + cant + ')</span>' +
            '</div>' +
            '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:12px;">' +
            cardsHtml +
            '</div>' +
            btnEnviar;
    } else {
        return '<div style="font-size:0.75rem;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:0.4rem;">📦 Planes acumulados</div>' +
            '<div style="display:flex;flex-direction:column;gap:10px;">' + cardsHtml + '</div>' +
            btnEnviar;
    }
}

function gpRenderSidebarAcumulado() {
    var sidebar = document.getElementById("gpSidebarAcumulado");
    var center  = document.getElementById("gpAcumuladoCenter");

    if (gpPlanesAcumulados.length === 0) {
        sidebar.innerHTML = "";
        if (center) { center.innerHTML = ""; center.style.display = "none"; }
        return;
    }

    if (!gpSelectedMeal) {
        // Sin meal seleccionada → mostrar en el centro, ancho completo
        sidebar.innerHTML = "";
        if (center) {
            center.innerHTML = gpBuildAcumuladoCardsHtml(true);
            center.style.display = "block";
        }
    } else {
        // Meal seleccionada → mover al sidebar
        if (center) { center.innerHTML = ""; center.style.display = "none"; }
        sidebar.innerHTML = gpBuildAcumuladoCardsHtml(false);
    }
    lucide.createIcons();
}

function gpEnviarTodosLosPlanes() {
    if (gpPlanesAcumulados.length === 0) { gpShowToast("⚠️ No hay planes acumulados"); return; }

    var tipo = $.cookie("GLBTYP");
    var idUsuario = (tipo === "A" || tipo === "M") ? ($("#hdnIdUsuario").val() || "0") : $.cookie("GLBUNI");
    if (!idUsuario || idUsuario === "0") { gpShowToast("⚠️ No hay usuario seleccionado"); return; }

    var planesJSON = JSON.stringify(gpPlanesAcumulados.map(function (p) {
        return { tiempo: p.tiempo, alimentos: p.alimentos, totales: p.totales, metas: p.metas };
    }));

    Swal.fire({ title: 'Enviando planes...', allowOutsideClick: false,
        showConfirmButton: false, willOpen: function () { Swal.showLoading(); } });

    $.ajax({
        type: "POST",
        url: "frmGeneradorPlan.aspx/EnviarMultiplesPlansPorCorreo",
        data: JSON.stringify({ 'obj_Parametros_JS': [idUsuario.toString(), "0", planesJSON] }),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (msg) {
            Swal.close();
            var a = msg.d.split("<SPLITER>");
            if (a[0] === "1") {
                Swal.fire({ icon: "success", title: "¡Enviado!", text: a[1],
                    timer: 3000, showConfirmButton: false }).then(function () {
                    // Limpiar acumulado
                    gpPlanesAcumulados = [];
                    gpMealTimesUsados = {};
                    gpMetaKcalPlan = 0;
                    document.querySelectorAll(".gp-meal-btn").forEach(function (b) { b.classList.remove("gp-meal-done"); });
                    gpRenderSidebarAcumulado();
                    document.getElementById("gpPlanWrapper").style.display = "none";
                });
            } else {
                Swal.fire({ icon: "error", title: "Error", text: a[1] });
            }
        },
        error: function () {
            Swal.close();
            Swal.fire({ icon: "error", title: "Error", text: "No se pudo enviar el correo." });
        }
    });
}

/* ============================================================
   PANEL IA
   ============================================================ */
function gpRenderIAPanel() {
    if (!gpPlanConfirmado) return;
    var p = gpPlanConfirmado;
    var nombre = p.tiempo.replace("AM", " AM").replace("PM", " PM");

    var chips = p.alimentos.map(function (a) {
        var info = GP_MACROGRUPOS[a.macrogrupo] || GP_MACROGRUPOS[a.categoria] || { emoji: "🍽️" };
        return '<div class="gp-plan-chip">' + info.emoji + ' ' + a.nombre + ' <span>' + a.porcion_g + 'g</span></div>';
    }).join("");

    document.getElementById("gpIAContent").innerHTML =
        '<div class="gp-ia-card">' +
        '<div class="gp-ia-header">' +
        '<div class="gp-ia-icon">🤖</div>' +
        '<div><div class="gp-ia-title">Ideas de Comidas con IA</div>' +
        '<div class="gp-ia-sub">Plan de ' + nombre + ' · ' + p.totales.energia + ' kcal</div></div></div>' +
        '<div style="font-size:0.8rem;font-weight:700;color:#4a6a48;margin-bottom:0.4rem;">📦 Alimentos de tu plan:</div>' +
        '<div class="gp-plan-chips">' + chips + '</div>' +
        '<div style="display:flex;gap:0.75rem;margin-bottom:1.25rem;flex-wrap:wrap;">' +
        '<button class="gp-btn gp-btn-primary" onclick="gpPedirRecetaIA(false)">✨ Sugerirme una receta</button>' +
        '<button class="gp-btn gp-btn-outline" onclick="gpPedirRecetaIA(true)">🎲 Otra sugerencia</button>' +
        '</div>' +
        '<div id="gpIAResponse"><div class="gp-ia-empty">👨‍🍳 Hacé clic en <strong>Sugerirme una receta</strong> para comenzar.</div></div>' +
        '</div>';
}

function gpPedirRecetaIA(alterna) {
    if (!gpPlanConfirmado) return;
    var p = gpPlanConfirmado;
    var nombre = p.tiempo.replace("AM", " AM").replace("PM", " PM");
    var area = document.getElementById("gpIAResponse");

    area.innerHTML = '<div style="display:flex;align-items:center;gap:0.75rem;color:#7a9a78;padding:1rem;">' +
        '<div class="gp-spinner"></div> Generando receta...</div>';

    var lista = p.alimentos.map(function (a) {
        return "- " + a.nombre + " (" + a.porcion_g + "g): " +
            a.carb + "g carb, " + a.prot + "g prot, " + a.grasa + "g grasa, " + a.fibra + "g fibra";
    }).join("\n");

    var prompt = "Sos un nutricionista y chef. El usuario tiene el siguiente plan nutricional para " + nombre + ":\n\n" +
        "ALIMENTOS DEL PLAN (con gramos específicos):\n" + lista + "\n\n" +
        "TOTALES:\n" +
        "- Carbohidratos: " + p.totales.carb + "g (meta: " + p.metas.carb + "g)\n" +
        "- Proteínas: " + p.totales.prot + "g (meta: " + p.metas.prot + "g)\n" +
        "- Grasas: " + p.totales.grasa + "g (meta: " + p.metas.grasa + "g)\n" +
        "- Fibra: " + p.totales.fibra + "g (meta: " + p.metas.fibra + "g)\n" +
        "- Energía: " + p.totales.energia + " kcal\n\n" +
        (alterna ? "Proponé una receta DIFERENTE Y CREATIVA.\n\n" : "") +
        "Sugerí UNA receta concreta que use exactamente los alimentos indicados, sea fácil de preparar en casa y culturalmente apropiada para Costa Rica.\n\n" +
        "Formato:\n🍽️ NOMBRE DEL PLATO: [nombre]\n⏱️ TIEMPO: [tiempo]\n📝 PREPARACIÓN:\n[pasos numerados]\n💡 CONSEJO NUTRICIONAL: [consejo breve]";

    $.ajax({
        type: "POST",
        url: "frmGeneradorPlan.aspx/GenerarRecetaIA",
        data: JSON.stringify({ 'obj_Parametros_JS': [prompt] }),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (msg) {
            var res = msg.d;
            if (!res || res.indexOf("Error") > -1) {
                area.innerHTML = '<div style="color:#c0392b;padding:1rem;">❌ ' + (res || "Error al generar la receta") + '</div>';
                return;
            }
            // Guardar texto para poder enviarlo por correo
            gpUltimaReceta = res;
            area.innerHTML =
                '<div class="gp-ia-response">' + res.replace(/\n/g, '<br>') + '</div>' +
                '<div style="margin-top:0.75rem;">' +
                '<button class="gp-btn gp-btn-primary" onclick="gpEnviarRecetaPorCorreo()">' +
                '📧 Enviar receta por correo</button>' +
                '</div>';
        },
        error: function () {
            area.innerHTML = '<div style="color:#c0392b;padding:1rem;">❌ Error de conexión con el servidor.</div>';
        }
    });
}

/* ============================================================
   ENVIAR RECETA POR CORREO
   ============================================================ */
var gpUltimaReceta = "";

function gpEnviarRecetaPorCorreo() {
    if (!gpUltimaReceta) { gpShowToast("⚠️ No hay receta generada"); return; }

    var tipo = $.cookie("GLBTYP");
    var idUsuario = (tipo === "A" || tipo === "M") ? ($("#hdnIdUsuario").val() || "0") : $.cookie("GLBUNI");
    if (!idUsuario || idUsuario === "0") { gpShowToast("⚠️ No hay usuario seleccionado"); return; }

    Swal.fire({ title: 'Enviando receta...', allowOutsideClick: false,
        showConfirmButton: false, willOpen: function () { Swal.showLoading(); } });

    $.ajax({
        type: "POST",
        url: "frmGeneradorPlan.aspx/EnviarRecetaPorCorreo",
        data: JSON.stringify({ 'obj_Parametros_JS': [idUsuario.toString(), "0", gpUltimaReceta] }),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (msg) {
            Swal.close();
            var a = msg.d.split("<SPLITER>");
            if (a[0] === "1") {
                Swal.fire({ icon: "success", title: "¡Enviada!", text: a[1],
                    timer: 2500, showConfirmButton: false });
            } else {
                Swal.fire({ icon: "error", title: "Error", text: a[1] });
            }
        },
        error: function () {
            Swal.close();
            Swal.fire({ icon: "error", title: "Error", text: "No se pudo enviar el correo." });
        }
    });
}





/* ============================================================
   AGREGAR ALIMENTO AL PLAN
   ============================================================ */
var gpAgregarPanel = {
    categoriaSeleccionada: null,
    alimentoSeleccionado: null,
    busqueda: ""
};

function gpAbrirAgregarAlimento() {
    if (!gpPlanGenerado) {
        gpShowToast("⚠️ Primero generá un plan");
        return;
    }

    var panel = document.getElementById("gpPanelAgregar");
    if (!panel) return;

    if (panel.style.display === "block") {
        panel.style.display = "none";
        gpAgregarPanel.categoriaSeleccionada = null;
        gpAgregarPanel.alimentoSeleccionado = null;
        gpAgregarPanel.busqueda = "";
        return;
    }

    panel.style.display = "block";
    
    // Si los alimentos no se han cargado aún, cargarlos primero
    if (!gpTodosAlimentos || gpTodosAlimentos.length === 0) {
        panel.innerHTML = '<div class="gp-result-card"><div style="text-align:center;padding:2rem;color:#7a9a78;"><div class="gp-spinner"></div><p style="margin-top:0.5rem;">Cargando alimentos...</p></div></div>';
        
        var params = JSON.stringify({ 'obj_Parametros_JS': [] });
        $.ajax({
            type: "POST",
            url: "frmGeneradorPlan.aspx/ObtenerListaAlimentosJSON",
            data: params,
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function (msg) {
                try {
                    var response = msg.d;
                    if (response && response.indexOf && response.indexOf("AUTH<SPLITER>") === 0) {
                        window.location.href = "/Login/frmInicioSesion.aspx";
                        return;
                    }
                    gpTodosAlimentos = JSON.parse(response);
                    gpListaCargada = true;
                    gpRefreshAgregarPanel();
                } catch (e) {
                    panel.innerHTML = '<div class="gp-result-card"><div style="color:#c0392b;padding:1rem;">Error al cargar alimentos: ' + (msg.d || e.message) + '</div></div>';
                }
            },
            error: function (xhr, status, error) {
                panel.innerHTML = '<div class="gp-result-card"><div style="color:#c0392b;padding:1rem;">Error de conexión</div></div>';
            }
        });
    } else {
        gpRefreshAgregarPanel();
    }
    
    panel.scrollIntoView({ behavior: "smooth", block: "start" });
}

function gpBuildAgregarPanelHtml() {
    var listaHtml = gpBuildListaAlimentosAgregar();
    var alimentoSelHtml = gpAgregarPanel.alimentoSeleccionado ? gpBuildAlimentoSeleccionadoHtml() : "";

    return '<div class="gp-result-card">' +
        '<div class="gp-result-header">' +
        '<div class="gp-result-title">➕ Agregar alimento al plan</div>' +
        '<button style="background:rgba(255,255,255,0.15);color:#fff;border:1px solid rgba(255,255,255,0.3);' +
        'border-radius:8px;padding:0.4rem 0.85rem;font-size:0.77rem;font-weight:700;cursor:pointer;" ' +
        'onclick="gpCerrarAgregarPanel()">✕ Cerrar</button>' +
        '</div>' +
        '<div class="gp-result-body">' +
        '<div style="font-size:0.82rem;font-weight:700;color:var(--ev-primary);margin-bottom:0.6rem;">1️⃣ Elegí el macrogrupo y el alimento</div>' +
        '<div class="gp-agregar-search-wrap">' +
        '<span class="gp-agregar-search-icon">🔍</span>' +
        '<input type="text" class="gp-agregar-search" id="gpAgregarSearchInput" ' +
        'placeholder="Buscar alimento por nombre..." ' +
        'oninput="gpAgregarBuscar(this.value)" ' +
        'value="' + (gpAgregarPanel.busqueda || "") + '">' +
        '</div>' +
        '<div id="gpListaAlimentosAgregar">' + listaHtml + '</div>' +
        '<div id="gpAlimentoSeleccionadoAgregar">' + alimentoSelHtml + '</div>' +
        '</div></div>';
}

function gpAgregarSeleccionarCat(cat) {
    gpAgregarPanel.categoriaSeleccionada = cat;
    gpAgregarPanel.alimentoSeleccionado = null;
    gpRefreshAgregarPanel();
}

function gpBuildListaAlimentosAgregar() {
    // Si ya hay un alimento seleccionado, ocultar la lista
    if (gpAgregarPanel.alimentoSeleccionado) return "";

    if (!gpTodosAlimentos || gpTodosAlimentos.length === 0) {
        return '<div style="color:#7a9a78;font-size:0.85rem;padding:0.5rem 0;">No hay alimentos cargados.</div>';
    }

    var idsEnPlan = gpPlanGenerado.alimentos.map(function (a) { return a.id_bd || a.id; });

    // Agrupar por Macrogrupo excluyendo los ya en el plan y filtrando por búsqueda
    var grupos = {};
    gpTodosAlimentos.forEach(function (a) {
        if (idsEnPlan.indexOf(a.Id_Alimento) !== -1) return;
        if (gpAgregarPanel.busqueda && a.Nombre.toLowerCase().indexOf(gpAgregarPanel.busqueda) === -1) return;
        var key = a.Macrogrupo || "Sin clasificar";
        if (!grupos[key]) grupos[key] = [];
        grupos[key].push(a);
    });

    if (Object.keys(grupos).length === 0) {
        return '<div style="color:#7a9a78;font-size:0.85rem;padding:0.5rem 0;">No hay más alimentos disponibles.</div>';
    }

    var html = "";
    Object.keys(grupos).forEach(function (cat) {
        var info = GP_MACROGRUPOS[cat] || { emoji: "🍽️", color: "#f0f0f0" };
        var items = grupos[cat];
        var estaAbierta = gpAgregarPanel.categoriaSeleccionada === cat || !!gpAgregarPanel.busqueda;

        html += '<div class="gp-food-group ' + (estaAbierta ? "open" : "") + '" style="margin-bottom:0.5rem;">';

        // Header acordeón
        html += '<div class="gp-fg-header" onclick="gpAgregarToggleCat(\'' + cat + '\')">';
        html += '<div class="gp-fg-left">';
        html += '<div class="gp-fg-icon" style="background:' + info.color + '">' + info.emoji + '</div>';
        html += '<div>';
        html += '<div class="gp-fg-title">' + cat + '</div>';
        html += '<div class="gp-fg-count">' + items.length + ' alimentos</div>';
        html += '</div></div>';
        html += '<span class="gp-fg-chevron">▾</span>';
        html += '</div>';

        // Body con alimentos
        html += '<div class="gp-fg-body"><div class="gp-fg-subcategory">';
        items.forEach(function (a) {
            html += '<div class="gp-add-item" onclick="gpAgregarSeleccionarAlimento(' + a.Id_Alimento + ')">';
            html += '<span class="gp-add-name">' + a.Nombre + '</span>';
            html += '<span class="gp-add-btn">+ Agregar</span>';
            html += '</div>';
        });
        html += '</div></div></div>';
    });

    return html;
}

function gpAgregarSeleccionarAlimento(idAlimento) {
    var alimento = gpTodosAlimentos.find(function (a) { return a.Id_Alimento === idAlimento; });
    if (!alimento) return;

    // Porción mínima = 25g (en gramos brutos)
    var nombreLower = alimento.Nombre.toLowerCase();
    var factorCoccionAgregar = (nombreLower.indexOf('arroz') >= 0 &&
        nombreLower.indexOf('cocido') < 0 && nombreLower.indexOf('precocido') < 0) ? 2.8 : 1.0;

    gpAgregarPanel.alimentoSeleccionado = {
        Id_Alimento: alimento.Id_Alimento,
        Nombre: alimento.Nombre,
        Categoria: alimento.Categoria,
        Macrogrupo: alimento.Macrogrupo || "",
        Proteina_g: alimento.Proteina_g,
        Grasa_g: alimento.Grasa_g,
        Carbohidratos_g: alimento.Carbohidratos_g,
        Fibra_g: alimento.Fibra_g,
        Energia_kcal: alimento.Energia_kcal,
        Fraccion_Comestible: alimento.Fraccion_Comestible !== undefined ? alimento.Fraccion_Comestible : 1.0,
        Factor_Coccion: factorCoccionAgregar,
        porcionActual: 25  // gramos brutos
    };

    gpRefreshAgregarPanel();
}

function gpBuildAlimentoSeleccionadoHtml() {
    var a = gpAgregarPanel.alimentoSeleccionado;
    if (!a) return "";

    var porcion = a.porcionActual;  // gramos brutos
    var fc = a.Fraccion_Comestible !== undefined ? a.Fraccion_Comestible : 1.0;
    var porcionComestible = porcion * fc;
    var carb  = +((a.Carbohidratos_g / 100) * porcionComestible).toFixed(2);
    var prot  = +((a.Proteina_g      / 100) * porcionComestible).toFixed(2);
    var gras  = +((a.Grasa_g         / 100) * porcionComestible).toFixed(2);
    var fibra = +((a.Fibra_g         / 100) * porcionComestible).toFixed(2);
    var ener  = +((a.Energia_kcal    / 100) * porcionComestible).toFixed(2);

    // Para arroz crudo: mostrar también la equivalencia cocida
    var fcCoccion = a.Factor_Coccion || 1.0;
    var displayPorcion = fcCoccion > 1
        ? porcion + 'g crudo ≈ ' + +(porcion * fcCoccion).toFixed(0) + 'g cocido'
        : porcion + 'g';

    var nuevoCarb = +(gpPlanGenerado.totales.carb + carb).toFixed(2);
    var nuevoProt = +(gpPlanGenerado.totales.prot + prot).toFixed(2);
    var nuevoGras = +(gpPlanGenerado.totales.grasa + gras).toFixed(2);
    var nuevoFibr = +(gpPlanGenerado.totales.fibra + fibra).toFixed(2);
    var nuevoEner = +(gpPlanGenerado.totales.energia + ener).toFixed(2);

    function deltaSpan(delta) {
        if (delta === 0) return '<span style="color:#7a9a78"> +0g</span>';
        var color = delta > 0 ? "#4e9a42" : "#e8913a";
        var signo = delta > 0 ? "+" : "";
        return '<span style="color:' + color + ';font-weight:700;"> ' + signo + delta + 'g</span>';
    }

    function barHtml(label, nuevo, meta, type) {
        type = type || 'macro';
        var rawPct = meta > 0 ? (nuevo / meta) * 100 : 0;
        var dev = Math.abs(rawPct - 100);
        var color;
        if (type === 'grasa') {
            color = dev <= 20 ? '#4e9a42' : (dev <= 35 ? '#f59e0b' : '#d9534f');
        } else {
            color = dev <= 10 ? '#4e9a42' : (dev <= 20 ? '#f59e0b' : '#d9534f');
        }
        var pctLabel = meta > 0 ? rawPct.toFixed(1) + "%" : "—";
        return '<div class="gp-bar-row">' +
            '<div class="gp-bar-label">' +
            '<span class="gp-bar-name">' + label + '</span>' +
            '<span>' +
            '<span style="color:#7a9a78">' + nuevo + 'g / ' + meta + 'g</span>' +
            ' <span class="gp-bar-pct" style="color:' + color + '">' + pctLabel + '</span>' +
            '</span>' +
            '</div>' +
            '<div class="gp-bar-track">' +
            '<div class="gp-bar-fill" style="width:' + Math.min(rawPct, 100) + '%;background:' + color + '"></div>' +
            '</div>' +
            '</div>';
    }

    return '<div style="margin-top:1rem;padding:1rem;background:#f6fbf4;border-radius:14px;border:2px solid #b3e0a6;">' +
        '<div style="font-size:0.82rem;font-weight:700;color:#4a6a48;margin-bottom:0.75rem;">3️⃣ Ajustá los gramos — <strong>' + a.Nombre + '</strong></div>' +

        // Controles porción
        '<div style="display:flex;align-items:center;gap:1rem;margin-bottom:1rem;flex-wrap:wrap;">' +
        '<div style="display:flex;align-items:center;gap:0.5rem;">' +
        '<button class="gp-btn gp-btn-outline gp-btn-sm" onclick="gpAgregarCambiarPorcion(-5)" ' +
        'style="width:36px;height:36px;font-size:1.1rem;font-weight:700;padding:0;display:flex;align-items:center;justify-content:center;">−</button>' +
        '<div style="min-width:110px;text-align:center;">' +
        '<input type="number" min="1" max="500" step="1" value="' + porcion + '" ' +
        'style="width:70px;font-size:1.3rem;font-weight:800;color:#2d5a27;text-align:center;border:1.5px solid #c8e6c9;border-radius:6px;padding:2px 4px;-moz-appearance:textfield;" ' +
        'onchange="gpAgregarSetPorcionDesdeInput(this.value)">' +
        '<div style="font-size:0.7rem;color:#7a9a78;">' + (fcCoccion > 1 ? '≈ ' + +(porcion * fcCoccion).toFixed(0) + 'g cocido' : 'g · porción') + '</div>' +
        '</div>' +
        '<button class="gp-btn gp-btn-outline gp-btn-sm" onclick="gpAgregarCambiarPorcion(5)" ' +
        'style="width:36px;height:36px;font-size:1.1rem;font-weight:700;padding:0;display:flex;align-items:center;justify-content:center;">+</button>' +
        '</div>' +

        // Tags macros aporte
        '<div style="display:flex;gap:0.4rem;flex-wrap:wrap;">' +
        '<span class="gp-macro-tag">🌾 ' + carb + 'g' + deltaSpan(carb) + '</span>' +
        '<span class="gp-macro-tag">💪 ' + prot + 'g' + deltaSpan(prot) + '</span>' +
        '<span class="gp-macro-tag">🥑 ' + gras + 'g' + deltaSpan(gras) + '</span>' +
        '<span class="gp-macro-tag">🌿 ' + fibra + 'g' + deltaSpan(fibra) + '</span>' +
        '<span class="gp-macro-tag">⚡ ' + ener + 'kcal</span>' +
        '</div></div>' +

        // Barras totales — igual que gpRenderResultados, sin position:absolute
        '<div style="margin-bottom:1rem;">' +
        '<div style="font-size:0.75rem;font-weight:700;color:#7a9a78;margin-bottom:0.5rem;text-transform:uppercase;letter-spacing:0.5px;">Cómo quedarían los totales:</div>' +
        barHtml("🌾 Carbohidratos", nuevoCarb, gpPlanGenerado.metas.carb, 'macro') +
        barHtml("💪 Proteínas", nuevoProt, gpPlanGenerado.metas.prot, 'macro') +
        barHtml("🥑 Grasas", nuevoGras, gpPlanGenerado.metas.grasa, 'grasa') +
        barHtml("🌿 Fibra", nuevoFibr, gpPlanGenerado.metas.fibra, 'macro') +
        '<div style="text-align:right;font-size:0.8rem;font-weight:700;color:#4e9a42;margin-top:0.3rem;">⚡ Energía total: ' + nuevoEner + ' kcal</div>' +
        '</div>' +

        // Botón agregar
        '<button class="gp-btn gp-btn-primary" onclick="gpConfirmarAgregarAlimento()" ' +
        'style="width:100%;justify-content:center;">✅ Agregar al plan</button>' +
        '</div>';
}

function gpAgregarCambiarPorcion(delta) {
    if (!gpAgregarPanel.alimentoSeleccionado) return;
    var nueva = gpAgregarPanel.alimentoSeleccionado.porcionActual + delta;
    if (nueva < 1) nueva = 1;
    if (nueva > 500) nueva = 500;
    gpAgregarPanel.alimentoSeleccionado.porcionActual = nueva;
    gpRefreshAgregarPanel();
}

function gpAgregarSetPorcionDesdeInput(val) {
    if (!gpAgregarPanel.alimentoSeleccionado) return;
    var n = parseFloat(val);
    if (isNaN(n) || n < 1) n = 1;
    if (n > 500) n = 500;
    gpAgregarPanel.alimentoSeleccionado.porcionActual = n;
    gpRefreshAgregarPanel();
}

function gpRefreshAgregarPanel() {
    var panel = document.getElementById("gpPanelAgregar");
    if (!panel) return;
    panel.innerHTML = gpBuildAgregarPanelHtml();
}

function gpConfirmarAgregarAlimento() {
    var a = gpAgregarPanel.alimentoSeleccionado;
    if (!a) return;

    var porcion = a.porcionActual;  // gramos brutos
    var fc = a.Fraccion_Comestible !== undefined ? a.Fraccion_Comestible : 1.0;
    var porcionComestible = porcion * fc;

    var nuevoItem = {
        id: a.Id_Alimento,
        id_bd: a.Id_Alimento,
        nombre: a.Nombre,
        categoria: a.Categoria,
        macrogrupo: a.Macrogrupo || "",
        porcion_g: porcion,
        factor_coccion: a.Factor_Coccion || 1.0,
        carb:    +((a.Carbohidratos_g / 100) * porcionComestible).toFixed(2),
        prot:    +((a.Proteina_g      / 100) * porcionComestible).toFixed(2),
        grasa:   +((a.Grasa_g         / 100) * porcionComestible).toFixed(2),
        fibra:   +((a.Fibra_g         / 100) * porcionComestible).toFixed(2),
        energia: +((a.Energia_kcal    / 100) * porcionComestible).toFixed(2)
    };

    gpPlanGenerado.alimentos.push(nuevoItem);
    gpPlanGenerado.estadoAlimentos[nuevoItem.id] = null;

    // Recalcular totales
    var carbT = 0, protT = 0, grasT = 0, fibrT = 0, enT = 0;
    gpPlanGenerado.alimentos.forEach(function (al) {
        carbT += al.carb; protT += al.prot; grasT += al.grasa;
        fibrT += al.fibra; enT += al.energia;
    });
    gpPlanGenerado.totales = {
        carb: +carbT.toFixed(2),
        prot: +protT.toFixed(2),
        grasa: +grasT.toFixed(2),
        fibra: +fibrT.toFixed(2),
        energia: +enT.toFixed(2)
    };

    // Reset panel y refrescar resultados
    gpAgregarPanel.categoriaSeleccionada = null;
    gpAgregarPanel.alimentoSeleccionado = null;
    gpRefreshAgregarPanel();
    gpRenderResultados();
    gpShowToast("✅ " + nuevoItem.nombre + " agregado al plan");
}

function gpCerrarAgregarPanel() {
    var panel = document.getElementById("gpPanelAgregar");
    if (panel) panel.style.display = "none";
    gpAgregarPanel.categoriaSeleccionada = null;
    gpAgregarPanel.alimentoSeleccionado = null;
    gpAgregarPanel.busqueda = "";
}

function gpAgregarBuscar(valor) {
    gpAgregarPanel.busqueda = valor.toLowerCase().trim();
    gpAgregarPanel.categoriaSeleccionada = null;
    var listaEl = document.getElementById("gpListaAlimentosAgregar");
    if (listaEl) listaEl.innerHTML = gpBuildListaAlimentosAgregar();
}




function gpCambiarPorcionPlan(idAlimento, delta) {
    // delta está en unidades de display (cocidos si factor_coccion > 1)
    var idx = gpPlanGenerado.alimentos.findIndex(function (a) { return a.id === idAlimento; });
    if (idx === -1) return;

    var a = gpPlanGenerado.alimentos[idx];
    var factorCoccion = a.factor_coccion || 1.0;
    var displayActual = factorCoccion > 1 ? +(a.porcion_g * factorCoccion).toFixed(1) : a.porcion_g;
    var nuevoDisplay = Math.max(1, displayActual + delta);

    gpEditarPorcionPlan(idAlimento, nuevoDisplay);
}




function gpAgregarToggleCat(cat) {
    // Si ya estaba abierta, la cierra; si no, la abre
    if (gpAgregarPanel.categoriaSeleccionada === cat) {
        gpAgregarPanel.categoriaSeleccionada = null;
    } else {
        gpAgregarPanel.categoriaSeleccionada = cat;
    }
    // Solo refrescar la lista, no todo el panel
    var lista = document.getElementById("gpListaAlimentosAgregar");
    if (lista) lista.innerHTML = gpBuildListaAlimentosAgregar();
}

/* ============================================================
   TOAST
   ============================================================ */
function gpShowToast(msg) {
    var t = document.getElementById("gpToast");
    t.textContent = msg;
    t.classList.add("show");
    setTimeout(function () { t.classList.remove("show"); }, 2800);
}