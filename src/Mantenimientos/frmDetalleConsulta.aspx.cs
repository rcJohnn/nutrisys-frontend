using System;
using System.Collections.Generic;
using System.Data;
using System.Text;
using System.Web.Services;
using DAL_CRUD_CONSULTAS.Mantenimientos;
using BLL_CRUD_CONSULTAS.Mantenimientos;
using PL_CRUD_CONSULTAS.Helpers;

namespace PL_CRUD_CONSULTAS.Mantenimientos
{
    public partial class frmDetalleConsulta : System.Web.UI.Page
    {
        protected void Page_Load(object sender, EventArgs e) { }

        [WebMethod(EnableSession = true)]
        public static string ObtenerDetalleConsulta(List<string> obj_Parametros_JS)
        {
            if (!cls_Sesion_PL_Helper.EsSesionValida())
                return cls_Sesion_PL_Helper.SinSesion();

            // [0] idConsulta
            try
            {
                cls_Consultas_DAL obj_DAL = new cls_Consultas_DAL();
                cls_Consultas_BLL obj_BLL = new cls_Consultas_BLL();

                obj_DAL.iId_Consulta = Convert.ToInt32(obj_Parametros_JS[0]);
                obj_BLL.Obtiene_Informacion_Consultas(ref obj_DAL);

                if (obj_DAL.dtDatos == null || obj_DAL.dtDatos.Rows.Count == 0)
                    return "{}";

                DataRow r = obj_DAL.dtDatos.Rows[0];

                // USP_Informacion_Consultas columnas:
                // [0] Id_Consulta      [1] Id_Usuario       [2] NombreUsuario
                // [3] Cedula           [4] CorreoUsuario    [5] Id_Medico
                // [6] NombreMedico     [7] CorreoMedico     [8] Fecha_Cita
                // [9] Duracion_Min     [10] Estado          [11] Motivo
                // [12] Peso_kg         [13] Estatura_cm     [14] IMC
                // [15] Grasa_g         [16] Musculo_g       [17] Cintura_cm
                // [18] Cadera_cm       [19] PA_Sistolica    [20] PA_Diastolica
                // [21] Observaciones   [22] Recomendaciones [23] Proxima_Cita
                // [24] GoogleEventId   [25] EmailEnviado    [26] Fecha_Registro
                // [27] Grasa_Pct       [28] Muneca_cm       [29] Agua_Pct
                // [30] Edad_Metabolica [31] Masa_Osea_g     [32] Grasa_Visceral

                string fechaCita = r[8] != DBNull.Value
                    ? Convert.ToDateTime(r[8]).ToString("dd/MM/yyyy HH:mm") : "";
                string proximaCita = r[23] != DBNull.Value
                    ? Convert.ToDateTime(r[23]).ToString("dd/MM/yyyy HH:mm") : "";
                string fechaRegistro = r[26] != DBNull.Value
                    ? Convert.ToDateTime(r[26]).ToString("dd/MM/yyyy") : "";

                var sb = new StringBuilder("{");
                sb.Append("\"idConsulta\":"          + r[0] + ",");
                sb.Append("\"nombrePaciente\":\""     + Esc(r[2]) + "\",");
                sb.Append("\"cedula\":\""             + Esc(r[3]) + "\",");
                sb.Append("\"correoUsuario\":\""      + Esc(r[4]) + "\",");
                sb.Append("\"idMedico\":"             + r[5] + ",");
                sb.Append("\"nombreMedico\":\""       + Esc(r[6]) + "\",");
                sb.Append("\"fechaCita\":\""          + fechaCita + "\",");
                sb.Append("\"duracion\":\""           + Esc(r[9]) + "\",");
                sb.Append("\"estado\":\""             + Esc(r[10]) + "\",");
                sb.Append("\"motivo\":\""             + Esc(r[11]) + "\",");
                sb.Append("\"peso\":"                 + (string.IsNullOrEmpty(Val(r[12])) ? "null" : Val(r[12])) + ",");
                sb.Append("\"estatura\":"             + (string.IsNullOrEmpty(Val(r[13])) ? "null" : Val(r[13])) + ",");
                sb.Append("\"imc\":"                  + (string.IsNullOrEmpty(Val(r[14])) ? "null" : Val(r[14])) + ",");
                sb.Append("\"grasaG\":"               + (string.IsNullOrEmpty(Val(r[15])) ? "null" : Val(r[15])) + ",");
                sb.Append("\"musculoG\":"             + (string.IsNullOrEmpty(Val(r[16])) ? "null" : Val(r[16])) + ",");
                sb.Append("\"cintura\":"              + (string.IsNullOrEmpty(Val(r[17])) ? "null" : Val(r[17])) + ",");
                sb.Append("\"cadera\":"               + (string.IsNullOrEmpty(Val(r[18])) ? "null" : Val(r[18])) + ",");
                sb.Append("\"sistolica\":"            + (string.IsNullOrEmpty(Val(r[19])) ? "null" : Val(r[19])) + ",");
                sb.Append("\"diastolica\":"           + (string.IsNullOrEmpty(Val(r[20])) ? "null" : Val(r[20])) + ",");
                sb.Append("\"observaciones\":\""      + Esc(r[21]) + "\",");
                sb.Append("\"recomendaciones\":\""    + Esc(r[22]) + "\",");
                sb.Append("\"proximaCita\":\""        + proximaCita + "\",");
                sb.Append("\"fechaRegistro\":\""      + fechaRegistro + "\",");
                sb.Append("\"grasaPct\":"             + (string.IsNullOrEmpty(Val(r[27])) ? "null" : Val(r[27])) + ",");
                sb.Append("\"muneca\":"               + (string.IsNullOrEmpty(Val(r[28])) ? "null" : Val(r[28])) + ",");
                sb.Append("\"aguaPct\":"              + (string.IsNullOrEmpty(Val(r[29])) ? "null" : Val(r[29])) + ",");
                sb.Append("\"edadMetabolica\":"       + (string.IsNullOrEmpty(Val(r[30])) ? "null" : Val(r[30])) + ",");
                sb.Append("\"masaOsea\":"             + (string.IsNullOrEmpty(Val(r[31])) ? "null" : Val(r[31])) + ",");
                sb.Append("\"grasaVisceral\":"        + (string.IsNullOrEmpty(Val(r[32])) ? "null" : Val(r[32])) + ",");
                // Antropometría de brazo / estimaciones (columnas 34-42)
                sb.Append("\"circBrazo\":"      + (r["Circunferencia_Brazo_cm"]       == DBNull.Value ? "null" : Val(r["Circunferencia_Brazo_cm"]))       + ",");
                sb.Append("\"circPantorrilla\":" + (r["Circunferencia_Pantorrilla_cm"] == DBNull.Value ? "null" : Val(r["Circunferencia_Pantorrilla_cm"])) + ",");
                sb.Append("\"alturaRodilla\":"  + (r["Altura_Rodilla_cm"]             == DBNull.Value ? "null" : Val(r["Altura_Rodilla_cm"]))             + ",");
                sb.Append("\"atb\":"            + (r["Antrop_ATB"]                    == DBNull.Value ? "null" : Val(r["Antrop_ATB"]))                    + ",");
                sb.Append("\"cmb\":"            + (r["Antrop_CMB"]                    == DBNull.Value ? "null" : Val(r["Antrop_CMB"]))                    + ",");
                sb.Append("\"amb\":"            + (r["Antrop_AMB"]                    == DBNull.Value ? "null" : Val(r["Antrop_AMB"]))                    + ",");
                sb.Append("\"agb\":"            + (r["Antrop_AGB"]                    == DBNull.Value ? "null" : Val(r["Antrop_AGB"]))                    + ",");
                sb.Append("\"pesoEstimado\":"   + (r["Peso_Estimado_kg"]              == DBNull.Value ? "null" : Val(r["Peso_Estimado_kg"]))              + ",");
                sb.Append("\"tallaEstimada\":"  + (r["Talla_Estimada_cm"]             == DBNull.Value ? "null" : Val(r["Talla_Estimada_cm"]))             + "");
                sb.Append("}");
                return sb.ToString();
            }
            catch (Exception ex)
            {
                return "0<SPLITER>" + ex.Message;
            }
        }

        [WebMethod(EnableSession = true)]
        public static string ObtenerDistribucionMacros(List<string> obj_Parametros_JS)
        {
            if (!cls_Sesion_PL_Helper.EsSesionValida())
                return cls_Sesion_PL_Helper.SinSesion();

            // [0] idConsulta
            try
            {
                cls_DistribucionMacros_DAL obj_DAL = new cls_DistribucionMacros_DAL();
                cls_DistribucionMacros_BLL obj_BLL = new cls_DistribucionMacros_BLL();

                obj_DAL.iId_Consulta = Convert.ToInt32(obj_Parametros_JS[0]);
                obj_BLL.Obtiene_Distribucion_Macros(ref obj_DAL);

                if (obj_DAL.dtDatos == null || obj_DAL.dtDatos.Rows.Count == 0)
                    return "{}";

                DataRow r = obj_DAL.dtDatos.Rows[0];

                var sb = new StringBuilder("{");
                sb.Append("\"idDistribucion\":"          + r[0] + ",");
                sb.Append("\"formulaUsada\":\""          + Esc(r[3]) + "\",");
                sb.Append("\"ree\":"                     + (string.IsNullOrEmpty(Val(r[4])) ? "null" : Val(r[4])) + ",");

                // Totales
                sb.Append("\"totalCHO\":"                + (string.IsNullOrEmpty(Val(r[5])) ? "null" : Val(r[5])) + ",");
                sb.Append("\"totalProt\":"               + (string.IsNullOrEmpty(Val(r[6])) ? "null" : Val(r[6])) + ",");
                sb.Append("\"totalGrasa\":"              + (string.IsNullOrEmpty(Val(r[7])) ? "null" : Val(r[7])) + ",");
                sb.Append("\"totalFibra\":"              + (string.IsNullOrEmpty(Val(r[8])) ? "null" : Val(r[8])) + ",");

                // Desayuno
                sb.Append("\"desayunoCHO\":"             + (string.IsNullOrEmpty(Val(r[9])) ? "null" : Val(r[9])) + ",");
                sb.Append("\"desayunoProt\":"            + (string.IsNullOrEmpty(Val(r[10])) ? "null" : Val(r[10])) + ",");
                sb.Append("\"desayunoGrasa\":"           + (string.IsNullOrEmpty(Val(r[11])) ? "null" : Val(r[11])) + ",");
                sb.Append("\"desayunoFibra\":"           + (string.IsNullOrEmpty(Val(r[12])) ? "null" : Val(r[12])) + ",");

                // Merienda AM
                sb.Append("\"meriendaAMCHO\":"           + (string.IsNullOrEmpty(Val(r[13])) ? "null" : Val(r[13])) + ",");
                sb.Append("\"meriendaAMProt\":"          + (string.IsNullOrEmpty(Val(r[14])) ? "null" : Val(r[14])) + ",");
                sb.Append("\"meriendaAMGrasa\":"         + (string.IsNullOrEmpty(Val(r[15])) ? "null" : Val(r[15])) + ",");
                sb.Append("\"meriendaAMFibra\":"         + (string.IsNullOrEmpty(Val(r[16])) ? "null" : Val(r[16])) + ",");

                // Almuerzo
                sb.Append("\"almuerzoCHO\":"             + (string.IsNullOrEmpty(Val(r[17])) ? "null" : Val(r[17])) + ",");
                sb.Append("\"almuerzoProt\":"            + (string.IsNullOrEmpty(Val(r[18])) ? "null" : Val(r[18])) + ",");
                sb.Append("\"almuerzoGrasa\":"           + (string.IsNullOrEmpty(Val(r[19])) ? "null" : Val(r[19])) + ",");
                sb.Append("\"almuerzoFibra\":"           + (string.IsNullOrEmpty(Val(r[20])) ? "null" : Val(r[20])) + ",");

                // Merienda PM
                sb.Append("\"meriendaPMCHO\":"           + (string.IsNullOrEmpty(Val(r[21])) ? "null" : Val(r[21])) + ",");
                sb.Append("\"meriendaPMProt\":"          + (string.IsNullOrEmpty(Val(r[22])) ? "null" : Val(r[22])) + ",");
                sb.Append("\"meriendaPMGrasa\":"         + (string.IsNullOrEmpty(Val(r[23])) ? "null" : Val(r[23])) + ",");
                sb.Append("\"meriendaPMFibra\":"         + (string.IsNullOrEmpty(Val(r[24])) ? "null" : Val(r[24])) + ",");

                // Cena
                sb.Append("\"cenaCHO\":"                 + (string.IsNullOrEmpty(Val(r[25])) ? "null" : Val(r[25])) + ",");
                sb.Append("\"cenaProt\":"                + (string.IsNullOrEmpty(Val(r[26])) ? "null" : Val(r[26])) + ",");
                sb.Append("\"cenaGrasa\":"               + (string.IsNullOrEmpty(Val(r[27])) ? "null" : Val(r[27])) + ",");
                sb.Append("\"cenaFibra\":"               + (string.IsNullOrEmpty(Val(r[28])) ? "null" : Val(r[28])) + "");
                sb.Append("}");
                return sb.ToString();
            }
            catch (Exception ex)
            {
                return "{}";
            }
        }

        private static string Val(object v) =>
            v == null || v == DBNull.Value ? "" : v.ToString().Replace(",", ".");

        private static string Esc(object v)
        {
            if (v == null || v == DBNull.Value) return "";
            return v.ToString()
                    .Replace("\\", "\\\\").Replace("\"", "\\\"")
                    .Replace("\r", "").Replace("\n", "\\n");
        }
    }
}
