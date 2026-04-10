// ========================================
// VARIABLES GLOBALES
// ========================================
var mc_EsModoAutoagenda = false; // true cuando el usuario es paciente (tipo "U")
var mc_DuracionSlot     = 30;    // minutos por slot — viene del servidor
var mc_HoraSeleccionada = "";    // hora del slot elegido

$(document).ready(function () {
    var PageName = window.location.pathname.split('/').pop();
    if (PageName == 'frmMantenimientoConsultas.aspx') {
        inicializarFormulario();
    }
});

// ========================================
// INICIALIZAR FORMULARIO
// ========================================
function inicializarFormulario() {
    var tipoUsuario = $.cookie("GLBTYP");
    var idConsulta  = $.cookie("CONUNI");

    if (tipoUsuario === "U") {
        // ── Modo autoagendamiento (paciente) ──
        mc_EsModoAutoagenda = true;
        activarModoAutoagenda();
    } else {
        // ── Modo administración (admin / médico) ──
        $("#breadcrumbConsultas").show();
        cargarUsuarios();

        // Si es médico, preseleccionar y bloquear dentro del callback (evita race condition)
        if (tipoUsuario === "M") {
            cargarMedicos(function () {
                $("#cboMedico").val($.cookie("GLBUNI"));
                $("#cboMedico").prop("disabled", true);
                cargarClinicasMedicoConsulta();
            });
        } else {
            cargarMedicos();
        }

        // Modo edición
        if (idConsulta && idConsulta !== "0") {
            $("#tituloFormulario").text("Modificar Cita");
            $("#tituloCard").text("Modificar Cita Médica");
            $("#breadcrumbActual").text("Modificar Cita");
            $("#btnGuardarTxt").text("Guardar Cambios");
            document.title = "Modificar Cita";
            setTimeout(obtieneDetalleConsulta, 600);
        } else {
            precargarFechaHora();
        }
    }
}

// ========================================
// MODO AUTOAGENDAMIENTO — PACIENTE
// ========================================
function activarModoAutoagenda() {
    // Adaptar la UI
    $("#divPacienteDisplay").show();
    $("#divCboUsuario").hide();
    $("#divSlotsWrapper").show();
    $("#divHoraManual").hide();
    $("#divDuracionWrapper").hide();
    $("#divEstado").hide();
    $("#btnGuardarTxt").text("Confirmar Cita");

    // Mostrar nombre del paciente logueado
    var nombrePaciente = $.cookie("GLBDSC") || "Paciente";
    $("#txtNombrePacienteDisplay").text(nombrePaciente);
    $("#subtituloFormulario").text("Seleccioná médico, fecha y horario para tu cita.");

    // Motivo fijo = Seguimiento (no editable)
    $("#txtMotivo").val("Seguimiento").prop("readonly", true);

    // Fijar fecha mínima = hoy
    var hoy = new Date();
    var fechaMin = hoy.getFullYear() + '-' +
        String(hoy.getMonth() + 1).padStart(2, '0') + '-' +
        String(hoy.getDate()).padStart(2, '0');
    $("#txtFechaCita").attr("min", fechaMin);

    // Cargar solo médicos que permiten autoagendamiento
    cargarMedicosAutoagendamiento();
}

function cargarMedicosAutoagendamiento() {
    jQuery.ajax({
        type: "POST",
        url: "frmMantenimientoConsultas.aspx/CargaMedicosAutoagendamiento",
        data: JSON.stringify({ 'obj_Parametros_JS': [] }),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        cache: false,
        success: function (msg) {
            var opts = msg.d;
            if (!opts || opts.indexOf("Error") === 0 || opts.trim() === "") {
                $("#cboMedico").html(
                    "<option value='0'>No hay médicos disponibles para autoagendamiento</option>"
                );
                return;
            }
            $("#cboMedico").html(
                "<option value='0'>Seleccione un médico...</option>" + opts
            );
        }
    });
}

// ── Triggered cuando el médico cambia ──
function onMedicoChange() {
    cargarClinicasMedicoConsulta();
    if (mc_EsModoAutoagenda) {
        mc_HoraSeleccionada = "";
        $("#hdnHoraSeleccionada").val("");
        cargarSlots();
    }
}

// ── Cargar clínicas del médico como tarjetas seleccionables ──
function cargarClinicasMedicoConsulta(preselId) {
    var idMedico = $("#cboMedico").val();
    if (!idMedico || idMedico === "0") {
        $("#cboClinica").val("0");
        $("#divClinicaCards").html("");
        $("#divClinica").hide();
        return;
    }

    jQuery.ajax({
        type: "POST",
        url: "frmMantenimientoConsultas.aspx/CargaClinicasMedico",
        data: JSON.stringify({ 'obj_Parametros_JS': [idMedico] }),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        cache: false,
        success: function (msg) {
            var raw = msg.d || "";
            if (!raw) {
                $("#cboClinica").val("0");
                $("#divClinicaCards").html("");
                $("#divClinica").hide();
                return;
            }
            var clinicas;
            try { clinicas = JSON.parse(raw); } catch(e) { $("#divClinica").hide(); return; }
            if (!clinicas || clinicas.length === 0) { $("#divClinica").hide(); return; }

            var selId = preselId && preselId !== "0" ? String(preselId) : "0";

            // Si solo hay una, auto-seleccionar
            if (clinicas.length === 1) {
                selId = String(clinicas[0].id);
                renderClinicaAutosel(clinicas[0]);
            } else {
                renderClinicaCards(clinicas, selId);
            }
            $("#cboClinica").val(selId);
            $("#divClinica").show();
        },
        error: function () { $("#divClinica").hide(); }
    });
}

// ── Render cuando hay una sola clínica (auto-seleccionada) ──
function renderClinicaAutosel(c) {
    var logoHtml = c.logo
        ? "<img src='" + c.logo + "' style='width:28px;height:28px;object-fit:contain;border-radius:4px;vertical-align:middle;margin-right:6px;'>"
        : "<i class='fa fa-hospital-o' style='margin-right:6px;'></i>";
    var html = "<div class='mc-clinica-auto'>" + logoHtml +
               "<strong>" + c.nombre + "</strong>";
    if (c.direccion) html += "&nbsp;·&nbsp;<span>" + c.direccion + "</span>";
    html += "&nbsp;<i class='fa fa-check-circle'></i></div>";
    $("#divClinicaCards").html(html);
    $("#msgClinica").text("Clínica asignada automáticamente.");
}

// ── Render lista de tarjetas cuando hay múltiples clínicas ──
function renderClinicaCards(clinicas, preselId) {
    var html = "<div class='mc-clinica-list'>";
    clinicas.forEach(function(c) {
        var sel = String(c.id) === String(preselId) ? " selected" : "";
        var logoHtml = c.logo
            ? "<img src='" + c.logo + "' alt='Logo' class='mc-clinica-logo'>"
            : "<div class='mc-clinica-icon'><i class='fa fa-hospital-o'></i></div>";
        html += "<div class='mc-clinica-card" + sel + "' data-id='" + c.id + "' onclick='seleccionarClinica(" + c.id + ")'>" +
                logoHtml +
                "<div class='mc-clinica-info'>" +
                "<div class='mc-clinica-nombre'>" + c.nombre + "</div>" +
                (c.direccion ? "<div class='mc-clinica-dir'><i class='fa fa-map-marker'></i> " + c.direccion + "</div>" : "") +
                "</div>" +
                "<div class='mc-clinica-check'><i class='fa fa-check-circle'></i></div>" +
                "</div>";
    });
    html += "</div>";
    $("#divClinicaCards").html(html);
    $("#msgClinica").text("Seleccioná la clínica donde se realizará la cita.");
}

// ── Seleccionar una clínica del checklist ──
function seleccionarClinica(id) {
    $(".mc-clinica-card").removeClass("selected");
    $(".mc-clinica-card[data-id='" + id + "']").addClass("selected");
    $("#cboClinica").val(id);
}

// ── Triggered cuando la fecha cambia ──
function onFechaChange() {
    if (mc_EsModoAutoagenda) {
        mc_HoraSeleccionada = "";
        $("#hdnHoraSeleccionada").val("");
        cargarSlots();
    }
}

// ========================================
// OBTENER SLOTS DISPONIBLES
// ========================================
function cargarSlots() {
    var idMedico = $("#cboMedico").val();
    var fecha    = $("#txtFechaCita").val();

    if (!idMedico || idMedico === "0" || !fecha) return;

    $("#divSlotsGrid").html(
        "<p class='text-muted' style='font-size:.82rem;'>" +
        "<i class='fa fa-spinner fa-spin'></i> Buscando horarios disponibles...</p>"
    );
    $("#msgSlotsInfo").text("");

    jQuery.ajax({
        type: "POST",
        url: "frmMantenimientoConsultas.aspx/ObtenerSlots",
        data: JSON.stringify({ 'obj_Parametros_JS': [idMedico, fecha] }),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        cache: false,
        success: function (msg) {
            var a = msg.d.split("<SPLITER>");
            if (a[0] !== "1") {
                $("#divSlotsGrid").html(
                    "<div class='sin-slots-msg'>" +
                    "<i class='fa fa-calendar-times-o'></i> " + a[1] +
                    "</div>"
                );
                return;
            }
            mc_DuracionSlot = parseInt(a[1]) || 30;
            $("#hdnDuracionAuto").val(mc_DuracionSlot);
            renderizarSlots(a[2].split(","));
            $("#msgSlotsInfo").text("Slots de " + mc_DuracionSlot + " minutos. Seleccioná tu horario.");
        },
        error: function () {
            $("#divSlotsGrid").html(
                "<div class='sin-slots-msg'>Error al cargar los horarios. Intentá de nuevo.</div>"
            );
        }
    });
}

function renderizarSlots(slots) {
    var html = "";
    slots.forEach(function (hora) {
        hora = hora.trim();
        if (!hora) return;
        html += "<button type='button' class='slot-btn' " +
                "onclick='seleccionarSlot(\"" + hora + "\")'>" +
                hora + "</button>";
    });
    $("#divSlotsGrid").html(html || "<div class='sin-slots-msg'>Sin horarios disponibles.</div>");
}

function seleccionarSlot(hora) {
    mc_HoraSeleccionada = hora;
    $("#hdnHoraSeleccionada").val(hora);

    // Resaltar visualmente
    $(".slot-btn").removeClass("selected");
    $(".slot-btn").filter(function () {
        return $(this).text().trim() === hora;
    }).addClass("selected");
}

// ========================================
// CARGAR COMBOS (modo admin/médico)
// ========================================
var mcPacientesData = []; // [{id, text}, ...]

function cargarUsuarios() {
    jQuery.ajax({
        type: "POST",
        url: "frmMantenimientoConsultas.aspx/CargaListaUsuarios",
        data: JSON.stringify({ 'obj_Parametros_JS': [] }),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        cache: false,
        success: function (msg) {
            var res = msg.d;
            if (!res || res.indexOf("Error") !== -1) return;
            var temp = document.createElement("select");
            temp.innerHTML = res;
            mcPacientesData = [];
            Array.from(temp.options).forEach(function (o) {
                if (o.value && o.value !== "0")
                    mcPacientesData.push({ id: o.value, text: o.text });
            });
        }
    });
}

function mcFiltrarPacientes(query) {
    var panel = document.getElementById("divResultadosPaciente");
    var lista = (!query || query.trim().length < 1)
        ? mcPacientesData
        : mcPacientesData.filter(function (u) {
            return u.text.toLowerCase().indexOf(query.toLowerCase()) !== -1;
        });
    if (lista.length === 0) {
        panel.innerHTML = '<div class="gp-search-no-results">Sin resultados</div>';
        panel.style.display = "block";
        return;
    }
    panel.innerHTML = lista.map(function (u) {
        return '<div class="gp-search-item" onmousedown="mcSeleccionarPaciente(\'' + u.id + '\', \'' +
            u.text.replace(/'/g, "\\'") + '\')">' + u.text + '</div>';
    }).join("");
    panel.style.display = "block";
}

function mcSeleccionarPaciente(id, nombre) {
    document.getElementById("hdnIdPaciente").value = id;
    document.getElementById("txtBuscarPaciente").value = nombre;
    document.getElementById("lblPacienteBadge").textContent = nombre;
    document.getElementById("divPacienteBadge").style.display = "block";
    document.getElementById("divResultadosPaciente").style.display = "none";
}

function mcLimpiarPaciente() {
    document.getElementById("hdnIdPaciente").value = "0";
    document.getElementById("txtBuscarPaciente").value = "";
    document.getElementById("divPacienteBadge").style.display = "none";
}

function mcPreseleccionarPacientePorId(id) {
    var found = mcPacientesData.find(function (u) { return u.id == id; });
    if (found) {
        mcSeleccionarPaciente(found.id, found.text);
    } else {
        // Datos aún no cargados; guardamos el ID y esperamos
        document.getElementById("hdnIdPaciente").value = id;
    }
}

$(document).on("click", function (e) {
    if (!$(e.target).closest("#divCboUsuario").length)
        $("#divResultadosPaciente").hide();
});

function cargarMedicos(onLoaded) {
    jQuery.ajax({
        type: "POST",
        url: "frmMantenimientoConsultas.aspx/CargaListaMedicos",
        data: JSON.stringify({ 'obj_Parametros_JS': [] }),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        cache: false,
        success: function (msg) {
            if (msg.d && msg.d.indexOf("Error") === -1)
                $("#cboMedico").append(msg.d);
            if (typeof onLoaded === "function") onLoaded();
        }
    });
}

function precargarFechaHora() {
    var ccFecha = sessionStorage.getItem('CCFECHA');
    sessionStorage.removeItem('CCFECHA');

    if (ccFecha && ccFecha.indexOf('T') > -1) {
        var partes = ccFecha.split('T');
        $("#txtFechaCita").val(partes[0]);
        $("#txtHoraCita").val(partes[1].substring(0, 5));
    } else {
        var now   = new Date();
        var fecha = now.getFullYear() + '-' +
                    String(now.getMonth() + 1).padStart(2, '0') + '-' +
                    String(now.getDate()).padStart(2, '0');
        var hora  = String(now.getHours()).padStart(2, '0') + ':' +
                    String(now.getMinutes()).padStart(2, '0');
        $("#txtFechaCita").val(fecha);
        $("#txtHoraCita").val(hora);
    }
}

// ========================================
// OBTENER DETALLE (MODO EDICIÓN)
// ========================================
function obtieneDetalleConsulta() {
    jQuery.ajax({
        type: "POST",
        url: "frmMantenimientoConsultas.aspx/CargaInfoConsulta",
        data: JSON.stringify({ 'obj_Parametros_JS': [$.cookie("CONUNI")] }),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        cache: false,
        success: function (msg) {
            var res = msg.d;
            if (!res || res.indexOf("Error") > -1 || res === "No se encontraron registros") {
                Swal.fire({ title: "Error", text: "No se pudo cargar la consulta.", icon: "error" });
                return;
            }
            var a = res.split("<SPLITER>");
            // [0]=IdUsuario [1]=IdMedico [2]=Fecha [3]=Hora [4]=Duracion [5]=Estado [6]=Motivo [7]=IdClinica
            mcPreseleccionarPacientePorId(a[0]);
            $("#cboMedico").val(a[1]);
            $("#txtFechaCita").val(a[2]);
            $("#txtHoraCita").val(a[3]);
            $("#txtDuracion").val(a[4]);
            $("#cboEstado").val(a[5]);
            $("#txtMotivo").val(a[6]);
            $("#divEstado").show();

            // Cargar clínicas y pre-seleccionar
            if (a[1] && a[1] !== "0") {
                var idClinicaPresel = a[7] || "0";
                cargarClinicasMedicoConsulta(idClinicaPresel);
            }
        }
    });
}

// ========================================
// GUARDAR CONSULTA
// ========================================
function mantenimientoConsulta() {
    // ── Validaciones comunes ──
    var idMedico = $("#cboMedico").val();
    if (!idMedico || idMedico === "0") {
        Swal.fire({ icon: "warning", title: "Validación", text: "Seleccioná un médico." });
        return;
    }

    var fecha = $("#txtFechaCita").val();
    if (!fecha) {
        Swal.fire({ icon: "warning", title: "Validación", text: "Ingresá la fecha de la cita." });
        return;
    }

    // ── Validaciones por modo ──
    var idUsuario, hora, duracion;

    if (mc_EsModoAutoagenda) {
        // Paciente: usuario desde cookie, hora desde slot seleccionado
        idUsuario = $.cookie("GLBUNI");

        hora = $("#hdnHoraSeleccionada").val();
        if (!hora) {
            Swal.fire({ icon: "warning", title: "Validación", text: "Seleccioná un horario disponible." });
            return;
        }
        duracion = $("#hdnDuracionAuto").val() || mc_DuracionSlot;
    } else {
        // Admin / médico: usuario desde búsqueda, hora manual
        idUsuario = $("#hdnIdPaciente").val();
        if (!idUsuario || idUsuario === "0") {
            Swal.fire({ icon: "warning", title: "Validación", text: "Seleccioná un paciente." });
            return;
        }

        hora = $("#txtHoraCita").val();
        if (!hora) {
            Swal.fire({ icon: "warning", title: "Validación", text: "Ingresá la hora de la cita." });
            return;
        }
        duracion = $("#txtDuracion").val() || "30";
    }

    // No agendar en el pasado (solo cita nueva)
    var idConsulta = $.cookie("CONUNI") || "0";
    if (idConsulta === "0") {
        var citaDT = new Date(fecha + "T" + hora);
        if (citaDT < new Date()) {
            Swal.fire({ icon: "warning", title: "Validación", text: "No podés agendar una cita en el pasado." });
            return;
        }
    }

    var fechaHoraCombinada = fecha + " " + hora + ":00";

    var obj_Parametros_JS = [
        idConsulta,
        idUsuario.toString(),
        idMedico.toString(),
        fechaHoraCombinada,
        duracion.toString(),
        $("#txtMotivo").val() || "",
        $("#cboEstado").val() || "P",
        $.cookie("GLBUNI"),
        ($("#cboClinica").val() || "0")   // [8] IdClinica
    ];

    Swal.fire({
        title: 'Procesando...',
        text: 'Por favor espere',
        allowOutsideClick: false,
        showConfirmButton: false,
        willOpen: function () { Swal.showLoading(); }
    });

    jQuery.ajax({
        type: "POST",
        url: "frmMantenimientoConsultas.aspx/MantenimientoConsulta",
        data: JSON.stringify({ 'obj_Parametros_JS': obj_Parametros_JS }),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        cache: false,
        success: function (msg) {
            Swal.close();
            var a   = msg.d.split("<SPLITER>");
            var res = a[0];
            var txt = a[1];

            if (res === "-1") {
                Swal.fire({ icon: "warning", title: "Horario no disponible", text: txt });
                // Recargar slots para reflejar el estado actual
                if (mc_EsModoAutoagenda) {
                    mc_HoraSeleccionada = "";
                    $("#hdnHoraSeleccionada").val("");
                    cargarSlots();
                }
            } else if (res === "0" || res === "") {
                Swal.fire({ icon: "error", title: "Error", text: txt });
            } else {
                Swal.fire({
                    icon: "success", title: "¡Listo!", text: txt,
                    timer: 3000, timerProgressBar: true, showConfirmButton: false
                }).then(function () { regresar(); });
            }
        },
        error: function () {
            Swal.close();
            Swal.fire({ icon: "error", title: "Error", text: "Error de conexión al servidor." });
        }
    });
}

// ========================================
// REGRESAR
// ========================================
function regresar() {
    $.removeCookie('CONUNI', { path: '/', domain: g_Dominio });
    if (mc_EsModoAutoagenda) {
        location.href = "frmPrincipal.aspx";
    } else {
        location.href = "frmConsultaConsultas.aspx";
    }
}
