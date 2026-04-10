<%@ Page Title="" Language="C#" MasterPageFile="~/Mantenimientos/frmPrincipalMaster.Master" 
    AutoEventWireup="true" CodeBehind="frmMiPerfil.aspx.cs" 
    Inherits="PL_CRUD_CONSULTAS.Mantenimientos.frmMiPerfil" %>

<asp:Content ID="Content1" ContentPlaceHolderID="head" runat="server">
    <link rel="stylesheet" href="../Base/assets/css/styleCommon.css" />
</asp:Content>

<asp:Content ID="Content2" ContentPlaceHolderID="ContentPlaceHolder1" runat="server">
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>

    <nav aria-label="breadcrumb">
        <ol class="breadcrumb my-breadcrumb">
            <li class="breadcrumb-item"><a href="frmPrincipal.aspx">Inicio</a></li>
            <li class="breadcrumb-item active" aria-current="page">Mi Perfil</li>
        </ol>
    </nav>

    <div class="welcome-msg pt-3 pb-4">
        <h1>Hola <span class="text-primary" id="nombreUsuario"></span>, Bienvenido</h1>
        <p id="emlUsuario"></p>
    </div>

    <div class="card card_border py-2 mb-4">
        <div class="cards__heading">
            <h3>Mi Perfil <span></span></h3>
        </div>
        <div class="card-body">

            <%-- DATOS DE SOLO LECTURA --%>
            <div class="card card_border py-2 mb-4" style="background:#f8f9fa;">
                <div class="card-body">
                    <div style="font-size:0.8rem;font-weight:700;color:#6c757d;text-transform:uppercase;
                        letter-spacing:0.5px;margin-bottom:1rem;">
                        📋 Información personal (solo lectura)
                    </div>
                    <div class="form-row">
                        <div class="form-group col-md-4">
                            <label class="input__label">Nombre</label>
                            <input type="text" class="form-control input-style" id="lblNom" disabled>
                        </div>
                        <div class="form-group col-md-4">
                            <label class="input__label">Primer Apellido</label>
                            <input type="text" class="form-control input-style" id="lblApe1" disabled>
                        </div>
                        <div class="form-group col-md-4">
                            <label class="input__label">Segundo Apellido</label>
                            <input type="text" class="form-control input-style" id="lblApe2" disabled>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group col-md-4">
                            <label class="input__label">C&eacute;dula</label>
                            <input type="text" class="form-control input-style" id="lblCedula" disabled>
                        </div>
                        <div class="form-group col-md-4" id="rowFchNac">
                            <label class="input__label">Fecha de Nacimiento</label>
                            <input type="text" class="form-control input-style" id="lblFchNac" disabled>
                        </div>
                        <div class="form-group col-md-4" id="rowSexo">
                            <label class="input__label">Sexo</label>
                            <input type="text" class="form-control input-style" id="lblSexo" disabled>
                        </div>
                    </div>
                </div>
            </div>

            <%-- DATOS EDITABLES --%>
            <div style="font-size:0.8rem;font-weight:700;color:#495057;text-transform:uppercase;
                letter-spacing:0.5px;margin-bottom:1rem;">
                ✏️ Datos que puedes modificar
            </div>

            <form action="javascript: guardarPerfil()" method="post">
                <div class="form-row">
                    <div class="form-group col-md-6">
                        <label for="txtTel" class="input__label">Teléfono</label>
                        <input type="text" class="form-control input-style" id="txtTel" 
                            placeholder="Teléfono">
                    </div>
                    <div class="form-group col-md-6">
                        <label for="txtEml" class="input__label">Correo Electrónico *</label>
                        <input type="email" class="form-control input-style" id="txtEml" 
                            placeholder="correo@ejemplo.com" required>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group col-md-6">
                        <label for="txtPwd" class="input__label">Nueva Contraseña</label>
                        <div style="position:relative;">
                            <input type="password" class="form-control input-style" id="txtPwd"
                                placeholder="Dejá vacío para no cambiarla" maxlength="100"
                                style="padding-right:42px;">
                            <button type="button" class="pwd-eye-btn" onclick="togglePwd('txtPwd', this)"
                                title="Mostrar/ocultar contraseña"
                                style="position:absolute;right:10px;top:50%;transform:translateY(-50%);
                                    background:none;border:none;cursor:pointer;color:#6c757d;padding:0;">
                                <i class="fa fa-eye"></i>
                            </button>
                        </div>
                        <small class="form-text text-muted">
                            Dejá este campo vacío si no querés cambiar tu contraseña.
                        </small>
                    </div>
                    <div class="form-group col-md-6">
                        <label for="txtPwdConfirm" class="input__label">Confirmar Contraseña</label>
                        <div style="position:relative;">
                            <input type="password" class="form-control input-style" id="txtPwdConfirm"
                                placeholder="Repetí la nueva contraseña" maxlength="100"
                                style="padding-right:42px;">
                            <button type="button" class="pwd-eye-btn" onclick="togglePwd('txtPwdConfirm', this)"
                                title="Mostrar/ocultar contraseña"
                                style="position:absolute;right:10px;top:50%;transform:translateY(-50%);
                                    background:none;border:none;cursor:pointer;color:#6c757d;padding:0;">
                                <i class="fa fa-eye"></i>
                            </button>
                        </div>
                    </div>
                </div>

                <button type="submit" class="btn btn-primary btn-style mt-4">
                    💾 Guardar cambios
                </button>
                <button type="button" class="btn btn-secondary btn-style mt-4" 
                    onclick="javascript: regresar()">
                    Regresar
                </button>
            </form>
        </div>
    </div>

    <script src="../JavaScript/MiPerfil.js"></script>
</asp:Content>