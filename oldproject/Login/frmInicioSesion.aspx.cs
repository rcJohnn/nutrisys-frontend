using BLL_CRUD_CONSULTAS.BD;
using BLL_CRUD_CONSULTAS.Mantenimientos;
using DAL_CRUD_CONSULTAS.BD;
using DAL_CRUD_CONSULTAS.Mantenimientos;
using PL_CRUD_CONSULTAS.Helpers;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Web;
using System.Web.Services;
using System.Web.UI;

namespace PL_CRUD_CONSULTAS.Login
{
    public partial class frmInicioSesion : System.Web.UI.Page
    {
        protected void Page_Load(object sender, EventArgs e)
        {

        }

        [WebMethod(EnableSession = true)]
        public static string InicioSesionUsuarios(List<string> obj_Parametros_JS)
        {
            string correo = obj_Parametros_JS[0];

            if (cls_Sesion_PL_Helper.EstaBloquado(correo))
                return "0<SPLITER>Cuenta bloqueada temporalmente por múltiples intentos fallidos. Intente nuevamente en 10 minutos.";

            cls_Sesion_BLL obj_Sesion_BLL = new cls_Sesion_BLL();
            string resultado = obj_Sesion_BLL.IniciarSesion(
                correo,
                obj_Parametros_JS[1]
            );

            // Formato exitoso: "id<SPLITER>mensaje<SPLITER>correo<SPLITER>nombre<SPLITER>tipo"
            string[] partes = resultado.Split(new string[] { "<SPLITER>" }, StringSplitOptions.None);
            int idUsuario;
            if (partes.Length >= 5 && int.TryParse(partes[0], out idUsuario) && idUsuario > 0)
            {
                // Credenciales válidas → generar y enviar OTP (no establecer sesión aún)
                string nombre  = partes[3];
                string correoReal = partes[2];
                string codigo  = cls_Sesion_PL_Helper.GenerarYGuardarOTP(correo, resultado);
                cls_Email_Helper.EnviarCodigoOTP(correoReal, nombre, codigo);
                return "OTP<SPLITER>" + MaskEmail(correoReal);
            }
            else
            {
                cls_Sesion_PL_Helper.RegistrarFalloLogin(correo);
                return resultado;
            }
        }

        [WebMethod(EnableSession = true)]
        public static string VerificarOTP(List<string> obj_Parametros_JS)
        {
            string correo = obj_Parametros_JS[0];
            string codigo = obj_Parametros_JS[1];

            string datosSesion = cls_Sesion_PL_Helper.ValidarOTP(correo, codigo);

            if (datosSesion == "INVALIDO")
                return "0<SPLITER>Demasiados intentos incorrectos. Por favor inicie sesión nuevamente.";

            if (datosSesion == null)
                return "0<SPLITER>Código incorrecto o expirado. Verifique e intente de nuevo.";

            // OTP válido → establecer sesión
            string[] partes = datosSesion.Split(new string[] { "<SPLITER>" }, StringSplitOptions.None);
            int idUsuario;
            if (partes.Length >= 5 && int.TryParse(partes[0], out idUsuario) && idUsuario > 0)
            {
                cls_Sesion_PL_Helper.LimpiarFallosLogin(correo);
                cls_Sesion_PL_Helper.IniciarSesion(idUsuario, partes[4]);
            }

            return datosSesion;
        }

        private static string MaskEmail(string email)
        {
            if (string.IsNullOrEmpty(email) || !email.Contains("@")) return email;
            var parts  = email.Split('@');
            string usr = parts[0];
            string dom = parts[1];
            if (usr.Length <= 2) return "**@" + dom;
            return usr[0] + new string('*', usr.Length - 2) + usr[usr.Length - 1] + "@" + dom;
        }

        [WebMethod(EnableSession = true)]
        public static string CierreSesionUsuarios(List<string> obj_Parametros_JS)
        {
            try
            {
                String _mensaje = string.Empty;

                cls_Sesion_BLL obj_Sesion_BLL = new cls_Sesion_BLL();

                int id = Convert.ToInt32(obj_Parametros_JS[0]);
                string tipo = obj_Parametros_JS[1].ToString();

                _mensaje = obj_Sesion_BLL.CerrarSesion(id, tipo);

                // Limpiar sesión server-side independientemente del resultado
                cls_Sesion_PL_Helper.CerrarSesion();

                return _mensaje;
            }
            catch (Exception ex)
            {
                return "0<SPLITER>Error: " + ex.Message;
            }
        }

        [WebMethod(EnableSession = true)]
        public static string cargaOpcionesMenuUsuarios(List<string> obj_Parametros_JS)
        {
            if (!cls_Sesion_PL_Helper.EsSesionValida())
                return cls_Sesion_PL_Helper.SinSesion();

            try
            {
                string _mensaje = string.Empty;
                int idEntidad = Convert.ToInt32(obj_Parametros_JS[0]);
                string tipoEntidad = obj_Parametros_JS[1].ToString(); // 'U' o 'M'
                cls_BD_DAL obj_BD_DAL = new cls_BD_DAL();
                cls_BD_BLL obj_BD_BLL = new cls_BD_BLL();
                DataTable dtParametros = obj_BD_BLL.ObtieneDTParametros(null);
                dtParametros.Rows.Add("@IdEntidad", "1", idEntidad);
                dtParametros.Rows.Add("@TipoEntidad", "6", tipoEntidad);
                obj_BD_DAL.sNomSP = ConfigurationManager.AppSettings["SP_LST_ModulosXEntidad"];
                obj_BD_DAL.DT_Parametros = dtParametros;
                obj_BD_DAL.sNomTabla = "Modulos";
                obj_BD_BLL.EjecutaProcesosTabla(ref obj_BD_DAL);
                if (obj_BD_DAL.sMsjErrorBD == string.Empty && obj_BD_DAL.DS.Tables[0].Rows.Count > 0)
                {
                    DataTable dtDatos = obj_BD_DAL.DS.Tables[0];
                    foreach (DataRow row in dtDatos.Rows)
                    {
                        _mensaje += "<li><a href='" + HttpUtility.HtmlAttributeEncode(row["Enlace"].ToString()) + "'>" +
                                   "<i class='" + HttpUtility.HtmlAttributeEncode(row["ClaseCSS"].ToString()) + "'></i>" +
                                   "<span>" + HttpUtility.HtmlEncode(row["Modulo"].ToString()) + "</span>" +
                                   "</a></li>";
                    }
                }
                else
                {
                    _mensaje = "No se encontraron registros";
                }
                return _mensaje;
            }
            catch (Exception ex)
            {
                return "Error: " + ex.Message;
            }
        }
    }
}