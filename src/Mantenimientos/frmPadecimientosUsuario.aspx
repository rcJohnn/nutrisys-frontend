<%@ Page Title="" Language="C#" MasterPageFile="~/Mantenimientos/frmPrincipalMaster.Master" AutoEventWireup="true" CodeBehind="frmPadecimientosUsuario.aspx.cs" Inherits="PL_CRUD_CONSULTAS.Mantenimientos.frmPadecimientosUsuario" %>
<asp:Content ID="Content1" ContentPlaceHolderID="head" runat="server">
    <link rel="stylesheet" href="../Base/assets/css/styleCommon.css" />
</asp:Content>
<asp:Content ID="Content2" ContentPlaceHolderID="ContentPlaceHolder1" runat="server">
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    
    <nav aria-label="breadcrumb">
      <ol class="breadcrumb my-breadcrumb">
        <li class="breadcrumb-item"><a href="frmPrincipal.aspx">Inicio</a></li>
        <li class="breadcrumb-item"><a href="frmConsultaUsuarios.aspx">Consulta de Usuarios</a></li>
        <li class="breadcrumb-item active" aria-current="page">Padecimientos del Usuario</li>
      </ol>
    </nav>
    
    <div class="welcome-msg pt-3 pb-4">
      <h1>Hola <span class="text-primary" id="nombreUsuario"></span>, Bienvenido</h1>
      <p id="emlUsuario"></p>
    </div>

    <%-- INFORMACIÓN DEL USUARIO --%>
    <div class="card card_border py-2 mb-4">
		<div class="cards__heading">
            <h3>Información del Usuario <span></span></h3>
        </div>
        <div class="card-body">
            <div class="form-row">
                <div class="form-group col-md-6">
                    <label class="input__label">Nombre:</label>
                    <p id="lblNombreUsuario" class="form-control-plaintext"><strong>-</strong></p>
                </div>
                <div class="form-group col-md-6">
                    <label class="input__label">Correo:</label>
                    <p id="lblCorreoUsuario" class="form-control-plaintext"><strong>-</strong></p>
                </div>
            </div>
        </div>
    </div>

    <%-- GESTIÓN DE PADECIMIENTOS --%>
    <div class="card card_border py-2 mb-4">
		<div class="cards__heading">
            <h3>Asignar Padecimientos <span></span></h3>
        </div>
        <div class="card-body">
            <p class="text-muted">Seleccione los padecimientos que tiene el usuario. Estos serán usados para excluir alimentos contraindicados en los planes nutricionales.</p>
            
            <div class="form-row">
                <div class="form-group col-md-12">
                    <label for="cboPadecimientos" class="input__label">Padecimientos Disponibles</label>
                    <select id="cboPadecimientos" class="form-control input-style">
                        <option value="0">Seleccione un padecimiento...</option>
                    </select>
                </div>
            </div>
            
            <button type="button" class="btn btn-success btn-style mt-2" onclick="javascript: asignarPadecimiento()">
                <i class="fa fa-plus"></i> Asignar Padecimiento
            </button>
        </div>
    </div>

    <%-- LISTA DE PADECIMIENTOS ASIGNADOS --%>
    <div class="card card_border py-2 mb-4">
		<div class="cards__heading">
            <h3>Padecimientos Asignados <span></span></h3>
        </div>
        <div class="card-body">
            <table id="tblPadecimientos" class="table table-striped table-bordered">
                <%--Aquí se carga el contenido dinámico de la tabla--%>
            </table>
        </div>
    </div>

    <div class="text-center mt-4">
        <button type="button" class="btn btn-primary btn-style" onclick="javascript: regresar()">Regresar a Usuarios</button>
    </div>

    <script src="../JavaScript/PadecimientosUsuario.js"></script>
</asp:Content>