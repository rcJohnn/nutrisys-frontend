using System;
using System.Collections.Generic;
using System.Data;
using System.Globalization;
using System.Web.Services;
using DAL_CRUD_CONSULTAS.Mantenimientos;
using BLL_CRUD_CONSULTAS.Mantenimientos;
using PL_CRUD_CONSULTAS.Helpers;

namespace PL_CRUD_CONSULTAS.Mantenimientos
{
    public partial class frmCompletarMetricas : System.Web.UI.Page
    {
        protected void Page_Load(object sender, EventArgs e)
        {
        }

        [WebMethod(EnableSession = true)]
        public static string CargaInfoConsulta(List<string> obj_Parametros_JS)
        {
            if (!cls_Sesion_PL_Helper.EsSesionValida())
                return cls_Sesion_PL_Helper.SinSesion();

            try
            {
                string _mensaje = string.Empty;

                cls_Consultas_DAL obj_Consultas_DAL = new cls_Consultas_DAL();
                cls_Consultas_BLL obj_Consultas_BLL = new cls_Consultas_BLL();

                obj_Consultas_DAL.iId_Consulta = Convert.ToInt32(obj_Parametros_JS[0]);

                obj_Consultas_BLL.Obtiene_Informacion_Consultas(ref obj_Consultas_DAL);

                if (obj_Consultas_DAL.dtDatos != null && obj_Consultas_DAL.dtDatos.Rows.Count > 0)
                {
                    DataRow row = obj_Consultas_DAL.dtDatos.Rows[0];

                    // SP USP_Informacion_Consultas devuelve:
                    // [0]  Id_Consulta
                    // [1]  Id_Usuario
                    // [2]  NombreUsuario
                    // [3]  Cedula
                    // [4]  CorreoUsuario
                    // [5]  Id_Medico
                    // [6]  NombreMedico
                    // [7]  CorreoMedico
                    // [8]  Fecha_Cita
                    // [9]  Duracion_Minutos
                    // [10] Estado
                    // [11] Motivo
                    // [12] Peso_kg
                    // [13] Estatura_cm
                    // [14] IMC
                    // [15] Grasa_g
                    // [16] Musculo_g
                    // [17] Circunferencia_Cintura_cm
                    // [18] Circunferencia_Cadera_cm
                    // [19] Presion_Arterial_Sistolica
                    // [20] Presion_Arterial_Diastolica
                    // [21] Observaciones_Medico
                    // [22] Recomendaciones
                    // [23] Proxima_Cita
                    // [24] Google_Event_Id
                    // [25] Email_Confirmacion_Enviado
                    // [26] Fecha_Registro
                    // [27] Grasa_Porcentaje       (nuevo)
                    // [28] Circunferencia_Muneca_cm (nuevo)
                    // [29] Agua_Corporal_Pct       (nuevo)
                    // [30] Edad_Metabolica         (nuevo)
                    // [31] Masa_Osea_g             (nuevo)
                    // [32] Grasa_Visceral          (nuevo)

                    DateTime fechaCita = Convert.ToDateTime(row[8]);
                    string fechaHoraFormato = fechaCita.ToString("dd/MM/yyyy HH:mm");
                    string nombrePaciente = row[2].ToString();
                    string motivo = row[11].ToString();

                    // Métricas base
                    string peso = row[12] != DBNull.Value ? row[12].ToString() : "";
                    string estatura = row[13] != DBNull.Value ? row[13].ToString() : "";
                    string imc = row[14] != DBNull.Value ? row[14].ToString() : "";
                    string grasaG = row[15] != DBNull.Value ? row[15].ToString() : "";
                    string musculoG = row[16] != DBNull.Value ? row[16].ToString() : "";
                    string cintura = row[17] != DBNull.Value ? row[17].ToString() : "";
                    string cadera = row[18] != DBNull.Value ? row[18].ToString() : "";
                    string sistolica = row[19] != DBNull.Value ? row[19].ToString() : "";
                    string diastolica = row[20] != DBNull.Value ? row[20].ToString() : "";
                    string observaciones = row[21] != DBNull.Value ? row[21].ToString() : "";
                    string recomendaciones = row[22] != DBNull.Value ? row[22].ToString() : "";
                    string proximaCita = row[23] != DBNull.Value
                        ? Convert.ToDateTime(row[23]).ToString("yyyy-MM-ddTHH:mm") : "";

                    // Métricas nuevas
                    string grasaPct = row[27] != DBNull.Value ? row[27].ToString() : "";
                    string muneca = row[28] != DBNull.Value ? row[28].ToString() : "";
                    string aguaPct = row[29] != DBNull.Value ? row[29].ToString() : "";
                    string edadMetabolica = row[30] != DBNull.Value ? row[30].ToString() : "";
                    string masaOsea = row[31] != DBNull.Value ? row[31].ToString() : "";
                    string grasaVisceral = row[32] != DBNull.Value ? row[32].ToString() : "";

                    // [0]  NombrePaciente
                    // [1]  FechaHora
                    // [2]  Motivo
                    // [3]  Peso
                    // [4]  Estatura
                    // [5]  IMC
                    // [6]  GrasaG
                    // [7]  MusculoG
                    // [8]  Cintura
                    // [9]  Cadera
                    // [10] Sistolica
                    // [11] Diastolica
                    // [12] Observaciones
                    // [13] Recomendaciones
                    // [14] ProximaCita
                    // [15] GrasaPct       (nuevo)
                    // [16] Muneca         (nuevo)
                    // [17] AguaPct        (nuevo)
                    // [18] EdadMetabolica (nuevo)
                    // [19] MasaOsea       (nuevo)
                    // [20] GrasaVisceral  (nuevo)
                    _mensaje = nombrePaciente + "<SPLITER>" +
                               fechaHoraFormato + "<SPLITER>" +
                               motivo + "<SPLITER>" +
                               peso + "<SPLITER>" +
                               estatura + "<SPLITER>" +
                               imc + "<SPLITER>" +
                               grasaG + "<SPLITER>" +
                               musculoG + "<SPLITER>" +
                               cintura + "<SPLITER>" +
                               cadera + "<SPLITER>" +
                               sistolica + "<SPLITER>" +
                               diastolica + "<SPLITER>" +
                               observaciones + "<SPLITER>" +
                               recomendaciones + "<SPLITER>" +
                               proximaCita + "<SPLITER>" +
                               grasaPct + "<SPLITER>" +
                               muneca + "<SPLITER>" +
                               aguaPct + "<SPLITER>" +
                               edadMetabolica + "<SPLITER>" +
                               masaOsea + "<SPLITER>" +
                               grasaVisceral;
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
        public static string CompletarMetricas(List<string> obj_Parametros_JS)
        {
            if (!cls_Sesion_PL_Helper.EsSesionValida())
                return cls_Sesion_PL_Helper.SinSesion();

            try
            {
                // [0]  IdConsulta
                // [1]  Peso_kg
                // [2]  Estatura_cm
                // [3]  GrasaG
                // [4]  GrasaPct
                // [5]  MusculoG
                // [6]  Cintura
                // [7]  Cadera
                // [8]  Muneca
                // [9]  Sistolica
                // [10] Diastolica
                // [11] AguaPct
                // [12] EdadMetabolica
                // [13] MasaOsea
                // [14] GrasaVisceral
                // [15] Observaciones
                // [16] Recomendaciones
                // [17] ProximaCita
                // [18] IdUsuarioGlobal

                cls_Consultas_DAL obj_Consultas_DAL = new cls_Consultas_DAL();
                cls_Consultas_BLL obj_Consultas_BLL = new cls_Consultas_BLL();

                obj_Consultas_DAL.iId_Consulta = Convert.ToInt32(obj_Parametros_JS[0]);
                obj_Consultas_DAL.dPeso_kg = Convert.ToDecimal(obj_Parametros_JS[1]);
                obj_Consultas_DAL.dEstatura_cm = Convert.ToDecimal(obj_Parametros_JS[2]);

                if (!string.IsNullOrEmpty(obj_Parametros_JS[3]))
                    obj_Consultas_DAL.dGrasa_g = Convert.ToDecimal(obj_Parametros_JS[3]);
                if (!string.IsNullOrEmpty(obj_Parametros_JS[4]))
                    obj_Consultas_DAL.dGrasa_Porcentaje = Convert.ToDecimal(obj_Parametros_JS[4]);
                if (!string.IsNullOrEmpty(obj_Parametros_JS[5]))
                    obj_Consultas_DAL.dMusculo_g = Convert.ToDecimal(obj_Parametros_JS[5]);
                if (!string.IsNullOrEmpty(obj_Parametros_JS[6]))
                    obj_Consultas_DAL.dCircunferencia_Cintura_cm = Convert.ToDecimal(obj_Parametros_JS[6]);
                if (!string.IsNullOrEmpty(obj_Parametros_JS[7]))
                    obj_Consultas_DAL.dCircunferencia_Cadera_cm = Convert.ToDecimal(obj_Parametros_JS[7]);
                if (!string.IsNullOrEmpty(obj_Parametros_JS[8]))
                    obj_Consultas_DAL.dCircunferencia_Muneca_cm = Convert.ToDecimal(obj_Parametros_JS[8]);
                if (!string.IsNullOrEmpty(obj_Parametros_JS[9]))
                    obj_Consultas_DAL.iPresion_Arterial_Sistolica = Convert.ToInt32(obj_Parametros_JS[9]);
                if (!string.IsNullOrEmpty(obj_Parametros_JS[10]))
                    obj_Consultas_DAL.iPresion_Arterial_Diastolica = Convert.ToInt32(obj_Parametros_JS[10]);
                if (!string.IsNullOrEmpty(obj_Parametros_JS[11]))
                    obj_Consultas_DAL.dAgua_Corporal_Pct = Convert.ToDecimal(obj_Parametros_JS[11]);
                if (!string.IsNullOrEmpty(obj_Parametros_JS[12]))
                    obj_Consultas_DAL.iEdad_Metabolica = Convert.ToInt32(obj_Parametros_JS[12]);
                if (!string.IsNullOrEmpty(obj_Parametros_JS[13]))
                    obj_Consultas_DAL.dMasa_Osea_g = Convert.ToDecimal(obj_Parametros_JS[13]);
                if (!string.IsNullOrEmpty(obj_Parametros_JS[14]))
                    obj_Consultas_DAL.iGrasa_Visceral = Convert.ToInt32(obj_Parametros_JS[14]);

                obj_Consultas_DAL.sObservaciones_Medico = obj_Parametros_JS[15];
                obj_Consultas_DAL.sRecomendaciones = obj_Parametros_JS[16];

                if (!string.IsNullOrEmpty(obj_Parametros_JS[17]))
                    obj_Consultas_DAL.dtProxima_Cita = DateTime.Parse(
                        obj_Parametros_JS[17], CultureInfo.InvariantCulture);

                obj_Consultas_DAL.iIdUsuarioGlobal = Convert.ToInt32(obj_Parametros_JS[18]);

                obj_Consultas_BLL.completarMetricas(ref obj_Consultas_DAL);

                string resultado = obj_Consultas_DAL.sValorScalar;

                return (resultado == "0" || string.IsNullOrEmpty(resultado))
                    ? "0<SPLITER>Error al completar las métricas"
                    : resultado + "<SPLITER>Métricas guardadas correctamente.";
            }
            catch (Exception ex)
            {
                return "0<SPLITER>" + ex.Message;
            }
        }

        [WebMethod(EnableSession = true)]
        public static string GuardarPliegue(List<string> obj_Parametros_JS)
        {
            if (!cls_Sesion_PL_Helper.EsSesionValida())
                return cls_Sesion_PL_Helper.SinSesion();

            try
            {
                // [0] IdConsulta  [1] TipoPliegue  [2] Valor_mm
                cls_PlieguesCutaneos_DAL obj_DAL = new cls_PlieguesCutaneos_DAL();
                cls_PlieguesCutaneos_BLL obj_BLL = new cls_PlieguesCutaneos_BLL();

                obj_DAL.iId_Consulta = Convert.ToInt32(obj_Parametros_JS[0]);
                obj_DAL.sTipo_Pliegue = obj_Parametros_JS[1];
                obj_DAL.dValor_mm = Convert.ToDecimal(obj_Parametros_JS[2]);

                obj_BLL.GuardarPliegue(ref obj_DAL);

                return (obj_DAL.sValorScalar == "0" || string.IsNullOrEmpty(obj_DAL.sValorScalar))
                    ? "0<SPLITER>Error al guardar el pliegue"
                    : obj_DAL.sValorScalar + "<SPLITER>Pliegue guardado correctamente.";
            }
            catch (Exception ex) { return "0<SPLITER>" + ex.Message; }
        }

        [WebMethod(EnableSession = true)]
        public static string ObtenerPliegues(List<string> obj_Parametros_JS)
        {
            if (!cls_Sesion_PL_Helper.EsSesionValida())
                return cls_Sesion_PL_Helper.SinSesion();

            try
            {
                // [0] IdConsulta
                cls_PlieguesCutaneos_DAL obj_DAL = new cls_PlieguesCutaneos_DAL();
                cls_PlieguesCutaneos_BLL obj_BLL = new cls_PlieguesCutaneos_BLL();

                obj_DAL.iId_Consulta = Convert.ToInt32(obj_Parametros_JS[0]);
                obj_BLL.ObtenerPliegues(ref obj_DAL);

                if (obj_DAL.dtDatos == null || obj_DAL.dtDatos.Rows.Count == 0)
                    return "[]";

                var sb = new System.Text.StringBuilder("[");
                for (int i = 0; i < obj_DAL.dtDatos.Rows.Count; i++)
                {
                    DataRow r = obj_DAL.dtDatos.Rows[i];
                    if (i > 0) sb.Append(",");
                    sb.Append("{");
                    sb.Append("\"IdPliegue\":" + r["Id_Pliegue"] + ",");
                    sb.Append("\"Tipo\":\"" + r["Tipo_Pliegue"] + "\",");
                    sb.Append("\"Valor\":" + r["Valor_mm"].ToString().Replace(",", "."));
                    sb.Append("}");
                }
                sb.Append("]");
                return sb.ToString();
            }
            catch (Exception ex) { return "[]"; }
        }

        [WebMethod(EnableSession = true)]
        public static string EliminarPliegue(List<string> obj_Parametros_JS)
        {
            if (!cls_Sesion_PL_Helper.EsSesionValida())
                return cls_Sesion_PL_Helper.SinSesion();

            try
            {
                // [0] IdPliegue
                cls_PlieguesCutaneos_DAL obj_DAL = new cls_PlieguesCutaneos_DAL();
                cls_PlieguesCutaneos_BLL obj_BLL = new cls_PlieguesCutaneos_BLL();

                obj_DAL.iId_Pliegue = Convert.ToInt32(obj_Parametros_JS[0]);
                obj_BLL.EliminarPliegue(ref obj_DAL);

                return (obj_DAL.sValorScalar == "0" || string.IsNullOrEmpty(obj_DAL.sValorScalar))
                    ? "0<SPLITER>Error al eliminar el pliegue"
                    : obj_DAL.sValorScalar + "<SPLITER>Pliegue eliminado correctamente.";
            }
            catch (Exception ex) { return "0<SPLITER>" + ex.Message; }
        }

        [WebMethod(EnableSession = true)]
        public static string GuardarHistoriaClinica(List<string> obj_Parametros_JS)
        {
            if (!cls_Sesion_PL_Helper.EsSesionValida())
                return cls_Sesion_PL_Helper.SinSesion();

            try
            {
                int idConsulta = Convert.ToInt32(obj_Parametros_JS[0]);
                int idUsuarioGlobal = Convert.ToInt32(obj_Parametros_JS[17]);

                cls_Consultas_DAL obj_Consultas_DAL = new cls_Consultas_DAL();
                cls_Consultas_BLL obj_Consultas_BLL = new cls_Consultas_BLL();
                obj_Consultas_DAL.iId_Consulta = idConsulta;
                obj_Consultas_BLL.Obtiene_Informacion_Consultas(ref obj_Consultas_DAL);

                if (obj_Consultas_DAL.dtDatos == null || obj_Consultas_DAL.dtDatos.Rows.Count == 0)
                    return "0<SPLITER>No se pudo obtener la información de la consulta";

                int idUsuario = Convert.ToInt32(obj_Consultas_DAL.dtDatos.Rows[0][1]);

                cls_HistoriaClinica_DAL obj_Historia_DAL = new cls_HistoriaClinica_DAL();
                cls_HistoriaClinica_BLL obj_Historia_BLL = new cls_HistoriaClinica_BLL();
                obj_Historia_DAL.iId_Usuario = idUsuario;
                obj_Historia_BLL.Obtiene_Informacion_HistoriaClinica(ref obj_Historia_DAL);
                bool existe = obj_Historia_DAL.dtDatos != null && obj_Historia_DAL.dtDatos.Rows.Count > 0;

                obj_Historia_DAL.iId_Usuario = idUsuario;
                obj_Historia_DAL.sObjetivos_Clinicos = obj_Parametros_JS[1];
                obj_Historia_DAL.sCalidad_Sueno = obj_Parametros_JS[2];
                obj_Historia_DAL.sFuncion_Intestinal = obj_Parametros_JS[3];
                obj_Historia_DAL.bFuma = obj_Parametros_JS[4] == "1";
                obj_Historia_DAL.bConsume_Alcohol = obj_Parametros_JS[5] == "1";
                obj_Historia_DAL.sFrecuencia_Alcohol = obj_Parametros_JS[6];
                obj_Historia_DAL.sActividad_Fisica = obj_Parametros_JS[7];
                obj_Historia_DAL.sMedicamentos = obj_Parametros_JS[8];
                obj_Historia_DAL.sCirugias_Recientes = obj_Parametros_JS[9];
                obj_Historia_DAL.bEmbarazo = obj_Parametros_JS[10] == "1";
                obj_Historia_DAL.bLactancia = obj_Parametros_JS[11] == "1";
                obj_Historia_DAL.sAlimentos_Favoritos = obj_Parametros_JS[12];
                obj_Historia_DAL.sAlimentos_No_Gustan = obj_Parametros_JS[13];
                obj_Historia_DAL.sIntolerancias = obj_Parametros_JS[14];
                obj_Historia_DAL.sAlergias_Alimentarias = obj_Parametros_JS[15];
                obj_Historia_DAL.sIngesta_Agua_Diaria = obj_Parametros_JS[16];
                obj_Historia_DAL.iIdUsuario_Modificacion = idUsuarioGlobal;

                if (existe)
                    obj_Historia_BLL.modificarHistoriaClinica(ref obj_Historia_DAL);
                else
                    obj_Historia_BLL.insertarHistoriaClinica(ref obj_Historia_DAL);

                if (!string.IsNullOrEmpty(obj_Historia_DAL.sMsjErrorBD))
                    return "0<SPLITER>" + obj_Historia_DAL.sMsjErrorBD;

                return "1<SPLITER>Historia clínica guardada exitosamente";
            }
            catch (Exception ex) { return "0<SPLITER>" + ex.Message; }
        }

        [WebMethod(EnableSession = true)]
        public static string GuardarEvaluacionCuantitativa(List<string> obj_Parametros_JS)
        {
            if (!cls_Sesion_PL_Helper.EsSesionValida())
                return cls_Sesion_PL_Helper.SinSesion();

            try
            {
                int idConsulta = Convert.ToInt32(obj_Parametros_JS[0]);
                int idUsuarioGlobal = Convert.ToInt32(obj_Parametros_JS[6]);

                cls_Consultas_DAL obj_Consultas_DAL = new cls_Consultas_DAL();
                cls_Consultas_BLL obj_Consultas_BLL = new cls_Consultas_BLL();
                obj_Consultas_DAL.iId_Consulta = idConsulta;
                obj_Consultas_BLL.Obtiene_Informacion_Consultas(ref obj_Consultas_DAL);

                if (obj_Consultas_DAL.dtDatos == null || obj_Consultas_DAL.dtDatos.Rows.Count == 0)
                    return "0<SPLITER>No se pudo obtener la información de la consulta";

                int idUsuario = Convert.ToInt32(obj_Consultas_DAL.dtDatos.Rows[0][1]);

                string[] tiempos = { "Desayuno", "Merienda AM", "Almuerzo", "Merienda PM", "Cena" };
                cls_EvaluacionCuantitativa_BLL obj_Eval_BLL = new cls_EvaluacionCuantitativa_BLL();

                for (int i = 0; i < tiempos.Length; i++)
                {
                    string consumo = obj_Parametros_JS[i + 1];
                    if (string.IsNullOrWhiteSpace(consumo)) continue;

                    cls_EvaluacionCuantitativa_DAL obj_Eval_DAL = new cls_EvaluacionCuantitativa_DAL();
                    obj_Eval_DAL.iId_Usuario = idUsuario;
                    obj_Eval_DAL.sTiempo_Comida = tiempos[i];
                    obj_Eval_DAL.sConsumo_Usual = consumo;

                    obj_Eval_BLL.guardarEvaluacionCuantitativa(ref obj_Eval_DAL);

                    if (!string.IsNullOrEmpty(obj_Eval_DAL.sMsjErrorBD))
                        return "0<SPLITER>Error al guardar " + tiempos[i] + ": " + obj_Eval_DAL.sMsjErrorBD;
                }

                return "1<SPLITER>Evaluación cuantitativa guardada exitosamente";
            }
            catch (Exception ex) { return "0<SPLITER>" + ex.Message; }
        }

        [WebMethod(EnableSession = true)]
        public static string GuardarAnalisisBioquimico(List<string> obj_Parametros_JS)
        {
            if (!cls_Sesion_PL_Helper.EsSesionValida())
                return cls_Sesion_PL_Helper.SinSesion();

            try
            {
                int idConsulta = Convert.ToInt32(obj_Parametros_JS[0]);
                int idUsuarioGlobal = Convert.ToInt32(obj_Parametros_JS[19]);

                cls_Consultas_DAL obj_Consultas_DAL = new cls_Consultas_DAL();
                cls_Consultas_BLL obj_Consultas_BLL = new cls_Consultas_BLL();
                obj_Consultas_DAL.iId_Consulta = idConsulta;
                obj_Consultas_BLL.Obtiene_Informacion_Consultas(ref obj_Consultas_DAL);

                if (obj_Consultas_DAL.dtDatos == null || obj_Consultas_DAL.dtDatos.Rows.Count == 0)
                    return "0<SPLITER>No se pudo obtener la información de la consulta";

                int idUsuario = Convert.ToInt32(obj_Consultas_DAL.dtDatos.Rows[0][1]);

                cls_AnalisisBioquimico_DAL obj_Analisis_DAL = new cls_AnalisisBioquimico_DAL();
                cls_AnalisisBioquimico_BLL obj_Analisis_BLL = new cls_AnalisisBioquimico_BLL();

                obj_Analisis_DAL.iId_Usuario = idUsuario;
                obj_Analisis_DAL.dtFecha_Analisis = Convert.ToDateTime(obj_Parametros_JS[1]);
                obj_Analisis_DAL.dHemoglobina = string.IsNullOrEmpty(obj_Parametros_JS[2]) ? (decimal?)null : Convert.ToDecimal(obj_Parametros_JS[2]);
                obj_Analisis_DAL.dHematocrito = string.IsNullOrEmpty(obj_Parametros_JS[3]) ? (decimal?)null : Convert.ToDecimal(obj_Parametros_JS[3]);
                obj_Analisis_DAL.dColesterol_Total = string.IsNullOrEmpty(obj_Parametros_JS[4]) ? (decimal?)null : Convert.ToDecimal(obj_Parametros_JS[4]);
                obj_Analisis_DAL.dHDL = string.IsNullOrEmpty(obj_Parametros_JS[5]) ? (decimal?)null : Convert.ToDecimal(obj_Parametros_JS[5]);
                obj_Analisis_DAL.dLDL = string.IsNullOrEmpty(obj_Parametros_JS[6]) ? (decimal?)null : Convert.ToDecimal(obj_Parametros_JS[6]);
                obj_Analisis_DAL.dTrigliceridos = string.IsNullOrEmpty(obj_Parametros_JS[7]) ? (decimal?)null : Convert.ToDecimal(obj_Parametros_JS[7]);
                obj_Analisis_DAL.dGlicemia = string.IsNullOrEmpty(obj_Parametros_JS[8]) ? (decimal?)null : Convert.ToDecimal(obj_Parametros_JS[8]);
                obj_Analisis_DAL.dAcido_Urico = string.IsNullOrEmpty(obj_Parametros_JS[9]) ? (decimal?)null : Convert.ToDecimal(obj_Parametros_JS[9]);
                obj_Analisis_DAL.dAlbumina = string.IsNullOrEmpty(obj_Parametros_JS[10]) ? (decimal?)null : Convert.ToDecimal(obj_Parametros_JS[10]);
                obj_Analisis_DAL.dNitrogeno_Ureico = string.IsNullOrEmpty(obj_Parametros_JS[11]) ? (decimal?)null : Convert.ToDecimal(obj_Parametros_JS[11]);
                obj_Analisis_DAL.dCreatinina = string.IsNullOrEmpty(obj_Parametros_JS[12]) ? (decimal?)null : Convert.ToDecimal(obj_Parametros_JS[12]);
                obj_Analisis_DAL.dTSH = string.IsNullOrEmpty(obj_Parametros_JS[13]) ? (decimal?)null : Convert.ToDecimal(obj_Parametros_JS[13]);
                obj_Analisis_DAL.dT4 = string.IsNullOrEmpty(obj_Parametros_JS[14]) ? (decimal?)null : Convert.ToDecimal(obj_Parametros_JS[14]);
                obj_Analisis_DAL.dT3 = string.IsNullOrEmpty(obj_Parametros_JS[15]) ? (decimal?)null : Convert.ToDecimal(obj_Parametros_JS[15]);
                obj_Analisis_DAL.dVitamina_D = string.IsNullOrEmpty(obj_Parametros_JS[16]) ? (decimal?)null : Convert.ToDecimal(obj_Parametros_JS[16]);
                obj_Analisis_DAL.dVitamina_B12 = string.IsNullOrEmpty(obj_Parametros_JS[17]) ? (decimal?)null : Convert.ToDecimal(obj_Parametros_JS[17]);
                obj_Analisis_DAL.sObservaciones = obj_Parametros_JS[18];
                obj_Analisis_DAL.iIdUsuario_Registro = idUsuarioGlobal;

                obj_Analisis_BLL.insertarAnalisisBioquimico(ref obj_Analisis_DAL);

                if (!string.IsNullOrEmpty(obj_Analisis_DAL.sMsjErrorBD))
                    return "0<SPLITER>" + obj_Analisis_DAL.sMsjErrorBD;

                return "1<SPLITER>Análisis bioquímico guardado exitosamente";
            }
            catch (Exception ex) { return "0<SPLITER>" + ex.Message; }
        }

        [WebMethod(EnableSession = true)]
        public static string CompletarConsultaFinal(List<string> obj_Parametros_JS)
        {
            if (!cls_Sesion_PL_Helper.EsSesionValida())
                return cls_Sesion_PL_Helper.SinSesion();

            try
            {
                cls_Consultas_DAL obj_Consultas_DAL = new cls_Consultas_DAL();
                cls_Consultas_BLL obj_Consultas_BLL = new cls_Consultas_BLL();

                obj_Consultas_DAL.iId_Consulta = Convert.ToInt32(obj_Parametros_JS[0]);
                obj_Consultas_DAL.iIdUsuarioGlobal = Convert.ToInt32(obj_Parametros_JS[1]);

                obj_Consultas_BLL.completarConsultaFinal(ref obj_Consultas_DAL);

                string resultado = obj_Consultas_DAL.sValorScalar;

                return (resultado == "0" || string.IsNullOrEmpty(resultado))
                    ? "0<SPLITER>Error al completar la consulta"
                    : resultado + "<SPLITER>Consulta finalizada exitosamente";
            }
            catch (Exception ex) { return "0<SPLITER>" + ex.Message; }
        }

        [WebMethod(EnableSession = true)]
        public static string CargaHistoriaClinica(List<string> obj_Parametros_JS)
        {
            if (!cls_Sesion_PL_Helper.EsSesionValida())
                return cls_Sesion_PL_Helper.SinSesion();

            try
            {
                int idConsulta = Convert.ToInt32(obj_Parametros_JS[0]);

                cls_Consultas_DAL obj_Consultas_DAL = new cls_Consultas_DAL();
                cls_Consultas_BLL obj_Consultas_BLL = new cls_Consultas_BLL();
                obj_Consultas_DAL.iId_Consulta = idConsulta;
                obj_Consultas_BLL.Obtiene_Informacion_Consultas(ref obj_Consultas_DAL);

                if (obj_Consultas_DAL.dtDatos == null || obj_Consultas_DAL.dtDatos.Rows.Count == 0)
                    return "vacio";

                int idUsuario = Convert.ToInt32(obj_Consultas_DAL.dtDatos.Rows[0][1]);

                cls_HistoriaClinica_DAL obj_Historia_DAL = new cls_HistoriaClinica_DAL();
                cls_HistoriaClinica_BLL obj_Historia_BLL = new cls_HistoriaClinica_BLL();
                obj_Historia_DAL.iId_Usuario = idUsuario;
                obj_Historia_BLL.Obtiene_Informacion_HistoriaClinica(ref obj_Historia_DAL);

                if (obj_Historia_DAL.dtDatos == null || obj_Historia_DAL.dtDatos.Rows.Count == 0)
                    return "vacio";

                DataRow row = obj_Historia_DAL.dtDatos.Rows[0];

                string fuma = (row["Fuma"] != DBNull.Value && Convert.ToBoolean(row["Fuma"])) ? "1" : "0";
                string alcohol = (row["Consume_Alcohol"] != DBNull.Value && Convert.ToBoolean(row["Consume_Alcohol"])) ? "1" : "0";
                string embarazo = (row["Embarazo"] != DBNull.Value && Convert.ToBoolean(row["Embarazo"])) ? "1" : "0";
                string lactancia = (row["Lactancia"] != DBNull.Value && Convert.ToBoolean(row["Lactancia"])) ? "1" : "0";

                // [0]Objetivos [1]CalidadSueno [2]FuncionIntestinal [3]Fuma [4]Alcohol
                // [5]FrecAlcohol [6]ActFisica [7]Medicamentos [8]Cirugias [9]Embarazo [10]Lactancia
                // [11]AlimFavoritos [12]AlimNoGustan [13]Intolerancias [14]Alergias [15]IngestaAgua
                return (row["Objetivos_Clinicos"] != DBNull.Value ? row["Objetivos_Clinicos"].ToString() : "") + "<SPLITER>" +
                       (row["Calidad_Sueno"] != DBNull.Value ? row["Calidad_Sueno"].ToString() : "") + "<SPLITER>" +
                       (row["Funcion_Intestinal"] != DBNull.Value ? row["Funcion_Intestinal"].ToString() : "") + "<SPLITER>" +
                       fuma + "<SPLITER>" +
                       alcohol + "<SPLITER>" +
                       (row["Frecuencia_Alcohol"] != DBNull.Value ? row["Frecuencia_Alcohol"].ToString() : "") + "<SPLITER>" +
                       (row["Actividad_Fisica"] != DBNull.Value ? row["Actividad_Fisica"].ToString() : "") + "<SPLITER>" +
                       (row["Medicamentos"] != DBNull.Value ? row["Medicamentos"].ToString() : "") + "<SPLITER>" +
                       (row["Cirugias_Recientes"] != DBNull.Value ? row["Cirugias_Recientes"].ToString() : "") + "<SPLITER>" +
                       embarazo + "<SPLITER>" +
                       lactancia + "<SPLITER>" +
                       (row["Alimentos_Favoritos"] != DBNull.Value ? row["Alimentos_Favoritos"].ToString() : "") + "<SPLITER>" +
                       (row["Alimentos_No_Gustan"] != DBNull.Value ? row["Alimentos_No_Gustan"].ToString() : "") + "<SPLITER>" +
                       (row["Intolerancias"] != DBNull.Value ? row["Intolerancias"].ToString() : "") + "<SPLITER>" +
                       (row["Alergias_Alimentarias"] != DBNull.Value ? row["Alergias_Alimentarias"].ToString() : "") + "<SPLITER>" +
                       (row["Ingesta_Agua_Diaria"] != DBNull.Value ? row["Ingesta_Agua_Diaria"].ToString() : "");
            }
            catch (Exception) { return "vacio"; }
        }

        [WebMethod(EnableSession = true)]
        public static string CargaEvaluacionCuantitativa(List<string> obj_Parametros_JS)
        {
            if (!cls_Sesion_PL_Helper.EsSesionValida())
                return cls_Sesion_PL_Helper.SinSesion();

            try
            {
                int idConsulta = Convert.ToInt32(obj_Parametros_JS[0]);

                cls_Consultas_DAL obj_Consultas_DAL = new cls_Consultas_DAL();
                cls_Consultas_BLL obj_Consultas_BLL = new cls_Consultas_BLL();
                obj_Consultas_DAL.iId_Consulta = idConsulta;
                obj_Consultas_BLL.Obtiene_Informacion_Consultas(ref obj_Consultas_DAL);

                if (obj_Consultas_DAL.dtDatos == null || obj_Consultas_DAL.dtDatos.Rows.Count == 0)
                    return "vacio";

                int idUsuario = Convert.ToInt32(obj_Consultas_DAL.dtDatos.Rows[0][1]);

                cls_EvaluacionCuantitativa_DAL obj_Eval_DAL = new cls_EvaluacionCuantitativa_DAL();
                cls_EvaluacionCuantitativa_BLL obj_Eval_BLL = new cls_EvaluacionCuantitativa_BLL();
                obj_Eval_DAL.iId_Usuario = idUsuario;
                obj_Eval_BLL.Obtiene_Evaluacion_Cuantitativa(ref obj_Eval_DAL);

                if (obj_Eval_DAL.dtDatos == null || obj_Eval_DAL.dtDatos.Rows.Count == 0)
                    return "vacio";

                string[] tiempos = { "Desayuno", "Merienda AM", "Almuerzo", "Merienda PM", "Cena" };
                string[] valores = new string[5];

                for (int i = 0; i < tiempos.Length; i++)
                {
                    valores[i] = "";
                    DataRow[] rows = obj_Eval_DAL.dtDatos.Select("Tiempo_Comida = '" + tiempos[i] + "'");
                    if (rows.Length > 0)
                        valores[i] = rows[0]["Consumo_Usual"] != DBNull.Value ? rows[0]["Consumo_Usual"].ToString() : "";
                }

                // [0]Desayuno [1]MeriendaAM [2]Almuerzo [3]MeriendaPM [4]Cena
                return string.Join("<SPLITER>", valores);
            }
            catch (Exception) { return "vacio"; }
        }

        [WebMethod(EnableSession = true)]
        public static string CargaAnalisisBioquimico(List<string> obj_Parametros_JS)
        {
            if (!cls_Sesion_PL_Helper.EsSesionValida())
                return cls_Sesion_PL_Helper.SinSesion();

            try
            {
                int idConsulta = Convert.ToInt32(obj_Parametros_JS[0]);

                cls_Consultas_DAL obj_Consultas_DAL = new cls_Consultas_DAL();
                cls_Consultas_BLL obj_Consultas_BLL = new cls_Consultas_BLL();
                obj_Consultas_DAL.iId_Consulta = idConsulta;
                obj_Consultas_BLL.Obtiene_Informacion_Consultas(ref obj_Consultas_DAL);

                if (obj_Consultas_DAL.dtDatos == null || obj_Consultas_DAL.dtDatos.Rows.Count == 0)
                    return "vacio";

                int idUsuario = Convert.ToInt32(obj_Consultas_DAL.dtDatos.Rows[0][1]);

                cls_AnalisisBioquimico_DAL obj_Analisis_DAL = new cls_AnalisisBioquimico_DAL();
                cls_AnalisisBioquimico_BLL obj_Analisis_BLL = new cls_AnalisisBioquimico_BLL();
                obj_Analisis_DAL.iId_Usuario = idUsuario;
                obj_Analisis_BLL.Obtiene_Analisis_Bioquimicos(ref obj_Analisis_DAL);

                if (obj_Analisis_DAL.dtDatos == null || obj_Analisis_DAL.dtDatos.Rows.Count == 0)
                    return "vacio";

                DataRow row = obj_Analisis_DAL.dtDatos.Rows[0];

                string val(string col) => row[col] != DBNull.Value ? row[col].ToString() : "";

                // [0]Fecha [1]Hemoglobina [2]Hematocrito [3]ColesterolTotal [4]HDL [5]LDL
                // [6]Trigliceridos [7]Glicemia [8]AcidoUrico [9]Albumina [10]Creatinina
                // [11]TSH [12]T4 [13]T3 [14]VitaminaD [15]VitaminaB12 [16]Observaciones
                string fecha = row["Fecha_Analisis"] != DBNull.Value
                    ? Convert.ToDateTime(row["Fecha_Analisis"]).ToString("yyyy-MM-dd") : "";

                return fecha + "<SPLITER>" +
                       val("Hemoglobina") + "<SPLITER>" +
                       val("Hematocrito") + "<SPLITER>" +
                       val("Colesterol_Total") + "<SPLITER>" +
                       val("HDL") + "<SPLITER>" +
                       val("LDL") + "<SPLITER>" +
                       val("Trigliceridos") + "<SPLITER>" +
                       val("Glicemia") + "<SPLITER>" +
                       val("Acido_Urico") + "<SPLITER>" +
                       val("Albumina") + "<SPLITER>" +
                       val("Creatinina") + "<SPLITER>" +
                       val("TSH") + "<SPLITER>" +
                       val("T4") + "<SPLITER>" +
                       val("T3") + "<SPLITER>" +
                       val("Vitamina_D") + "<SPLITER>" +
                       val("Vitamina_B12") + "<SPLITER>" +
                       val("Observaciones");
            }
            catch (Exception) { return "vacio"; }
        }

        [WebMethod(EnableSession = true)]
        public static string ObtenerDatosPacienteParaCalculadora(List<string> obj_Parametros_JS)
        {
            if (!cls_Sesion_PL_Helper.EsSesionValida())
                return cls_Sesion_PL_Helper.SinSesion();

            try
            {
                int idConsulta = Convert.ToInt32(obj_Parametros_JS[0]);

                cls_Consultas_DAL obj_Consultas_DAL = new cls_Consultas_DAL();
                cls_Consultas_BLL obj_Consultas_BLL = new cls_Consultas_BLL();
                obj_Consultas_DAL.iId_Consulta = idConsulta;
                obj_Consultas_BLL.Obtiene_Informacion_Consultas(ref obj_Consultas_DAL);

                if (obj_Consultas_DAL.dtDatos != null && obj_Consultas_DAL.dtDatos.Rows.Count > 0)
                {
                    DataRow row = obj_Consultas_DAL.dtDatos.Rows[0];
                    int idUsuario = Convert.ToInt32(row[1]);

                    cls_Usuarios_DAL obj_Usuarios_DAL = new cls_Usuarios_DAL();
                    cls_Usuarios_BLL obj_Usuarios_BLL = new cls_Usuarios_BLL();
                    obj_Usuarios_DAL.iId_Usuario = idUsuario;
                    obj_Usuarios_BLL.Obtiene_Informacion_Usuarios(ref obj_Usuarios_DAL);

                    if (obj_Usuarios_DAL.dtDatos != null && obj_Usuarios_DAL.dtDatos.Rows.Count > 0)
                    {
                        DataRow usuarioRow = obj_Usuarios_DAL.dtDatos.Rows[0];
                        string fechaNacimiento = Convert.ToDateTime(usuarioRow[5]).ToString("yyyy-MM-dd");
                        string sexo     = usuarioRow[6].ToString();
                        string sIdMedico = row[5].ToString();   // Id_Medico de la consulta
                        return fechaNacimiento + "<SPLITER>" + sexo + "<SPLITER>" + idUsuario.ToString() + "<SPLITER>" + sIdMedico;
                    }
                }

                return "Error<SPLITER>No se encontraron datos del paciente";
            }
            catch (Exception ex) { return "Error<SPLITER>" + ex.Message; }
        }

        [WebMethod(EnableSession = true)]
        public static string CmCargaListaPadecimientos(List<string> obj_Parametros_JS)
        {
            if (!cls_Sesion_PL_Helper.EsSesionValida())
                return cls_Sesion_PL_Helper.SinSesion();

            try
            {
                cls_Padecimientos_Usuario_DAL obj_DAL = new cls_Padecimientos_Usuario_DAL();
                cls_Padecimientos_Usuario_BLL obj_BLL = new cls_Padecimientos_Usuario_BLL();

                obj_BLL.ListarPadecimientos(ref obj_DAL);

                string opciones = string.Empty;
                if (obj_DAL.dtDatos != null && obj_DAL.dtDatos.Rows.Count > 0)
                {
                    foreach (DataRow row in obj_DAL.dtDatos.Rows)
                        opciones += "<option value='" + row[0] + "'>" + System.Web.HttpUtility.HtmlEncode(row[1].ToString()) + "</option>";
                }
                return opciones;
            }
            catch (Exception ex) { return "Error: " + ex.Message; }
        }

        [WebMethod(EnableSession = true)]
        public static string CmCargaPadecimientosUsuario(List<string> obj_Parametros_JS)
        {
            if (!cls_Sesion_PL_Helper.EsSesionValida())
                return cls_Sesion_PL_Helper.SinSesion();

            try
            {
                int idConsulta = Convert.ToInt32(obj_Parametros_JS[0]);

                cls_Consultas_DAL obj_Consultas_DAL = new cls_Consultas_DAL();
                cls_Consultas_BLL obj_Consultas_BLL = new cls_Consultas_BLL();
                obj_Consultas_DAL.iId_Consulta = idConsulta;
                obj_Consultas_BLL.Obtiene_Informacion_Consultas(ref obj_Consultas_DAL);

                if (obj_Consultas_DAL.dtDatos == null || obj_Consultas_DAL.dtDatos.Rows.Count == 0)
                    return "Error: No se encontró la consulta";

                int idUsuario = Convert.ToInt32(obj_Consultas_DAL.dtDatos.Rows[0][1]);

                cls_Padecimientos_Usuario_DAL obj_DAL = new cls_Padecimientos_Usuario_DAL();
                cls_Padecimientos_Usuario_BLL obj_BLL = new cls_Padecimientos_Usuario_BLL();
                obj_DAL.iId_Usuario = idUsuario;
                obj_BLL.ListarPadecimientosUsuario(ref obj_DAL);

                if (obj_DAL.dtDatos == null || obj_DAL.dtDatos.Rows.Count == 0)
                    return "vacio";

                DataRow[] asignados = obj_DAL.dtDatos.Select("Asignado = 'S'");
                if (asignados.Length == 0)
                    return "vacio";

                string html = "<thead><tr>" +
                              "<th>ID</th><th>Padecimiento</th>" +
                              "<th style='text-align:center'>Eliminar</th>" +
                              "</tr></thead><tbody>";

                foreach (DataRow row in asignados)
                {
                    html += "<tr>" +
                            "<td>" + row[0] + "</td>" +
                            "<td>" + System.Web.HttpUtility.HtmlEncode(row[1].ToString()) + "</td>" +
                            "<td style='text-align:center'>" +
                            "<i class='fa fa-trash-o' style='cursor:pointer;color:red;' " +
                            "onclick='cmEliminarPadecimiento(" + row[0] + ")'></i>" +
                            "</td></tr>";
                }

                return html + "</tbody>";
            }
            catch (Exception ex) { return "Error: " + ex.Message; }
        }

        [WebMethod(EnableSession = true)]
        public static string CmAsignarPadecimiento(List<string> obj_Parametros_JS)
        {
            if (!cls_Sesion_PL_Helper.EsSesionValida())
                return cls_Sesion_PL_Helper.SinSesion();

            try
            {
                // [0] idConsulta  [1] idPadecimiento  [2] idUsuarioGlobal
                int idConsulta = Convert.ToInt32(obj_Parametros_JS[0]);

                cls_Consultas_DAL obj_Consultas_DAL = new cls_Consultas_DAL();
                cls_Consultas_BLL obj_Consultas_BLL = new cls_Consultas_BLL();
                obj_Consultas_DAL.iId_Consulta = idConsulta;
                obj_Consultas_BLL.Obtiene_Informacion_Consultas(ref obj_Consultas_DAL);

                if (obj_Consultas_DAL.dtDatos == null || obj_Consultas_DAL.dtDatos.Rows.Count == 0)
                    return "0<SPLITER>No se encontró la consulta";

                int idUsuario = Convert.ToInt32(obj_Consultas_DAL.dtDatos.Rows[0][1]);

                cls_Padecimientos_Usuario_DAL obj_DAL = new cls_Padecimientos_Usuario_DAL();
                cls_Padecimientos_Usuario_BLL obj_BLL = new cls_Padecimientos_Usuario_BLL();
                obj_DAL.iId_Usuario = idUsuario;
                obj_DAL.iId_Padecimiento = Convert.ToInt32(obj_Parametros_JS[1]);
                obj_DAL.iIdUsuarioGlobal = Convert.ToInt32(obj_Parametros_JS[2]);
                obj_BLL.AsignarPadecimiento(ref obj_DAL);

                if (obj_DAL.sValorScalar == "-1")
                    return "-1<SPLITER>Este padecimiento ya está asignado al paciente.";
                if (obj_DAL.sValorScalar == "0")
                    return "0<SPLITER>Error al asignar el padecimiento.";

                return obj_DAL.sValorScalar + "<SPLITER>Padecimiento asignado correctamente.";
            }
            catch (Exception ex) { return "0<SPLITER>" + ex.Message; }
        }

        [WebMethod(EnableSession = true)]
        public static string GuardarDistribucionMacros(List<string> obj_Parametros_JS)
        {
            if (!cls_Sesion_PL_Helper.EsSesionValida())
                return cls_Sesion_PL_Helper.SinSesion();

            try
            {
                // [0]  IdConsulta
                // [1]  IdUsuario
                // [2]  IdMedico
                // [3]  FormulaUsada  ("HarrisBenedict" | "FAO_OMS")
                // [4]  REE
                // [5]  CHO_g   [6]  Prot_g   [7]  Grasa_g   [8]  Fibra_g
                // [9]  Desayuno_CHO  [10] Desayuno_Prot  [11] Desayuno_Grasa  [12] Desayuno_Fibra
                // [13] MeriendaAM_CHO [14] MeriendaAM_Prot [15] MeriendaAM_Grasa [16] MeriendaAM_Fibra
                // [17] Almuerzo_CHO  [18] Almuerzo_Prot  [19] Almuerzo_Grasa  [20] Almuerzo_Fibra
                // [21] MeriendaPM_CHO [22] MeriendaPM_Prot [23] MeriendaPM_Grasa [24] MeriendaPM_Fibra
                // [25] Cena_CHO      [26] Cena_Prot      [27] Cena_Grasa      [28] Cena_Fibra

                decimal Dec(int i) => string.IsNullOrEmpty(obj_Parametros_JS[i])
                    ? 0m
                    : Convert.ToDecimal(obj_Parametros_JS[i], CultureInfo.InvariantCulture);

                // 1. Guardar en BD
                cls_DistribucionMacros_DAL obj_Dist_DAL = new cls_DistribucionMacros_DAL();
                cls_DistribucionMacros_BLL obj_Dist_BLL = new cls_DistribucionMacros_BLL();

                obj_Dist_DAL.iId_Consulta        = Convert.ToInt32(obj_Parametros_JS[0]);
                obj_Dist_DAL.iId_Usuario         = Convert.ToInt32(obj_Parametros_JS[1]);
                obj_Dist_DAL.iId_Medico          = Convert.ToInt32(obj_Parametros_JS[2]);
                obj_Dist_DAL.sFormula_Usada      = obj_Parametros_JS[3];
                obj_Dist_DAL.dREE                = Dec(4);
                obj_Dist_DAL.dCHO_g              = Dec(5);
                obj_Dist_DAL.dProt_g             = Dec(6);
                obj_Dist_DAL.dGrasa_g            = Dec(7);
                obj_Dist_DAL.dFibra_g            = Dec(8);
                obj_Dist_DAL.dDesayuno_CHO_g     = Dec(9);
                obj_Dist_DAL.dDesayuno_Prot_g    = Dec(10);
                obj_Dist_DAL.dDesayuno_Grasa_g   = Dec(11);
                obj_Dist_DAL.dDesayuno_Fibra_g   = Dec(12);
                obj_Dist_DAL.dMeriendaAM_CHO_g   = Dec(13);
                obj_Dist_DAL.dMeriendaAM_Prot_g  = Dec(14);
                obj_Dist_DAL.dMeriendaAM_Grasa_g = Dec(15);
                obj_Dist_DAL.dMeriendaAM_Fibra_g = Dec(16);
                obj_Dist_DAL.dAlmuerzo_CHO_g     = Dec(17);
                obj_Dist_DAL.dAlmuerzo_Prot_g    = Dec(18);
                obj_Dist_DAL.dAlmuerzo_Grasa_g   = Dec(19);
                obj_Dist_DAL.dAlmuerzo_Fibra_g   = Dec(20);
                obj_Dist_DAL.dMeriendaPM_CHO_g   = Dec(21);
                obj_Dist_DAL.dMeriendaPM_Prot_g  = Dec(22);
                obj_Dist_DAL.dMeriendaPM_Grasa_g = Dec(23);
                obj_Dist_DAL.dMeriendaPM_Fibra_g = Dec(24);
                obj_Dist_DAL.dCena_CHO_g         = Dec(25);
                obj_Dist_DAL.dCena_Prot_g        = Dec(26);
                obj_Dist_DAL.dCena_Grasa_g       = Dec(27);
                obj_Dist_DAL.dCena_Fibra_g       = Dec(28);

                obj_Dist_BLL.GuardarDistribucionMacros(ref obj_Dist_DAL);

                if (obj_Dist_DAL.sValorScalar != "1")
                {
                    string sDetalle = !string.IsNullOrEmpty(obj_Dist_DAL.sMSJError)
                        ? obj_Dist_DAL.sMSJError
                        : "sValorScalar=" + (obj_Dist_DAL.sValorScalar ?? "null");
                    return "0<SPLITER>Error BD: " + sDetalle;
                }

                // 2. Obtener datos del médico para el correo
                int idMedico = obj_Dist_DAL.iId_Medico;
                cls_Medicos_DAL obj_Med_DAL = new cls_Medicos_DAL();
                cls_Medicos_BLL obj_Med_BLL = new cls_Medicos_BLL();
                obj_Med_DAL.iId_Medico = idMedico;
                obj_Med_BLL.Obtiene_Informacion_Medicos(ref obj_Med_DAL);

                string logoClinica       = "";
                string nombreClinica    = "";
                string direccionClinica = "";
                string nombreMedico     = "";
                string nombrePaciente = "";
                string fechaConsulta = "";

                if (obj_Med_DAL.dtDatos != null && obj_Med_DAL.dtDatos.Rows.Count > 0)
                {
                    DataRow rm = obj_Med_DAL.dtDatos.Rows[0];
                    nombreMedico = (rm["Nombre"].ToString() + " " +
                                   rm["Prim_Apellido"].ToString() + " " +
                                   rm["Seg_Apellido"].ToString()).Trim();
                }

                // Obtener nombre/correo del paciente y datos de clínica desde la consulta
                cls_Consultas_DAL obj_Con_DAL = new cls_Consultas_DAL();
                cls_Consultas_BLL obj_Con_BLL = new cls_Consultas_BLL();
                obj_Con_DAL.iId_Consulta = obj_Dist_DAL.iId_Consulta;
                obj_Con_BLL.Obtiene_Informacion_Consultas(ref obj_Con_DAL);

                if (obj_Con_DAL.dtDatos != null && obj_Con_DAL.dtDatos.Rows.Count > 0)
                {
                    DataRow rc = obj_Con_DAL.dtDatos.Rows[0];
                    nombrePaciente = rc[2].ToString();   // NombreUsuario

                    // Fecha de la consulta
                    for (int c = 0; c < obj_Con_DAL.dtDatos.Columns.Count; c++)
                    {
                        string col = obj_Con_DAL.dtDatos.Columns[c].ColumnName.ToLower();
                        if (col.Contains("fecha") && rc[c] != DBNull.Value)
                        {
                            fechaConsulta = Convert.ToDateTime(rc[c]).ToString("dd/MM/yyyy");
                            break;
                        }
                    }

                    // Logo y nombre de la clínica de la consulta
                    for (int c = 0; c < obj_Con_DAL.dtDatos.Columns.Count; c++)
                    {
                        string col = obj_Con_DAL.dtDatos.Columns[c].ColumnName.ToLower();
                        if ((col.Contains("id_clinica") || col.Contains("idclinica")) && rc[c] != DBNull.Value)
                        {
                            int idClinicaCon = Convert.ToInt32(rc[c]);
                            if (idClinicaCon > 0)
                            {
                                cls_Clinicas_DAL cl_DAL = new cls_Clinicas_DAL();
                                cls_Clinicas_BLL cl_BLL = new cls_Clinicas_BLL();
                                cl_DAL.iId_Clinica = idClinicaCon;
                                cl_BLL.obtenerInfoClinica(ref cl_DAL);
                                if (cl_DAL.dtDatos != null && cl_DAL.dtDatos.Rows.Count > 0)
                                {
                                    DataRow cr = cl_DAL.dtDatos.Rows[0];
                                    nombreClinica    = ColStr(cr, "Nombre");
                                    direccionClinica = ColStr(cr, "Direccion");
                                    logoClinica      = ColStr(cr, "Logo_Url");
                                }
                            }
                            break;
                        }
                    }
                }

                if (string.IsNullOrEmpty(fechaConsulta))
                    fechaConsulta = DateTime.Now.ToString("dd/MM/yyyy");

                // Correo del paciente (columna "correo" o "correousuario" en el resultado)
                string emailPaciente = "";
                if (obj_Con_DAL.dtDatos != null && obj_Con_DAL.dtDatos.Rows.Count > 0)
                {
                    DataRow rc2 = obj_Con_DAL.dtDatos.Rows[0];
                    for (int c = 0; c < obj_Con_DAL.dtDatos.Columns.Count; c++)
                    {
                        string col = obj_Con_DAL.dtDatos.Columns[c].ColumnName.ToLower();
                        if (col.Contains("correo") && rc2[c] != DBNull.Value && !string.IsNullOrEmpty(rc2[c].ToString()))
                        {
                            emailPaciente = rc2[c].ToString();
                            break;
                        }
                    }
                }

                // 3. Obtener Historia Clínica si existe
                string hcJson = "";
                try {
                    cls_HistoriaClinica_DAL obj_HC_DAL = new cls_HistoriaClinica_DAL();
                    cls_HistoriaClinica_BLL obj_HC_BLL = new cls_HistoriaClinica_BLL();
                    obj_HC_DAL.iId_Usuario = obj_Dist_DAL.iId_Usuario;
                    obj_HC_BLL.Obtiene_Informacion_HistoriaClinica(ref obj_HC_DAL);
                    if (obj_HC_DAL.dtDatos != null && obj_HC_DAL.dtDatos.Rows.Count > 0) {
                        DataRow rHC = obj_HC_DAL.dtDatos.Rows[0];
                        hcJson = "{" +
                            "\"objetivosClinicos\":\"" + Esc(rHC["Objetivos_Clinicos"]?.ToString()) + "\"," +
                            "\"calidadSueno\":\"" + Esc(rHC["Calidad_Sueno"]?.ToString()) + "\"," +
                            "\"funcionIntestinal\":\"" + Esc(rHC["Funcion_Intestinal"]?.ToString()) + "\"," +
                            "\"fuma\":\"" + (rHC["Fuma"]?.ToString() == "True" ? "Sí" : "No") + "\"," +
                            "\"consumeAlcohol\":\"" + (rHC["Consume_Alcohol"]?.ToString() == "True" ? "Sí" : "No") + "\"," +
                            "\"actividadFisica\":\"" + Esc(rHC["Actividad_Fisica"]?.ToString()) + "\"," +
                            "\"medicamentos\":\"" + Esc(rHC["Medicamentos"]?.ToString()) + "\"," +
                            "\"alergiasAlimentarias\":\"" + Esc(rHC["Alergias_Alimentarias"]?.ToString()) + "\"," +
                            "\"intolerancias\":\"" + Esc(rHC["Intolerancias"]?.ToString()) + "\"," +
                            "\"ingestaAgua\":\"" + Esc(rHC["Ingesta_Agua_Diaria"]?.ToString()) + "\"" +
                            "}";
                    }
                } catch { hcJson = ""; }

                // 4. Obtener Análisis Bioquímicos más reciente si existe
                string abJson = "";
                try {
                    cls_AnalisisBioquimico_DAL obj_AB_DAL = new cls_AnalisisBioquimico_DAL();
                    cls_AnalisisBioquimico_BLL obj_AB_BLL = new cls_AnalisisBioquimico_BLL();
                    obj_AB_DAL.iId_Usuario = obj_Dist_DAL.iId_Usuario;
                    obj_AB_BLL.Obtiene_Analisis_Bioquimicos(ref obj_AB_DAL);
                    if (obj_AB_DAL.dtDatos != null && obj_AB_DAL.dtDatos.Rows.Count > 0) {
                        DataRow rAB = obj_AB_DAL.dtDatos.Rows[0];
                        // Función para convertir valores nulos a null de JSON
                        string Jv(object val) {
                            if (val == null || val == DBNull.Value) return "null";
                            return val.ToString().Replace(",", ".");
                        }
                        abJson = "{" +
                            "\"fechaAnalisis\":\"" + Esc(Convert.ToDateTime(rAB["Fecha_Analisis"]).ToString("dd/MM/yyyy")) + "\"," +
                            "\"hemoglobina\":" + Jv(rAB["Hemoglobina"]) + "," +
                            "\"hematocrito\":" + Jv(rAB["Hematocrito"]) + "," +
                            "\"colesterolTotal\":" + Jv(rAB["Colesterol_Total"]) + "," +
                            "\"hdl\":" + Jv(rAB["HDL"]) + "," +
                            "\"ldl\":" + Jv(rAB["LDL"]) + "," +
                            "\"trigliceridos\":" + Jv(rAB["Trigliceridos"]) + "," +
                            "\"glicemia\":" + Jv(rAB["Glicemia"]) + "," +
                            "\"acidoUrico\":" + Jv(rAB["Acido_Urico"]) + "," +
                            "\"observaciones\":\"" + Esc(rAB["Observaciones"]?.ToString() ?? "") + "\"" +
                            "}";
                    }
                } catch { abJson = ""; }

                // 5. Devolver JSON con datos para generación de PDF en el cliente
                string Esc(string s) => (s ?? "").Replace("\\", "\\\\").Replace("\"", "\\\"");
                string ColStr(DataRow row, string col) =>
                    row.Table.Columns.Contains(col) && row[col] != DBNull.Value ? row[col].ToString() : "";
                string json = "{" +
                    "\"nombrePaciente\":\"" + Esc(nombrePaciente) + "\"," +
                    "\"nombreMedico\":\"" + Esc(nombreMedico) + "\"," +
                    "\"nombreClinica\":\"" + Esc(nombreClinica) + "\"," +
                    "\"direccionClinica\":\"" + Esc(direccionClinica) + "\"," +
                    "\"logoClinica\":\"" + Esc(logoClinica) + "\"," +
                    "\"fechaConsulta\":\"" + Esc(fechaConsulta) + "\"," +
                    "\"emailPaciente\":\"" + Esc(emailPaciente) + "\"," +
                    "\"historiaClinica\":" + (string.IsNullOrEmpty(hcJson) ? "null" : hcJson) + "," +
                    "\"analisisBioquimico\":" + (string.IsNullOrEmpty(abJson) ? "null" : abJson) +
                    "}";

                return "1<SPLITER>" + json;
            }
            catch (Exception ex) { return "0<SPLITER>" + ex.Message; }
        }

        [WebMethod(EnableSession = true)]
        public static string EnviarPDFPorCorreo(List<string> obj_Parametros_JS)
        {
            if (!cls_Sesion_PL_Helper.EsSesionValida())
                return cls_Sesion_PL_Helper.SinSesion();
            try
            {
                // [0]=idConsulta [1]=base64PDF [2]=nombrePaciente [3]=nombreMedico [4]=fechaConsulta [5]=emailPaciente
                string emailPaciente  = obj_Parametros_JS[5];
                string nombrePaciente = obj_Parametros_JS[2];
                string nombreMedico   = obj_Parametros_JS[3];
                string fechaConsulta  = obj_Parametros_JS[4];
                byte[] pdfBytes       = Convert.FromBase64String(obj_Parametros_JS[1]);

                if (string.IsNullOrEmpty(emailPaciente))
                    return "0<SPLITER>El paciente no tiene correo registrado.";

                bool ok = cls_Email_Helper.EnviarPDFNutricional(
                    emailPaciente, nombrePaciente, nombreMedico, pdfBytes, fechaConsulta);

                return ok
                    ? "1<SPLITER>Plan enviado correctamente al correo del paciente."
                    : "0<SPLITER>No se pudo enviar el correo.";
            }
            catch (Exception ex) { return "0<SPLITER>" + ex.Message; }
        }

        [WebMethod(EnableSession = true)]
        public static string CmEliminarPadecimiento(List<string> obj_Parametros_JS)
        {
            if (!cls_Sesion_PL_Helper.EsSesionValida())
                return cls_Sesion_PL_Helper.SinSesion();

            try
            {
                // [0] idConsulta  [1] idPadecimiento  [2] idUsuarioGlobal
                int idConsulta = Convert.ToInt32(obj_Parametros_JS[0]);

                cls_Consultas_DAL obj_Consultas_DAL = new cls_Consultas_DAL();
                cls_Consultas_BLL obj_Consultas_BLL = new cls_Consultas_BLL();
                obj_Consultas_DAL.iId_Consulta = idConsulta;
                obj_Consultas_BLL.Obtiene_Informacion_Consultas(ref obj_Consultas_DAL);

                if (obj_Consultas_DAL.dtDatos == null || obj_Consultas_DAL.dtDatos.Rows.Count == 0)
                    return "0<SPLITER>No se encontró la consulta";

                int idUsuario = Convert.ToInt32(obj_Consultas_DAL.dtDatos.Rows[0][1]);

                cls_Padecimientos_Usuario_DAL obj_DAL = new cls_Padecimientos_Usuario_DAL();
                cls_Padecimientos_Usuario_BLL obj_BLL = new cls_Padecimientos_Usuario_BLL();
                obj_DAL.iId_Usuario = idUsuario;
                obj_DAL.iId_Padecimiento = Convert.ToInt32(obj_Parametros_JS[1]);
                obj_DAL.iIdUsuarioGlobal = Convert.ToInt32(obj_Parametros_JS[2]);
                obj_BLL.EliminarPadecimiento(ref obj_DAL);

                return (obj_DAL.sValorScalar == "0" || string.IsNullOrEmpty(obj_DAL.sValorScalar))
                    ? "0<SPLITER>Error al eliminar el padecimiento."
                    : obj_DAL.sValorScalar + "<SPLITER>Padecimiento eliminado correctamente.";
            }
            catch (Exception ex) { return "0<SPLITER>" + ex.Message; }
        }

        [WebMethod(EnableSession = true)]
        public static string CalcularGuardarAntropometria(List<string> obj_Parametros_JS)
        {
            if (!cls_Sesion_PL_Helper.EsSesionValida())
                return cls_Sesion_PL_Helper.SinSesion();

            try
            {
                // [0] IdConsulta
                // [1] Circunferencia_Brazo_cm
                // [2] Circunferencia_Pantorrilla_cm
                // [3] Altura_Rodilla_cm
                // [4] Raza ('B'=Blanca | 'N'=Negra)

                cls_Antropometria_DAL obj_DAL = new cls_Antropometria_DAL();
                cls_Antropometria_BLL obj_BLL = new cls_Antropometria_BLL();

                obj_DAL.iId_Consulta                  = Convert.ToInt32(obj_Parametros_JS[0]);
                obj_DAL.dCircunferencia_Brazo_cm       = Convert.ToDecimal(obj_Parametros_JS[1], CultureInfo.InvariantCulture);
                obj_DAL.dCircunferencia_Pantorrilla_cm = Convert.ToDecimal(obj_Parametros_JS[2], CultureInfo.InvariantCulture);
                obj_DAL.dAltura_Rodilla_cm             = Convert.ToDecimal(obj_Parametros_JS[3], CultureInfo.InvariantCulture);
                obj_DAL.sRaza                          = obj_Parametros_JS[4];

                obj_BLL.CalcularGuardarAntropometria(ref obj_DAL);

                if (!string.IsNullOrEmpty(obj_DAL.sMSJError))
                    return "0<SPLITER>" + obj_DAL.sMSJError;

                // Retorna los valores calculados para que el JS los muestre de inmediato
                // [0] Status  [1] ATB  [2] CMB  [3] AMB  [4] AGB
                // [5] PesoEst [6] TallaEst  [7] Edad  [8] PCT_usado
                return "1"
                    + "<SPLITER>" + obj_DAL.dAntrop_ATB.ToString("F2", CultureInfo.InvariantCulture)
                    + "<SPLITER>" + obj_DAL.dAntrop_CMB.ToString("F2", CultureInfo.InvariantCulture)
                    + "<SPLITER>" + obj_DAL.dAntrop_AMB.ToString("F2", CultureInfo.InvariantCulture)
                    + "<SPLITER>" + obj_DAL.dAntrop_AGB.ToString("F2", CultureInfo.InvariantCulture)
                    + "<SPLITER>" + obj_DAL.dPeso_Estimado_kg.ToString("F2", CultureInfo.InvariantCulture)
                    + "<SPLITER>" + obj_DAL.dTalla_Estimada_cm.ToString("F2", CultureInfo.InvariantCulture)
                    + "<SPLITER>" + obj_DAL.iEdad_Calculada
                    + "<SPLITER>" + obj_DAL.dPCT_cm_Usado.ToString("F3", CultureInfo.InvariantCulture);
            }
            catch (Exception ex) { return "0<SPLITER>" + ex.Message; }
        }

        [WebMethod(EnableSession = true)]
        public static string ObtenerAntropometria(List<string> obj_Parametros_JS)
        {
            if (!cls_Sesion_PL_Helper.EsSesionValida())
                return cls_Sesion_PL_Helper.SinSesion();

            try
            {
                // [0] IdConsulta
                cls_Antropometria_DAL obj_DAL = new cls_Antropometria_DAL();
                cls_Antropometria_BLL obj_BLL = new cls_Antropometria_BLL();

                obj_DAL.iId_Consulta = Convert.ToInt32(obj_Parametros_JS[0]);
                obj_BLL.ObtenerAntropometria(ref obj_DAL);

                if (obj_DAL.dtDatos == null || obj_DAL.dtDatos.Rows.Count == 0)
                    return "vacio";

                DataRow r = obj_DAL.dtDatos.Rows[0];

                // Si Circunferencia_Brazo_cm es NULL, no hay datos antropométricos aún
                if (r["Circunferencia_Brazo_cm"] == DBNull.Value)
                    return "vacio";

                string F(string col) => r[col] != DBNull.Value
                    ? Convert.ToDecimal(r[col]).ToString("F2", CultureInfo.InvariantCulture)
                    : "0";

                // [0] PB  [1] Pantorrilla  [2] AR
                // [3] ATB [4] CMB [5] AMB [6] AGB
                // [7] PesoEst  [8] TallaEst
                return F("Circunferencia_Brazo_cm")
                    + "<SPLITER>" + F("Circunferencia_Pantorrilla_cm")
                    + "<SPLITER>" + F("Altura_Rodilla_cm")
                    + "<SPLITER>" + F("Antrop_ATB")
                    + "<SPLITER>" + F("Antrop_CMB")
                    + "<SPLITER>" + F("Antrop_AMB")
                    + "<SPLITER>" + F("Antrop_AGB")
                    + "<SPLITER>" + F("Peso_Estimado_kg")
                    + "<SPLITER>" + F("Talla_Estimada_cm");
            }
            catch (Exception ex) { return "vacio"; }
        }
    }
}