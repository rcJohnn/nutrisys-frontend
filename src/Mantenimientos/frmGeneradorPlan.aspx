<%@ Page Title="" Language="C#" MasterPageFile="~/Mantenimientos/frmPrincipalMaster.Master" AutoEventWireup="true" CodeBehind="frmGeneradorPlan.aspx.cs" Inherits="PL_CRUD_CONSULTAS.Mantenimientos.frmGeneradorPlan" %>

<asp:Content ID="Content1" ContentPlaceHolderID="head" runat="server">
    <link href="/Base/assets/css/stylegenerador.css" rel="stylesheet" />
</asp:Content>

<asp:Content ID="Content2" ContentPlaceHolderID="ContentPlaceHolder1" runat="server">

    <nav aria-label="breadcrumb">
        <ol class="breadcrumb my-breadcrumb">
            <li class="breadcrumb-item"><a href="frmPrincipal.aspx">Inicio</a></li>
            <li class="breadcrumb-item active" aria-current="page">Generador de Plan Nutricional</li>
        </ol>
    </nav>

    <div class="welcome-msg pt-3 pb-4">
        <h1>Hola <span class="text-primary" id="nombreUsuario"></span>, Bienvenido</h1>
        <p id="emlUsuario"></p>
    </div>

    <%-- SELECCIÓN DE USUARIO --%>
    <div class="card card_border py-2 mb-4" id="divSeleccionUsuario">
        <div class="cards__heading">
            <h3>Selección de Usuario <span></span></h3>
        </div>
        <div class="card-body">
            <div id="divComboUsuarios" style="display:none;">
                <div class="form-row">
                    <div class="form-group col-md-12">
                        <label class="input__label">Usuario *</label>
                        <input type="hidden" id="hdnIdUsuario" value="0">
                        <div class="gp-search-wrapper" style="position:relative;">
                            <input type="text" id="txtBuscarUsuario" class="form-control input-style"
                                placeholder="Buscá por nombre o apellido..." autocomplete="off"
                                oninput="gpFiltrarUsuarios(this.value)"
                                onfocus="gpFiltrarUsuarios(this.value)">
                            <div id="divResultadosUsuario" class="gp-search-results" style="display:none;"></div>
                        </div>
                        <div id="divUsuarioBadge" style="display:none; margin-top:8px;">
                            <span class="badge badge-pill"
                                style="background:var(--ev-primary,#006c49);color:#fff;font-size:0.85rem;padding:6px 12px;">
                                <i class="fa fa-user"></i>
                                <span id="lblUsuarioBadge"></span>
                                <a href="javascript:void(0)" onclick="gpLimpiarUsuario()"
                                    style="color:#fff;margin-left:8px;" title="Cambiar usuario">&times;</a>
                            </span>
                        </div>
                    </div>
                </div>
            </div>
            <div id="divInfoUsuarioFija" style="display:none;">
                <div class="alert alert-info" role="alert">
                    <strong>Generando plan para:</strong> <span id="lblUsuarioActual"></span>
                </div>
            </div>
            <div id="infoUsuario" style="display:none;">
                <div class="alert alert-info" role="alert">
                    <strong>Usuario seleccionado:</strong> <span id="lblUsuarioSeleccionado"></span><br>
                    <strong>Padecimientos:</strong> <span id="lblPadecimientos">Ninguno</span>
                </div>
            </div>
        </div>
    </div>

    <%-- TABS --%>
    <div class="gp-tabs-container">
        <div class="gp-tabs">
            <button class="gp-tab-btn active" data-tab="planner">🍽️ Generador de Plan</button>
            <button class="gp-tab-btn" data-tab="recetas">👨‍🍳 Ideas de Comidas (IA)</button>
            <button class="gp-tab-btn" data-tab="lista">📋 Lista de Macronutrientes por Alimento</button>
        </div>
    </div>

    <%-- TAB: LISTA --%>
    <div class="gp-tab-panel" id="tab-lista">
        <div class="gp-section-title">Lista de Alimentos agrupados por Macrogrupo</div>
        <p class="gp-section-sub">Explorá los alimentos disponibles con su información nutricional por cada 100g.</p>

        <%-- RANKER POR NUTRIENTE --%>
        <div class="gp-nr-panel">
            <div class="gp-nr-header">
                <i data-lucide="bar-chart-2" width="16" height="16"></i>
                Alimentos más ricos en…
            </div>
            <div class="gp-nr-controls">
                <select id="gpNutrientSelect" class="gp-nr-select">
                    <option value="">Seleccioná un nutriente...</option>
                    <optgroup label="Macronutrientes">
                        <option value="Energia_kcal">Energía (kcal)</option>
                        <option value="Proteina_g">Proteína (g)</option>
                        <option value="Carbohidratos_g">Carbohidratos (g)</option>
                        <option value="Grasa_g">Grasas totales (g)</option>
                        <option value="Fibra_g">Fibra (g)</option>
                        <option value="Colesterol_mg">Colesterol (mg)</option>
                    </optgroup>
                    <optgroup label="Minerales">
                        <option value="Calcio_mg">Calcio (mg)</option>
                        <option value="Fosforo_mg">Fósforo (mg)</option>
                        <option value="Hierro_mg">Hierro (mg)</option>
                        <option value="Potasio_mg">Potasio (mg)</option>
                        <option value="Zinc_mg">Zinc (mg)</option>
                        <option value="Magnesio_mg">Magnesio (mg)</option>
                        <option value="Sodio_mg">Sodio (mg)</option>
                    </optgroup>
                    <optgroup label="Vitaminas">
                        <option value="Vit_C_mg">Vitamina C (mg)</option>
                        <option value="Vit_A_ug">Vitamina A (µg)</option>
                        <option value="Tiamina_mg">Tiamina / B1 (mg)</option>
                        <option value="Riboflavina_mg">Riboflavina / B2 (mg)</option>
                        <option value="Niacina_mg">Niacina / B3 (mg)</option>
                        <option value="Vit_B6_mg">Vitamina B6 (mg)</option>
                        <option value="Vit_B12_ug">Vitamina B12 (µg)</option>
                        <option value="Folato_ug">Folato (µg)</option>
                    </optgroup>
                    <optgroup label="Ácidos Grasos">
                        <option value="Ac_Grasos_Saturados_g">Ag. Saturados (g)</option>
                        <option value="Ac_Grasos_Monoinsaturados_g">Ag. Monoinsaturados (g)</option>
                        <option value="Ac_Grasos_Poliinsaturados_g">Ag. Poliinsaturados (g)</option>
                    </optgroup>
                </select>
                <div class="gp-nr-top-wrap">
                    <label>Top</label>
                    <input type="number" id="gpNutrientTop" value="15" min="5" max="50" class="gp-nr-top-input">
                </div>
                <button class="gp-nr-btn" onclick="gpBuscarPorNutriente()">Ver ranking</button>
            </div>
            <div id="gpNutrientResult" style="display:none;"></div>
        </div>

        <div class="gp-search-wrapper">
            <span class="gp-search-icon">🔍</span>
            <input type="text" class="gp-search-box" id="gpSearchFood" placeholder="Buscar alimento...">
        </div>

        <div class="gp-chips" id="gpFilterChips">
            <button class="gp-chip active" data-filter="all">Todos</button>
            <button class="gp-chip" data-filter="Lácteos y derivados">🥛 Lácteos y derivados</button>
            <button class="gp-chip" data-filter="Proteínas animales">🍗 Proteínas animales</button>
            <button class="gp-chip" data-filter="Vegetales">🥦 Vegetales</button>
            <button class="gp-chip" data-filter="Grasas y semillas">🥑 Grasas y semillas</button>
            <button class="gp-chip" data-filter="Frutas">🍎 Frutas</button>
            <button class="gp-chip" data-filter="Cereales y harinas">🍞 Cereales y harinas</button>
            <button class="gp-chip" data-filter="Azúcares y dulces">🍯 Azúcares y dulces</button>
        </div>

        <div id="gpFoodGroupsContainer">
            <div style="text-align:center; padding:2rem; color:#7a9a78;">
                <div class="gp-spinner"></div>
                <p style="margin-top:0.5rem;">Cargando alimentos...</p>
            </div>
        </div>
    </div>

    <%-- TAB: PLANNER --%>
    <div class="gp-tab-panel active" id="tab-planner">
        <div class="gp-section-title">Generador de Plan</div>
        <p class="gp-section-sub">Seleccioná el tiempo de comida, ingresá tus metas y generá tu plan.</p>

        <%-- TOGGLE FILTRO --%>
        <div class="gp-toggle-row">
            <label class="gp-toggle-switch">
                <input type="checkbox" id="gpToggleFiltro" onchange="gpHandleToggleFiltro()">
                <span class="gp-toggle-slider"></span>
            </label>
            <div>
                <div class="gp-toggle-label">🏠 Usar solo alimentos que tengo en casa</div>
                <div class="gp-toggle-sub">Activá para elegir manualmente los alimentos disponibles</div>
            </div>
            <span class="gp-badge" id="gpSelectedBadge">0 seleccionados</span>
        </div>

        <%-- PANEL FILTRO DESPENSA --%>
        <div id="gpPanelFiltro" style="display:none; margin-bottom:1.25rem;">
            <div class="card card_border py-2">
                <div class="cards__heading">
                    <h3>Alimentos Disponibles en Casa</h3>
                </div>
                <div class="card-body">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.75rem; flex-wrap:wrap; gap:0.5rem;">
                        <span style="font-weight:700; font-size:0.88rem;">📦 Marcá los alimentos que tenés disponibles</span>
                        <div style="display:flex; gap:0.5rem; flex-wrap:wrap;">
                            <button class="btn btn-sm btn-outline-success" onclick="gpSeleccionarTodos()">✅ Todos</button>
                            <button class="btn btn-sm btn-outline-secondary" onclick="gpDeseleccionarTodos()">⬜ Ninguno</button>
                            <button class="btn btn-sm btn-success" onclick="gpGuardarDespensa()">💾 Guardar</button>
                        </div>
                    </div>
                    
                    <%-- BUSCADOR --%>
                    <div style="margin-bottom:1rem;">
                        <div class="input-group" style="max-width:400px;">
                            <div class="input-group-prepend">
                                <span class="input-group-text" style="background:#e8f5e9; border-color:#c8e6c9;">🔍</span>
                            </div>
                            <input type="text" id="gpBuscadorDespensa" class="form-control" 
                                   placeholder="Buscar alimento por nombre..." 
                                   oninput="gpFiltrarDespensa(this.value)"
                                   style="border-color:#c8e6c9;">
                            <div class="input-group-append" id="gpBuscadorCount" style="display:none;">
                                <span class="input-group-text" style="background:#e8f5e9; border-color:#c8e6c9; font-size:0.75rem;"></span>
                            </div>
                        </div>
                    </div>
                    
                    <div id="gpFiltroContainer" style="max-height:450px; overflow-y:auto;">
                        <div style="text-align:center; padding:2rem; color:#7a9a78;">
                            <div class="gp-spinner"></div>
                            <p style="margin-top:0.5rem;">Cargando alimentos...</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <%-- SELECTOR TIEMPO COMIDA --%>
        <div style="font-weight:700; font-size:0.82rem; color:#4a6a48; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:0.6rem;">
            ⏰ Seleccioná el tiempo de comida
        </div>
        <div class="gp-meal-selector">
            <button class="gp-meal-btn" data-meal="Desayuno" onclick="gpSelectMeal(this)">
                <span class="gp-ms-emoji"><i data-lucide="coffee"></i></span>
                <span class="gp-ms-name">Desayuno</span>
                <span class="gp-ms-time">6:00–8:00 AM</span>
            </button>
            <button class="gp-meal-btn" data-meal="MeriendaAM" onclick="gpSelectMeal(this)">
                <span class="gp-ms-emoji"><i data-lucide="apple"></i></span>
                <span class="gp-ms-name">Merienda AM</span>
                <span class="gp-ms-time">9:30–10:30 AM</span>
            </button>
            <button class="gp-meal-btn" data-meal="Almuerzo" onclick="gpSelectMeal(this)">
                <span class="gp-ms-emoji"><i data-lucide="sun"></i></span>
                <span class="gp-ms-name">Almuerzo</span>
                <span class="gp-ms-time">12:00–1:00 PM</span>
            </button>
            <button class="gp-meal-btn" data-meal="MeriendaPM" onclick="gpSelectMeal(this)">
                <span class="gp-ms-emoji"><i data-lucide="cookie"></i></span>
                <span class="gp-ms-name">Merienda PM</span>
                <span class="gp-ms-time">3:00–4:00 PM</span>
            </button>
            <button class="gp-meal-btn" data-meal="Cena" onclick="gpSelectMeal(this)">
                <span class="gp-ms-emoji"><i data-lucide="moon"></i></span>
                <span class="gp-ms-name">Cena</span>
                <span class="gp-ms-time">6:00–7:30 PM</span>
            </button>
        </div>

        <%-- PLANES ACUMULADOS EN CENTRO (visible cuando no hay meal seleccionada) --%>
        <div id="gpAcumuladoCenter" style="display:none; margin-top:1rem;"></div>

        <%-- MACROS --%>
        <div class="gp-macros-card" id="gpMacrosCard" style="display:none;">
            <div class="gp-macros-title" id="gpMacrosTitle">🌅 Desayuno — Metas nutricionales</div>
            <div class="gp-macros-grid">
                <div class="gp-macro-field">
                    <label>🌾 Carbohidratos</label>
                    <input type="number" class="gp-macro-input" id="gpMetaCarb" placeholder="0" min="0" step="0.1">
                    <div class="gp-macro-unit">gramos</div>
                </div>
                <div class="gp-macro-field">
                    <label>💪 Proteínas</label>
                    <input type="number" class="gp-macro-input" id="gpMetaProt" placeholder="0" min="0" step="0.1">
                    <div class="gp-macro-unit">gramos</div>
                </div>
                <div class="gp-macro-field">
                    <label>🥑 Grasas</label>
                    <input type="number" class="gp-macro-input" id="gpMetaGras" placeholder="0" min="0" step="0.1">
                    <div class="gp-macro-unit">gramos</div>
                </div>
                <div class="gp-macro-field">
                    <label>🌿 Fibra</label>
                    <input type="number" class="gp-macro-input" id="gpMetaFibr" placeholder="0" min="0" step="0.1">
                    <div class="gp-macro-unit">gramos</div>
                </div>
            </div>
            <div class="gp-rules-info" id="gpRulesInfo"></div>
            <div id="gpMetaKcalDisplay" style="display:none;text-align:right;padding:0.3rem 0.2rem 0;font-size:0.85rem;font-weight:700;color:#4e9a42;">
                ⚡ Meta de esta comida: <span id="gpMetaKcal">0</span> kcal
            </div>

            <%-- TOGGLE VEGANO --%>
            <div class="gp-toggle-row" style="margin-top:0.75rem;padding:0.6rem 0.9rem;background:rgba(255,255,255,0.08);border-radius:10px;">
                <label class="gp-toggle-switch">
                    <input type="checkbox" id="gpToggleVegano">
                    <span class="gp-toggle-slider"></span>
                </label>
                <div>
                    <div class="gp-toggle-label" style="color:inherit;">🌿 Modo vegano</div>
                    <div class="gp-toggle-sub" style="color:inherit;opacity:0.75;">Solo legumbres como fuente de proteínas (sin carnes, lácteos ni huevos)</div>
                </div>
            </div>

            <div class="gp-actions-row">
                <button class="gp-btn gp-btn-primary" onclick="gpGenerarPlan()">⚡ Generar Plan</button>
                <button class="gp-btn gp-btn-outline" onclick="gpTraerDistribucionCita()" title="Cargar los gramos de la distribución de la última cita registrada para este tiempo de comida">
                    📋 Traer distribución de última cita
                </button>
            </div>
        </div>

        <%-- WRAPPER DOS COLUMNAS: main + sidebar --%>
        <div id="gpPlanWrapper" style="display:none; gap:1.5rem; align-items:flex-start; flex-wrap:wrap;">

            <%-- COLUMNA PRINCIPAL --%>
            <div style="flex:1; min-width:0;">
                <%-- RESULTADOS --%>
                <div id="gpResultados"></div>

                <%-- CONFIRMAR --%>
                <div id="gpConfirmarDiv" style="display:none; margin-top:1rem;">
                    <div class="gp-callout">
                        <span>✅</span>
                        <span>Cuando estés conforme con los alimentos, elegí una acción para confirmar el plan.</span>
                    </div>
                    <div style="display:flex; gap:0.75rem; flex-wrap:wrap; margin-top:0.75rem;">
                        <button class="gp-btn gp-btn-primary" onclick="gpAcumularPlan()">
                            ✅ Confirmar plan
                        </button>
                        <button class="gp-btn gp-btn-orange" onclick="gpConfirmarYGenerarIA()">
                            👨‍🍳 Confirmar y generar ideas con IA
                        </button>
                        <button class="gp-btn gp-btn-outline" onclick="gpAbrirAgregarAlimento()">
                            ➕ Agregar alimento
                        </button>
                    </div>
                </div>

                <%-- PANEL AGREGAR ALIMENTO --%>
                <div id="gpPanelAgregar" style="display:none; margin-top:1rem;"></div>
            </div>

            <%-- SIDEBAR --%>
            <div id="gpSidebar" style="width:300px; flex-shrink:0; position:sticky; top:80px;">
                <%-- Barras del plan actual en generación --%>
                <div id="gpSidebarCurrent"></div>
                <%-- Planes confirmados acumulados --%>
                <div id="gpSidebarAcumulado" style="margin-top:0.75rem;"></div>
            </div>

        </div>

    </div>


    <%-- TAB: RECETAS IA --%>
    <div class="gp-tab-panel" id="tab-recetas">
        <div class="gp-section-title">Ideas de Comidas con IA</div>
        <p class="gp-section-sub">La IA te sugerirá recetas respetando los gramos de tu plan confirmado.</p>
        <div id="gpIAContent">
            <div class="gp-ia-empty">
                <div style="font-size:3rem; margin-bottom:0.75rem;">🍽️</div>
                <div>Primero generá y confirmá tu plan en la pestaña <strong>Generador de Plan</strong>.</div>
            </div>
        </div>
    </div>

    <%-- TOAST --%>
    <div class="gp-toast" id="gpToast"></div>

    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>

    <script src="../JavaScript/GeneradorPlan.js"></script>

</asp:Content>