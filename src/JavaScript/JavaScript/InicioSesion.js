var g_Dominio = "localhost";
var TLTC = 60;

$(document).ready(function () {

    //Evalua la página en la que estoy para determinar si ejecuto la función o no
    var pageName = window.location.pathname.split('/').pop();

    if (pageName !== 'frmInicioSesion.aspx') {
        cargaOpcionesUsuario();
    } 

});

function cargaOpcionesUsuario() {
    $("#nombreUsuario").text($.cookie("GLBDSC"));
    $("#emlUsuario").text($.cookie("GLBCOD"));
    $("#lblNombreUsuario").text($.cookie("GLBDSC"));
    $("#lblEmlUsuario").text($.cookie("GLBCOD"));

    var obj_Parametros_JS = new Array();
    obj_Parametros_JS[0] = $.cookie("GLBUNI");
    obj_Parametros_JS[1] = $.cookie("GLBTYP"); // ← NUEVO: Tipo U o M

    var parametros = JSON.stringify({ 'obj_Parametros_JS': obj_Parametros_JS });

    if ((obj_Parametros_JS[0] != 0) && (obj_Parametros_JS[0] != undefined)) {
        jQuery.ajax({
            type: "POST",
            url: "/Login/frmInicioSesion.aspx/cargaOpcionesMenuUsuarios",
            data: parametros,
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            cache: false,
            success: function (msg) {
                var res = msg.d;
                if (res === undefined) {
                    Swal.fire({
                        title: "Error en la conexión",
                        text: "Error de Conexión a la base de datos. Por favor, contacte al administrador del sistema.",
                        icon: "error"
                    });
                }
                else {
                    if (res === "No se encontraron registros") {
                        Swal.fire({
                            title: "Permisos de Usuario",
                            text: "El usuario no tiene permisos asignados para el acceso a las opciones del sistema. Por favor, contacte al administrador del sistema.",
                            icon: "error"
                        });
                    } else {
                        $("#menu").html(res);
                    }
                }
            },
            failure: function (msg) {
            },
            error: function (xhr, err) {
                console.error("Error:", xhr.responseText);
            }
        });
    }
    else {
        Swal.fire({
            position: 'center-center',
            icon: 'error',
            title: "Error en la conexión",
            text: "No se ha podido validar la información del usuario. Por favor, inicie Sesión en el Sistema.",
            showConfirmButton: false,
            timer: 4500,
            timerProgressBar: true
        });
        setTimeout(function () {
            location.href = "/Login/frmInicioSesion.aspx";
        }, 5000);
    }
}

function cerrarSesion() {
    var obj_Parametros_JS = new Array();
    obj_Parametros_JS[0] = $.cookie("GLBUNI");
    obj_Parametros_JS[1] = $.cookie("GLBTYP");
    var parametros = JSON.stringify({ 'obj_Parametros_JS': obj_Parametros_JS });

    jQuery.ajax({
        type: "POST",
        url: "/Login/frmInicioSesion.aspx/CierreSesionUsuarios",
        data: parametros,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        cache: false,
        success: function (msg) {


            var res = msg.d;
            if (res === undefined) {
                Swal.fire({
                    title: "Error en la conexión",
                    text: "Error de Conexión a la base de datos. Por favor, contacte al administrador del sistema.",
                    icon: "error"
                });
            }
            else {
                var arreglo = new Array();
                var str;

                str = res;
                arreglo = (str.split("<SPLITER>"));

                var resultado = arreglo[0];

                if ((resultado != "0") && (resultado != "-1")) {

                    //COOKIES DEL USUARIO GLOBAL
                    $.cookie('GLBUNI', null, { expires: -1, path: '/', domain: g_Dominio }); //ID DE USUARIO GLOBAL
                    $.cookie('GLBCOD', null, { expires: -1, path: '/', domain: g_Dominio }); //EMAIL DE USUARIO GLOBAL
                    $.cookie('GLBDSC', null, { expires: -1, path: '/', domain: g_Dominio }); //NOMBRE DE USUARIO 
                    $.cookie('GLBTYP', null, { expires: -1, path: '/', domain: g_Dominio });


                    Swal.fire({
                        position: 'center-center',
                        icon: 'success',
                        title: "Cierre de Sesión",
                        text: "Gracias, Hasta pronto!!!",
                        showConfirmButton: false,
                        timer: 4500,
                        timerProgressBar: true
                    });
                    // se redirecciona al index
                    setTimeout(function () {

                        location.href = "/Login/frmInicioSesion.aspx";
                    }, 5000);

                } else {

                    Swal.fire({
                        position: 'center-center',
                        icon: 'error',
                        title: "Cierre de Sesión",
                        text: "No se pudo cerrar la sesión, intente más tarde.",
                        showConfirmButton: false,
                        timer: 4500,
                        timerProgressBar: true
                    });
                }
            }
        },
        failure: function (msg) {
        },
        error: function (xhr, err) {
            Swal.fire({
                title: "Error",
                text: xhr.responseText,
                icon: "error"
            });
        }
    });

}




function inicioSesion() {
    var obj_Parametros_JS = new Array();

    obj_Parametros_JS[0] = $("#txtUsuario").val();
    obj_Parametros_JS[1] = $("#txtPassword").val(); // ← Enviar en texto plano

    var parametros = JSON.stringify({ 'obj_Parametros_JS': obj_Parametros_JS });

    jQuery.ajax({
        type: "POST",
        url: "frmInicioSesion.aspx/InicioSesionUsuarios",
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
                var arreglo = new Array();
                var str;

                str = res;
                arreglo = (str.split("<SPLITER>"));

                var resultado = arreglo[0];

                if (resultado === 'OTP') {
                    // Credenciales válidas → pedir código enviado al correo
                    var correoMasked = arreglo[1];
                    var correoIngresado = $("#txtUsuario").val();
                    Swal.fire({
                        title: '🔐 Verificación en dos pasos',
                        html: '<p style="margin-bottom:12px;">Se envió un código de 6 dígitos a<br><strong>' + correoMasked + '</strong></p>',
                        input: 'text',
                        inputAttributes: { maxlength: '6', autocomplete: 'off', style: 'text-align:center;font-size:22px;letter-spacing:8px;font-family:monospace;' },
                        inputPlaceholder: '000000',
                        confirmButtonText: 'Verificar',
                        confirmButtonColor: '#4f46e5',
                        allowOutsideClick: false,
                        showCancelButton: false,
                        inputValidator: function (value) {
                            if (!value || value.length !== 6 || isNaN(value))
                                return 'Ingrese el código de 6 dígitos enviado a su correo';
                        }
                    }).then(function (result) {
                        if (result.isConfirmed) {
                            verificarOTP(correoIngresado, result.value);
                        }
                    });
                }
                else if ((resultado != "0") && (resultado != "-1")) {
                    establecerSesionYRedirigir(arreglo);
                }
                else {
                    Swal.fire({
                        position: 'center-center',
                        icon: 'error',
                        title: 'Inicio de Sesión',
                        text: arreglo[1],
                        showConfirmButton: false,
                        timer: 4500,
                        timerProgressBar: true
                    });
                }
            }
        },
        failure: function (msg) {
        },
        error: function (xhr, err) {
            console.error("Error AJAX:", xhr.responseText);
        }
    });
}

function establecerSesionYRedirigir(arreglo) {
    $.cookie('GLBUNI', arreglo[0], { expires: TLTC, path: '/', domain: g_Dominio });
    $.cookie('GLBCOD', arreglo[2], { expires: TLTC, path: '/', domain: g_Dominio });
    $.cookie('GLBDSC', arreglo[3], { expires: TLTC, path: '/', domain: g_Dominio });
    $.cookie('GLBTYP', arreglo[4], { expires: TLTC, path: '/', domain: g_Dominio });
    Swal.fire({
        position: 'center-center',
        icon: 'success',
        title: 'Inicio de Sesión',
        text: arreglo[1],
        showConfirmButton: false,
        timer: 4500,
        timerProgressBar: true
    });
    setTimeout(function () {
        location.href = "../Mantenimientos/frmPrincipal.aspx";
    }, 4500);
}

function verificarOTP(correo, codigo) {
    var obj_Parametros_JS = [correo, codigo];
    var parametros = JSON.stringify({ 'obj_Parametros_JS': obj_Parametros_JS });

    jQuery.ajax({
        type: "POST",
        url: "frmInicioSesion.aspx/VerificarOTP",
        data: parametros,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        cache: false,
        success: function (msg) {
            var res = msg.d;
            if (!res) {
                Swal.fire({ icon: 'error', title: 'Error', text: 'Error de conexión.' });
                return;
            }
            var arreglo = res.split("<SPLITER>");
            var resultado = arreglo[0];

            if (resultado !== "0" && resultado !== "-1") {
                establecerSesionYRedirigir(arreglo);
            } else {
                var esInvalido = arreglo[1] && arreglo[1].indexOf('Demasiados') === 0;
                Swal.fire({
                    icon: 'error',
                    title: esInvalido ? 'Verificación bloqueada' : 'Código incorrecto',
                    text: arreglo[1],
                    confirmButtonColor: '#4f46e5'
                });
            }
        },
        error: function (xhr) {
            Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo verificar el código.' });
        }
    });
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

