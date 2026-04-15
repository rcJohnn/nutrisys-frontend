<%@ Page Title="" Language="C#" MasterPageFile="~/Mantenimientos/frmPrincipalMaster.Master" AutoEventWireup="true" CodeBehind="frmPrincipal.aspx.cs" Inherits="PL_CRUD_CONSULTAS.Mantenimientos.frmPrincipal" %>
<asp:Content ID="Content1" ContentPlaceHolderID="head" runat="server">
    <link rel="stylesheet" href="../Base/assets/css/styleCommon.css" />
    <link rel="stylesheet" href="../Base/assets/css/styleHub.css" />
</asp:Content>
<asp:Content ID="Content2" ContentPlaceHolderID="ContentPlaceHolder1" runat="server">
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>

    <%-- Breadcrumb --%>
    <nav aria-label="breadcrumb">
        <ol class="breadcrumb my-breadcrumb">
            <li class="breadcrumb-item active" aria-current="page">Inicio</li>
        </ol>
    </nav>

    <%-- ──────────────────────────────────────────── --%>
    <%-- CABECERA: saludo + fecha                     --%>
    <%-- ──────────────────────────────────────────── --%>
    <div class="hub-header">
        <div>
            <h1 class="hub-greeting"><span id="hubSaludo"></span>, <span id="hubNombreUsuario" class="hub-greeting-name"></span></h1>
            <p  class="hub-fecha" id="hubFechaHoy"></p>
        </div>
        <div id="hubStatusBadge" class="hub-status-badge"></div>
    </div>

    <%-- ──────────────────────────────────────────── --%>
    <%-- SKELETON / CARGANDO                          --%>
    <%-- ──────────────────────────────────────────── --%>
    <div id="hubSkeleton" class="hub-skeleton-wrap">
        <div class="hub-skeleton-card"></div>
        <div class="hub-skeleton-card"></div>
        <div class="hub-skeleton-card"></div>
        <div class="hub-skeleton-card"></div>
    </div>

    <%-- ──────────────────────────────────────────── --%>
    <%-- ROL MÉDICO                                   --%>
    <%-- ──────────────────────────────────────────── --%>
    <div id="hubMedico" class="hub-section" style="display:none;">

        <%-- Stats row --%>
        <div class="hub-stats-row">
            <div class="hub-stat-card hub-stat-green">
                <span class="hub-stat-icon"><i class="fa fa-users"></i></span>
                <div>
                    <div class="hub-stat-value" id="mStatPacientes">—</div>
                    <div class="hub-stat-label">Pacientes sin seguimiento <span class="hub-stat-meta">(+30 dias)</span></div>
                </div>
            </div>
            <div class="hub-stat-card hub-stat-indigo">
                <span class="hub-stat-icon"><i class="fa fa-calendar-check-o"></i></span>
                <div>
                    <div class="hub-stat-value" id="mStatHoy">—</div>
                    <div class="hub-stat-label">Consultas hoy</div>
                </div>
            </div>
            <div class="hub-stat-card hub-stat-amber">
                <span class="hub-stat-icon"><i class="fa fa-clock-o"></i></span>
                <div>
                    <div class="hub-stat-value" id="mStatPendientes">—</div>
                    <div class="hub-stat-label">Consultas pendientes</div>
                </div>
            </div>
            <div class="hub-stat-card hub-stat-slate">
                <span class="hub-stat-icon"><i class="fa fa-user-md"></i></span>
                <div>
                    <div class="hub-stat-value" id="mStatTotal">—</div>
                    <div class="hub-stat-label">Pacientes atendidos</div>
                </div>
            </div>
        </div>

        <%-- Agenda del día --%>
        <div class="hub-card">
            <div class="hub-card-header">
                <div>
                    <h3 class="hub-card-title">Agenda de hoy</h3>
                    <p  class="hub-card-subtitle" id="mAgendaSubtitle">Cargando...</p>
                </div>
                <a href="frmConsultaConsultas.aspx?vista=dia" class="hub-btn-link">Ver todas <i class="fa fa-arrow-right"></i></a>
            </div>
            <div id="mAgendaContainer">
                <p class="hub-empty-msg">No hay consultas programadas para hoy.</p>
            </div>
        </div>

        <%-- Acceso rápido --%>
        <div class="hub-card">
            <div class="hub-card-header">
                <h3 class="hub-card-title">Accesos rapidos</h3>
            </div>
            <div class="hub-quicklinks">
                <a href="frmMantenimientoConsultas.aspx" class="hub-quicklink">
                    <i class="fa fa-calendar-plus-o"></i>
                    <span>Nueva consulta</span>
                </a>
                <a href="frmConfigAgenda.aspx" class="hub-quicklink">
                    <i class="fa fa-sliders"></i>
                    <span>Configurar horario</span>
                </a>
                <a href="frmConsultaConsultas.aspx?vista=mes" class="hub-quicklink">
                    <i class="fa fa-list-alt"></i>
                    <span>Historial completo</span>
                </a>
                <a href="frmEvolucionPaciente.aspx" class="hub-quicklink">
                    <i class="fa fa-line-chart"></i>
                    <span>Evolucion paciente</span>
                </a>
            </div>
        </div>

    </div>

    <%-- ──────────────────────────────────────────── --%>
    <%-- ROL USUARIO / PACIENTE                       --%>
    <%-- ──────────────────────────────────────────── --%>
    <div id="hubUsuario" class="hub-section" style="display:none;">

        <div class="hub-citas-grid">

            <%-- Última cita --%>
            <div class="hub-card" id="uCardUltima">
                <div class="hub-card-header">
                    <h3 class="hub-card-title">Ultima consulta</h3>
                    <span class="hub-badge hub-badge-muted" id="uUltimaEstado"></span>
                </div>
                <div id="uUltimaContent" class="hub-cita-body">
                    <p class="hub-empty-msg">Sin consultas anteriores registradas.</p>
                </div>
            </div>

            <%-- Próxima cita --%>
            <div class="hub-card" id="uCardProxima">
                <div class="hub-card-header">
                    <h3 class="hub-card-title">Proxima cita</h3>
                    <span class="hub-badge hub-badge-green" id="uProximaEstado"></span>
                </div>
                <div id="uProximaContent" class="hub-cita-body">
                    <p class="hub-empty-msg">No tienes ninguna cita agendada.</p>
                </div>
            </div>

        </div>

        <%-- CTA agendar si no tiene próxima cita --%>
        <div id="uCtaAgendar" class="hub-cta-agendar" style="display:none;">
            <div class="hub-cta-icon"><i class="fa fa-calendar-plus-o"></i></div>
            <div>
                <p class="hub-cta-title">No tienes consultas agendadas</p>
                <p class="hub-cta-sub">Agenda una cita con tu nutricionista para continuar tu seguimiento.</p>
            </div>
            <a href="frmMantenimientoConsultas.aspx" class="hub-btn-primary">Agendar cita</a>
        </div>

        <%-- Acceso rápido --%>
        <div class="hub-card">
            <div class="hub-card-header">
                <h3 class="hub-card-title">Accesos rapidos</h3>
            </div>
            <div class="hub-quicklinks">
                <a href="frmMantenimientoConsultas.aspx" class="hub-quicklink">
                    <i class="fa fa-calendar-plus-o"></i>
                    <span>Agendar cita</span>
                </a>
                <a href="frmEvolucionPaciente.aspx" class="hub-quicklink">
                    <i class="fa fa-line-chart"></i>
                    <span>Mi evolucion</span>
                </a>
                <a href="frmGeneradorPlan.aspx" class="hub-quicklink">
                    <i class="fa fa-cutlery"></i>
                    <span>Mi plan nutricional</span>
                </a>
            </div>
        </div>

    </div>

    <%-- ──────────────────────────────────────────── --%>
    <%-- ROL ADMIN (placeholder simple)               --%>
    <%-- ──────────────────────────────────────────── --%>
    <div id="hubAdmin" class="hub-section" style="display:none;">
        <div class="hub-card">
            <div class="hub-card-header">
                <h3 class="hub-card-title">Panel de Administracion</h3>
            </div>
            <div class="hub-quicklinks">
                <a href="frmConsultaUsuarios.aspx" class="hub-quicklink">
                    <i class="fa fa-users"></i>
                    <span>Usuarios</span>
                </a>
                <a href="frmConsultaMedicos.aspx" class="hub-quicklink">
                    <i class="fa fa-user-md"></i>
                    <span>Medicos</span>
                </a>
                <a href="frmConsultaAlimentos.aspx" class="hub-quicklink">
                    <i class="fa fa-leaf"></i>
                    <span>Alimentos</span>
                </a>
                <a href="frmConsultaAuditoria.aspx" class="hub-quicklink">
                    <i class="fa fa-shield"></i>
                    <span>Auditoria</span>
                </a>
            </div>
        </div>
    </div>

    <script src="../JavaScript/Principal.js"></script>

</asp:Content>
