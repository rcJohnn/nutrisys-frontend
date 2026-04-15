<%@ Page Title="" Language="C#" MasterPageFile="~/Mantenimientos/frmPrincipalMaster.Master" AutoEventWireup="true" CodeBehind="frmConsultaAlimentos.aspx.cs" Inherits="PL_CRUD_CONSULTAS.Mantenimientos.frmConsultaAlimentos" %>
<asp:Content ID="Content1" ContentPlaceHolderID="head" runat="server">
    <link rel="stylesheet" href="../Base/assets/css/styleCommon.css" />
</asp:Content>
<asp:Content ID="Content2" ContentPlaceHolderID="ContentPlaceHolder1" runat="server">
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    
    <nav aria-label="breadcrumb">
      <ol class="breadcrumb my-breadcrumb">
        <li class="breadcrumb-item"><a href="frmPrincipal.aspx">Inicio</a></li>
        <li class="breadcrumb-item active" aria-current="page">Consulta de Alimentos</li>
      </ol>
    </nav>
    <div class="welcome-msg pt-3 pb-4">
      <h1>Hola <span class="text-primary" id="nombreUsuario"></span>, Bienvenido</h1>
      <p id="emlUsuario"></p>
    </div>
    <div class="card card_border py-2 mb-4">
		<div class="cards__heading">
            <h3>Filtros de Búsqueda de Alimentos <span></span></h3>
        </div>
        <div class="card-body">
            <form action="javascript: cargaListaAlimentos()" method="post">
               <div class="form-row">
                    <div class="form-group col-md-6">
                        <label for="bsqNombre" class="input__label">Nombre del Alimento</label>
                        <input type="text" class="form-control input-style" id="bsqNombre"
                            placeholder="Nombre del Alimento" maxlength="150">
                    </div>
                </div>
                <button type="submit" class="btn btn-primary btn-style mt-4">Buscar</button>
                <button type="button" class="btn btn-primary btn-style mt-4" onclick="javascript: crearAlimento()">Crear</button>
            </form>
        </div>
    </div>
    <div class="card card_border py-2 mb-4">
		<div class="cards__heading">
            <h3>Resultados de Búsqueda de Alimentos <span></span></h3>
        </div>
        <div class="card-body">
            <table id="tblAlimentos" class="table table-striped table-bordered">
            <%--Aquí se carga el contenido dinámico de la tabla--%>
            </table>
        </div>
    </div>
    <script src="../JavaScript/Alimentos.js"></script>
</asp:Content>