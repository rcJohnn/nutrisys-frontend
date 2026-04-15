<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="frmInicioSesion.aspx.cs" Inherits="PL_CRUD_CONSULTAS.Login.frmInicioSesion" %>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
    <title>NutriSys Inicio de Sesion</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta charset="UTF-8" />
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="css/style.css" type="text/css" media="all" />
    <link rel="stylesheet" href="css/font-awesome.min.css" type="text/css" media="all">
</head>
<body>

    <%-- Split layout: izquierda = video, derecha = form --%>
    <div class="ls-layout">

        <%-- IZQUIERDA: Panel de video (Vide plugin) --%>
        <div id="lsVideoPanel" class="ls-left"
             data-vide-bg="images/Fondo"
             data-vide-options="position: 0% 50%">
            <div class="ls-left-overlay"></div>
        </div>

        <%-- DERECHA: Panel de login --%>
        <div class="ls-right">
            <div class="ls-right-inner">

                <%-- Logo --%>
                <div class="ls-branding">
                    <img src="../Base/assets/images/Untitled.png" alt="NutriSys" style="height:200px;" />
                </div>

                <h2 class="ls-title">Bienvenido</h2>
                <p class="ls-subtitle">Ingresa tus credenciales para continuar.</p>

                <%-- Formulario --%>
                <form action="javascript: inicioSesion()" method="post" class="ls-form">

                    <div class="ls-field">
                        <label for="txtUsuario" class="ls-label">Correo electronico</label>
                        <div class="ls-input-wrapper">
                            <span class="ls-input-icon"><i class="fa fa-envelope-o"></i></span>
                            <input id="txtUsuario" type="email" class="ls-input"
                                   placeholder="nombre@mail.com"
                                   required="" autofocus />
                        </div>
                    </div>

                    <div class="ls-field">
                        <div class="ls-label-row">
                            <label for="txtPassword" class="ls-label">Contrasena</label>
                        </div>
                        <div class="ls-input-wrapper">
                            <span class="ls-input-icon"><i class="fa fa-lock"></i></span>
                            <input id="txtPassword" type="password" class="ls-input ls-input-pw"
                                   placeholder="******"
                                   required="" />
                            <button type="button" onclick="togglePassword('txtPassword', this)"
                                    class="ls-pw-toggle" title="Mostrar/Ocultar contrasena">
                                <i class="fa fa-eye"></i>
                            </button>
                        </div>
                    </div>

                    <button class="ls-btn" type="submit">Iniciar Sesion en NutriSys</button>

                </form>

                <%-- Sign up --%>
                <p class="ls-signup">¿No tienes cuenta? <a href="#">Registrate gratis</a></p>

            </div>
        </div>

    </div>

    <%-- Ghost border editorial feel --%>
    <div class="ls-ghost-border"></div>

    <%-- Scripts — el orden importa --%>
    <script src="js/jquery.min.js"></script>
    <script src="js/jquery.vide.js"></script>
    <script src="../JavaScript/jquery.cookie.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.1.1/crypto-js.min.js"></script>
    <script src="../JavaScript/InicioSesion.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>

</body>
</html>
