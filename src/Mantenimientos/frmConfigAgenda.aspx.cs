using BLL_CRUD_CONSULTAS.BD;
using BLL_CRUD_CONSULTAS.Mantenimientos;
using DAL_CRUD_CONSULTAS.BD;
using DAL_CRUD_CONSULTAS.Mantenimientos;
using PL_CRUD_CONSULTAS.Helpers;
using System.Text;
using System;
using System.Collections.Generic;
using System.Data;
using System.Web;
using System.Web.Services;


namespace PL_CRUD_CONSULTAS.Mantenimientos
{
    public partial class frmConfigAgenda : System.Web.UI.Page
    {
        protected void Page_Load(object sender, EventArgs e) { }

        // ── Helpers ──────────────────────────────────────
        private static string Val(object v) =>
            v == null || v == DBNull.Value ? "" : v.ToString().Trim();

        // ─────────────────────────────────────────────────
        // LISTAR MÉDICOS PARA COMBO (admin)
        // ─────────────────────────────────────────────────
        [WebMethod(EnableSession = true)]
        public static string CargarListaMedicos(List<string> obj_Parametros_JS)
        {
            if (!cls_Sesion_PL_Helper.EsSesionValida())
                return cls_Sesion_PL_Helper.SinSesion();

            try
            {
                cls_Medicos_DAL obj_DAL = new cls_Medicos_DAL();
                cls_Medicos_BLL obj_BLL = new cls_Medicos_BLL();
                obj_BLL.listarFiltrarMedicos(ref obj_DAL);

                if (obj_DAL.dtDatos == null || obj_DAL.dtDatos.Rows.Count == 0)
                    return "";

                string opts = "<option value='0'>-- Seleccione un médico --</option>";
                foreach (DataRow r in obj_DAL.dtDatos.Rows)
                {
                    string nombre = r[1] + " " + r[2] + " " + r[3];
                    opts += "<option value='" + r[0] + "'>" + System.Web.HttpUtility.HtmlEncode(nombre.ToString()) + "</option>";
                }
                return opts;
            }
            catch (Exception ex) { return ""; }
        }

        // ─────────────────────────────────────────────────
        // CARGAR CONFIGURACIÓN GENERAL DEL MÉDICO
        // ─────────────────────────────────────────────────
        [WebMethod(EnableSession = true)]
        public static string CargarConfigMedico(List<string> obj_Parametros_JS)
        {
            if (!cls_Sesion_PL_Helper.EsSesionValida())
                return cls_Sesion_PL_Helper.SinSesion();

            try
            {
                // [0] IdMedico
                cls_ConfigMedico_DAL obj_DAL = new cls_ConfigMedico_DAL();
                cls_ConfigMedico_BLL obj_BLL = new cls_ConfigMedico_BLL();

                obj_DAL.iId_Medico = Convert.ToInt32(obj_Parametros_JS[0]);
                obj_BLL.ObtenerConfig(ref obj_DAL);

                if (obj_DAL.dtDatos == null || obj_DAL.dtDatos.Rows.Count == 0)
                    return "0<SPLITER>No se encontró configuración";

                DataRow r = obj_DAL.dtDatos.Rows[0];

                // [0] Permite_Autoagendamiento  [1] Duracion_Slot_Min
                // [2] Anticipacion_Min_Reserva  [3] Max_Citas_Por_Dia
                // [4] Max_Cancelaciones_Usuario [5] Periodo_Penalizacion_Dias
                // [6] Meses_Inactividad_Usuario
                return "1" + "<SPLITER>" +
                       Val(r[0]) + "<SPLITER>" +  // Permite_Auto
                       Val(r[1]) + "<SPLITER>" +  // SlotMin
                       Val(r[2]) + "<SPLITER>" +  // AnticipMin
                       Val(r[3]) + "<SPLITER>" +  // MaxCitas
                       Val(r[4]) + "<SPLITER>" +  // MaxCancelaciones
                       Val(r[5]) + "<SPLITER>" +  // PeriodoPenal
                       Val(r[6]);                  // MesesInactividad
            }
            catch (Exception ex) { return "0<SPLITER>" + ex.Message; }
        }

        // ─────────────────────────────────────────────────
        // GUARDAR CONFIGURACIÓN GENERAL
        // ─────────────────────────────────────────────────
        [WebMethod(EnableSession = true)]
        public static string GuardarConfigMedico(List<string> obj_Parametros_JS)
        {
            if (!cls_Sesion_PL_Helper.EsSesionValida())
                return cls_Sesion_PL_Helper.SinSesion();

            try
            {
                // [0] IdMedico  [1] PermiteAuto  [2] SlotMin  [3] AnticipMin
                // [4] MaxCitas  [5] MaxCancelaciones  [6] PeriodoPenal  [7] MesesInactividad
                cls_ConfigMedico_DAL obj_DAL = new cls_ConfigMedico_DAL();
                cls_ConfigMedico_BLL obj_BLL = new cls_ConfigMedico_BLL();

                obj_DAL.iId_Medico = Convert.ToInt32(obj_Parametros_JS[0]);
                obj_DAL.bPermite_Autoagendamiento = obj_Parametros_JS[1] == "1";
                obj_DAL.iDuracion_Slot_Min = Convert.ToInt32(obj_Parametros_JS[2]);
                obj_DAL.iAnticipacion_Min_Reserva = Convert.ToInt32(obj_Parametros_JS[3]);
                obj_DAL.iMax_Citas_Por_Dia = string.IsNullOrEmpty(obj_Parametros_JS[4])
                    ? (int?)null : Convert.ToInt32(obj_Parametros_JS[4]);
                obj_DAL.iMax_Cancelaciones_Usuario = Convert.ToInt32(obj_Parametros_JS[5]);
                obj_DAL.iPeriodo_Penalizacion_Dias = Convert.ToInt32(obj_Parametros_JS[6]);
                obj_DAL.iMeses_Inactividad_Usuario = string.IsNullOrEmpty(obj_Parametros_JS[7])
                    ? 1 : Convert.ToInt32(obj_Parametros_JS[7]);

                obj_BLL.ActualizarConfig(ref obj_DAL);

                return obj_DAL.sValorScalar == "1"
                    ? "1<SPLITER>Configuración guardada correctamente."
                    : "0<SPLITER>Error al guardar la configuración.";
            }
            catch (Exception ex) { return "0<SPLITER>" + ex.Message; }
        }

        // ─────────────────────────────────────────────────
        // EJECUTAR INACTIVACIÓN MANUAL DE USUARIOS
        // ─────────────────────────────────────────────────
        [WebMethod(EnableSession = true)]
        public static string EjecutarInactivacionUsuarios(List<string> obj_Parametros_JS)
        {
            if (!cls_Sesion_PL_Helper.EsSesionValida())
                return cls_Sesion_PL_Helper.SinSesion();

            // [0] IdMedico  [1] IdUsuarioGlobal
            try
            {
                cls_ConfigMedico_DAL obj_DAL = new cls_ConfigMedico_DAL();
                cls_ConfigMedico_BLL obj_BLL = new cls_ConfigMedico_BLL();

                obj_DAL.iId_Medico       = Convert.ToInt32(obj_Parametros_JS[0]);
                obj_DAL.iIdUsuarioGlobal = Convert.ToInt32(obj_Parametros_JS[1]);

                obj_BLL.EjecutarInactivacion(ref obj_DAL);

                if (obj_DAL.sValorScalar == "-1")
                    return "0<SPLITER>Ocurrió un error al ejecutar la inactivación.";

                int cantidad = Convert.ToInt32(obj_DAL.sValorScalar);
                string msg = cantidad == 0
                    ? "No hay pacientes que inactivar en este momento."
                    : cantidad + " paciente(s) inactivado(s) correctamente.";

                return "1<SPLITER>" + msg;
            }
            catch (Exception ex) { return "0<SPLITER>" + ex.Message; }
        }

        // ─────────────────────────────────────────────────
        // CARGAR HORARIO SEMANAL
        // ─────────────────────────────────────────────────
        [WebMethod(EnableSession = true)]
        public static string CargarHorarioSemanal(List<string> obj_Parametros_JS)
        {
            if (!cls_Sesion_PL_Helper.EsSesionValida())
                return cls_Sesion_PL_Helper.SinSesion();

            try
            {
                // [0] IdMedico
                cls_HorarioSemanal_DAL obj_DAL = new cls_HorarioSemanal_DAL();
                cls_HorarioSemanal_BLL obj_BLL = new cls_HorarioSemanal_BLL();

                obj_DAL.iId_Medico = Convert.ToInt32(obj_Parametros_JS[0]);
                obj_BLL.ObtenerHorario(ref obj_DAL);

                if (obj_DAL.dtDatos == null || obj_DAL.dtDatos.Rows.Count == 0)
                    return "[]";

                // [0] Id_Horario  [1] Dia_Semana  [2] Hora_Inicio  [3] Hora_Fin  [4] Activo
                var sb = new System.Text.StringBuilder("[");
                for (int i = 0; i < obj_DAL.dtDatos.Rows.Count; i++)
                {
                    DataRow r = obj_DAL.dtDatos.Rows[i];
                    if (i > 0) sb.Append(",");
                    sb.Append("{");
                    sb.Append("\"dia\":" + r[1] + ",");
                    sb.Append("\"horaInicio\":\"" + r[2] + "\",");
                    sb.Append("\"horaFin\":\"" + r[3] + "\",");
                    sb.Append("\"activo\":" + (r[4].ToString() == "True" ? "true" : "false"));
                    sb.Append("}");
                }
                sb.Append("]");
                return sb.ToString();
            }
            catch (Exception ex) { return "[]"; }
        }

        // ─────────────────────────────────────────────────
        // GUARDAR UN DÍA DEL HORARIO SEMANAL
        // ─────────────────────────────────────────────────
        [WebMethod(EnableSession = true)]
        public static string GuardarHorarioDia(List<string> obj_Parametros_JS)
        {
            if (!cls_Sesion_PL_Helper.EsSesionValida())
                return cls_Sesion_PL_Helper.SinSesion();

            try
            {
                // [0] IdMedico  [1] DiaSemana  [2] HoraInicio  [3] HoraFin  [4] Activo
                cls_HorarioSemanal_DAL obj_DAL = new cls_HorarioSemanal_DAL();
                cls_HorarioSemanal_BLL obj_BLL = new cls_HorarioSemanal_BLL();

                obj_DAL.iId_Medico = Convert.ToInt32(obj_Parametros_JS[0]);
                obj_DAL.bDia_Semana = Convert.ToByte(obj_Parametros_JS[1]);
                obj_DAL.sHora_Inicio = obj_Parametros_JS[2];
                obj_DAL.sHora_Fin = obj_Parametros_JS[3];
                obj_DAL.bActivo = obj_Parametros_JS[4] == "1";

                obj_BLL.GuardarHorario(ref obj_DAL);

                return obj_DAL.sValorScalar == "1"
                    ? "1<SPLITER>OK"
                    : "0<SPLITER>Error al guardar el día";
            }
            catch (Exception ex) { return "0<SPLITER>" + ex.Message; }
        }

        // ─────────────────────────────────────────────────
        // CARGAR BLOQUEOS
        // ─────────────────────────────────────────────────
        [WebMethod(EnableSession = true)]
        public static string CargarBloqueos(List<string> obj_Parametros_JS)
        {
            if (!cls_Sesion_PL_Helper.EsSesionValida())
                return cls_Sesion_PL_Helper.SinSesion();

            try
            {
                // [0] IdMedico
                cls_Bloqueos_DAL obj_DAL = new cls_Bloqueos_DAL();
                cls_Bloqueos_BLL obj_BLL = new cls_Bloqueos_BLL();

                obj_DAL.iId_Medico = Convert.ToInt32(obj_Parametros_JS[0]);
                // Solo bloqueos futuros o activos
                obj_DAL.dtFechaDesde = DateTime.Today;
                obj_BLL.ObtenerBloqueos(ref obj_DAL);

                if (obj_DAL.dtDatos == null || obj_DAL.dtDatos.Rows.Count == 0)
                    return "vacio";

                // [0] Id_Bloqueo  [1] Tipo_Bloqueo  [2] Fecha_Inicio
                // [3] Fecha_Fin   [4] Motivo
                string html = "";
                foreach (DataRow r in obj_DAL.dtDatos.Rows)
                {
                    string tipo = r[1].ToString();
                    string motivo = Val(r[4]);
                    DateTime fIni = Convert.ToDateTime(r[2]);
                    DateTime fFin = Convert.ToDateTime(r[3]);

                    string rangoTxt = tipo == "D"
                        ? fIni.ToString("dd/MM/yyyy") +
                          (fIni.Date != fFin.Date ? " → " + fFin.ToString("dd/MM/yyyy") : "")
                        : fIni.ToString("dd/MM/yyyy HH:mm") + " → " + fFin.ToString("HH:mm");

                    html += "<div class='bloqueo-item'>" +
                            "<div class='bloqueo-info'>" +
                            "<span class='bloqueo-tipo bloqueo-tipo-" + tipo + "'>" +
                            (tipo == "D" ? "Día completo" : "Horas") + "</span>" +
                            "<span class='bloqueo-fechas'>" + rangoTxt + "</span>" +
                            (string.IsNullOrEmpty(motivo) ? "" :
                                "<div class='bloqueo-motivo'>" + HttpUtility.HtmlEncode(motivo) + "</div>") +
                            "</div>" +
                            "<button class='btn btn-sm btn-outline-danger' style='border-radius:8px;'" +
                            " onclick='eliminarBloqueo(" + r[0] + ")'>" +
                            "<i class='fa fa-trash-o'></i></button>" +
                            "</div>";
                }
                return html;
            }
            catch (Exception ex) { return "Error: " + ex.Message; }
        }

        // ─────────────────────────────────────────────────
        // GUARDAR BLOQUEO
        // ─────────────────────────────────────────────────
        [WebMethod(EnableSession = true)]
        public static string GuardarBloqueo(List<string> obj_Parametros_JS)
        {
            if (!cls_Sesion_PL_Helper.EsSesionValida())
                return cls_Sesion_PL_Helper.SinSesion();

            try
            {
                // [0] IdMedico  [1] Tipo  [2] FechaInicio  [3] FechaFin  [4] Motivo  [5] IdUsuarioGlobal
                cls_Bloqueos_DAL obj_DAL = new cls_Bloqueos_DAL();
                cls_Bloqueos_BLL obj_BLL = new cls_Bloqueos_BLL();

                obj_DAL.iId_Medico = Convert.ToInt32(obj_Parametros_JS[0]);
                obj_DAL.sTipo_Bloqueo = obj_Parametros_JS[1];
                obj_DAL.dtFecha_Inicio = Convert.ToDateTime(obj_Parametros_JS[2]);
                obj_DAL.dtFecha_Fin = Convert.ToDateTime(obj_Parametros_JS[3]);
                obj_DAL.sMotivo = obj_Parametros_JS[4];
                obj_DAL.iIdUsuarioGlobal = Convert.ToInt32(obj_Parametros_JS[5]);

                obj_BLL.GuardarBloqueo(ref obj_DAL);

                return (obj_DAL.sValorScalar == "0" || string.IsNullOrEmpty(obj_DAL.sValorScalar))
                    ? "0<SPLITER>Error al guardar el bloqueo"
                    : obj_DAL.sValorScalar + "<SPLITER>Bloqueo guardado correctamente.";
            }
            catch (Exception ex) { return "0<SPLITER>" + ex.Message; }
        }

        // ─────────────────────────────────────────────────
        // ELIMINAR BLOQUEO
        // ─────────────────────────────────────────────────
        [WebMethod(EnableSession = true)]
        public static string EliminarBloqueo(List<string> obj_Parametros_JS)
        {
            if (!cls_Sesion_PL_Helper.EsSesionValida())
                return cls_Sesion_PL_Helper.SinSesion();

            try
            {
                // [0] IdBloqueo
                cls_Bloqueos_DAL obj_DAL = new cls_Bloqueos_DAL();
                cls_Bloqueos_BLL obj_BLL = new cls_Bloqueos_BLL();

                obj_DAL.iId_Bloqueo = Convert.ToInt32(obj_Parametros_JS[0]);
                obj_BLL.EliminarBloqueo(ref obj_DAL);

                return obj_DAL.sValorScalar == "1"
                    ? "1<SPLITER>Bloqueo eliminado correctamente."
                    : "0<SPLITER>Error al eliminar el bloqueo.";
            }
            catch (Exception ex) { return "0<SPLITER>" + ex.Message; }
        }

        // ─────────────────────────────────────────────────
        // CARGAR PENALIZACIONES DEL MÉDICO
        // ─────────────────────────────────────────────────
        [WebMethod(EnableSession = true)]
        public static string CargarPenalizaciones(List<string> obj_Parametros_JS)
        {
            if (!cls_Sesion_PL_Helper.EsSesionValida())
                return cls_Sesion_PL_Helper.SinSesion();

            try
            {
                // [0] IdMedico — reutilizamos DAL de penalizaciones
                // Necesitamos un SP de listado; usamos consulta directa via BLL
                cls_Penalizaciones_DAL obj_DAL = new cls_Penalizaciones_DAL();

                // Llamada directa con SP de listado por médico
                cls_BD_DAL obj_BD_DAL = new cls_BD_DAL();
                cls_BD_BLL obj_BD_BLL = new cls_BD_BLL();
                DataTable dt = obj_BD_BLL.ObtieneDTParametros(null);
                dt.Rows.Add("@IdMedico", "1", Convert.ToInt32(obj_Parametros_JS[0]));

                obj_BD_DAL.sNomSP = "USP_Listar_Penalizaciones_Medico";
                obj_BD_DAL.DT_Parametros = dt;
                obj_BD_DAL.sNomTabla = "Penalizaciones";
                obj_BD_BLL.EjecutaProcesosTabla(ref obj_BD_DAL);

                if (obj_BD_DAL.DS == null ||
                    obj_BD_DAL.DS.Tables[0].Rows.Count == 0)
                    return "vacio";

                // Columnas: Id_Usuario, NombreUsuario, Cant_Cancelaciones,
                //           Penalizado, Fecha_Fin_Penal
                string html = "";
                foreach (DataRow r in obj_BD_DAL.DS.Tables[0].Rows)
                {
                    bool penalizado = r[3].ToString() == "True" || r[3].ToString() == "1";
                    string finPenal = r[4] != DBNull.Value
                        ? Convert.ToDateTime(r[4]).ToString("dd/MM/yyyy") : "";

                    html += "<div class='penal-item'>" +
                            "<div>" +
                            "<div style='font-weight:600;font-size:.85rem'>" + HttpUtility.HtmlEncode(r[1].ToString()) + "</div>" +
                            "<div style='font-size:.75rem;color:#8e8e93'>" +
                            "Cancelaciones: " + r[2] +
                            (penalizado ? " · Penalizado hasta " + finPenal : "") +
                            "</div>" +
                            "</div>" +
                            "<div class='d-flex align-items-center gap-2'>" +
                            (penalizado
                                ? "<span class='badge-penalizado'>Penalizado</span>"
                                : "<span class='badge-libre'>Sin penalización</span>") +
                            (penalizado
                                ? "<button class='btn btn-sm btn-outline-success' style='border-radius:8px;'" +
                                  " onclick='levantarPenalizacion(" + r[0] + ")'>" +
                                  "<i class='fa fa-unlock'></i> Levantar</button>"
                                : "") +
                            "</div>" +
                            "</div>";
                }
                return html;
            }
            catch (Exception ex) { return "Error: " + ex.Message; }
        }

        // ─────────────────────────────────────────────────
        // CARGAR TIEMPOS DE COMIDA
        // ─────────────────────────────────────────────────
        [WebMethod(EnableSession = true)]
        public static string CargarTiemposComida(List<string> obj_Parametros_JS)
        {
            if (!cls_Sesion_PL_Helper.EsSesionValida())
                return cls_Sesion_PL_Helper.SinSesion();

            try
            {
                // [0] IdMedico
                cls_TiemposComida_DAL obj_DAL = new cls_TiemposComida_DAL();
                cls_TiemposComida_BLL obj_BLL = new cls_TiemposComida_BLL();

                obj_DAL.iId_Medico = Convert.ToInt32(obj_Parametros_JS[0]);
                obj_BLL.ObtenerTiemposComida(ref obj_DAL);

                if (obj_DAL.dtDatos == null || obj_DAL.dtDatos.Rows.Count == 0)
                    return "[]";

                // Columnas: [0] Tipo_Comida  [1] Hora_Inicio  [2] Hora_Fin  [3] Activo
                var sb = new StringBuilder("[");
                for (int i = 0; i < obj_DAL.dtDatos.Rows.Count; i++)
                {
                    DataRow r = obj_DAL.dtDatos.Rows[i];
                    if (i > 0) sb.Append(",");
                    sb.Append("{");
                    sb.Append("\"tipo\":\"" + Val(r[0]) + "\",");
                    sb.Append("\"horaInicio\":\"" + Val(r[1]) + "\",");
                    sb.Append("\"horaFin\":\"" + Val(r[2]) + "\",");
                    sb.Append("\"activo\":" + (r[3].ToString() == "True" ? "true" : "false"));
                    sb.Append("}");
                }
                sb.Append("]");
                return sb.ToString();
            }
            catch (Exception ex) { return "[]"; }
        }

        // ─────────────────────────────────────────────────
        // GUARDAR UN TIEMPO DE COMIDA
        // ─────────────────────────────────────────────────
        [WebMethod(EnableSession = true)]
        public static string GuardarTiempoComida(List<string> obj_Parametros_JS)
        {
            if (!cls_Sesion_PL_Helper.EsSesionValida())
                return cls_Sesion_PL_Helper.SinSesion();

            try
            {
                // [0] IdMedico  [1] TipoComida  [2] HoraInicio  [3] HoraFin  [4] Activo
                cls_TiemposComida_DAL obj_DAL = new cls_TiemposComida_DAL();
                cls_TiemposComida_BLL obj_BLL = new cls_TiemposComida_BLL();

                obj_DAL.iId_Medico   = Convert.ToInt32(obj_Parametros_JS[0]);
                obj_DAL.sTipo_Comida = obj_Parametros_JS[1];
                obj_DAL.sHora_Inicio = obj_Parametros_JS[2];
                obj_DAL.sHora_Fin    = obj_Parametros_JS[3];
                obj_DAL.bActivo      = obj_Parametros_JS[4] == "1";

                obj_BLL.GuardarTiempoComida(ref obj_DAL);

                return obj_DAL.sValorScalar == "1"
                    ? "1<SPLITER>OK"
                    : "0<SPLITER>Error al guardar el tiempo de comida";
            }
            catch (Exception ex) { return "0<SPLITER>" + ex.Message; }
        }

        // ─────────────────────────────────────────────────
        // LEVANTAR PENALIZACIÓN
        // ─────────────────────────────────────────────────
        [WebMethod(EnableSession = true)]
        public static string LevantarPenalizacion(List<string> obj_Parametros_JS)
        {
            if (!cls_Sesion_PL_Helper.EsSesionValida())
                return cls_Sesion_PL_Helper.SinSesion();

            try
            {
                // [0] IdUsuario  [1] IdMedico
                cls_Penalizaciones_DAL obj_DAL = new cls_Penalizaciones_DAL();
                cls_Penalizaciones_BLL obj_BLL = new cls_Penalizaciones_BLL();

                obj_DAL.iId_Usuario = Convert.ToInt32(obj_Parametros_JS[0]);
                obj_DAL.iId_Medico = Convert.ToInt32(obj_Parametros_JS[1]);
                obj_BLL.LevantarPenalizacion(ref obj_DAL);

                return obj_DAL.sValorScalar == "1"
                    ? "1<SPLITER>Penalización levantada correctamente."
                    : "0<SPLITER>Error al levantar la penalización.";
            }
            catch (Exception ex) { return "0<SPLITER>" + ex.Message; }
        }
    }
}