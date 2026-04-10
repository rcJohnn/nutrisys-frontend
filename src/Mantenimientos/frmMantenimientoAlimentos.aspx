<%@ Page Title="" Language="C#" MasterPageFile="~/Mantenimientos/frmPrincipalMaster.Master" AutoEventWireup="true" CodeBehind="frmMantenimientoAlimentos.aspx.cs" Inherits="PL_CRUD_CONSULTAS.Mantenimientos.frmMantenimientoAlimentos" %>
<asp:Content ID="Content1" ContentPlaceHolderID="head" runat="server">
    <link rel="stylesheet" href="../Base/assets/css/styleCommon.css" />
</asp:Content>
<asp:Content ID="Content2" ContentPlaceHolderID="ContentPlaceHolder1" runat="server">
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <nav aria-label="breadcrumb">
      <ol class="breadcrumb my-breadcrumb">
        <li class="breadcrumb-item"><a href="frmPrincipal.aspx">Inicio</a></li>
        <li class="breadcrumb-item"><a href="frmConsultaAlimentos.aspx">Consulta de Alimentos</a></li>
        <li class="breadcrumb-item active" aria-current="page">Información de Alimento</li>
      </ol>
    </nav>
    <div class="welcome-msg pt-3 pb-4">
      <h1>Hola <span class="text-primary" id="nombreUsuario"></span>, Bienvenido</h1>
      <p id="emlUsuario"></p>
    </div>
    <div class="card card_border py-2 mb-4">
		<div class="cards__heading">
            <h3>Información Nutricional del Alimento <span></span></h3>
        </div>
        <div class="card-body">
            <form action="javascript: mantenimientoAlimento()" method="post">
               <%-- FILA 1: Nombre --%>
               <div class="form-row">
                   <div class="form-group col-md-12">
                        <label for="txtNombre" class="input__label">Nombre del Alimento *</label>
                        <input type="text" class="form-control input-style" id="txtNombre"
                            placeholder="Nombre del Alimento" required="" maxlength="150">
                    </div>
                </div>

                <%-- SECCIÓN: BÁSICOS --%>
                <h5 class="mt-3 mb-3">Básicos</h5>
                <div class="form-row">
                    <div class="form-group col-md-3">
                        <label for="txtAgua" class="input__label">Agua (g)</label>
                        <input type="number" step="0.01" class="form-control input-style" id="txtAgua"
                            placeholder="0.00">
                    </div>
                    <div class="form-group col-md-3">
                        <label for="txtCeniza" class="input__label">Ceniza (g)</label>
                        <input type="number" step="0.01" class="form-control input-style" id="txtCeniza"
                            placeholder="0.00">
                    </div>
                </div>

                <%-- SECCIÓN: MACRONUTRIENTES --%>
                <h5 class="mt-3 mb-3">Macronutrientes</h5>
                <div class="form-row">
                    <div class="form-group col-md-3">
                        <label for="txtEnergia" class="input__label">Energía (kcal) *</label>
                        <input type="number" step="0.01" class="form-control input-style" id="txtEnergia"
                            placeholder="0.00" required="">
                    </div>
                    <div class="form-group col-md-3">
                        <label for="txtProteina" class="input__label">Proteína (g) *</label>
                        <input type="number" step="0.01" class="form-control input-style" id="txtProteina"
                            placeholder="0.00" required="">
                    </div>
                    <div class="form-group col-md-3">
                        <label for="txtGrasa" class="input__label">Grasa (g) *</label>
                        <input type="number" step="0.01" class="form-control input-style" id="txtGrasa"
                            placeholder="0.00" required="">
                    </div>
                    <div class="form-group col-md-3">
                        <label for="txtCarbohidratos" class="input__label">Carbohidratos (g) *</label>
                        <input type="number" step="0.01" class="form-control input-style" id="txtCarbohidratos"
                            placeholder="0.00" required="">
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group col-md-3">
                        <label for="txtFibra" class="input__label">Fibra (g) *</label>
                        <input type="number" step="0.01" class="form-control input-style" id="txtFibra"
                            placeholder="0.00" required="">
                    </div>
                    <div class="form-group col-md-3">
                        <label for="txtColesterol" class="input__label">Colesterol (mg) *</label>
                        <input type="number" step="0.01" class="form-control input-style" id="txtColesterol"
                            placeholder="0.00" required="">
                    </div>
                </div>

                <%-- SECCIÓN: MINERALES --%>
                <h5 class="mt-3 mb-3">Minerales</h5>
                <div class="form-row">
                    <div class="form-group col-md-3">
                        <label for="txtCalcio" class="input__label">Calcio (mg) *</label>
                        <input type="number" step="0.01" class="form-control input-style" id="txtCalcio"
                            placeholder="0.00" required="">
                    </div>
                    <div class="form-group col-md-3">
                        <label for="txtFosforo" class="input__label">Fósforo (mg) *</label>
                        <input type="number" step="0.01" class="form-control input-style" id="txtFosforo"
                            placeholder="0.00" required="">
                    </div>
                    <div class="form-group col-md-3">
                        <label for="txtHierro" class="input__label">Hierro (mg) *</label>
                        <input type="number" step="0.01" class="form-control input-style" id="txtHierro"
                            placeholder="0.00" required="">
                    </div>
                    <div class="form-group col-md-3">
                        <label for="txtPotasio" class="input__label">Potasio (mg) *</label>
                        <input type="number" step="0.01" class="form-control input-style" id="txtPotasio"
                            placeholder="0.00" required="">
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group col-md-3">
                        <label for="txtZinc" class="input__label">Zinc (mg) *</label>
                        <input type="number" step="0.01" class="form-control input-style" id="txtZinc"
                            placeholder="0.00" required="">
                    </div>
                    <div class="form-group col-md-3">
                        <label for="txtMagnesio" class="input__label">Magnesio (mg) *</label>
                        <input type="number" step="0.01" class="form-control input-style" id="txtMagnesio"
                            placeholder="0.00" required="">
                    </div>
                    <div class="form-group col-md-3">
                        <label for="txtSodio" class="input__label">Sodio (mg)</label>
                        <input type="number" step="0.01" class="form-control input-style" id="txtSodio"
                            placeholder="0.00">
                    </div>
                </div>

                <%-- SECCIÓN: VITAMINAS --%>
                <h5 class="mt-3 mb-3">Vitaminas</h5>
                <div class="form-row">
                    <div class="form-group col-md-3">
                        <label for="txtTiamina" class="input__label">Tiamina (mg) *</label>
                        <input type="number" step="0.0001" class="form-control input-style" id="txtTiamina"
                            placeholder="0.0000" required="">
                    </div>
                    <div class="form-group col-md-3">
                        <label for="txtVitC" class="input__label">Vitamina C (mg) *</label>
                        <input type="number" step="0.01" class="form-control input-style" id="txtVitC"
                            placeholder="0.00" required="">
                    </div>
                    <div class="form-group col-md-3">
                        <label for="txtVitA" class="input__label">Vitamina A (μg) *</label>
                        <input type="number" step="0.01" class="form-control input-style" id="txtVitA"
                            placeholder="0.00" required="">
                    </div>
                    <div class="form-group col-md-3">
                        <label for="txtVitB6" class="input__label">Vitamina B6 (mg) *</label>
                        <input type="number" step="0.0001" class="form-control input-style" id="txtVitB6"
                            placeholder="0.0000" required="">
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group col-md-3">
                        <label for="txtVitB12" class="input__label">Vitamina B12 (μg) *</label>
                        <input type="number" step="0.0001" class="form-control input-style" id="txtVitB12"
                            placeholder="0.0000" required="">
                    </div>
                    <div class="form-group col-md-3">
                        <label for="txtRiboflavina" class="input__label">Riboflavina (mg)</label>
                        <input type="number" step="0.0001" class="form-control input-style" id="txtRiboflavina"
                            placeholder="0.0000">
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group col-md-3">
                        <label for="txtNiacina" class="input__label">Niacina (mg)</label>
                        <input type="number" step="0.001" class="form-control input-style" id="txtNiacina"
                            placeholder="0.000">
                    </div>
                    <div class="form-group col-md-3">
                        <label for="txtAcFolico" class="input__label">Ácido Fólico (μg)</label>
                        <input type="number" step="0.01" class="form-control input-style" id="txtAcFolico"
                            placeholder="0.00">
                    </div>
                    <div class="form-group col-md-3">
                        <label for="txtFolato" class="input__label">Folato (μg)</label>
                        <input type="number" step="0.01" class="form-control input-style" id="txtFolato"
                            placeholder="0.00">
                    </div>
                </div>

                <%-- SECCIÓN: MINERALES — agregar Sodio --%>
                <%-- (Sodio va junto con los minerales existentes) --%>

                <%-- SECCIÓN: ÁCIDOS GRASOS --%>
                <h5 class="mt-3 mb-3">Ácidos Grasos</h5>
                <div class="form-row">
                    <div class="form-group col-md-4">
                        <label for="txtAcGrasosSat" class="input__label">Saturados (g)</label>
                        <input type="number" step="0.01" class="form-control input-style" id="txtAcGrasosSat"
                            placeholder="0.00">
                    </div>
                    <div class="form-group col-md-4">
                        <label for="txtAcGrasosMono" class="input__label">Monoinsaturados (g)</label>
                        <input type="number" step="0.01" class="form-control input-style" id="txtAcGrasosMono"
                            placeholder="0.00">
                    </div>
                    <div class="form-group col-md-4">
                        <label for="txtAcGrasosPoli" class="input__label">Poliinsaturados (g)</label>
                        <input type="number" step="0.01" class="form-control input-style" id="txtAcGrasosPoli"
                            placeholder="0.00">
                    </div>
                </div>

                <%-- SECCIÓN: CLASIFICACIÓN --%>
                <h5 class="mt-3 mb-3">Clasificación</h5>
                <div class="form-row">
                    <div class="form-group col-md-3">
                        <label for="txtCategoria" class="input__label">Categoría</label>
                        <select class="form-control input-style" id="txtCategoria">
                            <option value="">— Sin categoría —</option>
                            <option value="Lácteos">Lácteos</option>
                            <option value="Huevos">Huevos</option>
                            <option value="Aves">Aves</option>
                            <option value="Res">Res</option>
                            <option value="Cerdo">Cerdo</option>
                            <option value="Embutidos">Embutidos</option>
                            <option value="Mariscos">Mariscos</option>
                            <option value="Legumbres">Legumbres</option>
                            <option value="Frutos Secos">Frutos Secos</option>
                            <option value="Verduras">Verduras</option>
                            <option value="Frutas">Frutas</option>
                            <option value="Harinas">Harinas</option>
                            <option value="Azúcares">Azúcares</option>
                            <option value="Grasas">Grasas</option>
                        </select>
                    </div>
                    <div class="form-group col-md-3">
                        <label for="txtMacrogrupo" class="input__label">Macrogrupo</label>
                        <select class="form-control input-style" id="txtMacrogrupo">
                            <option value="">— Sin macrogrupo —</option>
                            <option value="Lácteos y derivados">Lácteos y derivados</option>
                            <option value="Proteínas animales">Proteínas animales</option>
                            <option value="Vegetales">Vegetales</option>
                            <option value="Grasas y semillas">Grasas y semillas</option>
                            <option value="Frutas">Frutas</option>
                            <option value="Cereales y harinas">Cereales y harinas</option>
                            <option value="Azúcares y dulces">Azúcares y dulces</option>
                        </select>
                    </div>
                    <div class="form-group col-md-3">
                        <label for="txtMarca" class="input__label">Marca</label>
                        <input type="text" class="form-control input-style" id="txtMarca"
                            placeholder="Ej: Dos Pinos" maxlength="150">
                    </div>
                    <div class="form-group col-md-3">
                        <label for="txtPresentacion" class="input__label">Presentación</label>
                        <input type="text" class="form-control input-style" id="txtPresentacion"
                            placeholder="Ej: 1 L, 500 g" maxlength="150">
                    </div>
                </div>

                <button type="submit" class="btn btn-primary btn-style mt-4">Guardar</button>
                <button type="button" class="btn btn-primary btn-style mt-4" onclick="javascript: regresar()">Regresar</button>
            </form>
        </div>
    </div>
    <script src="../JavaScript/Alimentos.js"></script>
</asp:Content>