using BLL_CRUD_CONSULTAS.Mantenimientos;
using DAL_CRUD_CONSULTAS.Mantenimientos;
using PL_CRUD_CONSULTAS.Helpers;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Web;
using System.Web.Services;
using System.Web.UI;
using System.Web.UI.WebControls;


namespace PL_CRUD_CONSULTAS.Mantenimientos
{
    public partial class frmConsultaUsuarios : System.Web.UI.Page
    {
        protected void Page_Load(object sender, EventArgs e)
        {

        }

        [WebMethod(EnableSession = true)]
        public static string CargaListaUsuarios(List<string> obj_Parametros_JS)
        {
            if (!cls_Sesion_PL_Helper.EsSesionValida())
                return cls_Sesion_PL_Helper.SinSesion();

            try
            {
                string _mensaje = string.Empty;

                //Objetos de la entidad con la que estamos trabajando
                cls_Usuarios_DAL obj_Usuarios_DAL = new cls_Usuarios_DAL();
                cls_Usuarios_BLL obj_Usuarios_BLL = new cls_Usuarios_BLL();

                //Descomponemos los valores que nos envíe el js y lo asignamos a nuestro objeto 
                obj_Usuarios_DAL.sCorreo = obj_Parametros_JS[0].ToString();
                obj_Usuarios_DAL.sNombre = obj_Parametros_JS[1].ToString();
                obj_Usuarios_DAL.sEstado = obj_Parametros_JS[2].ToString();

                //Ejecutar en lógica de negocio el proceso o la accion necesaria
                obj_Usuarios_BLL.listarFiltrarUsuarios(ref obj_Usuarios_DAL);


                //Evaluar los resultados de la ejecución de la lógica de negocio
                if (obj_Usuarios_DAL.dtDatos.Rows.Count != 0)
                {
                    _mensaje = "" +
                        "<thead>" +
                        "<tr>" +
                        "<th>Id Usuario</th>" +
                        "<th>Correo</th>" +
                        "<th>Nombre</th>" +
                        "<th>Estado</th>" +
                        "<th style='text-align:center'>Expediente</th>" +
                        "<th style='text-align:center'>Padecimientos</th>" +
                        "<th style='text-align:center'>Eliminar</th>" +
                        "</tr>" +
                        "</thead>" +
                        "<tbody>";

                    for (int i = 0; i < obj_Usuarios_DAL.dtDatos.Rows.Count; i++)
                    {
                        DataRow row = obj_Usuarios_DAL.dtDatos.Rows[i];

                        string nombreCompleto = row[1].ToString() + " " +  // Nombre
                                               row[2].ToString() + " " +  // Prim_Apellido
                                               row[3].ToString();         // Seg_Apellido

                        _mensaje += "<tr>" +
                                    "<td style='cursor:pointer;' onclick='javascript:defineUsuario(" + row[0].ToString() + ")'>" +
                                        row[0].ToString() + "</td>" +                    // [0] Id_Usuario
                                    "<td>" + System.Web.HttpUtility.HtmlEncode(row[7].ToString()) + "</td>" +               // [7] Correo
                                    "<td>" + System.Web.HttpUtility.HtmlEncode(nombreCompleto) + "</td>" +                  // Nombre completo
                                    "<td>" + System.Web.HttpUtility.HtmlEncode(row[9].ToString()) + "</td>" +               // [9] Estado
                                    "<td style='text-align:center'>" +
                                    "<i class='fa fa-folder-open-o' onclick='javascript:expedientePaciente(" + row[0].ToString() + ")' " +
                                    "style='cursor:pointer; color:#3498db;' title='Ver Expediente Clinico'></i>" +
                                    "</td>" +
                                    "<td style='text-align:center'>" +
                                    "<i class='fa fa-heartbeat' onclick='javascript:padecimientosUsuario(" + row[0].ToString() + ")' " +
                                    "style='cursor:pointer; color:#e74c3c;' title='Gestionar Padecimientos'></i>" +
                                    "</td>" +
                                    "<td style='text-align:center'><i class='fa fa-trash-o' onclick='javascript:eliminaUsuario(" + row[0].ToString() + ")' style='cursor:pointer'></i></td>" +
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
                throw ex;
            }
        }


        [WebMethod(EnableSession = true)]
        public static string CargaListaUsuariosCombo(List<string> obj_Parametros_JS)
        {
            if (!cls_Sesion_PL_Helper.EsSesionValida())
                return cls_Sesion_PL_Helper.SinSesion();

            try
            {
                string _mensaje = string.Empty;

                //Objetos de la entidad con la que estamos trabajando
                cls_Usuarios_DAL obj_Usuarios_DAL = new cls_Usuarios_DAL();
                cls_Usuarios_BLL obj_Usuarios_BLL = new cls_Usuarios_BLL();

                //Ejecutar en lógica de negocio el proceso o la accion necesaria
                obj_Usuarios_BLL.listarFiltrarUsuarios(ref obj_Usuarios_DAL);

                //Evaluar los resultados de la ejecución de la lógica de negocio
                if (obj_Usuarios_DAL.dtDatos.Rows.Count != 0)
                {
                    for (int i = 0; i < obj_Usuarios_DAL.dtDatos.Rows.Count; i++)
                    {
                        _mensaje += "<option value=" + obj_Usuarios_DAL.dtDatos.Rows[i][0].ToString() +
                            ">" + System.Web.HttpUtility.HtmlEncode(obj_Usuarios_DAL.dtDatos.Rows[i][2].ToString()) + "</option>";
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
                throw ex;
            }
        }
    }
}