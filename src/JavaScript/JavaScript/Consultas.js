// ============================================
// VARIABLES GLOBALES
// ============================================
var ccCalendar = null;   // instancia FullCalendar
var ccEventos = [];     // array de eventos cargados
var ccVistaActual = 'calendario';

// ============================================
// DOCUMENT READY
// ============================================
$(document).ready(function () {
    var PageName = window.location.pathname.split('/').pop();

    if (PageName == 'frmConsultaConsultas.aspx') {
        inicializarFiltros();
        inicializarCalendario();
        filtrarConsultas();
    }
});

// ============================================
// INICIALIZAR FILTROS SEGÚN ROL
// ============================================
function inicializarFiltros() {
    var tipo = $.cookie("GLBTYP");

    if (tipo == "A") {
        $("#divFiltroUsuario").show();
        $("#divFiltroMedico").show();
        cargarUsuarios();
        cargarMedicos();
    } else if (tipo == "M") {
        $("#divFiltroUsuario").show();
        cargarUsuarios();
    }
}

// ============================================
// CARGAR COMBOS
// ============================================
function cargarUsuarios() {
    jQuery.ajax({
        type: "POST",
        url: "frmConsultaConsultas.aspx/CargaListaUsuarios",
        data: JSON.stringify({ 'obj_Parametros_JS': [] }),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        cache: false,
        success: function (msg) {
            if (msg.d && msg.d.indexOf("Error") == -1)
                $("#cboUsuario").append(msg.d);
        }
    });
}

function cargarMedicos() {
    jQuery.ajax({
        type: "POST",
        url: "frmConsultaConsultas.aspx/CargaListaMedicos",
        data: JSON.stringify({ 'obj_Parametros_JS': [] }),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        cache: false,
        success: function (msg) {
            if (msg.d && msg.d.indexOf("Error") == -1)
                $("#cboMedico").append(msg.d);
        }
    });
}

// ============================================
// CAMBIAR VISTA CALENDARIO / LISTA
// ============================================
function cambiarVista(vista) {
    ccVistaActual = vista;

    if (vista === 'calendario') {
        $("#divCalendario").show();
        $("#divTabla").hide();
        $("#btnVistaCalendario").addClass("activo btn-outline-primary")
            .removeClass("btn-outline-secondary");
        $("#btnVistaTabla").removeClass("activo btn-outline-primary")
            .addClass("btn-outline-secondary");
        // Refrescar el tamaño del calendario por si estaba oculto
        if (ccCalendar) ccCalendar.updateSize();
    } else {
        $("#divCalendario").hide();
        $("#divTabla").show();
        $("#btnVistaTabla").addClass("activo btn-outline-primary")
            .removeClass("btn-outline-secondary");
        $("#btnVistaCalendario").removeClass("activo btn-outline-primary")
            .addClass("btn-outline-secondary");
    }
}

// ============================================
// INICIALIZAR FULLCALENDAR
// ============================================
function getQueryParam(name) {
    var match = new RegExp('[?&]' + name + '=([^&#]*)').exec(window.location.search);
    return match ? decodeURIComponent(match[1]) : null;
}

function inicializarCalendario() {
    var el = document.getElementById('calendarFC');
    if (!el) return;

    var vistaParam = getQueryParam('vista');
    var vistaFC = 'timeGridWeek';
    if (vistaParam === 'dia') vistaFC = 'timeGridDay';
    else if (vistaParam === 'mes') vistaFC = 'dayGridMonth';

    ccCalendar = new FullCalendar.Calendar(el, {
        locale: 'es',
        initialView: vistaFC,
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
        },
        buttonText: {
            today: 'Hoy',
            month: 'Mes',
            week: 'Semana',
            day: 'Día'
        },
        slotMinTime: '06:00:00',
        slotMaxTime: '21:00:00',
        slotDuration: '00:30:00',
        allDaySlot: false,
        nowIndicator: true,
        height: 'auto',
        eventTimeFormat: { hour: '2-digit', minute: '2-digit', hour12: true },

        // ── Click en evento existente → popup ──
        eventClick: function (info) {
            mostrarPopupEvento(info.event, info.jsEvent);
        },

        // ── Click en día vacío → nueva consulta con esa fecha ──
        dateClick: function (info) {
            sessionStorage.setItem('CCFECHA', info.dateStr);
            window.location.href = 'frmMantenimientoConsultas.aspx';
        },

        // ── Estilos y clases de eventos ──
        eventDidMount: function (info) {
            var cod = info.event.extendedProps.estadoCodigo;
            var clsMap = {
                P: 'fc-event-pendiente',
                C: 'fc-event-completada',
                X: 'fc-event-cancelada',
                N: 'fc-event-noasistio'
            };
            // Limpiar clases de color de FullCalendar y aplicar la nuestra
            info.el.style.background = '';
            info.el.style.borderColor = '';
            if (clsMap[cod]) info.el.classList.add(clsMap[cod]);

            // Tooltip
            info.el.setAttribute('title',
                info.event.title + ' — ' + info.event.extendedProps.medico);
        }
    });

    ccCalendar.render();
}




// ============================================
// MOSTRAR POPUP DE EVENTO
// ============================================
function mostrarPopupEvento(evento, jsEvent) {
    cerrarPopup();

    var props = evento.extendedProps;
    var estadoTxt = { P: 'Pendiente', C: 'Completada', X: 'Cancelada', N: 'No Asistió' };
    var badgeMap = { P: 'warning', C: 'success', X: 'danger', N: 'secondary' };
    var cod = props.estadoCodigo;

    $("#popupTitulo").text(evento.title);
    $("#popupFecha").html('<i class="fa fa-clock-o"></i> ' +
        evento.start.toLocaleString('es-CR', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        })
    );
    $("#popupMedico").html('<i class="fa fa-user-md"></i> ' + props.medico);
    $("#popupEstado").html(
        '<span class="badge badge-' + (badgeMap[cod] || 'light') + '">' +
        (estadoTxt[cod] || cod) + '</span>'
    );
    $("#popupMotivo").html(
        props.motivo ? '<i class="fa fa-comment-o"></i> ' + props.motivo : ''
    );

    // Botones según estado
    var btns = '';
    if (cod === 'P') {
        btns += '<button class="btn btn-sm btn-primary" onclick="editarConsulta(' + props.idConsulta + ');cerrarPopup()">' +
            '<i class="fa fa-edit"></i> Editar</button>';
        btns += '<button class="btn btn-sm btn-success" onclick="completarConsulta(' + props.idConsulta + ');cerrarPopup()">' +
            '<i class="fa fa-check-circle"></i> Métricas</button>';
        btns += '<button class="btn btn-sm btn-danger" onclick="cancelarConsulta(' + props.idConsulta + ')">' +
            '<i class="fa fa-times-circle"></i> Cancelar</button>';
        btns += '<button class="btn btn-sm btn-secondary" onclick="marcarNoAsistio(' + props.idConsulta + ')">' +
            '<i class="fa fa-user-times"></i> No Asistió</button>';
    } else if (cod === 'C') {
        btns += '<button class="btn btn-sm btn-info" onclick="verDetalleConsulta(' + props.idConsulta + ');cerrarPopup()">' +
            '<i class="fa fa-eye"></i> Ver detalle</button>';
    }
    $("#popupBotones").html(btns);

    // Posicionar el popup cerca del click
    var popup = $("#popupCita");
    popup.css({ display: 'block', position: 'fixed' });

    var x = jsEvent.clientX + 12;
    var y = jsEvent.clientY + 12;
    // Evitar que se salga de la pantalla
    if (x + 280 > window.innerWidth) x = jsEvent.clientX - 292;
    if (y + 200 > window.innerHeight) y = jsEvent.clientY - 210;

    popup.css({ left: x + 'px', top: y + 'px' });

    // Cerrar al hacer click fuera
    setTimeout(function () {
        $(document).one('click', function (e) {
            if (!$(e.target).closest('#popupCita').length) cerrarPopup();
        });
    }, 50);
}

function cerrarPopup() {
    $("#popupCita").hide();
}

// ============================================
// FILTRAR CONSULTAS (tabla + calendario)
// ============================================
function filtrarConsultas() {
    var tipo = $.cookie("GLBTYP");
    var p = [];

    p[0] = (tipo == "U") ? $.cookie("GLBUNI") : ($("#cboUsuario").val() || "0");
    p[1] = (tipo == "M") ? $.cookie("GLBUNI") : ($("#cboMedico").val() || "0");
    p[2] = $("#cboEstado").val() || "";
    p[3] = $("#txtFechaInicio").val() || "";
    p[4] = $("#txtFechaFin").val() || "";

    jQuery.ajax({
        type: "POST",
        url: "frmConsultaConsultas.aspx/CargaListaConsultas",
        data: JSON.stringify({ 'obj_Parametros_JS': p }),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        cache: false,
        success: function (msg) {
            var res = msg.d;

            if (!res || res.indexOf("Error") > -1) {
                Swal.fire({ title: "Error", text: "Error al cargar las consultas", icon: "error" });
                return;
            }

            if (res === "No se encontraron registros") {
                // Tabla vacía
                $("#tblConsultas").html(
                    "<thead><tr><th>No hay consultas registradas</th></tr></thead>"
                );
                // Calendario vacío
                if (ccCalendar) {
                    ccCalendar.removeAllEvents();
                }
                return;
            }

            // ── Actualizar tabla ──
            $("#tblConsultas").html(res);
            if ($.fn.DataTable.isDataTable('#tblConsultas'))
                $('#tblConsultas').DataTable().destroy();
            $('#tblConsultas').DataTable({
                language: { url: "//cdn.datatables.net/plug-ins/1.10.24/i18n/Spanish.json" },
                order: [[3, "desc"]],
                pageLength: 10
            });

            // ── Actualizar calendario ──
            cargarEventosDesdeTabla();
        }
    });
}

// ============================================
// CONSTRUIR EVENTOS PARA FULLCALENDAR
// DESDE LOS DATOS YA EN LA TABLA (sin segundo AJAX)
// ============================================
function cargarEventosDesdeTabla() {
    if (!ccCalendar) return;

    ccCalendar.removeAllEvents();

    // Necesitamos el JSON de eventos; lo pedimos al mismo WebMethod
    // pero en formato JSON usando un segundo endpoint liviano
    var tipo = $.cookie("GLBTYP");
    var p = [];
    p[0] = (tipo == "U") ? $.cookie("GLBUNI") : ($("#cboUsuario").val() || "0");
    p[1] = (tipo == "M") ? $.cookie("GLBUNI") : ($("#cboMedico").val() || "0");
    p[2] = $("#cboEstado").val() || "";
    p[3] = $("#txtFechaInicio").val() || "";
    p[4] = $("#txtFechaFin").val() || "";

    jQuery.ajax({
        type: "POST",
        url: "frmConsultaConsultas.aspx/CargaEventosCalendario",
        data: JSON.stringify({ 'obj_Parametros_JS': p }),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        cache: false,
        success: function (msg) {
            var data;
            try { data = JSON.parse(msg.d); } catch (e) { data = []; }

            ccEventos = data;
            ccCalendar.addEventSource(data);
        }
    });
}

// ============================================
// LIMPIAR FILTROS
// ============================================
function limpiarFiltros() {
    $("#cboUsuario").val("0");
    $("#cboMedico").val("0");
    $("#cboEstado").val("");
    $("#txtFechaInicio").val("");
    $("#txtFechaFin").val("");
    filtrarConsultas();
}

// ============================================
// NAVEGACIÓN
// ============================================
function nuevaConsulta() {
    $.removeCookie('CONUNI', { path: '/', domain: g_Dominio });
    $.removeCookie('CCFECHA', { path: '/', domain: g_Dominio });
    location.href = "frmMantenimientoConsultas.aspx";
}

function editarConsulta(id) {
    $.cookie('CONUNI', id, { expires: TLTC, path: '/', domain: g_Dominio });
    location.href = "frmMantenimientoConsultas.aspx";
}

function completarConsulta(id) {
    $.cookie('CONUNI', id, { expires: TLTC, path: '/', domain: g_Dominio });
    location.href = "frmCompletarMetricas.aspx";
}

function verDetalleConsulta(id) {
    $.cookie('CONUNI', id, { expires: TLTC, path: '/', domain: g_Dominio });
    location.href = "frmDetalleConsulta.aspx";
}

// ============================================
// CAMBIAR ESTADO — CANCELAR
// ============================================
function cancelarConsulta(id) {
    cerrarPopup();
    Swal.fire({
        title: '¿Está seguro?', text: "¿Desea cancelar esta consulta?",
        icon: 'warning', showCancelButton: true,
        confirmButtonColor: '#3085d6', cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, cancelar', cancelButtonText: 'No'
    }).then(function (result) {
        if (result.isConfirmed) {
            jQuery.ajax({
                type: "POST",
                url: "frmConsultaConsultas.aspx/CancelarConsulta",
                data: JSON.stringify({ 'obj_Parametros_JS': [id, $.cookie("GLBUNI")] }),
                contentType: "application/json; charset=utf-8",
                dataType: "json", cache: false,
                success: function (msg) {
                    var a = msg.d.split("<SPLITER>");
                    if (a[0] != "0" && a[0] != "") {
                        Swal.fire({
                            icon: "success", title: "Éxito", text: a[1],
                            timer: 1800, showConfirmButton: false
                        });
                        filtrarConsultas();
                    } else {
                        Swal.fire({ icon: "error", title: "Error", text: a[1] });
                    }
                }
            });
        }
    });
}

// ============================================
// CAMBIAR ESTADO — NO ASISTIÓ
// ============================================
function marcarNoAsistio(id) {
    cerrarPopup();
    Swal.fire({
        title: '¿Está seguro?', text: "¿Marcar esta consulta como No Asistió?",
        icon: 'warning', showCancelButton: true,
        confirmButtonColor: '#6c757d', cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, marcar', cancelButtonText: 'No'
    }).then(function (result) {
        if (result.isConfirmed) {
            jQuery.ajax({
                type: "POST",
                url: "frmConsultaConsultas.aspx/MarcarNoAsistio",
                data: JSON.stringify({ 'obj_Parametros_JS': [id, $.cookie("GLBUNI")] }),
                contentType: "application/json; charset=utf-8",
                dataType: "json", cache: false,
                success: function (msg) {
                    var a = msg.d.split("<SPLITER>");
                    if (a[0] != "0" && a[0] != "") {
                        Swal.fire({
                            icon: "success", title: "Éxito", text: a[1],
                            timer: 1800, showConfirmButton: false
                        });
                        filtrarConsultas();
                    } else {
                        Swal.fire({ icon: "error", title: "Error", text: a[1] });
                    }
                }
            });
        }
    });
}