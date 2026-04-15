<%@ Page Title="" Language="C#" MasterPageFile="~/Mantenimientos/frmPrincipalMaster.Master" AutoEventWireup="true" CodeBehind="frmConsultaConsultas.aspx.cs" Inherits="PL_CRUD_CONSULTAS.Mantenimientos.frmConsultaConsultas" %>
<asp:Content ID="Content1" ContentPlaceHolderID="head" runat="server">
    <%-- FullCalendar v6 --%>
    <link href="https://cdn.jsdelivr.net/npm/fullcalendar@6.1.10/index.global.min.css" rel="stylesheet" />
    <script src="https://cdn.jsdelivr.net/npm/fullcalendar@6.1.10/index.global.min.js"></script>
    <link rel="stylesheet" href="../Base/assets/css/styleCommon.css" />
    <link rel="stylesheet" href="../Base/assets/css/styleConsultas.css" />
</asp:Content>

<asp:Content ID="Content2" ContentPlaceHolderID="ContentPlaceHolder1" runat="server">
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>

    <nav aria-label="breadcrumb">
      <ol class="breadcrumb my-breadcrumb">
        <li class="breadcrumb-item"><a href="frmPrincipal.aspx">Inicio</a></li>
        <li class="breadcrumb-item active" aria-current="page">Citas Medicas</li>
      </ol>
    </nav>

    <div class="welcome-msg pt-3 pb-4">
      <h1>Hola <span class="text-primary" id="nombreUsuario"></span>, Bienvenido</h1>
      <p id="emlUsuario"></p>
    </div>

    <%-- HERO: Acción principal + toggle de vista --%>
    <div class="cc-hero">
        <div class="cc-hero-info">
            <div class="cc-hero-icon"><i class="fa fa-calendar"></i></div>
            <div>
                <div class="cc-hero-title">Citas Medicas</div>
                <div class="cc-hero-sub">Agenda, gestiona y haz seguimiento de las citas</div>
            </div>  
        </div>
        <div class="cc-hero-actions">
            <div class="cc-vista-toggle">
                <button id="btnVistaCalendario" class="btn-vista activo"
                        onclick="cambiarVista('calendario')">
                    <i class="fa fa-calendar"></i> Calendario
                </button>
                <button id="btnVistaTabla" class="btn-vista"
                        onclick="cambiarVista('tabla')">
                    <i class="fa fa-list"></i> Lista
                </button>
            </div>
            <button class="cc-hero-btn" onclick="nuevaConsulta()">
                <i class="fa fa-plus"></i> Agendar Cita
            </button>
        </div>
    </div>

    <%-- Layout: contenido principal + filtros --%>
    <div class="cc-layout">

        <%-- Columna principal: calendario o tabla --%>
        <div class="cc-main">
            <%-- VISTA CALENDARIO --%>
            <div class="card card_border py-2 mb-4" id="divCalendario">
                <div class="cards__heading"><h3>Calendario de Citas</h3></div>
                <div class="card-body">
                    <div id="calendarFC"></div>
                </div>
            </div>

            <%-- VISTA TABLA --%>
            <div class="card card_border py-2 mb-4" id="divTabla">
                <div class="cards__heading"><h3>Listado de Citas</h3></div>
                <div class="card-body">
                    <div class="table-responsive">
                        <table class="table table-striped" id="tblConsultas"></table>
                    </div>
                </div>
            </div>
        </div>

        <%-- Sidebar: filtros --%>
        <div class="cc-sidebar">
            <div class="cc-filter-card">
                <div class="cc-filter-header">
                    <i class="fa fa-search cu-filter-icon"></i>
                    <span>Filtrar citas</span>
                </div>
                <div class="cc-filter-body">
                    <form action="javascript:filtrarConsultas()" method="post">
                        <div class="form-group" id="divFiltroUsuario" style="display:none;">
                            <label class="input__label">Paciente</label>
                            <select id="cboUsuario" class="form-control input-style">
                                <option value="0">Todos</option>
                            </select>
                        </div>
                        <div class="form-group" id="divFiltroMedico" style="display:none;">
                            <label class="input__label">Medico</label>
                            <select id="cboMedico" class="form-control input-style">
                                <option value="0">Todos</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="input__label">Estado</label>
                            <select id="cboEstado" class="form-control input-style">
                                <option value="">Todos</option>
                                <option value="P">Pendiente</option>
                                <option value="C">Completada</option>
                                <option value="X">Cancelada</option>
                                <option value="N">No Asistió</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="input__label">Fecha desde</label>
                            <input type="date" class="form-control input-style" id="txtFechaInicio">
                        </div>
                        <div class="form-group">
                            <label class="input__label">Fecha hasta</label>
                            <input type="date" class="form-control input-style" id="txtFechaFin">
                        </div>
                        <div class="cc-filter-actions">
                            <button type="submit" class="btn btn-primary btn-style">
                                <i class="fa fa-search"></i> Buscar
                            </button>
                            <button type="button" class="btn btn-secondary btn-style"
                                    onclick="limpiarFiltros()">
                                <i class="fa fa-eraser"></i> Limpiar
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>

    </div>

    <%-- POPUP DE CITA (posicionado dinámicamente por JS) --%>
    <div id="popupCita">
        <span class="popup-close" onclick="cerrarPopup()">✕</span>
        <div class="popup-header" id="popupTitulo"></div>
        <div class="popup-meta" id="popupFecha"></div>
        <div class="popup-meta" id="popupMedico"></div>
        <div class="popup-meta" id="popupEstado"></div>
        <div class="popup-meta" id="popupMotivo"></div>
        <div class="popup-btns" id="popupBotones"></div>
    </div>

    <script src="../JavaScript/Consultas.js"></script>
</asp:Content>
