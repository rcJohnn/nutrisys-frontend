// ============================================
// DETALLE CONSULTA — JS
// ============================================

$(document).ready(function () {
    var PageName = window.location.pathname.split('/').pop();
    if (PageName == 'frmDetalleConsulta.aspx') {
        cargarDetalle();
    }
});

// ============================================
// ESTADO → BADGE
// ============================================
var DC_ESTADO_MAP = {
    'C': { label: 'Completada',  cls: 'dc-badge-completada'  },
    'P': { label: 'Pendiente',   cls: 'dc-badge-pendiente'   },
    'X': { label: 'Cancelada',   cls: 'dc-badge-cancelada'   },
    'N': { label: 'No Asistió',  cls: 'dc-badge-noasistio'   }
};

// ============================================
// CARGAR DETALLE DESDE COOKIE CONUNI
// ============================================
function cargarDetalle() {
    var idConsulta = $.cookie("CONUNI");

    if (!idConsulta || idConsulta == "0" || idConsulta == "") {
        $("#dcLoading").hide();
        Swal.fire({
            icon: "warning",
            title: "Sin consulta seleccionada",
            text: "No se encontró una consulta activa. Volvé al listado.",
            confirmButtonText: "Ir al listado"
        }).then(function () {
            location.href = "frmConsultaConsultas.aspx";
        });
        return;
    }

    jQuery.ajax({
        type: "POST",
        url: "frmDetalleConsulta.aspx/ObtenerDetalleConsulta",
        data: JSON.stringify({ 'obj_Parametros_JS': [idConsulta] }),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        cache: false,
        success: function (msg) {
            var raw = msg.d;

            if (!raw || raw === "{}" || raw.indexOf("0<SPLITER>") === 0) {
                $("#dcLoading").hide();
                var errMsg = raw.indexOf("0<SPLITER>") === 0
                    ? raw.split("<SPLITER>")[1]
                    : "No se encontraron datos para esta consulta.";
                Swal.fire({ icon: "error", title: "Error", text: errMsg });
                return;
            }

            var d;
            try { d = JSON.parse(raw); } catch (e) {
                $("#dcLoading").hide();
                Swal.fire({ icon: "error", title: "Error", text: "Respuesta inválida del servidor." });
                return;
            }

            poblarDetalle(d);
            cargarDistribucionMacros();
        },
        error: function () {
            $("#dcLoading").hide();
            Swal.fire({ icon: "error", title: "Error de conexión", text: "No se pudo cargar el detalle." });
        }
    });
}

// ============================================
// POBLAR TODA LA VISTA CON LOS DATOS
// ============================================
function poblarDetalle(d) {

    // — Encabezado —
    $("#dcFechaRegistro").text(d.fechaRegistro ? "Registrada el " + d.fechaRegistro : "");

    // Badge de estado
    var estadoInfo = DC_ESTADO_MAP[d.estado] || { label: d.estado, cls: 'dc-badge-completada' };
    var badge = $("#dcBadgeEstado");
    badge.text(estadoInfo.label);
    badge.attr("class", "dc-badge " + estadoInfo.cls);

    // — Paciente —
    dcSet("dcNombrePaciente", d.nombrePaciente);
    dcSet("dcCedula", d.cedula);
    dcSet("dcCorreoPaciente", d.correoUsuario);

    // — Médico y cita —
    dcSet("dcNombreMedico", d.nombreMedico);
    dcSet("dcFechaCita", d.fechaCita);
    dcSet("dcDuracion", d.duracion);
    dcSet("dcMotivo", d.motivo || "Sin motivo registrado");

    // — Métricas principales —
    dcSet("dcPeso", d.peso !== null ? parseFloat(d.peso).toFixed(2) : "-");
    dcSet("dcEstatura", d.estatura !== null ? parseFloat(d.estatura).toFixed(2) : "-");
    dcSet("dcIMC", d.imc !== null ? parseFloat(d.imc).toFixed(1) : "-");

    if (d.sistolica !== null && d.diastolica !== null) {
        document.getElementById("dcPresion").textContent = parseInt(d.sistolica) + " / " + parseInt(d.diastolica);
    } else {
        document.getElementById("dcPresion").textContent = "-";
    }

    // IMC semáforo visual
    if (d.imc) {
        var imc = parseFloat(d.imc);
        var imcEl = document.getElementById("dcIMC").closest(".dc-metric-box");
        if (imc < 18.5) imcEl.setAttribute("data-imc", "bajo");
        else if (imc < 25) imcEl.setAttribute("data-imc", "normal");
        else if (imc < 30) imcEl.setAttribute("data-imc", "sobrepeso");
        else imcEl.setAttribute("data-imc", "obesidad");
    }

    // — Composición corporal —
    dcSet("dcGrasaG", d.grasaG !== null ? parseFloat(d.grasaG).toFixed(2) : "-");
    dcSet("dcMusculoG", d.musculoG !== null ? parseFloat(d.musculoG).toFixed(2) : "-");
    dcSet("dcCintura", d.cintura !== null ? parseFloat(d.cintura).toFixed(2) : "-");
    dcSet("dcCadera", d.cadera !== null ? parseFloat(d.cadera).toFixed(2) : "-");

    // Métricas opcionales — mostrar solo si tienen dato
    if (d.grasaPct !== null)       { dcShow("dcBoxGrasaPct");     dcSet("dcGrasaPct", parseFloat(d.grasaPct).toFixed(2)); }
    if (d.masaOsea !== null)       { dcShow("dcBoxMasaOsea");     dcSet("dcMasaOsea", parseFloat(d.masaOsea).toFixed(2)); }
    if (d.grasaVisceral !== null)  { dcShow("dcBoxGrasaVisceral"); dcSet("dcGrasaVisceral", parseInt(d.grasaVisceral)); }
    if (d.aguaPct !== null)        { dcShow("dcBoxAguaPct");       dcSet("dcAguaPct", parseFloat(d.aguaPct).toFixed(2)); }
    if (d.edadMetabolica !== null) { dcShow("dcBoxEdadMet");       dcSet("dcEdadMetabolica", parseInt(d.edadMetabolica)); }
    if (d.muneca !== null)         { dcShow("dcBoxMuneca");        dcSet("dcMuneca", parseFloat(d.muneca).toFixed(2)); }

    // — Notas clínicas —
    if (d.observaciones) {
        document.getElementById("dcObservaciones").innerHTML = d.observaciones.replace(/\\n/g, '<br>');
    }
    if (d.recomendaciones) {
        document.getElementById("dcRecomendaciones").innerHTML = d.recomendaciones.replace(/\\n/g, '<br>');
    }

    // — Próxima cita —
    if (d.proximaCita) {
        $("#dcProximaCitaCard").show();
        dcSet("dcProximaCita", d.proximaCita);
    }

    // — Antropometría de brazo / estimaciones —
    if (d.atb !== null && d.atb !== undefined) {
        $("#dcSectionAntrop").show();
        dcSet("dcCircBrazo",     d.circBrazo     !== null ? parseFloat(d.circBrazo).toFixed(2)     : "-");
        dcSet("dcATB",           d.atb           !== null ? parseFloat(d.atb).toFixed(2)           : "-");
        dcSet("dcCMB",           d.cmb           !== null ? parseFloat(d.cmb).toFixed(2)           : "-");
        dcSet("dcAMB",           d.amb           !== null ? parseFloat(d.amb).toFixed(2)           : "-");
        dcSet("dcAGB",           d.agb           !== null ? parseFloat(d.agb).toFixed(2)           : "-");
        dcSet("dcAlturaRodilla", d.alturaRodilla !== null ? parseFloat(d.alturaRodilla).toFixed(2) : "-");

        if (d.pesoEstimado !== null && parseFloat(d.pesoEstimado) > 0) {
            $("#dcBoxPesoEstimado").show();
            dcSet("dcPesoEstimado", parseFloat(d.pesoEstimado).toFixed(2));
        }
        if (d.tallaEstimada !== null && parseFloat(d.tallaEstimada) > 0) {
            $("#dcBoxTallaEstimada").show();
            dcSet("dcTallaEstimada", parseFloat(d.tallaEstimada).toFixed(2));
        }
    }

    // Mostrar contenido, ocultar loading
    $("#dcLoading").hide();
    $("#dcContenido").fadeIn(300);
}

// ============================================
// CARGAR DISTRIBUCIÓN DE MACROS
// ============================================
function cargarDistribucionMacros() {
    var idConsulta = $.cookie("CONUNI");

    jQuery.ajax({
        type: "POST",
        url: "frmDetalleConsulta.aspx/ObtenerDistribucionMacros",
        data: JSON.stringify({ 'obj_Parametros_JS': [idConsulta] }),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        cache: false,
        success: function (msg) {
            var raw = msg.d;
            if (!raw || raw === "{}") {
                dcDistribucionVacia();
                return;
            }
            var dist;
            try { dist = JSON.parse(raw); } catch (e) {
                dcDistribucionVacia();
                return;
            }
            poblarDistribucion(dist);
        },
        error: function () {
            dcDistribucionVacia();
        }
    });
}

// ============================================
// SIN DATOS DE DISTRIBUCIÓN — estado vacío
// ============================================
function dcDistribucionVacia() {
    var empty   = document.getElementById("dcDistribucionEmpty");
    var content = document.getElementById("dcDistribucionContent");
    if (empty)   empty.style.display   = "";
    if (content) content.style.display = "none";
}

// ============================================
// POBLAR DISTRIBUCIÓN DE MACROS (evaluación cuantitativa)
// ============================================
function poblarDistribucion(dist) {
    var empty   = document.getElementById("dcDistribucionEmpty");
    var content = document.getElementById("dcDistribucionContent");
    if (empty)   empty.style.display   = "none";
    if (content) content.style.display = "";

    // ── Fórmula (etiqueta legible) ──────────────────
    var _formulaLabels = {
        HarrisBenedict: "Harris-Benedict",
        FAO_OMS:        "FAO/OMS (Schofield)",
        Mifflin:        "Mifflin-St Jeor",
        Cunningham:     "Cunningham",
        Valencia:       "Valencia Mexicana"
    };
    var formulaLabel = _formulaLabels[dist.formulaUsada] || (dist.formulaUsada || "-");
    dcSet("dcFormulaUsada", formulaLabel);

    // ── REE ─────────────────────────────────────────
    var ree = dist.ree !== null ? parseFloat(dist.ree) : 0;
    dcSet("dcREE", ree > 0 ? ree.toFixed(1) : "-");

    // ── Totales en g ────────────────────────────────
    var tCHO   = dist.totalCHO   !== null ? parseFloat(dist.totalCHO)   : 0;
    var tProt  = dist.totalProt  !== null ? parseFloat(dist.totalProt)  : 0;
    var tGrasa = dist.totalGrasa !== null ? parseFloat(dist.totalGrasa) : 0;
    var tFibra = dist.totalFibra !== null ? parseFloat(dist.totalFibra) : 0;

    dcSet("dcTotalCHO",   tCHO   > 0 ? tCHO.toFixed(1)   : "-");
    dcSet("dcTotalProt",  tProt  > 0 ? tProt.toFixed(1)   : "-");
    dcSet("dcTotalGrasa", tGrasa > 0 ? tGrasa.toFixed(1)  : "-");
    dcSet("dcTotalFibra", tFibra > 0 ? tFibra.toFixed(1)  : "-");

    // ── Kcal por macro (CHO=4, Prot=4, Grasa=9) ─────
    var kCHO   = tCHO   * 4;
    var kProt  = tProt  * 4;
    var kGrasa = tGrasa * 9;
    var kTotal = kCHO + kProt + kGrasa;

    dcSet("dcCHOkcal",   kCHO   > 0 ? Math.round(kCHO)   : "-");
    dcSet("dcProtkcal",  kProt  > 0 ? Math.round(kProt)   : "-");
    dcSet("dcGrasakcal", kGrasa > 0 ? Math.round(kGrasa)  : "-");

    // ── % de REE por macro ───────────────────────────
    var base = ree > 0 ? ree : kTotal;
    if (base > 0) {
        dcSet("dcCHOpct",   kCHO   > 0 ? Math.round(kCHO   / base * 100) + "%" : "-");
        dcSet("dcProtpct",  kProt  > 0 ? Math.round(kProt  / base * 100) + "%" : "-");
        dcSet("dcGrasapct", kGrasa > 0 ? Math.round(kGrasa / base * 100) + "%" : "-");
    }

    // ── Filas de comida ──────────────────────────────
    var comidas = [
        {
            row:  "dcRowDesayuno",
            cho:  dist.desayunoCHO,   prot:  dist.desayunoProt,
            gras: dist.desayunoGrasa, fibra: dist.desayunoFibra,
            ids:  ["dcDesayunoCHO","dcDesayunoProt","dcDesayunoGrasa","dcDesayunoFibra","dcDesayunoKcal","dcDesayunoPct"]
        },
        {
            row:  "dcRowMeriendaAM",
            cho:  dist.meriendaAMCHO,   prot:  dist.meriendaAMProt,
            gras: dist.meriendaAMGrasa, fibra: dist.meriendaAMFibra,
            ids:  ["dcMeriendaAMCHO","dcMeriendaAMProt","dcMeriendaAMGrasa","dcMeriendaAMFibra","dcMeriendaAMKcal","dcMeriendaAMPct"]
        },
        {
            row:  "dcRowAlmuerzo",
            cho:  dist.almuerzoCHO,   prot:  dist.almuerzoProt,
            gras: dist.almuerzoGrasa, fibra: dist.almuerzoFibra,
            ids:  ["dcAlmuerzoCHO","dcAlmuerzoProt","dcAlmuerzoGrasa","dcAlmuerzoFibra","dcAlmuerzoKcal","dcAlmuerzoPct"]
        },
        {
            row:  "dcRowMeriendaPM",
            cho:  dist.meriendaPMCHO,   prot:  dist.meriendaPMProt,
            gras: dist.meriendaPMGrasa, fibra: dist.meriendaPMFibra,
            ids:  ["dcMeriendaPMCHO","dcMeriendaPMProt","dcMeriendaPMGrasa","dcMeriendaPMFibra","dcMeriendaPMKcal","dcMeriendaPMPct"]
        },
        {
            row:  "dcRowCena",
            cho:  dist.cenaCHO,   prot:  dist.cenaProt,
            gras: dist.cenaGrasa, fibra: dist.cenaFibra,
            ids:  ["dcCenaCHO","dcCenaProt","dcCenaGrasa","dcCenaFibra","dcCenaKcal","dcCenaPct"]
        }
    ];

    var sumCHO = 0, sumProt = 0, sumGrasa = 0, sumFibra = 0, sumKcal = 0;

    for (var i = 0; i < comidas.length; i++) {
        var c   = comidas[i];
        var cho   = c.cho   !== null ? parseFloat(c.cho)   : 0;
        var prot  = c.prot  !== null ? parseFloat(c.prot)  : 0;
        var gras  = c.gras  !== null ? parseFloat(c.gras)  : 0;
        var fibra = c.fibra !== null ? parseFloat(c.fibra) : 0;
        var kcal  = (cho * 4) + (prot * 4) + (gras * 9);

        // Ocultar fila si no tiene datos (igual que el email)
        var rowEl = document.getElementById(c.row);
        if (cho + prot + gras === 0) {
            if (rowEl) rowEl.style.display = "none";
            continue;
        }
        if (rowEl) rowEl.style.display = "";

        dcSet(c.ids[0], cho.toFixed(1));
        dcSet(c.ids[1], prot.toFixed(1));
        dcSet(c.ids[2], gras.toFixed(1));
        dcSet(c.ids[3], fibra > 0 ? fibra.toFixed(1) : "-");
        dcSet(c.ids[4], Math.round(kcal).toString());
        dcSet(c.ids[5], base > 0 ? Math.round(kcal / base * 100) + "%" : "-");

        sumCHO   += cho;
        sumProt  += prot;
        sumGrasa += gras;
        sumFibra += fibra;
        sumKcal  += kcal;
    }

    // ── Fila Total ───────────────────────────────────
    dcSet("dcFootCHO",   sumCHO   > 0 ? sumCHO.toFixed(1)   : "-");
    dcSet("dcFootProt",  sumProt  > 0 ? sumProt.toFixed(1)   : "-");
    dcSet("dcFootGrasa", sumGrasa > 0 ? sumGrasa.toFixed(1)  : "-");
    dcSet("dcFootFibra", sumFibra > 0 ? sumFibra.toFixed(1)  : "-");
    dcSet("dcFootKcal",  sumKcal  > 0 ? Math.round(sumKcal).toString() : "-");
}

// ============================================
// HELPERS
// ============================================
function dcSet(id, value) {
    var el = document.getElementById(id);
    if (el) el.textContent = (value !== null && value !== undefined && value !== "") ? value : "-";
}

function dcShow(id) {
    var el = document.getElementById(id);
    if (el) el.style.display = "";
}
