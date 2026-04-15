<%@ Page Title="" Language="C#" MasterPageFile="~/Mantenimientos/frmPrincipalMaster.Master" AutoEventWireup="true" CodeBehind="frmMantenimientoUsuarios.aspx.cs" Inherits="PL_CRUD_CONSULTAS.Mantenimientos.frmMantenimientoUsuarios" %>
<asp:Content ID="Content1" ContentPlaceHolderID="head" runat="server">
    <link rel="stylesheet" href="../Base/assets/css/styleCommon.css" />
</asp:Content>
<asp:Content ID="Content2" ContentPlaceHolderID="ContentPlaceHolder1" runat="server">
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <nav aria-label="breadcrumb">
      <ol class="breadcrumb my-breadcrumb">
        <li class="breadcrumb-item"><a href="frmPrincipal.aspx">Inicio</a></li>
        <li class="breadcrumb-item"><a href="frmConsultaUsuarios.aspx">Consulta de Usuarios</a></li>
        <li class="breadcrumb-item active" aria-current="page">Mantenimiento de Usuarios</li>
      </ol>
    </nav>
    <div class="welcome-msg pt-3 pb-4">
      <h1>Hola <span class="text-primary" id="nombreUsuario"></span>, Bienvenido</h1>
      <p id="emlUsuario"></p>
    </div>
    <div class="card card_border py-2 mb-4">
		<div class="cards__heading">
            <h3>Mantenimiento de Información de Usuarios <span></span></h3>
        </div>
        <div class="card-body">
            <form action="javascript: mantenimientoUsuario()" method="post">
                        <%-- FILA 2: Cédula (CON BOTÓN DE BÚSQUEDA) y Fecha de Nacimiento --%>
            <div class="form-row">
                <div class="form-group col-md-6">
                    <label for="txtCedula" class="input__label">Cédula *</label>
                    <div class="input-group">
                        <input type="text" class="form-control input-style" id="txtCedula" placeholder="Ingrese cédula" required>
                        <div class="input-group-append">
                            <button class="btn btn-primary" type="button" onclick="consultarCedulaAPI()">
                                <i class="fa fa-search"></i> Buscar
                            </button>
                        </div>
                    </div>
                    <small class="form-text text-muted">Consulta automática en el Registro Nacional</small>
                </div>
                <div class="form-group col-md-6">
                    <label for="txtFchNac" class="input__label">Fecha de Nacimiento *</label>
                    <input type="date" class="form-control input-style" id="txtFchNac" required>
                </div>
            </div> 
               <%-- FILA 1: Nombre, Primer Apellido, Segundo Apellido --%>
               <div class="form-row">
                   <div class="form-group col-md-4">
                        <label for="txtNom" class="input__label">Nombre *</label>
                        <input type="text" class="form-control input-style" id="txtNom"
                            placeholder="Nombre del Usuario" required="" maxlength="50">
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

    <%-- FILA 3: Teléfono y Correo --%>
        <div class="form-row">
            <div class="form-group col-md-6">
                <label for="txtTel" class="input__label">Teléfono</label>
                <input type="text" class="form-control input-style" id="txtTel" placeholder="Teléfono">
            </div>
            <div class="form-group col-md-6">
                <label for="txtEml" class="input__label">Correo Electrónico *</label>
                <input type="email" class="form-control input-style" id="txtEml" placeholder="correo@ejemplo.com" required>
            </div>
        </div>

        <%-- FILA 4: Password --%>
        <div class="form-row" id="rowPwd" style="display:none;">
            <div class="form-group col-md-6">
               <label for="txtPwd" class="input__label">Nueva Contraseña</label>
                <div class="input-group">
                    <input type="password" class="form-control input-style" id="txtPwd" placeholder="Se generará automáticamente al crear" maxlength="100">
                    <div class="input-group-append">
                        <button class="btn btn-outline-secondary" type="button" onclick="togglePassword('txtPwd', this)" title="Mostrar/Ocultar contraseña">
                            <i class="fa fa-eye"></i>
                        </button>
                    </div>
                </div>
                <small class="form-text text-muted">Dejar vacío para no cambiar la contraseña.</small>
            </div>
            <%-- ✅ NUEVO: Sexo --%>
            <div class="form-group col-md-6">
                <label for="txtSexo" class="input__label">Sexo *</label>
                <select class="form-control input-style" id="txtSexo">
                    <option value="">Seleccione...</option>
                    <option value="M">Masculino</option>
                    <option value="F">Femenino</option>
                </select>
            </div>
        </div>

        <%-- FILA 5: Observaciones --%>
        <div class="form-row">
            <div class="form-group col-md-12">
                <label for="txtObs" class="input__label">Observaciones</label>
                <textarea class="form-control input-style" id="txtObs" rows="3" placeholder="Observaciones adicionales" maxlength="500"></textarea>
            </div>
        </div>

        <%-- FILA 6: Estado --%>
        <div class="form-row">
            <div class="form-group col-md-6">
                <label for="cboSts" class="input__label">Estado *</label>
                <select id="cboSts" class="form-control input-style" required>
                    <option value="A">Activo</option>
                    <option value="I">Inactivo</option>
                </select>
            </div>
        </div>                
                <button type="submit" class="btn btn-primary btn-style mt-4">Guardar</button>
                <button type="button" class="btn btn-primary btn-style mt-4" onclick="javascript: regresar()">Regresar</button>
            </form>
        </div>
    </div>
    <script src="../JavaScript/Usuarios.js"></script>
</asp:Content>