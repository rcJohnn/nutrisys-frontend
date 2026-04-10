<%@ Page Title="" Language="C#" MasterPageFile="~/Mantenimientos/frmPrincipalMaster.Master" AutoEventWireup="true" CodeBehind="frmConsultaUsuarios.aspx.cs" Inherits="PL_CRUD_CONSULTAS.Mantenimientos.frmConsultaUsuarios" %>
<asp:Content ID="Content1" ContentPlaceHolderID="head" runat="server">
    <link rel="stylesheet" href="../Base/assets/css/styleCommon.css" />
    <link rel="stylesheet" href="../Base/assets/css/styleConsultaUsuarios.css" />
</asp:Content>

<asp:Content ID="Content2" ContentPlaceHolderID="ContentPlaceHolder1" runat="server">
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>

    <nav aria-label="breadcrumb">
      <ol class="breadcrumb my-breadcrumb">
        <li class="breadcrumb-item"><a href="frmPrincipal.aspx">Inicio</a></li>
        <li class="breadcrumb-item active" aria-current="page">Usuarios</li>
      </ol>
    </nav>
    <div class="welcome-msg pt-3 pb-4">
      <h1>Hola <span class="text-primary" id="nombreUsuario"></span>, Bienvenido</h1>
      <p id="emlUsuario"></p>
    </div>

    <%-- HERO: Acción principal --%>
    <div class="cu-hero">
        <div class="cu-hero-info">
            <div class="cu-hero-icon"><i class="fa fa-users"></i></div>
            <div>
                <div class="cu-hero-title">Gestion de Usuarios</div>
                <div class="cu-hero-sub">Administra y gestiona los pacientes del sistema</div>
            </div>
        </div>
        <button class="cu-hero-btn" onclick="crearUsuario()">
            <i class="fa fa-user-plus"></i> Crear Nuevo Usuario
        </button>
    </div>

    <%-- Layout: tabla + filtros --%>
    <div class="cu-layout">

        <%-- Columna principal: tabla --%>
        <div class="cu-main">
            <div class="card card_border py-2 mb-4">
                <div class="cards__heading">
                    <h3>Listado de Usuarios <span></span></h3>
                </div>
                <div class="card-body">
                    <table id="tblUsuarios">
                    <%--Aquí se carga el contenido dinámico de la tabla--%>
                    </table>
                </div>
            </div>
        </div>

        <%-- Sidebar: filtros --%>
        <div class="cu-sidebar">
            <div class="cu-filter-card">
                <div class="cu-filter-header">
                    <i class="fa fa-search cu-filter-icon"></i>
                    <span>Filtrar usuarios</span>
                </div>
                <div class="cu-filter-body">
                    <form action="javascript: cargaListaUsuarios()" method="post">
                        <div class="form-group">
                            <label for="bsqCorreo" class="input__label">Correo</label>
                            <input type="text" class="form-control input-style" id="bsqCorreo"
                                placeholder="Correo del paciente" maxlength="50">
                        </div>
                        <div class="form-group">
                            <label for="bsqUsuario" class="input__label">Nombre</label>
                            <input type="text" class="form-control input-style" id="bsqUsuario"
                                placeholder="Nombre del paciente" maxlength="50">
                        </div>
                        <div class="form-group">
                            <label for="bsqEstado" class="input__label">Estado</label>
                            <select id="bsqEstado" class="form-control input-style">
                                <option value="Activo">Activo</option>
                                <option value="Inactivo">Inactivo</option>
                            </select>
                        </div>
                        <div class="cu-filter-actions">
                            <button type="submit" class="btn btn-primary btn-style">
                                <i class="fa fa-search"></i> Buscar
                            </button>
                            <button type="button" class="btn btn-secondary btn-style"
                                onclick="limpiarFiltrosUsuarios()">
                                <i class="fa fa-eraser"></i> Limpiar
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>

    </div>

    <script src="../JavaScript/Usuarios.js"></script>
</asp:Content>
