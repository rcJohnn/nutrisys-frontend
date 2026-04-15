using System;
using System.Collections.Generic;
using System.Data;
using System.Web.Services;
using DAL_CRUD_CONSULTAS.Mantenimientos;
using BLL_CRUD_CONSULTAS.Mantenimientos;
using PL_CRUD_CONSULTAS.Helpers;

namespace PL_CRUD_CONSULTAS.Mantenimientos
{
    public partial class frmConsultaConsultas : System.Web.UI.Page
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

                cls_Usuarios_DAL obj_Usuarios_DAL = new cls_Usuarios_DAL();
                cls_Usuarios_BLL obj_Usuarios_BLL = new cls_Usuarios_BLL();

                obj_Usuarios_BLL.listarFiltrarUsuarios(ref obj_Usuarios_DAL);

                if (obj_Usuarios_DAL.dtDatos != null && obj_Usuarios_DAL.dtDatos.Rows.Count > 0)
                {
                    foreach (DataRow row in obj_Usuarios_DAL.dtDatos.Rows)
                    {
                        string nombreCompleto = row[1].ToString() + " " + row[2].ToString() + " " + row[3].ToString();
                        _mensaje += "<option value='" + row[0].ToString() + "'>" + System.Web.HttpUtility.HtmlEncode(nombreCompleto) + "</option>";
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
        public static string CargaListaMedicos(List<string> obj_Parametros_JS)
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
                    foreach (DataRow row in obj_Medicos_DAL.dtDatos.Rows)
                    {
                        string nombreCompleto = row[1].ToString() + " " + row[2].ToString() + " " + row[3].ToString();
                        _mensaje += "<option value='" + row[0].ToString() + "'>" + System.Web.HttpUtility.HtmlEncode(nombreCompleto) + "</option>";
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
        public static string CargaListaConsultas(List<string> obj_Parametros_JS)
        {
            if (!cls_Sesion_PL_Helper.EsSesionValida())
                return cls_Sesion_PL_Helper.SinSesion();

            try
            {
                string _mensaje = string.Empty;

                cls_Consultas_DAL obj_Consultas_DAL = new cls_Consultas_DAL();
                cls_Consultas_BLL obj_Consultas_BLL = new cls_Consultas_BLL();

                // Parsear filtros
                if (!string.IsNullOrEmpty(obj_Parametros_JS[0]) && obj_Parametros_JS[0] != "0")
                    obj_Consultas_DAL.iId_Usuario = Convert.ToInt32(obj_Parametros_JS[0]);

                if (!string.IsNullOrEmpty(obj_Parametros_JS[1]) && obj_Parametros_JS[1] != "0")
                    obj_Consultas_DAL.iId_Medico = Convert.ToInt32(obj_Parametros_JS[1]);

                if (!string.IsNullOrEmpty(obj_Parametros_JS[2]))
                    obj_Consultas_DAL.sEstado = obj_Parametros_JS[2];

                if (!string.IsNullOrEmpty(obj_Parametros_JS[3]))
                    obj_Consultas_DAL.dtFechaInicio = Convert.ToDateTime(obj_Parametros_JS[3]);

                if (!string.IsNullOrEmpty(obj_Parametros_JS[4]))
                    obj_Consultas_DAL.dtFechaFin = Convert.ToDateTime(obj_Parametros_JS[4]);

                obj_Consultas_BLL.filtrarConsultas(ref obj_Consultas_DAL);

                if (obj_Consultas_DAL.dtDatos.Rows.Count != 0)
                {
                    _mensaje = "<thead>" +
                              "<tr>" +
                              "<th>ID</th>" +
                              "<th>Paciente</th>" +
                              "<th>Médico</th>" +
                              "<th>Fecha/Hora</th>" +
                              "<th>Duración</th>" +
                              "<th>Estado</th>" +
                              "<th>Motivo</th>" +
                              "<th style='text-align:center'>Acciones</th>" +
                              "</tr>" +
                              "</thead>" +
                              "<tbody>";

                    for (int i = 0; i < obj_Consultas_DAL.dtDatos.Rows.Count; i++)
                    {
                        DataRow row = obj_Consultas_DAL.dtDatos.Rows[i];

                        // [0] Id_Consulta
                        // [1] Id_Usuario
                        // [2] NombreUsuario
                        // [3] Id_Medico
                        // [4] NombreMedico
                        // [5] Fecha_Cita
                        // [6] Duracion_Minutos
                        // [7] Estado (texto)
                        // [8] Motivo

                        string idConsulta = row[0].ToString();
                        string nombreUsuario = row[2].ToString();  // ✅ CORRECTO
                        string nombreMedico = row[5].ToString();   // ✅ CORRECTO
                        string fechaCita = Convert.ToDateTime(row[6]).ToString("dd/MM/yyyy HH:mm");  // ✅ CORRECTO
                        string duracion = row[7].ToString() + " min";  // ✅ CORRECTO
                        string estado = row[8].ToString();  // ✅ CORRECTO (texto)
                        string motivo = row[10].ToString();

                        // Badge de estado
                        string badgeEstado = "";
                        switch (estado)
                        {
                            case "Pendiente":
                                badgeEstado = "<span class='badge badge-warning'>Pendiente</span>";
                                break;
                            case "Completada":
                                badgeEstado = "<span class='badge badge-success'>Completada</span>";
                                break;
                            case "Cancelada":
                                badgeEstado = "<span class='badge badge-danger'>Cancelada</span>";
                                break;
                            case "No Asistió":
                                badgeEstado = "<span class='badge badge-secondary'>No Asistió</span>";
                                break;
                        }

                        _mensaje += "<tr>" +
                                   "<td>" + idConsulta + "</td>" +
                                   "<td>" + System.Web.HttpUtility.HtmlEncode(nombreUsuario) + "</td>" +
                                   "<td>" + System.Web.HttpUtility.HtmlEncode(nombreMedico) + "</td>" +
                                   "<td>" + fechaCita + "</td>" +
                                   "<td>" + duracion + "</td>" +
                                   "<td>" + badgeEstado + "</td>" +
                                   "<td>" + (string.IsNullOrEmpty(motivo) ? "-" : System.Web.HttpUtility.HtmlEncode(motivo)) + "</td>" +
                                   "<td style='text-align:center'>";

                        // Botones según el estado
                        if (estado == "Pendiente")
                        {
                            _mensaje += "<i class='fa fa-edit' onclick='editarConsulta(" + idConsulta + ")' " +
                                       "style='cursor:pointer; color:#007bff; margin-right:10px;' title='Editar'></i>";
                            _mensaje += "<i class='fa fa-check-circle' onclick='completarConsulta(" + idConsulta + ")' " +
                                       "style='cursor:pointer; color:#28a745; margin-right:10px;' title='Completar Métricas'></i>";
                            _mensaje += "<i class='fa fa-times-circle' onclick='cancelarConsulta(" + idConsulta + ")' " +
                                       "style='cursor:pointer; color:#dc3545; margin-right:10px;' title='Cancelar'></i>";
                            _mensaje += "<i class='fa fa-user-times' onclick='marcarNoAsistio(" + idConsulta + ")' " +
                                       "style='cursor:pointer; color:#6c757d;' title='No Asistió'></i>";
                        }
                        else if (estado == "Completada")
                        {
                            _mensaje += "<i class='fa fa-eye' onclick='verDetalleConsulta(" + idConsulta + ")' " +
                                       "style='cursor:pointer; color:#17a2b8;' title='Ver Detalles'></i>";
                        }

                        _mensaje += "</td>" +
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
        public static string CargaEventosCalendario(List<string> obj_Parametros_JS)
        {
            if (!cls_Sesion_PL_Helper.EsSesionValida())
                return cls_Sesion_PL_Helper.SinSesion();

            try
            {
                cls_Consultas_DAL obj_DAL = new cls_Consultas_DAL();
                cls_Consultas_BLL obj_BLL = new cls_Consultas_BLL();

                if (!string.IsNullOrEmpty(obj_Parametros_JS[0]) && obj_Parametros_JS[0] != "0")
                    obj_DAL.iId_Usuario = Convert.ToInt32(obj_Parametros_JS[0]);
                if (!string.IsNullOrEmpty(obj_Parametros_JS[1]) && obj_Parametros_JS[1] != "0")
                    obj_DAL.iId_Medico = Convert.ToInt32(obj_Parametros_JS[1]);
                if (!string.IsNullOrEmpty(obj_Parametros_JS[2]))
                    obj_DAL.sEstado = obj_Parametros_JS[2];
                if (!string.IsNullOrEmpty(obj_Parametros_JS[3]))
                    obj_DAL.dtFechaInicio = Convert.ToDateTime(obj_Parametros_JS[3]);
                if (!string.IsNullOrEmpty(obj_Parametros_JS[4]))
                    obj_DAL.dtFechaFin = Convert.ToDateTime(obj_Parametros_JS[4]);

                obj_BLL.filtrarConsultas(ref obj_DAL);

                if (obj_DAL.dtDatos == null || obj_DAL.dtDatos.Rows.Count == 0)
                    return "[]";

                // Columnas de USP_Filtrar_Consultas:
                // [0] Id_Consulta  [1] Id_Usuario  [2] NombreUsuario  [3] Cedula
                // [4] Id_Medico    [5] NombreMedico  [6] Fecha_Cita
                // [7] Duracion_Minutos  [8] Estado(texto)  [9] EstadoCodigo
                // [10] Motivo

                var sb = new System.Text.StringBuilder("[");
                for (int i = 0; i < obj_DAL.dtDatos.Rows.Count; i++)
                {
                    DataRow r = obj_DAL.dtDatos.Rows[i];
                    if (i > 0) sb.Append(",");

                    DateTime inicio = Convert.ToDateTime(r[6]);
                    DateTime fin = inicio.AddMinutes(Convert.ToInt32(r[7]));
                    string cod = r[9].ToString();  // P/C/X/N

                    sb.Append("{");
                    sb.Append("\"id\":" + r[0] + ",");
                    sb.Append("\"title\":\"" + r[2].ToString().Replace("\"", "") + "\",");
                    sb.Append("\"start\":\"" + inicio.ToString("yyyy-MM-ddTHH:mm:ss") + "\",");
                    sb.Append("\"end\":\"" + fin.ToString("yyyy-MM-ddTHH:mm:ss") + "\",");
                    sb.Append("\"extendedProps\":{");
                    sb.Append("\"idConsulta\":" + r[0] + ",");
                    sb.Append("\"medico\":\"" + r[5].ToString().Replace("\"", "") + "\",");
                    sb.Append("\"estadoCodigo\":\"" + cod + "\",");
                    sb.Append("\"motivo\":\"" + r[10].ToString().Replace("\"", "").Replace("\n", " ") + "\"");
                    sb.Append("}");
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



        [WebMethod(EnableSession = true)]
        public static string CancelarConsulta(List<string> obj_Parametros_JS)
        {
            if (!cls_Sesion_PL_Helper.EsSesionValida())
                return cls_Sesion_PL_Helper.SinSesion();

            try
            {
                cls_Consultas_DAL obj_Consultas_DAL = new cls_Consultas_DAL();
                cls_Consultas_BLL obj_Consultas_BLL = new cls_Consultas_BLL();

                obj_Consultas_DAL.iId_Consulta = Convert.ToInt32(obj_Parametros_JS[0]);
                obj_Consultas_DAL.iIdUsuarioGlobal = Convert.ToInt32(obj_Parametros_JS[1]);

                obj_Consultas_BLL.cancelarConsulta(ref obj_Consultas_DAL);

                return obj_Consultas_DAL.sValorScalar + "<SPLITER>Consulta cancelada exitosamente";
            }
            catch (Exception ex)
            {
                return "0<SPLITER>" + ex.Message;
            }
        }

        [WebMethod(EnableSession = true)]
        public static string MarcarNoAsistio(List<string> obj_Parametros_JS)
        {
            if (!cls_Sesion_PL_Helper.EsSesionValida())
                return cls_Sesion_PL_Helper.SinSesion();

            try
            {
                cls_Consultas_DAL obj_Consultas_DAL = new cls_Consultas_DAL();
                cls_Consultas_BLL obj_Consultas_BLL = new cls_Consultas_BLL();

                obj_Consultas_DAL.iId_Consulta = Convert.ToInt32(obj_Parametros_JS[0]);
                obj_Consultas_DAL.iIdUsuarioGlobal = Convert.ToInt32(obj_Parametros_JS[1]);

                obj_Consultas_BLL.marcarNoAsistio(ref obj_Consultas_DAL);

                return obj_Consultas_DAL.sValorScalar + "<SPLITER>Marcado como No Asistió";
            }
            catch (Exception ex)
            {
                return "0<SPLITER>" + ex.Message;
            }
        }
    }
}