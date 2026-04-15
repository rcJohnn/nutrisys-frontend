using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Web.Services;
using System.Web.UI;
using BLL_CRUD_CONSULTAS.BD;
using BLL_CRUD_CONSULTAS.Helpers;  // Para cls_Seguridad_Helper
using BLL_CRUD_CONSULTAS.Mantenimientos;
using DAL_CRUD_CONSULTAS.BD;
using DAL_CRUD_CONSULTAS.Mantenimientos;
using Newtonsoft.Json;
using PL_CRUD_CONSULTAS.Helpers;


namespace PL_CRUD_CONSULTAS.Mantenimientos
{
    public partial class frmMantenimientoUsuarios : System.Web.UI.Page
    {
        protected void Page_Load(object sender, EventArgs e)
        {

        }


        [WebMethod(EnableSession = true)]
        public static string ConsultarCedulaAPI(List<string> obj_Parametros_JS)
        {
            if (!cls_Sesion_PL_Helper.EsSesionValida())
                return cls_Sesion_PL_Helper.SinSesion();

            try
            {
                string cedula = obj_Parametros_JS[0].ToString();

                // ✅ CAMBIAR esta línea
                var respuesta = cls_ApiCedulaCR_Helper.ConsultarCedulaSync(cedula); // ← Usar el método sincrónico

                if (respuesta != null && respuesta.results != null && respuesta.results.Count > 0)
                {
                    // Extraer datos del primer resultado
                    var (nombre, apellido1, apellido2, tipo) = cls_ApiCedulaCR_Helper.ExtraerDatos(respuesta);

                    if (string.IsNullOrEmpty(nombre) && string.IsNullOrEmpty(apellido1))
                    {
                        return "NO_ENCONTRADO<SPLITER>No se encontraron datos para esta cédula";
                    }

                    // Devolver: Nombre<SPLITER>Apellido1<SPLITER>Apellido2<SPLITER>Tipo
                    return nombre + "<SPLITER>" + apellido1 + "<SPLITER>" + apellido2 + "<SPLITER>" + tipo;
                }
                else
                {
                    return "NO_ENCONTRADO<SPLITER>La cédula no fue encontrada en el sistema";
                }
            }
            catch (Exception ex)
            {
                return "ERROR<SPLITER>" + ex.Message;
            }
        }




        [WebMethod(EnableSession = true)]
        public static string CargaInfoUsuario(List<string> obj_Parametros_JS)
        {
            if (!cls_Sesion_PL_Helper.EsSesionValida())
                return cls_Sesion_PL_Helper.SinSesion();

            try
            {
                string _mensaje = string.Empty;

                cls_Usuarios_DAL obj_Usuarios_DAL = new cls_Usuarios_DAL();
                cls_Usuarios_BLL obj_Usuarios_BLL = new cls_Usuarios_BLL();

                obj_Usuarios_DAL.iId_Usuario = Convert.ToInt32(obj_Parametros_JS[0].ToString());

                if (obj_Usuarios_DAL.iId_Usuario != 0)
                {
                    obj_Usuarios_BLL.Obtiene_Informacion_Usuarios(ref obj_Usuarios_DAL);

                    if (obj_Usuarios_DAL.dtDatos.Rows.Count != 0)
                    {
                        DataRow row = obj_Usuarios_DAL.dtDatos.Rows[0];

                        // SP devuelve:
                        // [0] Id_Usuario
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

                        _mensaje = row[0].ToString() + "<SPLITER>" +  // Id_Usuario
                                   row[1].ToString() + "<SPLITER>" +  // Nombre
                                   row[2].ToString() + "<SPLITER>" +  // Prim_Apellido
                                   row[3].ToString() + "<SPLITER>" +  // Seg_Apellido
                                   row[4].ToString() + "<SPLITER>" +  // Cedula
                                   row[5].ToString() + "<SPLITER>" +  // FechaNacimiento
                                   row[6].ToString() + "<SPLITER>" +  // Sexo
                                   row[7].ToString() + "<SPLITER>" +  // Telefono
                                   row[8].ToString() + "<SPLITER>" +  // Correo
                                   row[9].ToString() + "<SPLITER>" +  // Observaciones
                                   row[10].ToString();                 // Estado
                    }
                    else
                    {
                        _mensaje = "No se encontraron registros";
                    }
                }
                return _mensaje;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        [WebMethod(EnableSession = true)]
        public static string MantenimientoUsuarios(List<string> obj_Parametros_JS)
        {
            if (!cls_Sesion_PL_Helper.EsSesionValida())
                return cls_Sesion_PL_Helper.SinSesion();

            try
            {
                string _mensaje = string.Empty;

                cls_Usuarios_DAL obj_Usuarios_DAL = new cls_Usuarios_DAL();
                cls_Usuarios_BLL obj_Usuarios_BLL = new cls_Usuarios_BLL();

                obj_Usuarios_DAL.iId_Usuario = Convert.ToInt32(obj_Parametros_JS[0]);
                obj_Usuarios_DAL.sNombre = obj_Parametros_JS[1].ToString();
                obj_Usuarios_DAL.sPrim_Apellido = obj_Parametros_JS[2].ToString();
                obj_Usuarios_DAL.sSeg_Apellido = obj_Parametros_JS[3].ToString();
                obj_Usuarios_DAL.sCedula = obj_Parametros_JS[4].ToString();

                // ✅ CORRECCIÓN: Parsear fecha con formato específico
                string fechaStr = obj_Parametros_JS[5].ToString();
                obj_Usuarios_DAL.sFechaNacimiento = DateTime.ParseExact(
                    fechaStr,
                    "yyyy-MM-dd",
                    System.Globalization.CultureInfo.InvariantCulture
                );

                obj_Usuarios_DAL.sSexo = obj_Parametros_JS[6].ToString();
                obj_Usuarios_DAL.sTelefono = obj_Parametros_JS[7].ToString();
                obj_Usuarios_DAL.sCorreo = obj_Parametros_JS[8].ToString();
                obj_Usuarios_DAL.sObservaciones = obj_Parametros_JS[9].ToString();
                obj_Usuarios_DAL.sEstado = obj_Parametros_JS[10].ToString();

                obj_Usuarios_DAL.iIdUsuarioGlobal = Convert.ToInt32(obj_Parametros_JS[12]);

                string passwordPlano = string.Empty;

                if (obj_Usuarios_DAL.iId_Usuario == 0)
                {
                    // CREAR: auto-generar contraseña temporal (ignorar lo que envíe el JS)
                    passwordPlano = cls_Password_Helper.GenerarContraseñaTemporal();
                    obj_Usuarios_DAL.sPasswordHash = cls_Seguridad_Helper.GenerarHashConSalt(passwordPlano);
                    obj_Usuarios_BLL.crearUsuarios(ref obj_Usuarios_DAL);
                }
                else
                {
                    // MODIFICAR: solo cambiar contraseña si el campo no está vacío
                    string password = obj_Parametros_JS[11].ToString();
                    if (!string.IsNullOrEmpty(password))
                        obj_Usuarios_DAL.sPasswordHash = cls_Seguridad_Helper.GenerarHashConSalt(password);
                    obj_Usuarios_BLL.modificarUsuarios(ref obj_Usuarios_DAL);
                }

                if (obj_Usuarios_DAL.sValorScalar == "-1")
                {
                    _mensaje = "-1<SPLITER>Ya existe un registro con la misma información.";
                }
                else if (obj_Usuarios_DAL.sValorScalar == "0")
                {
                    _mensaje = "0<SPLITER>Ocurrió un error al intentar guardar la información del registro. Intente nuevamente.";
                }
                else
                {
                    // Fue creación: asignar módulos y enviar email con credenciales
                    if (!string.IsNullOrEmpty(passwordPlano))
                    {
                        AsignarModulosDefault(Convert.ToInt32(obj_Usuarios_DAL.sValorScalar), "U");

                        try
                        {
                            string nombreCompleto = (obj_Usuarios_DAL.sNombre + " " +
                                                     obj_Usuarios_DAL.sPrim_Apellido + " " +
                                                     obj_Usuarios_DAL.sSeg_Apellido).Trim();
                            cls_Email_Helper.EnviarCredencialesNuevoUsuario(
                                obj_Usuarios_DAL.sCorreo,
                                nombreCompleto,
                                passwordPlano);
                        }
                        catch (Exception exEmail)
                        {
                            System.Diagnostics.Debug.WriteLine("Error al enviar email de bienvenida: " + exEmail.Message);
                        }
                        _mensaje = obj_Usuarios_DAL.sValorScalar + "<SPLITER>Usuario creado correctamente. Se ha enviado la contraseña temporal al correo registrado.";
                    }
                    else
                    {
                        _mensaje = obj_Usuarios_DAL.sValorScalar + "<SPLITER>Información guardada de forma correcta.";
                    }
                }

                return _mensaje;
            }
            catch (Exception ex)
            {
                return "0<SPLITER>Error: " + ex.Message;
            }
        }


        // ─────────────────────────────────────────────────
        // ASIGNAR MÓDULOS POR DEFECTO
        // ─────────────────────────────────────────────────
        private static void AsignarModulosDefault(int idEntidad, string tipoEntidad)
        {
            try
            {
                cls_BD_DAL obj_BD_DAL = new cls_BD_DAL();
                cls_BD_BLL obj_BD_BLL = new cls_BD_BLL();
                DataTable dt = obj_BD_BLL.ObtieneDTParametros(null);

                dt.Rows.Add("@IdEntidad",   "1", idEntidad);
                dt.Rows.Add("@TipoEntidad", "6", tipoEntidad);

                obj_BD_DAL.sNomSP      = ConfigurationManager.AppSettings["SP_Asignar_Modulos_Default"];
                obj_BD_DAL.DT_Parametros = dt;
                obj_BD_DAL.sNomTabla   = "Modulos";
                obj_BD_BLL.EjecutaProcesosTabla(ref obj_BD_DAL);
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine("AsignarModulosDefault error: " + ex.Message);
            }
        }

        [WebMethod(EnableSession = true)]
        public static string EliminarUsuarios(List<string> obj_Parametros_JS)
        {
            if (!cls_Sesion_PL_Helper.EsSesionValida())
                return cls_Sesion_PL_Helper.SinSesion();

            try
            {
                string _mensaje = string.Empty;
                cls_Usuarios_DAL obj_Usuarios_DAL = new cls_Usuarios_DAL();
                cls_Usuarios_BLL obj_Usuarios_BLL = new cls_Usuarios_BLL();

                obj_Usuarios_DAL.iId_Usuario = Convert.ToInt32(obj_Parametros_JS[0]);
                obj_Usuarios_DAL.iIdUsuarioGlobal = Convert.ToInt32(obj_Parametros_JS[1]);

                // ✅ Asignar 0 o 1 como int
                if (obj_Parametros_JS.Count > 2 && !string.IsNullOrEmpty(obj_Parametros_JS[2]))
                {
                    obj_Usuarios_DAL.iForzarEliminacion = obj_Parametros_JS[2] == "1" ? 1 : 0;
                }
                else
                {
                    obj_Usuarios_DAL.iForzarEliminacion = 0;
                }

                obj_Usuarios_BLL.eliminarUsuarios(ref obj_Usuarios_DAL);

                if (obj_Usuarios_DAL.sValorScalar == "-1")
                {
                    _mensaje = "-1<SPLITER>Este usuario tiene consultas médicas asociadas. ¿Desea eliminarlo de todas formas? Esto eliminará también todas sus consultas.";
                }
                else if (obj_Usuarios_DAL.sValorScalar == "0")
                {
                    _mensaje = "0<SPLITER>Ocurrió un error al intentar eliminar la información del registro. Intente nuevamente.";
                }
                else
                {
                    _mensaje = obj_Usuarios_DAL.sValorScalar + "<SPLITER>Información eliminada de forma correcta.";
                }

                return _mensaje;
            }
            catch (Exception ex)
            {
                return "0<SPLITER>Error: " + ex.Message;
            }
        }
    }
}