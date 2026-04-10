<%@ Page Title="" Language="C#" MasterPageFile="~/Mantenimientos/frmPrincipalMaster.Master" AutoEventWireup="true" CodeBehind="frmMantenimientoMedicos.aspx.cs" Inherits="PL_CRUD_CONSULTAS.Mantenimientos.frmMantenimientoMedicos" %>
<asp:Content ID="Content1" ContentPlaceHolderID="head" runat="server">
    <link rel="stylesheet" href="../Base/assets/css/styleCommon.css" />
    <style>
        /* ── Panel Clínicas ── */
        .clinicas-panel {
            border: 1px solid var(--border-color, #e2e8f0);
            border-radius: 12px;
            overflow: hidden;
            margin-top: 2rem;
        }
        .clinicas-panel__header {
            background: linear-gradient(135deg, #f8fafc 0%, #eef2ff 100%);
            padding: 1rem 1.4rem;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: space-between;
            border-bottom: 1px solid #e2e8f0;
            user-select: none;
        }
        .clinicas-panel__header:hover { background: #eef2ff; }
        .clinicas-panel__header h5 {
            margin: 0;
            font-size: .95rem;
            font-weight: 600;
            color: #3730a3;
            display: flex;
            align-items: center;
            gap: .5rem;
        }
        .clinicas-panel__chevron {
            color: #6366f1;
            transition: transform .25s;
        }
        .clinicas-panel__chevron.open { transform: rotate(180deg); }
        .clinicas-panel__body { padding: 1.4rem; display: none; }
        .clinicas-panel__body.open { display: block; }

        /* ── Nueva Clínica mini-form ── */
        .clinic-form { background: #f8fafc; border-radius: 10px; padding: 1rem 1.2rem; margin-bottom: 1.4rem; }
        .clinic-form .form-row { margin-bottom: 0; }

        /* ── Logo preview clínica ── */
        #previewLogoClinica {
            border: 1px dashed #cbd5e1;
            border-radius: 8px;
            padding: 8px;
            min-height: 72px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #f1f5f9;
        }
        #imgPreviewClinica { max-width: 150px; max-height: 60px; display: none; }
        #txtNoLogoClinica { color: #94a3b8; font-size: .8rem; margin: 0; }

        /* ── Tabla de clínicas asignadas ── */
        #tblClinicasMedico { width: 100%; font-size: .85rem; }
        #tblClinicasMedico th {
            background: #eef2ff;
            color: #3730a3;
            font-weight: 600;
            padding: .5rem .75rem;
            border-bottom: 2px solid #c7d2fe;
        }
        #tblClinicasMedico td { padding: .5rem .75rem; vertical-align: middle; }
        #tblClinicasMedico tr:nth-child(even) td { background: #f8fafc; }
        .clinic-logo-thumb { width: 36px; height: 36px; object-fit: cover; border-radius: 6px; }
        .btn-quitar-clinica {
            font-size: .75rem;
            padding: .2rem .6rem;
            border-radius: 6px;
        }
        #divNoClinicas { color: #94a3b8; font-size: .85rem; padding: .5rem 0; }
        #divClinicasLoading { font-size: .85rem; color: #6366f1; padding: .5rem 0; }
        .badge-clinica-count {
            background: #6366f1;
            color: #fff;
            font-size: .7rem;
            border-radius: 10px;
            padding: .15rem .5rem;
            margin-left: .3rem;
        }
    </style>
</asp:Content>
<asp:Content ID="Content2" ContentPlaceHolderID="ContentPlaceHolder1" runat="server">
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <nav aria-label="breadcrumb">
      <ol class="breadcrumb my-breadcrumb">
        <li class="breadcrumb-item"><a href="frmPrincipal.aspx">Inicio</a></li>
        <li class="breadcrumb-item"><a href="frmConsultaMedicos.aspx">Consulta de Medicos</a></li>
        <li class="breadcrumb-item active" aria-current="page">Mantenimiento de Medicos</li>
      </ol>
    </nav>
    <div class="welcome-msg pt-3 pb-4">
      <h1>Hola <span class="text-primary" id="nombreUsuario"></span>, Bienvenido</h1>
      <p id="emlUsuario"></p>
    </div>
    <div class="card card_border py-2 mb-4">
        <div class="cards__heading">
            <h3>Mantenimiento de Informacion de Medicos <span></span></h3>
        </div>
        <div class="card-body">
            <form action="javascript: mantenimientoMedico()" method="post">
               <%-- FILA 1: Nombre, Primer Apellido, Segundo Apellido --%>
               <div class="form-row">
                   <div class="form-group col-md-4">
                        <label for="txtNom" class="input__label">Nombre *</label>
                        <input type="text" class="form-control input-style" id="txtNom"
                            placeholder="Nombre del Medico" required="" maxlength="50">
                    </div>
                    <div class="form-group col-md-4">
                        <label for="txtApe1" class="input__label">Primer Apellido *</label>
                        <input type="text" class="form-control input-style" id="txtApe1"
                            placeholder="Primer Apellido" required="" maxlength="50">
                    </div>
                    <div class="form-group col-md-4">
                       <label for="txtApe2" class="input__label">Segundo Apellido *</label>
                        <input type="text" class="form-control input-style" id="txtApe2"
                            placeholder="Segundo Apellido" required="" maxlength="50">
                    </div>
                </div>

                <%-- FILA 2: Cédula, Teléfono --%>
                <div class="form-row">
                    <div class="form-group col-md-6">
                        <label for="txtCed" class="input__label">Cedula *</label>
                        <input type="text" class="form-control input-style" id="txtCed"
                            placeholder="Numero de Cedula" required="" maxlength="20">
                    </div>
                    <div class="form-group col-md-6">
                        <label for="txtTel" class="input__label">Telefono</label>
                        <input type="text" class="form-control input-style" id="txtTel"
                            placeholder="Telefono" maxlength="15">
                    </div>
                </div>

                <%-- FILA 3: Correo, Password --%>
                <div class="form-row">
                    <div class="form-group col-md-6">
                        <label for="txtEml" class="input__label">Correo *</label>
                        <input type="email" class="form-control input-style" id="txtEml"
                            placeholder="Correo Electronico" required="" maxlength="100">
                    </div>
                    <div class="form-group col-md-6">
                       <label for="txtPwd" class="input__label">Contrasena</label>
                        <div class="input-group">
                            <input type="password" class="form-control input-style" id="txtPwd"
                                   placeholder="Se genera automaticamente al crear" maxlength="100">
                            <div class="input-group-append">
                                <button class="btn btn-outline-secondary" type="button"
                                        onclick="togglePassword('txtPwd', this)" title="Mostrar/Ocultar">
                                    <i class="fa fa-eye"></i>
                                </button>
                            </div>
                        </div>
                        <small class="form-text text-muted">Al crear: se genera y envía por correo. Al editar: dejar vacío para no cambiar.</small>
                    </div>
                </div>

                <%-- FILA 4: Estado --%>
                <div class="form-row">
                    <div class="form-group col-md-6">
                        <label for="cboSts" class="input__label">Estado *</label>
                        <select id="cboSts" class="form-control input-style" required="">
                            <option value="A">Activo</option>
                            <option value="I">Inactivo</option>
                        </select>
                    </div>
                </div>

                <button type="submit" class="btn btn-primary btn-style mt-3">
                    <i class="fa fa-save"></i> Guardar
                </button>
                <button type="button" class="btn btn-primary btn-style mt-3" onclick="javascript: regresar()">
                    <i class="fa fa-arrow-left"></i> Regresar
                </button>
            </form>

            <%-- ═══════════════════════════════════════════════════
                 PANEL CLÍNICAS (solo visible al editar un médico)
                 ═══════════════════════════════════════════════════ --%>
            <div id="divPanelClinicas" class="clinicas-panel" style="display:none;">
                <div class="clinicas-panel__header" onclick="togglePanelClinicas()">
                    <h5>
                        <i class="fa fa-hospital-o"></i>
                        Clinicas del Medico
                        <span class="badge-clinica-count" id="badgeClinicaCount">0</span>
                    </h5>
                    <i class="fa fa-chevron-down clinicas-panel__chevron" id="chevronClinicas"></i>
                </div>
                <div class="clinicas-panel__body" id="bodyClinicas">

                    <%-- Mini-form nueva clínica --%>
                    <div class="clinic-form">
                        <h6 style="color:#3730a3;font-weight:600;margin-bottom:.8rem;">
                            <i class="fa fa-plus-circle"></i> Agregar Clinica
                        </h6>
                        <div class="form-row">
                            <div class="form-group col-md-5">
                                <label class="input__label">Nombre *</label>
                                <input type="text" class="form-control input-style" id="txtClinicaNombre"
                                       placeholder="Nombre de la clinica" maxlength="150">
                            </div>
                            <div class="form-group col-md-7">
                                <label class="input__label">Direccion</label>
                                <input type="text" class="form-control input-style" id="txtClinicaDireccion"
                                       placeholder="Direccion de la clinica" maxlength="500">
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group col-md-3">
                                <label class="input__label">Latitud</label>
                                <input type="text" class="form-control input-style" id="txtClinicaLatitud"
                                       placeholder="Ej: 9.9341"
                                       pattern="^-?([0-9]{1,2}|1[0-7][0-9]|180)(\.[0-9]{1,15})?$">
                            </div>
                            <div class="form-group col-md-3">
                                <label class="input__label">Longitud</label>
                                <input type="text" class="form-control input-style" id="txtClinicaLongitud"
                                       placeholder="Ej: -84.0875"
                                       pattern="^-?([0-9]{1,2}|1[0-7][0-9]|180)(\.[0-9]{1,15})?$">
                            </div>
                            <div class="form-group col-md-4">
                                <label class="input__label">Logo</label>
                                <input type="file" class="form-control-file" id="fileLogoClinica"
                                       accept="image/*" onchange="previsualizarLogoClinica()">
                                <small class="form-text text-muted">JPG/PNG/GIF. Max 5MB.</small>
                                <input type="hidden" id="hdnLogoUrlClinica">
                                <input type="hidden" id="hdnIdClinicaEdit" value="0">
                            </div>
                            <div class="form-group col-md-2 d-flex align-items-end">
                                <div id="previewLogoClinica" style="width:100%;">
                                    <img id="imgPreviewClinica" src="" alt="Logo" class="clinic-logo-thumb" style="display:none;">
                                    <p id="txtNoLogoClinica">Sin logo</p>
                                </div>
                            </div>
                        </div>
                        <button type="button" class="btn btn-success btn-sm" onclick="guardarClinica()">
                            <i class="fa fa-check"></i> Guardar Clinica
                        </button>
                        <button type="button" class="btn btn-secondary btn-sm ml-2" onclick="limpiarFormClinica()">
                            <i class="fa fa-times"></i> Limpiar
                        </button>
                    </div>

                    <%-- Listado de clínicas asignadas --%>
                    <div id="divClinicasLoading" style="display:none;">
                        <i class="fa fa-spinner fa-spin"></i> Cargando clínicas...
                    </div>
                    <div id="divNoClinicas" style="display:none;">
                        <i class="fa fa-info-circle"></i> Este medico aun no tiene clinicas asignadas.
                    </div>
                    <div id="divTblClinicas" style="display:none;">
                        <table id="tblClinicasMedico" class="table table-sm">
                            <thead>
                                <tr>
                                    <th>Logo</th>
                                    <th>Nombre</th>
                                    <th>Direccion</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody id="tbodyClinicas"></tbody>
                        </table>
                    </div>

                </div>
            </div>
        </div>
    </div>
    <script src="../JavaScript/Medicos.js"></script>
</asp:Content>
