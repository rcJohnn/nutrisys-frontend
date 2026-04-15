// ─────────────────────────────────────────────────────
// Principal.js — Hub contextual NutriSys
// ─────────────────────────────────────────────────────

(function () {
    'use strict';

    var DIAS_ES = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
    var MESES_ES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
                    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

    // ── Helpers de fecha ─────────────────────────────

    function formatFechaCorta(isoStr) {
        if (!isoStr) return '—';
        var d = new Date(isoStr);
        if (isNaN(d)) return isoStr;
        return d.getDate() + ' de ' + MESES_ES[d.getMonth()] + ' de ' + d.getFullYear();
    }

    function formatHora(isoStr) {
        if (!isoStr) return '';
        var d = new Date(isoStr);
        if (isNaN(d)) return '';
        var h = d.getHours().toString().padStart(2, '0');
        var m = d.getMinutes().toString().padStart(2, '0');
        return h + ':' + m;
    }

    function fechaHoy() {
        var d = new Date();
        return DIAS_ES[d.getDay()] + ', ' + d.getDate() + ' de ' + MESES_ES[d.getMonth()] + ' de ' + d.getFullYear();
    }

    function getSaludo() {
        var h = new Date().getHours();
        if (h < 12) return 'Buenos días';
        if (h < 19) return 'Buenas tardes';
        return 'Buenas noches';
    }

    // ── Cookies ──────────────────────────────────────

    function getCookie(name) {
        return $.cookie(name) || '';
    }

    // ── Render médico ─────────────────────────────────

    function renderMedico(data) {
        if (data.resumen) {
            var r = data.resumen;
            document.getElementById('mStatPacientes').textContent  = r.pacientesSinSeguimiento || '0';
            document.getElementById('mStatHoy').textContent        = r.consultasHoy            || '0';
            document.getElementById('mStatPendientes').textContent = r.consultasPendientes     || '0';
            document.getElementById('mStatTotal').textContent      = r.totalPacientes          || '0';
        }

        var agenda = data.agenda || [];
        var subtitleEl = document.getElementById('mAgendaSubtitle');
        var containerEl = document.getElementById('mAgendaContainer');

        if (agenda.length === 0) {
            subtitleEl.textContent = 'No hay consultas programadas para hoy';
            containerEl.innerHTML  = '<p class="hub-empty-msg">Tu agenda de hoy está libre.</p>';
        } else {
            subtitleEl.textContent = agenda.length + ' consulta' + (agenda.length !== 1 ? 's' : '') + ' programada' + (agenda.length !== 1 ? 's' : '');
            var html = '<div class="hub-agenda-list">';
            agenda.forEach(function (c) {
                var estadoClass = getEstadoClass(c.EstadoCodigo);
                var horaStr     = c.HoraCita || formatHora(c.Fecha_Cita);
                html += '<div class="hub-agenda-item">';
                html +=   '<div class="hub-agenda-hora">' + horaStr + '</div>';
                html +=   '<div class="hub-agenda-info">';
                html +=     '<span class="hub-agenda-paciente">' + escHtml(c.NombrePaciente) + '</span>';
                if (c.NombreClinica) {
                    html += '<span class="hub-agenda-clinica"><i class="fa fa-map-marker"></i> ' + escHtml(c.NombreClinica) + '</span>';
                }
                if (c.Motivo) {
                    html += '<span class="hub-agenda-motivo">' + escHtml(c.Motivo) + '</span>';
                }
                html +=   '</div>';
                html +=   '<span class="hub-badge ' + estadoClass + '">' + escHtml(c.EstadoTexto) + '</span>';
                html += '</div>';
            });
            html += '</div>';
            containerEl.innerHTML = html;
        }

        document.getElementById('hubMedico').style.display = 'block';
    }

    // ── Render usuario ────────────────────────────────

    function renderUsuario(data) {
        // Última cita
        var uUltimaContent = document.getElementById('uUltimaContent');
        var uUltimaEstado  = document.getElementById('uUltimaEstado');

        if (data.ultimaCita) {
            var uc = data.ultimaCita;
            var dias = parseInt(uc.diasDesde, 10) || 0;
            uUltimaEstado.textContent  = uc.estado;
            uUltimaEstado.className    = 'hub-badge ' + getEstadoClass(uc.estado === 'Completada' ? 'C' : 'N');

            var pesoHtml = uc.peso
                ? '<div class="hub-cita-meta"><i class="fa fa-balance-scale"></i> Peso registrado: <strong>' + uc.peso + ' kg</strong></div>'
                : '';

            uUltimaContent.innerHTML =
                '<div class="hub-cita-fecha"><i class="fa fa-calendar"></i> ' + formatFechaCorta(uc.fecha) + '</div>' +
                '<div class="hub-cita-medico"><i class="fa fa-user-md"></i> ' + escHtml(uc.medico) + '</div>' +
                pesoHtml +
                '<div class="hub-cita-meta hub-dias-desde"><i class="fa fa-clock-o"></i> Hace <strong>' + dias + ' día' + (dias !== 1 ? 's' : '') + '</strong></div>';
        }

        // Próxima cita
        var uProximaContent  = document.getElementById('uProximaContent');
        var uProximaEstado   = document.getElementById('uProximaEstado');
        var uProximaActions  = document.getElementById('uProximaActions');
        var uCtaAgendar      = document.getElementById('uCtaAgendar');

        if (data.proximaCita) {
            var pc = data.proximaCita;
            var diasHasta = parseInt(pc.diasHasta, 10) || 0;
            uProximaEstado.textContent = pc.estado;
            uProximaEstado.className   = 'hub-badge hub-badge-green';

            uProximaContent.innerHTML =
                '<div class="hub-cita-fecha"><i class="fa fa-calendar"></i> ' + formatFechaCorta(pc.fecha) + '</div>' +
                '<div class="hub-cita-hora"><i class="fa fa-clock-o"></i> ' + formatHora(pc.fecha) + ' h</div>' +
                '<div class="hub-cita-medico"><i class="fa fa-user-md"></i> ' + escHtml(pc.medico) + '</div>' +
                '<div class="hub-cita-meta hub-dias-hasta hub-dias-highlight"><i class="fa fa-hourglass-half"></i> En <strong>' + diasHasta + ' día' + (diasHasta !== 1 ? 's' : '') + '</strong></div>';

            if (diasHasta <= 2) {
                uProximaActions.style.display = 'block';
            }
            uCtaAgendar.style.display = 'none';
        } else {
            uProximaContent.innerHTML = '<p class="hub-empty-msg">No tenés ninguna cita agendada.</p>';
            uCtaAgendar.style.display = 'flex';
        }

        document.getElementById('hubUsuario').style.display = 'block';
    }

    // ── Render admin ──────────────────────────────────

    function renderAdmin() {
        document.getElementById('hubAdmin').style.display = 'block';
    }

    // ── Cargar datos ──────────────────────────────────

    function cargarHub() {
        var idEntidad = getCookie('GLBUNI');
        var rol       = getCookie('GLBTYP');
        var nombre    = getCookie('GLBDSC') || 'Usuario';

        // Cabecera
        var saludoEl  = document.getElementById('hubSaludo');
        var nombreEl  = document.getElementById('hubNombreUsuario');
        if (saludoEl)  saludoEl.textContent  = getSaludo();
        if (nombreEl)  nombreEl.textContent  = nombre;

        var fechaEl = document.getElementById('hubFechaHoy');
        if (fechaEl) fechaEl.textContent = fechaHoy();

        // Badge de rol
        var badgeEl = document.getElementById('hubStatusBadge');
        if (badgeEl) {
            if (rol === 'M')      { badgeEl.textContent = 'Médico';         badgeEl.className = 'hub-status-badge hub-badge-indigo'; }
            else if (rol === 'U') { badgeEl.textContent = 'Paciente';       badgeEl.className = 'hub-status-badge hub-badge-green'; }
            else if (rol === 'A') { badgeEl.textContent = 'Administrador';  badgeEl.className = 'hub-status-badge hub-badge-amber'; }
        }

        if (!idEntidad || !rol) {
            document.getElementById('hubSkeleton').style.display = 'none';
            return;
        }

        // Admin no necesita llamada al servidor
        if (rol === 'A') {
            document.getElementById('hubSkeleton').style.display = 'none';
            renderAdmin();
            return;
        }

        $.ajax({
            type:        'POST',
            url:         'frmPrincipal.aspx/ObtenerContextoHub',
            data:        JSON.stringify({ obj_Parametros_JS: [idEntidad, rol] }),
            contentType: 'application/json; charset=utf-8',
            dataType:    'json',
            success: function (response) {
                document.getElementById('hubSkeleton').style.display = 'none';
                if (window.verificarSesion && window.verificarSesion(response.d)) return;

                try {
                    var data = JSON.parse(response.d);
                    if (data.rol === 'M') renderMedico(data);
                    else if (data.rol === 'U') renderUsuario(data);
                } catch (e) {
                    console.error('Hub parse error:', e);
                }
            },
            error: function (xhr, status, error) {
                document.getElementById('hubSkeleton').style.display = 'none';
                console.error('Hub AJAX error:', error);
            }
        });
    }

    // ── Utilidades ─────────────────────────────────────

    function escHtml(str) {
        if (!str) return '';
        return str.replace(/&/g, '&amp;')
                  .replace(/</g, '&lt;')
                  .replace(/>/g, '&gt;')
                  .replace(/"/g, '&quot;');
    }

    function getEstadoClass(codigo) {
        switch (codigo) {
            case 'P': return 'hub-badge-amber';
            case 'C': return 'hub-badge-green';
            case 'X': return 'hub-badge-danger';
            case 'N': return 'hub-badge-muted';
            default:  return 'hub-badge-muted';
        }
    }

    // ── Init ──────────────────────────────────────────

    $(document).ready(function () {
        cargarHub();
    });

})();
