using BLL_CRUD_CONSULTAS.BD;
using DAL_CRUD_CONSULTAS.BD;
using PL_CRUD_CONSULTAS.Helpers;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Web.Services;

namespace PL_CRUD_CONSULTAS.Mantenimientos
{
    public partial class frmPrincipal : System.Web.UI.Page
    {
        protected void Page_Load(object sender, EventArgs e)
        {
        }

        // ─────────────────────────────────────────────────
        // Hub contextual — devuelve JSON con datos del rol
        // param[0] = idEntidad, param[1] = rol ('M','U','A')
        // ─────────────────────────────────────────────────
        [WebMethod(EnableSession = true)]
        public static string ObtenerContextoHub(List<string> obj_Parametros_JS)
        {
            if (!cls_Sesion_PL_Helper.EsSesionValida())
                return cls_Sesion_PL_Helper.SinSesion();

            try
            {
                int    idEntidad = Convert.ToInt32(obj_Parametros_JS[0]);
                string rol       = obj_Parametros_JS[1];

                cls_BD_BLL obj_BD_BLL = new cls_BD_BLL();

                if (rol == "M")
                {
                    // — Resumen estadístico —
                    cls_BD_DAL bd1 = new cls_BD_DAL();
                    DataTable  p1  = obj_BD_BLL.ObtieneDTParametros(null);
                    p1.Rows.Add("@IdMedico", "1", idEntidad);
                    bd1.sNomSP       = ConfigurationManager.AppSettings["SP_Hub_Resumen_Medico"];
                    bd1.DT_Parametros = p1;
                    bd1.sNomTabla    = "Resumen";
                    obj_BD_BLL.EjecutaProcesosTabla(ref bd1);

                    // — Agenda de hoy —
                    cls_BD_DAL bd2 = new cls_BD_DAL();
                    DataTable  p2  = obj_BD_BLL.ObtieneDTParametros(null);
                    p2.Rows.Add("@IdMedico", "1", idEntidad);
                    bd2.sNomSP       = ConfigurationManager.AppSettings["SP_Hub_Agenda_Medico"];
                    bd2.DT_Parametros = p2;
                    bd2.sNomTabla    = "Agenda";
                    obj_BD_BLL.EjecutaProcesosTabla(ref bd2);

                    DataTable dtResumen = bd1.DS.Tables[0];
                    DataTable dtAgenda  = bd2.DS.Tables[0];

                    object resumenObj = null;
                    if (dtResumen != null && dtResumen.Rows.Count > 0)
                    {
                        DataRow r = dtResumen.Rows[0];
                        resumenObj = new
                        {
                            pacientesSinSeguimiento = r["PacientesSinSeguimiento30"].ToString(),
                            consultasHoy            = r["ConsultasHoy"].ToString(),
                            consultasPendientes     = r["ConsultasPendientes"].ToString(),
                            totalPacientes          = r["TotalPacientes"].ToString()
                        };
                    }

                    var result = new
                    {
                        rol     = "M",
                        resumen = resumenObj,
                        agenda  = DataTableToList(dtAgenda)
                    };
                    return Newtonsoft.Json.JsonConvert.SerializeObject(result);
                }
                else if (rol == "U")
                {
                    cls_BD_DAL bd = new cls_BD_DAL();
                    DataTable  p  = obj_BD_BLL.ObtieneDTParametros(null);
                    p.Rows.Add("@IdUsuario", "1", idEntidad);
                    bd.sNomSP       = ConfigurationManager.AppSettings["SP_Hub_Usuario"];
                    bd.DT_Parametros = p;
                    bd.sNomTabla    = "HubUsuario";
                    obj_BD_BLL.EjecutaProcesosTabla(ref bd);

                    DataTable dtHub = bd.DS.Tables[0];

                    object ultima = null, proxima = null;
                    if (dtHub != null)
                    {
                        foreach (DataRow row in dtHub.Rows)
                        {
                            if (row["Tipo"].ToString() == "ultima")
                            {
                                ultima = new
                                {
                                    idConsulta  = row["Id_Consulta"].ToString(),
                                    fecha       = row["Fecha_Cita"].ToString(),
                                    estado      = row["EstadoTexto"].ToString(),
                                    medico      = row["NombreMedico"].ToString(),
                                    peso        = row["Peso"].ToString(),
                                    diasDesde   = row["DiasDesde"].ToString()
                                };
                            }
                            else if (row["Tipo"].ToString() == "proxima")
                            {
                                proxima = new
                                {
                                    idConsulta = row["Id_Consulta"].ToString(),
                                    fecha      = row["Fecha_Cita"].ToString(),
                                    estado     = row["EstadoTexto"].ToString(),
                                    medico     = row["NombreMedico"].ToString(),
                                    diasHasta  = row["DiasDesde"].ToString()
                                };
                            }
                        }
                    }

                    var result = new { rol = "U", ultimaCita = ultima, proximaCita = proxima };
                    return Newtonsoft.Json.JsonConvert.SerializeObject(result);
                }

                return Newtonsoft.Json.JsonConvert.SerializeObject(new { rol = rol });
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        // Convierte un DataTable en List<Dictionary> para serialización JSON
        private static List<Dictionary<string, string>> DataTableToList(DataTable dt)
        {
            var list = new List<Dictionary<string, string>>();
            if (dt == null) return list;
            foreach (DataRow row in dt.Rows)
            {
                var dict = new Dictionary<string, string>();
                foreach (DataColumn col in dt.Columns)
                    dict[col.ColumnName] = row[col] == DBNull.Value ? "" : row[col].ToString();
                list.Add(dict);
            }
            return list;
        }
    }
}
