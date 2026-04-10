<%@ Page Title="" Language="C#" MasterPageFile="~/Mantenimientos/frmPrincipalMaster.Master"
    AutoEventWireup="true" CodeBehind="frmDetalleConsulta.aspx.cs"
    Inherits="PL_CRUD_CONSULTAS.Mantenimientos.frmDetalleConsulta"
    ResponseEncoding="UTF-8" ContentType="text/html; charset=utf-8" %>

<asp:Content ID="Content1" ContentPlaceHolderID="head" runat="server">
    <link rel="stylesheet" href="../Base/assets/css/styleDetalleConsulta.css" />
</asp:Content>

<asp:Content ID="Content2" ContentPlaceHolderID="ContentPlaceHolder1" runat="server">

    <nav aria-label="breadcrumb">
        <ol class="breadcrumb my-breadcrumb">
            <li class="breadcrumb-item"><a href="frmPrincipal.aspx">Inicio</a></li>
            <li class="breadcrumb-item"><a href="frmConsultaConsultas.aspx">Citas M&eacute;dicas</a></li>
            <li class="breadcrumb-item active" aria-current="page">Detalle de Consulta</li>
        </ol>
    </nav>

    <%-- HEADER --%>
    <div class="dc-page-header">
        <div class="dc-header-left">
            <button class="dc-back-btn" onclick="location.href='frmConsultaConsultas.aspx'">
                <i class="fa fa-arrow-left"></i> Volver
            </button>
            <div class="dc-header-info">
                <h1 class="dc-page-title">Detalle de Consulta</h1>
                <p class="dc-page-sub">Vista de solo lectura &mdash; <span id="dcFechaRegistro"></span></p>
            </div>
        </div>
        <div class="dc-header-right">
            <span class="dc-badge" id="dcBadgeEstado">Cargando...</span>
        </div>
    </div>

    <%-- LOADING --%>
    <div id="dcLoading" class="dc-loading-wrap">
        <div class="dc-spinner"></div>
        <p>Cargando informaci&oacute;n de la consulta...</p>
    </div>

    <%-- CONTENIDO --%>
    <div id="dcContenido" style="display:none;">

        <%-- FILA: PACIENTE + MÉDICO --%>
        <div class="dc-row-2">

            <%-- CARD PACIENTE --%>
            <div class="dc-card">
                <div class="dc-card-header dc-emerald">
                    <i class="fa fa-user"></i> Paciente
                </div>
                <div class="dc-card-body">
                    <div class="dc-info-row">
                        <span class="dc-info-label">Nombre completo</span>
                        <span class="dc-info-value" id="dcNombrePaciente">-</span>
                    </div>
                    <div class="dc-info-row">
                        <span class="dc-info-label">C&eacute;dula</span>
                        <span class="dc-info-value" id="dcCedula">-</span>
                    </div>
                    <div class="dc-info-row">
                        <span class="dc-info-label">Correo</span>
                        <span class="dc-info-value" id="dcCorreoPaciente">-</span>
                    </div>
                </div>
            </div>

            <%-- CARD MÉDICO + CITA --%>
            <div class="dc-card">
                <div class="dc-card-header dc-indigo">
                    <i class="fa fa-user-md"></i> M&eacute;dico y Cita
                </div>
                <div class="dc-card-body">
                    <div class="dc-info-row">
                        <span class="dc-info-label">M&eacute;dico tratante</span>
                        <span class="dc-info-value" id="dcNombreMedico">-</span>
                    </div>
                    <div class="dc-info-row">
                        <span class="dc-info-label">Fecha y hora</span>
                        <span class="dc-info-value" id="dcFechaCita">-</span>
                    </div>
                    <div class="dc-info-row">
                        <span class="dc-info-label">Duraci&oacute;n</span>
                        <span class="dc-info-value"><span id="dcDuracion">-</span> min</span>
                    </div>
                    <div class="dc-info-row">
                        <span class="dc-info-label">Motivo de consulta</span>
                        <span class="dc-info-value" id="dcMotivo">-</span>
                    </div>
                </div>
            </div>

        </div>

        <%-- MÉTRICAS CORPORALES --%>
        <div class="dc-card dc-card-full">
            <div class="dc-card-header dc-emerald">
                <i class="fa fa-heartbeat"></i> M&eacute;tricas Corporales
            </div>
            <div class="dc-card-body">

                <%-- Signos vitales y antropometría principal --%>
                <div class="dc-metrics-section-title">Signos Vitales y Composici&oacute;n Corporal</div>
                <div class="dc-metrics-grid dc-metrics-main">
                    <div class="dc-metric-box">
                        <div class="dc-metric-icon dc-icon-emerald"><i class="fa fa-arrows-v"></i></div>
                        <div class="dc-metric-val" id="dcPeso">-</div>
                        <div class="dc-metric-unit">kg</div>
                        <div class="dc-metric-lbl">Peso</div>
                    </div>
                    <div class="dc-metric-box">
                        <div class="dc-metric-icon dc-icon-slate"><i class="fa fa-male"></i></div>
                        <div class="dc-metric-val" id="dcEstatura">-</div>
                        <div class="dc-metric-unit">cm</div>
                        <div class="dc-metric-lbl">Estatura</div>
                    </div>
                    <div class="dc-metric-box dc-metric-highlight">
                        <div class="dc-metric-icon dc-icon-indigo"><i class="fa fa-bar-chart"></i></div>
                        <div class="dc-metric-val" id="dcIMC">-</div>
                        <div class="dc-metric-unit">kg/m&sup2;</div>
                        <div class="dc-metric-lbl">IMC</div>
                    </div>
                    <div class="dc-metric-box">
                        <div class="dc-metric-icon dc-icon-danger"><i class="fa fa-heartbeat"></i></div>
                        <div class="dc-metric-val" id="dcPresion">-</div>
                        <div class="dc-metric-unit">mmHg</div>
                        <div class="dc-metric-lbl">Presi&oacute;n Arterial</div>
                    </div>
                </div>

                <%-- Composición corporal --%>
                <div class="dc-metrics-section-title" style="margin-top:1.5rem;">Composici&oacute;n Corporal</div>
                <div class="dc-metrics-grid">
                    <div class="dc-metric-box">
                        <div class="dc-metric-icon dc-icon-amber"><i class="fa fa-tint"></i></div>
                        <div class="dc-metric-val" id="dcGrasaG">-</div>
                        <div class="dc-metric-unit">g</div>
                        <div class="dc-metric-lbl">Grasa (g)</div>
                    </div>
                    <div class="dc-metric-box" id="dcBoxGrasaPct" style="display:none;">
                        <div class="dc-metric-icon dc-icon-amber"><i class="fa fa-pie-chart"></i></div>
                        <div class="dc-metric-val" id="dcGrasaPct">-</div>
                        <div class="dc-metric-unit">%</div>
                        <div class="dc-metric-lbl">Grasa (%)</div>
                    </div>
                    <div class="dc-metric-box">
                        <div class="dc-metric-icon dc-icon-emerald"><i class="fa fa-male"></i></div>
                        <div class="dc-metric-val" id="dcMusculoG">-</div>
                        <div class="dc-metric-unit">g</div>
                        <div class="dc-metric-lbl">M&uacute;sculo (g)</div>
                    </div>
                    <div class="dc-metric-box" id="dcBoxMasaOsea" style="display:none;">
                        <div class="dc-metric-icon dc-icon-slate"><i class="fa fa-circle-o"></i></div>
                        <div class="dc-metric-val" id="dcMasaOsea">-</div>
                        <div class="dc-metric-unit">g</div>
                        <div class="dc-metric-lbl">Masa &Oacute;sea</div>
                    </div>
                    <div class="dc-metric-box" id="dcBoxGrasaVisceral" style="display:none;">
                        <div class="dc-metric-icon dc-icon-amber"><i class="fa fa-circle"></i></div>
                        <div class="dc-metric-val" id="dcGrasaVisceral">-</div>
                        <div class="dc-metric-unit">nivel</div>
                        <div class="dc-metric-lbl">Grasa Visceral</div>
                    </div>
                    <div class="dc-metric-box" id="dcBoxAguaPct" style="display:none;">
                        <div class="dc-metric-icon dc-icon-indigo"><i class="fa fa-tint"></i></div>
                        <div class="dc-metric-val" id="dcAguaPct">-</div>
                        <div class="dc-metric-unit">%</div>
                        <div class="dc-metric-lbl">Agua Corporal</div>
                    </div>
                    <div class="dc-metric-box" id="dcBoxEdadMet" style="display:none;">
                        <div class="dc-metric-icon dc-icon-slate"><i class="fa fa-clock-o"></i></div>
                        <div class="dc-metric-val" id="dcEdadMetabolica">-</div>
                        <div class="dc-metric-unit">a&ntilde;os</div>
                        <div class="dc-metric-lbl">Edad Metab&oacute;lica</div>
                    </div>
                </div>

                <%-- Circunferencias --%>
                <div class="dc-metrics-section-title" style="margin-top:1.5rem;">Circunferencias</div>
                <div class="dc-metrics-grid">
                    <div class="dc-metric-box">
                        <div class="dc-metric-icon dc-icon-slate"><i class="fa fa-expand"></i></div>
                        <div class="dc-metric-val" id="dcCintura">-</div>
                        <div class="dc-metric-unit">cm</div>
                        <div class="dc-metric-lbl">Cintura</div>
                    </div>
                    <div class="dc-metric-box">
                        <div class="dc-metric-icon dc-icon-slate"><i class="fa fa-expand"></i></div>
                        <div class="dc-metric-val" id="dcCadera">-</div>
                        <div class="dc-metric-unit">cm</div>
                        <div class="dc-metric-lbl">Cadera</div>
                    </div>
                    <div class="dc-metric-box" id="dcBoxMuneca" style="display:none;">
                        <div class="dc-metric-icon dc-icon-slate"><i class="fa fa-expand"></i></div>
                        <div class="dc-metric-val" id="dcMuneca">-</div>
                        <div class="dc-metric-unit">cm</div>
                        <div class="dc-metric-lbl">Mu&ntilde;eca</div>
                    </div>
                </div>

                <%-- Antropometría de brazo / estimaciones — solo visible si se registraron --%>
                <div id="dcSectionAntrop" style="display:none;">
                    <div class="dc-metrics-section-title" style="margin-top:1.5rem;">
                        Antropometr&iacute;a de Brazo
                    </div>
                    <div class="dc-metrics-grid">
                        <div class="dc-metric-box" id="dcBoxCircBrazo">
                            <div class="dc-metric-icon dc-icon-slate"><i class="fa fa-expand"></i></div>
                            <div class="dc-metric-val" id="dcCircBrazo">-</div>
                            <div class="dc-metric-unit">cm</div>
                            <div class="dc-metric-lbl">Circ. Brazo (PB)</div>
                        </div>
                        <div class="dc-metric-box" id="dcBoxATB">
                            <div class="dc-metric-icon dc-icon-indigo"><i class="fa fa-square"></i></div>
                            <div class="dc-metric-val" id="dcATB">-</div>
                            <div class="dc-metric-unit">cm&sup2;</div>
                            <div class="dc-metric-lbl">ATB</div>
                        </div>
                        <div class="dc-metric-box" id="dcBoxCMB">
                            <div class="dc-metric-icon dc-icon-emerald"><i class="fa fa-compress"></i></div>
                            <div class="dc-metric-val" id="dcCMB">-</div>
                            <div class="dc-metric-unit">cm</div>
                            <div class="dc-metric-lbl">CMB</div>
                        </div>
                        <div class="dc-metric-box" id="dcBoxAMB">
                            <div class="dc-metric-icon dc-icon-emerald"><i class="fa fa-square-o"></i></div>
                            <div class="dc-metric-val" id="dcAMB">-</div>
                            <div class="dc-metric-unit">cm&sup2;</div>
                            <div class="dc-metric-lbl">AMB</div>
                        </div>
                        <div class="dc-metric-box" id="dcBoxAGB">
                            <div class="dc-metric-icon dc-icon-amber"><i class="fa fa-tint"></i></div>
                            <div class="dc-metric-val" id="dcAGB">-</div>
                            <div class="dc-metric-unit">cm&sup2;</div>
                            <div class="dc-metric-lbl">AGB</div>
                        </div>
                    </div>
                    <div class="dc-metrics-section-title" style="margin-top:1rem;">
                        Estimaciones Chumlea
                    </div>
                    <div class="dc-metrics-grid">
                        <div class="dc-metric-box" id="dcBoxPesoEstimado" style="display:none;">
                            <div class="dc-metric-icon dc-icon-emerald"><i class="fa fa-balance-scale"></i></div>
                            <div class="dc-metric-val" id="dcPesoEstimado">-</div>
                            <div class="dc-metric-unit">kg</div>
                            <div class="dc-metric-lbl">Peso Estimado</div>
                        </div>
                        <div class="dc-metric-box" id="dcBoxTallaEstimada" style="display:none;">
                            <div class="dc-metric-icon dc-icon-indigo"><i class="fa fa-arrows-v"></i></div>
                            <div class="dc-metric-val" id="dcTallaEstimada">-</div>
                            <div class="dc-metric-unit">cm</div>
                            <div class="dc-metric-lbl">Talla Estimada</div>
                        </div>
                        <div class="dc-metric-box" id="dcBoxAlturaRodilla">
                            <div class="dc-metric-icon dc-icon-slate"><i class="fa fa-male"></i></div>
                            <div class="dc-metric-val" id="dcAlturaRodilla">-</div>
                            <div class="dc-metric-unit">cm</div>
                            <div class="dc-metric-lbl">Altura de Rodilla</div>
                        </div>
                    </div>
                </div>

            </div>
        </div>

        <%-- EVALUACIÓN CUANTITATIVA — DISTRIBUCIÓN DE MACRONUTRIENTES --%>
        <div id="dcDistribucionCard" class="dc-card dc-card-full">
            <div class="dc-card-header dc-amber">
                <i class="fa fa-calculator"></i>
                Evaluaci&oacute;n Cuantitativa &mdash; Distribuci&oacute;n de Macronutrientes
            </div>
            <div class="dc-card-body">

                <%-- Encabezado calórico: fórmula + REE --%>
                <div class="dc-calorico-header">
                    <div>
                        <div class="dc-calorico-label">F&oacute;rmula utilizada</div>
                        <div class="dc-formula-badge" id="dcFormulaUsada">-</div>
                    </div>
                    <div class="dc-ree-block">
                        <div class="dc-calorico-label">Requerimiento Energ&eacute;tico Total (REE)</div>
                        <div class="dc-ree-value">
                            <span id="dcREE">-</span>
                            <span class="dc-ree-unit">kcal/d&iacute;a</span>
                        </div>
                    </div>
                </div>

                <%-- Desglose calórico por macronutriente --%>
                <div class="dc-metrics-section-title" style="margin-top:1.25rem;">
                    Aporte Cal&oacute;rico por Macronutriente
                </div>
                <div class="dc-macro-desglose">

                    <div class="dc-macro-item dc-macro-cho-item">
                        <div class="dc-macro-item-header">
                            <i class="fa fa-leaf"></i> Carbohidratos
                        </div>
                        <div class="dc-macro-item-data">
                            <span class="dc-macro-num" id="dcTotalCHO">-</span>
                            <span class="dc-macro-unit2">g</span>
                        </div>
                        <div class="dc-macro-item-kcal">
                            <span id="dcCHOkcal">-</span> kcal
                            <span class="dc-macro-pct" id="dcCHOpct">-</span>
                        </div>
                    </div>

                    <div class="dc-macro-item dc-macro-prot-item">
                        <div class="dc-macro-item-header">
                            <i class="fa fa-male"></i> Prote&iacute;nas
                        </div>
                        <div class="dc-macro-item-data">
                            <span class="dc-macro-num" id="dcTotalProt">-</span>
                            <span class="dc-macro-unit2">g</span>
                        </div>
                        <div class="dc-macro-item-kcal">
                            <span id="dcProtkcal">-</span> kcal
                            <span class="dc-macro-pct" id="dcProtpct">-</span>
                        </div>
                    </div>

                    <div class="dc-macro-item dc-macro-grasa-item">
                        <div class="dc-macro-item-header">
                            <i class="fa fa-tint"></i> Grasas
                        </div>
                        <div class="dc-macro-item-data">
                            <span class="dc-macro-num" id="dcTotalGrasa">-</span>
                            <span class="dc-macro-unit2">g</span>
                        </div>
                        <div class="dc-macro-item-kcal">
                            <span id="dcGrasakcal">-</span> kcal
                            <span class="dc-macro-pct" id="dcGrasapct">-</span>
                        </div>
                    </div>

                    <div class="dc-macro-item dc-macro-fibra-item">
                        <div class="dc-macro-item-header">
                            <i class="fa fa-circle-o"></i> Fibra
                        </div>
                        <div class="dc-macro-item-data">
                            <span class="dc-macro-num" id="dcTotalFibra">-</span>
                            <span class="dc-macro-unit2">g</span>
                        </div>
                        <div class="dc-macro-item-kcal dc-macro-fibra-note">
                            Recomendada/d&iacute;a
                        </div>
                    </div>

                </div>

                <%-- Estado vacío (se oculta cuando hay datos) --%>
                <div id="dcDistribucionEmpty" class="dc-empty-state" style="display:none;">
                    <i class="fa fa-calculator dc-empty-icon"></i>
                    <p>A&uacute;n no se ha registrado la distribuci&oacute;n de macronutrientes para esta consulta.</p>
                    <p class="dc-empty-sub">Se genera desde la calculadora nutricional y se env&iacute;a autom&aacute;ticamente por correo.</p>
                </div>

                <%-- Contenido (se oculta cuando no hay datos) --%>
                <div id="dcDistribucionContent">

                <%-- Tabla distribución por tiempo de comida --%>
                <div class="dc-metrics-section-title" style="margin-top:1.5rem;">
                    Distribuci&oacute;n por Tiempo de Comida
                </div>
                <div class="dc-meal-table-wrap">
                    <table class="dc-meal-table">
                        <thead>
                            <tr>
                                <th class="dc-meal-col-name">Tiempo de Comida</th>
                                <th>CHO (g)</th>
                                <th>Prote&iacute;nas (g)</th>
                                <th>Grasas (g)</th>
                                <th>Fibra (g)</th>
                                <th class="dc-col-kcal">kcal</th>
                                <th class="dc-col-pct">% del d&iacute;a</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr class="dc-meal-row" id="dcRowDesayuno">
                                <td class="dc-meal-name"><i class="fa fa-sun-o dc-meal-icon"></i> Desayuno</td>
                                <td><span id="dcDesayunoCHO">-</span></td>
                                <td><span id="dcDesayunoProt">-</span></td>
                                <td><span id="dcDesayunoGrasa">-</span></td>
                                <td><span id="dcDesayunoFibra">-</span></td>
                                <td class="dc-kcal-cell"><span id="dcDesayunoKcal">-</span></td>
                                <td class="dc-pct-cell"><span id="dcDesayunoPct">-</span></td>
                            </tr>
                            <tr class="dc-meal-row" id="dcRowMeriendaAM">
                                <td class="dc-meal-name"><i class="fa fa-coffee dc-meal-icon"></i> Merienda AM</td>
                                <td><span id="dcMeriendaAMCHO">-</span></td>
                                <td><span id="dcMeriendaAMProt">-</span></td>
                                <td><span id="dcMeriendaAMGrasa">-</span></td>
                                <td><span id="dcMeriendaAMFibra">-</span></td>
                                <td class="dc-kcal-cell"><span id="dcMeriendaAMKcal">-</span></td>
                                <td class="dc-pct-cell"><span id="dcMeriendaAMPct">-</span></td>
                            </tr>
                            <tr class="dc-meal-row" id="dcRowAlmuerzo">
                                <td class="dc-meal-name"><i class="fa fa-cutlery dc-meal-icon"></i> Almuerzo</td>
                                <td><span id="dcAlmuerzoCHO">-</span></td>
                                <td><span id="dcAlmuerzoProt">-</span></td>
                                <td><span id="dcAlmuerzoGrasa">-</span></td>
                                <td><span id="dcAlmuerzoFibra">-</span></td>
                                <td class="dc-kcal-cell"><span id="dcAlmuerzoKcal">-</span></td>
                                <td class="dc-pct-cell"><span id="dcAlmuerzoPct">-</span></td>
                            </tr>
                            <tr class="dc-meal-row" id="dcRowMeriendaPM">
                                <td class="dc-meal-name"><i class="fa fa-apple dc-meal-icon"></i> Merienda PM</td>
                                <td><span id="dcMeriendaPMCHO">-</span></td>
                                <td><span id="dcMeriendaPMProt">-</span></td>
                                <td><span id="dcMeriendaPMGrasa">-</span></td>
                                <td><span id="dcMeriendaPMFibra">-</span></td>
                                <td class="dc-kcal-cell"><span id="dcMeriendaPMKcal">-</span></td>
                                <td class="dc-pct-cell"><span id="dcMeriendaPMPct">-</span></td>
                            </tr>
                            <tr class="dc-meal-row" id="dcRowCena">
                                <td class="dc-meal-name"><i class="fa fa-moon-o dc-meal-icon"></i> Cena</td>
                                <td><span id="dcCenaCHO">-</span></td>
                                <td><span id="dcCenaProt">-</span></td>
                                <td><span id="dcCenaGrasa">-</span></td>
                                <td><span id="dcCenaFibra">-</span></td>
                                <td class="dc-kcal-cell"><span id="dcCenaKcal">-</span></td>
                                <td class="dc-pct-cell"><span id="dcCenaPct">-</span></td>
                            </tr>
                        </tbody>
                        <tfoot>
                            <tr class="dc-meal-total-row">
                                <td class="dc-meal-name"><strong>Total</strong></td>
                                <td><span id="dcFootCHO">-</span></td>
                                <td><span id="dcFootProt">-</span></td>
                                <td><span id="dcFootGrasa">-</span></td>
                                <td><span id="dcFootFibra">-</span></td>
                                <td class="dc-kcal-cell"><span id="dcFootKcal">-</span></td>
                                <td class="dc-pct-cell">100%</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                </div><%-- /dcDistribucionContent --%>

            </div>
        </div>

        <%-- NOTAS CLÍNICAS --%>
        <div class="dc-row-2">

            <div class="dc-card">
                <div class="dc-card-header dc-emerald">
                    <i class="fa fa-stethoscope"></i> Observaciones del M&eacute;dico
                </div>
                <div class="dc-card-body">
                    <div class="dc-text-block" id="dcObservaciones">Sin observaciones registradas.</div>
                </div>
            </div>

            <div class="dc-card">
                <div class="dc-card-header dc-indigo">
                    <i class="fa fa-list-ul"></i> Recomendaciones
                </div>
                <div class="dc-card-body">
                    <div class="dc-text-block" id="dcRecomendaciones">Sin recomendaciones registradas.</div>
                </div>
            </div>

        </div>

        <%-- PRÓXIMA CITA --%>
        <div id="dcProximaCitaCard" class="dc-card dc-card-full dc-proxima-cita" style="display:none;">
            <div class="dc-card-header dc-emerald">
                <i class="fa fa-calendar-check-o"></i> Pr&oacute;xima Cita
            </div>
            <div class="dc-card-body" style="padding: 1.25rem 1.5rem;">
                <div class="dc-proxima-fecha" id="dcProximaCita">-</div>
            </div>
        </div>

    </div>

    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <script src="../JavaScript/DetalleConsulta.js"></script>

</asp:Content>
