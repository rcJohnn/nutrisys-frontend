<%@ Page Title="" Language="C#" MasterPageFile="~/Mantenimientos/frmPrincipalMaster.Master" AutoEventWireup="true" CodeBehind="frmExpedientePaciente.aspx.cs" Inherits="PL_CRUD_CONSULTAS.Mantenimientos.frmExpedientePaciente" %>
<asp:Content ID="Content1" ContentPlaceHolderID="head" runat="server">
    <link rel="stylesheet" href="../Base/assets/css/styleCommon.css" />
</asp:Content>
<asp:Content ID="Content2" ContentPlaceHolderID="ContentPlaceHolder1" runat="server">
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>

    <nav aria-label="breadcrumb">
        <ol class="breadcrumb my-breadcrumb">
            <li class="breadcrumb-item"><a href="frmPrincipal.aspx">Inicio</a></li>
            <li class="breadcrumb-item"><a href="frmConsultaUsuarios.aspx">Pacientes</a></li>
            <li class="breadcrumb-item active" aria-current="page">Expediente del Paciente</li>
        </ol>
    </nav>

    <div class="welcome-msg pt-3 pb-4">
        <h1>Expediente &mdash; <span class="text-primary" id="lblNombrePacienteHeader">Cargando...</span></h1>
        <p id="lblCorreoPaciente" class="text-muted"></p>
    </div>

    <%-- TABS --%>
    <ul class="nav nav-tabs mb-4" id="tabsExpediente" role="tablist">
        <li class="nav-item">
            <a class="nav-link active" id="tab-hc" data-toggle="tab" href="#panelHistoriaClinica" role="tab">
                <i class="fa fa-notes-medical"></i> Historia Clinica
            </a>
        </li>
        <li class="nav-item">
            <a class="nav-link" id="tab-ec" data-toggle="tab" href="#panelEvaluacion" role="tab">
                <i class="fa fa-cutlery"></i> Evaluacion Cuantitativa
            </a>
        </li>
        <li class="nav-item">
            <a class="nav-link" id="tab-ab" data-toggle="tab" href="#panelAnalisis" role="tab">
                <i class="fa fa-flask"></i> Analisis Bioquimico
            </a>
        </li>
    </ul>

    <div class="tab-content">

        <%-- ===== TAB 1: HISTORIA CLÍNICA ===== --%>
        <div class="tab-pane fade show active" id="panelHistoriaClinica" role="tabpanel">
            <div class="card card_border py-2 mb-4">
                <div class="cards__heading">
                    <h3>Historia Clinica <span></span></h3>
                </div>
                <div class="card-body">

                    <div class="form-row">
                        <div class="form-group col-md-12">
                            <label class="input__label">Objetivos Clinicos</label>
                            <textarea class="form-control input-style" id="txtObjetivosClinicos" rows="3" placeholder="Objetivos del tratamiento..."></textarea>
                        </div>
                    </div>

                    <div class="form-row">
                        <div class="form-group col-md-6">
                            <label class="input__label">Calidad del Sueno</label>
                            <select class="form-control input-style" id="cboCalidadSueno">
                                <option value="">Seleccione...</option>
                                <option value="Buena">Buena</option>
                                <option value="Regular">Regular</option>
                                <option value="Mala">Mala</option>
                                <option value="Insomnia">Insomnia</option>
                            </select>
                        </div>
                        <div class="form-group col-md-6">
                            <label class="input__label">Funcion Intestinal</label>
                            <select class="form-control input-style" id="cboFuncionIntestinal">
                                <option value="">Seleccione...</option>
                                <option value="Normal">Normal</option>
                                <option value="Estreñimiento">Estreñimiento</option>
                                <option value="Diarrea">Diarrea</option>
                                <option value="Irregular">Irregular</option>
                            </select>
                        </div>
                    </div>

                    <div class="form-row">
                        <div class="form-group col-md-3">
                            <label class="input__label">Habitos</label>
                            <div class="form-check mt-2">
                                <input type="checkbox" class="form-check-input" id="chkFuma">
                                <label class="form-check-label" for="chkFuma">Fuma</label>
                            </div>
                            <div class="form-check mt-1">
                                <input type="checkbox" class="form-check-input" id="chkConsumeAlcohol">
                                <label class="form-check-label" for="chkConsumeAlcohol">Consume Alcohol</label>
                            </div>
                        </div>
                        <div class="form-group col-md-3" id="divFrecuenciaAlcohol" style="display:none;">
                            <label class="input__label">Frecuencia de Alcohol</label>
                            <input type="text" class="form-control input-style" id="txtFrecuenciaAlcohol" placeholder="Ej: Fines de semana" maxlength="100">
                        </div>
                        <div class="form-group col-md-3">
                            <label class="input__label">Condiciones</label>
                            <div class="form-check mt-2">
                                <input type="checkbox" class="form-check-input" id="chkEmbarazo">
                                <label class="form-check-label" for="chkEmbarazo">Embarazo</label>
                            </div>
                            <div class="form-check mt-1">
                                <input type="checkbox" class="form-check-input" id="chkLactancia">
                                <label class="form-check-label" for="chkLactancia">Lactancia</label>
                            </div>
                        </div>
                    </div>

                    <div class="form-row">
                        <div class="form-group col-md-6">
                            <label class="input__label">Actividad Fisica</label>
                            <input type="text" class="form-control input-style" id="txtActividadFisica" placeholder="Tipo y frecuencia de actividad fisica" maxlength="200">
                        </div>
                        <div class="form-group col-md-6">
                            <label class="input__label">Ingesta de Agua Diaria</label>
                            <input type="text" class="form-control input-style" id="txtIngestaAgua" placeholder="Ej: 2 litros" maxlength="100">
                        </div>
                    </div>

                    <div class="form-row">
                        <div class="form-group col-md-6">
                            <label class="input__label">Medicamentos</label>
                            <textarea class="form-control input-style" id="txtMedicamentos" rows="2" placeholder="Medicamentos que consume actualmente..." maxlength="500"></textarea>
                        </div>
                        <div class="form-group col-md-6">
                            <label class="input__label">Cirugias Recientes</label>
                            <textarea class="form-control input-style" id="txtCirugiasRecientes" rows="2" placeholder="Cirugias o procedimientos recientes..." maxlength="500"></textarea>
                        </div>
                    </div>

                    <hr/>
                    <h6 class="text-muted mb-3">Preferencias Alimentarias</h6>

                    <div class="form-row">
                        <div class="form-group col-md-6">
                            <label class="input__label">Alimentos Favoritos</label>
                            <textarea class="form-control input-style" id="txtAlimentosFavoritos" rows="2" placeholder="Alimentos que le gustan..." maxlength="500"></textarea>
                        </div>
                        <div class="form-group col-md-6">
                            <label class="input__label">Alimentos que No le Gustan</label>
                            <textarea class="form-control input-style" id="txtAlimentosNoGustan" rows="2" placeholder="Alimentos que no consume..." maxlength="500"></textarea>
                        </div>
                    </div>

                    <div class="form-row">
                        <div class="form-group col-md-6">
                            <label class="input__label">Intolerancias Alimentarias</label>
                            <textarea class="form-control input-style" id="txtIntolerancias" rows="2" placeholder="Ej: Lactosa, gluten..." maxlength="500"></textarea>
                        </div>
                        <div class="form-group col-md-6">
                            <label class="input__label">Alergias Alimentarias</label>
                            <textarea class="form-control input-style" id="txtAlergias" rows="2" placeholder="Ej: Mani, mariscos..." maxlength="500"></textarea>
                        </div>
                    </div>

                    <button type="button" class="btn btn-primary btn-style mt-3" onclick="guardarHistoriaClinica()">
                        <i class="fa fa-save"></i> Guardar Historia Clinica
                    </button>
                </div>
            </div>
        </div>

        <%-- ===== TAB 2: EVALUACIÓN CUANTITATIVA ===== --%>
        <div class="tab-pane fade" id="panelEvaluacion" role="tabpanel">
            <div class="card card_border py-2 mb-4">
                <div class="cards__heading">
                    <h3>Evaluacion Cuantitativa <span></span></h3>
                </div>
                <div class="card-body">
                    <p class="text-muted mb-4">Registre el consumo habitual del paciente por tiempo de comida.</p>

                    <div class="form-row">
                        <div class="form-group col-md-6">
                            <label class="input__label">Desayuno</label>
                            <textarea class="form-control input-style" id="txtEvalDesayuno" rows="3" placeholder="Describe lo que consume habitualmente en el desayuno..." maxlength="1000"></textarea>
                        </div>
                        <div class="form-group col-md-6">
                            <label class="input__label">Merienda AM</label>
                            <textarea class="form-control input-style" id="txtEvalMeriendaAM" rows="3" placeholder="Describe lo que consume en la merienda de la manana..." maxlength="1000"></textarea>
                        </div>
                    </div>

                    <div class="form-row">
                        <div class="form-group col-md-6">
                            <label class="input__label">Almuerzo</label>
                            <textarea class="form-control input-style" id="txtEvalAlmuerzo" rows="3" placeholder="Describe lo que consume habitualmente en el almuerzo..." maxlength="1000"></textarea>
                        </div>
                        <div class="form-group col-md-6">
                            <label class="input__label">Merienda PM</label>
                            <textarea class="form-control input-style" id="txtEvalMeriendaPM" rows="3" placeholder="Describe lo que consume en la merienda de la tarde..." maxlength="1000"></textarea>
                        </div>
                    </div>

                    <div class="form-row">
                        <div class="form-group col-md-6">
                            <label class="input__label">Cena</label>
                            <textarea class="form-control input-style" id="txtEvalCena" rows="3" placeholder="Describe lo que consume habitualmente en la cena..." maxlength="1000"></textarea>
                        </div>
                    </div>

                    <button type="button" class="btn btn-primary btn-style mt-3" onclick="guardarEvaluacionCuantitativa()">
                        <i class="fa fa-save"></i> Guardar Evaluacion
                    </button>
                </div>
            </div>
        </div>

        <%-- ===== TAB 3: ANÁLISIS BIOQUÍMICO ===== --%>
        <div class="tab-pane fade" id="panelAnalisis" role="tabpanel">

            <%-- Historial --%>
            <div class="card card_border py-2 mb-4">
                <div class="cards__heading">
                    <h3>Historial de Analisis <span></span></h3>
                </div>
                <div class="card-body">
                    <div class="table-responsive">
                        <table class="table table-bordered table-hover table-sm">
                            <thead class="thead-light">
                                <tr>
                                    <th>Fecha</th>
                                    <th>Hemoglobina</th>
                                    <th>Col. Total</th>
                                    <th>Glicemia</th>
                                    <th>Trigliceridos</th>
                                    <th>Acido Urico</th>
                                    <th>Observaciones</th>
                                </tr>
                            </thead>
                            <tbody id="tblAnalisis">
                                <tr><td colspan="7" class="text-center text-muted">Cargando...</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <%-- Formulario nuevo análisis --%>
            <div class="card card_border py-2 mb-4">
                <div class="cards__heading">
                    <h3>Registrar Nuevo Analisis <span></span></h3>
                </div>
                <div class="card-body">

                    <div class="form-row">
                        <div class="form-group col-md-4">
                            <label class="input__label">Fecha del Analisis *</label>
                            <input type="date" class="form-control input-style" id="txtFechaAnalisis">
                        </div>
                    </div>

                    <h6 class="text-muted mt-2 mb-3">Hemograma</h6>
                    <div class="form-row">
                        <div class="form-group col-md-3">
                            <label class="input__label">Hemoglobina (g/dL)</label>
                            <input type="number" step="0.01" class="form-control input-style" id="txtHemoglobina" placeholder="0.00">
                        </div>
                        <div class="form-group col-md-3">
                            <label class="input__label">Hematocrito (%)</label>
                            <input type="number" step="0.01" class="form-control input-style" id="txtHematocrito" placeholder="0.00">
                        </div>
                    </div>

                    <h6 class="text-muted mt-2 mb-3">Perfil Lipidico</h6>
                    <div class="form-row">
                        <div class="form-group col-md-3">
                            <label class="input__label">Colesterol Total (mg/dL)</label>
                            <input type="number" step="0.01" class="form-control input-style" id="txtColesterolTotal" placeholder="0.00">
                        </div>
                        <div class="form-group col-md-3">
                            <label class="input__label">HDL (mg/dL)</label>
                            <input type="number" step="0.01" class="form-control input-style" id="txtHDL" placeholder="0.00">
                        </div>
                        <div class="form-group col-md-3">
                            <label class="input__label">LDL (mg/dL)</label>
                            <input type="number" step="0.01" class="form-control input-style" id="txtLDL" placeholder="0.00">
                        </div>
                        <div class="form-group col-md-3">
                            <label class="input__label">Trigliceridos (mg/dL)</label>
                            <input type="number" step="0.01" class="form-control input-style" id="txtTrigliceridos" placeholder="0.00">
                        </div>
                    </div>

                    <h6 class="text-muted mt-2 mb-3">Quimica Sanguinea</h6>
                    <div class="form-row">
                        <div class="form-group col-md-3">
                            <label class="input__label">Glicemia (mg/dL)</label>
                            <input type="number" step="0.01" class="form-control input-style" id="txtGlicemia" placeholder="0.00">
                        </div>
                        <div class="form-group col-md-3">
                            <label class="input__label">Acido Urico (mg/dL)</label>
                            <input type="number" step="0.01" class="form-control input-style" id="txtAcidoUrico" placeholder="0.00">
                        </div>
                        <div class="form-group col-md-3">
                            <label class="input__label">Albumina (g/dL)</label>
                            <input type="number" step="0.01" class="form-control input-style" id="txtAlbumina" placeholder="0.00">
                        </div>
                        <div class="form-group col-md-3">
                            <label class="input__label">Creatinina (mg/dL)</label>
                            <input type="number" step="0.01" class="form-control input-style" id="txtCreatinina" placeholder="0.00">
                        </div>
                    </div>

                    <h6 class="text-muted mt-2 mb-3">Funcion Tiroidea</h6>
                    <div class="form-row">
                        <div class="form-group col-md-4">
                            <label class="input__label">TSH (mUI/L)</label>
                            <input type="number" step="0.001" class="form-control input-style" id="txtTSH" placeholder="0.000">
                        </div>
                        <div class="form-group col-md-4">
                            <label class="input__label">T4 (ng/dL)</label>
                            <input type="number" step="0.01" class="form-control input-style" id="txtT4" placeholder="0.00">
                        </div>
                        <div class="form-group col-md-4">
                            <label class="input__label">T3 (pg/mL)</label>
                            <input type="number" step="0.01" class="form-control input-style" id="txtT3" placeholder="0.00">
                        </div>
                    </div>

                    <h6 class="text-muted mt-2 mb-3">Vitaminas</h6>
                    <div class="form-row">
                        <div class="form-group col-md-4">
                            <label class="input__label">Vitamina D (ng/mL)</label>
                            <input type="number" step="0.01" class="form-control input-style" id="txtVitaminaD" placeholder="0.00">
                        </div>
                        <div class="form-group col-md-4">
                            <label class="input__label">Vitamina B12 (pg/mL)</label>
                            <input type="number" step="0.01" class="form-control input-style" id="txtVitaminaB12" placeholder="0.00">
                        </div>
                    </div>

                    <div class="form-row">
                        <div class="form-group col-md-12">
                            <label class="input__label">Observaciones</label>
                            <textarea class="form-control input-style" id="txtObservacionesAnalisis" rows="3" placeholder="Observaciones generales del analisis..." maxlength="500"></textarea>
                        </div>
                    </div>

                    <button type="button" class="btn btn-success btn-style mt-3" onclick="guardarAnalisisBioquimico()">
                        <i class="fa fa-plus"></i> Registrar Analisis
                    </button>
                </div>
            </div>
        </div>

    </div><%-- fin tab-content --%>

    <div class="mt-2 mb-5">
        <button type="button" class="btn btn-secondary btn-style" onclick="regresar()">
            <i class="fa fa-arrow-left"></i> Regresar
        </button>
    </div>

    <script src="../JavaScript/ExpedientePaciente.js"></script>
</asp:Content>
