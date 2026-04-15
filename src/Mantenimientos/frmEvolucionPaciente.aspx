<%@ Page Title="" Language="C#" MasterPageFile="~/Mantenimientos/frmPrincipalMaster.Master" 
    AutoEventWireup="true" CodeBehind="frmEvolucionPaciente.aspx.cs" 
    Inherits="PL_CRUD_CONSULTAS.Mantenimientos.frmEvolucionPaciente" %>

<asp:Content ID="Content1" ContentPlaceHolderID="head" runat="server">
    <link href="../Base/assets/css/styleCommon.css" rel="stylesheet" />
    <link href="/Base/assets/css/styleProgreso.css" rel="stylesheet" />
    <style>
        /* ── Chart wrap — explicit height for maintainAspectRatio: false ── */
        .pg-chart-wrap canvas { height: 280px !important; }

        /* ── Filter bar ── */
        .pg-filter-bar {
            display: flex;
            align-items: center;
            gap: 12px;
            flex-wrap: wrap;
            background: var(--ev-surface-lowest);
            box-shadow: var(--ev-shadow-ambient);
            border-radius: var(--ns-radius-lg);
            padding: 12px 20px;
            margin-bottom: 12px;
        }
        .pg-filter-label {
            font-family: var(--ns-font-body);
            font-size: 11px;
            font-weight: 600;
            letter-spacing: 0.06em;
            text-transform: uppercase;
            color: var(--ev-on-surface-variant);
            margin-right: 4px;
        }
        .pg-filter-group {
            display: flex;
            align-items: center;
            gap: 6px;
        }
        .pg-filter-input-label {
            font-family: var(--ns-font-body);
            font-size: 12px;
            color: var(--ev-on-surface-variant);
        }
        .pg-filter-input {
            font-family: var(--ns-font-body);
            font-size: 12px;
            color: var(--ev-on-surface);
            background: var(--ev-surface-container);
            border: none;
            border-radius: var(--ns-radius-md);
            padding: 6px 10px;
            outline: none;
            cursor: pointer;
            transition: box-shadow 0.15s ease;
        }
        .pg-filter-input:focus {
            box-shadow: 0 0 0 3px rgba(0, 108, 73, 0.12);
        }
        .pg-filter-reset {
            font-family: var(--ns-font-body);
            font-size: 12px;
            font-weight: 500;
            color: var(--ev-on-surface-variant);
            background: var(--ev-surface-container);
            border: none;
            border-radius: var(--ns-radius-md);
            padding: 6px 12px;
            cursor: pointer;
            transition: background 0.15s ease, color 0.15s ease;
            margin-left: auto;
        }
        .pg-filter-reset:hover {
            background: var(--ev-surface-low);
            color: var(--ev-primary);
        }
    </style>
</asp:Content>

<asp:Content ID="Content2" ContentPlaceHolderID="ContentPlaceHolder1" runat="server">

    <nav aria-label="breadcrumb">
        <ol class="breadcrumb my-breadcrumb">
            <li class="breadcrumb-item"><a href="frmPrincipal.aspx">Inicio</a></li>
            <li class="breadcrumb-item active" aria-current="page" id="breadcrumbTitulo">
                Evolución del Paciente
            </li>
        </ol>
    </nav>

    <div class="welcome-msg pt-3 pb-4">
        <h1>Hola <span class="text-primary" id="nombreUsuario"></span>, Bienvenido</h1>
        <p id="emlUsuario"></p>
    </div>

    <%-- SELECCIÓN DE USUARIO (solo Admin/Médico) --%>
    <div id="divSeleccionUsuario" style="display:none;">
        <div class="card card_border py-2 mb-4">
            <div class="cards__heading">
                <h3>Selección de Paciente <span></span></h3>
            </div>
            <div class="card-body">
                <div class="form-row">
                    <div class="form-group col-md-12">
                        <label class="input__label">Paciente *</label>
                        <div style="position:relative;">
                            <span style="position:absolute;left:10px;top:50%;transform:translateY(-50%);color:#94a3b8;pointer-events:none;display:flex;align-items:center;z-index:1;">
                                <i data-lucide="search" width="16" height="16"></i>
                            </span>
                            <input type="text" id="txtBuscarPaciente"
                                   class="form-control input-style"
                                   style="padding-left:36px;"
                                   placeholder="Buscar paciente por nombre..."
                                   autocomplete="off">
                            <div id="pgSearchDropdown"
                                 style="display:none;position:absolute;top:calc(100% + 4px);left:0;right:0;z-index:1050;
                                        background:#fff;border:1px solid #e2e8f0;border-radius:8px;
                                        box-shadow:0 4px 20px rgba(0,0,0,0.1);max-height:280px;overflow-y:auto;">
                            </div>
                        </div>
                        <input type="hidden" id="cboUsuarios" value="0">
                    </div>
                </div>
            </div>
        </div>
    </div>

    <%-- HEADER PACIENTE --%>
    <div id="pgHeaderPaciente" style="display:none;">
        <div class="pg-patient-header">
            <div class="pg-patient-avatar" id="pgAvatar">?</div>
            <div class="pg-patient-info">
                <div class="pg-patient-name" id="pgNombrePaciente">—</div>
                <div class="pg-patient-meta" id="pgMetaPaciente">—</div>
            </div>
            <div class="pg-patient-stats" id="pgStatsRapidos"></div>
        </div>
    </div>

    <%-- FILTRO DE FECHAS --%>
    <div id="pgFiltroFechas" style="display:none;">
        <div class="pg-filter-bar">
            <span class="pg-filter-label">Período</span>
            <div class="pg-filter-group">
                <label class="pg-filter-input-label" for="pgFiltroDesde">Desde</label>
                <input type="date" id="pgFiltroDesde" class="pg-filter-input"
                       onchange="pgAplicarFiltroFechas()" />
            </div>
            <div class="pg-filter-group">
                <label class="pg-filter-input-label" for="pgFiltroHasta">Hasta</label>
                <input type="date" id="pgFiltroHasta" class="pg-filter-input"
                       onchange="pgAplicarFiltroFechas()" />
            </div>
            <button class="pg-filter-reset" onclick="pgResetFiltro()" title="Ver todas las consultas">
                ↺ Todas
            </button>
        </div>
    </div>

    <%-- TABS --%>
    <div class="pg-tabs-container" id="pgTabsContainer" style="display:none;">
        <div class="pg-tabs">
            <button class="pg-tab-btn active" data-tab="corporal">
                ⚖️ Evolución Corporal
            </button>
            <button class="pg-tab-btn" data-tab="presion">
                🫀 Presión Arterial
            </button>
            <button class="pg-tab-btn" data-tab="bioquimicos">
                🔬 Estado Actual
            </button>
            <button class="pg-tab-btn" data-tab="notas">
                📋 Notas Clínicas
            </button>
        </div>
    </div>

    <%-- TAB: EVOLUCIÓN CORPORAL --%>
    <div class="pg-tab-panel active" id="tab-corporal" style="display:none;">

        <div class="pg-cards-row" id="pgSummaryCards"></div>

        <div class="pg-chart-card">
            <div class="pg-chart-title">📈 Evolución del Peso</div>
            <div class="pg-chart-wrap">
                <canvas id="chartPeso"></canvas>
            </div>
        </div>

        <div class="pg-chart-card">
            <div class="pg-chart-title">📊 Índice de Masa Corporal (IMC)</div>
            <div class="pg-chart-wrap">
                <canvas id="chartIMC"></canvas>
            </div>
        </div>

        <div class="pg-chart-card">
            <div class="pg-chart-title">💪 Composición Corporal — Grasa vs Músculo</div>
            <div class="pg-chart-wrap">
                <canvas id="chartComposicion"></canvas>
            </div>
        </div>

        <div class="pg-chart-card">
            <div class="pg-chart-title">📏 Circunferencias — Cintura y Cadera</div>
            <div class="pg-chart-wrap">
                <canvas id="chartCircunferencias"></canvas>
            </div>
        </div>

    </div>

    <%-- TAB: PRESIÓN ARTERIAL --%>
    <div class="pg-tab-panel" id="tab-presion" style="display:none;">
        <div class="pg-chart-card">
            <div class="pg-chart-title">🫀 Evolución de la Presión Arterial</div>
            <div class="pg-pa-legend">
                <span class="pg-pa-badge normal">✅ Normal (&lt;120/80)</span>
                <span class="pg-pa-badge elevada">⚠️ Elevada (120-129)</span>
                <span class="pg-pa-badge alta">🔴 Alta (≥130/80)</span>
            </div>
            <div class="pg-chart-wrap">
                <canvas id="chartPresion"></canvas>
            </div>
        </div>
    </div>

    <%-- TAB: ESTADO ACTUAL (Bioquímicos + Historia) --%>
    <div class="pg-tab-panel" id="tab-bioquimicos" style="display:none;">

        <div id="pgBioFecha" class="pg-bio-fecha"></div>

        <div class="pg-section-title">🩸 Perfil Lipídico y Metabólico</div>
        <div class="pg-semaforo-grid" id="pgSemaforoLipidos"></div>

        <div class="pg-section-title">🔬 Otros Indicadores</div>
        <div class="pg-semaforo-grid" id="pgSemaforoOtros"></div>

        <div class="pg-section-title">🏃 Hábitos y Estilo de Vida</div>
        <div class="pg-habitos-grid" id="pgHabitos"></div>

    </div>

    <%-- TAB: NOTAS CLÍNICAS --%>
    <div class="pg-tab-panel" id="tab-notas" style="display:none;">
        <div class="pg-section-title">📋 Historial de Consultas</div>
        <div id="pgTimeline"></div>
    </div>

    <%-- EMPTY STATE --%>
    <div id="pgEmptyState" style="display:none;">
        <div class="pg-empty">
            <div class="pg-empty-icon">📊</div>
            <div class="pg-empty-title">Sin datos registrados</div>
            <div class="pg-empty-sub">
                Aún no hay consultas completadas con métricas para este paciente.
            </div>
        </div>
    </div>

    <%-- SPINNER --%>
    <div id="pgSpinner" style="display:none;">
        <div class="pg-spinner-wrap">
            <div class="pg-spinner-dot"></div>
            <div class="pg-spinner-text">Cargando datos...</div>
        </div>
    </div>

    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
    <script src="../JavaScript/EvolucionPaciente.js"></script>

</asp:Content>