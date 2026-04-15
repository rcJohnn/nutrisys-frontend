<%@ Page Title="" Language="C#" MasterPageFile="~/Mantenimientos/frmPrincipalMaster.Master" AutoEventWireup="true" CodeBehind="frmMantenimientoConsultas.aspx.cs" Inherits="PL_CRUD_CONSULTAS.Mantenimientos.frmMantenimientoConsultas" %>
<asp:Content ID="Content1" ContentPlaceHolderID="head" runat="server">
    <link rel="stylesheet" href="../Base/assets/css/styleCommon.css" />
    <link rel="stylesheet" href="../Base/assets/css/styleMantenimientoConsultas.css" />
</asp:Content>

<asp:Content ID="Content2" ContentPlaceHolderID="ContentPlaceHolder1" runat="server">
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>

    <nav aria-label="breadcrumb">
      <ol class="breadcrumb my-breadcrumb">
        <li class="breadcrumb-item"><a href="frmPrincipal.aspx">Inicio</a></li>
        <li class="breadcrumb-item" id="breadcrumbConsultas" style="display:none;">
            <a href="frmConsultaConsultas.aspx">Consulta de Citas</a>
        </li>
        <li class="breadcrumb-item active" id="breadcrumbActual">Agendar Cita</li>
      </ol>
    </nav>

    <div class="welcome-msg pt-3 pb-4">
        <h1 id="tituloFormulario">Agendar Cita</h1>
        <p id="subtituloFormulario" class="text-muted"></p>
    </div>

    <div class="card card_border py-2 mb-4">
        <div class="cards__heading">
            <h3 id="tituloCard">Nueva Cita Medica</h3>
        </div>
        <div class="card-body">
            <form action="javascript: mantenimientoConsulta()" method="post">

                <%-- ════════════════════════════════
                     MODO AUTOAGENDAMIENTO (paciente)
                     Muestra nombre en lugar de combo
                     ════════════════════════════════ --%>
                <div id="divPacienteDisplay" style="display:none;" class="form-row mb-3">
                    <div class="form-group col-md-12">
                        <label class="input__label">Paciente</label>
                        <div class="paciente-badge">
                            <i class="fa fa-user-circle"></i>
                            <span id="txtNombrePacienteDisplay"></span>
                        </div>
                    </div>
                </div>

                <%-- FILA 1: Paciente (admin/médico) y Médico --%>
                <div class="form-row">
                    <div class="form-group col-md-6" id="divCboUsuario">
                        <label class="input__label">Paciente *</label>
                        <input type="hidden" id="hdnIdPaciente" value="0">
                        <div style="position:relative;">
                            <input type="text" id="txtBuscarPaciente" class="form-control input-style"
                                placeholder="Busca por nombre o apellido..." autocomplete="off"
                                oninput="mcFiltrarPacientes(this.value)"
                                onfocus="mcFiltrarPacientes(this.value)">
                            <div id="divResultadosPaciente" class="gp-search-results" style="display:none;"></div>
                        </div>
                        <div id="divPacienteBadge" style="display:none; margin-top:8px;">
                            <span class="badge badge-pill"
                                style="background:var(--ev-primary,#006c49);color:#fff;font-size:0.85rem;padding:6px 12px;">
                                <i class="fa fa-user"></i>
                                <span id="lblPacienteBadge"></span>
                                <a href="javascript:void(0)" onclick="mcLimpiarPaciente()"
                                    style="color:#fff;margin-left:8px;" title="Cambiar paciente">&times;</a>
                            </span>
                        </div>
                    </div>
                    <div class="form-group col-md-6">
                        <label for="cboMedico" class="input__label">Medico *</label>
                        <select id="cboMedico" class="form-control input-style" required
                                onchange="onMedicoChange()">
                            <option value="0">Seleccione un medico...</option>
                        </select>
                    </div>
                </div>

                <%-- FILA: Clínica (se muestra solo cuando el médico tiene clínicas) --%>
                <div class="form-row" id="divClinica" style="display:none;">
                    <div class="form-group col-md-12">
                        <label class="input__label">
                            <i class="fa fa-hospital-o"></i> Clinica de Atencion
                        </label>
                        <input type="hidden" id="cboClinica" value="0">
                        <div id="divClinicaCards"></div>
                        <small class="form-text text-muted" id="msgClinica"></small>
                    </div>
                </div>

                <%-- FILA 2: Fecha --%>
                <div class="form-row">
                    <div class="form-group col-md-4">
                        <label for="txtFechaCita" class="input__label">Fecha de la Cita *</label>
                        <input type="date" class="form-control input-style" id="txtFechaCita"
                               required onchange="onFechaChange()">
                    </div>

                    <%-- Hora manual (admin / médico / edición) --%>
                    <div class="form-group col-md-4" id="divHoraManual">
                        <label for="txtHoraCita" class="input__label">Hora de la Cita *</label>
                        <input type="time" class="form-control input-style" id="txtHoraCita">
                    </div>

                    <div class="form-group col-md-4" id="divDuracionWrapper">
                        <label for="txtDuracion" class="input__label">Duracion (minutos) *</label>
                        <input type="number" class="form-control input-style" id="txtDuracion"
                               value="30" min="15" max="180" step="15" required>
                    </div>
                </div>

                <%-- SELECTOR DE SLOTS (autoagendamiento) --%>
                <div id="divSlotsWrapper" style="display:none;" class="form-row">
                    <div class="form-group col-md-12">
                        <label class="input__label">Horario disponible *</label>
                        <div id="divSlotsGrid" class="slots-grid">
                            <p class="text-muted" style="font-size:.82rem;">
                                Seleccione medico y fecha para ver los horarios disponibles.
                            </p>
                        </div>
                        <small id="msgSlotsInfo" class="text-muted d-block mt-1"></small>
                    </div>
                </div>

                <%-- Campos ocultos para modo autoagendamiento --%>
                <input type="hidden" id="hdnHoraSeleccionada" value="">
                <input type="hidden" id="hdnDuracionAuto" value="30">

                <%-- FILA 3: Motivo --%>
                <div class="form-row">
                    <div class="form-group col-md-12">
                        <label for="txtMotivo" class="input__label">Motivo de la Consulta</label>
                        <textarea class="form-control input-style" id="txtMotivo" rows="3"
                                  placeholder="Describa brevemente el motivo de la consulta" maxlength="500"></textarea>
                    </div>
                </div>

                <%-- FILA 4: Estado (solo modo edición admin/médico) --%>
                <div class="form-row" id="divEstado" style="display:none;">
                    <div class="form-group col-md-6">
                        <label for="cboEstado" class="input__label">Estado</label>
                        <select id="cboEstado" class="form-control input-style">
                            <option value="P">Pendiente</option>
                            <option value="C">Completada</option>
                            <option value="X">Cancelada</option>
                            <option value="N">No Asistió</option>
                        </select>
                    </div>
                </div>

                <%-- Botones --%>
                <button type="submit" class="btn btn-primary btn-style mt-4">
                    <i class="fa fa-save"></i> <span id="btnGuardarTxt">Agendar Cita</span>
                </button>
                <button type="button" class="btn btn-secondary btn-style mt-4" onclick="regresar()">
                    <i class="fa fa-arrow-left"></i> Regresar
                </button>
            </form>
        </div>
    </div>

    <script src="../JavaScript/MantenimientoConsultas.js"></script>
</asp:Content>
