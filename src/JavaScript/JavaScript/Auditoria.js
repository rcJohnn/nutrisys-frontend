$(document).ready(function () {
    cargaUsuarios();
    cargaTiposEntidad();
    cargaAcciones();
    cargaListaAuditoria(); // Cargar todos al inicio
});

function cargaUsuarios() {
    var obj_Parametros_JS = new Array();
    obj_Parametros_JS[0] = $.cookie("GLBUNI");

    var parametros = JSON.stringify({ 'obj_Parametros_JS': obj_Parametros_JS });

    if ((obj_Parametros_JS[0] != 0) && (obj_Parametros_JS[0] != undefined)) {

        jQuery.ajax({
            type: "POST",
            url: "frmConsultaAuditoria.aspx/CargaListaUsuariosCombo",
            data: parametros,
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            cache: false,
            success: function (msg) {
                var res = msg.d;

                if (res === undefined) {
                    Swal.fire({
                        title: "Error en la conexión",
                        text: "Error de conexión a la base de datos",
                        icon: "error"
                    });
                }
                else {
                    if (res === "No se encontraron registros") {
                        $("#bsqUsuario").html('<option value="0">-- Todos --</option>');
                        Swal.fire({
                            title: "Información de Registros",
                            text: res,
                            icon: "info"
                        });
                    }
                    else {
                        $("#bsqUsuario").html('<option value="0">-- Todos --</option>' + res);
                    }
                }
            },
            failure: function (msg) {
            },
            error: function (msg) {
            }
        });
    }
    else {
        Swal.fire({
            position: 'center-center',
            icon: 'error',
            title: 'Error en la conexión',
            text: "No se ha podido validar la información del usuario. Por favor, inicie sesión en el sistema",
            showConfirmButton: false,
            timer: 4500,
            timerProgressBar: true
        });

        setTimeout(function () {
            location.href = "/Login/frmInicioSesion.aspx";
        }, 4500);
    }
}

function cargaTiposEntidad() {
    // Cargar tipos de entidad estáticos
    $("#bsqTipoEntidad").html(
        '<option value="">-- Todos --</option>' +
        '<option value="U">Usuario</option>' +
        '<option value="M">Médico</option>'
    );
}

function cargaAcciones() {
    // Cargar acciones estáticas
    $("#bsqAccion").html(
        '<option value="">-- Todas --</option>' +
        '<option value="I">Inicio Sesión</option>' +
        '<option value="C">Cierre Sesión</option>' +
        '<option value="A">Actualización</option>' +
        '<option value="E">Eliminación</option>'
    );
}

function cargaListaAuditoria() {
    var obj_Parametros_JS = new Array();

    // Obtener el valor seleccionado y su tipo
    var selectedOption = $("#bsqUsuario option:selected");
    var idEntidad = selectedOption.val() || "0";
    var tipoEntidad = selectedOption.attr("data-tipo") || "";

    // Si el usuario seleccionó un filtro específico de TipoEntidad en el combo, usarlo
    var tipoFiltro = $("#bsqTipoEntidad").val();
    if (tipoFiltro !== "") {
        tipoEntidad = tipoFiltro;
    }

    obj_Parametros_JS[0] = idEntidad;                               // Id_Entidad
    obj_Parametros_JS[1] = tipoEntidad;                             // TipoEntidad (U/M)
    obj_Parametros_JS[2] = $("#bsqAccion").val() || "";             // Accion (I/C/A/E)
    obj_Parametros_JS[3] = $("#bsqFdd").val() || "";                // FechaDesde
    obj_Parametros_JS[4] = $("#bsqFhh").val() || "";                // FechaHasta

    var parametros = JSON.stringify({ 'obj_Parametros_JS': obj_Parametros_JS });

    var usuarioGlobal = $.cookie("GLBUNI");

    if ((usuarioGlobal != 0) && (usuarioGlobal != undefined)) {

        jQuery.ajax({
            type: "POST",
            url: "frmConsultaAuditoria.aspx/CargaListaAuditoria",
            data: parametros,
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            cache: false,
            success: function (msg) {
                var res = msg.d;

                if (res === undefined) {
                    Swal.fire({
                        title: "Error en la conexión",
                        text: "Error de conexión a la base de datos",
                        icon: "error"
                    });
                }
                else {
                    if (res === "No se encontraron registros") {
                        $("#tblAuditoria").html("");
                        Swal.fire({
                            title: "Búsqueda de Registros",
                            text: res,
                            icon: "info"
                        });
                    }
                    else {
                        $("#tblAuditoria").html(res);
                        paginar("#tblAuditoria");
                    }
                }
            },
            failure: function (msg) {
            },
            error: function (xhr, err) {
                console.error("Error AJAX:", xhr.responseText);
                Swal.fire({
                    title: "Error",
                    text: "Error al cargar la auditoría",
                    icon: "error"
                });
            }
        });
    }
    else {
        Swal.fire({
            position: 'center-center',
            icon: 'error',
            title: 'Error en la conexión',
            text: "No se ha podido validar la información del usuario. Por favor, inicie sesión en el sistema",
            showConfirmButton: false,
            timer: 4500,
            timerProgressBar: true
        });

        setTimeout(function () {
            location.href = "/Login/frmInicioSesion.aspx";
        }, 4500);
    }
}
function paginar(elemento) {
    var table;

    if ($.fn.DataTable.isDataTable(elemento)) {
        table = $(elemento).DataTable({
            "iDisplayLength": 5,
            "aLengthMenu": [[5, 10, 50, 100], [5, 10, 50, 100]],
            "oLanguage": {
                "sLengthMenu": " Mostrar _MENU_  registros por p&aacute;gina",
                "sProcessing": "Procesando...",
                "sZeroRecords": "No se encontraron resultados",
                "sEmptyTable": "Ningún dato disponible en esta tabla",
                "sInfo": "Mostrando registros del _START_ al _END_ de un total de _TOTAL_ registros",
                "sInfoEmpty": "Mostrando registros del 0 al 0 de un total de 0 registros",
                "sInfoFiltered": "(filtrado de un total de _MAX_ registros)",
                "sInfoPostFix": "",
                "sSearch": "Filtrar:",
                "sUrl": "",
                "sInfoThousands": ",",
                "sLoadingRecords": "Cargando...",
                "oPaginate": {
                    "sFirst": "Primero",
                    "sLast": "Último",
                    "sNext": "Siguiente",
                    "sPrevious": "Anterior"
                }
            },
            paging: true,
            destroy: true
        });
    }
    else {
        table = $(elemento).DataTable({
            "iDisplayLength": 5,
            "aLengthMenu": [[5, 10, 50, 100], [5, 10, 50, 100]],
            "oLanguage": {
                "sLengthMenu": " Mostrar _MENU_  registros por p&aacute;gina",
                "sProcessing": "Procesando...",
                "sZeroRecords": "No se encontraron resultados",
                "sEmptyTable": "Ningún dato disponible en esta tabla",
                "sInfo": "Mostrando registros del _START_ al _END_ de un total de _TOTAL_ registros",
                "sInfoEmpty": "Mostrando registros del 0 al 0 de un total de 0 registros",
                "sInfoFiltered": "(filtrado de un total de _MAX_ registros)",
                "sInfoPostFix": "",
                "sSearch": "Filtrar:",
                "sUrl": "",
                "sInfoThousands": ",",
                "sLoadingRecords": "Cargando...",
                "oPaginate": {
                    "sFirst": "Primero",
                    "sLast": "Último",
                    "sNext": "Siguiente",
                    "sPrevious": "Anterior"
                }
            },
            paging: true,
            destroy: true
        });
    }
} $(document).ready(function () {
    cargaUsuarios();
    cargaTiposEntidad();
    cargaAcciones();
    cargaListaAuditoria(); // Cargar todos al inicio
});

function cargaUsuarios() {
    var obj_Parametros_JS = new Array();
    obj_Parametros_JS[0] = $.cookie("GLBUNI");

    var parametros = JSON.stringify({ 'obj_Parametros_JS': obj_Parametros_JS });

    if ((obj_Parametros_JS[0] != 0) && (obj_Parametros_JS[0] != undefined)) {

        jQuery.ajax({
            type: "POST",
            url: "frmConsultaAuditoria.aspx/CargaListaUsuariosCombo",
            data: parametros,
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            cache: false,
            success: function (msg) {
                var res = msg.d;

                if (res === undefined) {
                    Swal.fire({
                        title: "Error en la conexión",
                        text: "Error de conexión a la base de datos",
                        icon: "error"
                    });
                }
                else {
                    if (res === "No se encontraron registros") {
                        $("#bsqUsuario").html('<option value="0">-- Todos --</option>');
                        Swal.fire({
                            title: "Información de Registros",
                            text: res,
                            icon: "info"
                        });
                    }
                    else {
                        $("#bsqUsuario").html('<option value="0">-- Todos --</option>' + res);
                    }
                }
            },
            failure: function (msg) {
            },
            error: function (msg) {
            }
        });
    }
    else {
        Swal.fire({
            position: 'center-center',
            icon: 'error',
            title: 'Error en la conexión',
            text: "No se ha podido validar la información del usuario. Por favor, inicie sesión en el sistema",
            showConfirmButton: false,
            timer: 4500,
            timerProgressBar: true
        });

        setTimeout(function () {
            location.href = "/Login/frmInicioSesion.aspx";
        }, 4500);
    }
}

function cargaTiposEntidad() {
    // Cargar tipos de entidad estáticos
    $("#bsqTipoEntidad").html(
        '<option value="">-- Todos --</option>' +
        '<option value="U">Usuario</option>' +
        '<option value="M">Médico</option>'
    );
}

function cargaAcciones() {
    // Cargar acciones estáticas
    $("#bsqAccion").html(
        '<option value="">-- Todas --</option>' +
        '<option value="I">Inicio Sesión</option>' +
        '<option value="C">Cierre Sesión</option>' +
        '<option value="A">Actualización</option>' +
        '<option value="E">Eliminación</option>'
    );
}

function cargaListaAuditoria() {
    var obj_Parametros_JS = new Array();

    // 🔹 CORRECCIÓN: Ahora son 5 parámetros para coincidir con el WebMethod
    obj_Parametros_JS[0] = $("#bsqUsuario").val() || "0";           // Id_Entidad
    obj_Parametros_JS[1] = $("#bsqTipoEntidad").val() || "";        // TipoEntidad (U/M)
    obj_Parametros_JS[2] = $("#bsqAccion").val() || "";             // Accion (I/C/A/E)
    obj_Parametros_JS[3] = $("#bsqFdd").val() || "";                // FechaDesde
    obj_Parametros_JS[4] = $("#bsqFhh").val() || "";                // FechaHasta

    var parametros = JSON.stringify({ 'obj_Parametros_JS': obj_Parametros_JS });

    var usuarioGlobal = $.cookie("GLBUNI");

    if ((usuarioGlobal != 0) && (usuarioGlobal != undefined)) {

        jQuery.ajax({
            type: "POST",
            url: "frmConsultaAuditoria.aspx/CargaListaAuditoria",
            data: parametros,
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            cache: false,
            success: function (msg) {
                var res = msg.d;

                if (res === undefined) {
                    Swal.fire({
                        title: "Error en la conexión",
                        text: "Error de conexión a la base de datos",
                        icon: "error"
                    });
                }
                else {
                    if (res === "No se encontraron registros") {
                        $("#tblAuditoria").html("");
                        Swal.fire({
                            title: "Búsqueda de Registros",
                            text: res,
                            icon: "info"
                        });
                    }
                    else {
                        $("#tblAuditoria").html(res);
                        paginar("#tblAuditoria");
                    }
                }
            },
            failure: function (msg) {
            },
            error: function (xhr, err) {
                console.error("Error AJAX:", xhr.responseText);
                Swal.fire({
                    title: "Error",
                    text: "Error al cargar la auditoría: " + xhr.responseText,
                    icon: "error"
                });
            }
        });
    }
    else {
        Swal.fire({
            position: 'center-center',
            icon: 'error',
            title: 'Error en la conexión',
            text: "No se ha podido validar la información del usuario. Por favor, inicie sesión en el sistema",
            showConfirmButton: false,
            timer: 4500,
            timerProgressBar: true
        });

        setTimeout(function () {
            location.href = "/Login/frmInicioSesion.aspx";
        }, 4500);
    }
}
function limpiarFiltros() {
    $("#bsqUsuario").val("0");
    $("#bsqTipoEntidad").val("");
    $("#bsqAccion").val("");
    $("#bsqFdd").val("");
    $("#bsqFhh").val("");
    cargaListaAuditoria(); // Recargar todos los registros
}

function paginar(elemento) {
    var table;

    if ($.fn.DataTable.isDataTable(elemento)) {
        table = $(elemento).DataTable({
            "iDisplayLength": 5,
            "aLengthMenu": [[5, 10, 50, 100], [5, 10, 50, 100]],
            "oLanguage": {
                "sLengthMenu": " Mostrar _MENU_  registros por p&aacute;gina",
                "sProcessing": "Procesando...",
                "sZeroRecords": "No se encontraron resultados",
                "sEmptyTable": "Ningún dato disponible en esta tabla",
                "sInfo": "Mostrando registros del _START_ al _END_ de un total de _TOTAL_ registros",
                "sInfoEmpty": "Mostrando registros del 0 al 0 de un total de 0 registros",
                "sInfoFiltered": "(filtrado de un total de _MAX_ registros)",
                "sInfoPostFix": "",
                "sSearch": "Filtrar:",
                "sUrl": "",
                "sInfoThousands": ",",
                "sLoadingRecords": "Cargando...",
                "oPaginate": {
                    "sFirst": "Primero",
                    "sLast": "Último",
                    "sNext": "Siguiente",
                    "sPrevious": "Anterior"
                }
            },
            paging: true,
            destroy: true
        });
    }
    else {
        table = $(elemento).DataTable({
            "iDisplayLength": 5,
            "aLengthMenu": [[5, 10, 50, 100], [5, 10, 50, 100]],
            "oLanguage": {
                "sLengthMenu": " Mostrar _MENU_  registros por p&aacute;gina",
                "sProcessing": "Procesando...",
                "sZeroRecords": "No se encontraron resultados",
                "sEmptyTable": "Ningún dato disponible en esta tabla",
                "sInfo": "Mostrando registros del _START_ al _END_ de un total de _TOTAL_ registros",
                "sInfoEmpty": "Mostrando registros del 0 al 0 de un total de 0 registros",
                "sInfoFiltered": "(filtrado de un total de _MAX_ registros)",
                "sInfoPostFix": "",
                "sSearch": "Filtrar:",
                "sUrl": "",
                "sInfoThousands": ",",
                "sLoadingRecords": "Cargando...",
                "oPaginate": {
                    "sFirst": "Primero",
                    "sLast": "Último",
                    "sNext": "Siguiente",
                    "sPrevious": "Anterior"
                }
            },
            paging: true,
            destroy: true
        });
    }
}