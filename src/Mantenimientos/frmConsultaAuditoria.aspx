<%@ Page Title="" Language="C#" MasterPageFile="~/Mantenimientos/frmPrincipalMaster.Master" AutoEventWireup="true" CodeBehind="frmConsultaAuditoria.aspx.cs" Inherits="PL_CRUD_CONSULTAS.Mantenimientos.frmConsultaAuditoria" %>
<asp:Content ID="Content1" ContentPlaceHolderID="head" runat="server">
    <link rel="stylesheet" href="../Base/assets/css/styleCommon.css" />
</asp:Content>
<asp:Content ID="Content2" ContentPlaceHolderID="ContentPlaceHolder1" runat="server">
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    
    <nav aria-label="breadcrumb">
      <ol class="breadcrumb my-breadcrumb">
        <li class="breadcrumb-item"><a href="frmPrincipal.aspx">Inicio</a></li>
        <li class="breadcrumb-item active" aria-current="page">Consulta de Auditoría</li>
      </ol>
    </nav>
    <div class="welcome-msg pt-3 pb-4">
      <h1>Hola <span class="text-primary" id="nombreUsuario"></span>, Bienvenido</h1>
      <p id="emlUsuario"></p>
    </div>
    <div class="card card_border py-2 mb-4">
		<div class="cards__heading">
            <h3>Filtros de Búsqueda de Auditoría <span></span></h3>
        </div>
        <div class="card-body">
            <form action="javascript: cargaListaAuditoria()" method="post">
               <div class="form-row">
                    <%-- 1️⃣ COMBO DE USUARIOS (se llena dinámicamente desde JS) --%>
                    <div class="form-group col-md-4">
                        <label for="bsqUsuario" class="input__label">Usuario / Médico</label>
                        <select id="bsqUsuario" class="form-control input-style">
                            <option value="0">-- Todos --</option>
                        </select>
                    </div>

                    <%-- 2️⃣ NUEVO: COMBO DE TIPO ENTIDAD --%>
                    <div class="form-group col-md-4">
                        <label for="bsqTipoEntidad" class="input__label">Tipo Entidad</label>
                        <select id="bsqTipoEntidad" class="form-control input-style">
                            <option value="">-- Todos --</option>
                            <option value="U">Usuario</option>
                            <option value="M">Médico</option>
                        </select>
                    </div>

                    <%-- 3️⃣ COMBO DE ACCIÓN (corregido) --%>
                    <div class="form-group col-md-4">
                        <label for="bsqAccion" class="input__label">Acción</label>
                        <select id="bsqAccion" class="form-control input-style">
                            <option value="">-- Todas --</option>
                            <option value="I">Inicio Sesión</option>
                            <option value="C">Cierre Sesión</option>
                            <option value="A">Actualización</option>
                            <option value="E">Eliminación</option>
                        </select>
                    </div>
                </div>
                <div class="form-row">
                    <%-- 4️⃣ FECHAS: quitamos required="" para permitir buscar sin fechas --%>
                    <div class="form-group col-md-6">
                        <label for="bsqFdd" class="input__label">Fecha Desde</label>
                        <input type="date" class="form-control input-style" id="bsqFdd">
                    </div>
                   <div class="form-group col-md-6">
                        <label for="bsqFhh" class="input__label">Fecha Hasta</label>
                        <input type="date" class="form-control input-style" id="bsqFhh">
                    </div>
                </div>
                <button type="submit" class="btn btn-primary btn-style mt-4">Buscar</button>
                <%-- 5️⃣ NUEVO: Botón para limpiar filtros --%>
                <button type="button" class="btn btn-secondary btn-style mt-4" onclick="limpiarFiltros()">Limpiar</button>
            </form>
        </div>
    </div>
    <div class="card card_border py-2 mb-4">
		<div class="cards__heading">
            <h3>Resultados de Búsqueda de Auditorías <span></span></h3>
        </div>
        <div class="card-body">
            <%-- 6️⃣ IMPORTANTE: Agregar clase table para DataTables --%>
            <table id="tblAuditoria" class="table table-striped table-bordered">
            <%--Aquí se carga el contenido dinámico de la tabla--%>
            </table>
        </div>
    </div>
    <script src="../JavaScript/Auditoria.js"></script>
</asp:Content>