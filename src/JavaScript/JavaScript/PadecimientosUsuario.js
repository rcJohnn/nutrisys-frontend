$(document).ready(function () {
    var PageName = window.location.pathname.split('/').pop();

    if (PageName == 'frmPadecimientosUsuario.aspx') {
        cargaInfoUsuario();
        cargaPadecimientosDisponibles();
        cargaPadecimientosUsuario();
    }
});

function regresar() {
    location.href = "frmConsultaUsuarios.aspx";
}

// Cargar información básica del usuario
function cargaInfoUsuario() {
    var obj_Parametros_JS = new Array();
    obj_Parametros_JS[0] = $.cookie("USRUNI");

    var parametros = JSON.stringify({ 'obj_Parametros_JS': obj_Parametros_JS });

    var usuarioGlobal = $.cookie("GLBUNI");

    if ((usuarioGlobal != 0) && (usuarioGlobal != undefined)) {
        jQuery.ajax({
            type: "POST",
            url: "frmPadecimientosUsuario.aspx/CargaInfoUsuario",
            data: parametros,
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            cache: false,
            success: function (msg) {
                var res = msg.d;

                if (res === undefined || res.indexOf("Error") > -1) {
                    Swal.fire({
                        title: "Error en la conexión",
                        text: "Error al cargar la información del usuario",
                        icon: "error"
                    });
                }
                else {
                    var arreglo = res.split("<SPLITER>");
                    $("#lblNombreUsuario strong").text(arreglo[0]);
                    $("#lblCorreoUsuario strong").text(arreglo[1]);
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
            position: 'center',
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

// Cargar padecimientos disponibles en el combo
function cargaPadecimientosDisponibles() {
    var obj_Parametros_JS = new Array();

    var parametros = JSON.stringify({ 'obj_Parametros_JS': obj_Parametros_JS });

    var usuarioGlobal = $.cookie("GLBUNI");

    if ((usuarioGlobal != 0) && (usuarioGlobal != undefined)) {
        jQuery.ajax({
            type: "POST",
            url: "frmPadecimientosUsuario.aspx/CargaListaPadecimientos",
            data: parametros,
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            cache: false,
            success: function (msg) {
                var res = msg.d;

                if (res === undefined || res.indexOf("Error") > -1) {
                    Swal.fire({
                        title: "Error en la conexión",
                        text: "Error al cargar los padecimientos",
                        icon: "error"
                    });
                }
                else {
                    $("#cboPadecimientos").append(res);
                }
            },
            failure: function (msg) {
            },
            error: function (msg) {
            }
        });
    }
}

// Cargar padecimientos asignados al usuario
function cargaPadecimientosUsuario() {
    var obj_Parametros_JS = new Array();
    obj_Parametros_JS[0] = $.cookie("USRUNI");

    var parametros = JSON.stringify({ 'obj_Parametros_JS': obj_Parametros_JS });

    var usuarioGlobal = $.cookie("GLBUNI");

    if ((usuarioGlobal != 0) && (usuarioGlobal != undefined)) {
        jQuery.ajax({
            type: "POST",
            url: "frmPadecimientosUsuario.aspx/CargaListaPadecimientosUsuario",
            data: parametros,
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            cache: false,
            success: function (msg) {
                var res = msg.d;

                if (res === undefined || res.indexOf("Error") > -1) {
                    Swal.fire({
                        title: "Error en la conexión",
                        text: "Error al cargar los padecimientos del usuario",
                        icon: "error"
                    });
                }
                else {
                    if (res === "No tiene padecimientos asignados") {
                        $("#tblPadecimientos").html(
                            "<tr><td colspan='3' class='text-center text-muted'>" +
                            "<i class='fa fa-info-circle'></i> " + res +
                            "</td></tr>"
                        );
                    }
                    else {
                        $("#tblPadecimientos").html(res);
                    }
                }
            },
            failure: function (msg) {
            },
            error: function (msg) {
            }
        });
    }
}

// Asignar padecimiento al usuario
function asignarPadecimiento() {
    var idPadecimiento = $("#cboPadecimientos").val();

    if (idPadecimiento == "0" || idPadecimiento == null) {
        Swal.fire({
            icon: "warning",
            title: "Validación",
            text: "Por favor seleccione un padecimiento"
        });
        return;
    }

    var obj_Parametros_JS = new Array();
    obj_Parametros_JS[0] = $.cookie("USRUNI");
    obj_Parametros_JS[1] = idPadecimiento;
    obj_Parametros_JS[2] = $.cookie("GLBUNI");

    var parametros = JSON.stringify({ 'obj_Parametros_JS': obj_Parametros_JS });

    if ((obj_Parametros_JS[2] != 0) && (obj_Parametros_JS[2] != undefined)) {
        jQuery.ajax({
            type: "POST",
            url: "frmPadecimientosUsuario.aspx/AsignarPadecimiento",
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
                    var arreglo = res.split("<SPLITER>");
                    var resultado = arreglo[0];

                    if ((resultado != "0") && (resultado != "-1")) {
                        Swal.fire({
                            position: 'center',
                            icon: "success",
                            title: "Información de Registros",
                            text: arreglo[1],
                            showConfirmButton: false,
                            timer: 2500,
                            timerProgressBar: true
                        });

                        // Resetear combo
                        $("#cboPadecimientos").val("0");

                        // Recargar lista
                        setTimeout(function () {
                            cargaPadecimientosUsuario();
                        }, 2600);
                    }
                    else {
                        Swal.fire({
                            icon: "info",
                            title: "Información de Registros",
                            text: arreglo[1],
                        });
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
            position: 'center',
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

// Eliminar padecimiento del usuario
function eliminarPadecimiento(idPadecimiento) {
    Swal.fire({
        title: '¿Está seguro?',
        text: "Se eliminará este padecimiento del usuario",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            var obj_Parametros_JS = new Array();
            obj_Parametros_JS[0] = $.cookie("USRUNI");
            obj_Parametros_JS[1] = idPadecimiento;
            obj_Parametros_JS[2] = $.cookie("GLBUNI");

            var parametros = JSON.stringify({ 'obj_Parametros_JS': obj_Parametros_JS });

            if ((obj_Parametros_JS[2] != 0) && (obj_Parametros_JS[2] != undefined)) {
                jQuery.ajax({
                    type: "POST",
                    url: "frmPadecimientosUsuario.aspx/EliminarPadecimiento",
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
                            var arreglo = res.split("<SPLITER>");
                            var resultado = arreglo[0];

                            if ((resultado != "0") && (resultado != "-1")) {
                                Swal.fire({
                                    position: 'center',
                                    icon: "success",
                                    title: "Información de Registros",
                                    text: arreglo[1],
                                    showConfirmButton: false,
                                    timer: 2500,
                                    timerProgressBar: true
                                });

                                setTimeout(function () {
                                    cargaPadecimientosUsuario();
                                }, 2600);
                            }
                            else {
                                Swal.fire({
                                    icon: "info",
                                    title: "Información de Registros",
                                    text: arreglo[1],
                                });
                            }
                        }
                    },
                    failure: function (msg) {
                    },
                    error: function (msg) {
                    }
                });
            }
        }
    });
}