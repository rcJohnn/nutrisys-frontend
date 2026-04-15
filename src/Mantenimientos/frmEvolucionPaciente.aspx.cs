using System;
using System.Collections.Generic;
using System.Web.Services;
using System.Web.UI;
using BLL_CRUD_CONSULTAS.Mantenimientos;
using DAL_CRUD_CONSULTAS.Mantenimientos;
using PL_CRUD_CONSULTAS.Helpers;

namespace PL_CRUD_CONSULTAS.Mantenimientos
{
    public partial class frmEvolucionPaciente : System.Web.UI.Page
    {
        protected void Page_Load(object sender, EventArgs e) { }

        [WebMethod(EnableSession = true)]
        public static string CargaListaUsuarios(List<string> obj_Parametros_JS)
        {
            if (!cls_Sesion_PL_Helper.EsSesionValida())
                return cls_Sesion_PL_Helper.SinSesion();
            if (cls_Sesion_PL_Helper.ObtieneSesionTipo() == "U")
                return cls_Sesion_PL_Helper.SinAutorizacion();
            try
            {
                string _mensaje = string.Empty;
                cls_Usuarios_DAL obj_Usuarios_DAL = new cls_Usuarios_DAL();
                cls_Usuarios_BLL obj_Usuarios_BLL = new cls_Usuarios_BLL();
                obj_Usuarios_BLL.listarFiltrarUsuarios(ref obj_Usuarios_DAL);

                if (obj_Usuarios_DAL.dtDatos != null && obj_Usuarios_DAL.dtDatos.Rows.Count > 0)
                {
                    foreach (System.Data.DataRow row in obj_Usuarios_DAL.dtDatos.Rows)
                    {
                        string nombre = System.Web.HttpUtility.HtmlEncode(
                                        row[1].ToString() + " " +
                                        row[2].ToString() + " " +
                                        row[3].ToString());
                        _mensaje += "<option value='" + row[0] + "'>" + nombre + "</option>";
                    }
                }
                return _mensaje;
            }
            catch (Exception ex) { return "Error: " + ex.Message; }
        }

        [WebMethod(EnableSession = true)]
        public static string ObtenerProgresoConsultas(List<string> obj_Parametros_JS)
        {
            if (!cls_Sesion_PL_Helper.EsSesionValida())
                return cls_Sesion_PL_Helper.SinSesion();
            try
            {
                int idUsuario = Convert.ToInt32(obj_Parametros_JS[0]);
                if (cls_Sesion_PL_Helper.ObtieneSesionTipo() == "U" && idUsuario != cls_Sesion_PL_Helper.ObtieneSesionId())
                    return cls_Sesion_PL_Helper.SinAutorizacion();
                cls_Progreso_DAL obj_DAL = new cls_Progreso_DAL();
                cls_Progreso_BLL obj_BLL = new cls_Progreso_BLL();
                obj_DAL.iId_Usuario = idUsuario;
                obj_BLL.ObtenerConsultas(ref obj_DAL);

                if (obj_DAL.dtDatos == null || obj_DAL.dtDatos.Rows.Count == 0)
                    return "[]";

                var sb = new System.Text.StringBuilder("[");
                for (int i = 0; i < obj_DAL.dtDatos.Rows.Count; i++)
                {
                    var r = obj_DAL.dtDatos.Rows[i];
                    if (i > 0) sb.Append(",");
                    sb.Append("{");
                    sb.Append("\"Fecha\":\"" + r["Fecha"] + "\",");
                    sb.Append("\"Peso\":" + Val(r["Peso_kg"]) + ",");
                    sb.Append("\"IMC\":" + Val(r["IMC"]) + ",");
                    sb.Append("\"Grasa\":" + Val(r["Grasa_g"]) + ",");
                    sb.Append("\"Musculo\":" + Val(r["Musculo_g"]) + ",");
                    sb.Append("\"Cintura\":" + Val(r["Circunferencia_Cintura_cm"]) + ",");
                    sb.Append("\"Cadera\":" + Val(r["Circunferencia_Cadera_cm"]) + ",");
                    sb.Append("\"Sistolica\":" + Val(r["Presion_Arterial_Sistolica"]) + ",");
                    sb.Append("\"Diastolica\":" + Val(r["Presion_Arterial_Diastolica"]) + ",");
                    sb.Append("\"Observaciones\":\"" + Esc(r["Observaciones_Medico"]) + "\",");
                    sb.Append("\"Recomendaciones\":\"" + Esc(r["Recomendaciones"]) + "\",");
                    sb.Append("\"Medico\":\"" + Esc(r["NombreMedico"]) + "\"");
                    sb.Append("}");
                }
                sb.Append("]");
                return sb.ToString();
            }
            catch (Exception ex) { return "Error: " + ex.Message; }
        }

        [WebMethod(EnableSession = true)]
        public static string ObtenerProgresoBioquimicos(List<string> obj_Parametros_JS)
        {
            if (!cls_Sesion_PL_Helper.EsSesionValida())
                return cls_Sesion_PL_Helper.SinSesion();
            try
            {
                int idUsuario = Convert.ToInt32(obj_Parametros_JS[0]);
                if (cls_Sesion_PL_Helper.ObtieneSesionTipo() == "U" && idUsuario != cls_Sesion_PL_Helper.ObtieneSesionId())
                    return cls_Sesion_PL_Helper.SinAutorizacion();
                cls_Progreso_DAL obj_DAL = new cls_Progreso_DAL();
                cls_Progreso_BLL obj_BLL = new cls_Progreso_BLL();
                obj_DAL.iId_Usuario = idUsuario;
                obj_BLL.ObtenerBioquimicos(ref obj_DAL);

                if (obj_DAL.dtDatos == null || obj_DAL.dtDatos.Rows.Count == 0)
                    return "{}";

                var r = obj_DAL.dtDatos.Rows[0];
                var sb = new System.Text.StringBuilder("{");
                sb.Append("\"Fecha\":\"" + r["Fecha"] + "\",");
                sb.Append("\"Hemoglobina\":" + Val(r["Hemoglobina"]) + ",");
                sb.Append("\"Hematocrito\":" + Val(r["Hematocrito"]) + ",");
                sb.Append("\"ColesterolTotal\":" + Val(r["Colesterol_Total"]) + ",");
                sb.Append("\"HDL\":" + Val(r["HDL"]) + ",");
                sb.Append("\"LDL\":" + Val(r["LDL"]) + ",");
                sb.Append("\"Trigliceridos\":" + Val(r["Trigliceridos"]) + ",");
                sb.Append("\"Glicemia\":" + Val(r["Glicemia"]) + ",");
                sb.Append("\"AcidoUrico\":" + Val(r["Acido_Urico"]) + ",");
                sb.Append("\"Albumina\":" + Val(r["Albumina"]) + ",");
                sb.Append("\"Creatinina\":" + Val(r["Creatinina"]) + ",");
                sb.Append("\"TSH\":" + Val(r["TSH"]) + ",");
                sb.Append("\"VitaminaD\":" + Val(r["Vitamina_D"]) + ",");
                sb.Append("\"VitaminaB12\":" + Val(r["Vitamina_B12"]) + ",");
                sb.Append("\"Observaciones\":\"" + Esc(r["Observaciones"]) + "\"");
                sb.Append("}");
                return sb.ToString();
            }
            catch (Exception ex) { return "Error: " + ex.Message; }
        }

        [WebMethod(EnableSession = true)]
        public static string ObtenerProgresoHistoria(List<string> obj_Parametros_JS)
        {
            if (!cls_Sesion_PL_Helper.EsSesionValida())
                return cls_Sesion_PL_Helper.SinSesion();
            try
            {
                int idUsuario = Convert.ToInt32(obj_Parametros_JS[0]);
                if (cls_Sesion_PL_Helper.ObtieneSesionTipo() == "U" && idUsuario != cls_Sesion_PL_Helper.ObtieneSesionId())
                    return cls_Sesion_PL_Helper.SinAutorizacion();
                cls_Progreso_DAL obj_DAL = new cls_Progreso_DAL();
                cls_Progreso_BLL obj_BLL = new cls_Progreso_BLL();
                obj_DAL.iId_Usuario = idUsuario;
                obj_BLL.ObtenerHistoria(ref obj_DAL);

                if (obj_DAL.dtDatos == null || obj_DAL.dtDatos.Rows.Count == 0)
                    return "{}";

                var r = obj_DAL.dtDatos.Rows[0];
                var sb = new System.Text.StringBuilder("{");
                sb.Append("\"Objetivos\":\"" + Esc(r["Objetivos_Clinicos"]) + "\",");
                sb.Append("\"CalidadSueno\":\"" + Esc(r["Calidad_Sueno"]) + "\",");
                sb.Append("\"FuncionIntestinal\":\"" + Esc(r["Funcion_Intestinal"]) + "\",");
                sb.Append("\"Fuma\":" + (r["Fuma"].ToString() == "True" ? "true" : "false") + ",");
                sb.Append("\"Alcohol\":" + (r["Consume_Alcohol"].ToString() == "True" ? "true" : "false") + ",");
                sb.Append("\"FrecuenciaAlcohol\":\"" + Esc(r["Frecuencia_Alcohol"]) + "\",");
                sb.Append("\"ActividadFisica\":\"" + Esc(r["Actividad_Fisica"]) + "\",");
                sb.Append("\"Medicamentos\":\"" + Esc(r["Medicamentos"]) + "\",");
                sb.Append("\"Agua\":\"" + Esc(r["Ingesta_Agua_Diaria"]) + "\",");
                sb.Append("\"Intolerancias\":\"" + Esc(r["Intolerancias"]) + "\",");
                sb.Append("\"Alergias\":\"" + Esc(r["Alergias_Alimentarias"]) + "\"");
                sb.Append("}");
                return sb.ToString();
            }
            catch (Exception ex) { return "Error: " + ex.Message; }
        }

        private static string Val(object v)
        {
            if (v == null || v == System.DBNull.Value) return "null";
            return v.ToString().Replace(",", ".");
        }

        private static string Esc(object v)
        {
            if (v == null || v == System.DBNull.Value) return "";
            return v.ToString()
                    .Replace("\\", "\\\\")
                    .Replace("\"", "\\\"")
                    .Replace("\r", "")
                    .Replace("\n", "\\n");
        }
    }
}