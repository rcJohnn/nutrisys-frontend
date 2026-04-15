using BLL_CRUD_CONSULTAS.Helpers;
using BLL_CRUD_CONSULTAS.Mantenimientos;
using DAL_CRUD_CONSULTAS.Mantenimientos;
using PL_CRUD_CONSULTAS.Helpers;
using System;
using System.Collections.Generic;
using System.Data;
using System.Web.Services;
using System.Web.UI;

namespace PL_CRUD_CONSULTAS.Mantenimientos
{
    public partial class frmMiPerfil : System.Web.UI.Page
    {
        protected void Page_Load(object sender, EventArgs e)
        {
        }

        [WebMethod(EnableSession = true)]
        public static string CargaInfoPerfil(List<string> obj_Parametros_JS)
        {
            if (!cls_Sesion_PL_Helper.EsSesionValida())
                return cls_Sesion_PL_Helper.SinSesion();
            // [0] id  [1] tipo ('U' o 'M')
            try
            {
                int id    = Convert.ToInt32(obj_Parametros_JS[0]);
                if (id != cls_Sesion_PL_Helper.ObtieneSesionId())
                    return cls_Sesion_PL_Helper.SinAutorizacion();
                string tp = obj_Parametros_JS.Count > 1 ? obj_Parametros_JS[1] : "U";

                if (tp == "M")
                {
                    cls_Medicos_DAL obj_DAL = new cls_Medicos_DAL();
                    cls_Medicos_BLL obj_BLL = new cls_Medicos_BLL();
                    obj_DAL.iId_Medico = id;
                    obj_BLL.Obtiene_Informacion_Medicos(ref obj_DAL);

                    if (obj_DAL.dtDatos == null || obj_DAL.dtDatos.Rows.Count == 0)
                        return "Error: No se encontró la información del médico";

                    DataRow row = obj_DAL.dtDatos.Rows[0];
                    // Devolvemos el mismo formato que usuario para no cambiar el JS:
                    // [0] Id  [1] Nombre  [2] Ape1  [3] Ape2  [4] Cedula
                    // [5] ""  [6] ""  [7] Telefono  [8] Correo
                    return row[0] + "<SPLITER>" +
                           row[1] + "<SPLITER>" +
                           row[2] + "<SPLITER>" +
                           row[3] + "<SPLITER>" +
                           row[4] + "<SPLITER>" +
                           ""      + "<SPLITER>" +  // sin FechaNacimiento
                           ""      + "<SPLITER>" +  // sin Sexo
                           row[5] + "<SPLITER>" +   // Telefono
                           row[6];                  // Correo
                }
                else
                {
                    cls_Usuarios_DAL obj_DAL = new cls_Usuarios_DAL();
                    cls_Usuarios_BLL obj_BLL = new cls_Usuarios_BLL();
                    obj_DAL.iId_Usuario = id;
                    obj_BLL.Obtiene_Informacion_Usuarios(ref obj_DAL);

                    if (obj_DAL.dtDatos == null || obj_DAL.dtDatos.Rows.Count == 0)
                        return "Error: No se encontró la información del usuario";

                    DataRow row = obj_DAL.dtDatos.Rows[0];
                    // [0] Id  [1] Nombre  [2] Ape1  [3] Ape2  [4] Cedula
                    // [5] FechaNac  [6] Sexo  [7] Telefono  [8] Correo
                    return row[0] + "<SPLITER>" +
                           row[1] + "<SPLITER>" +
                           row[2] + "<SPLITER>" +
                           row[3] + "<SPLITER>" +
                           row[4] + "<SPLITER>" +
                           row[5] + "<SPLITER>" +
                           row[6] + "<SPLITER>" +
                           row[7] + "<SPLITER>" +
                           row[8];
                }
            }
            catch (Exception ex)
            {
                return "Error: " + ex.Message;
            }
        }

        [WebMethod(EnableSession = true)]
        public static string GuardarPerfil(List<string> obj_Parametros_JS)
        {
            if (!cls_Sesion_PL_Helper.EsSesionValida())
                return cls_Sesion_PL_Helper.SinSesion();
            // [0] id  [1] telefono  [2] correo  [3] password  [4] tipo ('U' o 'M')
            try
            {
                int    id       = Convert.ToInt32(obj_Parametros_JS[0]);
                if (id != cls_Sesion_PL_Helper.ObtieneSesionId())
                    return "0<SPLITER>" + cls_Sesion_PL_Helper.SinAutorizacion();
                string telefono = obj_Parametros_JS[1];
                string correo   = obj_Parametros_JS[2];
                string password = obj_Parametros_JS[3];
                string tp       = obj_Parametros_JS.Count > 4 ? obj_Parametros_JS[4] : "U";

                if (tp == "M")
                {
                    cls_Medicos_DAL obj_DAL = new cls_Medicos_DAL();
                    cls_Medicos_BLL obj_BLL = new cls_Medicos_BLL();

                    // Cargar datos actuales para no pisar los campos que no edita
                    obj_DAL.iId_Medico = id;
                    obj_BLL.Obtiene_Informacion_Medicos(ref obj_DAL);

                    if (obj_DAL.dtDatos == null || obj_DAL.dtDatos.Rows.Count == 0)
                        return "0<SPLITER>No se encontró el médico.";

                    DataRow row = obj_DAL.dtDatos.Rows[0];
                    obj_DAL.sNombre           = row[1].ToString();
                    obj_DAL.sPrim_Apellido    = row[2].ToString();
                    obj_DAL.sSeg_Apellido     = row[3].ToString();
                    obj_DAL.sCedula           = row[4].ToString();
                    obj_DAL.sEstado           = row[7].ToString();
                    obj_DAL.sPasswordHash     = row[8].ToString();

                    // Campos editables
                    obj_DAL.sTelefono        = telefono;
                    obj_DAL.sCorreo          = correo;
                    obj_DAL.iIdUsuarioGlobal = id;

                    if (!string.IsNullOrEmpty(password))
                        obj_DAL.sPasswordHash = cls_Seguridad_Helper.GenerarHashConSalt(password);

                    obj_BLL.modificarMedicos(ref obj_DAL);

                    if (obj_DAL.sValorScalar == "0" || string.IsNullOrEmpty(obj_DAL.sValorScalar))
                        return "0<SPLITER>Ocurrió un error al guardar. Intente nuevamente.";

                    return obj_DAL.sValorScalar + "<SPLITER>Perfil actualizado correctamente.";
                }
                else
                {
                    cls_Usuarios_DAL obj_DAL = new cls_Usuarios_DAL();
                    cls_Usuarios_BLL obj_BLL = new cls_Usuarios_BLL();

                    obj_DAL.iId_Usuario = id;
                    obj_BLL.Obtiene_Informacion_Usuarios(ref obj_DAL);

                    if (obj_DAL.dtDatos == null || obj_DAL.dtDatos.Rows.Count == 0)
                        return "0<SPLITER>No se encontró el usuario.";

                    DataRow row = obj_DAL.dtDatos.Rows[0];
                    obj_DAL.sNombre         = row[1].ToString();
                    obj_DAL.sPrim_Apellido  = row[2].ToString();
                    obj_DAL.sSeg_Apellido   = row[3].ToString();
                    obj_DAL.sCedula         = row[4].ToString();
                    obj_DAL.sFechaNacimiento= Convert.ToDateTime(row[5]);
                    obj_DAL.sSexo           = row[6].ToString();
                    obj_DAL.sObservaciones  = row[9].ToString();
                    obj_DAL.sEstado         = row[10].ToString();

                    obj_DAL.sTelefono        = telefono;
                    obj_DAL.sCorreo          = correo;
                    obj_DAL.iIdUsuarioGlobal = id;

                    if (!string.IsNullOrEmpty(password))
                        obj_DAL.sPasswordHash = cls_Seguridad_Helper.GenerarHashConSalt(password);

                    obj_BLL.modificarUsuarios(ref obj_DAL);

                    if (obj_DAL.sValorScalar == "0")
                        return "0<SPLITER>Ocurrió un error al guardar. Intente nuevamente.";

                    return obj_DAL.sValorScalar + "<SPLITER>Perfil actualizado correctamente.";
                }
            }
            catch (Exception ex)
            {
                return "0<SPLITER>Error: " + ex.Message;
            }
        }
    }
}