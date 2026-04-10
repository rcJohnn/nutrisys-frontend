<%@ Page Title="" Language="C#" MasterPageFile="~/Mantenimientos/frmPrincipalMaster.Master" 
    AutoEventWireup="true" CodeBehind="frmConfigAgenda.aspx.cs" 
    Inherits="PL_CRUD_CONSULTAS.Mantenimientos.frmConfigAgenda" %>

<asp:Content ID="Content1" ContentPlaceHolderID="head" runat="server">
    <link rel="stylesheet" href="../Base/assets/css/styleCommon.css" />
    <link rel="stylesheet" href="../Base/assets/css/styleConfigAgenda.css" />
</asp:Content>

<asp:Content ID="Content2" ContentPlaceHolderID="ContentPlaceHolder1" runat="server">
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>

    <nav aria-label="breadcrumb">
        <ol class="breadcrumb my-breadcrumb">
            <li class="breadcrumb-item"><a href="frmPrincipal.aspx">Inicio</a></li>
            <li class="breadcrumb-item"><a href="frmConsultaMedicos.aspx">Médicos</a></li>
            <li class="breadcrumb-item active">Configuración de Agenda</li>
        </ol>
    </nav>

    <div class="welcome-msg pt-3 pb-3">
        <h1>Configuración de Agenda</h1>
        <p id="lblNombreMedico" class="text-muted"></p>
    </div>

    <%-- ══════════════════════════════════════
         SELECTOR DE MÉDICO (solo admin)
         ══════════════════════════════════════ --%>
    <div class="cfg-card" id="divSelectorMedico" style="display:none;">
        <div class="cfg-card-header">
            <i class="fa fa-user-md cfg-icon"></i>
            <h5>Seleccionar Médico</h5>
        </div>
        <div class="cfg-card-body">
            <div class="form-row align-items-end">
                <div class="form-group col-md-8 mb-0">
                    <label class="input__label">Médico</label>
                    <select id="cboMedicoSelector" class="form-control input-style">
                        <option value="0">Cargando...</option>
                    </select>
                </div>
                <div class="form-group col-md-4 mb-0">
                    <button class="btn btn-primary btn-style btn-block" onclick="cambiarMedico()">
                        <i class="fa fa-search"></i> Cargar configuración
                    </button>
                </div>
            </div>
        </div>
    </div>

    <%-- ══════════════════════════════════════
         SECCIÓN 1: AUTOAGENDAMIENTO
         ══════════════════════════════════════ --%>
    <div class="cfg-card">
        <div class="cfg-card-header">
            <i class="fa fa-toggle-on cfg-icon"></i>
            <h5>Autoagendamiento</h5>
        </div>
        <div class="cfg-card-body">
            <div class="d-flex align-items-center gap-3 mb-4">
                <div class="form-switch-custom" onclick="toggleAutoagendamiento()">
                    <div class="switch-track" id="switchAutoagendamiento">
                        <div class="switch-thumb"></div>
                    </div>
                    <span class="switch-label" id="lblAutoagendamiento">
                        Desactivado — el médico gestiona sus citas
                    </span>
                </div>
            </div>

            <%-- Config numérica (solo visible si autoagendamiento ON) --%>
            <div id="divConfigNumerica" style="display:none;">
                <hr>
                <h6 class="mb-3" style="color:var(--cfg-seccion-border); font-weight:700;">
                    Parámetros de reserva
                </h6>
                <div class="cfg-num-grid">
                    <div class="cfg-num-item">
                        <label>Duración del slot (min)</label>
                        <input type="number" id="txtSlotMin" min="10" max="120" step="5" value="30">
                        <small>Ej: 30 = citas de media hora</small>
                    </div>
                    <div class="cfg-num-item">
                        <label>Anticipación mínima (min)</label>
                        <input type="number" id="txtAnticipacion" min="0" max="1440" step="15" value="60">
                        <small>Mínimo de tiempo antes de la cita</small>
                    </div>
                    <div class="cfg-num-item">
                        <label>Máx. citas por día</label>
                        <input type="number" id="txtMaxCitas" min="1" max="50" placeholder="Sin límite">
                        <small>Vacío = sin límite</small>
                    </div>
                    <div class="cfg-num-item">
                        <label>Máx. de cancelaciones</label>
                        <input type="number" id="txtMaxCancelaciones" min="1" max="20" value="3">
                        <small>Cancelaciones antes de penalizar al paciente</small>
                    </div>
                    <div class="cfg-num-item">
                        <label>Duración de penalización (días)</label>
                        <input type="number" id="txtPeriodoPenal" min="1" max="365" value="30">
                        <small>Días que el usuario no puede autoagendar</small>
                    </div>
                </div>
            </div>

            <%-- Inactivación de pacientes (siempre visible) --%>
            <hr>
            <h6 class="mb-3" style="color:var(--cfg-seccion-border); font-weight:700;">
                <i class="fa fa-user-times"></i> Inactivación automática de pacientes
            </h6>
            <p class="text-muted" style="font-size:.82rem; margin-bottom:1rem;">
                Si un paciente no ha tenido consulta en el período indicado, el sistema lo pasa a <strong>Inactivo</strong>
                para que no pueda autoagendar. Puede ejecutarlo manualmente o quedará aplicado al guardar la configuración.
            </p>
            <div class="cfg-num-grid" style="grid-template-columns: repeat(auto-fill, minmax(200px,1fr));">
                <div class="cfg-num-item">
                    <label>Meses sin consulta para inactivar</label>
                    <input type="number" id="txtMesesInactividad" min="1" max="24" value="1">
                    <small>Mínimo 1 mes</small>
                </div>
            </div>
            <div class="mt-3">
                <button class="btn btn-outline-warning btn-sm" style="border-radius:8px;" onclick="ejecutarInactivacion()">
                    <i class="fa fa-bolt"></i> Ejecutar ahora
                </button>
                <span id="lblResultadoInactivacion" class="ml-2" style="font-size:.82rem;"></span>
            </div>
        </div>
    </div>

    <%-- ══════════════════════════════════════
         SECCIÓN 2: HORARIO SEMANAL
         ══════════════════════════════════════ --%>
    <div class="cfg-card" id="divHorarioCard" style="display:none;">
        <div class="cfg-card-header">
            <i class="fa fa-clock-o cfg-icon"></i>
            <h5>Horario Semanal Base</h5>
        </div>
        <div class="cfg-card-body">
            <p class="text-muted" style="font-size:.82rem;">
                Activá los días que trabajás y definí el rango de horas. 
                Los bloqueos puntuales se configuran en la sección de abajo.
            </p>
            <div class="dias-grid" id="diasGrid">
                <%-- Se renderizan los 7 días --%>
            </div>
            <div class="text-right mt-4">
                <button class="btn btn-primary btn-style" onclick="guardarHorarioSemanal()">
                    <i class="fa fa-save"></i> Guardar Horario
                </button>
            </div>
        </div>
    </div>

    <%-- ══════════════════════════════════════
         SECCIÓN 3: TIEMPOS DE COMIDA
         ══════════════════════════════════════ --%>
    <div class="cfg-card" id="divTiemposComidaCard" style="display:none;">
        <div class="cfg-card-header cfg-card-header--amber">
            <i class="fa fa-cutlery cfg-icon"></i>
            <h5>Tiempos de Comida</h5>
        </div>
        <div class="cfg-card-body">
            <p class="text-muted" style="font-size:.82rem;">
                Configur&aacute; tus horarios de comida para bloquear esos slots autom&aacute;ticamente.
                Los pacientes no podr&aacute;n agendar citas en esos rangos de hora.
            </p>
            <div class="comidas-grid" id="comidasGrid">
                <%-- Se renderizan los 5 tiempos de comida --%>
            </div>
            <div class="text-right mt-4">
                <button class="btn btn-primary btn-style" onclick="guardarTiemposComida()">
                    <i class="fa fa-save"></i> Guardar Tiempos de Comida
                </button>
            </div>
        </div>
    </div>

    <%-- ══════════════════════════════════════
         SECCIÓN 4: BLOQUEOS PUNTUALES
         ══════════════════════════════════════ --%>
    <div class="cfg-card" id="divBloqueosCard" style="display:none;">
        <div class="cfg-card-header">
            <i class="fa fa-ban cfg-icon"></i>
            <h5>Bloqueos Puntuales</h5>
        </div>
        <div class="cfg-card-body">
            <%-- Formulario nuevo bloqueo --%>
            <div class="card bg-light mb-4" style="border-radius:10px;">
                <div class="card-body">
                    <h6 class="mb-3">Agregar bloqueo</h6>
                    <div class="form-row">
                        <div class="form-group col-md-3">
                            <label class="input__label">Tipo</label>
                            <select id="cboTipoBloqueo" class="form-control input-style"
                                    onchange="toggleTipoBloqueo()">
                                <option value="D">Día completo</option>
                                <option value="H">Rango de horas</option>
                            </select>
                        </div>
                        <div class="form-group col-md-3">
                            <label class="input__label">Fecha inicio</label>
                            <input type="date" id="txtBloqueoFechaInicio"
                                   class="form-control input-style">
                        </div>
                        <div class="form-group col-md-3" id="divBloqueoFechaFin">
                            <label class="input__label">Fecha fin</label>
                            <input type="date" id="txtBloqueoFechaFin"
                                   class="form-control input-style">
                        </div>
                        <div class="form-group col-md-3 d-none" id="divBloqueoHoras">
                            <label class="input__label">Hora inicio — Hora fin</label>
                            <div class="d-flex gap-2">
                                <input type="time" id="txtBloqueoHoraInicio"
                                       class="form-control input-style">
                                <input type="time" id="txtBloqueoHoraFin"
                                       class="form-control input-style">
                            </div>
                        </div>
                        <div class="form-group col-md-6">
                            <label class="input__label">Motivo (opcional)</label>
                            <input type="text" id="txtBloqueoMotivo"
                                   class="form-control input-style"
                                   placeholder="Ej: Vacaciones, Congreso...">
                        </div>
                    </div>
                    <button class="btn btn-danger btn-style" onclick="guardarBloqueo()">
                        <i class="fa fa-ban"></i> Agregar Bloqueo
                    </button>
                </div>
            </div>

            <%-- Lista de bloqueos activos --%>
            <div id="divListaBloqueos">
                <p class="text-muted text-center" style="font-size:.82rem;">
                    Cargando bloqueos...
                </p>
            </div>
        </div>
    </div>

    <%-- ══════════════════════════════════════
         SECCIÓN 5: PENALIZACIONES (solo admin/médico)
         ══════════════════════════════════════ --%>
    <div class="cfg-card" id="divPenalizacionesCard" style="display:none;">
        <div class="cfg-card-header">
            <i class="fa fa-exclamation-triangle cfg-icon"></i>
            <h5>Penalizaciones de Usuarios</h5>
        </div>
        <div class="cfg-card-body">
            <p class="text-muted" style="font-size:.82rem;">
                Usuarios que han superado el límite de cancelaciones para este médico.
                Podés levantar la penalización manualmente.
            </p>
            <div id="divListaPenalizaciones">
                <p class="text-center text-muted">Cargando...</p>
            </div>
        </div>
    </div>

    <%-- BOTÓN GUARDAR CONFIG GENERAL --%>
    <div class="text-right mb-5">
        <button class="btn btn-secondary btn-style mr-2" onclick="regresar()">
            <i class="fa fa-arrow-left"></i> Regresar
        </button>
        <button class="btn btn-success btn-style" onclick="guardarConfigGeneral()">
            <i class="fa fa-save"></i> Guardar Configuración General
        </button>
    </div>

    <script src="../JavaScript/ConfigAgenda.js"></script>
</asp:Content>