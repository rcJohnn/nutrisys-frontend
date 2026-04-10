$(document).ready(function () {

    var PageName = window.location.pathname.split('/').pop();

    if (PageName == 'frmConsultaAlimentos.aspx') {
        cargaListaAlimentos();
    }
    else if (PageName == 'frmMantenimientoAlimentos.aspx') {
        obtieneDetalleAlimento();
    }
});

function crearAlimento() {
    $.cookie('ALIUNI', 0, { expires: TLTC, path: '/', domain: g_Dominio });
    location.href = "frmMantenimientoAlimentos.aspx";
}

function regresar() {
    location.href = "frmConsultaAlimentos.aspx";
}

function cargaListaAlimentos() {
    $.cookie('ALIUNI', 0, { expires: TLTC, path: '/', domain: g_Dominio });

    var obj_Parametros_JS = new Array();
    obj_Parametros_JS[0] = $("#bsqNombre").val();

    var parametros = JSON.stringify({ 'obj_Parametros_JS': obj_Parametros_JS });

    var usuarioGlobal = $.cookie("GLBUNI");

    if ((usuarioGlobal != 0) && (usuarioGlobal != undefined)) {

        jQuery.ajax({
            type: "POST",
            url: "frmConsultaAlimentos.aspx/CargaListaAlimentos",
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
                        $("#tblAlimentos").html("");
                        Swal.fire({
                            title: "Búsqueda de Registros",
                            text: res,
                            icon: "info"
                        });
                    }
                    else {
                        $("#tblAlimentos").html(res);
                        paginar("#tblAlimentos");
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

function defineAlimento(uni) {
    $.cookie('ALIUNI', uni, { expires: TLTC, path: '/', domain: g_Dominio });
    location.href = "frmMantenimientoAlimentos.aspx";
}

function obtieneDetalleAlimento() {

    var obj_Parametros_JS = new Array();
    obj_Parametros_JS[0] = $.cookie("ALIUNI");

    var parametros = JSON.stringify({ 'obj_Parametros_JS': obj_Parametros_JS });

    var usuarioGlobal = $.cookie("GLBUNI");

    if ((usuarioGlobal != 0) && (usuarioGlobal != undefined)) {

        jQuery.ajax({
            type: "POST",
            url: "frmMantenimientoAlimentos.aspx/CargaInfoAlimento",
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
                            // Orden del WebMethod CargaInfoAlimento:
                            // [0] Id_Alimento
                            // [1] Nombre
                            // [2] Energia_kcal
                            // [3] Proteina_g
                            // [4] Grasa_g
                            // [5] Carbohidratos_g
                            // [6] Fibra_g
                            // [7] Calcio_mg
                            // [8] Fosforo_mg
                            // [9] Hierro_mg
                            // [10] Tiamina_mg
                            // [11] Vit_C_mg
                            // [12] Vit_A_ug
                            // [13] Colesterol_mg
                            // [14] Potasio_mg
                            // [15] Zinc_mg
                            // [16] Magnesio_mg
                            // [17] Vit_B6_mg
                            // [18] Vit_B12_ug
                            // [19] Categoria
                            // [20] Macrogrupo
                            // [21] Marca
                            // [22] Presentacion
                            // [23] Agua_g
                            // [24] Ceniza_g
                            // [25] Riboflavina_mg
                            // [26] Niacina_mg
                            // [27] Ac_Folico_ug
                            // [28] Folato_ug
                            // [29] Sodio_mg
                            // [30] Ac_Grasos_Saturados_g
                            // [31] Ac_Grasos_Monoinsaturados_g
                            // [32] Ac_Grasos_Poliinsaturados_g

                            $("#txtNombre").val(arreglo[1]);
                            $("#txtEnergia").val(arreglo[2]);
                            $("#txtProteina").val(arreglo[3]);
                            $("#txtGrasa").val(arreglo[4]);
                            $("#txtCarbohidratos").val(arreglo[5]);
                            $("#txtFibra").val(arreglo[6]);
                            $("#txtCalcio").val(arreglo[7]);
                            $("#txtFosforo").val(arreglo[8]);
                            $("#txtHierro").val(arreglo[9]);
                            $("#txtTiamina").val(arreglo[10]);
                            $("#txtVitC").val(arreglo[11]);
                            $("#txtVitA").val(arreglo[12]);
                            $("#txtColesterol").val(arreglo[13]);
                            $("#txtPotasio").val(arreglo[14]);
                            $("#txtZinc").val(arreglo[15]);
                            $("#txtMagnesio").val(arreglo[16]);
                            $("#txtVitB6").val(arreglo[17]);
                            $("#txtVitB12").val(arreglo[18]);
                            $("#txtCategoria").val(arreglo[19]);
                            $("#txtMacrogrupo").val(arreglo[20]);
                            $("#txtMarca").val(arreglo[21]);
                            $("#txtPresentacion").val(arreglo[22]);
                            $("#txtAgua").val(arreglo[23]);
                            $("#txtCeniza").val(arreglo[24]);
                            $("#txtRiboflavina").val(arreglo[25]);
                            $("#txtNiacina").val(arreglo[26]);
                            $("#txtAcFolico").val(arreglo[27]);
                            $("#txtFolato").val(arreglo[28]);
                            $("#txtSodio").val(arreglo[29]);
                            $("#txtAcGrasosSat").val(arreglo[30]);
                            $("#txtAcGrasosMono").val(arreglo[31]);
                            $("#txtAcGrasosPoli").val(arreglo[32]);

                            // Deshabilitar edición si ya existe el alimento
                            if (resultado != "0") {
                                $("input").prop("disabled", true);
                                $("button[type='submit']").hide();

                                Swal.fire({
                                    title: "Modo Consulta",
                                    text: "Los alimentos existentes no pueden ser modificados. Solo puede ver la información.",
                                    icon: "info"
                                });
                            }
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

function mantenimientoAlimento() {
    var obj_Parametros_JS = new Array();

    // Orden según el WebMethod MantenimientoAlimentos:
    // [0] IdAlimento
    // [1] Nombre
    // [2] Energia_kcal
    // [3] Proteina_g
    // [4] Grasa_g
    // [5] Carbohidratos_g
    // [6] Fibra_g
    // [7] Calcio_mg
    // [8] Fosforo_mg
    // [9] Hierro_mg
    // [10] Tiamina_mg
    // [11] Vit_C_mg
    // [12] Vit_A_ug
    // [13] Colesterol_mg
    // [14] Potasio_mg
    // [15] Zinc_mg
    // [16] Magnesio_mg
    // [17] Vit_B6_mg
    // [18] Vit_B12_ug
    // [19] Categoria
    // [20] Macrogrupo
    // [21] Marca
    // [22] Presentacion
    // [23] Agua_g
    // [24] Ceniza_g
    // [25] Riboflavina_mg
    // [26] Niacina_mg
    // [27] Ac_Folico_ug
    // [28] Folato_ug
    // [29] Sodio_mg
    // [30] Ac_Grasos_Saturados_g
    // [31] Ac_Grasos_Monoinsaturados_g
    // [32] Ac_Grasos_Poliinsaturados_g
    // [33] IdUsuarioGlobal

    obj_Parametros_JS[0]  = $.cookie("ALIUNI");
    obj_Parametros_JS[1]  = $("#txtNombre").val();
    obj_Parametros_JS[2]  = $("#txtEnergia").val();
    obj_Parametros_JS[3]  = $("#txtProteina").val();
    obj_Parametros_JS[4]  = $("#txtGrasa").val();
    obj_Parametros_JS[5]  = $("#txtCarbohidratos").val();
    obj_Parametros_JS[6]  = $("#txtFibra").val();
    obj_Parametros_JS[7]  = $("#txtCalcio").val();
    obj_Parametros_JS[8]  = $("#txtFosforo").val();
    obj_Parametros_JS[9]  = $("#txtHierro").val();
    obj_Parametros_JS[10] = $("#txtTiamina").val();
    obj_Parametros_JS[11] = $("#txtVitC").val();
    obj_Parametros_JS[12] = $("#txtVitA").val();
    obj_Parametros_JS[13] = $("#txtColesterol").val();
    obj_Parametros_JS[14] = $("#txtPotasio").val();
    obj_Parametros_JS[15] = $("#txtZinc").val();
    obj_Parametros_JS[16] = $("#txtMagnesio").val();
    obj_Parametros_JS[17] = $("#txtVitB6").val();
    obj_Parametros_JS[18] = $("#txtVitB12").val();
    obj_Parametros_JS[19] = $("#txtCategoria").val();
    obj_Parametros_JS[20] = $("#txtMacrogrupo").val();
    obj_Parametros_JS[21] = $("#txtMarca").val();
    obj_Parametros_JS[22] = $("#txtPresentacion").val();
    obj_Parametros_JS[23] = $("#txtAgua").val();
    obj_Parametros_JS[24] = $("#txtCeniza").val();
    obj_Parametros_JS[25] = $("#txtRiboflavina").val();
    obj_Parametros_JS[26] = $("#txtNiacina").val();
    obj_Parametros_JS[27] = $("#txtAcFolico").val();
    obj_Parametros_JS[28] = $("#txtFolato").val();
    obj_Parametros_JS[29] = $("#txtSodio").val();
    obj_Parametros_JS[30] = $("#txtAcGrasosSat").val();
    obj_Parametros_JS[31] = $("#txtAcGrasosMono").val();
    obj_Parametros_JS[32] = $("#txtAcGrasosPoli").val();
    obj_Parametros_JS[33] = $.cookie("GLBUNI");

    var parametros = JSON.stringify({ 'obj_Parametros_JS': obj_Parametros_JS });

    if ((obj_Parametros_JS[33] != 0) && (obj_Parametros_JS[33] != undefined)) {

        jQuery.ajax({
            type: "POST",
            url: "frmMantenimientoAlimentos.aspx/MantenimientoAlimentos",
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
                            location.href = "frmConsultaAlimentos.aspx";
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

function paginar(elemento) {
    var table;

    if ($.fn.DataTable.isDataTable(elemento)) {
        table = $(elemento).DataTable({
            "iDisplayLength": 10,
            "aLengthMenu": [[10, 25, 50, 100], [10, 25, 50, 100]],
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
            "iDisplayLength": 10,
            "aLengthMenu": [[10, 25, 50, 100], [10, 25, 50, 100]],
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