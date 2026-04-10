// ============================================
// VARIABLES GLOBALES
// ============================================
var ca_IdMedico = 0;
var ca_AutoAgendamiento = false;
var ca_DiasNombres = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
var ca_HorarioActual = []; // array de objetos {dia, horaInicio, horaFin, activo}

var ca_ComidasDef = [
    { tipo: 'DE', nombre: 'Desayuno',    icon: 'fa-coffee',      defaultIni: '07:00', defaultFin: '07:30' },
    { tipo: 'MA', nombre: 'Merienda AM', icon: 'fa-lemon-o',     defaultIni: '10:00', defaultFin: '10:30' },
    { tipo: 'AL', nombre: 'Almuerzo',    icon: 'fa-cutlery',     defaultIni: '12:00', defaultFin: '13:00' },
    { tipo: 'MP', nombre: 'Merienda PM', icon: 'fa-lemon-o',     defaultIni: '16:00', defaultFin: '16:30' },
    { tipo: 'CE', nombre: 'Cena',        icon: 'fa-moon-o',      defaultIni: '19:00', defaultFin: '20:00' }
];

// ============================================
// DOCUMENT READY
// ============================================
$(document).ready(function () {
    var PageName = window.location.pathname.split('/').pop();

    if (PageName == 'frmConfigAgenda.aspx') {
        ca_IdMedico = 0;
        var tipo = $.cookie("GLBTYP");

        if (tipo === "M") {
            // Es médico — usa su propio ID de la sesión (GLBUNI = Id_Medico para tipo M)
            ca_IdMedico = parseInt($.cookie("GLBUNI")) || 0;
            $("#lblNombreMedico").text("Dr(a). " + ($.cookie("GLBDSC") || ""));
            renderizarDiasGrid();
            renderizarComidasGrid();
            cargarConfigMedico();
        } else {
            // Es admin — usa el médico seleccionado desde el listado
            ca_IdMedico = parseInt($.cookie("MEDUNI")) || 0;
            $("#divSelectorMedico").show();
            cargarComboMedicos(function () {
                if (ca_IdMedico > 0) {
                    $("#cboMedicoSelector").val(ca_IdMedico);
                    var nombre = $("#cboMedicoSelector option:selected").text();
                    $("#lblNombreMedico").text("Dr(a). " + nombre);
                    renderizarDiasGrid();
                    renderizarComidasGrid();
                    cargarConfigMedico();
                }
            });
        }
    }
});

// ============================================
// CARGAR COMBO DE MÉDICOS (admin)
// ============================================
function cargarComboMedicos(callback) {
    jQuery.ajax({
        type: "POST",
        url: "frmConfigAgenda.aspx/CargarListaMedicos",
        data: JSON.stringify({ 'obj_Parametros_JS': [] }),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        cache: false,
        success: function (msg) {
            if (msg.d) {
                $("#cboMedicoSelector").html(msg.d);
            }
            if (typeof callback === "function") callback();
        }
    });
}

// ============================================
// CAMBIAR MÉDICO SELECCIONADO (admin)
// ============================================
function cambiarMedico() {
    var idSel = parseInt($("#cboMedicoSelector").val()) || 0;
    if (idSel === 0) {
        Swal.fire({ icon: "warning", title: "Validación", text: "Seleccione un médico." });
        return;
    }
    ca_IdMedico = idSel;
    $.cookie('MEDUNI', idSel.toString(), { expires: 1, path: '/', domain: g_Dominio });

    var nombre = $("#cboMedicoSelector option:selected").text();
    $("#lblNombreMedico").text("Dr(a). " + nombre);

    // Limpiar y recargar días + tiempos de comida
    renderizarDiasGrid();
    renderizarComidasGrid();
    cargarConfigMedico();
}

// ============================================
// RENDERIZAR GRID DE DÍAS (estructura HTML)
// ============================================
function renderizarDiasGrid() {
    var html = '';
    for (var d = 0; d < 7; d++) {
        html += '<div class="dia-row" id="diaRow' + d + '">' +
            '<div class="dia-nombre">' +
            '<span>' + ca_DiasNombres[d] + '</span>' +
            '<label class="form-switch-custom" onclick="toggleDia(' + d + ')">' +
            '<div class="switch-track" id="switchDia' + d + '">' +
            '<div class="switch-thumb"></div></div>' +
            '</label>' +
            '</div>' +
            '<div class="dia-horas">' +
            '<label>Desde</label>' +
            '<input type="time" id="diaInicio' + d + '" value="08:00" disabled>' +
            '<label>Hasta</label>' +
            '<input type="time" id="diaFin' + d + '"    value="17:00" disabled>' +
            '</div>' +
            '</div>';
    }
    $('#diasGrid').html(html);
}

// ============================================
// CARGAR CONFIGURACIÓN DEL MÉDICO
// ============================================
function cargarConfigMedico() {
    jQuery.ajax({
        type: "POST",
        url: "frmConfigAgenda.aspx/CargarConfigMedico",
        data: JSON.stringify({ 'obj_Parametros_JS': [ca_IdMedico.toString()] }),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        cache: false,
        success: function (msg) {
            var a = msg.d.split("<SPLITER>");
            if (a[0] !== "1") {
                // Primera vez — valores por defecto ya están en el HTML
                // Igual cargamos horario y bloqueos
                cargarHorarioSemanal();
                cargarTiemposComida();
                cargarBloqueos();
                cargarPenalizaciones();
                return;
            }

            // [1] PermiteAuto  [2] SlotMin  [3] AnticipMin
            // [4] MaxCitas     [5] MaxCancelaciones  [6] PeriodoPenal  [7] MesesInact
            var permiteAuto = a[1] === "True" || a[1] === "1";

            if (a[2]) $("#txtSlotMin").val(a[2]);
            if (a[3]) $("#txtAnticipacion").val(a[3]);
            if (a[4]) $("#txtMaxCitas").val(a[4]);
            if (a[5]) $("#txtMaxCancelaciones").val(a[5]);
            if (a[6]) $("#txtPeriodoPenal").val(a[6]);
            if (a[7]) $("#txtMesesInactividad").val(a[7]);

            // Aplicar estado del toggle
            ca_AutoAgendamiento = permiteAuto;
            actualizarUIAutoagendamiento(permiteAuto);

            cargarHorarioSemanal();
            cargarTiemposComida();
            cargarBloqueos();
            cargarPenalizaciones();
        }
    });
}

// ============================================
// TOGGLE AUTOAGENDAMIENTO
// ============================================
function toggleAutoagendamiento() {
    ca_AutoAgendamiento = !ca_AutoAgendamiento;
    actualizarUIAutoagendamiento(ca_AutoAgendamiento);
}

function actualizarUIAutoagendamiento(activo) {
    var track = $("#switchAutoagendamiento");
    var lbl = $("#lblAutoagendamiento");

    if (activo) {
        track.addClass("on");
        lbl.text("Activado — los usuarios pueden autoagendar");
        $("#divConfigNumerica").slideDown();
        $("#divHorarioCard").slideDown();
        $("#divTiemposComidaCard").slideDown();
        $("#divBloqueosCard").slideDown();
        $("#divPenalizacionesCard").slideDown();
    } else {
        track.removeClass("on");
        lbl.text("Desactivado — el médico gestiona sus citas");
        $("#divConfigNumerica").slideUp();
        $("#divHorarioCard").slideUp();
        $("#divTiemposComidaCard").slideUp();
        $("#divBloqueosCard").slideUp();
        $("#divPenalizacionesCard").slideUp();
    }
}

// ============================================
// TOGGLE DÍA INDIVIDUAL
// ============================================
function toggleDia(dia) {
    var row = $("#diaRow" + dia);
    var track = $("#switchDia" + dia);
    var activo = !track.hasClass("on");

    if (activo) {
        track.addClass("on");
        row.addClass("activo");
        $("#diaInicio" + dia).prop("disabled", false);
        $("#diaFin" + dia).prop("disabled", false);
    } else {
        track.removeClass("on");
        row.removeClass("activo");
        $("#diaInicio" + dia).prop("disabled", true);
        $("#diaFin" + dia).prop("disabled", true);
    }
}

// ============================================
// CARGAR HORARIO SEMANAL
// ============================================
function cargarHorarioSemanal() {
    jQuery.ajax({
        type: "POST",
        url: "frmConfigAgenda.aspx/CargarHorarioSemanal",
        data: JSON.stringify({ 'obj_Parametros_JS': [ca_IdMedico.toString()] }),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        cache: false,
        success: function (msg) {
            var data;
            try { data = JSON.parse(msg.d); } catch (e) { data = []; }

            ca_HorarioActual = data;

            data.forEach(function (h) {
                var d = h.dia;
                if (h.activo) {
                    $("#switchDia" + d).addClass("on");
                    $("#diaRow" + d).addClass("activo");
                    $("#diaInicio" + d).val(h.horaInicio).prop("disabled", false);
                    $("#diaFin" + d).val(h.horaFin).prop("disabled", false);
                }
            });
        }
    });
}

// ============================================
// GUARDAR HORARIO SEMANAL (todos los días)
// ============================================
function guardarHorarioSemanal() {
    var promesas = [];
    var errores = [];

    for (var d = 0; d < 7; d++) {
        var activo = $("#switchDia" + d).hasClass("on") ? "1" : "0";
        var horaIni = $("#diaInicio" + d).val() || "08:00";
        var horaFin = $("#diaFin" + d).val() || "17:00";

        // Validar horas si está activo
        if (activo === "1" && horaIni >= horaFin) {
            errores.push(ca_DiasNombres[d] + ": la hora de inicio debe ser menor a la de fin.");
            continue;
        }

        promesas.push(guardarHorarioDia(d, horaIni, horaFin, activo));
    }

    if (errores.length > 0) {
        Swal.fire({
            icon: "warning", title: "Validación",
            html: errores.join("<br>")
        });
        return;
    }

    Promise.all(promesas).then(function () {
        Swal.fire({
            icon: "success", title: "Éxito",
            text: "Horario semanal guardado correctamente.",
            timer: 2000, showConfirmButton: false
        });
    });
}

function guardarHorarioDia(dia, horaIni, horaFin, activo) {
    return new Promise(function (resolve) {
        jQuery.ajax({
            type: "POST",
            url: "frmConfigAgenda.aspx/GuardarHorarioDia",
            data: JSON.stringify({
                'obj_Parametros_JS': [
                    ca_IdMedico.toString(),
                    dia.toString(),
                    horaIni, horaFin, activo
                ]
            }),
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            cache: false,
            success: function () { resolve(); },
            error: function () { resolve(); }
        });
    });
}

// ============================================
// RENDERIZAR GRID DE TIEMPOS DE COMIDA
// ============================================
function renderizarComidasGrid() {
    var html = '';
    for (var i = 0; i < ca_ComidasDef.length; i++) {
        var c = ca_ComidasDef[i];
        html += '<div class="comida-row" id="comidaRow' + c.tipo + '">' +
            '<div class="comida-nombre">' +
            '<span><i class="fa ' + c.icon + '"></i> ' + c.nombre + '</span>' +
            '<label class="form-switch-custom" onclick="toggleComida(\'' + c.tipo + '\')">' +
            '<div class="switch-track" id="switchComida' + c.tipo + '">' +
            '<div class="switch-thumb"></div></div>' +
            '</label>' +
            '</div>' +
            '<div class="dia-horas">' +
            '<label>Desde</label>' +
            '<input type="time" id="comidaInicio' + c.tipo + '" value="' + c.defaultIni + '" disabled>' +
            '<label>Hasta</label>' +
            '<input type="time" id="comidaFin' + c.tipo + '"    value="' + c.defaultFin + '" disabled>' +
            '</div>' +
            '</div>';
    }
    $('#comidasGrid').html(html);
}

// ============================================
// TOGGLE TIEMPO DE COMIDA INDIVIDUAL
// ============================================
function toggleComida(tipo) {
    var row   = $("#comidaRow" + tipo);
    var track = $("#switchComida" + tipo);
    var activo = !track.hasClass("on");

    if (activo) {
        track.addClass("on");
        row.addClass("activo");
        $("#comidaInicio" + tipo).prop("disabled", false);
        $("#comidaFin" + tipo).prop("disabled", false);
    } else {
        track.removeClass("on");
        row.removeClass("activo");
        $("#comidaInicio" + tipo).prop("disabled", true);
        $("#comidaFin" + tipo).prop("disabled", true);
    }
}

// ============================================
// CARGAR TIEMPOS DE COMIDA
// ============================================
function cargarTiemposComida() {
    jQuery.ajax({
        type: "POST",
        url: "frmConfigAgenda.aspx/CargarTiemposComida",
        data: JSON.stringify({ 'obj_Parametros_JS': [ca_IdMedico.toString()] }),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        cache: false,
        success: function (msg) {
            var data;
            try { data = JSON.parse(msg.d); } catch (e) { data = []; }

            data.forEach(function (tc) {
                var t = tc.tipo;
                if (tc.activo) {
                    $("#switchComida" + t).addClass("on");
                    $("#comidaRow" + t).addClass("activo");
                    $("#comidaInicio" + t).val(tc.horaInicio).prop("disabled", false);
                    $("#comidaFin" + t).val(tc.horaFin).prop("disabled", false);
                }
            });
        }
    });
}

// ============================================
// GUARDAR TIEMPOS DE COMIDA (todos)
// ============================================
function guardarTiemposComida() {
    var promesas = [];
    var errores  = [];

    for (var i = 0; i < ca_ComidasDef.length; i++) {
        var c      = ca_ComidasDef[i];
        var activo = $("#switchComida" + c.tipo).hasClass("on") ? "1" : "0";
        var hIni   = $("#comidaInicio" + c.tipo).val() || c.defaultIni;
        var hFin   = $("#comidaFin"    + c.tipo).val() || c.defaultFin;

        if (activo === "1" && hIni >= hFin) {
            errores.push(c.nombre + ": la hora de inicio debe ser menor a la de fin.");
            continue;
        }

        promesas.push(guardarTiempoComidaUno(c.tipo, hIni, hFin, activo));
    }

    if (errores.length > 0) {
        Swal.fire({ icon: "warning", title: "Validación", html: errores.join("<br>") });
        return;
    }

    Promise.all(promesas).then(function () {
        Swal.fire({
            icon: "success", title: "Éxito",
            text: "Tiempos de comida guardados correctamente.",
            timer: 2000, showConfirmButton: false
        });
    });
}

function guardarTiempoComidaUno(tipo, hIni, hFin, activo) {
    return new Promise(function (resolve) {
        jQuery.ajax({
            type: "POST",
            url: "frmConfigAgenda.aspx/GuardarTiempoComida",
            data: JSON.stringify({
                'obj_Parametros_JS': [
                    ca_IdMedico.toString(),
                    tipo, hIni, hFin, activo
                ]
            }),
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            cache: false,
            success: function () { resolve(); },
            error: function () { resolve(); }
        });
    });
}

// ============================================
// TOGGLE TIPO BLOQUEO (Día / Horas)
// ============================================
function toggleTipoBloqueo() {
    var tipo = $("#cboTipoBloqueo").val();

    if (tipo === "H") {
        $("#divBloqueoFechaFin").addClass("d-none");
        $("#divBloqueoHoras").removeClass("d-none");
    } else {
        $("#divBloqueoFechaFin").removeClass("d-none");
        $("#divBloqueoHoras").addClass("d-none");
    }
}

// ============================================
// GUARDAR BLOQUEO
// ============================================
function guardarBloqueo() {
    var tipo = $("#cboTipoBloqueo").val();
    var fIni = $("#txtBloqueoFechaInicio").val();
    var motivo = $("#txtBloqueoMotivo").val() || "";

    if (!fIni) {
        Swal.fire({
            icon: "warning", title: "Validación",
            text: "Ingresá la fecha de inicio del bloqueo."
        });
        return;
    }

    var fechaIni, fechaFin;

    if (tipo === "D") {
        var fFin = $("#txtBloqueoFechaFin").val() || fIni;
        fechaIni = fIni + "T00:00:00";
        fechaFin = fFin + "T23:59:59";
    } else {
        var hIni = $("#txtBloqueoHoraInicio").val();
        var hFin = $("#txtBloqueoHoraFin").val();

        if (!hIni || !hFin) {
            Swal.fire({
                icon: "warning", title: "Validación",
                text: "Ingresá la hora de inicio y fin del bloqueo."
            });
            return;
        }
        if (hIni >= hFin) {
            Swal.fire({
                icon: "warning", title: "Validación",
                text: "La hora de inicio debe ser menor a la hora de fin."
            });
            return;
        }
        fechaIni = fIni + "T" + hIni + ":00";
        fechaFin = fIni + "T" + hFin + ":00";
    }

    jQuery.ajax({
        type: "POST",
        url: "frmConfigAgenda.aspx/GuardarBloqueo",
        data: JSON.stringify({
            'obj_Parametros_JS': [
                ca_IdMedico.toString(), tipo,
                fechaIni, fechaFin, motivo,
                $.cookie("GLBUNI")
            ]
        }),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        cache: false,
        success: function (msg) {
            var a = msg.d.split("<SPLITER>");
            if (a[0] !== "0") {
                Swal.fire({
                    icon: "success", title: "Éxito", text: a[1],
                    timer: 1800, showConfirmButton: false
                });
                // Limpiar formulario
                $("#txtBloqueoFechaInicio").val("");
                $("#txtBloqueoFechaFin").val("");
                $("#txtBloqueoHoraInicio").val("");
                $("#txtBloqueoHoraFin").val("");
                $("#txtBloqueoMotivo").val("");
                cargarBloqueos();
            } else {
                Swal.fire({ icon: "error", title: "Error", text: a[1] });
            }
        }
    });
}

// ============================================
// CARGAR BLOQUEOS
// ============================================
function cargarBloqueos() {
    jQuery.ajax({
        type: "POST",
        url: "frmConfigAgenda.aspx/CargarBloqueos",
        data: JSON.stringify({ 'obj_Parametros_JS': [ca_IdMedico.toString()] }),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        cache: false,
        success: function (msg) {
            var res = msg.d;
            if (!res || res.indexOf("Error") > -1) {
                $("#divListaBloqueos").html(
                    "<p class='text-danger text-center'>Error al cargar bloqueos.</p>"
                );
            } else if (res === "vacio") {
                $("#divListaBloqueos").html(
                    "<p class='text-muted text-center' style='font-size:.82rem;'>" +
                    "<i class='fa fa-check-circle text-success'></i> " +
                    "No hay bloqueos activos configurados.</p>"
                );
            } else {
                $("#divListaBloqueos").html(res);
            }
        }
    });
}

// ============================================
// ELIMINAR BLOQUEO
// ============================================
function eliminarBloqueo(id) {
    Swal.fire({
        title: '¿Eliminar bloqueo?',
        icon: 'warning', showCancelButton: true,
        confirmButtonColor: '#d33', cancelButtonColor: '#6c757d',
        confirmButtonText: 'Sí, eliminar', cancelButtonText: 'Cancelar'
    }).then(function (r) {
        if (r.isConfirmed) {
            jQuery.ajax({
                type: "POST",
                url: "frmConfigAgenda.aspx/EliminarBloqueo",
                data: JSON.stringify({ 'obj_Parametros_JS': [id.toString()] }),
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                cache: false,
                success: function (msg) {
                    var a = msg.d.split("<SPLITER>");
                    if (a[0] === "1") {
                        Swal.fire({
                            icon: "success", title: "Eliminado",
                            timer: 1500, showConfirmButton: false
                        });
                        cargarBloqueos();
                    } else {
                        Swal.fire({ icon: "error", title: "Error", text: a[1] });
                    }
                }
            });
        }
    });
}

// ============================================
// CARGAR PENALIZACIONES
// ============================================
function cargarPenalizaciones() {
    jQuery.ajax({
        type: "POST",
        url: "frmConfigAgenda.aspx/CargarPenalizaciones",
        data: JSON.stringify({ 'obj_Parametros_JS': [ca_IdMedico.toString()] }),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        cache: false,
        success: function (msg) {
            var res = msg.d;
            if (!res || res.indexOf("Error") > -1) {
                $("#divListaPenalizaciones").html(
                    "<p class='text-danger text-center'>Error al cargar penalizaciones.</p>"
                );
            } else if (res === "vacio") {
                $("#divListaPenalizaciones").html(
                    "<p class='text-muted text-center' style='font-size:.82rem;'>" +
                    "<i class='fa fa-check-circle text-success'></i> " +
                    "Ningún usuario penalizado para este médico.</p>"
                );
            } else {
                $("#divListaPenalizaciones").html(res);
            }
        }
    });
}

// ============================================
// LEVANTAR PENALIZACIÓN
// ============================================
function levantarPenalizacion(idUsuario) {
    Swal.fire({
        title: '¿Levantar penalización?',
        text: 'El usuario podrá volver a autoagendar y su contador se reinicia.',
        icon: 'question', showCancelButton: true,
        confirmButtonColor: '#28a745', cancelButtonColor: '#6c757d',
        confirmButtonText: 'Sí, levantar', cancelButtonText: 'Cancelar'
    }).then(function (r) {
        if (r.isConfirmed) {
            jQuery.ajax({
                type: "POST",
                url: "frmConfigAgenda.aspx/LevantarPenalizacion",
                data: JSON.stringify({
                    'obj_Parametros_JS': [idUsuario.toString(), ca_IdMedico.toString()]
                }),
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                cache: false,
                success: function (msg) {
                    var a = msg.d.split("<SPLITER>");
                    if (a[0] === "1") {
                        Swal.fire({
                            icon: "success", title: "Éxito", text: a[1],
                            timer: 1800, showConfirmButton: false
                        });
                        cargarPenalizaciones();
                    } else {
                        Swal.fire({ icon: "error", title: "Error", text: a[1] });
                    }
                }
            });
        }
    });
}

// ============================================
// GUARDAR CONFIGURACIÓN GENERAL
// ============================================
function guardarConfigGeneral() {
    var slotMin = $("#txtSlotMin").val();
    var anticip = $("#txtAnticipacion").val();
    var maxCitas = $("#txtMaxCitas").val() || "";
    var maxCanc = $("#txtMaxCancelaciones").val();
    var periodo = $("#txtPeriodoPenal").val();
    var mesesInact = $("#txtMesesInactividad").val() || "1";

    if (!slotMin || !anticip || !maxCanc || !periodo) {
        Swal.fire({
            icon: "warning", title: "Validación",
            text: "Completá todos los campos requeridos."
        });
        return;
    }

    Swal.fire({
        title: 'Guardando...', allowOutsideClick: false,
        showConfirmButton: false,
        willOpen: function () { Swal.showLoading(); }
    });

    jQuery.ajax({
        type: "POST",
        url: "frmConfigAgenda.aspx/GuardarConfigMedico",
        data: JSON.stringify({
            'obj_Parametros_JS': [
                ca_IdMedico.toString(),
                ca_AutoAgendamiento ? "1" : "0",
                slotMin, anticip, maxCitas, maxCanc, periodo, mesesInact
            ]
        }),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        cache: false,
        success: function (msg) {
            Swal.close();
            var a = msg.d.split("<SPLITER>");
            if (a[0] === "1") {
                Swal.fire({
                    icon: "success", title: "Éxito", text: a[1],
                    timer: 2000, showConfirmButton: false
                });
            } else {
                Swal.fire({ icon: "error", title: "Error", text: a[1] });
            }
        },
        error: function () {
            Swal.close();
            Swal.fire({
                icon: "error", title: "Error",
                text: "Error al comunicarse con el servidor."
            });
        }
    });
}

// ============================================
// EJECUTAR INACTIVACIÓN MANUAL DE PACIENTES
// ============================================
function ejecutarInactivacion() {
    if (ca_IdMedico === 0) {
        Swal.fire({ icon: "warning", title: "Validación", text: "No hay médico seleccionado." });
        return;
    }

    var meses = parseInt($("#txtMesesInactividad").val()) || 1;
    if (meses < 1) {
        Swal.fire({ icon: "warning", title: "Validación", text: "El mínimo es 1 mes." });
        return;
    }

    Swal.fire({
        title: "¿Ejecutar inactivación?",
        html: "Se inactivarán los pacientes que no han tenido consulta en los últimos <strong>" + meses + " mes(es)</strong>.",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Sí, ejecutar",
        cancelButtonText: "Cancelar"
    }).then(function (result) {
        if (!result.isConfirmed) return;

        $("#lblResultadoInactivacion").text("").hide();

        Swal.fire({
            title: "Ejecutando...", allowOutsideClick: false,
            showConfirmButton: false,
            willOpen: function () { Swal.showLoading(); }
        });

        var glbUni = $.cookie("GLBUNI") || "0";
        jQuery.ajax({
            type: "POST",
            url: "frmConfigAgenda.aspx/EjecutarInactivacionUsuarios",
            data: JSON.stringify({
                'obj_Parametros_JS': [ca_IdMedico.toString(), glbUni]
            }),
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            cache: false,
            success: function (msg) {
                Swal.close();
                var a = msg.d.split("<SPLITER>");
                var ico = a[0] === "1" ? "success" : "error";
                Swal.fire({ icon: ico, title: a[0] === "1" ? "Listo" : "Error", text: a[1] });
                if (a[0] === "1") {
                    $("#lblResultadoInactivacion")
                        .text(a[1])
                        .css("color", "#10b981")
                        .show();
                }
            },
            error: function () {
                Swal.close();
                Swal.fire({ icon: "error", title: "Error", text: "Error al comunicarse con el servidor." });
            }
        });
    });
}

// ============================================
// REGRESAR
// ============================================
function regresar() {
    location.href = "frmConsultaMedicos.aspx";
}