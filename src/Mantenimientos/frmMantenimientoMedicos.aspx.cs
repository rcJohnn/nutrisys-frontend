using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Text;
using System.Web.Services;
using System.Web.UI;
using BLL_CRUD_CONSULTAS.BD;
using BLL_CRUD_CONSULTAS.Helpers;
using BLL_CRUD_CONSULTAS.Mantenimientos;
using DAL_CRUD_CONSULTAS.BD;
using DAL_CRUD_CONSULTAS.Mantenimientos;
using PL_CRUD_CONSULTAS.Helpers;

namespace PL_CRUD_CONSULTAS.Mantenimientos
{
    public partial class frmMantenimientoMedicos : System.Web.UI.Page
    {
        protected void Page_Load(object sender, EventArgs e)
        {
        }

        // ─────────────────────────────────────────────────
        // HELPERS JSON
        // ─────────────────────────────────────────────────
        private static string Val(object v) =>
            v == null || v == DBNull.Value ? "null" : v.ToString().Replace(",", ".");

        private static string Esc(object v)
        {
            if (v == null || v == DBNull.Value) return "";
            return v.ToString()
                    .Replace("\\", "\\\\").Replace("\"", "\\\"")
                    .Replace("\r", "").Replace("\n", "\\n");
        }

        // ─────────────────────────────────────────────────
        // CARGAR INFO MÉDICO
        // ─────────────────────────────────────────────────
        [WebMethod(EnableSession = true)]
        public static string CargaInfoMedico(List<string> obj_Parametros_JS)
        {
            if (!cls_Sesion_PL_Helper.EsSesionValida())
                return cls_Sesion_PL_Helper.SinSesion();

            // [0] IdMedico
            try
            {
                cls_Medicos_DAL obj_Medicos_DAL = new cls_Medicos_DAL();
                cls_Medicos_BLL obj_Medicos_BLL = new cls_Medicos_BLL();

                obj_Medicos_DAL.iId_Medico = Convert.ToInt32(obj_Parametros_JS[0]);

                if (obj_Medicos_DAL.iId_Medico == 0)
                    return string.Empty;

                obj_Medicos_BLL.Obtiene_Informacion_Medicos(ref obj_Medicos_DAL);

                if (obj_Medicos_DAL.dtDatos == null || obj_Medicos_DAL.dtDatos.Rows.Count == 0)
                    return "No se encontraron registros";

                DataRow row = obj_Medicos_DAL.dtDatos.Rows[0];

                // SP devuelve: [0]=Id [1]=Nombre [2]=Ape1 [3]=Ape2 [4]=Cedula [5]=Telefono [6]=Correo [7]=Estado [8]=PasswordHash
                return row[0] + "<SPLITER>" +  // Id_Medico
                       row[1] + "<SPLITER>" +  // Nombre
                       row[2] + "<SPLITER>" +  // Prim_Apellido
                       row[3] + "<SPLITER>" +  // Seg_Apellido
                       row[4] + "<SPLITER>" +  // Cedula
                       row[5] + "<SPLITER>" +  // Telefono
                       row[6] + "<SPLITER>" +  // Correo
                       row[7];                 // Estado
            }
            catch (Exception ex)
            {
                return "Error: " + ex.Message;
            }
        }

        // ─────────────────────────────────────────────────
        // GUARDAR / MODIFICAR MÉDICO
        // ─────────────────────────────────────────────────
        [WebMethod(EnableSession = true)]
        public static string MantenimientoMedicos(List<string> obj_Parametros_JS)
        {
            if (!cls_Sesion_PL_Helper.EsSesionValida())
                return cls_Sesion_PL_Helper.SinSesion();

            // [0]=IdMedico [1]=Nombre [2]=Ape1 [3]=Ape2 [4]=Cedula [5]=Telefono
            // [6]=Correo   [7]=Estado [8]=Password [9]=IdUsuarioGlobal
            try
            {
                cls_Medicos_DAL obj_Medicos_DAL = new cls_Medicos_DAL();
                cls_Medicos_BLL obj_Medicos_BLL = new cls_Medicos_BLL();

                obj_Medicos_DAL.iId_Medico       = Convert.ToInt32(obj_Parametros_JS[0]);
                obj_Medicos_DAL.sNombre          = obj_Parametros_JS[1];
                obj_Medicos_DAL.sPrim_Apellido   = obj_Parametros_JS[2];
                obj_Medicos_DAL.sSeg_Apellido    = obj_Parametros_JS[3];
                obj_Medicos_DAL.sCedula          = obj_Parametros_JS[4];
                obj_Medicos_DAL.sTelefono        = obj_Parametros_JS[5];
                obj_Medicos_DAL.sCorreo          = obj_Parametros_JS[6];
                obj_Medicos_DAL.sEstado          = obj_Parametros_JS[7];
                obj_Medicos_DAL.iIdUsuarioGlobal = Convert.ToInt32(obj_Parametros_JS[9]);

                string passwordPlano = string.Empty;

                if (obj_Medicos_DAL.iId_Medico == 0)
                {
                    passwordPlano = cls_Password_Helper.GenerarContraseñaTemporal();
                    obj_Medicos_DAL.sPasswordHash = cls_Seguridad_Helper.GenerarHashConSalt(passwordPlano);
                    obj_Medicos_BLL.crearMedicos(ref obj_Medicos_DAL);
                }
                else
                {
                    string password = obj_Parametros_JS[8];
                    if (!string.IsNullOrEmpty(password))
                        obj_Medicos_DAL.sPasswordHash = cls_Seguridad_Helper.GenerarHashConSalt(password);
                    obj_Medicos_BLL.modificarMedicos(ref obj_Medicos_DAL);
                }

                if (obj_Medicos_DAL.sValorScalar == "-1")
                    return "-1<SPLITER>Ya existe un registro con la misma información.";
                else if (obj_Medicos_DAL.sValorScalar == "0")
                    return "0<SPLITER>Ocurrió un error al intentar guardar la información del registro. Intente nuevamente.";

                string _mensaje = obj_Medicos_DAL.sValorScalar + "<SPLITER>Información guardada de forma correcta.";

                if (obj_Medicos_DAL.iId_Medico == 0 && !string.IsNullOrEmpty(passwordPlano))
                {
                    AsignarModulosDefault(Convert.ToInt32(obj_Medicos_DAL.sValorScalar), "M");
                    try
                    {
                        string nombreCompleto = (obj_Medicos_DAL.sNombre + " " +
                                                 obj_Medicos_DAL.sPrim_Apellido + " " +
                                                 obj_Medicos_DAL.sSeg_Apellido).Trim();
                        cls_Email_Helper.EnviarCredencialesNuevoUsuario(
                            obj_Medicos_DAL.sCorreo, nombreCompleto, passwordPlano);
                    }
                    catch (Exception exEmail)
                    {
                        _mensaje = obj_Medicos_DAL.sValorScalar +
                                   "<SPLITER>Médico creado correctamente. Nota: no se pudo enviar el correo de bienvenida (" +
                                   exEmail.Message + ").";
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

        // ─────────────────────────────────────────────────
        // ELIMINAR MÉDICO
        // ─────────────────────────────────────────────────
        [WebMethod(EnableSession = true)]
        public static string EliminarMedicos(List<string> obj_Parametros_JS)
        {
            if (!cls_Sesion_PL_Helper.EsSesionValida())
                return cls_Sesion_PL_Helper.SinSesion();

            // [0]=IdMedico [1]=IdUsuarioGlobal
            try
            {
                cls_Medicos_DAL obj_Medicos_DAL = new cls_Medicos_DAL();
                cls_Medicos_BLL obj_Medicos_BLL = new cls_Medicos_BLL();

                obj_Medicos_DAL.iId_Medico       = Convert.ToInt32(obj_Parametros_JS[0]);
                obj_Medicos_DAL.iIdUsuarioGlobal = Convert.ToInt32(obj_Parametros_JS[1]);

                obj_Medicos_BLL.eliminarMedicos(ref obj_Medicos_DAL);

                if (obj_Medicos_DAL.sValorScalar == "-1")
                    return "-1<SPLITER>Existen registros con dependencias asociados a la información que desea eliminar. Verifique!!!";
                else if (obj_Medicos_DAL.sValorScalar == "0")
                    return "0<SPLITER>Ocurrió un error al intentar eliminar la información del registro. Intente nuevamente.";

                return obj_Medicos_DAL.sValorScalar + "<SPLITER>Información eliminada de forma correcta.";
            }
            catch (Exception ex)
            {
                return "0<SPLITER>Error: " + ex.Message;
            }
        }

        // ─────────────────────────────────────────────────
        // LISTAR CLÍNICAS DEL MÉDICO
        // ─────────────────────────────────────────────────
        [WebMethod(EnableSession = true)]
        public static string ListarClinicasMedico(List<string> obj_Parametros_JS)
        {
            if (!cls_Sesion_PL_Helper.EsSesionValida())
                return cls_Sesion_PL_Helper.SinSesion();

            // [0]=IdMedico
            try
            {
                cls_MedicoClinica_DAL obj_DAL = new cls_MedicoClinica_DAL();
                cls_MedicoClinica_BLL obj_BLL = new cls_MedicoClinica_BLL();

                obj_DAL.iId_Medico = Convert.ToInt32(obj_Parametros_JS[0]);
                obj_BLL.listarClinicasMedico(ref obj_DAL);

                if (obj_DAL.dtDatos == null || obj_DAL.dtDatos.Rows.Count == 0)
                    return "[]";

                // Columnas SP: [0]=Id_MedicoClinica [1]=Id_Clinica [2]=Nombre [3]=Direccion
                //              [4]=Latitud [5]=Longitud [6]=Logo_Url [7]=Estado
                var sb = new StringBuilder("[");
                for (int i = 0; i < obj_DAL.dtDatos.Rows.Count; i++)
                {
                    DataRow r = obj_DAL.dtDatos.Rows[i];
                    if (i > 0) sb.Append(",");
                    sb.Append("{");
                    sb.Append("\"idMedicoClinica\":" + Val(r[0]) + ",");
                    sb.Append("\"idClinica\":"       + Val(r[1]) + ",");
                    sb.Append("\"nombre\":\""        + Esc(r[2]) + "\",");
                    sb.Append("\"direccion\":\""     + Esc(r[3]) + "\",");
                    sb.Append("\"latitud\":"         + Val(r[4]) + ",");
                    sb.Append("\"longitud\":"        + Val(r[5]) + ",");
                    sb.Append("\"logoUrl\":\""       + Esc(r[6]) + "\"");
                    sb.Append("}");
                }
                sb.Append("]");
                return sb.ToString();
            }
            catch (Exception ex)
            {
                return "[]";
            }
        }

        // ─────────────────────────────────────────────────
        // GUARDAR CLÍNICA (crear + asignar al médico)
        // ─────────────────────────────────────────────────
        [WebMethod(EnableSession = true)]
        public static string GuardarClinica(List<string> obj_Parametros_JS)
        {
            if (!cls_Sesion_PL_Helper.EsSesionValida())
                return cls_Sesion_PL_Helper.SinSesion();

            // [0]=IdClinica (0=nueva) [1]=Nombre [2]=Dirección [3]=Latitud [4]=Longitud
            // [5]=LogoUrl [6]=IdMedico [7]=IdUsuarioGlobal
            try
            {
                cls_MedicoClinica_DAL obj_DAL = new cls_MedicoClinica_DAL();
                cls_MedicoClinica_BLL obj_BLL = new cls_MedicoClinica_BLL();

                obj_DAL.iId_Clinica       = Convert.ToInt32(obj_Parametros_JS[0]);
                obj_DAL.sNombre           = obj_Parametros_JS[1];
                obj_DAL.sDireccion        = obj_Parametros_JS[2] ?? "";
                if (!string.IsNullOrEmpty(obj_Parametros_JS[3]))
                    obj_DAL.dLatitud  = Convert.ToDecimal(obj_Parametros_JS[3], System.Globalization.CultureInfo.InvariantCulture);
                if (!string.IsNullOrEmpty(obj_Parametros_JS[4]))
                    obj_DAL.dLongitud = Convert.ToDecimal(obj_Parametros_JS[4], System.Globalization.CultureInfo.InvariantCulture);
                obj_DAL.sLogo_Url         = obj_Parametros_JS[5] ?? "";
                obj_DAL.iId_Medico        = Convert.ToInt32(obj_Parametros_JS[6]);
                obj_DAL.iIdUsuarioGlobal  = Convert.ToInt32(obj_Parametros_JS[7]);

                obj_BLL.guardarClinica(ref obj_DAL);

                if (string.IsNullOrEmpty(obj_DAL.sValorScalar) || obj_DAL.sValorScalar == "0")
                    return "0<SPLITER>Error al guardar la clínica.";

                return obj_DAL.sValorScalar + "<SPLITER>Clínica guardada correctamente.";
            }
            catch (Exception ex)
            {
                return "0<SPLITER>Error: " + ex.Message;
            }
        }

        // ─────────────────────────────────────────────────
        // QUITAR CLÍNICA DEL MÉDICO (baja lógica del vínculo)
        // ─────────────────────────────────────────────────
        [WebMethod(EnableSession = true)]
        public static string EliminarMedicoClinica(List<string> obj_Parametros_JS)
        {
            if (!cls_Sesion_PL_Helper.EsSesionValida())
                return cls_Sesion_PL_Helper.SinSesion();

            // [0]=IdMedicoClinica [1]=IdUsuarioGlobal
            try
            {
                cls_MedicoClinica_DAL obj_DAL = new cls_MedicoClinica_DAL();
                cls_MedicoClinica_BLL obj_BLL = new cls_MedicoClinica_BLL();

                obj_DAL.iId_MedicoClinica = Convert.ToInt32(obj_Parametros_JS[0]);
                obj_DAL.iIdUsuarioGlobal  = Convert.ToInt32(obj_Parametros_JS[1]);

                obj_BLL.eliminarMedicoClinica(ref obj_DAL);

                if (string.IsNullOrEmpty(obj_DAL.sValorScalar) || obj_DAL.sValorScalar == "0")
                    return "0<SPLITER>Error al quitar la clínica.";

                return "1<SPLITER>Clínica quitada correctamente.";
            }
            catch (Exception ex)
            {
                return "0<SPLITER>Error: " + ex.Message;
            }
        }
    }
}
