/* =============================================================
   EvolucionPaciente.js
   ============================================================= */

// Instancias de Chart.js activas
var pgCharts = {};

// Buscador de pacientes
var pgPacientesList = [];
var pgSelectedNombre = '';

// Datos cargados
var pgConsultas = [];
var pgBioquimicos = {};
var pgHistoria = {};

var PG_PALETTE = {
    // EV Primary — verde forestal profundo (acción/nutrición)
    teal:        '#006c49',
    tealLight:   'rgba(0, 108, 73, 0.08)',
    tealMid:     'rgba(0, 108, 73, 0.45)',
    // EV Primary Container — emerald (diastólica, músculo)
    cyan:        '#10b981',
    cyanLight:   'rgba(16, 185, 129, 0.08)',
    // Amber — analítica/datos
    indigo:      '#d97706',
    indigoLight: 'rgba(217, 119, 6, 0.08)',
    // Tertiary — peligro/grasa/sistólica
    rose:        '#a43a3a',
    roseLight:   'rgba(164, 58, 58, 0.08)',
    amber:       '#f59e0b',
    amberLight:  'rgba(245, 158, 11, 0.08)',

    // Semánticos
    slate:  '#3c4a42',
    ok:     '#006c49',
    warn:   '#b45309',
    danger: '#a43a3a',

    // Chart UI
    tickColor:     '#3c4a42',
    gridColor:     'rgba(187, 202, 191, 0.20)',
    tooltipBg:     '#131b2e',
    tooltipTitle:  '#faf8ff',
    tooltipBody:   'rgba(250, 248, 255, 0.72)',
    tooltipBorder: 'rgba(187, 202, 191, 0.15)',

    // Bandas IMC
    bandaBajoPeso:  'rgba(217, 119, 6, 0.06)',
    bandaNormal:    'rgba(0, 108, 73, 0.06)',
    bandaSobrepeso: 'rgba(245, 158, 11, 0.07)',
    bandaObeso:     'rgba(164, 58, 58, 0.07)',

    // Bandas presión arterial
    bandaPaNormal:  'rgba(0, 108, 73, 0.06)',
    bandaPaElevada: 'rgba(245, 158, 11, 0.07)',
    bandaPaAlta:    'rgba(164, 58, 58, 0.07)'
};

$(document).ready(function () {
    var PageName = window.location.pathname.split('/').pop();
    if (PageName === 'frmEvolucionPaciente.aspx') {
        pgInicializar();
    }
});

/* ============================================================
   INICIALIZAR
   ============================================================ */
function pgInicializar() {
    var tipo = $.cookie("GLBTYP");

    // Tabs
    $('.pg-tab-btn').on('click', function () {
        $('.pg-tab-btn').removeClass('active');
        $(this).addClass('active');
        var tab = $(this).data('tab');
        $('.pg-tab-panel').hide();
        $('#tab-' + tab).show();
    });

    lucide.createIcons();

    if (tipo === 'U') {
        document.getElementById('breadcrumbTitulo').textContent = 'Mi Progreso';
        // Ocultar tabs con información clínica sensible — solo médico/admin los ven
        $('.pg-tab-btn[data-tab="bioquimicos"]').hide();
        $('.pg-tab-btn[data-tab="notas"]').hide();
        pgCargarProgreso();
    } else {
        document.getElementById('divSeleccionUsuario').style.display = 'block';
        pgCargaUsuarios();
    }
}

/* ============================================================
   CARGAR USUARIOS (Admin/Médico)
   ============================================================ */
function pgCargaUsuarios() {
    console.log('[pgCargaUsuarios] Iniciando carga de usuarios...');
    $.ajax({
        type: 'POST',
        url: 'frmEvolucionPaciente.aspx/CargaListaUsuarios',
        data: JSON.stringify({ 'obj_Parametros_JS': [] }),
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        success: function (msg) {
            console.log('[pgCargaUsuarios] Respuesta recibida:', msg.d ? msg.d.substring(0, 200) : 'vacío');
            if (msg.d && msg.d.indexOf('Error') === -1 && msg.d.indexOf('AUTH') === -1) {
                // Parsear las options HTML en un array para el buscador
                var $tmp = $('<select>').append(msg.d);
                pgPacientesList = [];
                $tmp.find('option').each(function () {
                    var id = $(this).val();
                    var nombre = $(this).text();
                    if (id && id !== '0') {
                        pgPacientesList.push({ id: id, nombre: nombre });
                    }
                });
                console.log('[pgCargaUsuarios] Usuarios cargados:', pgPacientesList.length);
                pgInicializarBuscador();
                lucide.createIcons();
            } else {
                console.log('[pgCargaUsuarios] Error o AUTH en respuesta:', msg.d);
            }
        },
        error: function (xhr, status, error) {
            console.error('[pgCargaUsuarios] Error AJAX:', status, error, xhr.responseText);
        }
    });
}

function pgInicializarBuscador() {
    console.log('[pgInicializarBuscador] Inicializando buscador...');
    var $input = $('#txtBuscarPaciente');
    var $dropdown = $('#pgSearchDropdown');
    
    console.log('[pgInicializarBuscador] Input:', $input.length, 'Dropdown:', $dropdown.length);

    $input.on('input', function () {
        var q = $(this).val().toLowerCase().trim();
        if (!q) { $dropdown.hide(); return; }

        var filtrados = pgPacientesList.filter(function (p) {
            return p.nombre.toLowerCase().indexOf(q) !== -1;
        });

        if (filtrados.length === 0) {
            $dropdown.html('<div style="padding:12px 16px;color:#94a3b8;font-size:0.87rem;">Sin resultados</div>').show();
            return;
        }

        var escapedQ = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        var html = filtrados.map(function (p) {
            var resaltado = p.nombre.replace(new RegExp('(' + escapedQ + ')', 'gi'),
                '<strong style="color:#6366f1;">$1</strong>');
            return '<div class="pg-search-item" data-id="' + p.id + '" data-nombre="' + p.nombre.replace(/"/g, '&quot;') + '"' +
                ' style="padding:10px 16px;cursor:pointer;font-size:0.87rem;color:#1e293b;' +
                'border-bottom:1px solid #f1f5f9;transition:background 0.1s;">' +
                resaltado + '</div>';
        }).join('');

        $dropdown.html(html).show();

        $dropdown.find('.pg-search-item')
            .on('mouseenter', function () { $(this).css('background', '#f8fafc'); })
            .on('mouseleave', function () { $(this).css('background', '#fff'); })
            .on('click', function () {
                var id = $(this).data('id');
                var nombre = $(this).data('nombre');
                $('#cboUsuarios').val(id);
                $input.val(nombre);
                pgSelectedNombre = nombre;
                $dropdown.hide();
                pgCargarProgreso();
            });
    });

    // Abrir dropdown al hacer foco si ya hay texto
    $input.on('focus', function () {
        if ($(this).val().trim().length > 0) {
            $input.trigger('input');
        }
    });

    // Cerrar al hacer click fuera
    $(document).on('click.pgSearch', function (e) {
        if (!$(e.target).closest('#txtBuscarPaciente, #pgSearchDropdown').length) {
            $dropdown.hide();
        }
    });
}

/* ============================================================
   CARGAR PROGRESO
   ============================================================ */
function pgCargarProgreso() {
    var tipo = $.cookie('GLBTYP');
    var id = tipo === 'U'
        ? $.cookie('GLBUNI')
        : $('#cboUsuarios').val();

    if (!id || id === '0') return;

    pgMostrarSpinner(true);
    pgOcultarTodo();

    var p1 = pgFetch('ObtenerProgresoConsultas', [id]);
    var p2 = pgFetch('ObtenerProgresoBioquimicos', [id]);
    var p3 = pgFetch('ObtenerProgresoHistoria', [id]);

    $.when(p1, p2, p3).done(function (r1, r2, r3) {
        pgMostrarSpinner(false);

        try { pgConsultas = JSON.parse(r1[0].d); } catch (e) { pgConsultas = []; }
        try { pgBioquimicos = JSON.parse(r2[0].d); } catch (e) { pgBioquimicos = {}; }
        try { pgHistoria = JSON.parse(r3[0].d); } catch (e) { pgHistoria = {}; }

        if (pgConsultas.length === 0) {
            document.getElementById('pgEmptyState').style.display = 'block';
            return;
        }

        pgRenderHeader(id);
        pgRenderSummaryCards();
        pgRenderGraficos();
        pgRenderBioquimicos();
        pgRenderNotas();

        document.getElementById('pgHeaderPaciente').style.display = 'block';
        document.getElementById('pgFiltroFechas').style.display = 'block';
        document.getElementById('pgTabsContainer').style.display = 'block';
        document.getElementById('tab-corporal').style.display = 'block';
    });
}

/* ============================================================
   HEADER PACIENTE
   ============================================================ */
function pgRenderHeader(idUsuario) {
    var nombre = $.cookie('GLBTYP') === 'U'
        ? $.cookie('GLBDSC')
        : pgSelectedNombre;

    var inicial = nombre ? nombre.charAt(0).toUpperCase() : '?';
    document.getElementById('pgAvatar').textContent = inicial;
    document.getElementById('pgNombrePaciente').textContent = nombre || '—';

    var ultima = pgConsultas[pgConsultas.length - 1];
    document.getElementById('pgMetaPaciente').textContent =
        'Última consulta: ' + pgFecha(ultima.Fecha) +
        ' · ' + pgConsultas.length + ' consulta(s) registrada(s)';

    var primera = pgConsultas[0];
    var diffPeso = ultima.Peso !== null && primera.Peso !== null
        ? (ultima.Peso - primera.Peso).toFixed(1)
        : null;

    var statsHtml = '';
    if (ultima.Peso)
        statsHtml += pgStatCard('⚖️', ultima.Peso + ' kg', 'Peso actual');
    if (ultima.IMC)
        statsHtml += pgStatCard('📏', ultima.IMC, pgClasificacionIMC(ultima.IMC));
    if (diffPeso !== null)
        statsHtml += pgStatCard(
            parseFloat(diffPeso) <= 0 ? '📉' : '📈',
            (parseFloat(diffPeso) > 0 ? '+' : '') + diffPeso + ' kg',
            'Cambio total'
        );

    document.getElementById('pgStatsRapidos').innerHTML = statsHtml;
}

function pgStatCard(emoji, valor, label) {
    return '<div class="pg-stat-card">' +
        '<div class="pg-stat-emoji">' + emoji + '</div>' +
        '<div class="pg-stat-valor">' + valor + '</div>' +
        '<div class="pg-stat-label">' + label + '</div>' +
        '</div>';
}

/* ============================================================
   SUMMARY CARDS
   ============================================================ */
function pgRenderSummaryCards() {
    var fuente = (pgConsultasFiltradas && pgConsultasFiltradas.length > 0) ? pgConsultasFiltradas : pgConsultas;
    var ultima = fuente[fuente.length - 1];
    var primera = fuente[0];

    function diffSpan(actual, anterior, unidad, invertido) {
        if (actual === null || anterior === null) return '';
        var d = (actual - anterior).toFixed(1);
        var mejor = invertido ? parseFloat(d) < 0 : parseFloat(d) > 0;
        var status = parseFloat(d) === 0 ? 'neutral' : mejor ? 'ok' : 'danger';
        var signo = parseFloat(d) > 0 ? '+' : '';
        return ' <span class="pg-diff-span" data-status="' + status + '">' +
            signo + d + unidad + '</span>';
    }

    var cards = [
        { emoji: '⚖️', label: 'Peso', val: ultima.Peso, unidad: 'kg', diff: diffSpan(ultima.Peso, primera.Peso, ' kg', true) },
        { emoji: '📊', label: 'IMC', val: ultima.IMC, unidad: '', diff: diffSpan(ultima.IMC, primera.IMC, '', true) },
        { emoji: '🔥', label: 'Grasa', val: ultima.Grasa, unidad: 'g', diff: diffSpan(ultima.Grasa, primera.Grasa, 'g', true) },
        { emoji: '💪', label: 'Músculo', val: ultima.Musculo, unidad: 'g', diff: diffSpan(ultima.Musculo, primera.Musculo, 'g', false) },
        { emoji: '📏', label: 'Cintura', val: ultima.Cintura, unidad: 'cm', diff: diffSpan(ultima.Cintura, primera.Cintura, ' cm', true) },
        { emoji: '🍑', label: 'Cadera', val: ultima.Cadera, unidad: 'cm', diff: diffSpan(ultima.Cadera, primera.Cadera, ' cm', false) }
    ];

    var html = '';
    cards.forEach(function (c) {
        if (c.val === null) return;
        html += '<div class="pg-summary-card">' +
            '<div class="pg-sc-emoji">' + c.emoji + '</div>' +
            '<div class="pg-sc-valor">' + c.val +
            ' <span class="pg-sc-unidad">' + c.unidad + '</span>' + c.diff + '</div>' +
            '<div class="pg-sc-label">' + c.label + '</div>' +
            '<div class="pg-sc-sub">vs primera consulta</div>' +
            '</div>';
    });

    document.getElementById('pgSummaryCards').innerHTML = html;
}

/* ============================================================
   FILTRO DE FECHAS
   ============================================================ */
var pgConsultasFiltradas = [];

function pgAplicarFiltroFechas() {
    var desde = document.getElementById('pgFiltroDesde') ? document.getElementById('pgFiltroDesde').value : '';
    var hasta = document.getElementById('pgFiltroHasta') ? document.getElementById('pgFiltroHasta').value : '';

    pgConsultasFiltradas = pgConsultas.filter(function (c) {
        if (desde && c.Fecha < desde) return false;
        if (hasta && c.Fecha > hasta) return false;
        return true;
    });

    if (pgConsultasFiltradas.length === 0) pgConsultasFiltradas = pgConsultas;

    pgRenderSummaryCards();
    pgRenderGraficosFiltrados();
}

function pgRenderGraficosFiltrados() {
    var consultas = pgConsultasFiltradas.length > 0 ? pgConsultasFiltradas : pgConsultas;
    var labels = consultas.map(function (c) { return pgFecha(c.Fecha); });

    pgDestruirCharts();

    pgCharts.peso = pgLineChart('chartPeso', labels, [{
        label: 'Peso (kg)',
        data: consultas.map(function (c) { return c.Peso; }),
        color: PG_PALETTE.teal
    }]);

    pgCharts.imc = pgLineChartIMC('chartIMC', labels,
        consultas.map(function (c) { return c.IMC; }));

    pgCharts.composicion = pgBarChart('chartComposicion', labels, [
        { label: 'Grasa (g)',   data: consultas.map(function (c) { return c.Grasa; }),   color: PG_PALETTE.rose },
        { label: 'Músculo (g)', data: consultas.map(function (c) { return c.Musculo; }), color: PG_PALETTE.teal }
    ]);

    pgCharts.circunf = pgLineChart('chartCircunferencias', labels, [
        { label: 'Cintura (cm)', data: consultas.map(function (c) { return c.Cintura; }), color: PG_PALETTE.amber },
        { label: 'Cadera (cm)',  data: consultas.map(function (c) { return c.Cadera; }),  color: PG_PALETTE.indigo }
    ]);

    pgCharts.presion = pgLineChartPresion('chartPresion', labels,
        consultas.map(function (c) { return c.Sistolica; }),
        consultas.map(function (c) { return c.Diastolica; }));
}

function pgResetFiltro() {
    pgConsultasFiltradas = pgConsultas.slice();
    var el1 = document.getElementById('pgFiltroDesde');
    var el2 = document.getElementById('pgFiltroHasta');
    if (el1 && pgConsultas.length > 0) el1.value = pgConsultas[0].Fecha;
    if (el2 && pgConsultas.length > 0) el2.value = pgConsultas[pgConsultas.length - 1].Fecha;
    pgRenderSummaryCards();
    pgRenderGraficosFiltrados();
}

/* ============================================================
   GRÁFICOS
   ============================================================ */
function pgRenderGraficos() {
    pgConsultasFiltradas = pgConsultas.slice();

    // Preset filter inputs to first/last consultation dates
    var el1 = document.getElementById('pgFiltroDesde');
    var el2 = document.getElementById('pgFiltroHasta');
    if (el1 && pgConsultas.length > 0) el1.value = pgConsultas[0].Fecha;
    if (el2 && pgConsultas.length > 0) el2.value = pgConsultas[pgConsultas.length - 1].Fecha;

    pgRenderGraficosFiltrados();
}

/* ── Gráfico de línea genérico ───────────────────────────── */
function pgLineChart(id, labels, datasets) {
    var ctx = document.getElementById(id);
    if (!ctx) return null;
    return new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: datasets.map(function (d) {
                return {
                    label: d.label,
                    data: d.data,
                    borderColor: d.color,
                    backgroundColor: d.color + '18',   // ~10% opacity fill
                    borderWidth: 2.5,
                    pointRadius: 5,
                    pointHoverRadius: 7,
                    pointBackgroundColor: d.color,
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    tension: 0.35,
                    fill: true,
                    spanGaps: true
                };
            })
        },
        options: pgChartOptions()
    });
}

/* ── Gráfico de barras ───────────────────────────────────── */
function pgBarChart(id, labels, datasets) {
    var ctx = document.getElementById(id);
    if (!ctx) return null;
    return new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: datasets.map(function (d) {
                return {
                    label: d.label,
                    data: d.data,
                    backgroundColor: d.color + 'cc',
                    borderColor: d.color,
                    borderWidth: 0,
                    borderRadius: 7,
                    borderSkipped: false
                };
            })
        },
        options: pgChartOptions()
    });
}

/* ── IMC con bandas de clasificación ─────────────────────── */
function pgLineChartIMC(id, labels, data) {
    var ctx = document.getElementById(id);
    if (!ctx) return null;

    var bandasPlugin = {
        id: 'bandas',
        beforeDraw: function (chart) {
            var yAxis = chart.scales.y;
            var xAxis = chart.scales.x;
            var c = chart.ctx;
            var bandas = [
                { min: 0,    max: 18.5, color: PG_PALETTE.bandaBajoPeso },
                { min: 18.5, max: 25,   color: PG_PALETTE.bandaNormal },
                { min: 25,   max: 30,   color: PG_PALETTE.bandaSobrepeso },
                { min: 30,   max: 50,   color: PG_PALETTE.bandaObeso }
            ];
            bandas.forEach(function (b) {
                var yTop = yAxis.getPixelForValue(b.max);
                var yBottom = yAxis.getPixelForValue(b.min);
                c.fillStyle = b.color;
                c.fillRect(xAxis.left, yTop, xAxis.right - xAxis.left, yBottom - yTop);
            });
        }
    };

    return new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'IMC',
                data: data,
                borderColor: PG_PALETTE.teal,
                backgroundColor: PG_PALETTE.tealLight,
                borderWidth: 2.5,
                pointRadius: 5,
                pointHoverRadius: 7,
                pointBackgroundColor: PG_PALETTE.teal,
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                tension: 0.35,
                fill: true,
                spanGaps: true
            }]
        },
        options: Object.assign({}, pgChartOptions(), {
            scales: {
                y: { min: 10, max: 45, ticks: { color: PG_PALETTE.tickColor }, grid: { color: PG_PALETTE.gridColor } },
                x: { ticks: { color: PG_PALETTE.tickColor }, grid: { color: PG_PALETTE.gridColor } }
            }
        }),
        plugins: [bandasPlugin]
    });
}

/* ── Presión arterial con bandas ─────────────────────────── */
function pgLineChartPresion(id, labels, sistolica, diastolica) {
    var ctx = document.getElementById(id);
    if (!ctx) return null;

    var bandasPlugin = {
        id: 'bandasPA',
        beforeDraw: function (chart) {
            var yAxis = chart.scales.y;
            var xAxis = chart.scales.x;
            var c = chart.ctx;
            var bandas = [
                { min: 0,   max: 120, color: PG_PALETTE.bandaPaNormal },
                { min: 120, max: 130, color: PG_PALETTE.bandaPaElevada },
                { min: 130, max: 200, color: PG_PALETTE.bandaPaAlta }
            ];
            bandas.forEach(function (b) {
                var yTop = yAxis.getPixelForValue(b.max);
                var yBottom = yAxis.getPixelForValue(b.min);
                c.fillStyle = b.color;
                c.fillRect(xAxis.left, yTop, xAxis.right - xAxis.left, yBottom - yTop);
            });
        }
    };

    return new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Sistólica (mmHg)',
                    data: sistolica,
                    borderColor: PG_PALETTE.rose,
                    backgroundColor: PG_PALETTE.roseLight,
                    borderWidth: 2.5,
                    pointRadius: 5,
                    pointHoverRadius: 7,
                    pointBackgroundColor: PG_PALETTE.rose,
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    tension: 0.35,
                    fill: false,
                    spanGaps: true
                },
                {
                    label: 'Diastólica (mmHg)',
                    data: diastolica,
                    borderColor: PG_PALETTE.cyan,
                    backgroundColor: PG_PALETTE.cyanLight,
                    borderWidth: 2.5,
                    pointRadius: 5,
                    pointHoverRadius: 7,
                    pointBackgroundColor: PG_PALETTE.cyan,
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    tension: 0.35,
                    fill: false,
                    spanGaps: true
                }
            ]
        },
        options: Object.assign({}, pgChartOptions(), {
            scales: {
                y: { min: 50, max: 200, ticks: { color: PG_PALETTE.tickColor }, grid: { color: PG_PALETTE.gridColor } },
                x: { ticks: { color: PG_PALETTE.tickColor }, grid: { color: PG_PALETTE.gridColor } }
            }
        }),
        plugins: [bandasPlugin]
    });
}

/* ── Opciones base Chart.js ──────────────────────────────── */
function pgChartOptions() {
    return {
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        interaction: {
            mode: 'index',
            intersect: false
        },
        plugins: {
            legend: {
                labels: {
                    color: PG_PALETTE.tickColor,
                    font: { size: 12, weight: '500', family: "'Inter', sans-serif" },
                    usePointStyle: true,
                    pointStyleWidth: 10
                }
            },
            tooltip: {
                backgroundColor: PG_PALETTE.tooltipBg,
                titleColor:       PG_PALETTE.tooltipTitle,
                bodyColor:        PG_PALETTE.tooltipBody,
                borderColor:      PG_PALETTE.tooltipBorder,
                borderWidth:      1,
                padding:          12,
                cornerRadius:     10,
                titleFont: { size: 12, weight: '600', family: "'Inter', sans-serif" },
                bodyFont:  { size: 11, family: "'JetBrains Mono', 'Fira Code', monospace" }
            }
        },
        scales: {
            y: {
                ticks: { color: PG_PALETTE.tickColor, font: { size: 11 } },
                grid:  { color: PG_PALETTE.gridColor }
            },
            x: {
                ticks: { color: PG_PALETTE.tickColor, font: { size: 11 } },
                grid:  { display: false }
            }
        }
    };
}

function pgDestruirCharts() {
    Object.keys(pgCharts).forEach(function (k) {
        if (pgCharts[k]) { pgCharts[k].destroy(); pgCharts[k] = null; }
    });
}

/* ============================================================
   BIOQUÍMICOS — SEMÁFORO
   ============================================================ */
var PG_RANGOS = {
    ColesterolTotal: { label: 'Colesterol Total', unidad: 'mg/dl', ok: [0, 200], warn: [200, 240], bad: [240, 999], emoji: '🫀' },
    HDL: { label: 'HDL', unidad: 'mg/dl', ok: [40, 999], warn: [35, 40], bad: [0, 35], emoji: '💚', invertido: true },
    LDL: { label: 'LDL', unidad: 'mg/dl', ok: [0, 100], warn: [100, 130], bad: [130, 999], emoji: '🔴' },
    Trigliceridos: { label: 'Triglicéridos', unidad: 'mg/dl', ok: [0, 150], warn: [150, 200], bad: [200, 999], emoji: '🧈' },
    Glicemia: { label: 'Glicemia', unidad: 'mg/dl', ok: [70, 100], warn: [100, 126], bad: [126, 999], emoji: '🍬' },
    AcidoUrico: { label: 'Ácido Úrico', unidad: 'mg/dl', ok: [2, 6], warn: [6, 7], bad: [7, 999], emoji: '⚗️' },
    Hemoglobina: { label: 'Hemoglobina', unidad: 'g/dl', ok: [12, 17], warn: [10, 12], bad: [0, 10], emoji: '🩸' },
    Albumina: { label: 'Albúmina', unidad: 'g/dl', ok: [3.5, 5.5], warn: [3, 3.5], bad: [0, 3], emoji: '🔬' },
    Creatinina: { label: 'Creatinina', unidad: 'mg/dl', ok: [0.6, 1.2], warn: [1.2, 1.5], bad: [1.5, 999], emoji: '🫘' },
    TSH: { label: 'TSH', unidad: 'mIU/L', ok: [0.4, 4], warn: [4, 10], bad: [10, 999], emoji: '🦋' },
    VitaminaD: { label: 'Vitamina D', unidad: 'ng/ml', ok: [30, 100], warn: [20, 30], bad: [0, 20], emoji: '☀️' },
    VitaminaB12: { label: 'Vitamina B12', unidad: 'pg/ml', ok: [200, 900], warn: [150, 200], bad: [0, 150], emoji: '🧬' }
};

function pgRenderBioquimicos() {
    var fechaEl = document.getElementById('pgBioFecha');
    if (pgBioquimicos.Fecha) {
        fechaEl.innerHTML = '📅 Análisis más reciente: <strong>' +
            pgFecha(pgBioquimicos.Fecha) + '</strong>';
        fechaEl.style.display = 'block';
    } else {
        fechaEl.innerHTML = '⚠️ No hay análisis bioquímicos registrados aún.';
        fechaEl.style.display = 'block';
    }

    var lipidos = ['ColesterolTotal', 'HDL', 'LDL', 'Trigliceridos', 'Glicemia', 'AcidoUrico'];
    var otros = ['Hemoglobina', 'Albumina', 'Creatinina', 'TSH', 'VitaminaD', 'VitaminaB12'];

    document.getElementById('pgSemaforoLipidos').innerHTML = pgBuildSemaforo(lipidos);
    document.getElementById('pgSemaforoOtros').innerHTML = pgBuildSemaforo(otros);

    pgRenderHabitos();
}

function pgBuildSemaforo(keys) {
    var html = '';
    keys.forEach(function (k) {
        var cfg = PG_RANGOS[k];
        var valor = pgBioquimicos[k];
        var status, estadoLabel;

        if (valor === null || valor === undefined) {
            status = 'neutral';
            estadoLabel = 'Sin datos';
        } else {
            var v = parseFloat(valor);
            if (v >= cfg.ok[0] && v <= cfg.ok[1]) {
                status = 'ok'; estadoLabel = '✓ Normal';
            } else if (v >= cfg.warn[0] && v <= cfg.warn[1]) {
                status = 'warn'; estadoLabel = '⚠ Atención';
            } else {
                status = 'danger'; estadoLabel = '✕ Fuera de rango';
            }
        }

        // data-status drives border + pill colors via CSS
        html += '<div class="pg-semaforo-card" data-status="' + status + '">' +
            '<div class="pg-sem-header">' +
            '<span class="pg-sem-emoji">' + cfg.emoji + '</span>' +
            '<span class="pg-sem-label">' + cfg.label + '</span>' +
            '</div>' +
            '<div class="pg-sem-valor">' +
            (valor !== null && valor !== undefined ? valor + ' <span class="pg-sem-unidad">' + cfg.unidad + '</span>' : '—') +
            '</div>' +
            '<div class="pg-sem-estado">' + estadoLabel + '</div>' +
            '<div class="pg-sem-rango">Normal: ' + cfg.ok[0] + '–' + cfg.ok[1] + ' ' + cfg.unidad + '</div>' +
            '</div>';
    });
    return html;
}

/* ============================================================
   HÁBITOS
   ============================================================ */
function pgRenderHabitos() {
    if (!pgHistoria || !pgHistoria.ActividadFisica) {
        document.getElementById('pgHabitos').innerHTML =
            '<div class="pg-empty-sub">Sin información de hábitos registrada.</div>';
        return;
    }

    var h = pgHistoria;
    var items = [
        { emoji: '🏃', label: 'Actividad Física', val: h.ActividadFisica || '—' },
        { emoji: '💧', label: 'Agua diaria', val: h.Agua || '—' },
        { emoji: '😴', label: 'Calidad del Sueño', val: h.CalidadSueno || '—' },
        { emoji: '🫁', label: 'Función Intestinal', val: h.FuncionIntestinal || '—' },
        { emoji: '🚬', label: 'Tabaco', val: h.Fuma ? '⚠️ Sí fuma' : '✅ No fuma' },
        { emoji: '🍺', label: 'Alcohol', val: h.Alcohol ? ('⚠️ Sí · ' + (h.FrecuenciaAlcohol || '')) : '✅ No consume' },
        { emoji: '💊', label: 'Medicamentos', val: h.Medicamentos || 'Ninguno' },
        { emoji: '🚫', label: 'Intolerancias', val: h.Intolerancias || 'Ninguna' },
        { emoji: '⚠️', label: 'Alergias', val: h.Alergias || 'Ninguna' }
    ];

    var html = '';
    items.forEach(function (item) {
        html += '<div class="pg-habito-card">' +
            '<div class="pg-hab-emoji">' + item.emoji + '</div>' +
            '<div class="pg-hab-info">' +
            '<div class="pg-hab-label">' + item.label + '</div>' +
            '<div class="pg-hab-val">' + item.val + '</div>' +
            '</div></div>';
    });

    if (h.Objetivos) {
        html += '<div class="pg-objetivos">' +
            '<div class="pg-hab-label" style="margin-bottom:.4rem;">🎯 Objetivos Clínicos</div>' +
            '<div class="pg-hab-val">' + h.Objetivos + '</div>' +
            '</div>';
    }

    document.getElementById('pgHabitos').innerHTML = html;
}

/* ============================================================
   NOTAS CLÍNICAS — TIMELINE
   ============================================================ */
function pgRenderNotas() {
    var consultasConNota = pgConsultas.filter(function (c) {
        return c.Observaciones || c.Recomendaciones;
    }).reverse();

    if (consultasConNota.length === 0) {
        document.getElementById('pgTimeline').innerHTML =
            '<div class="pg-empty" style="padding:2rem;">' +
            '<div class="pg-empty-icon">📋</div>' +
            '<div class="pg-empty-sub">No hay notas clínicas registradas aún.</div>' +
            '</div>';
        return;
    }

    var html = '<div class="pg-timeline">';
    consultasConNota.forEach(function (c) {
        html += '<div class="pg-tl-item"><div class="pg-tl-dot"></div>';
        html += '<div class="pg-tl-content">';
        html += '<div class="pg-tl-fecha">' + pgFecha(c.Fecha) +
            (c.Medico ? '<span class="pg-tl-medico">👨‍⚕️ ' + c.Medico + '</span>' : '') +
            '</div>';

        if (c.Peso)
            html += '<div class="pg-tl-metrics">⚖️ ' + c.Peso + ' kg' +
                (c.IMC ? ' · 📊 IMC: ' + c.IMC : '') + '</div>';

        if (c.Observaciones)
            html += '<div class="pg-tl-section">' +
                '<div class="pg-tl-stitle">📝 Observaciones</div>' +
                '<div class="pg-tl-text">' + c.Observaciones.replace(/\\n/g, '<br>') + '</div>' +
                '</div>';

        if (c.Recomendaciones)
            html += '<div class="pg-tl-section">' +
                '<div class="pg-tl-stitle">💡 Recomendaciones</div>' +
                '<div class="pg-tl-text">' + c.Recomendaciones.replace(/\\n/g, '<br>') + '</div>' +
                '</div>';

        html += '</div></div>';
    });
    html += '</div>';

    document.getElementById('pgTimeline').innerHTML = html;
}

/* ============================================================
   HELPERS
   ============================================================ */
function pgFetch(metodo, params) {
    return $.ajax({
        type: 'POST',
        url: 'frmEvolucionPaciente.aspx/' + metodo,
        data: JSON.stringify({ 'obj_Parametros_JS': params }),
        contentType: 'application/json; charset=utf-8',
        dataType: 'json'
    });
}

function pgFecha(str) {
    if (!str) return '—';
    var p = str.split('-');
    if (p.length === 3) return p[2] + '/' + p[1] + '/' + p[0];
    return str;
}

function pgClasificacionIMC(imc) {
    var v = parseFloat(imc);
    if (v < 18.5) return '🔵 Bajo peso';
    if (v < 25) return '🟢 Normal';
    if (v < 30) return '🟡 Sobrepeso';
    return '🔴 Obesidad';
}

function pgMostrarSpinner(show) {
    document.getElementById('pgSpinner').style.display = show ? 'block' : 'none';
}

function pgOcultarTodo() {
    document.getElementById('pgHeaderPaciente').style.display = 'none';
    document.getElementById('pgFiltroFechas').style.display = 'none';
    document.getElementById('pgTabsContainer').style.display = 'none';
    document.getElementById('pgEmptyState').style.display = 'none';
    $('.pg-tab-panel').hide();
}