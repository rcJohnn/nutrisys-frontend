$(document).ready(function () {
    var PageName = window.location.pathname.split('/').pop();
    if (PageName == 'frmConsultaMedicos.aspx') {
        cargaListaMedicos();
    } else if (PageName == 'frmMantenimientoMedicos.aspx') {
        obtieneDetalleMedico();
    }
});

function crearMedico() {
    $.cookie('MEDUNI', 0, { expires: TLTC, path: '/', domain: g_Dominio });
    location.href = "frmMantenimientoMedicos.aspx";
}

function regresar() {
    location.href = "frmConsultaMedicos.aspx";
}

// ──────────────────────────────────────────────
// LISTA DE MÉDICOS (consulta)
// ──────────────────────────────────────────────
function cargaListaMedicos() {
    $.cookie('MEDUNI', 0, { expires: TLTC, path: '/', domain: g_Dominio });

    var obj_Parametros_JS = [
        $("#bsqCorreo").val(),
        $("#bsqMedico").val(),
        $("#bsqEstado").val()
    ];

    var usuarioGlobal = $.cookie("GLBUNI");
    if (!usuarioGlobal || usuarioGlobal == 0) { _redirectLogin(); return; }

    jQuery.ajax({
        type: "POST",
        url: "frmConsultaMedicos.aspx/CargaListaMedicos",
        data: JSON.stringify({ 'obj_Parametros_JS': obj_Parametros_JS }),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        cache: false,
        success: function (msg) {
            var res = msg.d;
            if (res === undefined) {
                Swal.fire({ title: "Error en la conexión", text: "Error de conexión a la base de datos", icon: "error" });
            } else if (res === "No se encontraron registros") {
                $("#tblMedicos").html("");
                Swal.fire({ title: "Búsqueda de Registros", text: res, icon: "info" });
            } else {
                $("#tblMedicos").html(res);
                paginar("#tblMedicos");
            }
        },
        error: function () {}
    });
}

function defineMedico(uni) {
    $.cookie('MEDUNI', uni, { expires: TLTC, path: '/', domain: g_Dominio });
    location.href = "frmMantenimientoMedicos.aspx";
}

function irConfigAgenda(uni) {
    $.cookie('MEDUNI', uni, { expires: TLTC, path: '/', domain: g_Dominio });
    location.href = "frmConfigAgenda.aspx";
}

// ──────────────────────────────────────────────
// CARGA DETALLE MÉDICO (mantenimiento)
// ──────────────────────────────────────────────
function obtieneDetalleMedico() {
    var idMedico = $.cookie("MEDUNI");
    var usuarioGlobal = $.cookie("GLBUNI");
    if (!usuarioGlobal || usuarioGlobal == 0) { _redirectLogin(); return; }

    jQuery.ajax({
        type: "POST",
        url: "frmMantenimientoMedicos.aspx/CargaInfoMedico",
        data: JSON.stringify({ 'obj_Parametros_JS': [idMedico] }),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        cache: false,
        success: function (msg) {
            var res = msg.d;
            if (!res || res === "No se encontraron registros") return;

            // [0]=Id [1]=Nombre [2]=Ape1 [3]=Ape2 [4]=Cedula [5]=Telefono [6]=Correo [7]=Estado
            var a = res.split("<SPLITER>");
            if (!a[0] || a[0] === "0") return;

            $("#txtNom").val(a[1]);
            $("#txtApe1").val(a[2]);
            $("#txtApe2").val(a[3]);
            $("#txtCed").val(a[4]);
            $("#txtTel").val(a[5]);
            $("#txtEml").val(a[6]);
            $("#cboSts").val(a[7]);
            $("#txtPwd").val("");

            // Panel clínicas: mostrar solo en edición
            if (a[0] && a[0] !== "0") {
                $("#divPanelClinicas").show();
                cargarClinicasMedico(a[0]);
            }
        },
        error: function () {}
    });
}

// ──────────────────────────────────────────────
// GUARDAR MÉDICO
// ──────────────────────────────────────────────
function mantenimientoMedico() {
    if (!$('#txtNom').val() || !$('#txtApe1').val() || !$('#txtCed').val() || !$('#txtEml').val()) {
        Swal.fire({ icon: 'warning', title: 'Campos incompletos', text: 'Por favor complete todos los campos obligatorios' });
        return;
    }

    var obj_Parametros_JS = [
        $.cookie("MEDUNI") || 0,  // [0] IdMedico
        $("#txtNom").val(),        // [1] Nombre
        $("#txtApe1").val(),       // [2] Ape1
        $("#txtApe2").val(),       // [3] Ape2
        $("#txtCed").val(),        // [4] Cedula
        $("#txtTel").val(),        // [5] Telefono
        $("#txtEml").val(),        // [6] Correo
        $("#cboSts").val(),        // [7] Estado
        $("#txtPwd").val(),        // [8] Password
        $.cookie("GLBUNI")         // [9] IdUsuarioGlobal
    ];

    var usuarioGlobal = obj_Parametros_JS[9];
    if (!usuarioGlobal || usuarioGlobal == 0) { _redirectLogin(); return; }

    Swal.fire({ title: 'Guardando...', text: 'Por favor espere', allowOutsideClick: false,
                showConfirmButton: false, willOpen: function () { Swal.showLoading(); } });

    jQuery.ajax({
        type: "POST",
        url: "frmMantenimientoMedicos.aspx/MantenimientoMedicos",
        data: JSON.stringify({ 'obj_Parametros_JS': obj_Parametros_JS }),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        cache: false,
        success: function (msg) {
            Swal.close();
            var res = msg.d;
            if (!res) { Swal.fire({ title: "Error", text: "Error de conexión", icon: "error" }); return; }

            var a = res.split("<SPLITER>");
            if (a[0] !== "0" && a[0] !== "-1") {
                Swal.fire({ icon: "success", title: "Éxito", text: a[1],
                            showConfirmButton: false, timer: 4500, timerProgressBar: true });
                setTimeout(function () { location.href = "frmConsultaMedicos.aspx"; }, 5000);
            } else {
                Swal.fire({ icon: "info", title: "Información", text: a[1] });
            }
        },
        error: function () { Swal.close(); Swal.fire({ title: "Error", text: "Error al comunicarse con el servidor", icon: "error" }); }
    });
}

// ──────────────────────────────────────────────
// ELIMINAR MÉDICO
// ──────────────────────────────────────────────
function eliminaMedico(uni) {
    var usuarioGlobal = $.cookie("GLBUNI");
    if (!usuarioGlobal || usuarioGlobal == 0) { _redirectLogin(); return; }

    Swal.fire({
        title: '¿Eliminar médico?', icon: 'warning',
        showCancelButton: true, confirmButtonColor: '#d33', cancelButtonColor: '#6c757d',
        confirmButtonText: 'Sí, eliminar', cancelButtonText: 'Cancelar'
    }).then(function (r) {
        if (!r.isConfirmed) return;

        jQuery.ajax({
            type: "POST",
            url: "frmMantenimientoMedicos.aspx/EliminarMedicos",
            data: JSON.stringify({ 'obj_Parametros_JS': [uni, usuarioGlobal] }),
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            cache: false,
            success: function (msg) {
                var a = msg.d.split("<SPLITER>");
                if (a[0] !== "0" && a[0] !== "-1") {
                    Swal.fire({ icon: "success", title: "Éxito", text: a[1],
                                showConfirmButton: false, timer: 2500, timerProgressBar: true });
                    setTimeout(function () { cargaListaMedicos(); }, 3000);
                } else {
                    Swal.fire({ icon: "info", title: "Información", text: a[1] });
                }
            },
            error: function () {}
        });
    });
}

// ══════════════════════════════════════════════════════════
//  GESTIÓN DE CLÍNICAS
// ══════════════════════════════════════════════════════════

function togglePanelClinicas() {
    var body    = $("#bodyClinicas");
    var chevron = $("#chevronClinicas");
    body.toggleClass("open");
    chevron.toggleClass("open");
}

// Carga la lista de clínicas del médico
function cargarClinicasMedico(idMedico) {
    idMedico = idMedico || $.cookie("MEDUNI") || 0;
    if (!idMedico || idMedico == 0) return;

    $("#divClinicasLoading").show();
    $("#divNoClinicas").hide();
    $("#divTblClinicas").hide();

    jQuery.ajax({
        type: "POST",
        url: "frmMantenimientoMedicos.aspx/ListarClinicasMedico",
        data: JSON.stringify({ 'obj_Parametros_JS': [idMedico.toString()] }),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        cache: false,
        success: function (msg) {
            $("#divClinicasLoading").hide();
            try {
                var clinicas = JSON.parse(msg.d);
                renderTablaClinicas(clinicas);
                $("#badgeClinicaCount").text(clinicas.length);
            } catch (e) {
                $("#divNoClinicas").show();
            }
        },
        error: function () {
            $("#divClinicasLoading").hide();
            $("#divNoClinicas").show();
        }
    });
}

function renderTablaClinicas(clinicas) {
    if (!clinicas || clinicas.length === 0) {
        $("#divNoClinicas").show();
        $("#divTblClinicas").hide();
        return;
    }
    $("#divNoClinicas").hide();
    var html = "";
    for (var i = 0; i < clinicas.length; i++) {
        var c = clinicas[i];
        var logo = c.logoUrl
            ? "<img src='" + c.logoUrl + "' class='clinic-logo-thumb' alt='Logo'>"
            : "<span style='color:#cbd5e1;font-size:1.2rem;'><i class='fa fa-hospital-o'></i></span>";
        html += "<tr>";
        html += "<td>" + logo + "</td>";
        html += "<td><strong>" + (c.nombre || '') + "</strong></td>";
        html += "<td><small>" + (c.direccion || '<em style=\"color:#94a3b8\">Sin dirección</em>') + "</small></td>";
        html += "<td>";
        html += "<button type='button' class='btn btn-outline-primary btn-sm btn-quitar-clinica mr-1' onclick='editarClinica(" + JSON.stringify(c) + ")'><i class='fa fa-edit'></i></button>";
        html += "<button type='button' class='btn btn-outline-danger btn-sm btn-quitar-clinica' onclick='quitarClinica(" + c.idMedicoClinica + ")'><i class='fa fa-times'></i></button>";
        html += "</td>";
        html += "</tr>";
    }
    $("#tbodyClinicas").html(html);
    $("#divTblClinicas").show();
}

// Abre la clínica en el mini-form para editar
function editarClinica(c) {
    $("#hdnIdClinicaEdit").val(c.idClinica);
    $("#txtClinicaNombre").val(c.nombre);
    $("#txtClinicaDireccion").val(c.direccion || '');
    $("#txtClinicaLatitud").val(c.latitud || '');
    $("#txtClinicaLongitud").val(c.longitud || '');
    $("#hdnLogoUrlClinica").val(c.logoUrl || '');
    if (c.logoUrl) {
        $("#imgPreviewClinica").attr('src', c.logoUrl).show();
        $("#txtNoLogoClinica").hide();
    }
    $('html, body').animate({ scrollTop: $(".clinic-form").offset().top - 80 }, 400);
}

// Limpia el mini-form de clínica
function limpiarFormClinica() {
    $("#hdnIdClinicaEdit").val("0");
    $("#txtClinicaNombre").val('');
    $("#txtClinicaDireccion").val('');
    $("#txtClinicaLatitud").val('');
    $("#txtClinicaLongitud").val('');
    $("#hdnLogoUrlClinica").val('');
    $("#fileLogoClinica").val('');
    $("#imgPreviewClinica").attr('src', '').hide();
    $("#txtNoLogoClinica").show();
}

// Guarda la clínica (nueva o existente) y la asigna al médico
function guardarClinica() {
    var nombre = $("#txtClinicaNombre").val().trim();
    if (!nombre) {
        Swal.fire({ icon: 'warning', title: 'Nombre requerido', text: 'Por favor ingrese el nombre de la clínica.' });
        return;
    }

    var idMedico  = $.cookie("MEDUNI") || 0;
    var archivo   = $('#fileLogoClinica')[0].files[0];
    var logoAnterior = $('#hdnLogoUrlClinica').val();

    Swal.fire({ title: 'Guardando...', allowOutsideClick: false,
                showConfirmButton: false, willOpen: function () { Swal.showLoading(); } });

    if (archivo) {
        subirLogoClinica(archivo, logoAnterior, function (logoUrl) {
            _guardarClinicaRequest(logoUrl, idMedico);
        });
    } else {
        _guardarClinicaRequest(logoAnterior, idMedico);
    }
}

function subirLogoClinica(archivo, logoAnterior, callback) {
    var formData = new FormData();
    formData.append('file', archivo);
    formData.append('idClinica', $("#hdnIdClinicaEdit").val() || "0");
    formData.append('logoAnterior', logoAnterior || '');

    jQuery.ajax({
        type: "POST",
        url: "../Handlers/UploadLogoClinica.ashx",
        data: formData,
        contentType: false,
        processData: false,
        cache: false,
        success: function (logoUrl) { callback(logoUrl); },
        error: function (xhr) {
            Swal.close();
            Swal.fire({ icon: 'error', title: 'Error al subir logo', text: xhr.responseText || 'Error desconocido' });
        }
    });
}

function _guardarClinicaRequest(logoUrl, idMedico) {
    var obj_Parametros_JS = [
        $("#hdnIdClinicaEdit").val() || "0",    // [0] IdClinica (0=nueva)
        $("#txtClinicaNombre").val(),            // [1] Nombre
        $("#txtClinicaDireccion").val() || "",   // [2] Dirección
        $("#txtClinicaLatitud").val() || "",     // [3] Latitud
        $("#txtClinicaLongitud").val() || "",    // [4] Longitud
        logoUrl || "",                           // [5] LogoUrl
        idMedico.toString(),                     // [6] IdMedico
        $.cookie("GLBUNI")                       // [7] IdUsuarioGlobal
    ];

    jQuery.ajax({
        type: "POST",
        url: "frmMantenimientoMedicos.aspx/GuardarClinica",
        data: JSON.stringify({ 'obj_Parametros_JS': obj_Parametros_JS }),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        cache: false,
        success: function (msg) {
            Swal.close();
            var a = msg.d.split("<SPLITER>");
            if (a[0] !== "0" && a[0] !== "-1") {
                Swal.fire({ icon: "success", title: "Éxito", text: a[1],
                            showConfirmButton: false, timer: 2000, timerProgressBar: true });
                limpiarFormClinica();
                setTimeout(function () { cargarClinicasMedico(idMedico); }, 2100);
            } else {
                Swal.fire({ icon: "warning", title: "Atención", text: a[1] });
            }
        },
        error: function () { Swal.close(); Swal.fire({ icon: 'error', title: 'Error', text: 'Error al guardar la clínica.' }); }
    });
}

// Quita el vínculo médico-clínica (baja lógica)
function quitarClinica(idMedicoClinica) {
    Swal.fire({
        title: '¿Quitar esta clínica?',
        text: 'Se quitará la clínica de este médico. No elimina la clínica del sistema.',
        icon: 'warning', showCancelButton: true,
        confirmButtonColor: '#d33', cancelButtonColor: '#6c757d',
        confirmButtonText: 'Sí, quitar', cancelButtonText: 'Cancelar'
    }).then(function (r) {
        if (!r.isConfirmed) return;

        jQuery.ajax({
            type: "POST",
            url: "frmMantenimientoMedicos.aspx/EliminarMedicoClinica",
            data: JSON.stringify({ 'obj_Parametros_JS': [idMedicoClinica.toString(), $.cookie("GLBUNI")] }),
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            cache: false,
            success: function (msg) {
                var a = msg.d.split("<SPLITER>");
                if (a[0] !== "0") {
                    cargarClinicasMedico($.cookie("MEDUNI"));
                } else {
                    Swal.fire({ icon: "error", title: "Error", text: a[1] });
                }
            },
            error: function () {}
        });
    });
}

// ──────────────────────────────────────────────
// PREVISUALIZAR LOGO DE CLÍNICA
// ──────────────────────────────────────────────
function previsualizarLogoClinica() {
    var input = $('#fileLogoClinica')[0];
    if (input.files && input.files[0]) {
        var reader = new FileReader();
        reader.onload = function (e) {
            $("#imgPreviewClinica").attr('src', e.target.result).show();
            $("#txtNoLogoClinica").hide();
        };
        reader.readAsDataURL(input.files[0]);
    } else {
        $("#imgPreviewClinica").attr('src', '').hide();
        $("#txtNoLogoClinica").show();
    }
}

// ──────────────────────────────────────────────
// DATATABLE
// ──────────────────────────────────────────────
function paginar(elemento) {
    var opts = {
        "iDisplayLength": 5,
        "aLengthMenu": [[5, 10, 50, 100], [5, 10, 50, 100]],
        "oLanguage": {
            "sLengthMenu": " Mostrar _MENU_ registros por p&aacute;gina",
            "sZeroRecords": "No se encontraron resultados",
            "sInfo": "Mostrando del _START_ al _END_ de _TOTAL_ registros",
            "sInfoEmpty": "Mostrando 0 registros",
            "sInfoFiltered": "(filtrado de _MAX_ total)",
            "sSearch": "Filtrar:",
            "oPaginate": { "sFirst": "Primero", "sLast": "Último", "sNext": "Siguiente", "sPrevious": "Anterior" }
        },
        paging: true, destroy: true
    };
    if (!$.fn.DataTable.isDataTable(elemento)) $(elemento).DataTable(opts);
    else $(elemento).DataTable($.extend(opts, {}));
}

// ──────────────────────────────────────────────
// TOGGLE PASSWORD
// ──────────────────────────────────────────────
function togglePassword(inputId, btn) {
    var input = document.getElementById(inputId);
    var icon  = btn.querySelector('i');
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.replace('fa-eye', 'fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.replace('fa-eye-slash', 'fa-eye');
    }
}

function _redirectLogin() {
    Swal.fire({ icon: 'error', title: 'Sesión inválida',
                text: 'No se pudo validar el usuario. Por favor inicie sesión.',
                showConfirmButton: false, timer: 4500 });
    setTimeout(function () { location.href = "/Login/frmInicioSesion.aspx"; }, 4500);
}
