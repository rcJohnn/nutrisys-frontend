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
    public partial class frmConsultaAlimentos : System.Web.UI.Page
    {
        protected void Page_Load(object sender, EventArgs e)
        {
        }

        [WebMethod(EnableSession = true)]
        public static string CargaListaAlimentos(List<string> obj_Parametros_JS)
        {
            if (!cls_Sesion_PL_Helper.EsSesionValida())
                return cls_Sesion_PL_Helper.SinSesion();

            try
            {
                string _mensaje = string.Empty;

                cls_Alimentos_DAL obj_Alimentos_DAL = new cls_Alimentos_DAL();
                cls_Alimentos_BLL obj_Alimentos_BLL = new cls_Alimentos_BLL();

                obj_Alimentos_DAL.sNombre = obj_Parametros_JS[0].ToString();

                obj_Alimentos_BLL.listarFiltrarAlimentos(ref obj_Alimentos_DAL);

                if (obj_Alimentos_DAL.dtDatos != null && obj_Alimentos_DAL.dtDatos.Rows.Count > 0)
                {
                    _mensaje =
                        "<thead>" +
                        "<tr>" +
                        "<th>ID</th>" +
                        "<th>Nombre</th>" +
                        "<th>Categoría</th>" +
                        "<th>Macrogrupo</th>" +
                        "<th>Marca</th>" +
                        "<th>Energía (kcal)</th>" +
                        "<th>Proteína (g)</th>" +
                        "<th>Grasa (g)</th>" +
                        "<th>Carbohidratos (g)</th>" +
                        "<th>Fibra (g)</th>" +
                        "</tr>" +
                        "</thead>" +
                        "<tbody>";

                    for (int i = 0; i < obj_Alimentos_DAL.dtDatos.Rows.Count; i++)
                    {
                        DataRow row = obj_Alimentos_DAL.dtDatos.Rows[i];

                        // SP devuelve:
                        // [0] Id_Alimento
                        // [1] Nombre
                        // [2] Energia_kcal
                        // [3] Proteina_g
                        // [4] Grasa_g
                        // [5] Carbohidratos_g
                        // [6] Fibra_g
                        // [7] Categoria
                        // [8] Macrogrupo
                        // [9] Marca

                        _mensaje += "<tr>" +
                                    "<td style='cursor:pointer;' onclick='javascript:defineAlimento(" + row[0].ToString() + ")'>" +
                                        row[0].ToString() + "</td>" +
                                    "<td>" + System.Web.HttpUtility.HtmlEncode(row[1].ToString()) + "</td>" +
                                    "<td>" + System.Web.HttpUtility.HtmlEncode(row[7].ToString()) + "</td>" +
                                    "<td>" + System.Web.HttpUtility.HtmlEncode(row[8].ToString()) + "</td>" +
                                    "<td>" + System.Web.HttpUtility.HtmlEncode(row[9].ToString()) + "</td>" +
                                    "<td>" + row[2].ToString() + "</td>" +
                                    "<td>" + row[3].ToString() + "</td>" +
                                    "<td>" + row[4].ToString() + "</td>" +
                                    "<td>" + row[5].ToString() + "</td>" +
                                    "<td>" + row[6].ToString() + "</td>" +
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
    }
}