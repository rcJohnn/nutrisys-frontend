using System;
using System.Collections.Generic;
using System.Data;
using System.Web.Services;
using DAL_CRUD_CONSULTAS.Mantenimientos;
using BLL_CRUD_CONSULTAS.Mantenimientos;
using PL_CRUD_CONSULTAS.Helpers;

namespace PL_CRUD_CONSULTAS.Mantenimientos
{
    public partial class frmExpedientePaciente : System.Web.UI.Page
    {
        protected void Page_Load(object sender, EventArgs e) { }

        // ============================================
        // CARGAR INFORMACIÓN BÁSICA DEL PACIENTE
        // ============================================
        [WebMethod(EnableSession = true)]
        public static string CargaInfoUsuario(List<string> obj_Parametros_JS)
        {
            if (!cls_Sesion_PL_Helper.EsSesionValida())
                return cls_Sesion_PL_Helper.SinSesion();

            try
            {
                cls_Usuarios_DAL obj_Usuarios_DAL = new cls_Usuarios_DAL();
                cls_Usuarios_BLL obj_Usuarios_BLL = new cls_Usuarios_BLL();

                obj_Usuarios_DAL.iId_Usuario = Convert.ToInt32(obj_Parametros_JS[0]);
                obj_Usuarios_BLL.Obtiene_Informacion_Usuarios(ref obj_Usuarios_DAL);

                if (obj_Usuarios_DAL.dtDatos == null || obj_Usuarios_DAL.dtDatos.Rows.Count == 0)
                    return "Error<SPLITER>No se encontró el paciente";

                DataRow row = obj_Usuarios_DAL.dtDatos.Rows[0];
                string nombre = (row[1].ToString() + " " + row[2].ToString() + " " + row[3].ToString()).Trim();
                return nombre + "<SPLITER>" + row[8].ToString(); // nombre + correo
            }
            catch (Exception ex) { return "Error<SPLITER>" + ex.Message; }
        }

        // ============================================
        // CARGAR HISTORIA CLÍNICA
        // ============================================
        [WebMethod(EnableSession = true)]
        public static string CargarHistoriaClinica(List<string> obj_Parametros_JS)
        {
            if (!cls_Sesion_PL_Helper.EsSesionValida())
                return cls_Sesion_PL_Helper.SinSesion();

            try
            {
                cls_HistoriaClinica_DAL obj_HC_DAL = new cls_HistoriaClinica_DAL();
                cls_HistoriaClinica_BLL obj_HC_BLL = new cls_HistoriaClinica_BLL();

                obj_HC_DAL.iId_Usuario = Convert.ToInt32(obj_Parametros_JS[0]);
                obj_HC_BLL.Obtiene_Informacion_HistoriaClinica(ref obj_HC_DAL);

                if (obj_HC_DAL.dtDatos == null || obj_HC_DAL.dtDatos.Rows.Count == 0)
                    return "SIN_DATOS";

                DataRow row = obj_HC_DAL.dtDatos.Rows[0];

                return row["Objetivos_Clinicos"].ToString() + "<SPLITER>" +
                       row["Calidad_Sueno"].ToString() + "<SPLITER>" +
                       row["Funcion_Intestinal"].ToString() + "<SPLITER>" +
                       (Convert.ToBoolean(row["Fuma"]) ? "1" : "0") + "<SPLITER>" +
                       (Convert.ToBoolean(row["Consume_Alcohol"]) ? "1" : "0") + "<SPLITER>" +
                       row["Frecuencia_Alcohol"].ToString() + "<SPLITER>" +
                       row["Actividad_Fisica"].ToString() + "<SPLITER>" +
                       row["Medicamentos"].ToString() + "<SPLITER>" +
                       row["Cirugias_Recientes"].ToString() + "<SPLITER>" +
                       (Convert.ToBoolean(row["Embarazo"]) ? "1" : "0") + "<SPLITER>" +
                       (Convert.ToBoolean(row["Lactancia"]) ? "1" : "0") + "<SPLITER>" +
                       row["Alimentos_Favoritos"].ToString() + "<SPLITER>" +
                       row["Alimentos_No_Gustan"].ToString() + "<SPLITER>" +
                       row["Intolerancias"].ToString() + "<SPLITER>" +
                       row["Alergias_Alimentarias"].ToString() + "<SPLITER>" +
                       row["Ingesta_Agua_Diaria"].ToString();
            }
            catch (Exception ex) { return "Error<SPLITER>" + ex.Message; }
        }

        // ============================================
        // CARGAR EVALUACIÓN CUANTITATIVA
        // ============================================
        [WebMethod(EnableSession = true)]
        public static string CargarEvaluacionCuantitativa(List<string> obj_Parametros_JS)
        {
            if (!cls_Sesion_PL_Helper.EsSesionValida())
                return cls_Sesion_PL_Helper.SinSesion();

            try
            {
                cls_EvaluacionCuantitativa_DAL obj_EC_DAL = new cls_EvaluacionCuantitativa_DAL();
                cls_EvaluacionCuantitativa_BLL obj_EC_BLL = new cls_EvaluacionCuantitativa_BLL();

                obj_EC_DAL.iId_Usuario = Convert.ToInt32(obj_Parametros_JS[0]);
                obj_EC_BLL.Obtiene_Evaluacion_Cuantitativa(ref obj_EC_DAL);

                if (obj_EC_DAL.dtDatos == null || obj_EC_DAL.dtDatos.Rows.Count == 0)
                    return "SIN_DATOS";

                string[] tiempos = { "Desayuno", "Merienda AM", "Almuerzo", "Merienda PM", "Cena" };
                string[] valores = { "", "", "", "", "" };

                foreach (DataRow row in obj_EC_DAL.dtDatos.Rows)
                {
                    string tiempo = row["Tiempo_Comida"].ToString();
                    for (int i = 0; i < tiempos.Length; i++)
                    {
                        if (tiempos[i] == tiempo)
                        {
                            valores[i] = row["Consumo_Usual"].ToString();
                            break;
                        }
                    }
                }

                return string.Join("<SPLITER>", valores);
            }
            catch (Exception ex) { return "Error<SPLITER>" + ex.Message; }
        }

        // ============================================
        // CARGAR HISTORIAL DE ANÁLISIS BIOQUÍMICOS
        // ============================================
        [WebMethod(EnableSession = true)]
        public static string CargarAnalisisBioquimico(List<string> obj_Parametros_JS)
        {
            if (!cls_Sesion_PL_Helper.EsSesionValida())
                return cls_Sesion_PL_Helper.SinSesion();

            try
            {
                cls_AnalisisBioquimico_DAL obj_AB_DAL = new cls_AnalisisBioquimico_DAL();
                cls_AnalisisBioquimico_BLL obj_AB_BLL = new cls_AnalisisBioquimico_BLL();

                obj_AB_DAL.iId_Usuario = Convert.ToInt32(obj_Parametros_JS[0]);
                obj_AB_BLL.Obtiene_Analisis_Bioquimicos(ref obj_AB_DAL);

                if (obj_AB_DAL.dtDatos == null || obj_AB_DAL.dtDatos.Rows.Count == 0)
                    return "SIN_DATOS";

                string html = "";
                foreach (DataRow row in obj_AB_DAL.dtDatos.Rows)
                {
                    string fecha = Convert.ToDateTime(row["Fecha_Analisis"]).ToString("dd/MM/yyyy");
                    html += "<tr>" +
                        "<td>" + fecha + "</td>" +
                        "<td>" + (row["Hemoglobina"] != DBNull.Value ? row["Hemoglobina"].ToString() : "-") + "</td>" +
                        "<td>" + (row["Colesterol_Total"] != DBNull.Value ? row["Colesterol_Total"].ToString() : "-") + "</td>" +
                        "<td>" + (row["Glicemia"] != DBNull.Value ? row["Glicemia"].ToString() : "-") + "</td>" +
                        "<td>" + (row["Trigliceridos"] != DBNull.Value ? row["Trigliceridos"].ToString() : "-") + "</td>" +
                        "<td>" + (row["Acido_Urico"] != DBNull.Value ? row["Acido_Urico"].ToString() : "-") + "</td>" +
                        "<td>" + (row["Observaciones"] != DBNull.Value ? row["Observaciones"].ToString() : "-") + "</td>" +
                        "</tr>";
                }
                return html;
            }
            catch (Exception ex) { return "Error<SPLITER>" + ex.Message; }
        }

        // ============================================
        // GUARDAR HISTORIA CLÍNICA
        // ============================================
        [WebMethod(EnableSession = true)]
        public static string GuardarHistoriaClinica(List<string> obj_Parametros_JS)
        {
            if (!cls_Sesion_PL_Helper.EsSesionValida())
                return cls_Sesion_PL_Helper.SinSesion();

            try
            {
                int idUsuario = Convert.ToInt32(obj_Parametros_JS[0]);
                int idUsuarioGlobal = Convert.ToInt32(obj_Parametros_JS[17]);

                cls_HistoriaClinica_DAL obj_HC_DAL = new cls_HistoriaClinica_DAL();
                cls_HistoriaClinica_BLL obj_HC_BLL = new cls_HistoriaClinica_BLL();

                obj_HC_DAL.iId_Usuario = idUsuario;
                obj_HC_BLL.Obtiene_Informacion_HistoriaClinica(ref obj_HC_DAL);
                bool existe = obj_HC_DAL.dtDatos != null && obj_HC_DAL.dtDatos.Rows.Count > 0;

                obj_HC_DAL.iId_Usuario             = idUsuario;
                obj_HC_DAL.sObjetivos_Clinicos     = obj_Parametros_JS[1];
                obj_HC_DAL.sCalidad_Sueno          = obj_Parametros_JS[2];
                obj_HC_DAL.sFuncion_Intestinal     = obj_Parametros_JS[3];
                obj_HC_DAL.bFuma                   = obj_Parametros_JS[4] == "1";
                obj_HC_DAL.bConsume_Alcohol        = obj_Parametros_JS[5] == "1";
                obj_HC_DAL.sFrecuencia_Alcohol     = obj_Parametros_JS[6];
                obj_HC_DAL.sActividad_Fisica       = obj_Parametros_JS[7];
                obj_HC_DAL.sMedicamentos           = obj_Parametros_JS[8];
                obj_HC_DAL.sCirugias_Recientes     = obj_Parametros_JS[9];
                obj_HC_DAL.bEmbarazo               = obj_Parametros_JS[10] == "1";
                obj_HC_DAL.bLactancia              = obj_Parametros_JS[11] == "1";
                obj_HC_DAL.sAlimentos_Favoritos    = obj_Parametros_JS[12];
                obj_HC_DAL.sAlimentos_No_Gustan    = obj_Parametros_JS[13];
                obj_HC_DAL.sIntolerancias          = obj_Parametros_JS[14];
                obj_HC_DAL.sAlergias_Alimentarias  = obj_Parametros_JS[15];
                obj_HC_DAL.sIngesta_Agua_Diaria    = obj_Parametros_JS[16];
                obj_HC_DAL.iIdUsuario_Modificacion = idUsuarioGlobal;

                if (existe)
                    obj_HC_BLL.modificarHistoriaClinica(ref obj_HC_DAL);
                else
                    obj_HC_BLL.insertarHistoriaClinica(ref obj_HC_DAL);

                if (!string.IsNullOrEmpty(obj_HC_DAL.sMsjErrorBD))
                    return "0<SPLITER>" + obj_HC_DAL.sMsjErrorBD;

                return "1<SPLITER>Historia clinica guardada exitosamente";
            }
            catch (Exception ex) { return "0<SPLITER>" + ex.Message; }
        }

        // ============================================
        // GUARDAR EVALUACIÓN CUANTITATIVA
        // ============================================
        [WebMethod(EnableSession = true)]
        public static string GuardarEvaluacionCuantitativa(List<string> obj_Parametros_JS)
        {
            if (!cls_Sesion_PL_Helper.EsSesionValida())
                return cls_Sesion_PL_Helper.SinSesion();

            try
            {
                int idUsuario = Convert.ToInt32(obj_Parametros_JS[0]);
                string[] tiempos = { "Desayuno", "Merienda AM", "Almuerzo", "Merienda PM", "Cena" };
                cls_EvaluacionCuantitativa_BLL obj_EC_BLL = new cls_EvaluacionCuantitativa_BLL();

                for (int i = 0; i < tiempos.Length; i++)
                {
                    string consumo = obj_Parametros_JS[i + 1];
                    if (string.IsNullOrWhiteSpace(consumo)) continue;

                    cls_EvaluacionCuantitativa_DAL obj_EC_DAL = new cls_EvaluacionCuantitativa_DAL();
                    obj_EC_DAL.iId_Usuario    = idUsuario;
                    obj_EC_DAL.sTiempo_Comida = tiempos[i];
                    obj_EC_DAL.sConsumo_Usual = consumo;

                    obj_EC_BLL.guardarEvaluacionCuantitativa(ref obj_EC_DAL);

                    if (!string.IsNullOrEmpty(obj_EC_DAL.sMsjErrorBD))
                        return "0<SPLITER>Error en " + tiempos[i] + ": " + obj_EC_DAL.sMsjErrorBD;
                }

                return "1<SPLITER>Evaluacion cuantitativa guardada exitosamente";
            }
            catch (Exception ex) { return "0<SPLITER>" + ex.Message; }
        }

        // ============================================
        // GUARDAR ANÁLISIS BIOQUÍMICO
        // ============================================
        [WebMethod(EnableSession = true)]
        public static string GuardarAnalisisBioquimico(List<string> obj_Parametros_JS)
        {
            if (!cls_Sesion_PL_Helper.EsSesionValida())
                return cls_Sesion_PL_Helper.SinSesion();

            try
            {
                int idUsuario = Convert.ToInt32(obj_Parametros_JS[0]);
                int idUsuarioGlobal = Convert.ToInt32(obj_Parametros_JS[19]);

                cls_AnalisisBioquimico_DAL obj_AB_DAL = new cls_AnalisisBioquimico_DAL();
                cls_AnalisisBioquimico_BLL obj_AB_BLL = new cls_AnalisisBioquimico_BLL();

                obj_AB_DAL.iId_Usuario       = idUsuario;
                obj_AB_DAL.dtFecha_Analisis  = Convert.ToDateTime(obj_Parametros_JS[1]);
                obj_AB_DAL.dHemoglobina      = string.IsNullOrEmpty(obj_Parametros_JS[2])  ? (decimal?)null : Convert.ToDecimal(obj_Parametros_JS[2]);
                obj_AB_DAL.dHematocrito      = string.IsNullOrEmpty(obj_Parametros_JS[3])  ? (decimal?)null : Convert.ToDecimal(obj_Parametros_JS[3]);
                obj_AB_DAL.dColesterol_Total = string.IsNullOrEmpty(obj_Parametros_JS[4])  ? (decimal?)null : Convert.ToDecimal(obj_Parametros_JS[4]);
                obj_AB_DAL.dHDL              = string.IsNullOrEmpty(obj_Parametros_JS[5])  ? (decimal?)null : Convert.ToDecimal(obj_Parametros_JS[5]);
                obj_AB_DAL.dLDL              = string.IsNullOrEmpty(obj_Parametros_JS[6])  ? (decimal?)null : Convert.ToDecimal(obj_Parametros_JS[6]);
                obj_AB_DAL.dTrigliceridos    = string.IsNullOrEmpty(obj_Parametros_JS[7])  ? (decimal?)null : Convert.ToDecimal(obj_Parametros_JS[7]);
                obj_AB_DAL.dGlicemia         = string.IsNullOrEmpty(obj_Parametros_JS[8])  ? (decimal?)null : Convert.ToDecimal(obj_Parametros_JS[8]);
                obj_AB_DAL.dAcido_Urico      = string.IsNullOrEmpty(obj_Parametros_JS[9])  ? (decimal?)null : Convert.ToDecimal(obj_Parametros_JS[9]);
                obj_AB_DAL.dAlbumina         = string.IsNullOrEmpty(obj_Parametros_JS[10]) ? (decimal?)null : Convert.ToDecimal(obj_Parametros_JS[10]);
                obj_AB_DAL.dNitrogeno_Ureico = string.IsNullOrEmpty(obj_Parametros_JS[11]) ? (decimal?)null : Convert.ToDecimal(obj_Parametros_JS[11]);
                obj_AB_DAL.dCreatinina       = string.IsNullOrEmpty(obj_Parametros_JS[12]) ? (decimal?)null : Convert.ToDecimal(obj_Parametros_JS[12]);
                obj_AB_DAL.dTSH              = string.IsNullOrEmpty(obj_Parametros_JS[13]) ? (decimal?)null : Convert.ToDecimal(obj_Parametros_JS[13]);
                obj_AB_DAL.dT4               = string.IsNullOrEmpty(obj_Parametros_JS[14]) ? (decimal?)null : Convert.ToDecimal(obj_Parametros_JS[14]);
                obj_AB_DAL.dT3               = string.IsNullOrEmpty(obj_Parametros_JS[15]) ? (decimal?)null : Convert.ToDecimal(obj_Parametros_JS[15]);
                obj_AB_DAL.dVitamina_D       = string.IsNullOrEmpty(obj_Parametros_JS[16]) ? (decimal?)null : Convert.ToDecimal(obj_Parametros_JS[16]);
                obj_AB_DAL.dVitamina_B12     = string.IsNullOrEmpty(obj_Parametros_JS[17]) ? (decimal?)null : Convert.ToDecimal(obj_Parametros_JS[17]);
                obj_AB_DAL.sObservaciones    = obj_Parametros_JS[18];
                obj_AB_DAL.iIdUsuario_Registro = idUsuarioGlobal;

                obj_AB_BLL.insertarAnalisisBioquimico(ref obj_AB_DAL);

                if (!string.IsNullOrEmpty(obj_AB_DAL.sMsjErrorBD))
                    return "0<SPLITER>" + obj_AB_DAL.sMsjErrorBD;

                return "1<SPLITER>Analisis bioquimico registrado exitosamente";
            }
            catch (Exception ex) { return "0<SPLITER>" + ex.Message; }
        }
    }
}
