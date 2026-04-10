using System;
using System.Collections.Generic;
using System.Data;
using System.Web.Services;
using System.Web.UI;
using DAL_CRUD_CONSULTAS.Mantenimientos;
using BLL_CRUD_CONSULTAS.Mantenimientos;
using PL_CRUD_CONSULTAS.Helpers;

namespace PL_CRUD_CONSULTAS.Mantenimientos
{
    public partial class frmMantenimientoAlimentos : System.Web.UI.Page
    {
        protected void Page_Load(object sender, EventArgs e)
        {
        }

        [WebMethod(EnableSession = true)]
        public static string CargaInfoAlimento(List<string> obj_Parametros_JS)
        {
            if (!cls_Sesion_PL_Helper.EsSesionValida())
                return cls_Sesion_PL_Helper.SinSesion();

            try
            {
                string _mensaje = string.Empty;

                cls_Alimentos_DAL obj_Alimentos_DAL = new cls_Alimentos_DAL();
                cls_Alimentos_BLL obj_Alimentos_BLL = new cls_Alimentos_BLL();

                obj_Alimentos_DAL.iId_Alimento = Convert.ToInt32(obj_Parametros_JS[0].ToString());

                if (obj_Alimentos_DAL.iId_Alimento != 0)
                {
                    obj_Alimentos_BLL.Obtiene_Informacion_Alimentos(ref obj_Alimentos_DAL);

                    if (obj_Alimentos_DAL.dtDatos != null && obj_Alimentos_DAL.dtDatos.Rows.Count > 0)
                    {
                        DataRow row = obj_Alimentos_DAL.dtDatos.Rows[0];

                        // SP USP_Informacion_Alimentos devuelve todas las columnas (SELECT *)
                        // [0] Id_Alimento
                        // [1] Nombre
                        // [2] Energia_kcal
                        // [3] Proteina_g
                        // [4] Grasa_g
                        // [5] Carbohidratos_g
                        // [6] Fibra_g
                        // [7] Calcio_mg
                        // [8] Fosforo_mg
                        // [9] Hierro_mg
                        // [10] Tiamina_mg
                        // [11] Vit_C_mg
                        // [12] Vit_A_ug
                        // [13] Colesterol_mg
                        // [14] Potasio_mg
                        // [15] Zinc_mg
                        // [16] Magnesio_mg
                        // [17] Vit_B6_mg
                        // [18] Vit_B12_ug
                        // [19] Categoria
                        // [20] Macrogrupo
                        // [21] Marca
                        // [22] Presentacion
                        // [23] Agua_g
                        // [24] Ceniza_g
                        // [25] Riboflavina_mg
                        // [26] Niacina_mg
                        // [27] Ac_Folico_ug
                        // [28] Folato_ug
                        // [29] Sodio_mg
                        // [30] Ac_Grasos_Saturados_g
                        // [31] Ac_Grasos_Monoinsaturados_g
                        // [32] Ac_Grasos_Poliinsaturados_g

                        _mensaje = row[0].ToString()  + "<SPLITER>" +  // Id_Alimento
                                   row[1].ToString()  + "<SPLITER>" +  // Nombre
                                   row[2].ToString()  + "<SPLITER>" +  // Energia_kcal
                                   row[3].ToString()  + "<SPLITER>" +  // Proteina_g
                                   row[4].ToString()  + "<SPLITER>" +  // Grasa_g
                                   row[5].ToString()  + "<SPLITER>" +  // Carbohidratos_g
                                   row[6].ToString()  + "<SPLITER>" +  // Fibra_g
                                   row[7].ToString()  + "<SPLITER>" +  // Calcio_mg
                                   row[8].ToString()  + "<SPLITER>" +  // Fosforo_mg
                                   row[9].ToString()  + "<SPLITER>" +  // Hierro_mg
                                   row[10].ToString() + "<SPLITER>" +  // Tiamina_mg
                                   row[11].ToString() + "<SPLITER>" +  // Vit_C_mg
                                   row[12].ToString() + "<SPLITER>" +  // Vit_A_ug
                                   row[13].ToString() + "<SPLITER>" +  // Colesterol_mg
                                   row[14].ToString() + "<SPLITER>" +  // Potasio_mg
                                   row[15].ToString() + "<SPLITER>" +  // Zinc_mg
                                   row[16].ToString() + "<SPLITER>" +  // Magnesio_mg
                                   row[17].ToString() + "<SPLITER>" +  // Vit_B6_mg
                                   row[18].ToString() + "<SPLITER>" +  // Vit_B12_ug
                                   row[19].ToString() + "<SPLITER>" +  // Categoria
                                   row[20].ToString() + "<SPLITER>" +  // Macrogrupo
                                   row[21].ToString() + "<SPLITER>" +  // Marca
                                   row[22].ToString() + "<SPLITER>" +  // Presentacion
                                   row[23].ToString() + "<SPLITER>" +  // Agua_g
                                   row[24].ToString() + "<SPLITER>" +  // Ceniza_g
                                   row[25].ToString() + "<SPLITER>" +  // Riboflavina_mg
                                   row[26].ToString() + "<SPLITER>" +  // Niacina_mg
                                   row[27].ToString() + "<SPLITER>" +  // Ac_Folico_ug
                                   row[28].ToString() + "<SPLITER>" +  // Folato_ug
                                   row[29].ToString() + "<SPLITER>" +  // Sodio_mg
                                   row[30].ToString() + "<SPLITER>" +  // Ac_Grasos_Saturados_g
                                   row[31].ToString() + "<SPLITER>" +  // Ac_Grasos_Monoinsaturados_g
                                   row[32].ToString();                 // Ac_Grasos_Poliinsaturados_g
                    }
                    else
                    {
                        _mensaje = "No se encontraron registros";
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
        public static string MantenimientoAlimentos(List<string> obj_Parametros_JS)
        {
            if (!cls_Sesion_PL_Helper.EsSesionValida())
                return cls_Sesion_PL_Helper.SinSesion();

            try
            {
                string _mensaje = string.Empty;

                cls_Alimentos_DAL obj_Alimentos_DAL = new cls_Alimentos_DAL();
                cls_Alimentos_BLL obj_Alimentos_BLL = new cls_Alimentos_BLL();

                // Orden de parámetros del JS:
                // [0] IdAlimento
                // [1] Nombre
                // [2] Energia_kcal
                // [3] Proteina_g
                // [4] Grasa_g
                // [5] Carbohidratos_g
                // [6] Fibra_g
                // [7] Calcio_mg
                // [8] Fosforo_mg
                // [9] Hierro_mg
                // [10] Tiamina_mg
                // [11] Vit_C_mg
                // [12] Vit_A_ug
                // [13] Colesterol_mg
                // [14] Potasio_mg
                // [15] Zinc_mg
                // [16] Magnesio_mg
                // [17] Vit_B6_mg
                // [18] Vit_B12_ug
                // [19] Categoria
                // [20] Macrogrupo
                // [21] Marca
                // [22] Presentacion
                // [23] Agua_g
                // [24] Ceniza_g
                // [25] Riboflavina_mg
                // [26] Niacina_mg
                // [27] Ac_Folico_ug
                // [28] Folato_ug
                // [29] Sodio_mg
                // [30] Ac_Grasos_Saturados_g
                // [31] Ac_Grasos_Monoinsaturados_g
                // [32] Ac_Grasos_Poliinsaturados_g
                // [33] IdUsuarioGlobal

                obj_Alimentos_DAL.iId_Alimento                   = Convert.ToInt32(obj_Parametros_JS[0]);
                obj_Alimentos_DAL.sNombre                        = obj_Parametros_JS[1];
                obj_Alimentos_DAL.dEnergia_kcal                  = Convert.ToDecimal(obj_Parametros_JS[2]);
                obj_Alimentos_DAL.dProteina_g                    = Convert.ToDecimal(obj_Parametros_JS[3]);
                obj_Alimentos_DAL.dGrasa_g                       = Convert.ToDecimal(obj_Parametros_JS[4]);
                obj_Alimentos_DAL.dCarbohidratos_g               = Convert.ToDecimal(obj_Parametros_JS[5]);
                obj_Alimentos_DAL.dFibra_g                       = Convert.ToDecimal(obj_Parametros_JS[6]);
                obj_Alimentos_DAL.dCalcio_mg                     = Convert.ToDecimal(obj_Parametros_JS[7]);
                obj_Alimentos_DAL.dFosforo_mg                    = Convert.ToDecimal(obj_Parametros_JS[8]);
                obj_Alimentos_DAL.dHierro_mg                     = Convert.ToDecimal(obj_Parametros_JS[9]);
                obj_Alimentos_DAL.dTiamina_mg                    = Convert.ToDecimal(obj_Parametros_JS[10]);
                obj_Alimentos_DAL.dVit_C_mg                      = Convert.ToDecimal(obj_Parametros_JS[11]);
                obj_Alimentos_DAL.dVit_A_ug                      = Convert.ToDecimal(obj_Parametros_JS[12]);
                obj_Alimentos_DAL.dColesterol_mg                 = Convert.ToDecimal(obj_Parametros_JS[13]);
                obj_Alimentos_DAL.dPotasio_mg                    = Convert.ToDecimal(obj_Parametros_JS[14]);
                obj_Alimentos_DAL.dZinc_mg                       = Convert.ToDecimal(obj_Parametros_JS[15]);
                obj_Alimentos_DAL.dMagnesio_mg                   = Convert.ToDecimal(obj_Parametros_JS[16]);
                obj_Alimentos_DAL.dVit_B6_mg                     = Convert.ToDecimal(obj_Parametros_JS[17]);
                obj_Alimentos_DAL.dVit_B12_ug                    = Convert.ToDecimal(obj_Parametros_JS[18]);
                obj_Alimentos_DAL.sCategoria                     = obj_Parametros_JS[19];
                obj_Alimentos_DAL.sMacrogrupo                    = obj_Parametros_JS[20];
                obj_Alimentos_DAL.sMarca                         = obj_Parametros_JS[21];
                obj_Alimentos_DAL.sPresentacion                  = obj_Parametros_JS[22];
                obj_Alimentos_DAL.dAgua_g                        = Convert.ToDecimal(obj_Parametros_JS[23]);
                obj_Alimentos_DAL.dCeniza_g                      = Convert.ToDecimal(obj_Parametros_JS[24]);
                obj_Alimentos_DAL.dRiboflavina_mg                = Convert.ToDecimal(obj_Parametros_JS[25]);
                obj_Alimentos_DAL.dNiacina_mg                    = Convert.ToDecimal(obj_Parametros_JS[26]);
                obj_Alimentos_DAL.dAc_Folico_ug                  = Convert.ToDecimal(obj_Parametros_JS[27]);
                obj_Alimentos_DAL.dFolato_ug                     = Convert.ToDecimal(obj_Parametros_JS[28]);
                obj_Alimentos_DAL.dSodio_mg                      = Convert.ToDecimal(obj_Parametros_JS[29]);
                obj_Alimentos_DAL.dAc_Grasos_Saturados_g         = Convert.ToDecimal(obj_Parametros_JS[30]);
                obj_Alimentos_DAL.dAc_Grasos_Monoinsaturados_g   = Convert.ToDecimal(obj_Parametros_JS[31]);
                obj_Alimentos_DAL.dAc_Grasos_Poliinsaturados_g   = Convert.ToDecimal(obj_Parametros_JS[32]);
                obj_Alimentos_DAL.iIdUsuarioGlobal               = Convert.ToInt32(obj_Parametros_JS[33]);

                // Solo INSERT, no UPDATE ni DELETE
                if (obj_Alimentos_DAL.iId_Alimento == 0)
                {
                    obj_Alimentos_BLL.crearAlimentos(ref obj_Alimentos_DAL);

                    if (obj_Alimentos_DAL.sValorScalar == "-1")
                    {
                        _mensaje = "-1<SPLITER>Ya existe un alimento con el mismo nombre.";
                    }
                    else if (obj_Alimentos_DAL.sValorScalar == "0")
                    {
                        _mensaje = "0<SPLITER>Ocurrió un error al intentar guardar la información del alimento. Intente nuevamente.";
                    }
                    else
                    {
                        _mensaje = obj_Alimentos_DAL.sValorScalar + "<SPLITER>Alimento guardado de forma correcta.";
                    }
                }
                else
                {
                    // Si el ID != 0, es porque está intentando editar (no permitido)
                    _mensaje = "0<SPLITER>No se permite modificar alimentos existentes.";
                }

                return _mensaje;
            }
            catch (Exception ex)
            {
                return "0<SPLITER>Error: " + ex.Message;
            }
        }
    }
}