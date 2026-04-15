using System;
using System.Collections.Generic;
using System.Data;
using System.Web.Services;
using System.Web.UI;
using DAL_CRUD_CONSULTAS.Mantenimientos;
using BLL_CRUD_CONSULTAS.Mantenimientos;
using PL_CRUD_CONSULTAS.Helpers;

namespace PL_CRUD_CONSULTAS.Mantenimientos
{
    public partial class frmPadecimientosUsuario : System.Web.UI.Page
    {
        protected void Page_Load(object sender, EventArgs e)
        {
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

                obj_Usuarios_DAL.iId_Usuario = Convert.ToInt32(obj_Parametros_JS[0]);
                if (cls_Sesion_PL_Helper.ObtieneSesionTipo() == "U" && obj_Usuarios_DAL.iId_Usuario != cls_Sesion_PL_Helper.ObtieneSesionId())
                    return cls_Sesion_PL_Helper.SinAutorizacion();

                if (obj_Usuarios_DAL.iId_Usuario != 0)
                {
                    obj_Usuarios_BLL.Obtiene_Informacion_Usuarios(ref obj_Usuarios_DAL);

                    if (obj_Usuarios_DAL.dtDatos != null && obj_Usuarios_DAL.dtDatos.Rows.Count > 0)
                    {
                        DataRow row = obj_Usuarios_DAL.dtDatos.Rows[0];

                        // Devolver: Nombre completo<SPLITER>Correo
                        string nombreCompleto = row[1].ToString() + " " +
                                               row[2].ToString() + " " +
                                               row[3].ToString();

                        _mensaje = nombreCompleto + "<SPLITER>" + row[8].ToString();
                    }
                    else
                    {
                        _mensaje = "No se encontró el usuario";
                    }
                }

                return _mensaje;
            }
            catch (Exception ex)
            {
                return "Error: " + ex.Message;
            }
        }

        [WebMethod(EnableSession = true)]
        public static string CargaListaPadecimientos(List<string> obj_Parametros_JS)
        {
            if (!cls_Sesion_PL_Helper.EsSesionValida())
                return cls_Sesion_PL_Helper.SinSesion();
            try
            {
                string _mensaje = string.Empty;

                cls_Padecimientos_Usuario_DAL obj_Padecimientos_DAL = new cls_Padecimientos_Usuario_DAL();
                cls_Padecimientos_Usuario_BLL obj_Padecimientos_BLL = new cls_Padecimientos_Usuario_BLL();

                obj_Padecimientos_BLL.ListarPadecimientos(ref obj_Padecimientos_DAL);

                if (obj_Padecimientos_DAL.dtDatos != null && obj_Padecimientos_DAL.dtDatos.Rows.Count > 0)
                {
                    foreach (DataRow row in obj_Padecimientos_DAL.dtDatos.Rows)
                    {
                        _mensaje += "<option value='" + row[0].ToString() + "'>" +
                                    System.Web.HttpUtility.HtmlEncode(row[1].ToString()) + "</option>";
                    }
                }

                return _mensaje;
            }
            catch (Exception ex)
            {
                return "Error: " + ex.Message;
            }
        }

        [WebMethod(EnableSession = true)]
        public static string CargaListaPadecimientosUsuario(List<string> obj_Parametros_JS)
        {
            if (!cls_Sesion_PL_Helper.EsSesionValida())
                return cls_Sesion_PL_Helper.SinSesion();
            try
            {
                string _mensaje = string.Empty;

                cls_Padecimientos_Usuario_DAL obj_Padecimientos_DAL = new cls_Padecimientos_Usuario_DAL();
                cls_Padecimientos_Usuario_BLL obj_Padecimientos_BLL = new cls_Padecimientos_Usuario_BLL();

                obj_Padecimientos_DAL.iId_Usuario = Convert.ToInt32(obj_Parametros_JS[0]);
                if (cls_Sesion_PL_Helper.ObtieneSesionTipo() == "U" && obj_Padecimientos_DAL.iId_Usuario != cls_Sesion_PL_Helper.ObtieneSesionId())
                    return cls_Sesion_PL_Helper.SinAutorizacion();

                obj_Padecimientos_BLL.ListarPadecimientosUsuario(ref obj_Padecimientos_DAL);

                if (obj_Padecimientos_DAL.dtDatos != null && obj_Padecimientos_DAL.dtDatos.Rows.Count > 0)
                {
                    // Filtrar solo los asignados (Asignado = 'S')
                    DataRow[] padecimientosAsignados = obj_Padecimientos_DAL.dtDatos.Select("Asignado = 'S'");

                    if (padecimientosAsignados.Length > 0)
                    {
                        _mensaje =
                            "<thead>" +
                            "<tr>" +
                            "<th>ID</th>" +
                            "<th>Padecimiento</th>" +
                            "<th style='text-align:center'>Eliminar</th>" +
                            "</tr>" +
                            "</thead>" +
                            "<tbody>";

                        foreach (DataRow row in padecimientosAsignados)
                        {
                            _mensaje += "<tr>" +
                                        "<td>" + row[0].ToString() + "</td>" +
                                        "<td>" + System.Web.HttpUtility.HtmlEncode(row[1].ToString()) + "</td>" +
                                        "<td style='text-align:center'>" +
                                            "<i class='fa fa-trash-o' onclick='javascript:eliminarPadecimiento(" +
                                            row[0].ToString() + ")' style='cursor:pointer; color:red;'></i>" +
                                        "</td>" +
                                        "</tr>";
                        }

                        _mensaje += "</tbody>";
                    }
                    else
                    {
                        _mensaje = "No tiene padecimientos asignados";
                    }
                }
                else
                {
                    _mensaje = "No tiene padecimientos asignados";
                }

                return _mensaje;
            }
            catch (Exception ex)
            {
                return "Error: " + ex.Message;
            }
        }

        [WebMethod(EnableSession = true)]
        public static string AsignarPadecimiento(List<string> obj_Parametros_JS)
        {
            if (!cls_Sesion_PL_Helper.EsSesionValida())
                return cls_Sesion_PL_Helper.SinSesion();
            if (cls_Sesion_PL_Helper.ObtieneSesionTipo() == "U")
                return "0<SPLITER>" + cls_Sesion_PL_Helper.SinAutorizacion();
            try
            {
                string _mensaje = string.Empty;

                cls_Padecimientos_Usuario_DAL obj_Padecimientos_DAL = new cls_Padecimientos_Usuario_DAL();
                cls_Padecimientos_Usuario_BLL obj_Padecimientos_BLL = new cls_Padecimientos_Usuario_BLL();

                obj_Padecimientos_DAL.iId_Usuario = Convert.ToInt32(obj_Parametros_JS[0]);
                obj_Padecimientos_DAL.iId_Padecimiento = Convert.ToInt32(obj_Parametros_JS[1]);
                obj_Padecimientos_DAL.iIdUsuarioGlobal = Convert.ToInt32(obj_Parametros_JS[2]);

                obj_Padecimientos_BLL.AsignarPadecimiento(ref obj_Padecimientos_DAL);

                if (obj_Padecimientos_DAL.sValorScalar == "-1")
                {
                    _mensaje = "-1<SPLITER>Este padecimiento ya está asignado al usuario.";
                }
                else if (obj_Padecimientos_DAL.sValorScalar == "0")
                {
                    _mensaje = "0<SPLITER>Ocurrió un error al asignar el padecimiento.";
                }
                else
                {
                    _mensaje = obj_Padecimientos_DAL.sValorScalar + "<SPLITER>Padecimiento asignado correctamente.";
                }

                return _mensaje;
            }
            catch (Exception ex)
            {
                return "0<SPLITER>Error: " + ex.Message;
            }
        }

        [WebMethod(EnableSession = true)]
        public static string EliminarPadecimiento(List<string> obj_Parametros_JS)
        {
            if (!cls_Sesion_PL_Helper.EsSesionValida())
                return cls_Sesion_PL_Helper.SinSesion();
            if (cls_Sesion_PL_Helper.ObtieneSesionTipo() == "U")
                return "0<SPLITER>" + cls_Sesion_PL_Helper.SinAutorizacion();
            try
            {
                string _mensaje = string.Empty;

                cls_Padecimientos_Usuario_DAL obj_Padecimientos_DAL = new cls_Padecimientos_Usuario_DAL();
                cls_Padecimientos_Usuario_BLL obj_Padecimientos_BLL = new cls_Padecimientos_Usuario_BLL();

                obj_Padecimientos_DAL.iId_Usuario = Convert.ToInt32(obj_Parametros_JS[0]);
                obj_Padecimientos_DAL.iId_Padecimiento = Convert.ToInt32(obj_Parametros_JS[1]);
                obj_Padecimientos_DAL.iIdUsuarioGlobal = Convert.ToInt32(obj_Parametros_JS[2]);

                obj_Padecimientos_BLL.EliminarPadecimiento(ref obj_Padecimientos_DAL);

                if (obj_Padecimientos_DAL.sValorScalar == "0")
                {
                    _mensaje = "0<SPLITER>Ocurrió un error al eliminar el padecimiento.";
                }
                else
                {
                    _mensaje = obj_Padecimientos_DAL.sValorScalar + "<SPLITER>Padecimiento eliminado correctamente.";
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