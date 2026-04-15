using BLL_CRUD_CONSULTAS.Mantenimientos;
using BLL_CRUD_VEHICULOS.Mantenimientos;
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
    public partial class frmConsultaAuditoria : System.Web.UI.Page
    {
        protected void Page_Load(object sender, EventArgs e)
        {

        }

        [WebMethod(EnableSession = true)]
        public static string CargaListaAuditoria(List<string> obj_Parametros_JS)
        {
            if (!cls_Sesion_PL_Helper.EsSesionValida())
                return cls_Sesion_PL_Helper.SinSesion();

            try
            {
                string _mensaje = string.Empty;

                cls_Auditoria_DAL obj_Auditoria_DAL = new cls_Auditoria_DAL();
                cls_Auditoria_BLL obj_Auditoria_BLL = new cls_Auditoria_BLL();

                // Descomponer parámetros del JS
                // [0] Id_Entidad (0 si no se filtra)
                // [1] TipoEntidad ('U', 'M', o vacío si no se filtra)
                // [2] Accion ('I', 'C', 'A', 'E', o vacío si no se filtra)
                // [3] FechaDesde
                // [4] FechaHasta

                obj_Auditoria_DAL.iId_Entidad = string.IsNullOrEmpty(obj_Parametros_JS[0]) ? 0 : Convert.ToInt32(obj_Parametros_JS[0]);
                obj_Auditoria_DAL.sTipoEntidad = obj_Parametros_JS[1].ToString();
                obj_Auditoria_DAL.sAccion = obj_Parametros_JS[2].ToString();

                // Manejo de fechas - si vienen vacías, usar MinValue
                obj_Auditoria_DAL.dFechaDD = string.IsNullOrEmpty(obj_Parametros_JS[3])
                    ? DateTime.MinValue
                    : Convert.ToDateTime(obj_Parametros_JS[3]);

                obj_Auditoria_DAL.dFechaHH = string.IsNullOrEmpty(obj_Parametros_JS[4])
                    ? DateTime.MinValue
                    : Convert.ToDateTime(obj_Parametros_JS[4]);

                // Ejecutar lógica de negocio
                obj_Auditoria_BLL.listarFiltrarAuditoria(ref obj_Auditoria_DAL);

                // Construir HTML de la tabla
                if (obj_Auditoria_DAL.dtDatos != null && obj_Auditoria_DAL.dtDatos.Rows.Count > 0)
                {
                    _mensaje =
                        "<thead>" +
                            "<tr>" +
                                "<th>Fecha / Hora</th>" +
                                "<th>Entidad</th>" +
                                "<th>Nombre</th>" +
                                "<th>Acción</th>" +
                                "<th>Descripción</th>" +
                            "</tr>" +
                        "</thead>" +
                        "<tbody>";

                    // Índices de las columnas del SP:
                    // [0] Id_Auditoria
                    // [1] Id_Entidad
                    // [2] TipoEntidad
                    // [3] NombreCompleto
                    // [4] TipoEntidadDescripcion
                    // [5] Accion
                    // [6] AccionDescripcion
                    // [7] Descripcion
                    // [8] Fecha

                    for (int i = 0; i < obj_Auditoria_DAL.dtDatos.Rows.Count; i++)
                    {
                        DataRow row = obj_Auditoria_DAL.dtDatos.Rows[i];

                        _mensaje += "<tr>" +
                            "<td>" + Convert.ToDateTime(row[8]).ToString("dd/MM/yyyy HH:mm:ss") + "</td>" +
                            "<td>" + HttpUtility.HtmlEncode(row[4].ToString()) + "</td>" +  // Usuario / Médico
                            "<td>" + HttpUtility.HtmlEncode(row[3].ToString()) + "</td>" +  // Nombre Completo
                            "<td>" + HttpUtility.HtmlEncode(row[6].ToString()) + "</td>" +  // Inicio Sesión / Cierre Sesión / etc
                            "<td>" + HttpUtility.HtmlEncode(row[7].ToString()) + "</td>" +  // Descripción completa
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


        // 🆕 NUEVO: Cargar combo con Usuarios Y Médicos
        [WebMethod(EnableSession = true)]
        public static string CargaListaUsuariosCombo(List<string> obj_Parametros_JS)
        {
            if (!cls_Sesion_PL_Helper.EsSesionValida())
                return cls_Sesion_PL_Helper.SinSesion();

            try
            {
                string _mensaje = string.Empty;

                // 1️⃣ Cargar Usuarios
                cls_Usuarios_DAL obj_Usuarios_DAL = new cls_Usuarios_DAL();
                cls_Usuarios_BLL obj_Usuarios_BLL = new cls_Usuarios_BLL();

                obj_Usuarios_BLL.listarFiltrarUsuarios(ref obj_Usuarios_DAL);

                if (obj_Usuarios_DAL.dtDatos != null && obj_Usuarios_DAL.dtDatos.Rows.Count > 0)
                {
                    // Grupo de Usuarios
                    _mensaje += "<optgroup label='Usuarios'>";
                    for (int i = 0; i < obj_Usuarios_DAL.dtDatos.Rows.Count; i++)
                    {
                        DataRow row = obj_Usuarios_DAL.dtDatos.Rows[i];
                        // [0] Id_Usuario
                        // [1] Nombre
                        // [2] Prim_Apellido
                        // [3] Seg_Apellido
                        string nombreCompleto = row[1].ToString() + " " +
                                                row[2].ToString() + " " +
                                                row[3].ToString();

                        _mensaje += "<option value='" + row[0].ToString() + "' data-tipo='U'>" +
                                    System.Web.HttpUtility.HtmlEncode(nombreCompleto) + "</option>";
                    }
                    _mensaje += "</optgroup>";
                }

                // 2️⃣ Cargar Médicos
                cls_Medicos_DAL obj_Medicos_DAL = new cls_Medicos_DAL();
                cls_Medicos_BLL obj_Medicos_BLL = new cls_Medicos_BLL();

                obj_Medicos_BLL.listarFiltrarMedicos(ref obj_Medicos_DAL);

                if (obj_Medicos_DAL.dtDatos != null && obj_Medicos_DAL.dtDatos.Rows.Count > 0)
                {
                    // Grupo de Médicos
                    _mensaje += "<optgroup label='Médicos'>";
                    for (int i = 0; i < obj_Medicos_DAL.dtDatos.Rows.Count; i++)
                    {
                        DataRow row = obj_Medicos_DAL.dtDatos.Rows[i];
                        // [0] Id_Medico
                        // [1] Nombre
                        // [2] Prim_Apellido
                        // [3] Seg_Apellido
                        string nombreCompleto = row[1].ToString() + " " +
                                                row[2].ToString() + " " +
                                                row[3].ToString();

                        _mensaje += "<option value='" + row[0].ToString() + "' data-tipo='M'>" +
                                    System.Web.HttpUtility.HtmlEncode(nombreCompleto) + "</option>";
                    }
                    _mensaje += "</optgroup>";
                }

                if (string.IsNullOrEmpty(_mensaje))
                {
                    return "No se encontraron registros";
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