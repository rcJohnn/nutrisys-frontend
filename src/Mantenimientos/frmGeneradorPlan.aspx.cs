using BLL_CRUD_CONSULTAS.Mantenimientos;
using DAL_CRUD_CONSULTAS.Mantenimientos;
using PL_CRUD_CONSULTAS.Helpers;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Linq;
using System.Web.Services;


namespace PL_CRUD_CONSULTAS.Mantenimientos
{
    public partial class frmGeneradorPlan : System.Web.UI.Page
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
        public static string ObtenerAlimentosDisponiblesParaFiltro(List<string> obj_Parametros_JS)
        {
            if (!cls_Sesion_PL_Helper.EsSesionValida())
                return cls_Sesion_PL_Helper.SinSesion();

            try
            {
                int idUsuario = Convert.ToInt32(obj_Parametros_JS[0]);
                string tiempoComida = obj_Parametros_JS[1].ToString();
                cls_PlanNutricional_BLL obj_Plan_BLL = new cls_PlanNutricional_BLL();
                List<AlimentoDisponible> alimentos = obj_Plan_BLL.ObtenerAlimentosDisponibles(idUsuario, tiempoComida);
                var alimentosPorCategoria = alimentos
                    .GroupBy(a => a.Categoria)
                    .OrderBy(g => g.Key)
                    .ToDictionary(g => g.Key, g => g.ToList());
                string html = "";
                foreach (var categoria in alimentosPorCategoria)
                {
                    html += "<div class='mb-3'>";
                    html += "<h6 class='text-primary'><i class='fa fa-folder-o'></i> " + categoria.Key + " (" + categoria.Value.Count + ")</h6>";
                    html += "<div class='row'>";
                    foreach (var alimento in categoria.Value)
                    {
                        html += "<div class='col-md-6'>";
                        html += "<div class='custom-control custom-checkbox'>";
                        html += "<input type='checkbox' class='custom-control-input chk-alimento' " +
                                "id='chkAlim" + alimento.Id_Alimento + "' " +
                                "value='" + alimento.Id_Alimento + "' " +
                                "data-categoria='" + categoria.Key + "' " +
                                "onchange='actualizarContador()'>";
                        html += "<label class='custom-control-label' for='chkAlim" + alimento.Id_Alimento + "'>";
                        html += alimento.Nombre;
                        html += "</label>";
                        html += "</div>";
                        html += "</div>";
                    }
                    html += "</div>";
                    html += "</div>";
                }
                return html;
            }
            catch (Exception ex)
            {
                return "Error: " + ex.Message;
            }
        }

        [WebMethod(EnableSession = true)]
        public static string ObtenerPadecimientosUsuario(List<string> obj_Parametros_JS)
        {
            if (!cls_Sesion_PL_Helper.EsSesionValida())
                return cls_Sesion_PL_Helper.SinSesion();

            try
            {
                string _mensaje = string.Empty;
                cls_Padecimientos_Usuario_DAL obj_Padecimientos_DAL = new cls_Padecimientos_Usuario_DAL();
                cls_Padecimientos_Usuario_BLL obj_Padecimientos_BLL = new cls_Padecimientos_Usuario_BLL();
                obj_Padecimientos_DAL.iId_Usuario = Convert.ToInt32(obj_Parametros_JS[0]);
                obj_Padecimientos_BLL.ListarPadecimientosUsuario(ref obj_Padecimientos_DAL);
                if (obj_Padecimientos_DAL.dtDatos != null && obj_Padecimientos_DAL.dtDatos.Rows.Count > 0)
                {
                    DataRow[] padecimientosAsignados = obj_Padecimientos_DAL.dtDatos.Select("Asignado = 'S'");
                    if (padecimientosAsignados.Length > 0)
                    {
                        List<string> nombresPadecimientos = new List<string>();
                        foreach (DataRow row in padecimientosAsignados)
                            nombresPadecimientos.Add(row[1].ToString());
                        _mensaje = string.Join(", ", nombresPadecimientos);
                    }
                    else
                    {
                        _mensaje = "Ninguno";
                    }
                }
                else
                {
                    _mensaje = "Ninguno";
                }
                return _mensaje;
            }
            catch (Exception ex)
            {
                return "Error: " + ex.Message;
            }
        }

        [WebMethod(EnableSession = true)]
        public static string GenerarPlanNutricional(List<string> obj_Parametros_JS)
        {
            if (!cls_Sesion_PL_Helper.EsSesionValida())
                return cls_Sesion_PL_Helper.SinSesion();

            try
            {
                int idUsuario = Convert.ToInt32(obj_Parametros_JS[0]);
                string tiempoComida = obj_Parametros_JS[1].ToString();
                decimal carbohidratos = Convert.ToDecimal(obj_Parametros_JS[2]);
                decimal proteinas = Convert.ToDecimal(obj_Parametros_JS[3]);
                decimal grasas = Convert.ToDecimal(obj_Parametros_JS[4]);
                decimal fibra = Convert.ToDecimal(obj_Parametros_JS[5]);
                string idsAlimentosFiltrados = obj_Parametros_JS.Count > 6 ? obj_Parametros_JS[6] : "";
                bool esVegano = obj_Parametros_JS.Count > 7 && obj_Parametros_JS[7] == "1";

                cls_PlanNutricional_BLL obj_Plan_BLL = new cls_PlanNutricional_BLL();
                PlanNutricional plan;

                if (!string.IsNullOrEmpty(idsAlimentosFiltrados))
                {
                    var idsFiltrados = idsAlimentosFiltrados.Split(',').Select(int.Parse).ToList();
                    plan = obj_Plan_BLL.GenerarPlanConFiltro(idUsuario, tiempoComida, carbohidratos, proteinas, grasas, fibra, idsFiltrados, esVegano);
                }
                else
                {
                    plan = obj_Plan_BLL.GenerarPlan(idUsuario, tiempoComida, carbohidratos, proteinas, grasas, fibra, esVegano);
                }

                string resultado = "{";
                resultado += "\"TiempoComida\":\"" + tiempoComida + "\",";
                resultado += "\"TotalCarbohidratos\":" + plan.TotalCarbohidratos.ToString().Replace(",", ".") + ",";
                resultado += "\"TotalProteina\":" + plan.TotalProteina.ToString().Replace(",", ".") + ",";
                resultado += "\"TotalGrasa\":" + plan.TotalGrasa.ToString().Replace(",", ".") + ",";
                resultado += "\"TotalFibra\":" + plan.TotalFibra.ToString().Replace(",", ".") + ",";
                resultado += "\"TotalEnergia\":" + plan.TotalEnergia.ToString().Replace(",", ".") + ",";
                resultado += "\"MetaCarbohidratos\":" + carbohidratos.ToString().Replace(",", ".") + ",";
                resultado += "\"MetaProteina\":" + proteinas.ToString().Replace(",", ".") + ",";
                resultado += "\"MetaGrasa\":" + grasas.ToString().Replace(",", ".") + ",";
                resultado += "\"MetaFibra\":" + fibra.ToString().Replace(",", ".") + ",";
                resultado += "\"Alimentos\":[";

                for (int i = 0; i < plan.Alimentos.Count; i++)
                {
                    var alimento = plan.Alimentos[i];
                    resultado += "{";
                    resultado += "\"Id_Alimento\":" + alimento.Id_Alimento + ",";
                    resultado += "\"Nombre\":\"" + alimento.Nombre + "\",";
                    resultado += "\"Categoria\":\"" + alimento.Categoria + "\",";
                    resultado += "\"Porcion_g\":" + alimento.Porcion_g.ToString().Replace(",", ".") + ",";
                    resultado += "\"Factor_Coccion\":" + alimento.Factor_Coccion.ToString().Replace(",", ".") + ",";
                    resultado += "\"Carbohidratos_g\":" + alimento.Carbohidratos_g.ToString().Replace(",", ".") + ",";
                    resultado += "\"Proteina_g\":" + alimento.Proteina_g.ToString().Replace(",", ".") + ",";
                    resultado += "\"Grasa_g\":" + alimento.Grasa_g.ToString().Replace(",", ".") + ",";
                    resultado += "\"Fibra_g\":" + alimento.Fibra_g.ToString().Replace(",", ".") + ",";
                    resultado += "\"Energia_kcal\":" + alimento.Energia_kcal.ToString().Replace(",", ".");
                    resultado += "}";
                    if (i < plan.Alimentos.Count - 1) resultado += ",";
                }

                resultado += "]}";
                return resultado;
            }
            catch (Exception ex)
            {
                return "{\"Error\":\"" + ex.Message + "\"}";
            }
        }

        [WebMethod(EnableSession = true)]
        public static string ObtenerAlimentosJSON(List<string> obj_Parametros_JS)
        {
            if (!cls_Sesion_PL_Helper.EsSesionValida())
                return cls_Sesion_PL_Helper.SinSesion();

            try
            {
                int idUsuario = Convert.ToInt32(obj_Parametros_JS[0]);
                string tiempoComida = obj_Parametros_JS[1].ToString();

                cls_PlanNutricional_BLL obj_Plan_BLL = new cls_PlanNutricional_BLL();
                List<AlimentoDisponible> alimentos;

                if (tiempoComida == "Todos")
                {
                    // ✅ Obtener alimentos de TODOS los tiempos y combinar
                    var todosTiempos = new[] { "Desayuno", "MeriendaAM", "Almuerzo", "MeriendaPM", "Cena" };
                    var alimentosCombinados = new Dictionary<int, AlimentoDisponible>();

                    foreach (var tiempo in todosTiempos)
                    {
                        var alimentosTiempo = obj_Plan_BLL.ObtenerAlimentosDisponibles(idUsuario, tiempo);

                        foreach (var alimento in alimentosTiempo)
                        {
                            // Agregar solo si no existe (evitar duplicados)
                            if (!alimentosCombinados.ContainsKey(alimento.Id_Alimento))
                            {
                                alimentosCombinados.Add(alimento.Id_Alimento, alimento);
                            }
                        }
                    }

                    alimentos = alimentosCombinados.Values.OrderBy(a => a.Categoria).ThenBy(a => a.Nombre).ToList();
                }
                else
                {
                    alimentos = obj_Plan_BLL.ObtenerAlimentosDisponibles(idUsuario, tiempoComida);
                }

                string json = "[";
                for (int i = 0; i < alimentos.Count; i++)
                {
                    var a = alimentos[i];
                    json += "{";
                    json += "\"Id_Alimento\":" + a.Id_Alimento + ",";
                    json += "\"Nombre\":\"" + a.Nombre + "\",";
                    json += "\"Categoria\":\"" + a.Categoria + "\",";
                    json += "\"Macrogrupo\":\"" + a.Macrogrupo + "\",";
                    json += "\"Energia_kcal\":" + a.Energia_kcal.ToString().Replace(",", ".") + ",";
                    json += "\"Proteina_g\":" + a.Proteina_g.ToString().Replace(",", ".") + ",";
                    json += "\"Grasa_g\":" + a.Grasa_g.ToString().Replace(",", ".") + ",";
                    json += "\"Carbohidratos_g\":" + a.Carbohidratos_g.ToString().Replace(",", ".") + ",";
                    json += "\"Fibra_g\":" + a.Fibra_g.ToString().Replace(",", ".") + ",";
                    json += "\"Calcio_mg\":" + a.Calcio_mg.ToString().Replace(",", ".") + ",";
                    json += "\"Fosforo_mg\":" + a.Fosforo_mg.ToString().Replace(",", ".") + ",";
                    json += "\"Hierro_mg\":" + a.Hierro_mg.ToString().Replace(",", ".") + ",";
                    json += "\"Tiamina_mg\":" + a.Tiamina_mg.ToString().Replace(",", ".") + ",";
                    json += "\"Vit_C_mg\":" + a.Vit_C_mg.ToString().Replace(",", ".") + ",";
                    json += "\"Vit_A_ug\":" + a.Vit_A_ug.ToString().Replace(",", ".") + ",";
                    json += "\"Colesterol_mg\":" + a.Colesterol_mg.ToString().Replace(",", ".") + ",";
                    json += "\"Potasio_mg\":" + a.Potasio_mg.ToString().Replace(",", ".") + ",";
                    json += "\"Magnesio_mg\":" + a.Magnesio_mg.ToString().Replace(",", ".") + ",";
                    json += "\"Vit_B6_mg\":" + a.Vit_B6_mg.ToString().Replace(",", ".") + ",";
                    json += "\"Vit_B12_ug\":" + a.Vit_B12_ug.ToString().Replace(",", ".") + ",";
                    json += "\"Agua_g\":" + a.Agua_g.ToString().Replace(",", ".") + ",";
                    json += "\"Ceniza_g\":" + a.Ceniza_g.ToString().Replace(",", ".") + ",";
                    json += "\"Riboflavina_mg\":" + a.Riboflavina_mg.ToString().Replace(",", ".") + ",";
                    json += "\"Ac_Folico_ug\":" + a.Ac_Folico_ug.ToString().Replace(",", ".") + ",";
                    json += "\"Sodio_mg\":" + a.Sodio_mg.ToString().Replace(",", ".") + ",";
                    json += "\"Ac_Grasos_Saturados_g\":" + a.Ac_Grasos_Saturados_g.ToString().Replace(",", ".") + ",";
                    json += "\"Ac_Grasos_Monoinsaturados_g\":" + a.Ac_Grasos_Monoinsaturados_g.ToString().Replace(",", ".") + ",";
                    json += "\"Ac_Grasos_Poliinsaturados_g\":" + a.Ac_Grasos_Poliinsaturados_g.ToString().Replace(",", ".") + ",";
                    json += "\"Zinc_mg\":" + a.Zinc_mg.ToString().Replace(",", ".") + ",";
                    json += "\"Niacina_mg\":" + a.Niacina_mg.ToString().Replace(",", ".") + ",";
                    json += "\"Folato_ug\":" + a.Folato_ug.ToString().Replace(",", ".") + ",";
                    json += "\"Marca\":\"" + a.Marca + "\",";
                    json += "\"Presentacion\":\"" + a.Presentacion + "\",";
                    json += "\"Fraccion_Comestible\":" + a.Fraccion_Comestible.ToString().Replace(",", ".");
                    json += "}";
                    if (i < alimentos.Count - 1) json += ",";
                }
                json += "]";
                return json;
            }
            catch (Exception ex)
            {
                return "Error: " + ex.Message;
            }
        }

        /// <summary>
        /// Retorna TODOS los alimentos con macros completos para la tab "Lista de Macronutrientes".
        /// No requiere usuario ni tiempo de comida — sin filtro de despensa.
        /// </summary>
        [WebMethod(EnableSession = true)]
        public static string ObtenerListaAlimentosJSON(List<string> obj_Parametros_JS)
        {
            if (!cls_Sesion_PL_Helper.EsSesionValida())
                return cls_Sesion_PL_Helper.SinSesion();

            try
            {
                cls_PlanNutricional_BLL obj_Plan_BLL = new cls_PlanNutricional_BLL();
                List<AlimentoDisponible> alimentos = obj_Plan_BLL.ObtenerTodosAlimentosParaLista();

                string json = "[";
                for (int i = 0; i < alimentos.Count; i++)
                {
                    var a = alimentos[i];
                    json += "{";
                    json += "\"Id_Alimento\":" + a.Id_Alimento + ",";
                    json += "\"Nombre\":\"" + a.Nombre + "\",";
                    json += "\"Categoria\":\"" + a.Categoria + "\",";
                    json += "\"Macrogrupo\":\"" + a.Macrogrupo + "\",";
                    json += "\"Energia_kcal\":" + a.Energia_kcal.ToString().Replace(",", ".") + ",";
                    json += "\"Proteina_g\":" + a.Proteina_g.ToString().Replace(",", ".") + ",";
                    json += "\"Grasa_g\":" + a.Grasa_g.ToString().Replace(",", ".") + ",";
                    json += "\"Carbohidratos_g\":" + a.Carbohidratos_g.ToString().Replace(",", ".") + ",";
                    json += "\"Fibra_g\":" + a.Fibra_g.ToString().Replace(",", ".") + ",";
                    json += "\"Calcio_mg\":" + a.Calcio_mg.ToString().Replace(",", ".") + ",";
                    json += "\"Fosforo_mg\":" + a.Fosforo_mg.ToString().Replace(",", ".") + ",";
                    json += "\"Hierro_mg\":" + a.Hierro_mg.ToString().Replace(",", ".") + ",";
                    json += "\"Tiamina_mg\":" + a.Tiamina_mg.ToString().Replace(",", ".") + ",";
                    json += "\"Vit_C_mg\":" + a.Vit_C_mg.ToString().Replace(",", ".") + ",";
                    json += "\"Vit_A_ug\":" + a.Vit_A_ug.ToString().Replace(",", ".") + ",";
                    json += "\"Colesterol_mg\":" + a.Colesterol_mg.ToString().Replace(",", ".") + ",";
                    json += "\"Potasio_mg\":" + a.Potasio_mg.ToString().Replace(",", ".") + ",";
                    json += "\"Magnesio_mg\":" + a.Magnesio_mg.ToString().Replace(",", ".") + ",";
                    json += "\"Vit_B6_mg\":" + a.Vit_B6_mg.ToString().Replace(",", ".") + ",";
                    json += "\"Vit_B12_ug\":" + a.Vit_B12_ug.ToString().Replace(",", ".") + ",";
                    json += "\"Agua_g\":" + a.Agua_g.ToString().Replace(",", ".") + ",";
                    json += "\"Ceniza_g\":" + a.Ceniza_g.ToString().Replace(",", ".") + ",";
                    json += "\"Riboflavina_mg\":" + a.Riboflavina_mg.ToString().Replace(",", ".") + ",";
                    json += "\"Ac_Folico_ug\":" + a.Ac_Folico_ug.ToString().Replace(",", ".") + ",";
                    json += "\"Sodio_mg\":" + a.Sodio_mg.ToString().Replace(",", ".") + ",";
                    json += "\"Ac_Grasos_Saturados_g\":" + a.Ac_Grasos_Saturados_g.ToString().Replace(",", ".") + ",";
                    json += "\"Ac_Grasos_Monoinsaturados_g\":" + a.Ac_Grasos_Monoinsaturados_g.ToString().Replace(",", ".") + ",";
                    json += "\"Ac_Grasos_Poliinsaturados_g\":" + a.Ac_Grasos_Poliinsaturados_g.ToString().Replace(",", ".") + ",";
                    json += "\"Zinc_mg\":" + a.Zinc_mg.ToString().Replace(",", ".") + ",";
                    json += "\"Niacina_mg\":" + a.Niacina_mg.ToString().Replace(",", ".") + ",";
                    json += "\"Folato_ug\":" + a.Folato_ug.ToString().Replace(",", ".") + ",";
                    json += "\"Marca\":\"" + a.Marca + "\",";
                    json += "\"Presentacion\":\"" + a.Presentacion + "\",";
                    json += "\"Fraccion_Comestible\":" + a.Fraccion_Comestible.ToString().Replace(",", ".");
                    json += "}";
                    if (i < alimentos.Count - 1) json += ",";
                }
                json += "]";
                return json;
            }
            catch (Exception ex)
            {
                return "Error: " + ex.Message;
            }
        }

        [WebMethod(EnableSession = true)]
        public static string CambiarAlimento(List<string> obj_Parametros_JS)
        {
            if (!cls_Sesion_PL_Helper.EsSesionValida())
                return cls_Sesion_PL_Helper.SinSesion();

            try
            {
                int idUsuario = Convert.ToInt32(obj_Parametros_JS[0]);
                string tiempoComida = obj_Parametros_JS[1];
                string categoriaNueva = obj_Parametros_JS[2];
                int idOriginal = Convert.ToInt32(obj_Parametros_JS[3]);
                string idsEnPlanStr = obj_Parametros_JS[4];
                string idsFiltroStr = obj_Parametros_JS.Count > 5 ? obj_Parametros_JS[5] : "";

                // Estos valores YA son "lo que falta"
                decimal faltaCarb = Convert.ToDecimal(obj_Parametros_JS[6].Replace(".", ","));
                decimal faltaProt = Convert.ToDecimal(obj_Parametros_JS[7].Replace(".", ","));
                decimal faltaGras = Convert.ToDecimal(obj_Parametros_JS[8].Replace(".", ","));
                decimal faltaFibr = Convert.ToDecimal(obj_Parametros_JS[9].Replace(".", ","));
                bool esVegano     = obj_Parametros_JS.Count > 10 && obj_Parametros_JS[10] == "1";

                var idsEnPlan = idsEnPlanStr.Split(',')
                    .Where(s => !string.IsNullOrEmpty(s))
                    .Select(int.Parse).ToList();

                var idsFiltro = string.IsNullOrEmpty(idsFiltroStr)
                    ? new List<int>()
                    : idsFiltroStr.Split(',').Where(s => !string.IsNullOrEmpty(s)).Select(int.Parse).ToList();

                // En modo vegano se bloquea la selección de proteínas animales/lácteos
                if (esVegano && (categoriaNueva == "Proteínas animales" || categoriaNueva == "Lácteos y derivados"))
                    return "Error: En modo vegano no se permiten proteínas animales ni lácteos";

                cls_PlanNutricional_BLL obj_Plan_BLL = new cls_PlanNutricional_BLL();
                List<AlimentoDisponible> todosAlimentos = obj_Plan_BLL.ObtenerAlimentosDisponibles(idUsuario, tiempoComida);

                // CORRECCIÓN: categoriaNueva es un Macrogrupo, no una Categoría
                var candidatos = todosAlimentos
                    .Where(a => a.Macrogrupo == categoriaNueva
                             && a.Id_Alimento != idOriginal
                             && !idsEnPlan.Contains(a.Id_Alimento)
                             && (idsFiltro.Count == 0 || idsFiltro.Contains(a.Id_Alimento)))
                    .OrderBy(x => Guid.NewGuid())
                    .ToList();

                if (!candidatos.Any())
                    return "Error: No hay alimentos disponibles de esa categoría";

                var elegido = candidatos.First();

                decimal porcion = CalcularPorcionParaCambio(elegido,
                    faltaCarb, faltaProt, faltaGras, faltaFibr);

                decimal fc = elegido.Fraccion_Comestible > 0 ? elegido.Fraccion_Comestible : 1.0m;
                decimal porcionComestible = porcion * fc;

                decimal carbAporte = Math.Round((elegido.Carbohidratos_g / 100m) * porcionComestible, 2);
                decimal protAporte = Math.Round((elegido.Proteina_g / 100m) * porcionComestible, 2);
                decimal grasAporte = Math.Round((elegido.Grasa_g / 100m) * porcionComestible, 2);
                decimal fibrAporte = Math.Round((elegido.Fibra_g / 100m) * porcionComestible, 2);
                decimal enerAporte = Math.Round((elegido.Energia_kcal / 100m) * porcionComestible, 2);

                decimal maxPermitido = 1.25m;

                if (carbAporte > faltaCarb * maxPermitido ||
                    protAporte > faltaProt * maxPermitido ||
                    grasAporte > faltaGras * maxPermitido ||
                    fibrAporte > faltaFibr * maxPermitido)
                {
                    decimal factorAjuste = Math.Min(
                        Math.Min(faltaCarb > 0 ? (faltaCarb * maxPermitido) / carbAporte : 1m,
                                 faltaProt > 0 ? (faltaProt * maxPermitido) / protAporte : 1m),
                        Math.Min(faltaGras > 0 ? (faltaGras * maxPermitido) / grasAporte : 1m,
                                 faltaFibr > 0 ? (faltaFibr * maxPermitido) / fibrAporte : 1m)
                    );

                    porcion = Math.Round(porcion * factorAjuste, 1);
                    porcionComestible = porcion * fc;

                    carbAporte = Math.Round((elegido.Carbohidratos_g / 100m) * porcionComestible, 2);
                    protAporte = Math.Round((elegido.Proteina_g / 100m) * porcionComestible, 2);
                    grasAporte = Math.Round((elegido.Grasa_g / 100m) * porcionComestible, 2);
                    fibrAporte = Math.Round((elegido.Fibra_g / 100m) * porcionComestible, 2);
                    enerAporte = Math.Round((elegido.Energia_kcal / 100m) * porcionComestible, 2);
                }

                bool esArrozCrudo = elegido.Nombre.ToLowerInvariant().Contains("arroz")
                    && !elegido.Nombre.ToLowerInvariant().Contains("cocido")
                    && !elegido.Nombre.ToLowerInvariant().Contains("precocido");
                decimal factorCoccion = esArrozCrudo ? 2.8m : 1.0m;

                string resultado = "{";
                resultado += "\"Id_Alimento\":" + elegido.Id_Alimento + ",";
                resultado += "\"Nombre\":\"" + elegido.Nombre + "\",";
                resultado += "\"Categoria\":\"" + elegido.Categoria + "\",";
                resultado += "\"Porcion_g\":" + Math.Round(porcion, 1).ToString().Replace(",", ".") + ",";
                resultado += "\"Factor_Coccion\":" + factorCoccion.ToString().Replace(",", ".") + ",";
                resultado += "\"Carbohidratos_g\":" + carbAporte.ToString().Replace(",", ".") + ",";
                resultado += "\"Proteina_g\":" + protAporte.ToString().Replace(",", ".") + ",";
                resultado += "\"Grasa_g\":" + grasAporte.ToString().Replace(",", ".") + ",";
                resultado += "\"Fibra_g\":" + fibrAporte.ToString().Replace(",", ".") + ",";
                resultado += "\"Energia_kcal\":" + enerAporte.ToString().Replace(",", ".");
                resultado += "}";
                return resultado;
            }
            catch (Exception ex)
            {
                return "Error: " + ex.Message;
            }
        }

        // ====================================================================
        // DESPENSA DE USUARIO
        // ====================================================================

        /// <summary>
        /// Retorna HTML con TODOS los alimentos agrupados por Macrogrupo.
        /// Los alimentos ya guardados en la despensa del usuario aparecen pre-marcados.
        /// [0] idUsuario
        /// </summary>
        [WebMethod(EnableSession = true)]
        public static string CargarAlimentosDespensa(List<string> obj_Parametros_JS)
        {
            if (!cls_Sesion_PL_Helper.EsSesionValida())
                return cls_Sesion_PL_Helper.SinSesion();

            try
            {
                int idUsuario = Convert.ToInt32(obj_Parametros_JS[0]);

                // 1. Obtener todos los alimentos (sin filtro de usuario/tiempo)
                cls_Alimentos_DAL obj_Ali_DAL = new cls_Alimentos_DAL();
                cls_Alimentos_BLL obj_Ali_BLL = new cls_Alimentos_BLL();
                obj_Ali_BLL.listarFiltrarAlimentos(ref obj_Ali_DAL);

                // 2. Obtener IDs ya guardados en la despensa del usuario
                cls_Despensa_DAL obj_Des_DAL = new cls_Despensa_DAL();
                cls_Despensa_BLL obj_Des_BLL = new cls_Despensa_BLL();
                obj_Des_DAL.iId_Usuario = idUsuario;
                obj_Des_BLL.CargarDespensa(ref obj_Des_DAL);

                var idsDespensa = new System.Collections.Generic.HashSet<int>();
                if (obj_Des_DAL.dtDatos != null)
                {
                    foreach (DataRow r in obj_Des_DAL.dtDatos.Rows)
                        idsDespensa.Add(Convert.ToInt32(r[0]));
                }

                if (obj_Ali_DAL.dtDatos == null || obj_Ali_DAL.dtDatos.Rows.Count == 0)
                    return "<p class='text-muted'>No hay alimentos registrados.</p>";

                // 3. Agrupar por Macrogrupo
                // SP listar devuelve: [0]=Id [1]=Nombre [2..6]=macros [7]=Categoria [8]=Macrogrupo [9]=Marca
                var grupos = new System.Collections.Generic.SortedDictionary<string, System.Collections.Generic.List<DataRow>>();
                foreach (DataRow row in obj_Ali_DAL.dtDatos.Rows)
                {
                    string macro = row[8] != DBNull.Value && row[8].ToString() != string.Empty
                        ? row[8].ToString()
                        : "Sin clasificar";
                    if (!grupos.ContainsKey(macro))
                        grupos[macro] = new System.Collections.Generic.List<DataRow>();
                    grupos[macro].Add(row);
                }

                // Íconos y colores por Macrogrupo
                var estilosMacro = new System.Collections.Generic.Dictionary<string, string[]>
                {
                    { "Lácteos y derivados", new[] { "🥛", "#e8f4fd" } },
                    { "Proteínas animales",  new[] { "🍗", "#fce8e8" } },
                    { "Vegetales",           new[] { "🥦", "#e6f5e6" } },
                    { "Grasas y semillas",   new[] { "🥑", "#f0f7e6" } },
                    { "Frutas",              new[] { "🍎", "#fce8f0" } },
                    { "Cereales y harinas",  new[] { "🍞", "#fef5e7" } },
                    { "Azúcares y dulces",   new[] { "🍯", "#fef9e0" } },
                    { "Sin clasificar",      new[] { "🍽️", "#f0f0f0" } }
                };

                // 4. Generar HTML con grid 2x2 para mejor uso del espacio
                string html = "";
                int colCount = 0;
                string[] columnas = new string[2]; // Para almacenar las 2 columnas del grid actual

                foreach (var grupo in grupos)
                {
                    // Empezar una nueva fila cada 2 grupos
                    if (colCount == 0)
                    {
                        html += "<div class='gp-fila-grid' style='display:flex; gap:1rem; margin-bottom:0.5rem;'>";
                    }
                    
                    string[] estilo = estilosMacro.ContainsKey(grupo.Key)
                        ? estilosMacro[grupo.Key]
                        : new[] { "🍽️", "#f0f0f0" };

                    // Generar el HTML para este grupo
                    string grupoHtml = "";
                    grupoHtml += "<div class='gp-food-group' style='flex:1; min-width:0;'>";
                    grupoHtml += "<div class='gp-fg-header' onclick='this.parentElement.classList.toggle(\"open\")'>";
                    grupoHtml += "<div class='gp-fg-left'>";
                    grupoHtml += "<div class='gp-fg-icon' style='background:" + estilo[1] + "; width:36px; height:36px; border-radius:50%; display:flex; align-items:center; justify-content:center;'>" + estilo[0] + "</div>";
                    grupoHtml += "<div><div class='gp-fg-title'>" + System.Web.HttpUtility.HtmlEncode(grupo.Key) + "</div>";
                    grupoHtml += "<div class='gp-fg-count'>" + grupo.Value.Count + " alimentos</div></div></div>";
                    grupoHtml += "<span class='gp-fg-chevron'>▾</span></div>";
                    grupoHtml += "<div class='gp-fg-body'><div class='gp-fg-subcategory'>";

                    foreach (DataRow row in grupo.Value)
                    {
                        int    idAlim   = Convert.ToInt32(row[0]);
                        string nombre   = System.Web.HttpUtility.HtmlEncode(row[1].ToString());
                        string marca    = row[9] != DBNull.Value && row[9].ToString() != string.Empty
                                          ? " <small style='color:#6c757d;'>(" + System.Web.HttpUtility.HtmlEncode(row[9].ToString()) + ")</small>"
                                          : "";
                        bool   preCheck = idsDespensa.Contains(idAlim);

                        grupoHtml += "<div class='gp-food-item-check" + (preCheck ? " selected" : "") + "' " +
                                     "onclick='this.classList.toggle(\"selected\"); var c=this.querySelector(\".chk-despensa\"); c.checked=!c.checked; c.dispatchEvent(new Event(\"change\",{bubbles:true}))'>";
                        grupoHtml += "<div class='gp-check-box'>" + (preCheck ? "✓" : "") + "</div>";
                        grupoHtml += "<input type='checkbox' class='chk-despensa' value='" + idAlim + "'" +
                                     (preCheck ? " checked" : "") + " style='display:none;'>";
                        grupoHtml += "<span class='gp-food-name'>" + nombre + marca + "</span>";
                        grupoHtml += "</div>";
                    }

                    grupoHtml += "</div></div></div>";

                    // Agregar el grupo a la columna actual
                    columnas[colCount] = grupoHtml;
                    colCount++;

                    // Si ya llenamos las 2 columnas, agregar la fila al HTML y resetear
                    if (colCount == 2)
                    {
                        html += columnas[0] + columnas[1] + "</div>"; // Cerrar el div de fila
                        colCount = 0; // Reset para la próxima fila
                    }
                }

                // Si quedó una columna sin completar (número impar de grupos), agregarla igual
                if (colCount == 1)
                {
                    html += columnas[0] + "<div style='flex:1; min-width:0;'></div></div>"; // Columna vacía para completar el grid
                }

                return html;
            }
            catch (Exception ex) { return "Error: " + ex.Message; }
        }

        /// <summary>
        /// Guarda (reemplaza) la despensa del usuario.
        /// [0] idUsuario  [1] idsAlimentos separados por coma (vacío = limpiar)
        /// </summary>
        [WebMethod(EnableSession = true)]
        public static string GuardarDespensa(List<string> obj_Parametros_JS)
        {
            if (!cls_Sesion_PL_Helper.EsSesionValida())
                return cls_Sesion_PL_Helper.SinSesion();

            try
            {
                cls_Despensa_DAL obj_DAL = new cls_Despensa_DAL();
                cls_Despensa_BLL obj_BLL = new cls_Despensa_BLL();

                obj_DAL.iId_Usuario    = Convert.ToInt32(obj_Parametros_JS[0]);
                obj_DAL.sIds_Alimentos = obj_Parametros_JS.Count > 1 ? obj_Parametros_JS[1] : string.Empty;

                obj_BLL.GuardarDespensa(ref obj_DAL);

                return obj_DAL.sValorScalar == "1"
                    ? "1<SPLITER>Despensa guardada correctamente."
                    : "0<SPLITER>Error al guardar la despensa.";
            }
            catch (Exception ex) { return "0<SPLITER>" + ex.Message; }
        }

        /// <summary>
        /// Retorna los IDs de alimentos en la despensa del usuario como string separado por comas.
        /// [0] idUsuario
        /// </summary>
        [WebMethod(EnableSession = true)]
        public static string ObtenerIdsDespensa(List<string> obj_Parametros_JS)
        {
            if (!cls_Sesion_PL_Helper.EsSesionValida())
                return cls_Sesion_PL_Helper.SinSesion();

            try
            {
                cls_Despensa_DAL obj_DAL = new cls_Despensa_DAL();
                cls_Despensa_BLL obj_BLL = new cls_Despensa_BLL();

                obj_DAL.iId_Usuario = Convert.ToInt32(obj_Parametros_JS[0]);
                obj_BLL.CargarDespensa(ref obj_DAL);

                if (obj_DAL.dtDatos == null || obj_DAL.dtDatos.Rows.Count == 0)
                    return string.Empty;

                var ids = new System.Collections.Generic.List<string>();
                foreach (DataRow r in obj_DAL.dtDatos.Rows)
                    ids.Add(r[0].ToString());

                return string.Join(",", ids);
            }
            catch (Exception ex) { return "Error: " + ex.Message; }
        }

        private static decimal CalcularPorcionParaCambio(AlimentoDisponible a,
             decimal mc, decimal mp, decimal mg, decimal mf)
        {
            // Igual que CalcularPorcionOptima en BLL: devuelve peso BRUTO aplicando FC
            decimal fc = a.Fraccion_Comestible > 0 ? a.Fraccion_Comestible : 1.0m;
            decimal pC = (a.Carbohidratos_g * fc) > 0 ? (mc / (a.Carbohidratos_g * fc)) * 100 : decimal.MaxValue;
            decimal pP = (a.Proteina_g * fc) > 0 ? (mp / (a.Proteina_g * fc)) * 100 : decimal.MaxValue;
            decimal pG = (a.Grasa_g * fc) > 0 ? (mg / (a.Grasa_g * fc)) * 100 : decimal.MaxValue;
            decimal pF = (a.Fibra_g * fc) > 0 ? (mf / (a.Fibra_g * fc)) * 100 : decimal.MaxValue;

            decimal porcion = Math.Min(Math.Min(pC, pP), Math.Min(pG, pF));

            if (porcion == decimal.MaxValue || porcion <= 0) porcion = 50;
            if (porcion < 25) porcion = 25;
            if (porcion > 250) porcion = 250; // ✅ Límite razonable

            return porcion;
        }

        [WebMethod(EnableSession = true)]
        public static string ObtenerDistribucionUltimaCita(List<string> obj_Parametros_JS)
        {
            if (!cls_Sesion_PL_Helper.EsSesionValida())
                return cls_Sesion_PL_Helper.SinSesion();

            try
            {
                // [0] idUsuario  [1] tiempoComida
                int    iIdUsuario   = Convert.ToInt32(obj_Parametros_JS[0]);
                string sTiempoComida = obj_Parametros_JS[1];

                cls_DistribucionMacros_DAL obj_Dist_DAL = new cls_DistribucionMacros_DAL();
                cls_DistribucionMacros_BLL obj_Dist_BLL = new cls_DistribucionMacros_BLL();
                obj_Dist_DAL.iId_Usuario = iIdUsuario;
                obj_Dist_BLL.ObtenerUltimaDistribucion(ref obj_Dist_DAL);

                if (obj_Dist_DAL.dtDatos == null || obj_Dist_DAL.dtDatos.Rows.Count == 0)
                {
                    string sMotivoVacio = !string.IsNullOrEmpty(obj_Dist_DAL.sMSJError)
                        ? "Error de base de datos: " + obj_Dist_DAL.sMSJError
                        : "No hay distribuciones registradas para este usuario.";
                    return "0<SPLITER>" + sMotivoVacio;
                }

                DataRow r = obj_Dist_DAL.dtDatos.Rows[0];

                // Seleccionar columnas según el tiempo de comida
                // Usar InvariantCulture para evitar comas decimales en culturas españolas
                var ic = System.Globalization.CultureInfo.InvariantCulture;
                string sPrefix = sTiempoComida; // Desayuno | MeriendaAM | Almuerzo | MeriendaPM | Cena

                string sCHO   = r[sPrefix + "_CHO_g"]   != DBNull.Value ? Convert.ToDecimal(r[sPrefix + "_CHO_g"]).ToString(ic)   : "0";
                string sProt  = r[sPrefix + "_Prot_g"]  != DBNull.Value ? Convert.ToDecimal(r[sPrefix + "_Prot_g"]).ToString(ic)  : "0";
                string sGrasa = r[sPrefix + "_Grasa_g"] != DBNull.Value ? Convert.ToDecimal(r[sPrefix + "_Grasa_g"]).ToString(ic) : "0";
                string sFibra = r[sPrefix + "_Fibra_g"] != DBNull.Value ? Convert.ToDecimal(r[sPrefix + "_Fibra_g"]).ToString(ic) : "0";

                string sFecha = r["Fecha_Registro"] != DBNull.Value
                    ? Convert.ToDateTime(r["Fecha_Registro"]).ToString("dd/MM/yyyy")
                    : "";

                return "1<SPLITER>" + sCHO + "<SPLITER>" + sProt + "<SPLITER>" + sGrasa + "<SPLITER>" + sFibra + "<SPLITER>" + sFecha;
            }
            catch (Exception ex) { return "0<SPLITER>" + ex.Message; }
        }

        [WebMethod(EnableSession = true)]
        public static string EnviarPlanPorCorreo(List<string> obj_Parametros_JS)
        {
            if (!cls_Sesion_PL_Helper.EsSesionValida())
                return cls_Sesion_PL_Helper.SinSesion();

            try
            {
                // [0] idUsuario  [1] idMedico  [2] tiempoComida  [3] planJSON
                int    iIdUsuario    = Convert.ToInt32(obj_Parametros_JS[0]);
                int    iIdMedico     = Convert.ToInt32(obj_Parametros_JS[1]);
                string sTiempoComida = obj_Parametros_JS[2];
                string sPlanJson     = obj_Parametros_JS[3];

                // Datos del paciente
                cls_Usuarios_DAL obj_Usr_DAL = new cls_Usuarios_DAL();
                cls_Usuarios_BLL obj_Usr_BLL = new cls_Usuarios_BLL();
                obj_Usr_DAL.iId_Usuario = iIdUsuario;
                obj_Usr_BLL.Obtiene_Informacion_Usuarios(ref obj_Usr_DAL);

                if (obj_Usr_DAL.dtDatos == null || obj_Usr_DAL.dtDatos.Rows.Count == 0)
                    return "0<SPLITER>No se encontró el usuario.";

                DataRow rUsr         = obj_Usr_DAL.dtDatos.Rows[0];
                // [0]Id_Usuario [1]Nombre [2]Prim_Apellido [3]Seg_Apellido [4]Cedula
                // [5]FechaNacimiento [6]Sexo [7]Telefono [8]Correo [9]Observaciones [10]Estado
                string  sCorreoUsr   = rUsr[8].ToString();   // Correo
                string  sNombreUsr   = (rUsr[1] + " " + rUsr[2] + " " + rUsr[3]).Trim();

                // Si no se recibió idMedico, obtenerlo de la última distribución del paciente
                if (iIdMedico == 0)
                {
                    cls_DistribucionMacros_DAL obj_Dist_DAL = new cls_DistribucionMacros_DAL();
                    cls_DistribucionMacros_BLL obj_Dist_BLL = new cls_DistribucionMacros_BLL();
                    obj_Dist_DAL.iId_Usuario = iIdUsuario;
                    obj_Dist_BLL.ObtenerUltimaDistribucion(ref obj_Dist_DAL);
                    if (obj_Dist_DAL.dtDatos != null && obj_Dist_DAL.dtDatos.Rows.Count > 0)
                        iIdMedico = Convert.ToInt32(obj_Dist_DAL.dtDatos.Rows[0]["Id_Medico"]);
                }

                // Datos del médico (logo)
                cls_Medicos_DAL obj_Med_DAL = new cls_Medicos_DAL();
                cls_Medicos_BLL obj_Med_BLL = new cls_Medicos_BLL();
                obj_Med_DAL.iId_Medico = iIdMedico;
                obj_Med_BLL.Obtiene_Informacion_Medicos(ref obj_Med_DAL);

                string sLogoUrl     = "";
                string sNombreMed   = "";
                if (obj_Med_DAL.dtDatos != null && obj_Med_DAL.dtDatos.Rows.Count > 0)
                {
                    DataRow rMed = obj_Med_DAL.dtDatos.Rows[0];
                    sLogoUrl   = rMed["Logo_Url"]      != DBNull.Value ? rMed["Logo_Url"].ToString()      : "";
                    sNombreMed = (rMed["Nombre"] + " " + rMed["Prim_Apellido"] + " " + rMed["Seg_Apellido"]).Trim();
                }

                cls_Email_Helper.EnviarPlanNutricional(
                    sCorreoUsr, sNombreUsr, sNombreMed, sLogoUrl, sTiempoComida, sPlanJson);

                return "1<SPLITER>Plan enviado correctamente a " + sCorreoUsr;
            }
            catch (Exception ex) { return "0<SPLITER>" + ex.Message; }
        }

        /// <summary>
        /// Envía múltiples planes nutricionales (todos los tiempos de comida de la sesión) en un solo correo.
        /// [0] idUsuario  [1] idMedico (0=auto)  [2] planesJSON (array de planes)
        /// </summary>
        [WebMethod(EnableSession = true)]
        public static string EnviarMultiplesPlansPorCorreo(List<string> obj_Parametros_JS)
        {
            if (!cls_Sesion_PL_Helper.EsSesionValida())
                return cls_Sesion_PL_Helper.SinSesion();

            try
            {
                int    iIdUsuario = Convert.ToInt32(obj_Parametros_JS[0]);
                int    iIdMedico  = Convert.ToInt32(obj_Parametros_JS[1]);
                string sPlanesJson = obj_Parametros_JS[2];

                // Datos del paciente
                cls_Usuarios_DAL obj_Usr_DAL = new cls_Usuarios_DAL();
                cls_Usuarios_BLL obj_Usr_BLL = new cls_Usuarios_BLL();
                obj_Usr_DAL.iId_Usuario = iIdUsuario;
                obj_Usr_BLL.Obtiene_Informacion_Usuarios(ref obj_Usr_DAL);

                if (obj_Usr_DAL.dtDatos == null || obj_Usr_DAL.dtDatos.Rows.Count == 0)
                    return "0<SPLITER>No se encontró el usuario.";

                DataRow rUsr       = obj_Usr_DAL.dtDatos.Rows[0];
                string  sCorreoUsr = rUsr[8].ToString();
                string  sNombreUsr = (rUsr[1] + " " + rUsr[2] + " " + rUsr[3]).Trim();

                // Resolver médico si no se recibió
                if (iIdMedico == 0)
                {
                    cls_DistribucionMacros_DAL obj_Dist_DAL = new cls_DistribucionMacros_DAL();
                    cls_DistribucionMacros_BLL obj_Dist_BLL = new cls_DistribucionMacros_BLL();
                    obj_Dist_DAL.iId_Usuario = iIdUsuario;
                    obj_Dist_BLL.ObtenerUltimaDistribucion(ref obj_Dist_DAL);
                    if (obj_Dist_DAL.dtDatos != null && obj_Dist_DAL.dtDatos.Rows.Count > 0)
                        iIdMedico = Convert.ToInt32(obj_Dist_DAL.dtDatos.Rows[0]["Id_Medico"]);
                }

                // Datos del médico (logo)
                cls_Medicos_DAL obj_Med_DAL = new cls_Medicos_DAL();
                cls_Medicos_BLL obj_Med_BLL = new cls_Medicos_BLL();
                obj_Med_DAL.iId_Medico = iIdMedico;
                obj_Med_BLL.Obtiene_Informacion_Medicos(ref obj_Med_DAL);

                string sLogoUrl   = "";
                string sNombreMed = "";
                if (obj_Med_DAL.dtDatos != null && obj_Med_DAL.dtDatos.Rows.Count > 0)
                {
                    DataRow rMed = obj_Med_DAL.dtDatos.Rows[0];
                    sLogoUrl   = rMed["Logo_Url"] != DBNull.Value ? rMed["Logo_Url"].ToString() : "";
                    sNombreMed = (rMed["Nombre"] + " " + rMed["Prim_Apellido"] + " " + rMed["Seg_Apellido"]).Trim();
                }

                // Contar planes para el mensaje de éxito
                dynamic planes = Newtonsoft.Json.JsonConvert.DeserializeObject(sPlanesJson);
                int iCantPlanes = 0;
                foreach (var _ in planes) iCantPlanes++;

                cls_Email_Helper.EnviarMultiplesPlanesNutricionales(
                    sCorreoUsr, sNombreUsr, sNombreMed, sLogoUrl, sPlanesJson);

                return "1<SPLITER>" + iCantPlanes + " plan" + (iCantPlanes > 1 ? "es enviados" : " enviado") + " correctamente a " + sCorreoUsr;
            }
            catch (Exception ex) { return "0<SPLITER>" + ex.Message; }
        }

        [WebMethod(EnableSession = true)]
        public static string EnviarRecetaPorCorreo(List<string> obj_Parametros_JS)
        {
            if (!cls_Sesion_PL_Helper.EsSesionValida())
                return cls_Sesion_PL_Helper.SinSesion();

            try
            {
                // [0] idUsuario  [1] idMedico  [2] recetaTexto
                int    iIdUsuario  = Convert.ToInt32(obj_Parametros_JS[0]);
                int    iIdMedico   = Convert.ToInt32(obj_Parametros_JS[1]);
                string sReceta     = obj_Parametros_JS[2];

                cls_Usuarios_DAL obj_Usr_DAL = new cls_Usuarios_DAL();
                cls_Usuarios_BLL obj_Usr_BLL = new cls_Usuarios_BLL();
                obj_Usr_DAL.iId_Usuario = iIdUsuario;
                obj_Usr_BLL.Obtiene_Informacion_Usuarios(ref obj_Usr_DAL);

                if (obj_Usr_DAL.dtDatos == null || obj_Usr_DAL.dtDatos.Rows.Count == 0)
                    return "0<SPLITER>No se encontró el usuario.";

                DataRow rUsr       = obj_Usr_DAL.dtDatos.Rows[0];
                // [0]Id_Usuario [1]Nombre [2]Prim_Apellido [3]Seg_Apellido [4]Cedula
                // [5]FechaNacimiento [6]Sexo [7]Telefono [8]Correo [9]Observaciones [10]Estado
                string  sCorreoUsr = rUsr[8].ToString();
                string  sNombreUsr = (rUsr[1] + " " + rUsr[2] + " " + rUsr[3]).Trim();

                // Si no se recibió idMedico, obtenerlo de la última distribución del paciente
                if (iIdMedico == 0)
                {
                    cls_DistribucionMacros_DAL obj_Dist_DAL = new cls_DistribucionMacros_DAL();
                    cls_DistribucionMacros_BLL obj_Dist_BLL = new cls_DistribucionMacros_BLL();
                    obj_Dist_DAL.iId_Usuario = iIdUsuario;
                    obj_Dist_BLL.ObtenerUltimaDistribucion(ref obj_Dist_DAL);
                    if (obj_Dist_DAL.dtDatos != null && obj_Dist_DAL.dtDatos.Rows.Count > 0)
                        iIdMedico = Convert.ToInt32(obj_Dist_DAL.dtDatos.Rows[0]["Id_Medico"]);
                }

                cls_Medicos_DAL obj_Med_DAL = new cls_Medicos_DAL();
                cls_Medicos_BLL obj_Med_BLL = new cls_Medicos_BLL();
                obj_Med_DAL.iId_Medico = iIdMedico;
                obj_Med_BLL.Obtiene_Informacion_Medicos(ref obj_Med_DAL);

                string sLogoUrl   = "";
                string sNombreMed = "";
                if (obj_Med_DAL.dtDatos != null && obj_Med_DAL.dtDatos.Rows.Count > 0)
                {
                    DataRow rMed = obj_Med_DAL.dtDatos.Rows[0];
                    sLogoUrl   = rMed["Logo_Url"]      != DBNull.Value ? rMed["Logo_Url"].ToString()      : "";
                    sNombreMed = (rMed["Nombre"] + " " + rMed["Prim_Apellido"] + " " + rMed["Seg_Apellido"]).Trim();
                }

                cls_Email_Helper.EnviarRecetaIA(
                    sCorreoUsr, sNombreUsr, sNombreMed, sLogoUrl, sReceta);

                return "1<SPLITER>Receta enviada correctamente a " + sCorreoUsr;
            }
            catch (Exception ex) { return "0<SPLITER>" + ex.Message; }
        }

        [WebMethod(EnableSession = true)]
        public static string GenerarRecetaIA(List<string> obj_Parametros_JS)
        {
            if (!cls_Sesion_PL_Helper.EsSesionValida())
                return cls_Sesion_PL_Helper.SinSesion();

            try
            {
                string prompt = obj_Parametros_JS[0];
                string apiKey = ConfigurationManager.AppSettings["AnthropicApiKey"];
                string url = "https://api.anthropic.com/v1/messages";

                // ✅ CORRECCIÓN: Escapar correctamente el JSON
                var promptEscapado = prompt
                    .Replace("\\", "\\\\")
                    .Replace("\"", "\\\"")
                    .Replace("\r", "")
                    .Replace("\n", "\\n")
                    .Replace("\t", " ");

                var requestBody = new
                {
                    model = "claude-sonnet-4-20250514",
                    max_tokens = 2000,
                    messages = new[]
                    {
                new
                {
                    role = "user",
                    content = promptEscapado
                }
            }
                };

                // ✅ Serializar con Newtonsoft.Json
                string jsonBody = Newtonsoft.Json.JsonConvert.SerializeObject(requestBody);

                System.Net.HttpWebRequest request = (System.Net.HttpWebRequest)System.Net.WebRequest.Create(url);
                request.Method = "POST";
                request.ContentType = "application/json";
                request.Headers.Add("x-api-key", apiKey);
                request.Headers.Add("anthropic-version", "2023-06-01");

                byte[] bodyBytes = System.Text.Encoding.UTF8.GetBytes(jsonBody);
                request.ContentLength = bodyBytes.Length;

                using (var stream = request.GetRequestStream())
                {
                    stream.Write(bodyBytes, 0, bodyBytes.Length);
                }

                using (var response = request.GetResponse())
                using (var reader = new System.IO.StreamReader(response.GetResponseStream()))
                {
                    string responseText = reader.ReadToEnd();

                    // ✅ Deserializar con Newtonsoft.Json
                    dynamic jsonResponse = Newtonsoft.Json.JsonConvert.DeserializeObject(responseText);

                    if (jsonResponse.content != null && jsonResponse.content.Count > 0)
                    {
                        string texto = jsonResponse.content[0].text.ToString();
                        return texto;
                    }

                    return "No se pudo procesar la respuesta de la IA.";
                }
            }
            catch (System.Net.WebException ex)
            {
                // ✅ Capturar detalles del error
                using (var errorResponse = ex.Response)
                using (var reader = new System.IO.StreamReader(errorResponse.GetResponseStream()))
                {
                    string errorText = reader.ReadToEnd();
                    System.Diagnostics.Debug.WriteLine("Error API: " + errorText);
                    return "Error: " + errorText;
                }
            }
            catch (Exception ex)
            {
                return "Error: " + ex.Message;
            }
        }
    }
}