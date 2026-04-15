
$(document).ready(function () {

    var PageName = window.location.pathname.split('/').pop();

    if (PageName == 'frmConsultaUsuarios.aspx') {
        cargaListaUsuarios();
    }
    else if (PageName == 'frmMantenimientoUsuarios.aspx') {
        obtieneDetalleUsuario();
    }
});

function limpiarFiltrosUsuarios() {
    $("#bsqCorreo").val("");
    $("#bsqUsuario").val("");
    $("#bsqEstado").val("Activo");
    cargaListaUsuarios();
}

function padecimientosUsuario(id) {
    $.cookie('USRUNI', id, { expires: TLTC, path: '/', domain: g_Dominio });
    location.href = "frmPadecimientosUsuario.aspx";
}

function expedientePaciente(id) {
    $.cookie('USRUNI', id, { expires: TLTC, path: '/', domain: g_Dominio });
    location.href = "frmExpedientePaciente.aspx";
}

function crearUsuario() {
    $.cookie('USRUNI', 0, { expires: TLTC, path: '/', domain: g_Dominio });
    location.href = "frmMantenimientoUsuarios.aspx";
}

function regresar() {
    location.href = "frmConsultaUsuarios.aspx";
}

function cargaListaUsuarios() {
    $.cookie('USRUNI', 0, { expires: TLTC, path: '/', domain: g_Dominio });

    var obj_Parametros_JS = new Array();
    obj_Parametros_JS[0] = $("#bsqCorreo").val();
    obj_Parametros_JS[1] = $("#bsqUsuario").val();
    obj_Parametros_JS[2] = $("#bsqEstado").val();
    obj_Parametros_JS[3] = $.cookie("GLBUNI");

    var parametros = JSON.stringify({ 'obj_Parametros_JS': obj_Parametros_JS });

    if ((obj_Parametros_JS[3] != 0) && (obj_Parametros_JS[3] != undefined)) {

        jQuery.ajax({
            type: "POST",
            url: "frmConsultaUsuarios.aspx/CargaListaUsuarios",
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
                        $("#tblUsuarios").html("");
                        Swal.fire({
                            title: "Búsqueda de Registros",
                            text: res,
                            icon: "info"
                        });
                    }
                    else {
                        $("#tblUsuarios").html(res);
                        paginar("#tblUsuarios");
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

function defineUsuario(uni) {
    $.cookie('USRUNI', uni, { expires: TLTC, path: '/', domain: g_Dominio });
    location.href = "frmMantenimientoUsuarios.aspx";
}

function obtieneDetalleUsuario() {

    var obj_Parametros_JS = new Array();
    obj_Parametros_JS[0] = $.cookie("USRUNI");

    var parametros = JSON.stringify({ 'obj_Parametros_JS': obj_Parametros_JS });

    var usuarioGlobal = $.cookie("GLBUNI");

    if ((usuarioGlobal != 0) && (usuarioGlobal != undefined)) {

        jQuery.ajax({
            type: "POST",
            url: "frmMantenimientoUsuarios.aspx/CargaInfoUsuario",
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
                        Swal.fire({
                            title: "Información de Registros",
                            text: res,
                            icon: "info"
                        });
                    }
                    else {
                        var arreglo = res.split("<SPLITER>");
                        var resultado = arreglo[0];

                        if (resultado != "" && resultado != "0") {
                            // Orden del WebMethod CargaInfoUsuario:
                            // [0] Id_Usuario
                            // [1] Nombre
                            // [2] Prim_Apellido
                            // [3] Seg_Apellido
                            // [4] Cedula
                            // [5] FechaNacimiento (formato dd/MM/yyyy)
                            // [6] Sexo
                            // [6] Telefono
                            // [7] Correo
                            // [8] Observaciones
                            // [9] Estado

                            $("#txtNom").val(arreglo[1]);
                            $("#txtApe1").val(arreglo[2]);
                            $("#txtApe2").val(arreglo[3]);
                            $("#txtCedula").val(arreglo[4]);
                            $("#txtFchNac").val(formatDate(arreglo[5]));
                            $("#txtSexo").val(arreglo[6]);
                            $("#txtTel").val(arreglo[7]);
                            $("#txtEml").val(arreglo[8]);
                            $("#txtObs").val(arreglo[9]);
                            $("#cboSts").val(arreglo[10]);

                            // Modo edición: mostrar campo contraseña (reset de admin)
                            $("#rowPwd").show();
                            $("#txtPwd").val("");
                            $("#txtPwd").attr("placeholder", "Dejar vacío para no cambiar");
                            $("#txtPwd").removeAttr("required");
                        }
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

function formatDate(dateStr) {
    // Convierte dd/MM/yyyy HH:mm:ss a yyyy-MM-dd para input type="date"
    if (!dateStr || dateStr.trim() == "") return "";

    try {
        // Quitar la hora (tomar solo la parte de la fecha)
        var fechaSinHora = dateStr.split(" ")[0]; // "03/02/2026"

        // Dividir en partes
        var dateParts = fechaSinHora.split("/");

        if (dateParts.length != 3) return ""; // Validar formato

        var day = dateParts[0].padStart(2, '0');
        var month = dateParts[1].padStart(2, '0');
        var year = dateParts[2];
        var resultado = `${year}-${month}-${day}`;

        return `${year}-${month}-${day}`; // yyyy-MM-dd
    } catch (e) {
        console.error("Error al formatear fecha:", e, dateStr);
        return "";
    }
}

function mantenimientoUsuario() {
    var obj_Parametros_JS = new Array();

    // Orden según el WebMethod MantenimientoUsuarios:
    // [0] IdUsuario
    // [1] Nombre
    // [2] Prim_Apellido
    // [3] Seg_Apellido
    // [4] Cedula
    // [5] FechaNacimiento
    // [6] Sexo
    // [7] Telefono
    // [8] Correo
    // [9] Observaciones
    // [10] Estado
    // [11] Password
    // [12] IdUsuarioGlobal

    obj_Parametros_JS[0] = $.cookie("USRUNI");
    obj_Parametros_JS[1] = $("#txtNom").val();
    obj_Parametros_JS[2] = $("#txtApe1").val();
    obj_Parametros_JS[3] = $("#txtApe2").val();
    obj_Parametros_JS[4] = $("#txtCedula").val() || $("#txtCedula").attr('value');
    obj_Parametros_JS[5] = $("#txtFchNac").val(); // yyyy-MM-dd del input
    obj_Parametros_JS[6] = $("#txtSexo").val();
    obj_Parametros_JS[7] = $("#txtTel").val();
    obj_Parametros_JS[8] = $("#txtEml").val();
    obj_Parametros_JS[9] = $("#txtObs").val();
    obj_Parametros_JS[10] = $("#cboSts").val();
    obj_Parametros_JS[11] = $("#txtPwd").val();
    obj_Parametros_JS[12] = $.cookie("GLBUNI");

    var parametros = JSON.stringify({ 'obj_Parametros_JS': obj_Parametros_JS });

    if ((obj_Parametros_JS[12] != 0) && (obj_Parametros_JS[12] != undefined)) {

        jQuery.ajax({
            type: "POST",
            url: "frmMantenimientoUsuarios.aspx/MantenimientoUsuarios",
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
                            timer: 4500,
                            timerProgressBar: true
                        });

                        setTimeout(function () {
                            location.href = "frmConsultaUsuarios.aspx";
                        }, 5000);
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

function modulosUsuario(id) {
    $.cookie('USRUNI', id, { expires: TLTC, path: '/', domain: g_Dominio });
    location.href = "frmMantenimientoModulosXUsuario.aspx";
}

function eliminaUsuario(uni) {
    eliminarUsuarioInterno(uni, false); // Primera llamada sin forzar
}

function eliminarUsuarioInterno(uni, forzar) {
    var obj_Parametros_JS = new Array();
    obj_Parametros_JS[0] = uni;
    obj_Parametros_JS[1] = $.cookie("GLBUNI");
    obj_Parametros_JS[2] = forzar ? "1" : "0"; // ✅ NUEVO parámetro

    var parametros = JSON.stringify({ 'obj_Parametros_JS': obj_Parametros_JS });

    if ((obj_Parametros_JS[1] != 0) && (obj_Parametros_JS[1] != undefined)) {
        jQuery.ajax({
            type: "POST",
            url: "frmMantenimientoUsuarios.aspx/EliminarUsuarios",
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

                    if (resultado != "0" && resultado != "-1") {
                        // ✅ ÉXITO
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
                            cargaListaUsuarios();
                        }, 3000);
                    }
                    else if (resultado == "-1") {
                        // ✅ DEPENDENCIAS - Preguntar si quiere forzar
                        Swal.fire({
                            title: "¿Eliminar de todas formas?",
                            text: arreglo[1],
                            icon: "warning",
                            showCancelButton: true,
                            confirmButtonColor: '#d33',
                            cancelButtonColor: '#3085d6',
                            confirmButtonText: 'Sí, eliminar todo',
                            cancelButtonText: 'Cancelar'
                        }).then((result) => {
                            if (result.isConfirmed) {
                                // ✅ Llamar de nuevo FORZANDO la eliminación
                                eliminarUsuarioInterno(uni, true);
                            }
                        });
                    }
                    else {
                        // ✅ ERROR
                        Swal.fire({
                            icon: "error",
                            title: "Error",
                            text: arreglo[1],
                        });
                    }
                }
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



// ========================================
// CONSULTA DE CÉDULA EN API
// ========================================

function consultarCedulaAPI() {
    var cedula = $("#txtCedula").val().trim();

    // Validar que haya ingresado una cédula
    if (cedula == "") {
        Swal.fire({
            icon: "warning",
            title: "Validación",
            text: "Por favor ingrese un número de cédula"
        });
        return;
    }

    // Mostrar indicador de carga
    Swal.fire({
        title: 'Consultando cédula...',
        text: 'Por favor espere',
        allowOutsideClick: false,
        showConfirmButton: false,
        willOpen: () => {
            Swal.showLoading();
        }
    });

    var obj_Parametros_JS = new Array();
    obj_Parametros_JS[0] = cedula;

    var parametros = JSON.stringify({ 'obj_Parametros_JS': obj_Parametros_JS });

    jQuery.ajax({
        type: "POST",
        url: "frmMantenimientoUsuarios.aspx/ConsultarCedulaAPI",
        data: parametros,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        cache: false,
        success: function (msg) {
            var res = msg.d;

            Swal.close();

            if (res === undefined) {
                Swal.fire({
                    title: "Error en la conexión",
                    text: "Error de conexión al servicio",
                    icon: "error"
                });
            }
            else {
                var arreglo = res.split("<SPLITER>");
                var resultado = arreglo[0];

                if (resultado == "NO_ENCONTRADO") {
                    Swal.fire({
                        icon: "info",
                        title: "Cédula no encontrada",
                        text: arreglo[1],
                        footer: "Puede ingresar los datos manualmente"
                    });
                }
                else if (resultado == "ERROR") {
                    Swal.fire({
                        icon: "error",
                        title: "Error en la consulta",
                        text: arreglo[1]
                    });
                }
                else {
                    // Resultado exitoso
                    // arreglo[0] = Nombre
                    // arreglo[1] = Primer Apellido
                    // arreglo[2] = Segundo Apellido
                    // arreglo[3] = Tipo (FISICO o JURIDICO)

                    var nombre = arreglo[0];
                    var primerApellido = arreglo[1];
                    var segundoApellido = arreglo[2];
                    var tipo = arreglo[3];

                    // Llenar los campos automáticamente
                    $("#txtNom").val(formatearNombre(nombre));      
                    $("#txtApe1").val(formatearNombre(primerApellido)); 
                    $("#txtApe2").val(formatearNombre(segundoApellido));

                    Swal.fire({
                        icon: "success",
                        title: "¡Datos encontrados!",
                        html: "<strong>Nombre:</strong> " + formatearNombre(nombre) + "<br>" +
                            "<strong>Primer Apellido:</strong> " + formatearNombre(primerApellido) + "<br>" +
                            "<strong>Segundo Apellido:</strong> " + formatearNombre(segundoApellido) + "<br>" +
                            "<strong>Tipo:</strong> " + tipo,
                        timer: 3000,
                        timerProgressBar: true
                    });

                    // Enfocar en el siguiente campo (Fecha de Nacimiento)
                    $("#txtFechaNacimiento").focus();
                }
            }
        },
        failure: function (msg) {
            Swal.close();
            Swal.fire({
                title: "Error",
                text: "Error al consultar la API",
                icon: "error"
            });
        },
        error: function (msg) {
            Swal.close();
            Swal.fire({
                title: "Error",
                text: "Error al consultar la API",
                icon: "error"
            });
        }
    });
}



function validarCampos() {
    var nombre = $('#txtNombre').val();
    var primerApellido = $('#txtPrimerApellido').val();
    var cedula = $('#txtCedula').val();
    var fechaNacimiento = $('#txtFechaNacimiento').val();
    var sexo = $('#cboSexo').val();  // ✅ NUEVO
    var telefono = $('#txtTelefono').val();
    var correo = $('#txtCorreo').val();

    if (!nombre || !primerApellido || !cedula || !fechaNacimiento || !sexo || !telefono || !correo) {
        Swal.fire({
            icon: 'warning',
            title: 'Campos incompletos',
            text: 'Por favor complete todos los campos obligatorios'
        });
        return false;
    }

    // Validar formato email
    var regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regexEmail.test(correo)) {
        Swal.fire({
            icon: 'warning',
            title: 'Email inválido',
            text: 'Por favor ingrese un email válido'
        });
        return false;
    }

    return true;
}

function limpiarDatos() {
    $('#txtNombre').val('');
    $('#txtPrimerApellido').val('');
    $('#txtSegundoApellido').val('');
    $('#txtCedula').val('');
    $('#txtFechaNacimiento').val('');
    $('#cboSexo').val('');  // ✅ NUEVO
    $('#txtTelefono').val('');
    $('#txtCorreo').val('');
    $('#txtObservaciones').val('');
    $('#txtPasswordHash').val('');
    $('#cboEstado').val('A');
}

// ========================================
// FUNCIÓN AUXILIAR: Formatear nombres
// ========================================
// La API devuelve nombres en MAYÚSCULAS, esta función los formatea a "Título"
function formatearNombre(nombre) {
    if (!nombre || nombre.trim() == "") return "";

    return nombre.toLowerCase().split(' ').map(function (palabra) {
        // Convertir la primera letra a mayúscula y el resto a minúscula
        return palabra.charAt(0).toUpperCase() + palabra.slice(1);
    }).join(' ');
}

function togglePassword(inputId, btn) {
    var input = document.getElementById(inputId);
    var icon = btn.querySelector('i');
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.replace('fa-eye', 'fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.replace('fa-eye-slash', 'fa-eye');
    }
}