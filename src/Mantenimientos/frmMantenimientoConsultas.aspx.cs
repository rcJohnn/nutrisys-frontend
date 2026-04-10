using System;
using System.Collections.Generic;
using System.Data;
using System.Globalization;
using System.Text;
using System.Web.Services;
using DAL_CRUD_CONSULTAS.Mantenimientos;
using BLL_CRUD_CONSULTAS.Mantenimientos;
using System.Configuration;
using PL_CRUD_CONSULTAS.Helpers;

namespace PL_CRUD_CONSULTAS.Mantenimientos
{
    public partial class frmMantenimientoConsultas : System.Web.UI.Page
    {
        protected void Page_Load(object sender, EventArgs e) { }

        // ─────────────────────────────────────────────────
        // CARGAR CLÍNICAS DEL MÉDICO (para combo en agendar cita)
        // ─────────────────────────────────────────────────
        [WebMethod(EnableSession = true)]
        public static string CargaClinicasMedico(List<string> obj_Parametros_JS)
        {
            if (!cls_Sesion_PL_Helper.EsSesionValida())
                return cls_Sesion_PL_Helper.SinSesion();

            // [0]=IdMedico
            try
            {
                cls_MedicoClinica_DAL obj_DAL = new cls_MedicoClinica_DAL();
                cls_MedicoClinica_BLL obj_BLL = new cls_MedicoClinica_BLL();

                obj_DAL.iId_Medico = Convert.ToInt32(obj_Parametros_JS[0]);
                obj_BLL.listarClinicasParaConsulta(ref obj_DAL);

                if (obj_DAL.dtDatos == null || obj_DAL.dtDatos.Rows.Count == 0)
                    return "";

                // Columnas SP: [0]=Id_Clinica [1]=Nombre [2]=Direccion [3]=Logo_Url
                var sb = new StringBuilder("[");
                bool first = true;
                foreach (DataRow row in obj_DAL.dtDatos.Rows)
                {
                    if (!first) sb.Append(",");
                    first = false;
                    string nombre    = row[1].ToString().Replace("\\", "\\\\").Replace("\"", "\\\"");
                    string direccion = row[2] != DBNull.Value ? row[2].ToString().Replace("\\", "\\\\").Replace("\"", "\\\"") : "";
                    string logo      = row[3] != DBNull.Value ? row[3].ToString().Replace("\\", "\\\\").Replace("\"", "\\\"") : "";
                    sb.Append("{\"id\":" + row[0] + ",\"nombre\":\"" + nombre + "\",\"direccion\":\"" + direccion + "\",\"logo\":\"" + logo + "\"}");
                }
                sb.Append("]");
                return sb.ToString();
            }
            catch (Exception ex) { return ""; }
        }

        // ─────────────────────────────────────────────────
        // CARGAR LISTA DE USUARIOS (admin/médico mode)
        // ─────────────────────────────────────────────────
        [WebMethod(EnableSession = true)]
        public static string CargaListaUsuarios(List<string> obj_Parametros_JS)
        {
            if (!cls_Sesion_PL_Helper.EsSesionValida())
                return cls_Sesion_PL_Helper.SinSesion();

            try
            {
                cls_Usuarios_DAL obj_DAL = new cls_Usuarios_DAL();
                cls_Usuarios_BLL obj_BLL = new cls_Usuarios_BLL();
                obj_BLL.listarFiltrarUsuarios(ref obj_DAL);

                string opts = "";
                if (obj_DAL.dtDatos != null)
                    foreach (DataRow row in obj_DAL.dtDatos.Rows)
                    {
                        string nombre = row[1] + " " + row[2] + " " + row[3];
                        opts += "<option value='" + row[0] + "'>" + System.Web.HttpUtility.HtmlEncode(nombre.ToString()) + "</option>";
                    }
                return opts;
            }
            catch (Exception ex) { return "Error: " + ex.Message; }
        }

        // ─────────────────────────────────────────────────
        // CARGAR MÉDICOS (admin/médico mode — todos)
        // ─────────────────────────────────────────────────
        [WebMethod(EnableSession = true)]
        public static string CargaListaMedicos(List<string> obj_Parametros_JS)
        {
            if (!cls_Sesion_PL_Helper.EsSesionValida())
                return cls_Sesion_PL_Helper.SinSesion();

            try
            {
                cls_Medicos_DAL obj_DAL = new cls_Medicos_DAL();
                cls_Medicos_BLL obj_BLL = new cls_Medicos_BLL();
                obj_BLL.listarFiltrarMedicos(ref obj_DAL);

                string opts = "";
                if (obj_DAL.dtDatos != null)
                    foreach (DataRow row in obj_DAL.dtDatos.Rows)
                    {
                        string nombre = row[1] + " " + row[2] + " " + row[3];
                        opts += "<option value='" + row[0] + "'>" + System.Web.HttpUtility.HtmlEncode(nombre.ToString()) + "</option>";
                    }
                return opts;
            }
            catch (Exception ex) { return "Error: " + ex.Message; }
        }

        // ─────────────────────────────────────────────────
        // CARGAR MÉDICOS CON AUTOAGENDAMIENTO (paciente)
        // ─────────────────────────────────────────────────
        [WebMethod(EnableSession = true)]
        public static string CargaMedicosAutoagendamiento(List<string> obj_Parametros_JS)
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

                string opts = "";
                cls_ConfigMedico_BLL cfgBLL = new cls_ConfigMedico_BLL();

                foreach (DataRow row in obj_DAL.dtDatos.Rows)
                {
                    int idMedico = Convert.ToInt32(row[0]);
                    cls_ConfigMedico_DAL cfgDAL = new cls_ConfigMedico_DAL();
                    cfgDAL.iId_Medico = idMedico;
                    cfgBLL.ObtenerConfig(ref cfgDAL);

                    bool permite = cfgDAL.dtDatos != null
                        && cfgDAL.dtDatos.Rows.Count > 0
                        && (cfgDAL.dtDatos.Rows[0][0].ToString() == "True"
                            || cfgDAL.dtDatos.Rows[0][0].ToString() == "1");

                    if (permite)
                    {
                        string nombre = row[1] + " " + row[2] + " " + row[3];
                        opts += "<option value='" + idMedico + "'>" + System.Web.HttpUtility.HtmlEncode(nombre.ToString()) + "</option>";
                    }
                }
                return opts;
            }
            catch (Exception ex) { return "Error: " + ex.Message; }
        }

        // ─────────────────────────────────────────────────
        // OBTENER SLOTS DISPONIBLES
        // ─────────────────────────────────────────────────
        [WebMethod(EnableSession = true)]
        public static string ObtenerSlots(List<string> obj_Parametros_JS)
        {
            if (!cls_Sesion_PL_Helper.EsSesionValida())
                return cls_Sesion_PL_Helper.SinSesion();

            try
            {
                // [0] IdMedico   [1] Fecha (yyyy-MM-dd)
                int idMedico = Convert.ToInt32(obj_Parametros_JS[0]);
                DateTime fecha = DateTime.ParseExact(
                    obj_Parametros_JS[1], "yyyy-MM-dd", CultureInfo.InvariantCulture);
                int diaSemana = (int)fecha.DayOfWeek; // 0=Dom...6=Sab

                // 1 ─ Horario semanal del médico
                cls_HorarioSemanal_DAL horDAL = new cls_HorarioSemanal_DAL();
                horDAL.iId_Medico = idMedico;
                new cls_HorarioSemanal_BLL().ObtenerHorario(ref horDAL);

                // Buscar la fila del día solicitado (columnas: [0]=Id,[1]=Dia,[2]=HoraIni,[3]=HoraFin,[4]=Activo)
                DataRow horRow = null;
                if (horDAL.dtDatos != null)
                    foreach (DataRow r in horDAL.dtDatos.Rows)
                        if (Convert.ToInt32(r[1]) == diaSemana
                            && (r[4].ToString() == "True" || r[4].ToString() == "1"))
                        { horRow = r; break; }

                if (horRow == null)
                    return "0<SPLITER>El médico no atiende ese día de la semana.";

                TimeSpan horaInicio = TimeSpan.Parse(horRow[2].ToString());
                TimeSpan horaFin    = TimeSpan.Parse(horRow[3].ToString());

                // 2 ─ Configuración del médico (slot duration, anticipación)
                cls_ConfigMedico_DAL cfgDAL = new cls_ConfigMedico_DAL();
                cfgDAL.iId_Medico = idMedico;
                new cls_ConfigMedico_BLL().ObtenerConfig(ref cfgDAL);

                // Columnas config: [0]=Permite_Auto [1]=DuracionSlot [2]=AnticipMin [3]=MaxCitas ...
                int slotMin    = 30;
                int anticipMin = 60;
                if (cfgDAL.dtDatos != null && cfgDAL.dtDatos.Rows.Count > 0)
                {
                    DataRow cr = cfgDAL.dtDatos.Rows[0];
                    if (cr[1] != DBNull.Value) slotMin    = Convert.ToInt32(cr[1]);
                    if (cr[2] != DBNull.Value) anticipMin = Convert.ToInt32(cr[2]);
                }

                // 3 ─ Bloqueos del médico para ese día
                // Columnas: [0]=Id [1]=Tipo(D/H) [2]=FechaInicio [3]=FechaFin [4]=Motivo
                cls_Bloqueos_DAL bloqDAL = new cls_Bloqueos_DAL();
                bloqDAL.iId_Medico  = idMedico;
                bloqDAL.dtFechaDesde = fecha.Date;
                new cls_Bloqueos_BLL().ObtenerBloqueos(ref bloqDAL);

                // Verificar bloqueo de día completo
                if (bloqDAL.dtDatos != null)
                    foreach (DataRow r in bloqDAL.dtDatos.Rows)
                        if (r[1].ToString() == "D"
                            && Convert.ToDateTime(r[2]).Date <= fecha.Date
                            && Convert.ToDateTime(r[3]).Date >= fecha.Date)
                            return "0<SPLITER>El médico tiene el día bloqueado.";

                // 4 ─ Consultas existentes del médico para ese día
                cls_Consultas_DAL conDAL = new cls_Consultas_DAL();
                conDAL.iId_Medico    = idMedico;
                conDAL.dtFechaInicio = fecha.Date;
                conDAL.dtFechaFin    = fecha.Date.AddHours(23).AddMinutes(59);
                new cls_Consultas_BLL().filtrarConsultas(ref conDAL);

                // Detectar columnas por nombre (defensive)
                int colFecha = 8, colDur = 9, colEst = 10;
                if (conDAL.dtDatos != null)
                {
                    DataColumnCollection cols = conDAL.dtDatos.Columns;
                    for (int c = 0; c < cols.Count; c++)
                    {
                        string cn = cols[c].ColumnName.ToLower();
                        if (cn.Contains("fecha") && cn.Contains("cita")) colFecha = c;
                        else if (cn.Contains("duracion"))                 colDur   = c;
                        else if (cn == "estado")                          colEst   = c;
                    }
                }

                // 5 ─ Generar slots disponibles
                DateTime ahora       = DateTime.Now;
                DateTime limiteAntic = ahora.AddMinutes(anticipMin);
                var slots = new List<string>();

                TimeSpan cursor = horaInicio;
                while (cursor.Add(TimeSpan.FromMinutes(slotMin)) <= horaFin)
                {
                    DateTime slotDT = fecha.Date.Add(cursor);

                    // Descartar slots dentro de la ventana de anticipación
                    if (slotDT < limiteAntic)
                    { cursor = cursor.Add(TimeSpan.FromMinutes(slotMin)); continue; }

                    // Verificar bloqueos por horas
                    bool bloqueado = false;
                    if (bloqDAL.dtDatos != null)
                        foreach (DataRow r in bloqDAL.dtDatos.Rows)
                            if (r[1].ToString() == "H")
                            {
                                DateTime bIni = Convert.ToDateTime(r[2]);
                                DateTime bFin = Convert.ToDateTime(r[3]);
                                if (slotDT < bFin && slotDT.AddMinutes(slotMin) > bIni)
                                { bloqueado = true; break; }
                            }
                    if (bloqueado) { cursor = cursor.Add(TimeSpan.FromMinutes(slotMin)); continue; }

                    // Verificar consultas existentes (excluir canceladas y no asistió)
                    bool ocupado = false;
                    if (conDAL.dtDatos != null)
                        foreach (DataRow r in conDAL.dtDatos.Rows)
                        {
                            try
                            {
                                string est = r[colEst].ToString();
                                if (est == "X" || est == "N") continue;

                                DateTime cIni = Convert.ToDateTime(r[colFecha]);
                                int      cDur = Convert.ToInt32(r[colDur]);
                                DateTime cFin = cIni.AddMinutes(cDur);

                                if (slotDT < cFin && slotDT.AddMinutes(slotMin) > cIni)
                                { ocupado = true; break; }
                            }
                            catch { /* skip row if data unexpected */ }
                        }
                    if (ocupado) { cursor = cursor.Add(TimeSpan.FromMinutes(slotMin)); continue; }

                    slots.Add(cursor.ToString(@"hh\:mm"));
                    cursor = cursor.Add(TimeSpan.FromMinutes(slotMin));
                }

                if (slots.Count == 0)
                    return "0<SPLITER>No hay horarios disponibles para ese día.";

                // "1<SPLITER>duracion<SPLITER>HH:mm,HH:mm,..."
                return "1<SPLITER>" + slotMin + "<SPLITER>" + string.Join(",", slots);
            }
            catch (Exception ex) { return "0<SPLITER>" + ex.Message; }
        }

        // ─────────────────────────────────────────────────
        // CARGAR INFORMACIÓN DE CONSULTA (edición)
        // ─────────────────────────────────────────────────
        [WebMethod(EnableSession = true)]
        public static string CargaInfoConsulta(List<string> obj_Parametros_JS)
        {
            if (!cls_Sesion_PL_Helper.EsSesionValida())
                return cls_Sesion_PL_Helper.SinSesion();

            try
            {
                cls_Consultas_DAL obj_DAL = new cls_Consultas_DAL();
                cls_Consultas_BLL obj_BLL = new cls_Consultas_BLL();

                obj_DAL.iId_Consulta = Convert.ToInt32(obj_Parametros_JS[0]);
                obj_BLL.Obtiene_Informacion_Consultas(ref obj_DAL);

                if (obj_DAL.dtDatos == null || obj_DAL.dtDatos.Rows.Count == 0)
                    return "No se encontraron registros";

                DataRow row = obj_DAL.dtDatos.Rows[0];
                DateTime fechaCita = Convert.ToDateTime(row[8]);

                // Buscar columna Id_Clinica si existe en el SP (nullable)
                string idClinicaStr = "0";
                for (int c = 0; c < obj_DAL.dtDatos.Columns.Count; c++)
                    if (obj_DAL.dtDatos.Columns[c].ColumnName.ToLower().Contains("id_clinica")
                        || obj_DAL.dtDatos.Columns[c].ColumnName.ToLower().Contains("clinica"))
                    { idClinicaStr = row[c] != DBNull.Value ? row[c].ToString() : "0"; break; }

                return row[1] + "<SPLITER>" +   // IdUsuario
                       row[5] + "<SPLITER>" +   // IdMedico
                       fechaCita.ToString("yyyy-MM-dd") + "<SPLITER>" +
                       fechaCita.ToString("HH:mm") + "<SPLITER>" +
                       row[9] + "<SPLITER>" +   // DuracionMinutos
                       row[10] + "<SPLITER>" +  // Estado
                       row[11] + "<SPLITER>" +  // Motivo
                       idClinicaStr;            // IdClinica
            }
            catch (Exception ex) { throw ex; }
        }

        // ─────────────────────────────────────────────────
        // GUARDAR / MODIFICAR CONSULTA
        // ─────────────────────────────────────────────────
        [WebMethod(EnableSession = true)]
        public static string MantenimientoConsulta(List<string> obj_Parametros_JS)
        {
            if (!cls_Sesion_PL_Helper.EsSesionValida())
                return cls_Sesion_PL_Helper.SinSesion();

            try
            {
                // [0]=IdConsulta [1]=IdUsuario [2]=IdMedico [3]=FechaHora
                // [4]=Duracion   [5]=Motivo    [6]=Estado   [7]=IdUsuarioGlobal [8]=IdClinica
                cls_Consultas_DAL obj_DAL = new cls_Consultas_DAL();
                cls_Consultas_BLL obj_BLL = new cls_Consultas_BLL();

                int idConsulta = Convert.ToInt32(obj_Parametros_JS[0]);
                obj_DAL.iId_Usuario      = Convert.ToInt32(obj_Parametros_JS[1]);
                obj_DAL.iId_Medico       = Convert.ToInt32(obj_Parametros_JS[2]);
                obj_DAL.dtFecha_Cita     = Convert.ToDateTime(obj_Parametros_JS[3]);
                obj_DAL.iDuracion_Minutos= Convert.ToInt32(obj_Parametros_JS[4]);
                obj_DAL.sMotivo          = obj_Parametros_JS[5] ?? "";
                obj_DAL.iIdUsuarioGlobal = Convert.ToInt32(obj_Parametros_JS[7]);

                int idClinica = obj_Parametros_JS.Count > 8
                    ? Convert.ToInt32(string.IsNullOrEmpty(obj_Parametros_JS[8]) ? "0" : obj_Parametros_JS[8])
                    : 0;
                obj_DAL.iId_Clinica = idClinica > 0 ? idClinica : (int?)null;

                if (idConsulta == 0)
                {
                    // ── INSERTAR ──
                    obj_BLL.insertarConsulta(ref obj_DAL);
                    string resultado = obj_DAL.sValorScalar;

                    if (resultado == "-1")
                        return "-1<SPLITER>Ya existe una cita agendada para ese médico en ese horario.";

                    if (string.IsNullOrEmpty(resultado) || resultado == "0")
                        return "0<SPLITER>Error al procesar la consulta.";

                    // ── Obtener datos para emails ──
                    try
                    {
                        cls_Consultas_DAL infoConsulta = new cls_Consultas_DAL();
                        infoConsulta.iId_Consulta = Convert.ToInt32(resultado);
                        obj_BLL.Obtiene_Informacion_Consultas(ref infoConsulta);

                        cls_Medicos_DAL medicoInfo = new cls_Medicos_DAL();
                        cls_Medicos_BLL medicoBLL  = new cls_Medicos_BLL();
                        medicoInfo.iId_Medico = obj_DAL.iId_Medico;
                        medicoBLL.Obtiene_Informacion_Medicos(ref medicoInfo);

                        string logoUrl   = null, direccion = null, nombreClinicaEmail = null;
                        decimal? lat = null, lng = null;
                        string emailMedico   = "";
                        string nombreMedico  = "";

                        if (medicoInfo.dtDatos != null && medicoInfo.dtDatos.Rows.Count > 0)
                        {
                            DataRow mr = medicoInfo.dtDatos.Rows[0];
                            emailMedico  = mr[6] != DBNull.Value ? mr[6].ToString() : "";
                            nombreMedico = mr[1] + " " + mr[2] + " " + mr[3];
                        }

                        // Obtener datos de la clínica seleccionada para el email
                        if (idClinica > 0)
                        {
                            cls_Clinicas_DAL clinicaDAL = new cls_Clinicas_DAL();
                            cls_Clinicas_BLL clinicaBLL = new cls_Clinicas_BLL();
                            clinicaDAL.iId_Clinica = idClinica;
                            clinicaBLL.obtenerInfoClinica(ref clinicaDAL);
                            if (clinicaDAL.dtDatos != null && clinicaDAL.dtDatos.Rows.Count > 0)
                            {
                                DataRow cr = clinicaDAL.dtDatos.Rows[0];
                                nombreClinicaEmail = cr[1] != DBNull.Value ? cr[1].ToString() : null;
                                direccion = cr[2] != DBNull.Value ? cr[2].ToString() : null;
                                lat = cr[3] != DBNull.Value ? Convert.ToDecimal(cr[3]) : (decimal?)null;
                                lng = cr[4] != DBNull.Value ? Convert.ToDecimal(cr[4]) : (decimal?)null;
                                logoUrl   = cr[5] != DBNull.Value ? cr[5].ToString() : null;
                            }
                        }

                        if (infoConsulta.dtDatos != null && infoConsulta.dtDatos.Rows.Count > 0)
                        {
                            DataRow cr = infoConsulta.dtDatos.Rows[0];
                            string nombrePaciente = cr[2].ToString();
                            string emailPaciente  = cr[4].ToString();

                            // Email al paciente
                            cls_Email_Helper.EnviarEmailConCita(
                                emailPaciente, nombrePaciente, nombreMedico,
                                obj_DAL.dtFecha_Cita, obj_DAL.iDuracion_Minutos,
                                obj_DAL.sMotivo, false, logoUrl, direccion, lat, lng, nombreClinicaEmail);

                            // Email al médico (con logo + clínica)
                            if (!string.IsNullOrEmpty(emailMedico))
                                cls_Email_Helper.EnviarNotificacionMedico(
                                    emailMedico, nombreMedico, nombrePaciente,
                                    obj_DAL.dtFecha_Cita, obj_DAL.iDuracion_Minutos,
                                    obj_DAL.sMotivo, false, nombreClinicaEmail, logoUrl, direccion, lat, lng);
                        }
                    }
                    catch (Exception exEmail)
                    {
                        System.Diagnostics.Debug.WriteLine("Error al enviar email: " + exEmail.Message);
                    }

                    return resultado + "<SPLITER>¡Cita agendada exitosamente! Se ha enviado confirmación al correo.";
                }
                else
                {
                    // ── MODIFICAR ──
                    obj_DAL.iId_Consulta = idConsulta;
                    obj_DAL.sEstado = obj_Parametros_JS[6];
                    obj_BLL.modificarConsulta(ref obj_DAL);

                    string resultado = obj_DAL.sValorScalar;

                    if (resultado == "-1")
                        return "-1<SPLITER>Ya existe una cita agendada para ese médico en ese horario.";

                    if (string.IsNullOrEmpty(resultado) || resultado == "0")
                        return "0<SPLITER>Error al procesar la consulta.";

                    // ── Reenviar emails ──
                    try
                    {
                        cls_Consultas_DAL infoConsulta = new cls_Consultas_DAL();
                        infoConsulta.iId_Consulta = idConsulta;
                        obj_BLL.Obtiene_Informacion_Consultas(ref infoConsulta);

                        cls_Medicos_DAL medicoInfo = new cls_Medicos_DAL();
                        cls_Medicos_BLL medicoBLL  = new cls_Medicos_BLL();
                        medicoInfo.iId_Medico = obj_DAL.iId_Medico;
                        medicoBLL.Obtiene_Informacion_Medicos(ref medicoInfo);

                        string logoUrl = null, direccion = null, nombreClinicaEmail = null;
                        decimal? lat = null, lng = null;
                        string emailMedico  = "";
                        string nombreMedico = "";

                        if (medicoInfo.dtDatos != null && medicoInfo.dtDatos.Rows.Count > 0)
                        {
                            DataRow mr = medicoInfo.dtDatos.Rows[0];
                            emailMedico  = mr[6] != DBNull.Value ? mr[6].ToString() : "";
                            nombreMedico = mr[1] + " " + mr[2] + " " + mr[3];
                        }

                        if (idClinica > 0)
                        {
                            cls_Clinicas_DAL clinicaDAL = new cls_Clinicas_DAL();
                            cls_Clinicas_BLL clinicaBLL = new cls_Clinicas_BLL();
                            clinicaDAL.iId_Clinica = idClinica;
                            clinicaBLL.obtenerInfoClinica(ref clinicaDAL);
                            if (clinicaDAL.dtDatos != null && clinicaDAL.dtDatos.Rows.Count > 0)
                            {
                                DataRow cr = clinicaDAL.dtDatos.Rows[0];
                                nombreClinicaEmail = cr[1] != DBNull.Value ? cr[1].ToString() : null;
                                direccion = cr[2] != DBNull.Value ? cr[2].ToString() : null;
                                lat = cr[3] != DBNull.Value ? Convert.ToDecimal(cr[3]) : (decimal?)null;
                                lng = cr[4] != DBNull.Value ? Convert.ToDecimal(cr[4]) : (decimal?)null;
                                logoUrl   = cr[5] != DBNull.Value ? cr[5].ToString() : null;
                            }
                        }

                        if (infoConsulta.dtDatos != null && infoConsulta.dtDatos.Rows.Count > 0)
                        {
                            DataRow cr = infoConsulta.dtDatos.Rows[0];
                            string nombrePaciente = cr[2].ToString();
                            string emailPaciente  = cr[4].ToString();

                            cls_Email_Helper.EnviarEmailConCita(
                                emailPaciente, nombrePaciente, nombreMedico,
                                obj_DAL.dtFecha_Cita, obj_DAL.iDuracion_Minutos,
                                obj_DAL.sMotivo, true, logoUrl, direccion, lat, lng, nombreClinicaEmail);

                            if (!string.IsNullOrEmpty(emailMedico))
                                cls_Email_Helper.EnviarNotificacionMedico(
                                    emailMedico, nombreMedico, nombrePaciente,
                                    obj_DAL.dtFecha_Cita, obj_DAL.iDuracion_Minutos,
                                    obj_DAL.sMotivo, true, nombreClinicaEmail, logoUrl, direccion, lat, lng);
                        }
                    }
                    catch (Exception exEmail)
                    {
                        System.Diagnostics.Debug.WriteLine("Error al reenviar email: " + exEmail.Message);
                    }

                    return resultado + "<SPLITER>Cita modificada exitosamente. Se ha enviado notificación por email.";
                }
            }
            catch (Exception ex) { return "0<SPLITER>" + ex.Message; }
        }
    }
}
