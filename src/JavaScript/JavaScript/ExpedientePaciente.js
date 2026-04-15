$(document).ready(function () {
    var PageName = window.location.pathname.split('/').pop();

    if (PageName == 'frmExpedientePaciente.aspx') {
        cargarInfoUsuario();
        cargarHistoriaClinica();
        cargarEvaluacionCuantitativa();
        cargarAnalisisBioquimico();

        $("#chkConsumeAlcohol").on("change", function () {
            if ($(this).is(":checked")) {
                $("#divFrecuenciaAlcohol").show();
            } else {
                $("#divFrecuenciaAlcohol").hide();
                $("#txtFrecuenciaAlcohol").val("");
            }
        });
    }
});

function regresar() {
    location.href = "frmConsultaUsuarios.aspx";
}

// ============================================
// CARGAR INFORMACIÓN BÁSICA DEL PACIENTE
// ============================================
function cargarInfoUsuario() {
    var obj_Parametros_JS = [$.cookie("USRUNI")];
    var parametros = JSON.stringify({ 'obj_Parametros_JS': obj_Parametros_JS });

    jQuery.ajax({
        type: "POST",
        url: "frmExpedientePaciente.aspx/CargaInfoUsuario",
        data: parametros,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        cache: false,
        success: function (msg) {
            var res = msg.d;
            if (res && res.indexOf("Error") === -1) {
                var a = res.split("<SPLITER>");
                $("#lblNombrePacienteHeader").text(a[0]);
                $("#lblCorreoPaciente").text(a[1]);
            }
        }
    });
}

// ============================================
// CARGAR HISTORIA CLÍNICA
// ============================================
function cargarHistoriaClinica() {
    var obj_Parametros_JS = [$.cookie("USRUNI")];
    var parametros = JSON.stringify({ 'obj_Parametros_JS': obj_Parametros_JS });

    jQuery.ajax({
        type: "POST",
        url: "frmExpedientePaciente.aspx/CargarHistoriaClinica",
        data: parametros,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        cache: false,
        success: function (msg) {
            var res = msg.d;
            if (!res || res === "SIN_DATOS" || res.indexOf("Error") === 0) return;

            var a = res.split("<SPLITER>");
            // [0] Objetivos_Clinicos   [1] Calidad_Sueno     [2] Funcion_Intestinal
            // [3] Fuma                 [4] Consume_Alcohol   [5] Frecuencia_Alcohol
            // [6] Actividad_Fisica     [7] Medicamentos      [8] Cirugias_Recientes
            // [9] Embarazo             [10] Lactancia         [11] Alimentos_Favoritos
            // [12] Alimentos_No_Gustan [13] Intolerancias    [14] Alergias_Alimentarias
            // [15] Ingesta_Agua_Diaria
            $("#txtObjetivosClinicos").val(a[0]);
            $("#cboCalidadSueno").val(a[1]);
            $("#cboFuncionIntestinal").val(a[2]);
            $("#chkFuma").prop("checked", a[3] === "1");
            $("#chkConsumeAlcohol").prop("checked", a[4] === "1");
            if (a[4] === "1") $("#divFrecuenciaAlcohol").show();
            $("#txtFrecuenciaAlcohol").val(a[5]);
            $("#txtActividadFisica").val(a[6]);
            $("#txtMedicamentos").val(a[7]);
            $("#txtCirugiasRecientes").val(a[8]);
            $("#chkEmbarazo").prop("checked", a[9] === "1");
            $("#chkLactancia").prop("checked", a[10] === "1");
            $("#txtAlimentosFavoritos").val(a[11]);
            $("#txtAlimentosNoGustan").val(a[12]);
            $("#txtIntolerancias").val(a[13]);
            $("#txtAlergias").val(a[14]);
            $("#txtIngestaAgua").val(a[15]);
        }
    });
}

// ============================================
// CARGAR EVALUACIÓN CUANTITATIVA
// ============================================
function cargarEvaluacionCuantitativa() {
    var obj_Parametros_JS = [$.cookie("USRUNI")];
    var parametros = JSON.stringify({ 'obj_Parametros_JS': obj_Parametros_JS });

    jQuery.ajax({
        type: "POST",
        url: "frmExpedientePaciente.aspx/CargarEvaluacionCuantitativa",
        data: parametros,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        cache: false,
        success: function (msg) {
            var res = msg.d;
            if (!res || res === "SIN_DATOS" || res.indexOf("Error") === 0) return;

            var a = res.split("<SPLITER>");
            // [0] Desayuno  [1] MeriendaAM  [2] Almuerzo  [3] MeriendaPM  [4] Cena
            $("#txtEvalDesayuno").val(a[0] || "");
            $("#txtEvalMeriendaAM").val(a[1] || "");
            $("#txtEvalAlmuerzo").val(a[2] || "");
            $("#txtEvalMeriendaPM").val(a[3] || "");
            $("#txtEvalCena").val(a[4] || "");
        }
    });
}

// ============================================
// CARGAR HISTORIAL DE ANÁLISIS BIOQUÍMICOS
// ============================================
function cargarAnalisisBioquimico() {
    var obj_Parametros_JS = [$.cookie("USRUNI")];
    var parametros = JSON.stringify({ 'obj_Parametros_JS': obj_Parametros_JS });

    jQuery.ajax({
        type: "POST",
        url: "frmExpedientePaciente.aspx/CargarAnalisisBioquimico",
        data: parametros,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        cache: false,
        success: function (msg) {
            var res = msg.d;
            if (res === "SIN_DATOS") {
                $("#tblAnalisis").html("<tr><td colspan='7' class='text-center text-muted'>No hay analisis registrados</td></tr>");
            } else {
                $("#tblAnalisis").html(res);
            }
        }
    });
}

// ============================================
// GUARDAR HISTORIA CLÍNICA
// ============================================
function guardarHistoriaClinica() {
    var obj_Parametros_JS = new Array();
    obj_Parametros_JS[0]  = $.cookie("USRUNI");
    obj_Parametros_JS[1]  = $("#txtObjetivosClinicos").val() || "";
    obj_Parametros_JS[2]  = $("#cboCalidadSueno").val() || "";
    obj_Parametros_JS[3]  = $("#cboFuncionIntestinal").val() || "";
    obj_Parametros_JS[4]  = $("#chkFuma").is(":checked") ? "1" : "0";
    obj_Parametros_JS[5]  = $("#chkConsumeAlcohol").is(":checked") ? "1" : "0";
    obj_Parametros_JS[6]  = $("#txtFrecuenciaAlcohol").val() || "";
    obj_Parametros_JS[7]  = $("#txtActividadFisica").val() || "";
    obj_Parametros_JS[8]  = $("#txtMedicamentos").val() || "";
    obj_Parametros_JS[9]  = $("#txtCirugiasRecientes").val() || "";
    obj_Parametros_JS[10] = $("#chkEmbarazo").is(":checked") ? "1" : "0";
    obj_Parametros_JS[11] = $("#chkLactancia").is(":checked") ? "1" : "0";
    obj_Parametros_JS[12] = $("#txtAlimentosFavoritos").val() || "";
    obj_Parametros_JS[13] = $("#txtAlimentosNoGustan").val() || "";
    obj_Parametros_JS[14] = $("#txtIntolerancias").val() || "";
    obj_Parametros_JS[15] = $("#txtAlergias").val() || "";
    obj_Parametros_JS[16] = $("#txtIngestaAgua").val() || "";
    obj_Parametros_JS[17] = $.cookie("GLBUNI");

    ejecutarAjax("frmExpedientePaciente.aspx/GuardarHistoriaClinica", obj_Parametros_JS, "Guardando historia clinica...", null);
}

// ============================================
// GUARDAR EVALUACIÓN CUANTITATIVA
// ============================================
function guardarEvaluacionCuantitativa() {
    var obj_Parametros_JS = new Array();
    obj_Parametros_JS[0] = $.cookie("USRUNI");
    obj_Parametros_JS[1] = $("#txtEvalDesayuno").val() || "";
    obj_Parametros_JS[2] = $("#txtEvalMeriendaAM").val() || "";
    obj_Parametros_JS[3] = $("#txtEvalAlmuerzo").val() || "";
    obj_Parametros_JS[4] = $("#txtEvalMeriendaPM").val() || "";
    obj_Parametros_JS[5] = $("#txtEvalCena").val() || "";
    obj_Parametros_JS[6] = $.cookie("GLBUNI");

    ejecutarAjax("frmExpedientePaciente.aspx/GuardarEvaluacionCuantitativa", obj_Parametros_JS, "Guardando evaluacion...", null);
}

// ============================================
// GUARDAR ANÁLISIS BIOQUÍMICO
// ============================================
function guardarAnalisisBioquimico() {
    if (!$("#txtFechaAnalisis").val()) {
        Swal.fire({ icon: "warning", title: "Validacion", text: "Por favor ingrese la fecha del analisis" });
        return;
    }

    var obj_Parametros_JS = new Array();
    obj_Parametros_JS[0]  = $.cookie("USRUNI");
    obj_Parametros_JS[1]  = $("#txtFechaAnalisis").val();
    obj_Parametros_JS[2]  = $("#txtHemoglobina").val() || "";
    obj_Parametros_JS[3]  = $("#txtHematocrito").val() || "";
    obj_Parametros_JS[4]  = $("#txtColesterolTotal").val() || "";
    obj_Parametros_JS[5]  = $("#txtHDL").val() || "";
    obj_Parametros_JS[6]  = $("#txtLDL").val() || "";
    obj_Parametros_JS[7]  = $("#txtTrigliceridos").val() || "";
    obj_Parametros_JS[8]  = $("#txtGlicemia").val() || "";
    obj_Parametros_JS[9]  = $("#txtAcidoUrico").val() || "";
    obj_Parametros_JS[10] = $("#txtAlbumina").val() || "";
    obj_Parametros_JS[11] = "";
    obj_Parametros_JS[12] = $("#txtCreatinina").val() || "";
    obj_Parametros_JS[13] = $("#txtTSH").val() || "";
    obj_Parametros_JS[14] = $("#txtT4").val() || "";
    obj_Parametros_JS[15] = $("#txtT3").val() || "";
    obj_Parametros_JS[16] = $("#txtVitaminaD").val() || "";
    obj_Parametros_JS[17] = $("#txtVitaminaB12").val() || "";
    obj_Parametros_JS[18] = $("#txtObservacionesAnalisis").val() || "";
    obj_Parametros_JS[19] = $.cookie("GLBUNI");

    ejecutarAjax("frmExpedientePaciente.aspx/GuardarAnalisisBioquimico", obj_Parametros_JS, "Guardando analisis...", function () {
        limpiarFormularioAnalisis();
        cargarAnalisisBioquimico();
    });
}

function limpiarFormularioAnalisis() {
    $("#txtFechaAnalisis").val("");
    $("#txtHemoglobina, #txtHematocrito, #txtColesterolTotal, #txtHDL, #txtLDL, #txtTrigliceridos").val("");
    $("#txtGlicemia, #txtAcidoUrico, #txtAlbumina, #txtCreatinina, #txtTSH, #txtT4, #txtT3").val("");
    $("#txtVitaminaD, #txtVitaminaB12, #txtObservacionesAnalisis").val("");
}

// ============================================
// HELPER: AJAX + SWEETALERT
// ============================================
function ejecutarAjax(url, parametros, mensajeCarga, callbackExito) {
    Swal.fire({
        title: mensajeCarga,
        text: 'Por favor espere',
        allowOutsideClick: false,
        showConfirmButton: false,
        willOpen: () => { Swal.showLoading(); }
    });

    jQuery.ajax({
        type: "POST",
        url: url,
        data: JSON.stringify({ 'obj_Parametros_JS': parametros }),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        cache: false,
        success: function (msg) {
            Swal.close();
            var res = msg.d;
            if (!res) {
                Swal.fire({ title: "Error", text: "Error de conexion", icon: "error" });
                return;
            }
            var a = res.split("<SPLITER>");
            if (a[0] === "0" || a[0] === "") {
                Swal.fire({ title: "Error", text: a[1], icon: "error" });
            } else {
                Swal.fire({ title: "Exito", text: a[1], icon: "success", timer: 1500, timerProgressBar: true });
                if (callbackExito) callbackExito();
            }
        },
        error: function () {
            Swal.close();
            Swal.fire({ title: "Error", text: "Error al comunicarse con el servidor", icon: "error" });
        }
    });
}
