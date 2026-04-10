$(document).ready(function () {
    cargarPerfil();
});

function cargarPerfil() {
    var idEntidad = $.cookie("GLBUNI");
    var tipo      = $.cookie("GLBTYP") || "U";  // 'U' = usuario, 'M' = médico

    // Médico: ocultar fecha de nacimiento y sexo (no aplica)
    if (tipo === "M") {
        $("#rowFchNac").hide();
        $("#rowSexo").hide();
    }

    jQuery.ajax({
        type: "POST",
        url: "frmMiPerfil.aspx/CargaInfoPerfil",
        data: JSON.stringify({ 'obj_Parametros_JS': [idEntidad, tipo] }),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        cache: false,
        success: function (msg) {
            var res = msg.d;

            if (!res || res.indexOf("Error") > -1) {
                Swal.fire({ icon: "error", title: "Error", text: res });
                return;
            }

            var datos = res.split("<SPLITER>");
            // [0] Id  [1] Nombre  [2] Ape1  [3] Ape2  [4] Cedula
            // [5] FechaNac (vacío para médico)  [6] Sexo (vacío para médico)
            // [7] Telefono  [8] Correo

            $("#lblNom").val(datos[1]);
            $("#lblApe1").val(datos[2]);
            $("#lblApe2").val(datos[3]);
            $("#lblCedula").val(datos[4]);

            if (tipo !== "M") {
                $("#lblFchNac").val(datos[5] ? datos[5].substring(0, 10) : "");
                $("#lblSexo").val(datos[6] === "M" ? "Masculino" : datos[6] === "F" ? "Femenino" : datos[6]);
            }

            $("#txtTel").val(datos[7]);
            $("#txtEml").val(datos[8]);
        },
        error: function () {
            Swal.fire({ icon: "error", title: "Error", text: "No se pudo cargar la información." });
        }
    });
}

function guardarPerfil() {
    var telefono = $("#txtTel").val().trim();
    var correo   = $("#txtEml").val().trim();
    var pwd      = $("#txtPwd").val();
    var pwdConf  = $("#txtPwdConfirm").val();

    if (!correo) {
        Swal.fire({ icon: "warning", title: "Validación", text: "El correo es obligatorio." });
        return;
    }

    if (pwd !== pwdConf) {
        Swal.fire({ icon: "warning", title: "Validación", text: "Las contraseñas no coinciden." });
        return;
    }

    if (pwd && pwd.length < 6) {
        Swal.fire({ icon: "warning", title: "Validación", text: "La contraseña debe tener al menos 6 caracteres." });
        return;
    }

    var idEntidad = $.cookie("GLBUNI");
    var tipo      = $.cookie("GLBTYP") || "U";

    jQuery.ajax({
        type: "POST",
        url: "frmMiPerfil.aspx/GuardarPerfil",
        data: JSON.stringify({ 'obj_Parametros_JS': [idEntidad, telefono, correo, pwd, tipo] }),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        cache: false,
        success: function (msg) {
            var res     = msg.d.split("<SPLITER>");
            var codigo  = res[0];
            var mensaje = res[1];

            if (codigo === "0") {
                Swal.fire({ icon: "error", title: "Error", text: mensaje });
            } else {
                Swal.fire({
                    icon: "success", title: "Éxito", text: mensaje,
                    showConfirmButton: false, timer: 2500, timerProgressBar: true
                }).then(function () {
                    location.href = "frmPrincipal.aspx";
                });
            }
        },
        error: function () {
            Swal.fire({ icon: "error", title: "Error", text: "No se pudo guardar la información." });
        }
    });
}

function regresar() {
    window.location.href = "frmPrincipal.aspx";
}

function togglePwd(inputId, btn) {
    var input = document.getElementById(inputId);
    var icon  = btn.querySelector("i");
    if (input.type === "password") {
        input.type = "text";
        icon.className = "fa fa-eye-slash";
    } else {
        input.type = "password";
        icon.className = "fa fa-eye";
    }
}
