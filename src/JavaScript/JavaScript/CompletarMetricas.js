var _historiaClinicaCargada = false;
var _evaluacionCargada = false;
var _analisisCargado = false;

$(document).ready(function () {
    var PageName = window.location.pathname.split('/').pop();

    if (PageName == 'frmCompletarMetricas.aspx') {
        lucide.createIcons();
        cargarInfoConsulta();
        configurarCalculoIMC();

        // Cargar tab de padecimientos al hacer clic en él
        $('#tab-padecimientos-link').on('shown.bs.tab', function () {
            if ($("#cboPadecimientosMetricas option").length <= 1) {
                cmCargarPadecimientosTab();
            } else {
                cmCargaPadecimientosUsuario();
            }
        });

        // Restaurar datos guardados al entrar a cada tab
        $('#tab-historia-link').on('shown.bs.tab', function () {
            if (!_historiaClinicaCargada) {
                cmCargarHistoriaClinica();
            }
        });

        $('#tab-evaluacion-link').on('shown.bs.tab', function () {
            if (!_evaluacionCargada) {
                cmCargarEvaluacionCuantitativa();
            }
        });

        $('#tab-analisis-link').on('shown.bs.tab', function () {
            if (!_analisisCargado) {
                cmCargarAnalisisBioquimico();
            }
        });

        // Bloquear flechas ↑↓ en inputs de distribución (evita cambiar el valor)
        // y usarlas para navegar entre filas de la misma columna
        $(document).on('keydown', '.dist-cho, .dist-prot, .dist-grasa, .dist-fibra', function (e) {
            if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return;
            e.preventDefault();
            var cls = $(this).hasClass('dist-cho')   ? '.dist-cho'
                    : $(this).hasClass('dist-prot')  ? '.dist-prot'
                    : $(this).hasClass('dist-grasa') ? '.dist-grasa'
                    : '.dist-fibra';
            var all = $(cls);
            var idx = all.index(this);
            var target = e.key === 'ArrowUp' ? idx - 1 : idx + 1;
            if (target >= 0 && target < all.length) {
                all.eq(target).focus().select();
            }
        });
    }
});


// ========================================
// CARGAR INFORMACIÓN DE LA CONSULTA
// ========================================
function cargarInfoConsulta() {
    var obj_Parametros_JS = new Array();
    obj_Parametros_JS[0] = $.cookie("CONUNI");

    var parametros = JSON.stringify({ 'obj_Parametros_JS': obj_Parametros_JS });

    jQuery.ajax({
        type: "POST",
        url: "frmCompletarMetricas.aspx/CargaInfoConsulta",
        data: parametros,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        cache: false,
        success: function (msg) {
            var res = msg.d;

            if (res === undefined || res.indexOf("Error") > -1) {
                Swal.fire({
                    title: "Error",
                    text: "Error al cargar la información de la consulta",
                    icon: "error"
                });
            }
            else if (res === "No se encontraron registros") {
                Swal.fire({
                    title: "Información",
                    text: res,
                    icon: "info"
                });
            }
            else {
                var arreglo = res.split("<SPLITER>");

                // [0] NombrePaciente  [1] FechaHora  [2] Motivo
                // [3] Peso  [4] Estatura  [5] IMC
                // [6] GrasaG  [7] MusculoG  [8] Cintura  [9] Cadera
                // [10] Sistolica  [11] Diastolica
                // [12] Observaciones  [13] Recomendaciones  [14] ProximaCita
                // [15] GrasaPct  [16] Muneca  [17] AguaPct
                // [18] EdadMetabolica  [19] MasaOsea  [20] GrasaVisceral

                $("#lblPaciente").html("<strong>" + arreglo[0] + "</strong>");
                $("#lblPacienteHeader").text(arreglo[0]);
                $("#lblFechaHora").html("<strong>" + arreglo[1] + "</strong>");
                $("#lblMotivo").html("<strong>" + (arreglo[2] || "Sin motivo especificado") + "</strong>");

                // Métricas base
                if (arreglo[3]) $("#txtPeso").val(arreglo[3]);
                if (arreglo[4]) $("#txtEstatura").val(arreglo[4]);
                if (arreglo[6]) $("#txtGrasag").val(arreglo[6]);
                if (arreglo[7]) $("#txtMusculog").val(arreglo[7]);
                if (arreglo[8]) $("#txtCircunferenciaCintura").val(arreglo[8]);
                if (arreglo[9]) $("#txtCircunferenciaCadera").val(arreglo[9]);
                if (arreglo[10]) $("#txtPresionSistolica").val(arreglo[10]);
                if (arreglo[11]) $("#txtPresionDiastolica").val(arreglo[11]);
                if (arreglo[12]) $("#txtObservaciones").val(arreglo[12]);
                if (arreglo[13]) $("#txtRecomendaciones").val(arreglo[13]);
                if (arreglo[14]) $("#txtProximaCita").val(arreglo[14]);

                // Métricas nuevas
                if (arreglo[15]) $("#txtGrasaPorcentaje").val(arreglo[15]);
                if (arreglo[16]) $("#txtCircunferenciaMuneca").val(arreglo[16]);
                if (arreglo[17]) $("#txtAguaCorporal").val(arreglo[17]);
                if (arreglo[18]) $("#txtEdadMetabolica").val(arreglo[18]);
                if (arreglo[19]) $("#txtMasaOsea").val(arreglo[19]);
                if (arreglo[20]) $("#txtGrasaVisceral").val(arreglo[20]);

                if (arreglo[3] && arreglo[4]) {
                    calcularIMC();
                }

                // Restaurar datos antropométricos si ya fueron registrados
                cargarAntropometria();
            }
        }
    });
}

// ========================================
// CONFIGURAR CÁLCULO AUTOMÁTICO DE IMC
// ========================================
function configurarCalculoIMC() {
    $("#txtPeso, #txtEstatura").on("input", function () {
        calcularIMC();
    });
}

function calcularIMC() {
    var peso = parseFloat($("#txtPeso").val());
    var estatura = parseFloat($("#txtEstatura").val());

    if (peso && estatura && estatura > 0) {
        var estaturaMetros = estatura / 100;
        var imc = peso / (estaturaMetros * estaturaMetros);

        $("#lblIMC").text(imc.toFixed(2));

        // Clasificación del IMC
        var clasificacion = "";
        var colorClass = "";

        if (imc < 18.5) {
            clasificacion = "Bajo peso";
            colorClass = "text-primary";
        } else if (imc >= 18.5 && imc < 25) {
            clasificacion = "Peso normal";
            colorClass = "text-success";
        } else if (imc >= 25 && imc < 30) {
            clasificacion = "Sobrepeso";
            colorClass = "text-warning";
        } else if (imc >= 30) {
            clasificacion = "Obesidad";
            colorClass = "text-danger";
        }

        $("#lblClasificacionIMC").html("<span class='" + colorClass + "'>" + clasificacion + "</span>");
    } else {
        $("#lblIMC").text("-");
        $("#lblClasificacionIMC").text("Ingrese peso y estatura");
    }
}

// ========================================
// GUARDAR MÉTRICAS
// ========================================
function guardarMetricas() {
    // Validaciones
    if (!$("#txtPeso").val()) {
        Swal.fire({
            icon: "warning",
            title: "Validación",
            text: "Por favor ingrese el peso"
        });
        return;
    }

    if (!$("#txtEstatura").val()) {
        Swal.fire({
            icon: "warning",
            title: "Validación",
            text: "Por favor ingrese la estatura"
        });
        return;
    }

    var obj_Parametros_JS = new Array();
    obj_Parametros_JS[0] = $.cookie("CONUNI");
    obj_Parametros_JS[1] = $("#txtPeso").val();
    obj_Parametros_JS[2] = $("#txtEstatura").val();
    obj_Parametros_JS[3] = $("#txtGrasag").val() || "";
    obj_Parametros_JS[4] = $("#txtGrasaPorcentaje").val() || "";
    obj_Parametros_JS[5] = $("#txtMusculog").val() || "";
    obj_Parametros_JS[6] = $("#txtCircunferenciaCintura").val() || "";
    obj_Parametros_JS[7] = $("#txtCircunferenciaCadera").val() || "";
    obj_Parametros_JS[8] = $("#txtCircunferenciaMuneca").val() || "";
    obj_Parametros_JS[9] = $("#txtPresionSistolica").val() || "";
    obj_Parametros_JS[10] = $("#txtPresionDiastolica").val() || "";
    obj_Parametros_JS[11] = $("#txtAguaCorporal").val() || "";
    obj_Parametros_JS[12] = $("#txtEdadMetabolica").val() || "";
    obj_Parametros_JS[13] = $("#txtMasaOsea").val() || "";
    obj_Parametros_JS[14] = $("#txtGrasaVisceral").val() || "";
    obj_Parametros_JS[15] = $("#txtObservaciones").val() || "";
    obj_Parametros_JS[16] = $("#txtRecomendaciones").val() || "";
    obj_Parametros_JS[17] = $("#txtProximaCita").val() || "";
    obj_Parametros_JS[18] = $.cookie("GLBUNI");

    var parametros = JSON.stringify({ 'obj_Parametros_JS': obj_Parametros_JS });

    Swal.fire({
        title: 'Guardando métricas...',
        text: 'Por favor espere',
        allowOutsideClick: false,
        showConfirmButton: false,
        willOpen: () => {
            Swal.showLoading();
        }
    });

    jQuery.ajax({
        type: "POST",
        url: "frmCompletarMetricas.aspx/CompletarMetricas",
        data: parametros,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        cache: false,
        success: function (msg) {
            var res = msg.d;

            Swal.close();

            if (res === undefined) {
                Swal.fire({
                    title: "Error",
                    text: "Error de conexión",
                    icon: "error"
                });
            }
            else {
                var arreglo = res.split("<SPLITER>");
                var resultado = arreglo[0];
                var mensaje = arreglo[1];

                if (resultado == "0" || resultado == "") {
                    Swal.fire({
                        title: "Error",
                        text: mensaje,
                        icon: "error"
                    });
                }
                else {
                    Swal.fire({
                        title: "Éxito",
                        text: mensaje,
                        icon: "success",
                        timer: 2000,
                        timerProgressBar: true
                    }).then(function () {
                        irSiguienteTab('tab-historia-link');
                    });
                }
            }
        },
        failure: function (msg) {
            Swal.close();
        },
        error: function (msg) {
            Swal.close();
        }
    });
}

// ========================================
// REGRESAR
// ========================================
function regresar() {
    $.removeCookie('CONUNI', { path: '/', domain: g_Dominio });
    location.href = "frmConsultaConsultas.aspx";
}




// ============================================
// DISTRIBUCIÓN POR TIEMPOS DE COMIDA
// ============================================

// ========================================
// TOGGLE PANEL DE DISTRIBUCIÓN
// ========================================
function toggleDistribucionTiempos() {
    var panel = $("#panelDistribucionTiempos");
    var icono = $("#iconDistribucion");
    var texto = $("#txtBtnDistribucion");

    if (panel.is(":visible")) {
        panel.slideUp();
        icono.removeClass("fa-chevron-up").addClass("fa-chevron-down");
        texto.text("Expandir");
    } else {
        // Al abrir, cargar las metas calculadas
        cargarMetasEnDistribucion();
        panel.slideDown(function () {
            lucide.createIcons();
        });
        icono.removeClass("fa-chevron-down").addClass("fa-chevron-up");
        texto.text("Contraer");
    }
}

// ========================================
// CARGAR METAS EN LA SECCIÓN DE DISTRIBUCIÓN
// ========================================
function cargarMetasEnDistribucion() {
    var gramosCHO = parseFloat($("#lblGramosCHO").text()) || 0;
    var gramosProt = parseFloat($("#lblGramosProt").text()) || 0;
    var gramosGrasa = parseFloat($("#lblGramosGrasa").text()) || 0;

    // Calcular fibra estimada (si no la tienes calculada)
    // Puedes usar 25-30g como valor por defecto o calcularlo
    var gramosFibra = 25; // Valor por defecto, ajusta según tu lógica

    $("#metaDistCHO").text(gramosCHO.toFixed(1) + " g");
    $("#metaDistProt").text(gramosProt.toFixed(1) + " g");
    $("#metaDistGrasa").text(gramosGrasa.toFixed(1) + " g");
    // Fibra: no sobreescribir el input editable; solo poner 25 si está vacío
    if (!$("#txtMetaFibra").val()) {
        $("#txtMetaFibra").val("25");
    }
}

// ========================================
// CALCULAR TOTALES DE DISTRIBUCIÓN
// ========================================
function calcularTotalesDistribucion() {
    // Sumar todos los CHO
    var totalCHO = 0;
    $(".dist-cho").each(function () {
        totalCHO += parseFloat($(this).val()) || 0;
    });

    // Sumar todas las Proteínas
    var totalProt = 0;
    $(".dist-prot").each(function () {
        totalProt += parseFloat($(this).val()) || 0;
    });

    // Sumar todas las Grasas
    var totalGrasa = 0;
    $(".dist-grasa").each(function () {
        totalGrasa += parseFloat($(this).val()) || 0;
    });

    // Sumar toda la Fibra
    var totalFibra = 0;
    $(".dist-fibra").each(function () {
        totalFibra += parseFloat($(this).val()) || 0;
    });

    // Mostrar totales
    $("#totalDistCHO").text(totalCHO.toFixed(1) + " g");
    $("#totalDistProt").text(totalProt.toFixed(1) + " g");
    $("#totalDistGrasa").text(totalGrasa.toFixed(1) + " g");
    $("#totalDistFibra").text(totalFibra.toFixed(1) + " g");

    // Obtener metas
    var metaCHO = parseFloat($("#lblGramosCHO").text()) || 0;
    var metaProt = parseFloat($("#lblGramosProt").text()) || 0;
    var metaGrasa = parseFloat($("#lblGramosGrasa").text()) || 0;
    var metaFibra = parseFloat($("#txtMetaFibra").val()) || 25;

    // Calcular diferencias
    var difCHO = totalCHO - metaCHO;
    var difProt = totalProt - metaProt;
    var difGrasa = totalGrasa - metaGrasa;
    var difFibra = totalFibra - metaFibra;

    // Mostrar diferencias con colores
    mostrarDiferencia("#difDistCHO", difCHO);
    mostrarDiferencia("#difDistProt", difProt);
    mostrarDiferencia("#difDistGrasa", difGrasa);
    mostrarDiferencia("#difDistFibra", difFibra);

    // Mostrar alerta si no coincide — fibra excluida (es editable por tiempo)
    var tolerancia = 2; // 2 gramos de tolerancia
    if (Math.abs(difCHO) > tolerancia ||
        Math.abs(difProt) > tolerancia ||
        Math.abs(difGrasa) > tolerancia) {
        $("#alertaDistribucion").show();
    } else {
        $("#alertaDistribucion").hide();
    }
}

// ========================================
// MOSTRAR DIFERENCIA CON COLOR
// ========================================
function mostrarDiferencia(selector, diferencia) {
    var badge = $(selector);
    var texto = "";
    var clase = "";

    if (diferencia > 0) {
        texto = "+" + diferencia.toFixed(1) + " g";
        clase = "badge-warning"; // Exceso
    } else if (diferencia < 0) {
        texto = diferencia.toFixed(1) + " g";
        clase = "badge-danger"; // Falta
    } else {
        texto = "0 g";
        clase = "badge-success"; // Perfecto
    }

    badge.text(texto);
    badge.removeClass("badge-light badge-warning badge-danger badge-success");
    badge.addClass(clase);
}

// ========================================
// LIMPIAR DISTRIBUCIÓN
// ========================================
function limpiarDistribucion() {
    Swal.fire({
        title: '¿Limpiar distribución?',
        text: "Se borrarán todos los valores ingresados",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, limpiar',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            // Limpiar todos los inputs
            $(".dist-cho, .dist-prot, .dist-grasa, .dist-fibra").val("");

            // Resetear totales
            $("#totalDistCHO").text("0 g");
            $("#totalDistProt").text("0 g");
            $("#totalDistGrasa").text("0 g");
            $("#totalDistFibra").text("0 g");

            // Resetear diferencias
            $("#difDistCHO").text("0 g").removeClass().addClass("badge badge-light");
            $("#difDistProt").text("0 g").removeClass().addClass("badge badge-light");
            $("#difDistGrasa").text("0 g").removeClass().addClass("badge badge-light");
            $("#difDistFibra").text("0 g").removeClass().addClass("badge badge-light");

            // Ocultar alerta
            $("#alertaDistribucion").hide();

            Swal.fire({
                icon: 'success',
                title: 'Limpiado',
                text: 'Distribución limpiada correctamente',
                timer: 1500,
                showConfirmButton: false
            });
        }
    });
}

// ========================================
// COPIAR DISTRIBUCIÓN AL PORTAPAPELES
// ========================================
function copiarDistribucionPortapapeles() {
    // Validar que haya datos
    var totalCHO = parseFloat($("#totalDistCHO").text()) || 0;

    if (totalCHO === 0) {
        Swal.fire({
            icon: 'warning',
            title: 'Sin datos',
            text: 'Primero ingrese la distribución de macronutrientes'
        });
        return;
    }

    // Obtener datos del paciente
    var paciente = $("#lblPaciente").text().trim();
    var fecha = new Date().toLocaleDateString('es-CR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    // Obtener valores de cada tiempo de comida
    var distribucion = {
        desayuno: {
            cho: parseFloat($("#distDesayunoCHO").val()) || 0,
            prot: parseFloat($("#distDesayunoProt").val()) || 0,
            grasa: parseFloat($("#distDesayunoGrasa").val()) || 0,
            fibra: parseFloat($("#distDesayunoFibra").val()) || 0
        },
        meriendaAM: {
            cho: parseFloat($("#distMeriendaAMCHO").val()) || 0,
            prot: parseFloat($("#distMeriendaAMProt").val()) || 0,
            grasa: parseFloat($("#distMeriendaAMGrasa").val()) || 0,
            fibra: parseFloat($("#distMeriendaAMFibra").val()) || 0
        },
        almuerzo: {
            cho: parseFloat($("#distAlmuerzoCHO").val()) || 0,
            prot: parseFloat($("#distAlmuerzoProt").val()) || 0,
            grasa: parseFloat($("#distAlmuerzoGrasa").val()) || 0,
            fibra: parseFloat($("#distAlmuerzoFibra").val()) || 0
        },
        meriendaPM: {
            cho: parseFloat($("#distMeriendaPMCHO").val()) || 0,
            prot: parseFloat($("#distMeriendaPMProt").val()) || 0,
            grasa: parseFloat($("#distMeriendaPMGrasa").val()) || 0,
            fibra: parseFloat($("#distMeriendaPMFibra").val()) || 0
        },
        cena: {
            cho: parseFloat($("#distCenaCHO").val()) || 0,
            prot: parseFloat($("#distCenaProt").val()) || 0,
            grasa: parseFloat($("#distCenaGrasa").val()) || 0,
            fibra: parseFloat($("#distCenaFibra").val()) || 0
        }
    };

    // Obtener metas
    var metaCHO = parseFloat($("#lblGramosCHO").text()) || 0;
    var metaProt = parseFloat($("#lblGramosProt").text()) || 0;
    var metaGrasa = parseFloat($("#lblGramosGrasa").text()) || 0;
    var metaFibra = parseFloat($("#txtMetaFibra").val()) || 25;
    var calorias = parseFloat($("#lblResumenCalorias").text()) || 0;

    // Construir texto para copiar
    var texto = "═══════════════════════════════════════════════════\n";
    texto += "      DISTRIBUCIÓN DE MACRONUTRIENTES\n";
    texto += "═══════════════════════════════════════════════════\n\n";
    texto += "Paciente: " + paciente + "\n";
    texto += "Fecha: " + fecha + "\n\n";

    texto += "───────────────────────────────────────────────────\n";
    texto += "RESUMEN GENERAL\n";
    texto += "───────────────────────────────────────────────────\n";
    texto += "Calorías Totales: " + calorias.toFixed(0) + " kcal/día\n";
    texto += "Carbohidratos:    " + metaCHO.toFixed(1) + " g\n";
    texto += "Proteínas:        " + metaProt.toFixed(1) + " g\n";
    texto += "Grasas:           " + metaGrasa.toFixed(1) + " g\n";
    texto += "Fibra:            " + metaFibra.toFixed(1) + " g\n\n";

    texto += "═══════════════════════════════════════════════════\n";
    texto += "DISTRIBUCIÓN POR TIEMPOS DE COMIDA\n";
    texto += "═══════════════════════════════════════════════════\n\n";

    // Función auxiliar para agregar tiempo de comida
    function agregarTiempoComida(nombre, emoji, datos) {
        var total = datos.cho + datos.prot + datos.grasa;
        if (total > 0) {
            texto += emoji + " " + nombre + "\n";
            texto += "   Carbohidratos: " + datos.cho.toFixed(1) + " g\n";
            texto += "   Proteínas:     " + datos.prot.toFixed(1) + " g\n";
            texto += "   Grasas:        " + datos.grasa.toFixed(1) + " g\n";
            texto += "   Fibra:         " + datos.fibra.toFixed(1) + " g\n\n";
        }
    }

    agregarTiempoComida("DESAYUNO", "🌅", distribucion.desayuno);
    agregarTiempoComida("MERIENDA AM", "🍏", distribucion.meriendaAM);
    agregarTiempoComida("ALMUERZO", "☀️", distribucion.almuerzo);
    agregarTiempoComida("MERIENDA PM", "🫐", distribucion.meriendaPM);
    agregarTiempoComida("CENA", "🌙", distribucion.cena);

    // Totales
    var totalCHODist = parseFloat($("#totalDistCHO").text()) || 0;
    var totalProtDist = parseFloat($("#totalDistProt").text()) || 0;
    var totalGrasaDist = parseFloat($("#totalDistGrasa").text()) || 0;
    var totalFibraDist = parseFloat($("#totalDistFibra").text()) || 0;

    texto += "───────────────────────────────────────────────────\n";
    texto += "TOTALES DISTRIBUIDOS\n";
    texto += "───────────────────────────────────────────────────\n";
    texto += "Carbohidratos: " + totalCHODist.toFixed(1) + " g\n";
    texto += "Proteínas:     " + totalProtDist.toFixed(1) + " g\n";
    texto += "Grasas:        " + totalGrasaDist.toFixed(1) + " g\n";
    texto += "Fibra:         " + totalFibraDist.toFixed(1) + " g\n\n";

    texto += "═══════════════════════════════════════════════════\n";
    texto += "Generado por Sistema Nutricional\n";
    texto += "═══════════════════════════════════════════════════\n";

    // Copiar al portapapeles
    navigator.clipboard.writeText(texto).then(function () {
        Swal.fire({
            icon: 'success',
            title: 'Copiado al Portapapeles',
            html: 'La distribución ha sido copiada.<br>Puede pegarla donde necesite.',
            timer: 2000,
            showConfirmButton: false
        });
    }).catch(function (err) {
        // Fallback para navegadores antiguos
        var textarea = document.createElement('textarea');
        textarea.value = texto;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);

        Swal.fire({
            icon: 'success',
            title: 'Copiado al Portapapeles',
            html: 'La distribución ha sido copiada.<br>Puede pegarla donde necesite.',
            timer: 2000,
            showConfirmButton: false
        });
    });
}

// ========================================
// GUARDAR DISTRIBUCIÓN EN BD Y ENVIAR CORREO
// ========================================
var _pdfDatosServidor = null; // cache save-once: evita re-guardar en BD en presionadas sucesivas

function guardarYEnviarDistribucion() {
    var totalCHO = parseFloat($("#totalDistCHO").text()) || 0;
    if (totalCHO === 0) {
        Swal.fire({ icon: 'warning', title: 'Sin datos', text: 'Primero ingrese la distribución de macronutrientes' });
        return;
    }

    var formula    = $("#calcFormulaGEB").val() || "HarrisBenedict";
    var ree        = parseFloat($("#calcREEEditable").val()) || datosCalculadora.ree || 0;
    var metaCHO   = parseFloat($("#lblGramosCHO").text())   || 0;
    var metaProt  = parseFloat($("#lblGramosProt").text())  || 0;
    var metaGrasa = parseFloat($("#lblGramosGrasa").text()) || 0;
    var metaFibra = parseFloat($("#txtMetaFibra").val()) || 25;

    var macroData = { formula: formula, ree: ree, metaCHO: metaCHO, metaProt: metaProt, metaGrasa: metaGrasa, metaFibra: metaFibra };

    // Si ya guardamos en BD, reutilizar datos del servidor sin volver a grabar
    if (_pdfDatosServidor !== null) {
        generarPDFNutricional(_pdfDatosServidor, macroData);
        return;
    }

    var idConsulta = $.cookie("CONUNI");
    var idUsuario  = datosCalculadora.idUsuario;
    var idMedico   = datosCalculadora.idMedico;

    function v(id) { return (parseFloat($(id).val()) || 0).toFixed(4); }

    var params = [
        idConsulta,
        idUsuario,
        idMedico,
        formula,
        ree.toFixed(4),
        metaCHO.toFixed(4), metaProt.toFixed(4), metaGrasa.toFixed(4), metaFibra.toFixed(4),
        v("#distDesayunoCHO"),    v("#distDesayunoProt"),    v("#distDesayunoGrasa"),    v("#distDesayunoFibra"),
        v("#distMeriendaAMCHO"),  v("#distMeriendaAMProt"),  v("#distMeriendaAMGrasa"),  v("#distMeriendaAMFibra"),
        v("#distAlmuerzoCHO"),    v("#distAlmuerzoProt"),    v("#distAlmuerzoGrasa"),    v("#distAlmuerzoFibra"),
        v("#distMeriendaPMCHO"),  v("#distMeriendaPMProt"),  v("#distMeriendaPMGrasa"),  v("#distMeriendaPMFibra"),
        v("#distCenaCHO"),        v("#distCenaProt"),        v("#distCenaGrasa"),        v("#distCenaFibra")
    ];

    Swal.fire({ title: 'Guardando...', allowOutsideClick: false, showConfirmButton: false, willOpen: function() { Swal.showLoading(); } });

    jQuery.ajax({
        type: "POST",
        url: "frmCompletarMetricas.aspx/GuardarDistribucionMacros",
        data: JSON.stringify({ 'obj_Parametros_JS': params }),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        cache: false,
        success: function (msg) {
            Swal.close();
            var arreglo = msg.d.split("<SPLITER>");
            if (arreglo[0] === "1") {
                try {
                    console.log("Datos del servidor recibidos:", arreglo[1].substring(0, 500));
                    var datosServidor = JSON.parse(arreglo[1]);
                    _pdfDatosServidor = datosServidor;
                    console.log("Llamando generarPDFNutricional...");
                    generarPDFNutricional(datosServidor, macroData);
                    console.log("generarPDFNutricional completado OK");
                } catch (e) {
                    console.error("Error al generar PDF:", e);
                    Swal.fire({ icon: 'success', title: 'Guardado', text: 'Distribución guardada correctamente. Error PDF: ' + e.message, timer: 4000, showConfirmButton: false });
                }
            } else {
                Swal.fire({ icon: 'error', title: 'Error', text: arreglo[1] });
            }
        },
        error: function (xhr) {
            Swal.close();
            Swal.fire({ icon: 'error', title: 'Error', text: 'Error de comunicación: ' + xhr.responseText });
        }
    });
}

// ============================================
// GENERAR PDF NUTRICIONAL
// ============================================
function generarPDFNutricional(srv, macro) {
    console.log("=== GENERAR PDF NUTRICIONAL ===");
    console.log("srv:", srv);
    console.log("macro:", macro);
    
    // ── Datos de la calculadora ──────────────────────────────────────
    var peso       = parseFloat($("#calcPeso").val())       || 0;
    var tallaCm    = parseFloat($("#calcEstaturaCm").val()) || 0;
    var edad       = datosCalculadora.edad || parseInt($("#calcEdad").val()) || 0;
    var sexo       = $("#calcSexo").val() || "";
    var pesoIdeal  = datosCalculadora.pesoIdeal ? datosCalculadora.pesoIdeal.toFixed(1) : "-";
    var geb        = datosCalculadora.geb ? datosCalculadora.geb.toFixed(0) : "-";
    var imc        = (tallaCm > 0) ? (peso / Math.pow(tallaCm / 100, 2)).toFixed(1) : "-";

    var formulaLabel = {
        HarrisBenedict: "Harris-Benedict",
        FAO_OMS:        "FAO/OMS (Schofield)",
        Mifflin:        "Mifflin-St Jeor",
        Cunningham:     "Cunningham",
        Valencia:       "Valencia Mexicana"
    }[macro.formula] || macro.formula;

    // ── Distribución por tiempos ─────────────────────────────────────
    function gv(id) { return parseFloat($(id).val()) || 0; }
    function kcal(cho, prot, grasa) { return (cho * 4 + prot * 4 + grasa * 9).toFixed(0); }

    var tiempos = [
        { nombre: "Desayuno",     cho: gv("#distDesayunoCHO"),   prot: gv("#distDesayunoProt"),   grasa: gv("#distDesayunoGrasa"),   fibra: gv("#distDesayunoFibra") },
        { nombre: "Merienda AM",  cho: gv("#distMeriendaAMCHO"), prot: gv("#distMeriendaAMProt"), grasa: gv("#distMeriendaAMGrasa"), fibra: gv("#distMeriendaAMFibra") },
        { nombre: "Almuerzo",     cho: gv("#distAlmuerzoCHO"),   prot: gv("#distAlmuerzoProt"),   grasa: gv("#distAlmuerzoGrasa"),   fibra: gv("#distAlmuerzoFibra") },
        { nombre: "Merienda PM",  cho: gv("#distMeriendaPMCHO"), prot: gv("#distMeriendaPMProt"), grasa: gv("#distMeriendaPMGrasa"), fibra: gv("#distMeriendaPMFibra") },
        { nombre: "Cena",         cho: gv("#distCenaCHO"),       prot: gv("#distCenaProt"),       grasa: gv("#distCenaGrasa"),       fibra: gv("#distCenaFibra") }
    ];

    var filasTiempos = tiempos.map(function(t) {
        var kcalTiempo = kcal(t.cho, t.prot, t.grasa);
        return '<tr>' +
            '<td class="pdf-td-label">' + t.nombre + '</td>' +
            '<td>' + t.cho.toFixed(1) + '</td>' +
            '<td>' + t.prot.toFixed(1) + '</td>' +
            '<td>' + t.grasa.toFixed(1) + '</td>' +
            '<td>' + t.fibra.toFixed(1) + '</td>' +
            '<td class="pdf-td-kcal">' + kcalTiempo + '</td>' +
            '</tr>';
    }).join('');

    var totalKcal = kcal(macro.metaCHO, macro.metaProt, macro.metaGrasa);

    // ── Logo de clínica (solo si existe) ────────────────────────────
    // URL absoluta para que el popup de impresión lo resuelva correctamente
    var logoClinicaUrl = '';
    if (srv.logoClinica) {
        logoClinicaUrl = /^https?:\/\//i.test(srv.logoClinica)
            ? srv.logoClinica
            : window.location.origin + (srv.logoClinica.charAt(0) === '/' ? '' : '/') + srv.logoClinica;
    }
    var logoClinicaHtml = logoClinicaUrl
        ? '<img src="' + logoClinicaUrl + '" class="pdfns-logo-clinica" alt="Logo clínica">'
        : '';

    // ── URL del logo de NutriSys ──────────────────
    var baseUrl = window.location.origin;
    // Usar ruta ABSOLUTA desde la raíz del sitio (el / al inicio es clave para print)
    var logoNutrisys = baseUrl + '/Base/assets/images/Untitled.png';

    // ── HTML del PDF ─────────────────────────────────────────────────
    var html = '<div class="pdfns-wrap">' +

        // CABECERA
        '<div class="pdfns-header">' +
            '<img src="' + logoNutrisys + '" class="pdfns-logo" alt="NutriSys">' +
            '<div class="pdfns-header-right">' +
                logoClinicaHtml +
            '</div>' +
        '</div>' +

        // BANDA DE TÍTULO
        '<div class="pdfns-titlebar">' +
            '<span class="pdfns-title">Plan Nutricional</span>' +
            '<span class="pdfns-date">Fecha de consulta: ' + srv.fechaConsulta + '</span>' +
        '</div>' +

        // TARJETAS MÉDICO / PACIENTE
        '<div class="pdfns-cards-row">' +
            '<div class="pdfns-card">' +
                '<div class="pdfns-card-label">Nutricionista tratante</div>' +
                '<div class="pdfns-card-value">' + srv.nombreMedico + '</div>' +
                (srv.nombreClinica ? '<div class="pdfns-card-sub">' + srv.nombreClinica + '</div>' : '') +
                (srv.direccionClinica ? '<div class="pdfns-card-sub" style="font-size:0.72rem;color:#6c757d;">' + srv.direccionClinica + '</div>' : '') +
            '</div>' +
            '<div class="pdfns-card">' +
                '<div class="pdfns-card-label">Paciente</div>' +
                '<div class="pdfns-card-value">' + srv.nombrePaciente + '</div>' +
                '<div class="pdfns-card-sub">' + edad + ' años &nbsp;·&nbsp; ' + sexo + '</div>' +
            '</div>' +
            '<div class="pdfns-card">' +
                '<div class="pdfns-card-label">Datos corporales</div>' +
                '<div class="pdfns-card-meta">Peso actual: <strong>' + peso.toFixed(1) + ' kg</strong></div>' +
                '<div class="pdfns-card-meta">Talla: <strong>' + tallaCm.toFixed(1) + ' cm</strong></div>' +
                '<div class="pdfns-card-meta">IMC: <strong>' + imc + '</strong></div>' +
                '<div class="pdfns-card-meta">Peso ideal: <strong>' + pesoIdeal + ' kg</strong></div>' +
                (_antrop ?
                    '<div class="pdfns-card-meta" style="margin-top:4px;padding-top:4px;border-top:1px solid #e2e8f0;">' +
                        'ATB: <strong>' + _antrop.atb + ' cm²</strong> &nbsp;·&nbsp; ' +
                        'CMB: <strong>' + _antrop.cmb + ' cm</strong>' +
                    '</div>' +
                    '<div class="pdfns-card-meta">' +
                        'AMB: <strong>' + _antrop.amb + ' cm²</strong> &nbsp;·&nbsp; ' +
                        'AGB: <strong>' + _antrop.agb + ' cm²</strong>' +
                    '</div>' +
                    (_antrop.pesoEstimado ?
                        '<div class="pdfns-card-meta">Peso estimado: <strong>' + _antrop.pesoEstimado + ' kg</strong></div>'
                    : '') +
                    (_antrop.tallaEstimada ?
                        '<div class="pdfns-card-meta">Talla estimada: <strong>' + _antrop.tallaEstimada + ' cm</strong></div>'
                    : '')
                : '') +
            '</div>' +
        '</div>' +

        // EVALUACIÓN NUTRICIONAL
        '<div class="pdfns-section-title">Evaluación Nutricional</div>' +
        '<div class="pdfns-eval-row">' +
            '<div class="pdfns-eval-item">' +
                '<div class="pdfns-eval-num">' + geb + '</div>' +
                '<div class="pdfns-eval-desc">GEB (kcal/día)<br><small>' + formulaLabel + '</small></div>' +
            '</div>' +
            '<div class="pdfns-eval-item pdfns-eval-accent">' +
                '<div class="pdfns-eval-num">' + macro.ree.toFixed(0) + '</div>' +
                '<div class="pdfns-eval-desc">Requerimiento Energético<br><small>kcal/día</small></div>' +
            '</div>' +
            '<div class="pdfns-eval-item">' +
                '<div class="pdfns-eval-num">' + totalKcal + '</div>' +
                '<div class="pdfns-eval-desc">Calorías del plan<br><small>kcal/día</small></div>' +
            '</div>' +
        '</div>' +

        // METAS DE MACRONUTRIENTES
        '<div class="pdfns-section-title">Metas de Macronutrientes</div>' +
        '<table class="pdfns-table pdfns-table-macro">' +
            '<thead><tr>' +
                '<th>Macronutriente</th><th>g/día</th><th>kcal</th><th>%</th>' +
            '</tr></thead>' +
            '<tbody>' +
                '<tr><td>Carbohidratos</td><td>' + macro.metaCHO.toFixed(1) + '</td><td>' + (macro.metaCHO * 4).toFixed(0) + '</td>' +
                    '<td>' + (macro.ree > 0 ? ((macro.metaCHO * 4 / macro.ree) * 100).toFixed(1) : '-') + '%</td></tr>' +
                '<tr><td>Proteínas</td><td>' + macro.metaProt.toFixed(1) + '</td><td>' + (macro.metaProt * 4).toFixed(0) + '</td>' +
                    '<td>' + (macro.ree > 0 ? ((macro.metaProt * 4 / macro.ree) * 100).toFixed(1) : '-') + '%</td></tr>' +
                '<tr><td>Grasas</td><td>' + macro.metaGrasa.toFixed(1) + '</td><td>' + (macro.metaGrasa * 9).toFixed(0) + '</td>' +
                    '<td>' + (macro.ree > 0 ? ((macro.metaGrasa * 9 / macro.ree) * 100).toFixed(1) : '-') + '%</td></tr>' +
                '<tr class="pdfns-row-fibra"><td>Fibra</td><td>' + macro.metaFibra.toFixed(1) + '</td><td>—</td><td>—</td></tr>' +
            '</tbody>' +
        '</table>' +

        // DISTRIBUCIÓN POR TIEMPOS DE COMIDA
        '<div class="pdfns-section-title">Distribución por Tiempos de Comida</div>' +
        '<table class="pdfns-table">' +
            '<thead><tr>' +
                '<th>Tiempo de comida</th><th>CHO (g)</th><th>Proteínas (g)</th><th>Grasas (g)</th><th>Fibra (g)</th><th>kcal</th>' +
            '</tr></thead>' +
            '<tbody>' +
                filasTiempos +
                '<tr class="pdfns-row-total">' +
                    '<td><strong>Total</strong></td>' +
                    '<td><strong>' + macro.metaCHO.toFixed(1) + '</strong></td>' +
                    '<td><strong>' + macro.metaProt.toFixed(1) + '</strong></td>' +
                    '<td><strong>' + macro.metaGrasa.toFixed(1) + '</strong></td>' +
                    '<td><strong>' + macro.metaFibra.toFixed(1) + '</strong></td>' +
                    '<td><strong>' + totalKcal + '</strong></td>' +
                '</tr>' +
            '</tbody>' +
        '</table>' +

        // HISTORIA CLÍNICA (si existe)
        (srv.historiaClinica ? 
        '<div class="pdfns-section-title">Historia Clínica</div>' +
        '<div class="pdfns-hc-content">' +
        (srv.historiaClinica.objetivosClinicos ? '<div class="pdfns-hc-item"><strong>Objetivos clínicos:</strong> ' + srv.historiaClinica.objetivosClinicos + '</div>' : '') +
        (srv.historiaClinica.intolerancias ? '<div class="pdfns-hc-item"><strong>Intolerancias:</strong> ' + srv.historiaClinica.intolerancias + '</div>' : '') +
        (srv.historiaClinica.alergiasAlimentarias ? '<div class="pdfns-hc-item"><strong>Alergías alimentarias:</strong> ' + srv.historiaClinica.alergiasAlimentarias + '</div>' : '') +
        (srv.historiaClinica.medicamentos ? '<div class="pdfns-hc-item"><strong>Medicamentos:</strong> ' + srv.historiaClinica.medicamentos + '</div>' : '') +
        (srv.historiaClinica.actividadFisica ? '<div class="pdfns-hc-item"><strong>Actividad física:</strong> ' + srv.historiaClinica.actividadFisica + '</div>' : '') +
        '</div>' : '') +

        // PIE DE PÁGINA
        '<div class="pdfns-footer">' +
            'Generado por <strong>NutriSys</strong> &nbsp;·&nbsp; ' + new Date().toLocaleDateString('es-MX', { day:'2-digit', month:'long', year:'numeric' }) +
        '</div>' +

    '</div>';

    // ── Estilos inline (sin @import — html2canvas no espera cargas de red externas)
    var css = '<style>' +
        '.pdfns-wrap{font-family:Arial,Helvetica,sans-serif;color:#131b2e;background:#fff;padding:0;margin:0;font-size:11px;}' +
        '.pdfns-header{display:flex;justify-content:space-between;align-items:center;background:#006c49;padding:18px 28px;}' +
        '.pdfns-logo{height:44px;object-fit:contain;}' +
        '.pdfns-header-right{display:flex;flex-direction:row;align-items:center;gap:12px;}' +
        '.pdfns-logo-clinica{height:40px;max-height:44px;max-width:110px;width:auto;object-fit:contain;border-radius:6px;background:#fff;padding:3px;}' +
        '.pdfns-clinic-info{display:flex;flex-direction:column;align-items:flex-end;}' +
        '.pdfns-clinic-name{color:#fff;font-size:13px;font-weight:600;}' +
        '.pdfns-clinic-addr{color:rgba(255,255,255,0.78);font-size:10px;margin-top:2px;}' +
        '.pdfns-titlebar{background:#004d33;color:#fff;padding:10px 28px;display:flex;justify-content:space-between;align-items:center;}' +
        '.pdfns-title{font-size:16px;font-weight:700;letter-spacing:.3px;}' +
        '.pdfns-date{font-size:10px;opacity:.85;}' +
        '.pdfns-cards-row{display:flex;gap:12px;padding:16px 28px 8px;}' +
        '.pdfns-card{flex:1;background:#f2f3ff;border-radius:8px;padding:12px 14px;border-left:3px solid #006c49;}' +
        '.pdfns-card-label{font-size:9px;text-transform:uppercase;letter-spacing:.6px;color:#5a6a62;margin-bottom:4px;}' +
        '.pdfns-card-value{font-size:13px;font-weight:700;color:#006c49;margin-bottom:2px;}' +
        '.pdfns-card-sub{font-size:10px;color:#3c4a42;}' +
        '.pdfns-card-meta{font-size:10px;color:#3c4a42;line-height:1.6;}' +
        '.pdfns-section-title{background:#e8f5ee;color:#004d33;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;padding:6px 28px;margin-top:10px;border-left:4px solid #006c49;}' +
        '.pdfns-eval-row{display:flex;gap:0;padding:12px 28px;}' +
        '.pdfns-eval-item{flex:1;text-align:center;padding:12px 8px;background:#f8faf8;border-right:1px solid #dde5e0;}' +
        '.pdfns-eval-item:last-child{border-right:none;}' +
        '.pdfns-eval-accent{background:#006c49;}' +
        '.pdfns-eval-accent .pdfns-eval-num,.pdfns-eval-accent .pdfns-eval-desc{color:#fff;}' +
        '.pdfns-eval-num{font-size:22px;font-weight:700;color:#006c49;line-height:1;}' +
        '.pdfns-eval-desc{font-size:9px;color:#5a6a62;margin-top:4px;line-height:1.4;}' +
        '.pdfns-table{width:100%;border-collapse:collapse;margin:8px 28px;width:calc(100% - 56px);}' +
        '.pdfns-table th{background:#006c49;color:#fff;padding:7px 10px;text-align:left;font-size:10px;font-weight:600;}' +
        '.pdfns-table td{padding:6px 10px;border-bottom:1px solid #e8ede9;font-size:10px;}' +
        '.pdfns-table tbody tr:nth-child(even){background:#f8faf8;}' +
        '.pdf-td-label{font-weight:600;color:#006c49;}' +
        '.pdf-td-kcal{font-weight:600;}' +
        '.pdfns-row-total td{background:#e8f5ee;font-size:11px;border-top:2px solid #006c49;}' +
        '.pdfns-row-fibra td{color:#5a6a62;font-style:italic;}' +
        '.pdfns-table-macro{margin-bottom:0;}' +
        '.pdfns-footer{text-align:center;padding:14px 28px 20px;font-size:9px;color:#5a6a62;border-top:1px solid #dde5e0;margin-top:16px;}' +
        '.pdfns-hc-content{padding:12px 28px;font-size:10px;line-height:1.6;}' +
        '.pdfns-hc-item{margin-bottom:4px;}' +
        '.pdfns-hc-item strong{color:#006c49;}' +
        '.pdfns-ab-grid{display:flex;flex-wrap:wrap;gap:8px;padding:12px 28px;}' +
        '.pdfns-ab-item{flex:1 1 100px;background:#f8faf8;border-radius:4px;padding:8px 10px;font-size:9px;}' +
        '.pdfns-ab-item.pdfns-ab-full{flex:1 1 100%;}' +
        '.pdfns-ab-label{display:block;color:#5a6a62;font-size:8px;text-transform:uppercase;}' +
        '.pdfns-ab-value{color:#131b2e;font-weight:600;font-size:12px;}' +
    '</style>';

    var htmlParaImprimir = css + html;

    var ventana = window.open('', '_blank');
    if (!ventana) {
        Swal.fire({
            icon: 'warning',
            title: 'Ventana bloqueada',
            text: 'El navegador bloqueó la ventana emergente. Permitir ventanas emergentes para este sitio e intentar de nuevo.'
        });
        return;
    }
    ventana.document.open();
    ventana.document.write(
        '<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8">' +
        '<title>Plan Nutricional — ' + (srv.nombrePaciente || 'Paciente') + '</title>' +
        '</head><body style="margin:0;background:#f5f6fa;">' +
        htmlParaImprimir +
        '</body></html>'
    );
    ventana.document.close();
    ventana.focus();
    setTimeout(function() { ventana.print(); }, 600);
}

function _enviarPDFNutricionalCorreo(base64, srv) {
    var obj_Parametros_JS = [
        $.cookie('CONUNI') || '0',
        base64,
        srv.nombrePaciente || '',
        srv.nombreMedico || '',
        srv.fechaConsulta || '',
        srv.emailPaciente || ''
    ];

    Swal.fire({
        title: 'Enviando correo...',
        allowOutsideClick: false,
        showConfirmButton: false,
        willOpen: function() { Swal.showLoading(); }
    });

    jQuery.ajax({
        type: 'POST',
        url: 'frmCompletarMetricas.aspx/EnviarPDFPorCorreo',
        data: JSON.stringify({ obj_Parametros_JS: obj_Parametros_JS }),
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        success: function(msg) {
            var res = (msg.d || '0<SPLITER>Error').split('<SPLITER>');
            var ok = res[0] !== '0' && res[0] !== '-1';
            Swal.fire({
                icon: ok ? 'success' : 'error',
                title: ok ? 'Correo enviado' : 'Error al enviar',
                text: res[1] || 'Operación completada.',
                timer: 4000,
                showConfirmButton: false
            });
        },
        error: function() {
            Swal.fire({ icon: 'error', title: 'Error de conexión', text: 'No se pudo conectar con el servidor.' });
        }
    });
}

// ============================================
// CALCULADORA NUTRICIONAL
// ============================================

// Datos antropométricos cargados (se usan también en el PDF)
var _antrop = null;

// Variables globales de la calculadora
var datosCalculadora = {
    pesoIdeal: 0,
    geb: 0,
    ree: 0,
    reeCalculado: 0,
    pesoReferencia: 0,
    sexo: '',
    edad: 0,
    fechaNacimiento: null,
    idUsuario: 0,
    idMedico: 0
};

// ========================================
// ACTUALIZAR REE DESDE EL CAMPO EDITABLE
// ========================================
function actualizarREEManual() {
    var valor = parseFloat($("#calcREEEditable").val());
    if (valor > 0) {
        datosCalculadora.ree = valor;
        calcularDistribucion();
    }
}

// ========================================
// RESTAURAR REE AL VALOR CALCULADO
// ========================================
function restaurarREECalculado() {
    if (!datosCalculadora.reeCalculado) {
        Swal.fire({
            icon: 'info',
            title: 'Sin cálculo',
            text: 'Primero seleccione el factor de actividad para calcular el REE.',
            timer: 2500,
            showConfirmButton: false
        });
        return;
    }
    datosCalculadora.ree = datosCalculadora.reeCalculado;
    $("#calcREEEditable").val(datosCalculadora.reeCalculado.toFixed(2));
    calcularDistribucion();
}

// ========================================
// TOGGLE CALCULADORA
// ========================================
function toggleCalculadora() {
    var panel = $("#panelCalculadora");
    var icono = $("#iconCalculadora");
    var texto = $("#txtBtnCalculadora");

    if (panel.is(":visible")) {
        panel.slideUp();
        icono.removeClass("fa-chevron-up").addClass("fa-chevron-down");
        texto.text("Abrir Calculadora");
    } else {
        // Al abrir, cargar datos del paciente
        cargarDatosPacienteCalculadora();
        panel.slideDown();
        icono.removeClass("fa-chevron-down").addClass("fa-chevron-up");
        texto.text("Cerrar Calculadora");
    }
}

// ========================================
// CARGAR DATOS DEL PACIENTE PARA CALCULADORA
// ========================================
function cargarDatosPacienteCalculadora() {
    // Obtener ID del paciente desde la consulta
    var obj_Parametros_JS = new Array();
    obj_Parametros_JS[0] = $.cookie("CONUNI");

    var parametros = JSON.stringify({ 'obj_Parametros_JS': obj_Parametros_JS });

    jQuery.ajax({
        type: "POST",
        url: "frmCompletarMetricas.aspx/ObtenerDatosPacienteParaCalculadora",
        data: parametros,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        cache: false,
        success: function (msg) {
            var res = msg.d;
            if (res && res.indexOf("Error") === -1) {
                var arreglo = res.split("<SPLITER>");

                // [0] FechaNacimiento  [1] Sexo  [2] Id_Usuario  [3] Id_Medico
                datosCalculadora.fechaNacimiento = new Date(arreglo[0]);
                datosCalculadora.sexo      = arreglo[1];
                datosCalculadora.idUsuario = parseInt(arreglo[2]) || 0;
                datosCalculadora.idMedico  = parseInt(arreglo[3]) || 0;

                // Calcular edad
                var hoy = new Date();
                var edad = hoy.getFullYear() - datosCalculadora.fechaNacimiento.getFullYear();
                var m = hoy.getMonth() - datosCalculadora.fechaNacimiento.getMonth();
                if (m < 0 || (m === 0 && hoy.getDate() < datosCalculadora.fechaNacimiento.getDate())) {
                    edad--;
                }
                datosCalculadora.edad = edad;

                // Llenar campos de la calculadora
                var peso = parseFloat($("#txtPeso").val());
                var estaturaCm = parseFloat($("#txtEstatura").val());

                if (peso && estaturaCm) {
                    $("#calcPeso").val(peso.toFixed(2));
                    $("#calcEstaturaCm").val(estaturaCm.toFixed(1));
                    $("#calcEstatura").val((estaturaCm / 100).toFixed(2));
                    $("#calcEdad").val(edad);
                    $("#calcSexo").val(datosCalculadora.sexo === 'M' ? 'Masculino' : 'Femenino');

                    // Calcular GEB automáticamente
                    calcularGEB();
                } else {
                    Swal.fire({
                        icon: 'warning',
                        title: 'Datos incompletos',
                        text: 'Primero ingrese Peso y Estatura en las métricas corporales'
                    });
                }
            }
        }
    });
}

// ========================================
// CALCULAR PESO IDEAL
// ========================================
// ========================================
// FACTOR ESTRUCTURAL POR CIRCUNFERENCIA DE MUÑECA
// Fórmula: Factor = talla_cm / circ_muneca_cm
// ========================================
function calcularFactorPorMuneca() {
    var tallaCm    = parseFloat($("#calcEstaturaCm").val()) || 0;
    var circMuneca = parseFloat($("#calcCircMuneca").val()) || 0;

    if (tallaCm <= 0 || circMuneca <= 0) return;

    var factorCalc = tallaCm / circMuneca;

    // Mostrar el valor calculado
    $("#lblFactorCalculado").text(factorCalc.toFixed(2));
    $("#lblFactorCalculadoInfo").show();

    // Aplicar: seleccionar "Otro" y rellenar el campo personalizado
    $("#calcFactorEstructura").val("otro");
    $("#divFactorPersonalizado").show();
    $("#calcFactorPersonalizado").val(factorCalc.toFixed(2)).trigger("input");
}

function calcularPesoIdeal() {
    var estatura = parseFloat($("#calcEstatura").val());
    var factorEstructura = $("#calcFactorEstructura").val();

    // Mostrar/ocultar campo personalizado
    if (factorEstructura === "otro") {
        $("#divFactorPersonalizado").show();
        return;
    } else {
        $("#divFactorPersonalizado").hide();
        $("#lblFactorCalculadoInfo").hide();
    }

    if (!estatura || !factorEstructura) {
        $("#lblPesoIdeal").text("-");
        return;
    }

    var factor = parseFloat(factorEstructura);
    var peso = parseFloat($("#calcPeso").val());

    if (!peso) {
        Swal.fire({
            icon: 'warning',
            text: 'Ingrese el peso en las métricas corporales primero'
        });
        return;
    }

    // Fórmula: Paso 1: TMR² × Factor
    var tmr2xFactor = (estatura * estatura) * factor;

    // Paso 2: (Peso - Resultado Paso 1) / 4 + Resultado Paso 1
    var pesoIdeal = ((peso - tmr2xFactor) / 4) + tmr2xFactor;

    datosCalculadora.pesoIdeal = pesoIdeal;
    $("#lblPesoIdeal").text(pesoIdeal.toFixed(2));

    // Actualizar peso de referencia si está en "ideal"
    if ($("#calcTipoPesoReferencia").val() === "ideal") {
        $("#calcPesoReferencia").val(pesoIdeal.toFixed(2));
        datosCalculadora.pesoReferencia = pesoIdeal;
        calcularDistribucion();
    }
}




// ========================================
// CALCULAR GEB (HARRIS-BENEDICT o FAO/OMS)
// ========================================
function calcularGEB() {
    var peso = parseFloat($("#calcPeso").val());
    var estaturaCm = parseFloat($("#calcEstaturaCm").val());
    var edad = datosCalculadora.edad;
    var sexo = datosCalculadora.sexo;
    var formula = $("#calcFormulaGEB").val() || "HarrisBenedict";

    // Mostrar fila MLG solo para Cunningham
    $("#divMLG").toggle(formula === "Cunningham");

    if (!peso || !estaturaCm || !edad || !sexo) {
        $("#lblGEB").text("-");
        $("#lblGEBFormula").text("");
        return;
    }

    var geb = 0;
    var formulaLabel = "";

    if (formula === "FAO_OMS") {
        // FAO/OMS/ONU — Schofield (1985), W en kg
        formulaLabel = "FAO/OMS/ONU (Schofield)";
        if (sexo === 'M') {
            if      (edad >= 10 && edad < 18) { geb = 17.5 * peso + 651; }
            else if (edad >= 18 && edad < 30) { geb = 15.3 * peso + 679; }
            else if (edad >= 30 && edad < 60) { geb = 11.6 * peso + 879; }
            else if (edad >= 60)              { geb = 13.5 * peso + 487; }
        } else if (sexo === 'F') {
            if      (edad >= 10 && edad < 18) { geb = 12.2 * peso + 746; }
            else if (edad >= 18 && edad < 30) { geb = 14.7 * peso + 496; }
            else if (edad >= 30 && edad < 60) { geb =  8.7 * peso + 829; }
            else if (edad >= 60)              { geb = 10.5 * peso + 596; }
        }
    } else if (formula === "Mifflin") {
        // Mifflin-St Jeor — mejor validación en sobrepeso/obesidad
        formulaLabel = "Mifflin-St Jeor";
        if (sexo === 'M') {
            geb = (10 * peso) + (6.25 * estaturaCm) - (5 * edad) + 5;
        } else if (sexo === 'F') {
            geb = (10 * peso) + (6.25 * estaturaCm) - (5 * edad) - 161;
        }
    } else if (formula === "Cunningham") {
        // Cunningham — prioritario en hipertrofia; requiere % grasa corporal
        formulaLabel = "Cunningham";
        var grasaPct = parseFloat($("#txtGrasaPorcentaje").val());
        if (!grasaPct || grasaPct <= 0) {
            $("#lblGEB").text("-");
            $("#lblGEBFormula").text("(Cunningham requiere % grasa corporal)");
            $("#calcMLG").val("");
            datosCalculadora.geb = 0;
            return;
        }
        var mlg = peso * (1 - grasaPct / 100);
        $("#calcMLG").val(mlg.toFixed(2));
        geb = 500 + (22 * mlg);
    } else if (formula === "Valencia") {
        // Valencia Mexicana — mayor representatividad para población mexicana
        formulaLabel = "Valencia Mexicana";
        if (sexo === 'M') {
            geb = (14.2 * peso) + 593;
        } else if (sexo === 'F') {
            geb = (10.9 * peso) + 660;
        }
    } else {
        // Harris-Benedict (clásica)
        formulaLabel = "Harris-Benedict";
        if (sexo === 'M') {
            geb = 66.5 + (13.75 * peso) + (5.003 * estaturaCm) - (6.755 * edad);
        } else if (sexo === 'F') {
            geb = 655.1 + (9.563 * peso) + (1.850 * estaturaCm) - (4.676 * edad);
        }
    }

    datosCalculadora.geb = geb;
    $("#lblGEB").text(geb.toFixed(2));
    $("#lblGEBFormula").text("(" + formulaLabel + ")");
}

// ========================================
// CALCULAR REE (REQUERIMIENTO ENERGÉTICO)
// ========================================
function calcularREE() {
    var geb = datosCalculadora.geb;
    var factorActividad = parseFloat($("#calcFactorActividad").val());

    if (!geb || !factorActividad) {
        $("#lblREE").text("-");
        return;
    }

    var ree = geb * factorActividad;
    datosCalculadora.ree = ree;
    datosCalculadora.reeCalculado = ree; // guardar referencia original
    $("#lblREE").text(ree.toFixed(2));

    // Pre-llenar el campo editable con el valor calculado
    $("#calcREEEditable").val(ree.toFixed(2));

    // Auto-calcular distribución si ya hay porcentajes
    calcularDistribucion();
}

// ========================================
// ACTUALIZAR PESO DE REFERENCIA
// ========================================
function actualizarPesoReferencia() {
    var tipo = $("#calcTipoPesoReferencia").val();
    var pesoRef = 0;

    if (tipo === "ideal") {
        pesoRef = datosCalculadora.pesoIdeal;
        $("#divPesoPersonalizado").hide();
    } else if (tipo === "actual") {
        pesoRef = parseFloat($("#calcPeso").val());
        $("#divPesoPersonalizado").hide();
    } else if (tipo === "personalizado") {
        $("#divPesoPersonalizado").show();
        pesoRef = parseFloat($("#calcPesoPersonalizado").val()) || 0;
    }

    $("#calcPesoReferencia").val(pesoRef.toFixed(2));
    datosCalculadora.pesoReferencia = pesoRef;

    // ✅ RECALCULAR DISTRIBUCIÓN AUTOMÁTICAMENTE
    calcularDistribucion();
}

// ========================================
// CALCULAR DISTRIBUCIÓN DE MACRONUTRIENTES
// ========================================
function calcularDistribucion() {
    var porcentajeCHO = parseFloat($("#calcPorcentajeCHO").val()) || 0;
    var porcentajeProt = parseFloat($("#calcPorcentajeProt").val()) || 0;
    var porcentajeGrasa = parseFloat($("#calcPorcentajeGrasa").val()) || 0;
    var totalPorcentaje = porcentajeCHO + porcentajeProt + porcentajeGrasa;

    $("#lblTotalPorcentaje").text(totalPorcentaje);

    if (totalPorcentaje !== 100) {
        $("#alertaPorcentaje").show();
        return;
    } else {
        $("#alertaPorcentaje").hide();
    }

    // Usar el valor editable si existe; si no, caer en datosCalculadora.ree
    var reeEditado = parseFloat($("#calcREEEditable").val());
    var ree = reeEditado > 0 ? reeEditado : datosCalculadora.ree;
    var pesoRef = datosCalculadora.pesoReferencia;

    if (!ree || !pesoRef) {
        return;
    }

    // Calcular Kcal
    var kcalCHO = (porcentajeCHO * ree) / 100;
    var kcalProt = (porcentajeProt * ree) / 100;
    var kcalGrasa = (porcentajeGrasa * ree) / 100;

    // Calcular Gramos
    var gramosCHO = kcalCHO / 4;
    var gramosProt = kcalProt / 4;
    var gramosGrasa = kcalGrasa / 9;

    // Calcular g/kg/día
    var gKgCHO = gramosCHO / pesoRef;
    var gKgProt = gramosProt / pesoRef;
    var gKgGrasa = gramosGrasa / pesoRef;

    // Mostrar resultados
    $("#lblKcalCHO").text(kcalCHO.toFixed(2));
    $("#lblKcalProt").text(kcalProt.toFixed(2));
    $("#lblKcalGrasa").text(kcalGrasa.toFixed(2));

    $("#lblGramosCHO").text(gramosCHO.toFixed(2));
    $("#lblGramosProt").text(gramosProt.toFixed(2));
    $("#lblGramosGrasa").text(gramosGrasa.toFixed(2));

    $("#lblGKgCHO").text(gKgCHO.toFixed(2));
    $("#lblGKgProt").text(gKgProt.toFixed(2));
    $("#lblGKgGrasa").text(gKgGrasa.toFixed(2));

    // Resumen
    $("#lblResumenCalorias").text(ree.toFixed(2));
    $("#lblResumenCHO").text(gramosCHO.toFixed(2));
    $("#lblResumenProt").text(gramosProt.toFixed(2));
    $("#lblResumenGrasa").text(gramosGrasa.toFixed(2));
}

// ========================================
// EVENTOS AUTOMÁTICOS DE LA CALCULADORA
// ========================================
$(document).ready(function () {

    // Cuando cambian los porcentajes, recalcular
    $("#calcPorcentajeCHO, #calcPorcentajeProt, #calcPorcentajeGrasa").on("input", function () {
        calcularDistribucion();
    });

    // Cuando cambia el tipo de peso de referencia
    $("#calcTipoPesoReferencia").on("change", function () {
        actualizarPesoReferencia();
    });

    // Cuando cambia el peso personalizado
    $("#calcPesoPersonalizado").on("input", function () {
        if ($("#calcTipoPesoReferencia").val() === "personalizado") {
            var pesoPersonalizado = parseFloat($(this).val()) || 0;
            $("#calcPesoReferencia").val(pesoPersonalizado.toFixed(2));
            datosCalculadora.pesoReferencia = pesoPersonalizado;
            calcularDistribucion();
        }
    });

    // Cuando cambia el factor de actividad
    $("#calcFactorActividad").on("change", function () {
        calcularREE();
    });

    // Cuando cambia el factor de estructura manualmente (borra el cálculo por muñeca)
    $("#calcFactorEstructura").on("change", function () {
        if ($(this).val() === "otro") {
            $("#divFactorPersonalizado").show();
        } else {
            $("#divFactorPersonalizado").hide();
            $("#lblFactorCalculadoInfo").hide();
            $("#calcCircMuneca").val("");
            calcularPesoIdeal();
        }
    });

    // Cuando cambia el factor personalizado
    $("#calcFactorPersonalizado").on("input", function () {
        // Si el usuario escribe directo (no viene del cálculo por muñeca), limpiar el hint
        var factorCalcStr = $("#lblFactorCalculado").text();
        if (factorCalcStr !== "—" && $(this).val() !== parseFloat(factorCalcStr).toFixed(2)) {
            $("#calcCircMuneca").val("");
            $("#lblFactorCalculadoInfo").hide();
        }

        var factorPersonalizado = parseFloat($(this).val());
        if (factorPersonalizado) {
            var estatura = parseFloat($("#calcEstatura").val());
            var peso = parseFloat($("#calcPeso").val());

            var tmr2xFactor = (estatura * estatura) * factorPersonalizado;
            var pesoIdeal = ((peso - tmr2xFactor) / 4) + tmr2xFactor;

            datosCalculadora.pesoIdeal = pesoIdeal;
            $("#lblPesoIdeal").text(pesoIdeal.toFixed(2));

            if ($("#calcTipoPesoReferencia").val() === "ideal") {
                $("#calcPesoReferencia").val(pesoIdeal.toFixed(2));
                datosCalculadora.pesoReferencia = pesoIdeal;
                calcularDistribucion();
            }
        }
    });
});


// ============================================
// NAVEGACIÓN ENTRE TABS
// ============================================

// ========================================
// IR A SIGUIENTE TAB
// ========================================
function irSiguienteTab(tabId) {
    $('#' + tabId).tab('show');
}

// ========================================
// TOGGLE FRECUENCIA ALCOHOL
// ========================================
function toggleFrecuenciaAlcohol() {
    if ($("#chkConsumeAlcohol").is(":checked")) {
        $("#divFrecuenciaAlcohol").show();
    } else {
        $("#divFrecuenciaAlcohol").hide();
        $("#txtFrecuenciaAlcohol").val("");
    }
}

// ============================================
// GUARDAR HISTORIA CLÍNICA
// ============================================
function guardarHistoriaClinica() {
    var obj_Parametros_JS = new Array();
    obj_Parametros_JS[0] = $.cookie("CONUNI"); // ID Consulta (necesitamos sacar Id_Usuario)
    obj_Parametros_JS[1] = $("#txtObjetivosClinicos").val() || "";
    obj_Parametros_JS[2] = $("#cboCalidadSueno").val() || "";
    obj_Parametros_JS[3] = $("#cboFuncionIntestinal").val() || "";
    obj_Parametros_JS[4] = $("#chkFuma").is(":checked") ? "1" : "0";
    obj_Parametros_JS[5] = $("#chkConsumeAlcohol").is(":checked") ? "1" : "0";
    obj_Parametros_JS[6] = $("#txtFrecuenciaAlcohol").val() || "";
    obj_Parametros_JS[7] = $("#txtActividadFisica").val() || "";
    obj_Parametros_JS[8] = $("#txtMedicamentos").val() || "";
    obj_Parametros_JS[9] = $("#txtCirugiasRecientes").val() || "";
    obj_Parametros_JS[10] = $("#chkEmbarazo").is(":checked") ? "1" : "0";
    obj_Parametros_JS[11] = $("#chkLactancia").is(":checked") ? "1" : "0";
    obj_Parametros_JS[12] = $("#txtAlimentosFavoritos").val() || "";
    obj_Parametros_JS[13] = $("#txtAlimentosNoGustan").val() || "";
    obj_Parametros_JS[14] = $("#txtIntolerancias").val() || "";
    obj_Parametros_JS[15] = $("#txtAlergias").val() || "";
    obj_Parametros_JS[16] = $("#txtIngestaAgua").val() || "";
    obj_Parametros_JS[17] = $.cookie("GLBUNI");

    var parametros = JSON.stringify({ 'obj_Parametros_JS': obj_Parametros_JS });

    Swal.fire({
        title: 'Guardando historia clínica...',
        text: 'Por favor espere',
        allowOutsideClick: false,
        showConfirmButton: false,
        willOpen: () => {
            Swal.showLoading();
        }
    });

    jQuery.ajax({
        type: "POST",
        url: "frmCompletarMetricas.aspx/GuardarHistoriaClinica",
        data: parametros,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        cache: false,
        success: function (msg) {
            Swal.close();

            var res = msg.d;
            if (res === undefined) {
                Swal.fire({
                    title: "Error",
                    text: "Error de conexión",
                    icon: "error"
                });
            }
            else {
                var arreglo = res.split("<SPLITER>");
                var resultado = arreglo[0];
                var mensaje = arreglo[1];

                if (resultado == "0" || resultado == "") {
                    Swal.fire({
                        title: "Error",
                        text: mensaje,
                        icon: "error"
                    });
                }
                else {
                    Swal.fire({
                        title: "Éxito",
                        text: mensaje,
                        icon: "success",
                        timer: 1500,
                        timerProgressBar: true
                    }).then(function () {
                        irSiguienteTab('tab-evaluacion-link');
                    });
                }
            }
        },
        error: function () {
            Swal.close();
            Swal.fire({
                title: "Error",
                text: "Error al comunicarse con el servidor",
                icon: "error"
            });
        }
    });
}

// ============================================
// GUARDAR EVALUACIÓN CUANTITATIVA
// ============================================
function guardarEvaluacionCuantitativa() {
    var obj_Parametros_JS = new Array();
    obj_Parametros_JS[0] = $.cookie("CONUNI");
    obj_Parametros_JS[1] = $("#txtEvalDesayuno").val() || "";
    obj_Parametros_JS[2] = $("#txtEvalMeriendaAM").val() || "";
    obj_Parametros_JS[3] = $("#txtEvalAlmuerzo").val() || "";
    obj_Parametros_JS[4] = $("#txtEvalMeriendaPM").val() || "";
    obj_Parametros_JS[5] = $("#txtEvalCena").val() || "";
    obj_Parametros_JS[6] = $.cookie("GLBUNI");

    var parametros = JSON.stringify({ 'obj_Parametros_JS': obj_Parametros_JS });

    Swal.fire({
        title: 'Guardando evaluación...',
        text: 'Por favor espere',
        allowOutsideClick: false,
        showConfirmButton: false,
        willOpen: () => {
            Swal.showLoading();
        }
    });

    jQuery.ajax({
        type: "POST",
        url: "frmCompletarMetricas.aspx/GuardarEvaluacionCuantitativa",
        data: parametros,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        cache: false,
        success: function (msg) {
            Swal.close();

            var res = msg.d;
            if (res === undefined) {
                Swal.fire({
                    title: "Error",
                    text: "Error de conexión",
                    icon: "error"
                });
            }
            else {
                var arreglo = res.split("<SPLITER>");
                var resultado = arreglo[0];
                var mensaje = arreglo[1];

                if (resultado == "0" || resultado == "") {
                    Swal.fire({
                        title: "Error",
                        text: mensaje,
                        icon: "error"
                    });
                }
                else {
                    Swal.fire({
                        title: "Éxito",
                        text: mensaje,
                        icon: "success",
                        timer: 1500,
                        timerProgressBar: true
                    }).then(function () {
                        irSiguienteTab('tab-analisis-link');
                    });
                }
            }
        },
        error: function () {
            Swal.close();
            Swal.fire({
                title: "Error",
                text: "Error al comunicarse con el servidor",
                icon: "error"
            });
        }
    });
}

// ============================================
// GUARDAR ANÁLISIS BIOQUÍMICO
// ============================================
function guardarAnalisisBioquimico() {
    // Validar fecha
    if (!$("#txtFechaAnalisis").val()) {
        Swal.fire({
            icon: "warning",
            title: "Validación",
            text: "Por favor ingrese la fecha del análisis"
        });
        return;
    }

    var obj_Parametros_JS = new Array();
    obj_Parametros_JS[0] = $.cookie("CONUNI");
    obj_Parametros_JS[1] = $("#txtFechaAnalisis").val();
    obj_Parametros_JS[2] = $("#txtHemoglobina").val() || "";
    obj_Parametros_JS[3] = $("#txtHematocrito").val() || "";
    obj_Parametros_JS[4] = $("#txtColesterolTotal").val() || "";
    obj_Parametros_JS[5] = $("#txtHDL").val() || "";
    obj_Parametros_JS[6] = $("#txtLDL").val() || "";
    obj_Parametros_JS[7] = $("#txtTrigliceridos").val() || "";
    obj_Parametros_JS[8] = $("#txtGlicemia").val() || "";
    obj_Parametros_JS[9] = $("#txtAcidoUrico").val() || "";
    obj_Parametros_JS[10] = $("#txtAlbumina").val() || "";
    obj_Parametros_JS[11] = ""; // Nitrógeno Ureico (no está en el HTML)
    obj_Parametros_JS[12] = $("#txtCreatinina").val() || "";
    obj_Parametros_JS[13] = $("#txtTSH").val() || "";
    obj_Parametros_JS[14] = $("#txtT4").val() || "";
    obj_Parametros_JS[15] = $("#txtT3").val() || "";
    obj_Parametros_JS[16] = $("#txtVitaminaD").val() || "";
    obj_Parametros_JS[17] = $("#txtVitaminaB12").val() || "";
    obj_Parametros_JS[18] = $("#txtObservacionesAnalisis").val() || "";
    obj_Parametros_JS[19] = $.cookie("GLBUNI");

    var parametros = JSON.stringify({ 'obj_Parametros_JS': obj_Parametros_JS });

    Swal.fire({
        title: 'Guardando análisis...',
        text: 'Por favor espere',
        allowOutsideClick: false,
        showConfirmButton: false,
        willOpen: () => {
            Swal.showLoading();
        }
    });

    jQuery.ajax({
        type: "POST",
        url: "frmCompletarMetricas.aspx/GuardarAnalisisBioquimico",
        data: parametros,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        cache: false,
        success: function (msg) {
            Swal.close();

            var res = msg.d;
            if (res === undefined) {
                Swal.fire({
                    title: "Error",
                    text: "Error de conexión",
                    icon: "error"
                });
            }
            else {
                var arreglo = res.split("<SPLITER>");
                var resultado = arreglo[0];
                var mensaje = arreglo[1];

                if (resultado == "0" || resultado == "") {
                    Swal.fire({
                        title: "Error",
                        text: mensaje,
                        icon: "error"
                    });
                }
                else {
                    Swal.fire({
                        title: "Éxito",
                        text: mensaje,
                        icon: "success",
                        timer: 1500,
                        timerProgressBar: true
                    }).then(function () {
                        irSiguienteTab('tab-padecimientos-link');
                    });
                }
            }
        },
        error: function () {
            Swal.close();
            Swal.fire({
                title: "Error",
                text: "Error al comunicarse con el servidor",
                icon: "error"
            });
        }
    });
}

// ============================================
// COMPLETAR CONSULTA FINAL
// ============================================
function completarConsulta() {
    Swal.fire({
        title: '¿Completar consulta?',
        html: 'Se marcará esta consulta como <strong>completada</strong> y finalizada.<br>¿Está seguro?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#28a745',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Sí, completar',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            var obj_Parametros_JS = new Array();
            obj_Parametros_JS[0] = $.cookie("CONUNI");
            obj_Parametros_JS[1] = $.cookie("GLBUNI");

            var parametros = JSON.stringify({ 'obj_Parametros_JS': obj_Parametros_JS });

            Swal.fire({
                title: 'Completando consulta...',
                text: 'Por favor espere',
                allowOutsideClick: false,
                showConfirmButton: false,
                willOpen: () => {
                    Swal.showLoading();
                }
            });

            jQuery.ajax({
                type: "POST",
                url: "frmCompletarMetricas.aspx/CompletarConsultaFinal",
                data: parametros,
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                cache: false,
                success: function (msg) {
                    Swal.close();

                    var res = msg.d;
                    if (res === undefined) {
                        Swal.fire({
                            title: "Error",
                            text: "Error de conexión",
                            icon: "error"
                        });
                    }
                    else {
                        var arreglo = res.split("<SPLITER>");
                        var resultado = arreglo[0];
                        var mensaje = arreglo[1];

                        if (resultado == "0" || resultado == "") {
                            Swal.fire({
                                title: "Error",
                                text: mensaje,
                                icon: "error"
                            });
                        }
                        else {
                            Swal.fire({
                                title: "¡Consulta Completada!",
                                text: mensaje,
                                icon: "success",
                                timer: 2500,
                                timerProgressBar: true
                            }).then(function () {
                                regresar();
                            });
                        }
                    }
                },
                error: function () {
                    Swal.close();
                    Swal.fire({
                        title: "Error",
                        text: "Error al comunicarse con el servidor",
                        icon: "error"
                    });
                }
            });
        }
    });
}
// ============================================
// CARGAR HISTORIA CLÍNICA GUARDADA — TAB 2
// ============================================
function cmCargarHistoriaClinica() {
    var obj_Parametros_JS = [$.cookie("CONUNI")];
    var parametros = JSON.stringify({ 'obj_Parametros_JS': obj_Parametros_JS });

    jQuery.ajax({
        type: "POST",
        url: "frmCompletarMetricas.aspx/CargaHistoriaClinica",
        data: parametros,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        cache: false,
        success: function (msg) {
            var res = msg.d;
            _historiaClinicaCargada = true;

            if (!res || res === "vacio" || res.indexOf("Error") > -1) return;

            var a = res.split("<SPLITER>");
            // [0]Objetivos [1]CalidadSueno [2]FuncionIntestinal [3]Fuma [4]Alcohol
            // [5]FrecAlcohol [6]ActFisica [7]Medicamentos [8]Cirugias [9]Embarazo [10]Lactancia
            // [11]AlimFavoritos [12]AlimNoGustan [13]Intolerancias [14]Alergias [15]IngestaAgua
            if (a[0]) $("#txtObjetivosClinicos").val(a[0]);
            if (a[1]) $("#cboCalidadSueno").val(a[1]);
            if (a[2]) $("#cboFuncionIntestinal").val(a[2]);
            if (a[3] === "1") $("#chkFuma").prop("checked", true);
            if (a[4] === "1") { $("#chkConsumeAlcohol").prop("checked", true); toggleFrecuenciaAlcohol(); }
            if (a[5]) $("#txtFrecuenciaAlcohol").val(a[5]);
            if (a[6]) $("#txtActividadFisica").val(a[6]);
            if (a[7]) $("#txtMedicamentos").val(a[7]);
            if (a[8]) $("#txtCirugiasRecientes").val(a[8]);
            if (a[9] === "1") $("#chkEmbarazo").prop("checked", true);
            if (a[10] === "1") $("#chkLactancia").prop("checked", true);
            if (a[11]) $("#txtAlimentosFavoritos").val(a[11]);
            if (a[12]) $("#txtAlimentosNoGustan").val(a[12]);
            if (a[13]) $("#txtIntolerancias").val(a[13]);
            if (a[14]) $("#txtAlergias").val(a[14]);
            if (a[15]) $("#txtIngestaAgua").val(a[15]);
        }
    });
}

// ============================================
// CARGAR EVALUACIÓN CUANTITATIVA GUARDADA — TAB 3
// ============================================
function cmCargarEvaluacionCuantitativa() {
    var obj_Parametros_JS = [$.cookie("CONUNI")];
    var parametros = JSON.stringify({ 'obj_Parametros_JS': obj_Parametros_JS });

    jQuery.ajax({
        type: "POST",
        url: "frmCompletarMetricas.aspx/CargaEvaluacionCuantitativa",
        data: parametros,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        cache: false,
        success: function (msg) {
            var res = msg.d;
            _evaluacionCargada = true;

            if (!res || res === "vacio" || res.indexOf("Error") > -1) return;

            var a = res.split("<SPLITER>");
            // [0]Desayuno [1]MeriendaAM [2]Almuerzo [3]MeriendaPM [4]Cena
            if (a[0]) $("#txtEvalDesayuno").val(a[0]);
            if (a[1]) $("#txtEvalMeriendaAM").val(a[1]);
            if (a[2]) $("#txtEvalAlmuerzo").val(a[2]);
            if (a[3]) $("#txtEvalMeriendaPM").val(a[3]);
            if (a[4]) $("#txtEvalCena").val(a[4]);
        }
    });
}

// ============================================
// CARGAR ANÁLISIS BIOQUÍMICO GUARDADO — TAB 4
// ============================================
function cmCargarAnalisisBioquimico() {
    var obj_Parametros_JS = [$.cookie("CONUNI")];
    var parametros = JSON.stringify({ 'obj_Parametros_JS': obj_Parametros_JS });

    jQuery.ajax({
        type: "POST",
        url: "frmCompletarMetricas.aspx/CargaAnalisisBioquimico",
        data: parametros,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        cache: false,
        success: function (msg) {
            var res = msg.d;
            _analisisCargado = true;

            if (!res || res === "vacio" || res.indexOf("Error") > -1) return;

            var a = res.split("<SPLITER>");
            // [0]Fecha [1]Hemoglobina [2]Hematocrito [3]ColesterolTotal [4]HDL [5]LDL
            // [6]Trigliceridos [7]Glicemia [8]AcidoUrico [9]Albumina [10]Creatinina
            // [11]TSH [12]T4 [13]T3 [14]VitaminaD [15]VitaminaB12 [16]Observaciones
            if (a[0]) $("#txtFechaAnalisis").val(a[0]);
            if (a[1]) $("#txtHemoglobina").val(a[1]);
            if (a[2]) $("#txtHematocrito").val(a[2]);
            if (a[3]) $("#txtColesterolTotal").val(a[3]);
            if (a[4]) $("#txtHDL").val(a[4]);
            if (a[5]) $("#txtLDL").val(a[5]);
            if (a[6]) $("#txtTrigliceridos").val(a[6]);
            if (a[7]) $("#txtGlicemia").val(a[7]);
            if (a[8]) $("#txtAcidoUrico").val(a[8]);
            if (a[9]) $("#txtAlbumina").val(a[9]);
            if (a[10]) $("#txtCreatinina").val(a[10]);
            if (a[11]) $("#txtTSH").val(a[11]);
            if (a[12]) $("#txtT4").val(a[12]);
            if (a[13]) $("#txtT3").val(a[13]);
            if (a[14]) $("#txtVitaminaD").val(a[14]);
            if (a[15]) $("#txtVitaminaB12").val(a[15]);
            if (a[16]) $("#txtObservacionesAnalisis").val(a[16]);
        }
    });
}

// ============================================
// PADECIMIENTOS — TAB 5
// ============================================

function cmCargarPadecimientosTab() {
    cmCargaListaPadecimientos();
    cmCargaPadecimientosUsuario();
}

function cmCargaListaPadecimientos() {
    jQuery.ajax({
        type: "POST",
        url: "frmCompletarMetricas.aspx/CmCargaListaPadecimientos",
        data: JSON.stringify({ 'obj_Parametros_JS': [] }),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        cache: false,
        success: function (msg) {
            if (msg.d && msg.d.indexOf("Error") === -1) {
                $("#cboPadecimientosMetricas").append(msg.d);
            }
        }
    });
}

function cmCargaPadecimientosUsuario() {
    var idConsulta = $.cookie("CONUNI");
    jQuery.ajax({
        type: "POST",
        url: "frmCompletarMetricas.aspx/CmCargaPadecimientosUsuario",
        data: JSON.stringify({ 'obj_Parametros_JS': [idConsulta] }),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        cache: false,
        success: function (msg) {
            var res = msg.d;
            if (!res || res.indexOf("Error") > -1) {
                $("#tblPadecimientosMetricas").html(
                    "<tr><td colspan='3' class='text-center text-danger'>" +
                    "Error al cargar padecimientos</td></tr>"
                );
            } else if (res === "vacio") {
                $("#tblPadecimientosMetricas").html(
                    "<tr><td colspan='3' class='text-center text-muted'>" +
                    "<i class='fa fa-info-circle'></i> " +
                    "No tiene padecimientos asignados</td></tr>"
                );
            } else {
                $("#tblPadecimientosMetricas").html(res);
            }
        }
    });
}

function cmAsignarPadecimiento() {
    var idPadecimiento = $("#cboPadecimientosMetricas").val();

    if (!idPadecimiento || idPadecimiento === "0") {
        Swal.fire({
            icon: "warning",
            title: "Validación",
            text: "Por favor seleccione un padecimiento"
        });
        return;
    }

    var params = [$.cookie("CONUNI"), idPadecimiento, $.cookie("GLBUNI")];

    jQuery.ajax({
        type: "POST",
        url: "frmCompletarMetricas.aspx/CmAsignarPadecimiento",
        data: JSON.stringify({ 'obj_Parametros_JS': params }),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        cache: false,
        success: function (msg) {
            var arreglo = msg.d.split("<SPLITER>");
            var resultado = arreglo[0];
            var mensaje = arreglo[1];

            if (resultado !== "0" && resultado !== "-1") {
                Swal.fire({
                    icon: "success",
                    title: "Éxito",
                    text: mensaje,
                    timer: 2000,
                    timerProgressBar: true,
                    showConfirmButton: false
                });
                $("#cboPadecimientosMetricas").val("0");
                setTimeout(cmCargaPadecimientosUsuario, 2100);
            } else {
                Swal.fire({ icon: "info", title: "Aviso", text: mensaje });
            }
        }
    });
}

function cmEliminarPadecimiento(idPadecimiento) {
    Swal.fire({
        title: '¿Eliminar padecimiento?',
        text: "Se eliminará del paciente",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
    }).then(function (result) {
        if (result.isConfirmed) {
            var params = [$.cookie("CONUNI"), idPadecimiento, $.cookie("GLBUNI")];

            jQuery.ajax({
                type: "POST",
                url: "frmCompletarMetricas.aspx/CmEliminarPadecimiento",
                data: JSON.stringify({ 'obj_Parametros_JS': params }),
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                cache: false,
                success: function (msg) {
                    var arreglo = msg.d.split("<SPLITER>");
                    var resultado = arreglo[0];
                    var mensaje = arreglo[1];

                    if (resultado !== "0") {
                        Swal.fire({
                            icon: "success",
                            title: "Éxito",
                            text: mensaje,
                            timer: 2000,
                            timerProgressBar: true,
                            showConfirmButton: false
                        });
                        setTimeout(cmCargaPadecimientosUsuario, 2100);
                    } else {
                        Swal.fire({ icon: "error", title: "Error", text: mensaje });
                    }
                }
            });
        }
    });
}

// ============================================
// PLIEGUES CUTÁNEOS
// ============================================

function togglePliegues() {
    var panel = $("#panelPliegues");
    var icono = $("#iconPliegues");
    var texto = $("#txtBtnPliegues");

    if (panel.is(":visible")) {
        panel.slideUp();
        icono.removeClass("fa-chevron-up").addClass("fa-chevron-down");
        texto.text("Expandir");
    } else {
        panel.slideDown();
        icono.removeClass("fa-chevron-down").addClass("fa-chevron-up");
        texto.text("Contraer");
        cargarPliegues();
    }
}

function guardarPliegue(tipo, inputId) {
    var valor = $("#" + inputId).val();

    if (!valor) {
        Swal.fire({
            icon: "warning",
            title: "Validación",
            text: "Ingrese un valor para el pliegue " + tipo
        });
        return;
    }

    jQuery.ajax({
        type: "POST",
        url: "frmCompletarMetricas.aspx/GuardarPliegue",
        data: JSON.stringify({ 'obj_Parametros_JS': [$.cookie("CONUNI"), tipo, valor] }),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        cache: false,
        success: function (msg) {
            var arreglo = msg.d.split("<SPLITER>");
            if (arreglo[0] !== "0") {
                $("#st" + tipo).html('<i class="fa fa-check-circle"></i> Guardado: ' + valor + ' mm');
                cargarPliegues();
            } else {
                Swal.fire({ icon: "error", title: "Error", text: arreglo[1] });
            }
        }
    });
}

function cargarPliegues() {
    jQuery.ajax({
        type: "POST",
        url: "frmCompletarMetricas.aspx/ObtenerPliegues",
        data: JSON.stringify({ 'obj_Parametros_JS': [$.cookie("CONUNI")] }),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        cache: false,
        success: function (msg) {
            var data;
            try { data = JSON.parse(msg.d); } catch (e) { data = []; }

            if (!data || data.length === 0) {
                $("#divResumenPliegues").hide();
                return;
            }

            var html = "";
            data.forEach(function (p) {
                html += "<tr>" +
                    "<td>" + p.Tipo + "</td>" +
                    "<td>" + p.Valor + " mm</td>" +
                    "<td style='text-align:center'>" +
                    "<i class='fa fa-trash-o' style='cursor:pointer;color:red;' " +
                    "onclick='eliminarPliegue(" + p.IdPliegue + ")'></i>" +
                    "</td></tr>";

                // Pre-llenar el input correspondiente
                var inputId = "pl" + p.Tipo;
                if ($("#" + inputId).length) {
                    $("#" + inputId).val(p.Valor);
                    $("#st" + p.Tipo).html(
                        '<i class="fa fa-check-circle"></i> Guardado: ' + p.Valor + ' mm'
                    );
                }
            });

            $("#tbodyPliegues").html(html);
            $("#divResumenPliegues").show();
        }
    });
}

function eliminarPliegue(idPliegue) {
    Swal.fire({
        title: '¿Eliminar pliegue?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
    }).then(function (result) {
        if (result.isConfirmed) {
            jQuery.ajax({
                type: "POST",
                url: "frmCompletarMetricas.aspx/EliminarPliegue",
                data: JSON.stringify({ 'obj_Parametros_JS': [idPliegue.toString()] }),
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                cache: false,
                success: function (msg) {
                    var arreglo = msg.d.split("<SPLITER>");
                    if (arreglo[0] !== "0") {
                        Swal.fire({
                            icon: "success", title: "Eliminado",
                            timer: 1500, showConfirmButton: false
                        });
                        cargarPliegues();
                    } else {
                        Swal.fire({ icon: "error", title: "Error", text: arreglo[1] });
                    }
                }
            });
        }
    });
}

// ============================================
// ANTROPOMETRÍA DE BRAZO / ESTIMACIONES
// ============================================
function toggleAntropometria() {
    var panel = $("#panelAntrop");
    var icono = $("#iconAntrop");
    var texto = $("#txtBtnAntrop");

    if (panel.is(":visible")) {
        panel.slideUp();
        icono.removeClass("fa-chevron-up").addClass("fa-chevron-down");
        texto.text("Expandir");
    } else {
        panel.slideDown();
        icono.removeClass("fa-chevron-down").addClass("fa-chevron-up");
        texto.text("Contraer");
    }
}

function calcularAntropometria() {
    var pb         = $("#antPB").val();
    var pantorrilla = $("#antPantorrilla").val();
    var ar         = $("#antAR").val();
    var etnia      = $("#antEtnia").val();

    if (!pb || !pantorrilla || !ar) {
        Swal.fire({
            icon: "warning",
            title: "Datos incompletos",
            text: "Ingrese Circunferencia de Brazo, Pantorrilla y Altura de Rodilla."
        });
        return;
    }
    if (!etnia) {
        Swal.fire({
            icon: "warning",
            title: "Etnia requerida",
            text: "Seleccione la etnia del paciente para aplicar la fórmula correcta."
        });
        return;
    }

    jQuery.ajax({
        type: "POST",
        url: "frmCompletarMetricas.aspx/CalcularGuardarAntropometria",
        data: JSON.stringify({
            'obj_Parametros_JS': [
                $.cookie("CONUNI"),
                pb, pantorrilla, ar, etnia
            ]
        }),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        cache: false,
        success: function (msg) {
            var arreglo = msg.d.split("<SPLITER>");
            if (arreglo[0] === "0") {
                Swal.fire({ icon: "error", title: "Error", text: arreglo[1] });
                return;
            }
            // [0] status [1] ATB [2] CMB [3] AMB [4] AGB
            // [5] PesoEst [6] TallaEst [7] Edad [8] PCT_usado
            var atb   = parseFloat(arreglo[1]);
            var cmb   = parseFloat(arreglo[2]);
            var amb   = parseFloat(arreglo[3]);
            var agb   = parseFloat(arreglo[4]);
            var peso  = parseFloat(arreglo[5]);
            var talla = parseFloat(arreglo[6]);
            var edad  = parseInt(arreglo[7]);
            var pct   = parseFloat(arreglo[8]);

            $("#antResATB").text(atb.toFixed(2));
            $("#antResCMB").text(cmb.toFixed(2));
            $("#antResAMB").text(amb.toFixed(2));
            $("#antResAGB").text(agb.toFixed(2));
            $("#antResPeso").text(peso > 0 ? peso.toFixed(2) : "N/A");
            $("#antResTalla").text(talla > 0 ? talla.toFixed(2) : "N/A");
            $("#antResEdad").text(edad > 0 ? edad : "-");
            $("#antResPCT").text(pct > 0 ? pct.toFixed(3) : "0 (no registrado)");

            $("#divResultadosAntrop").slideDown();

            // Guardar en variable global para el PDF
            _antrop = {
                pb: pb, pantorrilla: pantorrilla, ar: ar,
                atb: atb.toFixed(2), cmb: cmb.toFixed(2),
                amb: amb.toFixed(2), agb: agb.toFixed(2),
                pesoEstimado: peso > 0 ? peso.toFixed(2) : null,
                tallaEstimada: talla > 0 ? talla.toFixed(2) : null,
                edad: edad, pct: pct.toFixed(3)
            };

            Swal.fire({
                icon: "success",
                title: "Guardado",
                text: "Antropometría calculada y registrada correctamente.",
                timer: 1800,
                showConfirmButton: false
            });
        },
        error: function () {
            Swal.fire({ icon: "error", title: "Error", text: "No se pudo calcular la antropometría." });
        }
    });
}

function cargarAntropometria() {
    jQuery.ajax({
        type: "POST",
        url: "frmCompletarMetricas.aspx/ObtenerAntropometria",
        data: JSON.stringify({ 'obj_Parametros_JS': [$.cookie("CONUNI")] }),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        cache: false,
        success: function (msg) {
            if (!msg.d || msg.d === "vacio") return;

            var a = msg.d.split("<SPLITER>");
            // [0] PB  [1] Pantorrilla  [2] AR
            // [3] ATB [4] CMB [5] AMB [6] AGB
            // [7] PesoEst  [8] TallaEst
            var pb    = parseFloat(a[0]);
            var pant  = parseFloat(a[1]);
            var ar    = parseFloat(a[2]);
            var atb   = parseFloat(a[3]);
            var cmb   = parseFloat(a[4]);
            var amb   = parseFloat(a[5]);
            var agb   = parseFloat(a[6]);
            var peso  = parseFloat(a[7]);
            var talla = parseFloat(a[8]);

            // Restaurar inputs
            if (pb)   $("#antPB").val(pb.toFixed(1));
            if (pant) $("#antPantorrilla").val(pant.toFixed(1));
            if (ar)   $("#antAR").val(ar.toFixed(1));

            // Restaurar resultados
            $("#antResATB").text(atb.toFixed(2));
            $("#antResCMB").text(cmb.toFixed(2));
            $("#antResAMB").text(amb.toFixed(2));
            $("#antResAGB").text(agb.toFixed(2));
            $("#antResPeso").text(peso > 0 ? peso.toFixed(2) : "N/A");
            $("#antResTalla").text(talla > 0 ? talla.toFixed(2) : "N/A");
            $("#antResEdad").text("-");
            $("#antResPCT").text("-");

            $("#divResultadosAntrop").show();

            // Guardar en variable global para el PDF
            _antrop = {
                pb: pb, pantorrilla: pant, ar: ar,
                atb: atb.toFixed(2), cmb: cmb.toFixed(2),
                amb: amb.toFixed(2), agb: agb.toFixed(2),
                pesoEstimado: peso > 0 ? peso.toFixed(2) : null,
                tallaEstimada: talla > 0 ? talla.toFixed(2) : null
            };
        }
    });
}

// ============================================
// LIMPIAR TABS
// ============================================
function cmLimpiarMetricas() {
    var ids = [
        'txtPeso','txtEstatura','txtGrasag','txtGrasaPorcentaje','txtMusculog',
        'txtMasaOsea','txtAguaCorporal','txtEdadMetabolica','txtGrasaVisceral',
        'txtCircunferenciaCintura','txtCircunferenciaCadera','txtCircunferenciaMuneca',
        'txtPresionSistolica','txtPresionDiastolica','txtProximaCita',
        'txtObservaciones','txtRecomendaciones'
    ];
    ids.forEach(function(id) {
        var el = document.getElementById(id);
        if (el) el.value = '';
    });
    var imc = document.getElementById('lblIMC');
    if (imc) imc.textContent = '-';
}

function cmLimpiarHistoriaClinica() {
    var inputs = [
        'txtObjetivosClinicos','txtIngestaAgua','txtFrecuenciaAlcohol',
        'txtActividadFisica','txtMedicamentos','txtCirugiasRecientes',
        'txtAlimentosFavoritos','txtAlimentosNoGustan','txtIntolerancias','txtAlergias'
    ];
    inputs.forEach(function(id) {
        var el = document.getElementById(id);
        if (el) el.value = '';
    });
    var selects = ['cboCalidadSueno','cboFuncionIntestinal'];
    selects.forEach(function(id) {
        var el = document.getElementById(id);
        if (el) el.selectedIndex = 0;
    });
    ['chkFuma','chkConsumeAlcohol','chkEmbarazo','chkLactancia'].forEach(function(id) {
        var el = document.getElementById(id);
        if (el) el.checked = false;
    });
    var freq = document.getElementById('txtFrecuenciaAlcohol');
    if (freq) {
        var grp = freq.closest('.form-group');
        if (grp) grp.style.display = 'none';
    }
}

function cmLimpiarEvaluacion() {
    ['txtEvalDesayuno','txtEvalMeriendaAM','txtEvalAlmuerzo',
     'txtEvalMeriendaPM','txtEvalCena'].forEach(function(id) {
        var el = document.getElementById(id);
        if (el) el.value = '';
    });
}

function cmLimpiarAnalisis() {
    ['txtFechaAnalisis','txtHemoglobina','txtHematocrito',
     'txtColesterolTotal','txtHDL','txtLDL','txtTrigliceridos',
     'txtGlicemia','txtAcidoUrico','txtAlbumina','txtCreatinina',
     'txtTSH','txtT4','txtT3','txtVitaminaD','txtVitaminaB12',
     'txtObservacionesAnalisis'].forEach(function(id) {
        var el = document.getElementById(id);
        if (el) el.value = '';
    });
}
