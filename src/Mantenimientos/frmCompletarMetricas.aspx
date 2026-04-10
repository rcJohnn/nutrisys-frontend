<%@ Page Title="" Language="C#" MasterPageFile="~/Mantenimientos/frmPrincipalMaster.Master" AutoEventWireup="true" CodeBehind="frmCompletarMetricas.aspx.cs" Inherits="PL_CRUD_CONSULTAS.Mantenimientos.frmCompletarMetricas" %>
<asp:Content ID="Content1" ContentPlaceHolderID="head" runat="server">
    <link rel="stylesheet" href="../Base/assets/css/styleCommon.css" />
    <style>
        /* ── Calculadora Nutricional — EV Design System ── */
        #panelCalculadora .card { border: none; box-shadow: 0 2px 8px rgba(19,27,46,0.06); margin-bottom: 1rem; }

        /* Paso 1: Peso Ideal */
        #panelCalculadora .bg-info { background: linear-gradient(135deg, #006c49 0%, #10b981 100%) !important; border-radius: 8px 8px 0 0; }
        #panelCalculadora .bg-info.card-header { color: #fff !important; }

        /* Paso 2: GEB */
        #panelCalculadora .bg-warning { background: #fef3c7 !important; border-left: 4px solid #f59e0b; border-radius: 8px 8px 0 0; }
        #panelCalculadora .bg-warning.card-header { color: #131b2e !important; }

        /* Paso 3+ headers (default dark) */
        #panelCalculadora .bg-dark { background: #131b2e !important; border-radius: 8px 8px 0 0; }
        #panelCalculadora .bg-dark.card-header { color: #faf8ff !important; }
        #panelCalculadora .bg-success { background: linear-gradient(135deg, #006c49 0%, #10b981 100%) !important; border-radius: 8px 8px 0 0; }
        #panelCalculadora .bg-success.card-header { color: #fff !important; }
        #panelCalculadora .bg-primary { background: linear-gradient(135deg, #006c49 0%, #10b981 100%) !important; border-radius: 8px 8px 0 0; }
        #panelCalculadora .bg-primary.card-header { color: #fff !important; }

        /* Alertas de resultado */
        #panelCalculadora .alert-success {
            background: #b7ebce !important;
            color: #3c6c54 !important;
            border: none !important;
            border-radius: 8px !important;
        }
        #panelCalculadora .alert-warning {
            background: #fef3c7 !important;
            color: #92400e !important;
            border: none !important;
            border-left: 4px solid #f59e0b !important;
            border-radius: 0 8px 8px 0 !important;
        }
        #panelCalculadora .alert-info {
            background: #eaedff !important;
            color: #131b2e !important;
            border: none !important;
            border-radius: 8px !important;
        }

        /* Thead de tablas internas */
        #panelCalculadora .thead-dark th { background: #131b2e !important; color: #faf8ff !important; border: none; }
        #panelCalculadora .thead-light th { background: #f2f3ff !important; color: #131b2e !important; border: none; }

        /* Botón toggle calculadora */
        #panelCalculadora .btn-light { background: rgba(250,248,255,0.15) !important; color: #fff !important; border: 1px solid rgba(255,255,255,0.25) !important; }
    </style>
</asp:Content>
<asp:Content ID="Content2" ContentPlaceHolderID="ContentPlaceHolder1" runat="server">
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    
    <nav aria-label="breadcrumb">
      <ol class="breadcrumb my-breadcrumb">
        <li class="breadcrumb-item"><a href="frmPrincipal.aspx">Inicio</a></li>
        <li class="breadcrumb-item"><a href="frmConsultaConsultas.aspx">Consulta de Citas</a></li>
        <li class="breadcrumb-item active" aria-current="page">Completar Métricas</li>
      </ol>
    </nav>
    
   <div class="welcome-msg pt-3 pb-4">
    <h1>Completar Consulta - <span class="text-primary" id="lblPacienteHeader"></span></h1>
    <p id="lblFechaConsulta"></p>
</div>

<%-- INFORMACIÓN DE LA CONSULTA --%>
<div class="card card_border py-2 mb-4">
    <div class="cards__heading">
        <h3>Información de la Consulta <span></span></h3>
    </div>
    <div class="card-body">
        <div class="form-row">
            <div class="form-group col-md-4">
                <label class="input__label">Paciente:</label>
                <p id="lblPaciente" class="form-control-plaintext"><strong>-</strong></p>
            </div>
            <div class="form-group col-md-4">
                <label class="input__label">Fecha/Hora:</label>
                <p id="lblFechaHora" class="form-control-plaintext"><strong>-</strong></p>
            </div>
            <div class="form-group col-md-4">
                <label class="input__label">Motivo:</label>
                <p id="lblMotivo" class="form-control-plaintext"><strong>-</strong></p>
            </div>
        </div>
    </div>
</div>

<%-- ============================================ --%>
<%-- SISTEMA DE TABS --%>
<%-- ============================================ --%>
<div class="card card_border py-2 mb-4">
    <div class="card-body">
        <%-- TABS NAVIGATION --%>
        <ul class="nav nav-tabs" id="consultaTabs" role="tablist">
            <li class="nav-item">
                <a class="nav-link active" id="tab-metricas-link" data-toggle="tab" href="#tab-metricas" role="tab">
                    <i class="fa fa-heartbeat"></i> 1. Métricas
                </a>
            </li>
            <li class="nav-item">
                <a class="nav-link" id="tab-historia-link" data-toggle="tab" href="#tab-historia" role="tab">
                    <i class="fa fa-file-text"></i> 2. Historia Clínica
                </a>
            </li>
            <li class="nav-item">
                <a class="nav-link" id="tab-evaluacion-link" data-toggle="tab" href="#tab-evaluacion" role="tab">
                    <i class="fa fa-cutlery"></i> 3. Eval. Cuantitativa
                </a>
            </li>
            <li class="nav-item">
                <a class="nav-link" id="tab-analisis-link" data-toggle="tab" href="#tab-analisis" role="tab">
                    <i class="fa fa-flask"></i> 4. Análisis
                </a>
            </li>
            <li class="nav-item">
                <a class="nav-link" id="tab-padecimientos-link" data-toggle="tab" 
                   href="#tab-padecimientos" role="tab">
                    <i class="fa fa-medkit"></i> 5. Padecimientos
                </a>
            </li>
        </ul>

        <%-- TABS CONTENT --%>
        <div class="tab-content" id="consultaTabsContent">
            
                       <%-- TAB 1: MÉTRICAS CORPORALES --%>
            <div class="tab-pane fade show active" id="tab-metricas" role="tabpanel">
                <div class="mt-4">
                    <h5>Métricas Corporales</h5>
                    <hr>

                    <%-- FILA 1: Peso y Estatura --%>
                    <div class="form-row">
                        <div class="form-group col-md-6">
                            <label for="txtPeso" class="input__label">Peso (kg) *</label>
                            <input type="number" step="0.01" class="form-control input-style" id="txtPeso"
                                   placeholder="Ej: 70.5" required min="20" max="300">
                        </div>
                        <div class="form-group col-md-6">
                            <label for="txtEstatura" class="input__label">Estatura (cm) *</label>
                            <input type="number" step="0.1" class="form-control input-style" id="txtEstatura"
                                   placeholder="Ej: 170.5" required min="50" max="250">
                        </div>
                    </div>

                    <%-- IMC --%>
                    <div class="form-row">
                        <div class="form-group col-md-12">
                            <label class="input__label">IMC (Índice de Masa Corporal)</label>
                            <div class="alert alert-info" role="alert">
                                <strong>IMC Calculado:</strong> <span id="lblIMC">-</span> |
                                <span id="lblClasificacionIMC">Ingrese peso y estatura</span>
                            </div>
                        </div>
                    </div>

                    <%-- COMPOSICIÓN CORPORAL --%>
                    <h6 class="text-primary mt-3">Composición Corporal</h6>
                    <div class="form-row">
                        <div class="form-group col-md-3">
                            <label for="txtGrasag" class="input__label">Grasa (g)</label>
                            <input type="number" step="0.1" class="form-control input-style" id="txtGrasag"
                                   placeholder="Ej: 12000">
                        </div>
                        <div class="form-group col-md-3">
                            <label for="txtGrasaPorcentaje" class="input__label">Grasa (%)</label>
                            <input type="number" step="0.1" class="form-control input-style" id="txtGrasaPorcentaje"
                                   placeholder="Ej: 22.5" min="1" max="70">
                        </div>
                        <div class="form-group col-md-3">
                            <label for="txtMusculog" class="input__label">Músculo (g)</label>
                            <input type="number" step="0.1" class="form-control input-style" id="txtMusculog"
                                   placeholder="Ej: 16000">
                        </div>
                        <div class="form-group col-md-3">
                            <label for="txtMasaOsea" class="input__label">Masa Ósea (g)</label>
                            <input type="number" step="0.1" class="form-control input-style" id="txtMasaOsea"
                                   placeholder="Ej: 2800">
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group col-md-3">
                            <label for="txtAguaCorporal" class="input__label">Agua Corporal (%)</label>
                            <input type="number" step="0.1" class="form-control input-style" id="txtAguaCorporal"
                                   placeholder="Ej: 55.0" min="1" max="80">
                            <small class="text-muted">Litros ≈ (% × Peso) / 100</small>
                        </div>
                        <div class="form-group col-md-3">
                            <label for="txtEdadMetabolica" class="input__label">Edad Metabólica (años)</label>
                            <input type="number" class="form-control input-style" id="txtEdadMetabolica"
                                   placeholder="Ej: 35" min="1" max="120">
                        </div>
                        <div class="form-group col-md-3">
                            <label for="txtGrasaVisceral" class="input__label">Grasa Visceral (1-59)</label>
                            <input type="number" class="form-control input-style" id="txtGrasaVisceral"
                                   placeholder="Ej: 8" min="1" max="59">
                        </div>
                    </div>

                    <%-- CIRCUNFERENCIAS --%>
                    <h6 class="text-primary mt-3">Circunferencias</h6>
                    <div class="form-row">
                        <div class="form-group col-md-4">
                            <label for="txtCircunferenciaCintura" class="input__label">Cintura (cm)</label>
                            <input type="number" step="0.1" class="form-control input-style" id="txtCircunferenciaCintura"
                                   placeholder="Ej: 85.5" min="40" max="200">
                        </div>
                        <div class="form-group col-md-4">
                            <label for="txtCircunferenciaCadera" class="input__label">Cadera (cm)</label>
                            <input type="number" step="0.1" class="form-control input-style" id="txtCircunferenciaCadera"
                                   placeholder="Ej: 95.0" min="50" max="200">
                        </div>
                        <div class="form-group col-md-4">
                            <label for="txtCircunferenciaMuneca" class="input__label">Muñeca (cm)</label>
                            <input type="number" step="0.1" class="form-control input-style" id="txtCircunferenciaMuneca"
                                   placeholder="Ej: 16.5" min="10" max="30">
                        </div>
                    </div>

                    <%-- PRESIÓN ARTERIAL --%>
                    <h6 class="text-primary mt-3">Presión Arterial</h6>
                    <div class="form-row">
                        <div class="form-group col-md-6">
                            <label for="txtPresionSistolica" class="input__label">Sistólica (mmHg)</label>
                            <input type="number" class="form-control input-style" id="txtPresionSistolica"
                                   placeholder="Ej: 120" min="60" max="250">
                        </div>
                        <div class="form-group col-md-6">
                            <label for="txtPresionDiastolica" class="input__label">Diastólica (mmHg)</label>
                            <input type="number" class="form-control input-style" id="txtPresionDiastolica"
                                   placeholder="Ej: 80" min="40" max="150">
                        </div>
                    </div>

                    <%-- PLIEGUES CUTÁNEOS --%>
                    <h6 class="text-primary mt-3">
                        Pliegues Cutáneos
                        <small class="text-muted font-weight-normal">(opcional)</small>
                        <button type="button" class="btn btn-sm btn-outline-secondary ml-2"
                            onclick="togglePliegues()">
                            <i class="fa fa-chevron-down" id="iconPliegues"></i>
                            <span id="txtBtnPliegues">Expandir</span>
                        </button>
                    </h6>

                    <div id="panelPliegues" style="display:none;">
                        <p class="text-muted small">
                            <i class="fa fa-info-circle"></i>
                            Ingrese el valor en mm y presione Guardar. Puede ingresar solo los pliegues que midió.
                        </p>
                        <div class="form-row">
                            <%-- Fila 1 --%>
                            <div class="form-group col-md-3">
                                <label class="input__label">Tricipital (mm)</label>
                                <div class="input-group">
                                    <input type="number" step="0.1" class="form-control input-style pliegue-input"
                                           id="plTricipital" data-tipo="Tricipital" placeholder="mm" min="1" max="80">
                                    <div class="input-group-append">
                                        <button class="btn btn-outline-success btn-sm" type="button"
                                            onclick="guardarPliegue('Tricipital','plTricipital')">
                                            <i class="fa fa-save"></i>
                                        </button>
                                    </div>
                                </div>
                                <small class="text-success pliegue-estado" id="stTricipital"></small>
                            </div>
                            <div class="form-group col-md-3">
                                <label class="input__label">Bicipital (mm)</label>
                                <div class="input-group">
                                    <input type="number" step="0.1" class="form-control input-style pliegue-input"
                                           id="plBicipital" data-tipo="Bicipital" placeholder="mm" min="1" max="80">
                                    <div class="input-group-append">
                                        <button class="btn btn-outline-success btn-sm" type="button"
                                            onclick="guardarPliegue('Bicipital','plBicipital')">
                                            <i class="fa fa-save"></i>
                                        </button>
                                    </div>
                                </div>
                                <small class="text-success pliegue-estado" id="stBicipital"></small>
                            </div>
                            <div class="form-group col-md-3">
                                <label class="input__label">Subescapular (mm)</label>
                                <div class="input-group">
                                    <input type="number" step="0.1" class="form-control input-style pliegue-input"
                                           id="plSubescapular" data-tipo="Subescapular" placeholder="mm" min="1" max="80">
                                    <div class="input-group-append">
                                        <button class="btn btn-outline-success btn-sm" type="button"
                                            onclick="guardarPliegue('Subescapular','plSubescapular')">
                                            <i class="fa fa-save"></i>
                                        </button>
                                    </div>
                                </div>
                                <small class="text-success pliegue-estado" id="stSubescapular"></small>
                            </div>
                            <div class="form-group col-md-3">
                                <label class="input__label">Suprailíaco (mm)</label>
                                <div class="input-group">
                                    <input type="number" step="0.1" class="form-control input-style pliegue-input"
                                           id="plSuprailíaco" data-tipo="Suprailíaco" placeholder="mm" min="1" max="80">
                                    <div class="input-group-append">
                                        <button class="btn btn-outline-success btn-sm" type="button"
                                            onclick="guardarPliegue('Suprailíaco','plSuprailíaco')">
                                            <i class="fa fa-save"></i>
                                        </button>
                                    </div>
                                </div>
                                <small class="text-success pliegue-estado" id="stSuprailíaco"></small>
                            </div>
                        </div>
                        <div class="form-row">
                            <%-- Fila 2 --%>
                            <div class="form-group col-md-3">
                                <label class="input__label">Abdominal (mm)</label>
                                <div class="input-group">
                                    <input type="number" step="0.1" class="form-control input-style pliegue-input"
                                           id="plAbdominal" data-tipo="Abdominal" placeholder="mm" min="1" max="80">
                                    <div class="input-group-append">
                                        <button class="btn btn-outline-success btn-sm" type="button"
                                            onclick="guardarPliegue('Abdominal','plAbdominal')">
                                            <i class="fa fa-save"></i>
                                        </button>
                                    </div>
                                </div>
                                <small class="text-success pliegue-estado" id="stAbdominal"></small>
                            </div>
                            <div class="form-group col-md-3">
                                <label class="input__label">Muslo Anterior (mm)</label>
                                <div class="input-group">
                                    <input type="number" step="0.1" class="form-control input-style pliegue-input"
                                           id="plMuslo_Anterior" data-tipo="Muslo_Anterior" placeholder="mm" min="1" max="80">
                                    <div class="input-group-append">
                                        <button class="btn btn-outline-success btn-sm" type="button"
                                            onclick="guardarPliegue('Muslo_Anterior','plMuslo_Anterior')">
                                            <i class="fa fa-save"></i>
                                        </button>
                                    </div>
                                </div>
                                <small class="text-success pliegue-estado" id="stMuslo_Anterior"></small>
                            </div>
                            <div class="form-group col-md-3">
                                <label class="input__label">Pierna Medial (mm)</label>
                                <div class="input-group">
                                    <input type="number" step="0.1" class="form-control input-style pliegue-input"
                                           id="plPierna_Medial" data-tipo="Pierna_Medial" placeholder="mm" min="1" max="80">
                                    <div class="input-group-append">
                                        <button class="btn btn-outline-success btn-sm" type="button"
                                            onclick="guardarPliegue('Pierna_Medial','plPierna_Medial')">
                                            <i class="fa fa-save"></i>
                                        </button>
                                    </div>
                                </div>
                                <small class="text-success pliegue-estado" id="stPierna_Medial"></small>
                            </div>
                            <div class="form-group col-md-3">
                                <label class="input__label">Pectoral (mm)</label>
                                <div class="input-group">
                                    <input type="number" step="0.1" class="form-control input-style pliegue-input"
                                           id="plPectoral" data-tipo="Pectoral" placeholder="mm" min="1" max="80">
                                    <div class="input-group-append">
                                        <button class="btn btn-outline-success btn-sm" type="button"
                                            onclick="guardarPliegue('Pectoral','plPectoral')">
                                            <i class="fa fa-save"></i>
                                        </button>
                                    </div>
                                </div>
                                <small class="text-success pliegue-estado" id="stPectoral"></small>
                            </div>
                        </div>
                        <div class="form-row">
                            <%-- Fila 3 --%>
                            <div class="form-group col-md-3">
                                <label class="input__label">Axilar Medio (mm)</label>
                                <div class="input-group">
                                    <input type="number" step="0.1" class="form-control input-style pliegue-input"
                                           id="plAxilar_Medio" data-tipo="Axilar_Medio" placeholder="mm" min="1" max="80">
                                    <div class="input-group-append">
                                        <button class="btn btn-outline-success btn-sm" type="button"
                                            onclick="guardarPliegue('Axilar_Medio','plAxilar_Medio')">
                                            <i class="fa fa-save"></i>
                                        </button>
                                    </div>
                                </div>
                                <small class="text-success pliegue-estado" id="stAxilar_Medio"></small>
                            </div>
                        </div>

                        <%-- Tabla resumen de pliegues guardados --%>
                        <div id="divResumenPliegues" style="display:none;">
                            <h6 class="mt-3">Pliegues guardados en esta consulta</h6>
                            <table class="table table-sm table-bordered" id="tblPliegues">
                                <thead class="thead-light">
                                    <tr>
                                        <th>Tipo</th>
                                        <th>Valor (mm)</th>
                                        <th style="text-align:center">Eliminar</th>
                                    </tr>
                                </thead>
                                <tbody id="tbodyPliegues"></tbody>
                            </table>
                        </div>
                    </div>

                    <%-- ANTROPOMETRÍA DE BRAZO / ESTIMACIONES --%>
                    <h6 class="text-primary mt-3">
                        Antropometr&iacute;a de Brazo / Estimaciones
                        <small class="text-muted font-weight-normal">(para pacientes que no se pueden pesar o tallar)</small>
                        <button type="button" class="btn btn-sm btn-outline-secondary ml-2" onclick="toggleAntropometria()">
                            <i class="fa fa-chevron-down" id="iconAntrop"></i>
                            <span id="txtBtnAntrop">Expandir</span>
                        </button>
                    </h6>

                    <div id="panelAntrop" style="display:none;">
                        <p class="text-muted small mb-1">
                            <i class="fa fa-info-circle"></i>
                            ATB, CMB, AMB y AGB se calculan con el Pliegue Tricipital ya guardado (si no hay pliegue, se asume PCT = 0).
                        </p>
                        <p class="text-muted small">
                            <i class="fa fa-exclamation-circle text-warning"></i>
                            Las <strong>estimaciones de Peso y Talla</strong> requieren que el paciente tenga
                            <strong>Fecha de Nacimiento</strong> y <strong>Sexo</strong> registrados en su perfil.
                            Si aparece N/A, verificar esos datos.
                        </p>
                        <div class="form-row">
                            <div class="form-group col-md-3">
                                <label class="input__label">Circ. Brazo &mdash; PB (cm)</label>
                                <input type="number" step="0.1" class="form-control input-style"
                                       id="antPB" placeholder="cm" min="5" max="60">
                            </div>
                            <div class="form-group col-md-3">
                                <label class="input__label">Circ. Pantorrilla (cm)</label>
                                <input type="number" step="0.1" class="form-control input-style"
                                       id="antPantorrilla" placeholder="cm" min="5" max="80">
                            </div>
                            <div class="form-group col-md-3">
                                <label class="input__label">Altura de Rodilla &mdash; AR (cm)</label>
                                <input type="number" step="0.1" class="form-control input-style"
                                       id="antAR" placeholder="cm" min="20" max="70">
                            </div>
                            <div class="form-group col-md-3">
                                <label class="input__label">Etnia <small class="text-muted">(solo para el c&aacute;lculo)</small></label>
                                <select class="form-control input-style" id="antEtnia">
                                    <option value="">— Seleccione —</option>
                                    <option value="B">Blanca / Mestiza</option>
                                    <option value="N">Negra / Afrodescendiente</option>
                                </select>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="col-12 text-right">
                                <button type="button" class="btn btn-primary" onclick="calcularAntropometria()">
                                    <i class="fa fa-calculator"></i> Calcular y Guardar
                                </button>
                            </div>
                        </div>

                        <%-- Resultados calculados --%>
                        <div id="divResultadosAntrop" style="display:none; margin-top:1rem;">
                            <h6 class="text-success"><i class="fa fa-check-circle"></i> Resultados</h6>
                            <div class="row">
                                <div class="col-6 col-md-3 mb-2">
                                    <div class="card card-body py-2 text-center" style="border-color:#6366f1;">
                                        <div class="small text-muted">ATB</div>
                                        <div class="font-weight-bold"><span id="antResATB">-</span> cm&sup2;</div>
                                        <div class="text-muted" style="font-size:0.7rem;">&Aacute;rea Total Brazo</div>
                                    </div>
                                </div>
                                <div class="col-6 col-md-3 mb-2">
                                    <div class="card card-body py-2 text-center" style="border-color:#10b981;">
                                        <div class="small text-muted">CMB</div>
                                        <div class="font-weight-bold"><span id="antResCMB">-</span> cm</div>
                                        <div class="text-muted" style="font-size:0.7rem;">Circ. Muscular Brazo</div>
                                    </div>
                                </div>
                                <div class="col-6 col-md-3 mb-2">
                                    <div class="card card-body py-2 text-center" style="border-color:#10b981;">
                                        <div class="small text-muted">AMB</div>
                                        <div class="font-weight-bold"><span id="antResAMB">-</span> cm&sup2;</div>
                                        <div class="text-muted" style="font-size:0.7rem;">&Aacute;rea Muscular Brazo</div>
                                    </div>
                                </div>
                                <div class="col-6 col-md-3 mb-2">
                                    <div class="card card-body py-2 text-center" style="border-color:#f59e0b;">
                                        <div class="small text-muted">AGB</div>
                                        <div class="font-weight-bold"><span id="antResAGB">-</span> cm&sup2;</div>
                                        <div class="text-muted" style="font-size:0.7rem;">&Aacute;rea Grasa Brazo</div>
                                    </div>
                                </div>
                            </div>
                            <div class="row">
                                <div class="col-6 col-md-3 mb-2">
                                    <div class="card card-body py-2 text-center bg-light">
                                        <div class="small text-muted">Peso estimado</div>
                                        <div class="font-weight-bold"><span id="antResPeso">-</span> kg</div>
                                        <div class="text-muted" style="font-size:0.7rem;">F&oacute;rmula Chumlea</div>
                                    </div>
                                </div>
                                <div class="col-6 col-md-3 mb-2">
                                    <div class="card card-body py-2 text-center bg-light">
                                        <div class="small text-muted">Talla estimada</div>
                                        <div class="font-weight-bold"><span id="antResTalla">-</span> cm</div>
                                        <div class="text-muted" style="font-size:0.7rem;">F&oacute;rmula Chumlea</div>
                                    </div>
                                </div>
                                <div class="col-6 col-md-3 mb-2">
                                    <div class="card card-body py-2 text-center bg-light">
                                        <div class="small text-muted">Edad calculada</div>
                                        <div class="font-weight-bold"><span id="antResEdad">-</span> a&ntilde;os</div>
                                        <div class="text-muted" style="font-size:0.7rem;">A la fecha de cita</div>
                                    </div>
                                </div>
                                <div class="col-6 col-md-3 mb-2">
                                    <div class="card card-body py-2 text-center bg-light">
                                        <div class="small text-muted">PCT Tricipital usado</div>
                                        <div class="font-weight-bold"><span id="antResPCT">-</span> cm</div>
                                        <div class="text-muted" style="font-size:0.7rem;">De pliegues registrados</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <%-- PRÓXIMA CITA --%>
                    <div class="form-row mt-3">
                        <div class="form-group col-md-6">
                            <label for="txtProximaCita" class="input__label">Próxima Cita (opcional)</label>
                            <input type="datetime-local" class="form-control input-style" id="txtProximaCita">
                        </div>
                    </div>

                    <hr>

                    <%-- NOTAS CLÍNICAS --%>
                    <h5 class="mt-3 mb-3">Notas Clínicas</h5>
                    <div class="form-row">
                        <div class="form-group col-md-12">
                            <label for="txtObservaciones" class="input__label">Observaciones del Médico</label>
                            <textarea class="form-control input-style" id="txtObservaciones" rows="4"
                                      placeholder="Registre hallazgos, síntomas, condiciones observadas..."
                                      maxlength="2000"></textarea>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group col-md-12">
                            <label for="txtRecomendaciones" class="input__label">Recomendaciones</label>
                            <textarea class="form-control input-style" id="txtRecomendaciones" rows="4"
                                      placeholder="Plan de alimentación, ejercicio, seguimiento..."
                                      maxlength="2000"></textarea>
                        </div>
                    </div>

                    <div class="text-right mt-3">
                        <button type="button" class="btn btn-outline-secondary" onclick="cmLimpiarMetricas()">
                            <i class="fa fa-eraser"></i> Limpiar
                        </button>
                        <button type="button" class="btn btn-primary" onclick="guardarMetricas()">
                            <i class="fa fa-save"></i> Guardar Métricas
                        </button>
                        <button type="button" class="btn btn-success" onclick="irSiguienteTab('tab-historia-link')">
                            Siguiente: Historia Clínica <i class="fa fa-arrow-right"></i>
                        </button>
                    </div>
                </div>
            </div>

            <%-- ============================================ --%>
            <%-- TAB 2: HISTORIA CLÍNICA --%>
            <%-- ============================================ --%>
            <div class="tab-pane fade" id="tab-historia" role="tabpanel">
                <div class="mt-4">
                    <h5>Historia Clínica del Paciente</h5>
                    <p class="text-muted">
                        <i class="fa fa-info-circle"></i> 
                        Esta información puede completarse gradualmente. No es necesario llenar todos los campos en la primera consulta.
                    </p>
                    <hr>
                                        <%-- ANTECEDENTES GENERALES --%>
                    <h6 class="text-primary">Antecedentes Generales</h6>
                    
                    <div class="form-row">
                        <div class="form-group col-md-12">
                            <label for="txtObjetivosClinicos" class="input__label">Objetivos Clínicos</label>
                            <textarea class="form-control input-style" id="txtObjetivosClinicos" rows="3" 
                                      placeholder="Ej: Reducción de peso, control de diabetes, mejorar rendimiento deportivo..."></textarea>
                        </div>
                    </div>

                    <div class="form-row">
                        <div class="form-group col-md-4">
                            <label for="cboCalidadSueno" class="input__label">Calidad de Sueño</label>
                            <select class="form-control input-style" id="cboCalidadSueno">
                                <option value="">Seleccione...</option>
                                <option value="Excelente">Excelente (7-9 horas, sin interrupciones)</option>
                                <option value="Buena">Buena (6-7 horas, pocas interrupciones)</option>
                                <option value="Regular">Regular (5-6 horas, algunas interrupciones)</option>
                                <option value="Mala">Mala (menos de 5 horas o muy interrumpido)</option>
                            </select>
                        </div>
                        <div class="form-group col-md-4">
                            <label for="cboFuncionIntestinal" class="input__label">Función Intestinal</label>
                            <select class="form-control input-style" id="cboFuncionIntestinal">
                                <option value="">Seleccione...</option>
                                <option value="Normal">Normal (1-2 veces/día)</option>
                                <option value="Estreñimiento">Estreñimiento</option>
                                <option value="Diarrea">Diarrea frecuente</option>
                                <option value="Irregular">Irregular</option>
                            </select>
                        </div>
                        <div class="form-group col-md-4">
                            <label for="txtIngestaAgua" class="input__label">Ingesta de Agua Diaria</label>
                            <input type="text" class="form-control input-style" id="txtIngestaAgua" 
                                   placeholder="Ej: 1.5-2 litros, 6-8 vasos">
                        </div>
                    </div>

                    <div class="form-row">
                        <div class="form-group col-md-3">
                            <label class="input__label">¿Fuma?</label>
                            <div class="custom-control custom-checkbox">
                                <input type="checkbox" class="custom-control-input" id="chkFuma">
                                <label class="custom-control-label" for="chkFuma">Sí</label>
                            </div>
                        </div>
                        <div class="form-group col-md-3">
                            <label class="input__label">¿Consume Alcohol?</label>
                            <div class="custom-control custom-checkbox">
                                <input type="checkbox" class="custom-control-input" id="chkConsumeAlcohol" onchange="toggleFrecuenciaAlcohol()">
                                <label class="custom-control-label" for="chkConsumeAlcohol">Sí</label>
                            </div>
                        </div>
                        <div class="form-group col-md-6" id="divFrecuenciaAlcohol" style="display:none;">
                            <label for="txtFrecuenciaAlcohol" class="input__label">Frecuencia de Consumo</label>
                            <input type="text" class="form-control input-style" id="txtFrecuenciaAlcohol" 
                                   placeholder="Ej: 1-2 veces/semana, ocasional, diario">
                        </div>
                    </div>

                    <div class="form-row">
                        <div class="form-group col-md-6">
                            <label for="txtActividadFisica" class="input__label">Actividad Física</label>
                            <input type="text" class="form-control input-style" id="txtActividadFisica" 
                                   placeholder="Ej: Sedentario, caminata 3 veces/semana, gimnasio diario">
                        </div>
                        <div class="form-group col-md-6">
                            <label for="txtMedicamentos" class="input__label">Medicamentos Actuales</label>
                            <input type="text" class="form-control input-style" id="txtMedicamentos" 
                                   placeholder="Ej: Metformina 500mg, Losartán 50mg">
                        </div>
                    </div>

                    <div class="form-row">
                        <div class="form-group col-md-12">
                            <label for="txtCirugiasRecientes" class="input__label">Cirugías Recientes</label>
                            <textarea class="form-control input-style" id="txtCirugiasRecientes" rows="2" 
                                      placeholder="Ej: Apendicectomía (2023), Cesárea (2022)"></textarea>
                        </div>
                    </div>

                    <div class="form-row">
                        <div class="form-group col-md-6">
                            <label class="input__label">¿Embarazo?</label>
                            <div class="custom-control custom-checkbox">
                                <input type="checkbox" class="custom-control-input" id="chkEmbarazo">
                                <label class="custom-control-label" for="chkEmbarazo">Sí, actualmente embarazada</label>
                            </div>
                        </div>
                        <div class="form-group col-md-6">
                            <label class="input__label">¿Lactancia?</label>
                            <div class="custom-control custom-checkbox">
                                <input type="checkbox" class="custom-control-input" id="chkLactancia">
                                <label class="custom-control-label" for="chkLactancia">Sí, actualmente lactando</label>
                            </div>
                        </div>
                    </div>

                    <hr>

                    <%-- PREFERENCIAS ALIMENTARIAS --%>
                    <h6 class="text-primary mt-4">Preferencias Alimentarias</h6>
                    
                    <div class="form-row">
                        <div class="form-group col-md-6">
                            <label for="txtAlimentosFavoritos" class="input__label">Alimentos Favoritos</label>
                            <textarea class="form-control input-style" id="txtAlimentosFavoritos" rows="3" 
                                      placeholder="Ej: Pollo, arroz, aguacate, manzanas..."></textarea>
                        </div>
                        <div class="form-group col-md-6">
                            <label for="txtAlimentosNoGustan" class="input__label">Alimentos que No Le Gustan</label>
                            <textarea class="form-control input-style" id="txtAlimentosNoGustan" rows="3" 
                                      placeholder="Ej: Pescado, brócoli, lácteos..."></textarea>
                        </div>
                    </div>

                    <div class="form-row">
                        <div class="form-group col-md-6">
                            <label for="txtIntolerancias" class="input__label">Intolerancias Alimentarias</label>
                            <textarea class="form-control input-style" id="txtIntolerancias" rows="3" 
                                      placeholder="Ej: Lactosa, gluten, fructosa..."></textarea>
                        </div>
                        <div class="form-group col-md-6">
                            <label for="txtAlergias" class="input__label">Alergias Alimentarias</label>
                            <textarea class="form-control input-style" id="txtAlergias" rows="3" 
                                      placeholder="Ej: Maní, mariscos, huevo..."></textarea>
                            <small class="text-danger">⚠️ Importante para evitar en el plan nutricional</small>
                        </div>
                    </div>

                    <div class="text-right mt-3">
                        <button type="button" class="btn btn-secondary" onclick="irSiguienteTab('tab-metricas-link')">
                            <i class="fa fa-arrow-left"></i> Anterior
                        </button>
                        <button type="button" class="btn btn-outline-secondary" onclick="cmLimpiarHistoriaClinica()">
                            <i class="fa fa-eraser"></i> Limpiar
                        </button>
                        <button type="button" class="btn btn-primary" onclick="guardarHistoriaClinica()">
                            <i class="fa fa-save"></i> Guardar Historia Clínica
                        </button>
                        <button type="button" class="btn btn-success" onclick="irSiguienteTab('tab-evaluacion-link')">
                            Siguiente: Evaluación <i class="fa fa-arrow-right"></i>
                        </button>
                    </div>
                </div>
            </div>

            <%-- ============================================ --%>
            <%-- TAB 3: EVALUACIÓN CUANTITATIVA --%>
            <%-- ============================================ --%>
            <div class="tab-pane fade" id="tab-evaluacion" role="tabpanel">
                <div class="mt-4">
                    <h5>Evaluación Cuantitativa - Consumo Usual</h5>
                    <p class="text-muted">
                        <i class="fa fa-info-circle"></i> 
                        Registre lo que el paciente consume habitualmente en cada tiempo de comida.
                    </p>
                    <hr>

                    <div class="accordion" id="accordionEvaluacion">
                        
                        <%-- DESAYUNO --%>
                        <div class="card">
                            <div class="card-header" id="headingDesayuno">
                                <h6 class="mb-0">
                                    <button class="btn btn-link" type="button" data-toggle="collapse" data-target="#collapseDesayuno">
                                        <i data-lucide="coffee" width="15" height="15" style="vertical-align:middle;margin-right:5px;"></i>Desayuno
                                    </button>
                                </h6>
                            </div>
                            <div id="collapseDesayuno" class="collapse show" data-parent="#accordionEvaluacion">
                                <div class="card-body">
                                    <textarea class="form-control" id="txtEvalDesayuno" rows="3" 
                                              placeholder="Ej: Café con leche, pan integral con queso, frutas..."></textarea>
                                </div>
                            </div>
                        </div>

                        <%-- MERIENDA AM --%>
                        <div class="card">
                            <div class="card-header" id="headingMeriendaAM">
                                <h6 class="mb-0">
                                    <button class="btn btn-link collapsed" type="button" data-toggle="collapse" data-target="#collapseMeriendaAM">
                                        <i data-lucide="apple" width="15" height="15" style="vertical-align:middle;margin-right:5px;"></i>Merienda AM
                                    </button>
                                </h6>
                            </div>
                            <div id="collapseMeriendaAM" class="collapse" data-parent="#accordionEvaluacion">
                                <div class="card-body">
                                    <textarea class="form-control" id="txtEvalMeriendaAM" rows="3" 
                                              placeholder="Ej: Yogurt, fruta, frutos secos..."></textarea>
                                </div>
                            </div>
                        </div>

                        <%-- ALMUERZO --%>
                        <div class="card">
                            <div class="card-header" id="headingAlmuerzo">
                                <h6 class="mb-0">
                                    <button class="btn btn-link collapsed" type="button" data-toggle="collapse" data-target="#collapseAlmuerzo">
                                        <i data-lucide="sun" width="15" height="15" style="vertical-align:middle;margin-right:5px;"></i>Almuerzo
                                    </button>
                                </h6>
                            </div>
                            <div id="collapseAlmuerzo" class="collapse" data-parent="#accordionEvaluacion">
                                <div class="card-body">
                                    <textarea class="form-control" id="txtEvalAlmuerzo" rows="3" 
                                              placeholder="Ej: Arroz, pollo, ensalada, frijoles..."></textarea>
                                </div>
                            </div>
                        </div>

                        <%-- MERIENDA PM --%>
                        <div class="card">
                            <div class="card-header" id="headingMeriendaPM">
                                <h6 class="mb-0">
                                    <button class="btn btn-link collapsed" type="button" data-toggle="collapse" data-target="#collapseMeriendaPM">
                                        <i data-lucide="cookie" width="15" height="15" style="vertical-align:middle;margin-right:5px;"></i>Merienda PM
                                    </button>
                                </h6>
                            </div>
                            <div id="collapseMeriendaPM" class="collapse" data-parent="#accordionEvaluacion">
                                <div class="card-body">
                                    <textarea class="form-control" id="txtEvalMeriendaPM" rows="3" 
                                              placeholder="Ej: Galletas integrales, té..."></textarea>
                                </div>
                            </div>
                        </div>

                        <%-- CENA --%>
                        <div class="card">
                            <div class="card-header" id="headingCena">
                                <h6 class="mb-0">
                                    <button class="btn btn-link collapsed" type="button" data-toggle="collapse" data-target="#collapseCena">
                                        <i data-lucide="moon" width="15" height="15" style="vertical-align:middle;margin-right:5px;"></i>Cena
                                    </button>
                                </h6>
                            </div>
                            <div id="collapseCena" class="collapse" data-parent="#accordionEvaluacion">
                                <div class="card-body">
                                    <textarea class="form-control" id="txtEvalCena" rows="3" 
                                              placeholder="Ej: Sopa de verduras, pescado, ensalada..."></textarea>
                                </div>
                            </div>
                        </div>

                    </div>

                    <div class="text-right mt-3">
                        <button type="button" class="btn btn-secondary" onclick="irSiguienteTab('tab-historia-link')">
                            <i class="fa fa-arrow-left"></i> Anterior
                        </button>
                        <button type="button" class="btn btn-outline-secondary" onclick="cmLimpiarEvaluacion()">
                            <i class="fa fa-eraser"></i> Limpiar
                        </button>
                        <button type="button" class="btn btn-primary" onclick="guardarEvaluacionCuantitativa()">
                            <i class="fa fa-save"></i> Guardar Evaluación
                        </button>
                        <button type="button" class="btn btn-success" onclick="irSiguienteTab('tab-analisis-link')">
                            Siguiente: Análisis <i class="fa fa-arrow-right"></i>
                        </button>
                    </div>
                </div>
            </div>

            <%-- ============================================ --%>
            <%-- TAB 4: ANÁLISIS BIOQUÍMICOS --%>
            <%-- ============================================ --%>
            <div class="tab-pane fade" id="tab-analisis" role="tabpanel">
                <div class="mt-4">
                    <h5>Análisis Bioquímicos (Laboratorio)</h5>
                    <p class="text-muted">
                        <i class="fa fa-info-circle"></i> 
                        Registre los resultados de laboratorio cuando el paciente los traiga. Todos los campos son opcionales.
                    </p>
                    <hr>

                    <div class="form-row">
                        <div class="form-group col-md-6">
                            <label for="txtFechaAnalisis" class="input__label">Fecha del Análisis *</label>
                            <input type="date" class="form-control input-style" id="txtFechaAnalisis">
                        </div>
                    </div>

                    <%-- HEMOGRAMA --%>
                    <h6 class="text-primary">Hemograma</h6>
                    <div class="form-row">
                        <div class="form-group col-md-6">
                            <label for="txtHemoglobina" class="input__label">Hemoglobina (g/dl)</label>
                            <input type="number" step="0.01" class="form-control input-style" id="txtHemoglobina" 
                                   placeholder="M: 14-19, F: 12-16">
                            <small class="text-muted">Rango: M: 14-19 g/dl, F: 12-16 g/dl</small>
                        </div>
                        <div class="form-group col-md-6">
                            <label for="txtHematocrito" class="input__label">Hematocrito (%)</label>
                            <input type="number" step="0.01" class="form-control input-style" id="txtHematocrito" 
                                   placeholder="M: 40-52, F: 37-47">
                            <small class="text-muted">Rango: M: 40-52%, F: 37-47%</small>
                        </div>
                    </div>

                    <%-- PERFIL LIPÍDICO --%>
                    <h6 class="text-primary mt-3">Perfil Lipídico</h6>
                    <div class="form-row">
                        <div class="form-group col-md-3">
                            <label for="txtColesterolTotal" class="input__label">Colesterol Total (mg/dl)</label>
                            <input type="number" step="0.01" class="form-control input-style" id="txtColesterolTotal" 
                                   placeholder="< 200">
                            <small class="text-muted">Normal: < 200 mg/dl</small>
                        </div>
                        <div class="form-group col-md-3">
                            <label for="txtHDL" class="input__label">HDL (mg/dl)</label>
                            <input type="number" step="0.01" class="form-control input-style" id="txtHDL" 
                                   placeholder="M: > 40, F: > 50">
                            <small class="text-muted">M: > 40, F: > 50 mg/dl</small>
                        </div>
                        <div class="form-group col-md-3">
                            <label for="txtLDL" class="input__label">LDL (mg/dl)</label>
                            <input type="number" step="0.01" class="form-control input-style" id="txtLDL" 
                                   placeholder="< 130">
                            <small class="text-muted">Óptimo: < 100 mg/dl</small>
                        </div>
                        <div class="form-group col-md-3">
                            <label for="txtTrigliceridos" class="input__label">Triglicéridos (mg/dl)</label>
                            <input type="number" step="0.01" class="form-control input-style" id="txtTrigliceridos" 
                                   placeholder="30-150">
                            <small class="text-muted">Normal: 30-150 mg/dl</small>
                        </div>
                    </div>

                    <%-- OTROS --%>
                    <h6 class="text-primary mt-3">Otros Indicadores</h6>
                    <div class="form-row">
                        <div class="form-group col-md-3">
                            <label for="txtGlicemia" class="input__label">Glicemia (mg/dl)</label>
                            <input type="number" step="0.01" class="form-control input-style" id="txtGlicemia" 
                                   placeholder="70-100">
                            <small class="text-muted">Normal: 70-100 mg/dl</small>
                        </div>
                        <div class="form-group col-md-3">
                            <label for="txtAcidoUrico" class="input__label">Ácido Úrico (mg/dl)</label>
                            <input type="number" step="0.01" class="form-control input-style" id="txtAcidoUrico" 
                                   placeholder="2.4-7.5">
                            <small class="text-muted">Normal: 2.4-7.5 mg/dl</small>
                        </div>
                        <div class="form-group col-md-3">
                            <label for="txtAlbumina" class="input__label">Albumina (g/dl)</label>
                            <input type="number" step="0.01" class="form-control input-style" id="txtAlbumina" 
                                   placeholder="3.4-5.4">
                            <small class="text-muted">Normal: 3.4-5.4 g/dl</small>
                        </div>
                        <div class="form-group col-md-3">
                            <label for="txtCreatinina" class="input__label">Creatinina (mg/dl)</label>
                            <input type="number" step="0.01" class="form-control input-style" id="txtCreatinina" 
                                   placeholder="0.6-1.2">
                            <small class="text-muted">M: 0.7-1.3, F: 0.6-1.1 mg/dl</small>
                        </div>
                    </div>

                    <%-- FUNCIÓN TIROIDEA --%>
                    <h6 class="text-primary mt-3">Función Tiroidea</h6>
                    <div class="form-row">
                        <div class="form-group col-md-4">
                            <label for="txtTSH" class="input__label">TSH (μUI/ml)</label>
                            <input type="number" step="0.001" class="form-control input-style" id="txtTSH" 
                                   placeholder="0.4-4.0">
                            <small class="text-muted">Normal: 0.4-4.0 μUI/ml</small>
                        </div>
                        <div class="form-group col-md-4">
                            <label for="txtT4" class="input__label">T4 (μg/dl)</label>
                            <input type="number" step="0.01" class="form-control input-style" id="txtT4" 
                                   placeholder="5.0-12.0">
                            <small class="text-muted">Normal: 5.0-12.0 μg/dl</small>
                        </div>
                        <div class="form-group col-md-4">
                            <label for="txtT3" class="input__label">T3 (ng/dl)</label>
                            <input type="number" step="0.01" class="form-control input-style" id="txtT3" 
                                   placeholder="80-200">
                            <small class="text-muted">Normal: 80-200 ng/dl</small>
                        </div>
                    </div>

                    <%-- VITAMINAS --%>
                    <h6 class="text-primary mt-3">Vitaminas</h6>
                    <div class="form-row">
                        <div class="form-group col-md-6">
                            <label for="txtVitaminaD" class="input__label">Vitamina D (ng/ml)</label>
                            <input type="number" step="0.01" class="form-control input-style" id="txtVitaminaD" 
                                   placeholder="30-50">
                            <small class="text-muted">Óptimo: 30-50 ng/ml</small>
                        </div>
                        <div class="form-group col-md-6">
                            <label for="txtVitaminaB12" class="input__label">Vitamina B12 (pg/ml)</label>
                            <input type="number" step="0.01" class="form-control input-style" id="txtVitaminaB12" 
                                   placeholder="200-900">
                            <small class="text-muted">Normal: 200-900 pg/ml</small>
                        </div>
                    </div>

                    <div class="form-row">
                        <div class="form-group col-md-12">
                            <label for="txtObservacionesAnalisis" class="input__label">Observaciones del Análisis</label>
                            <textarea class="form-control input-style" id="txtObservacionesAnalisis" rows="3" 
                                      placeholder="Notas adicionales sobre los resultados..."></textarea>
                        </div>
                    </div>


                    <div class="text-right mt-3">
                        <button type="button" class="btn btn-secondary" onclick="irSiguienteTab('tab-evaluacion-link')">
                            <i class="fa fa-arrow-left"></i> Anterior
                        </button>
                        <button type="button" class="btn btn-outline-secondary" onclick="cmLimpiarAnalisis()">
                            <i class="fa fa-eraser"></i> Limpiar
                        </button>
                        <button type="button" class="btn btn-primary" onclick="guardarAnalisisBioquimico()">
                            <i class="fa fa-save"></i> Guardar Análisis
                        </button>
                        <button type="button" class="btn btn-success" 
                            onclick="irSiguienteTab('tab-padecimientos-link')">
                            Siguiente: Padecimientos <i class="fa fa-arrow-right"></i>
                        </button>
                    </div>
                </div>
            </div>

        <%-- ============================================ --%>
<%-- TAB 5: PADECIMIENTOS --%>
<%-- ============================================ --%>
<div class="tab-pane fade" id="tab-padecimientos" role="tabpanel">
    <div class="mt-4">
        <h5>Padecimientos del Paciente</h5>
        <p class="text-muted">
            <i class="fa fa-info-circle"></i>
            Asigne o elimine padecimientos. Estos se usan para excluir 
            alimentos contraindicados en los planes nutricionales.
        </p>
        <hr>

        <%-- ASIGNAR --%>
        <div class="form-row align-items-end">
            <div class="form-group col-md-9 mb-0">
                <label for="cboPadecimientosMetricas" class="input__label">
                    Padecimientos Disponibles
                </label>
                <select id="cboPadecimientosMetricas" class="form-control input-style">
                    <option value="0">Seleccione un padecimiento...</option>
                </select>
            </div>
            <div class="form-group col-md-3 mb-0">
                <button type="button" class="btn btn-primary btn-block" onclick="cmAsignarPadecimiento()">
                    <i class="fa fa-plus"></i> Asignar
                </button>
            </div>
        </div>

        <%-- LISTA ASIGNADOS --%>
        <h6 class="mt-3">Padecimientos Asignados</h6>
        <table id="tblPadecimientosMetricas"
               class="table table-striped table-bordered mt-2">
            <%-- carga dinámica --%>
        </table>

        <div class="text-right mt-3">
            <button type="button" class="btn btn-secondary" onclick="irSiguienteTab('tab-analisis-link')">
                <i class="fa fa-arrow-left"></i> Anterior
            </button>
        </div>
    </div>
</div>
        </div><%-- /tab-content --%>
    </div><%-- /card-body (tabs) --%>
</div><%-- /card (tabs) --%>

<%-- CALCULADORA NUTRICIONAL --%>
        <div class="card card_border py-2 mb-4" style="background-color: #f8f9fa;">
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-center">
                    <h5 class="mb-0">
                        <i class="fa fa-calculator text-primary"></i> Calculadora Nutricional
                    </h5>
                    <button type="button" class="btn btn-primary" onclick="toggleCalculadora()">
                        <i class="fa fa-chevron-down" id="iconCalculadora"></i>
                        <span id="txtBtnCalculadora">Abrir Calculadora</span>
                    </button>
                </div>
        
                <%-- PANEL DE CALCULADORA (oculto por defecto) --%>
                <div id="panelCalculadora" style="display:none; margin-top: 20px;">
            
                    <%-- PASO 1: PESO IDEAL --%>
                    <div class="card mb-3">
                        <div class="card-header bg-info text-white">
                            <strong>1. Cálculo de Peso Ideal</strong>
                        </div>
                        <div class="card-body">
                            <div class="form-row">
                                <div class="form-group col-md-4">
                                    <label class="input__label">Estatura (m) *</label>
                                    <input type="number" step="0.01" class="form-control" id="calcEstatura"
                                           placeholder="Ej: 1.70" readonly>
                                    <small class="text-muted">Se toma de las métricas ingresadas arriba</small>
                                </div>
                                <div class="form-group col-md-4">
                                    <label class="input__label">Circunferencia de muñeca (cm)</label>
                                    <input type="number" step="0.1" class="form-control" id="calcCircMuneca"
                                           placeholder="Ej: 16.5" oninput="calcularFactorPorMuneca()">
                                    <small class="text-muted">Calcula el factor automáticamente (talla ÷ muñeca)</small>
                                </div>
                                <div class="form-group col-md-4">
                                    <label class="input__label">Factor Estructura Corporal *</label>
                                    <select class="form-control" id="calcFactorEstructura" onchange="calcularPesoIdeal()">
                                        <option value="">Seleccione...</option>
                                        <option value="20">Pequeña (20)</option>
                                        <option value="22.5">Mediana (22.5)</option>
                                        <option value="25">Grande (25)</option>
                                        <option value="27">Muy Grande (27)</option>
                                        <option value="otro">Otro (personalizado)</option>
                                    </select>
                                </div>
                            </div>
                            <div class="form-row" id="divFactorPersonalizado" style="display:none;">
                                <div class="form-group col-md-4">
                                    <label class="input__label">Factor Personalizado</label>
                                    <input type="number" step="0.01" class="form-control" id="calcFactorPersonalizado"
                                           placeholder="Ej: 23.5" oninput="calcularPesoIdeal()">
                                </div>
                                <div class="form-group col-md-4 d-flex align-items-end">
                                    <small class="text-muted" id="lblFactorCalculadoInfo" style="display:none;">
                                        Factor calculado: <strong id="lblFactorCalculado">—</strong>
                                        <span class="text-muted">(talla ÷ muñeca)</span>
                                    </small>
                                </div>
                            </div>
                            <div class="alert alert-success" role="alert">
                                <strong>Peso Ideal:</strong> <span id="lblPesoIdeal">-</span> kg
                            </div>
                        </div>
                    </div>

                    <%-- PASO 2: GEB --%>
                    <div class="card mb-3">
                        <div class="card-header bg-warning text-dark">
                            <strong>2. Gasto Energético Basal (GEB)</strong>
                        </div>
                        <div class="card-body">
                            <%-- Selector de fórmula --%>
                            <div class="form-row mb-3">
                                <div class="form-group col-md-6 mb-0">
                                    <label class="input__label">Fórmula de cálculo *</label>
                                    <select class="form-control" id="calcFormulaGEB" onchange="calcularGEB()">
                                        <option value="HarrisBenedict">Harris-Benedict (clásica)</option>
                                        <option value="FAO_OMS">FAO/OMS/ONU — Schofield</option>
                                        <option value="Mifflin">Mifflin-St Jeor (sobrepeso / obesidad)</option>
                                        <option value="Cunningham">Cunningham (hipertrofia)</option>
                                        <option value="Valencia">Valencia Mexicana</option>
                                    </select>
                                </div>
                                <div class="form-group col-md-6 mb-0 d-flex align-items-end">
                                    <small class="text-muted">
                                        <strong>Harris-Benedict:</strong> peso, talla y edad.<br>
                                        <strong>FAO/OMS (Schofield):</strong> rango de edad y sexo.<br>
                                        <strong>Mifflin-St Jeor:</strong> mejor validación en sobrepeso/obesidad.<br>
                                        <strong>Cunningham:</strong> prioridad hipertrofia; requiere % grasa corporal.<br>
                                        <strong>Valencia Mexicana:</strong> mayor validez en población mexicana.
                                    </small>
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group col-md-3">
                                    <label class="input__label">Peso (kg) *</label>
                                    <input type="number" step="0.01" class="form-control" id="calcPeso" readonly>
                                    <small class="text-muted">De métricas</small>
                                </div>
                                <div class="form-group col-md-3">
                                    <label class="input__label">Estatura (cm) *</label>
                                    <input type="number" step="0.1" class="form-control" id="calcEstaturaCm" readonly>
                                    <small class="text-muted">De métricas</small>
                                </div>
                                <div class="form-group col-md-3">
                                    <label class="input__label">Edad (años) *</label>
                                    <input type="number" class="form-control" id="calcEdad" readonly>
                                    <small class="text-muted">Calculada automáticamente</small>
                                </div>
                                <div class="form-group col-md-3">
                                    <label class="input__label">Sexo *</label>
                                    <input type="text" class="form-control" id="calcSexo" readonly>
                                    <small class="text-muted">Del usuario</small>
                                </div>
                            </div>
                            <%-- Fila MLG: visible solo con Cunningham --%>
                            <div class="form-row" id="divMLG" style="display:none;">
                                <div class="form-group col-md-4">
                                    <label class="input__label">Masa libre de grasa (kg)</label>
                                    <input type="number" step="0.01" class="form-control" id="calcMLG" readonly>
                                    <small class="text-muted">Calculada desde % grasa corporal ingresado en métricas</small>
                                </div>
                            </div>
                            <div class="alert alert-warning" role="alert">
                                <strong>GEB (Gasto Energético Basal):</strong> <span id="lblGEB">-</span> kcal/día
                                &nbsp;<small id="lblGEBFormula" class="text-muted"></small>
                            </div>
                        </div>
                    </div>

                    <%-- PASO 3: REE (REQUERIMIENTO ENERGÉTICO) --%>
                    <div class="card mb-3">
                        <div class="card-header bg-primary text-white">
                            <strong>3. Requerimiento Energético Estimado (REE)</strong>
                        </div>
                        <div class="card-body">
                            <div class="form-row">
                                <div class="form-group col-md-12">
                                    <label class="input__label">Factor de Actividad *</label>
                                    <select class="form-control" id="calcFactorActividad" onchange="calcularREE()">
                                        <option value="">Seleccione...</option>
                                        <option value="1.2">Sedentario (poco o ningún ejercicio) - 1.2</option>
                                        <option value="1.375">Ligero (ejercicio 1-3 días/semana) - 1.375</option>
                                        <option value="1.55">Moderado (ejercicio 3-5 días/semana) - 1.55</option>
                                        <option value="1.725">Fuerte (ejercicio 6-7 días/semana) - 1.725</option>
                                        <option value="1.9">Muy Fuerte (2 veces al día, entrenamientos duros) - 1.9</option>
                                    </select>
                                </div>
                            </div>
                            <div class="alert alert-info mb-2" role="alert">
                                <i class="fas fa-calculator"></i>
                                <strong>REE calculado:</strong> <span id="lblREE">-</span> kcal/día
                            </div>
                            <div class="form-row align-items-end">
                                <div class="form-group col-md-8 mb-0">
                                    <label class="input__label">
                                        Calorías a utilizar
                                        <small class="text-muted font-weight-normal ml-1">(editable según criterio clínico)</small>
                                    </label>
                                    <div class="input-group">
                                        <input type="number" step="0.01" class="form-control" id="calcREEEditable"
                                               placeholder="Se calcula automáticamente" min="0"
                                               oninput="actualizarREEManual()">
                                        <div class="input-group-append">
                                            <span class="input-group-text">kcal/día</span>
                                        </div>
                                    </div>
                                </div>
                                <div class="form-group col-md-4 mb-0">
                                    <button type="button" class="btn btn-outline-secondary btn-sm w-100"
                                            onclick="restaurarREECalculado()" title="Volver al valor calculado por Harris-Benedict">
                                        <i class="fas fa-undo"></i> Restaurar calculado
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <%-- PASO 4: DISTRIBUCIÓN DE MACRONUTRIENTES --%>
                    <div class="card mb-3">
                        <div class="card-header bg-success text-white">
                            <strong>4. Distribución de Macronutrientes</strong>
                        </div>
                        <div class="card-body">
                            <div class="form-row">
                                <div class="form-group col-md-4">
                                    <label class="input__label">% Carbohidratos</label>
                                    <input type="number" step="1" class="form-control" id="calcPorcentajeCHO" 
                                           placeholder="Ej: 50" min="0" max="100" onchange="calcularDistribucion()">
                                </div>
                                <div class="form-group col-md-4">
                                    <label class="input__label">% Proteínas</label>
                                    <input type="number" step="1" class="form-control" id="calcPorcentajeProt" 
                                           placeholder="Ej: 20" min="0" max="100" onchange="calcularDistribucion()">
                                </div>
                                <div class="form-group col-md-4">
                                    <label class="input__label">% Grasas</label>
                                    <input type="number" step="1" class="form-control" id="calcPorcentajeGrasa" 
                                           placeholder="Ej: 30" min="0" max="100" onchange="calcularDistribucion()">
                                </div>
                            </div>
                            <div class="alert alert-info" role="alert">
                                <strong>Total:</strong> <span id="lblTotalPorcentaje">0</span>% 
                                <span id="alertaPorcentaje" class="text-danger" style="display:none;">⚠️ Debe sumar 100%</span>
                            </div>

                            <hr>

                            <h6>Peso de Referencia para g/kg/día:</h6>
                            <div class="form-row">
                                <div class="form-group col-md-6">
                                    <select class="form-control" id="calcTipoPesoReferencia" onchange="actualizarPesoReferencia()">
                                        <option value="ideal">Peso Ideal (calculado)</option>
                                        <option value="actual">Peso Actual</option>
                                        <option value="personalizado">Peso Personalizado</option>
                                    </select>
                                </div>
                                <div class="form-group col-md-6">
                                    <input type="number" step="0.01" class="form-control" id="calcPesoReferencia" readonly>
                                </div>
                            </div>
                            <div class="form-group" id="divPesoPersonalizado" style="display:none;">
                                <label class="input__label">Peso Personalizado (kg)</label>
                                <input type="number" step="0.01" class="form-control" id="calcPesoPersonalizado" 
                                       placeholder="Ej: 68.5" onchange="actualizarPesoReferencia()">
                            </div>

                            <hr>

                            <h6>Resultados:</h6>
                            <table class="table table-bordered">
                                <thead class="thead-light">
                                    <tr>
                                        <th>Macronutriente</th>
                                        <th>Kcal</th>
                                        <th>Gramos</th>
                                        <th>g/kg/día</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td><strong>Carbohidratos</strong></td>
                                        <td><span id="lblKcalCHO">-</span></td>
                                        <td><span id="lblGramosCHO">-</span></td>
                                        <td><span id="lblGKgCHO">-</span></td>
                                    </tr>
                                    <tr>
                                        <td><strong>Proteínas</strong></td>
                                        <td><span id="lblKcalProt">-</span></td>
                                        <td><span id="lblGramosProt">-</span></td>
                                        <td><span id="lblGKgProt">-</span></td>
                                    </tr>
                                    <tr>
                                        <td><strong>Grasas</strong></td>
                                        <td><span id="lblKcalGrasa">-</span></td>
                                        <td><span id="lblGramosGrasa">-</span></td>
                                        <td><span id="lblGKgGrasa">-</span></td>
                                    </tr>
                                </tbody>
                            </table>

                            <div class="alert alert-success" role="alert">
                                <p><strong>📊 Resumen para Generador de Plan:</strong></p>
                                <p class="mb-0">
                                    <strong>Calorías Totales:</strong> <span id="lblResumenCalorias">-</span> kcal/día<br>
                                    <strong>CHO:</strong> <span id="lblResumenCHO">-</span> g | 
                                    <strong>Proteínas:</strong> <span id="lblResumenProt">-</span> g | 
                                     <strong>Grasas:</strong> <span id="lblResumenGrasa">-</span> g
                                </p>
                            </div>
                        </div>
                    </div>

                    <%-- ✅ NUEVA SECCIÓN: DISTRIBUCIÓN POR TIEMPOS DE COMIDA (OPCIONAL) --%>
                    <div class="card mb-3">
                        <div class="card-header bg-dark text-white d-flex justify-content-between align-items-center">
                            <strong>5. Distribución por Tiempos de Comida (Opcional)</strong>
                            <button type="button" class="btn btn-sm btn-light" onclick="toggleDistribucionTiempos()">
                                <i class="fa fa-chevron-down" id="iconDistribucion"></i>
                                <span id="txtBtnDistribucion">Expandir</span>
                            </button>
                        </div>
                        <div class="card-body" id="panelDistribucionTiempos" style="display:none;">
                            <p class="text-muted">
                                <i class="fa fa-info-circle"></i> 
                                Distribuya manualmente los gramos calculados entre los diferentes tiempos de comida según el criterio nutricional del paciente.
                            </p>

                            <%-- TABLA DE DISTRIBUCIÓN --%>
                            <div class="table-responsive">
                                <table class="table table-bordered table-hover">
                                    <thead class="thead-dark">
                                        <tr>
                                            <th>Tiempo de Comida</th>
                                            <th style="width:120px;">CHO (g)</th>
                                            <th style="width:120px;">Proteínas (g)</th>
                                            <th style="width:120px;">Grasas (g)</th>
                                            <th style="width:120px;">Fibra (g)</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td><span class="ns-meal-chip" style="background:#fef3c7;color:#92400e;border-color:#fde68a;"><i data-lucide="coffee" width="13" height="13" style="vertical-align:middle;margin-right:4px;"></i>Desayuno</span></td>
                                            <td><input type="number" step="0.1" class="form-control form-control-sm dist-cho" id="distDesayunoCHO" placeholder="0" onchange="calcularTotalesDistribucion()"></td>
                                            <td><input type="number" step="0.1" class="form-control form-control-sm dist-prot" id="distDesayunoProt" placeholder="0" onchange="calcularTotalesDistribucion()"></td>
                                            <td><input type="number" step="0.1" class="form-control form-control-sm dist-grasa" id="distDesayunoGrasa" placeholder="0" onchange="calcularTotalesDistribucion()"></td>
                                            <td><input type="number" step="0.1" class="form-control form-control-sm dist-fibra" id="distDesayunoFibra" placeholder="0" onchange="calcularTotalesDistribucion()"></td>
                                        </tr>
                                        <tr>
                                            <td><span class="ns-meal-chip" style="background:#d1fae5;color:#065f46;border-color:#a7f3d0;"><i data-lucide="apple" width="13" height="13" style="vertical-align:middle;margin-right:4px;"></i>Merienda AM</span></td>
                                            <td><input type="number" step="0.1" class="form-control form-control-sm dist-cho" id="distMeriendaAMCHO" placeholder="0" onchange="calcularTotalesDistribucion()"></td>
                                            <td><input type="number" step="0.1" class="form-control form-control-sm dist-prot" id="distMeriendaAMProt" placeholder="0" onchange="calcularTotalesDistribucion()"></td>
                                            <td><input type="number" step="0.1" class="form-control form-control-sm dist-grasa" id="distMeriendaAMGrasa" placeholder="0" onchange="calcularTotalesDistribucion()"></td>
                                            <td><input type="number" step="0.1" class="form-control form-control-sm dist-fibra" id="distMeriendaAMFibra" placeholder="0" onchange="calcularTotalesDistribucion()"></td>
                                        </tr>
                                        <tr>
                                            <td><span class="ns-meal-chip" style="background:#ede9fe;color:#4c1d95;border-color:#ddd6fe;"><i data-lucide="sun" width="13" height="13" style="vertical-align:middle;margin-right:4px;"></i>Almuerzo</span></td>
                                            <td><input type="number" step="0.1" class="form-control form-control-sm dist-cho" id="distAlmuerzoCHO" placeholder="0" onchange="calcularTotalesDistribucion()"></td>
                                            <td><input type="number" step="0.1" class="form-control form-control-sm dist-prot" id="distAlmuerzoProt" placeholder="0" onchange="calcularTotalesDistribucion()"></td>
                                            <td><input type="number" step="0.1" class="form-control form-control-sm dist-grasa" id="distAlmuerzoGrasa" placeholder="0" onchange="calcularTotalesDistribucion()"></td>
                                            <td><input type="number" step="0.1" class="form-control form-control-sm dist-fibra" id="distAlmuerzoFibra" placeholder="0" onchange="calcularTotalesDistribucion()"></td>
                                        </tr>
                                        <tr>
                                            <td><span class="ns-meal-chip" style="background:#e0e7ff;color:#3730a3;border-color:#c7d2fe;"><i data-lucide="cookie" width="13" height="13" style="vertical-align:middle;margin-right:4px;"></i>Merienda PM</span></td>
                                            <td><input type="number" step="0.1" class="form-control form-control-sm dist-cho" id="distMeriendaPMCHO" placeholder="0" onchange="calcularTotalesDistribucion()"></td>
                                            <td><input type="number" step="0.1" class="form-control form-control-sm dist-prot" id="distMeriendaPMProt" placeholder="0" onchange="calcularTotalesDistribucion()"></td>
                                            <td><input type="number" step="0.1" class="form-control form-control-sm dist-grasa" id="distMeriendaPMGrasa" placeholder="0" onchange="calcularTotalesDistribucion()"></td>
                                            <td><input type="number" step="0.1" class="form-control form-control-sm dist-fibra" id="distMeriendaPMFibra" placeholder="0" onchange="calcularTotalesDistribucion()"></td>
                                        </tr>
                                        <tr>
                                            <td><span class="ns-meal-chip" style="background:#f1f5f9;color:#1e293b;border-color:#cbd5e1;"><i data-lucide="moon" width="13" height="13" style="vertical-align:middle;margin-right:4px;"></i>Cena</span></td>
                                            <td><input type="number" step="0.1" class="form-control form-control-sm dist-cho" id="distCenaCHO" placeholder="0" onchange="calcularTotalesDistribucion()"></td>
                                            <td><input type="number" step="0.1" class="form-control form-control-sm dist-prot" id="distCenaProt" placeholder="0" onchange="calcularTotalesDistribucion()"></td>
                                            <td><input type="number" step="0.1" class="form-control form-control-sm dist-grasa" id="distCenaGrasa" placeholder="0" onchange="calcularTotalesDistribucion()"></td>
                                            <td><input type="number" step="0.1" class="form-control form-control-sm dist-fibra" id="distCenaFibra" placeholder="0" onchange="calcularTotalesDistribucion()"></td>
                                        </tr>
                                    </tbody>
                                    <tfoot>
                                        <tr style="background:#f8fafc;border-top:2px solid #e2e8f0;">
                                            <th style="color:#475569;font-size:0.78rem;letter-spacing:.04em;">TOTAL DISTRIBUIDO</th>
                                            <th><span id="totalDistCHO" style="font-weight:700;color:#334155;">0 g</span></th>
                                            <th><span id="totalDistProt" style="font-weight:700;color:#334155;">0 g</span></th>
                                            <th><span id="totalDistGrasa" style="font-weight:700;color:#334155;">0 g</span></th>
                                            <th><span id="totalDistFibra" style="font-weight:700;color:#334155;">0 g</span></th>
                                        </tr>
                                        <tr style="background:#eff6ff;">
                                            <th style="color:#3730a3;font-size:0.78rem;letter-spacing:.04em;">META CALCULADA</th>
                                            <th><span id="metaDistCHO" style="font-weight:600;color:#4f46e5;">0 g</span></th>
                                            <th><span id="metaDistProt" style="font-weight:600;color:#4f46e5;">0 g</span></th>
                                            <th><span id="metaDistGrasa" style="font-weight:600;color:#4f46e5;">0 g</span></th>
                                            <th><input type="number" id="txtMetaFibra" step="0.1" min="0" value="25" class="form-control form-control-sm text-center" style="width:78px;margin:auto;" title="Meta de fibra (editable)" onchange="calcularTotalesDistribucion()"></th>
                                        </tr>
                                        <tr style="background:#f8fafc;">
                                            <th style="color:#475569;font-size:0.78rem;letter-spacing:.04em;">DIFERENCIA</th>
                                            <th><span id="difDistCHO" style="font-weight:600;font-size:0.88rem;">0 g</span></th>
                                            <th><span id="difDistProt" style="font-weight:600;font-size:0.88rem;">0 g</span></th>
                                            <th><span id="difDistGrasa" style="font-weight:600;font-size:0.88rem;">0 g</span></th>
                                            <th><span id="difDistFibra" style="font-weight:600;font-size:0.88rem;">0 g</span></th>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>

                            <%-- BOTONES DE ACCIÓN --%>
                            <div class="text-right mt-3">
                                <button type="button" class="btn btn-warning btn-sm" onclick="limpiarDistribucion()">
                                    <i class="fa fa-eraser"></i> Limpiar Distribución
                                </button>
                                <button type="button" class="btn btn-success" onclick="guardarYEnviarDistribucion()">
                                    <i class="fa fa-file-pdf-o"></i> Guardar y generar PDF
                                </button>
                            </div>

                            <div class="alert alert-warning mt-3" role="alert" id="alertaDistribucion" style="display:none;">
                                <i class="fa fa-exclamation-triangle"></i> 
                                <strong>Advertencia:</strong> La suma de la distribución no coincide con las metas calculadas.
                            </div>
                        </div>
                    </div>

                   </div>
            </div>
        </div>

        <hr>

<%-- BOTÓN FINAL: COMPLETAR CONSULTA --%>
<div class="card card_border py-2 mb-4">
    <div class="card-body text-center">
        <h5>¿Listo para completar la consulta?</h5>
        <p class="text-muted">Asegúrese de haber guardado la información relevante en cada pestaña.</p>
        <button type="button" class="btn btn-success btn-lg" onclick="completarConsulta()">
            <i class="fa fa-check-circle"></i> Completar Consulta y Marcar como Finalizada
        </button>
        <button type="button" class="btn btn-secondary btn-lg" onclick="regresar()">
            <i class="fa fa-arrow-left"></i> Regresar sin Completar
        </button>
    </div>
</div>

<script src="../JavaScript/CompletarMetricas.js"></script>
</asp:Content>