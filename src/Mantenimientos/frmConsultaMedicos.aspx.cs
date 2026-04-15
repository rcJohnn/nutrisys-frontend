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
    public partial class frmConsultaMedicos : System.Web.UI.Page
    {
        protected void Page_Load(object sender, EventArgs e)
        {
        }

        [WebMethod(EnableSession = true)]
        public static string CargaListaMedicos(List<string> obj_Parametros_JS)
        {
            if (!cls_Sesion_PL_Helper.EsSesionValida())
                return cls_Sesion_PL_Helper.SinSesion();

            try
            {
                string _mensaje = string.Empty;

                cls_Medicos_DAL obj_Medicos_DAL = new cls_Medicos_DAL();
                cls_Medicos_BLL obj_Medicos_BLL = new cls_Medicos_BLL();

                obj_Medicos_DAL.sCorreo = obj_Parametros_JS[0].ToString();
                obj_Medicos_DAL.sNombre = obj_Parametros_JS[1].ToString();
                obj_Medicos_DAL.sEstado = obj_Parametros_JS[2].ToString();

                obj_Medicos_BLL.listarFiltrarMedicos(ref obj_Medicos_DAL);

                if (obj_Medicos_DAL.dtDatos != null && obj_Medicos_DAL.dtDatos.Rows.Count > 0)
                {
                    _mensaje =
                        "<thead>" +
                        "<tr>" +
                        "<th>Id Médico</th>" +
                        "<th>Correo</th>" +
                        "<th>Nombre</th>" +
                        "<th>Estado</th>" +
                        "<th style='text-align:center'>Acciones</th>" +
                        "</tr>" +
                        "</thead>" +
                        "<tbody>";

                    for (int i = 0; i < obj_Medicos_DAL.dtDatos.Rows.Count; i++)
                    {
                        DataRow row = obj_Medicos_DAL.dtDatos.Rows[i];

                        // SP devuelve:
                        // [0] Id_Medico
                        // [1] Nombre
                        // [2] Prim_Apellido
                        // [3] Seg_Apellido
                        // [4] Cedula
                        // [5] Telefono
                        // [6] Correo
                        // [7] Estado

                        string nombreCompleto = row[1].ToString() + " " +
                                               row[2].ToString() + " " +
                                               row[3].ToString();

                        _mensaje += "<tr>" +
                                    "<td style='cursor:pointer;' onclick='javascript:defineMedico(" + row[0].ToString() + ")'>" +
                                        row[0].ToString() + "</td>" +
                                    "<td>" + System.Web.HttpUtility.HtmlEncode(row[6].ToString()) + "</td>" +
                                    "<td>" + System.Web.HttpUtility.HtmlEncode(nombreCompleto) + "</td>" +
                                    "<td>" + System.Web.HttpUtility.HtmlEncode(row[7].ToString()) + "</td>" +
                                    "<td style='text-align:center'>" +
                        "<i class='fa fa-calendar' onclick='javascript:irConfigAgenda(" + row[0].ToString() + ")' style='cursor:pointer;margin-right:10px;color:#007aff' title='Configurar Agenda'></i>" +
                        "<i class='fa fa-trash-o' onclick='javascript:eliminaMedico(" + row[0].ToString() + ")' style='cursor:pointer'></i>" +
                        "</td>" +
                                    "</tr>";
                    }

                    _mensaje += "</tbody>";
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

        [WebMethod(EnableSession = true)]
        public static string CargaListaMedicosCombo(List<string> obj_Parametros_JS)
        {
            if (!cls_Sesion_PL_Helper.EsSesionValida())
                return cls_Sesion_PL_Helper.SinSesion();

            try
            {
                string _mensaje = string.Empty;

                cls_Medicos_DAL obj_Medicos_DAL = new cls_Medicos_DAL();
                cls_Medicos_BLL obj_Medicos_BLL = new cls_Medicos_BLL();

                obj_Medicos_BLL.listarFiltrarMedicos(ref obj_Medicos_DAL);

                if (obj_Medicos_DAL.dtDatos != null && obj_Medicos_DAL.dtDatos.Rows.Count > 0)
                {
                    for (int i = 0; i < obj_Medicos_DAL.dtDatos.Rows.Count; i++)
                    {
                        DataRow row = obj_Medicos_DAL.dtDatos.Rows[i];

                        string nombreCompleto = row[1].ToString() + " " +
                                               row[2].ToString() + " " +
                                               row[3].ToString();

                        _mensaje += "<option value='" + row[0].ToString() + "'>" +
                                    System.Web.HttpUtility.HtmlEncode(nombreCompleto) + "</option>";
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