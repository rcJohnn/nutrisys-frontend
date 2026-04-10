<%@ Page Title="" Language="C#" MasterPageFile="~/Mantenimientos/frmPrincipalMaster.Master" AutoEventWireup="true" CodeBehind="frmConsultaMedicos.aspx.cs" Inherits="PL_CRUD_CONSULTAS.Mantenimientos.frmConsultaMedicos" %>
<asp:Content ID="Content1" ContentPlaceHolderID="head" runat="server">
    <link rel="stylesheet" href="../Base/assets/css/styleCommon.css" />
</asp:Content>
<asp:Content ID="Content2" ContentPlaceHolderID="ContentPlaceHolder1" runat="server">
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    
    <nav aria-label="breadcrumb">
      <ol class="breadcrumb my-breadcrumb">
        <li class="breadcrumb-item"><a href="frmPrincipal.aspx">Inicio</a></li>
        <li class="breadcrumb-item active" aria-current="page">Consulta de Médicos</li>
      </ol>
    </nav>
    <div class="welcome-msg pt-3 pb-4">
      <h1>Hola <span class="text-primary" id="nombreUsuario"></span>, Bienvenido</h1>
      <p id="emlUsuario"></p>
    </div>
    <div class="card card_border py-2 mb-4">
		<div class="cards__heading">
            <h3>Filtros de Búsqueda de Médicos <span></span></h3>
        </div>
        <div class="card-body">
            <%-- ✅ Cambiar función a cargaListaMedicos --%>
            <form action="javascript: cargaListaMedicos()" method="post">
               <div class="form-row">
                    <div class="form-group col-md-6">
                        <label for="bsqCorreo" class="input__label">Correo</label>
                        <input type="text" class="form-control input-style" id="bsqCorreo"
                            placeholder="Correo del Médico" maxlength="50">
                    </div>
                </div>
                <div class="form-row">
                    <%-- ✅ Cambiar label y placeholder a Médico --%>
                    <div class="form-group col-md-6">
                        <label for="bsqMedico" class="input__label">Médico</label>
                        <input type="text" class="form-control input-style" id="bsqMedico"
                            placeholder="Nombre del Médico" maxlength="50">
                    </div>
                    <div class="form-group col-md-6">
                        <label for="bsqEstado" class="input__label">Estado</label>
                        <select id="bsqEstado" class="form-control input-style">
                            <option value="A">Activo</option>
                            <option value="I">Inactivo</option>
                        </select>
                    </div>
                </div>
                <button type="submit" class="btn btn-primary btn-style mt-4">Buscar</button>
                <%-- ✅ Cambiar función a crearMedico --%>
                <button type="button" class="btn btn-primary btn-style mt-4" onclick="javascript: crearMedico()">Crear</button>
            </form>
        </div>
    </div>
    <div class="card card_border py-2 mb-4">
		<div class="cards__heading">
            <%-- ✅ Cambiar título a Médicos --%>
            <h3>Resultados de Búsqueda de Médicos <span></span></h3>
        </div>
        <div class="card-body">
            <%-- ✅ Cambiar ID de tabla --%>
            <table id="tblMedicos" class="table table-striped table-bordered">
            <%--Aquí se carga el contenido dinámico de la tabla--%>
            </table>
        </div>
    </div>
    <%-- ✅ Cambiar archivo JS a Medicos.js --%>
    <script src="../JavaScript/Medicos.js"></script>
</asp:Content>