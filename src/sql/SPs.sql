

 CREATE or alter PROCEDURE [dbo].[USP_Insertar_Usuarios]
  (
      @Nombre           NVARCHAR(50),
      @Prim_Apellido    NVARCHAR(50),
      @Seg_Apellido     NVARCHAR(50),
      @Cedula           NVARCHAR(20),
      @FechaNacimiento  DATE,
      @Sexo             CHAR(1),
      @Telefono         NVARCHAR(15),
      @Correo           NVARCHAR(100),
      @Observaciones    NVARCHAR(500),
      @Estado           CHAR(1),
      @PasswordHash     NVARCHAR(255),
      @IdUsuario_Global INT
  )
  AS
  BEGIN
      SET NOCOUNT ON;

      BEGIN TRY

          IF NOT EXISTS (
              SELECT Id_Usuario
              FROM Usuarios
              WHERE Cedula = @Cedula OR Correo = @Correo
          )
          BEGIN
              INSERT INTO [dbo].[Usuarios]
              (
                  [Nombre], [Prim_Apellido], [Seg_Apellido], [Cedula],
                  [FechaNacimiento],[Sexo],[Telefono], [Correo], [Observaciones],
                  [Estado], [PasswordHash]
              )
              VALUES
              (
                  @Nombre, @Prim_Apellido, @Seg_Apellido, @Cedula,
                  @FechaNacimiento, @Sexo, @Telefono, @Correo, @Observaciones,
                  @Estado, @PasswordHash
              )

              -- Capturar el ID del nuevo usuario ANTES de cualquier otro INSERT
              DECLARE @NuevoUserId INT = CAST(SCOPE_IDENTITY() AS INT);

              -- Retornar el ID al caller
              SELECT @NuevoUserId;

              -- Asignar módulos por defecto para Usuarios: Mi Perfil y Generador de Planes
              INSERT INTO Modulos_X_Usuario (Id_Usuario, Id_Modulo)
              SELECT @NuevoUserId, Id_Modulo
              FROM Modulos
              WHERE Modulo IN ('Mi Perfil', 'Generador de Planes', 'Mi Progreso');

              -- AUDITORÍA
              DECLARE @DSC VARCHAR(MAX);
              SET @DSC = 'Inserta usuario: ' + LTRIM(RTRIM(@Nombre)) + ' ' +
                         LTRIM(RTRIM(@Prim_Apellido)) + ' ' +
                         LTRIM(RTRIM(@Seg_Apellido)) +
                         '. Id Registro: ' + CONVERT(VARCHAR, @NuevoUserId);

              INSERT INTO Auditoria (Id_Entidad, TipoEntidad, Accion, Descripcion, Fecha)
              VALUES (@NuevoUserId, 'U', 'I', @DSC, GETDATE());
          END
          ELSE
          BEGIN
              SELECT -1; -- Ya existe cédula o correo
          END

      END TRY
      BEGIN CATCH
          SELECT 0;
      END CATCH
  END
GO

CREATE or alter PROCEDURE [dbo].[USP_Eliminar_Usuarios]
(
    @IdUsuario INT,
    @IdUsuario_Global INT,
    @ForzarEliminacion INT = 0
)
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        -- Verificar si tiene consultas médicas asociadas (dato compartido con médico)
        IF EXISTS (SELECT 1 FROM Consultas WHERE Id_Usuario = @IdUsuario)
        BEGIN
            IF @ForzarEliminacion = 0
            BEGIN
                SELECT -1
                RETURN
            END
            ELSE
            BEGIN
                -- Eliminar registros hijo de Consultas antes de borrar Consultas
                DELETE FROM Consultas_Pliegues_Cutaneos
                WHERE Id_Consulta IN (SELECT Id_Consulta FROM Consultas WHERE Id_Usuario = @IdUsuario)

                DELETE FROM Evaluacion_Cuantitativa
                WHERE Id_Consulta IN (SELECT Id_Consulta FROM Consultas WHERE Id_Usuario = @IdUsuario)

                DELETE FROM Historia_Clinica_Historial
                WHERE Id_Consulta IN (SELECT Id_Consulta FROM Consultas WHERE Id_Usuario = @IdUsuario)

                DELETE FROM Consultas WHERE Id_Usuario = @IdUsuario
            END
        END

        -- Datos clínicos del paciente (siempre se eliminan con el usuario)
        DELETE FROM Historia_Clinica          WHERE Id_Usuario = @IdUsuario
        DELETE FROM Analisis_Bioquimicos      WHERE Id_Usuario = @IdUsuario
        DELETE FROM Usuario_Penalizaciones    WHERE Id_Usuario = @IdUsuario
        DELETE FROM Usuarios_X_Padecimientos  WHERE Id_Usuario = @IdUsuario
        DELETE FROM Modulos_X_Usuario         WHERE Id_Usuario = @IdUsuario
        DELETE FROM Despensa_Usuario          WHERE Id_Usuario = @IdUsuario


        -- Eliminar usuario
        DELETE FROM Usuarios WHERE Id_Usuario = @IdUsuario

        SELECT @IdUsuario

        -- Auditoría
        DECLARE @DSC VARCHAR(MAX)
        SET @DSC = 'Eliminó usuario ID: ' + CONVERT(VARCHAR, @IdUsuario) + 
                   CASE WHEN @ForzarEliminacion = 1 THEN ' (FORZADO - con dependencias)' ELSE '' END

        INSERT INTO Auditoria (Id_Entidad, TipoEntidad, Accion, Descripcion, Fecha)
        VALUES (@IdUsuario, 'U', 'E', @DSC, GETDATE())

    END TRY
    BEGIN CATCH
        SELECT 0
    END CATCH
END

GO


CREATE OR ALTER PROCEDURE [dbo].[USP_Guardar_Evaluacion_Cuantitativa]
(
    @IdConsulta INT,
    @TiempoComida NVARCHAR(20),
    @ConsumoUsual NVARCHAR(MAX)
)
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY

        INSERT INTO Evaluacion_Cuantitativa
        (
            Id_Consulta,
            Tiempo_Comida,
            Consumo_Usual,
            Fecha_Registro
        )
        VALUES
        (
            @IdConsulta,
            @TiempoComida,
            @ConsumoUsual,
            GETDATE()
        )

        SELECT SCOPE_IDENTITY()

    END TRY
    BEGIN CATCH
        SELECT 0
    END CATCH
END
GO

CREATE OR ALTER PROCEDURE [dbo].[USP_Obtener_Evaluacion_Cuantitativa]
(
    @IdConsulta INT
)
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        Id_Evaluacion,
        Id_Consulta,
        Tiempo_Comida,
        Consumo_Usual,
        Fecha_Registro
    FROM Evaluacion_Cuantitativa
    WHERE Id_Consulta = @IdConsulta
    ORDER BY 
        CASE Tiempo_Comida
            WHEN 'Desayuno' THEN 1
            WHEN 'MeriendaAM' THEN 2
            WHEN 'Almuerzo' THEN 3
            WHEN 'MeriendaPM' THEN 4
            WHEN 'Cena' THEN 5
        END
END
GO

CREATE OR ALTER PROCEDURE [dbo].[USP_Modificar_Historia_Clinica]
(
    @IdUsuario INT,
    @Fuma BIT,
    @Consume_Alcohol BIT,
    @Frecuencia_Alcohol NVARCHAR(100),
    @Embarazo BIT,
    @Lactancia BIT,
    @Intolerancias NVARCHAR(MAX),
    @Alergias_Alimentarias NVARCHAR(MAX),
    @IdUsuario_Modificacion INT
)
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY

        IF EXISTS (SELECT 1 FROM Historia_Clinica WHERE Id_Usuario = @IdUsuario)
        BEGIN
            UPDATE Historia_Clinica
            SET
                Fuma = @Fuma,
                Consume_Alcohol = @Consume_Alcohol,
                Frecuencia_Alcohol = @Frecuencia_Alcohol,
                Embarazo = @Embarazo,
                Lactancia = @Lactancia,
                Intolerancias = @Intolerancias,
                Alergias_Alimentarias = @Alergias_Alimentarias,
                Fecha_Modificacion = GETDATE(),
                Id_Usuario_Modificacion = @IdUsuario_Modificacion
            WHERE Id_Usuario = @IdUsuario

            SELECT 1
        END
        ELSE
        BEGIN
            INSERT INTO Historia_Clinica
            (
                Id_Usuario,
                Fuma,
                Consume_Alcohol,
                Frecuencia_Alcohol,
                Embarazo,
                Lactancia,
                Intolerancias,
                Alergias_Alimentarias,
                Fecha_Registro
            )
            VALUES
            (
                @IdUsuario,
                @Fuma,
                @Consume_Alcohol,
                @Frecuencia_Alcohol,
                @Embarazo,
                @Lactancia,
                @Intolerancias,
                @Alergias_Alimentarias,
                GETDATE()
            )

            SELECT SCOPE_IDENTITY()
        END

    END TRY
    BEGIN CATCH
        SELECT 0
    END CATCH
END
GO

CREATE OR ALTER PROCEDURE [dbo].[USP_Guardar_Historia_Clinica_Historial]
(
    @IdConsulta INT,
    @Calidad_Sueno NVARCHAR(100),
    @Funcion_Intestinal NVARCHAR(100),
    @Actividad_Fisica NVARCHAR(200),
    @Medicamentos NVARCHAR(MAX),
    @Ingesta_Agua_Diaria NVARCHAR(50),
    @Objetivos_Clinicos NVARCHAR(MAX),
    @Alimentos_Favoritos NVARCHAR(MAX),
    @Alimentos_No_Gustan NVARCHAR(MAX)
)
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY

        INSERT INTO Historia_Clinica_Historial
        (
            Id_Consulta,
            Calidad_Sueno,
            Funcion_Intestinal,
            Actividad_Fisica,
            Medicamentos,
            Ingesta_Agua_Diaria,
            Objetivos_Clinicos,
            Alimentos_Favoritos,
            Alimentos_No_Gustan,
            Fecha_Registro
        )
        VALUES
        (
            @IdConsulta,
            @Calidad_Sueno,
            @Funcion_Intestinal,
            @Actividad_Fisica,
            @Medicamentos,
            @Ingesta_Agua_Diaria,
            @Objetivos_Clinicos,
            @Alimentos_Favoritos,
            @Alimentos_No_Gustan,
            GETDATE()
        )

        SELECT SCOPE_IDENTITY()

    END TRY
    BEGIN CATCH
        SELECT 0
    END CATCH
END
GO

CREATE OR ALTER PROCEDURE [dbo].[USP_Obtener_Historia_Clinica]
(
    @IdUsuario INT
)
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT *
    FROM Historia_Clinica
    WHERE Id_Usuario = @IdUsuario
END
GO

CREATE or alter PROCEDURE [dbo].[USP_Obtener_Historia_Clinica_Historial]
(
    @IdConsulta INT
)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT *
    FROM Historia_Clinica_Historial
    WHERE Id_Consulta = @IdConsulta
END
GO

CREATE OR ALTER PROCEDURE [dbo].[USP_Guardar_Pliegue_Cutaneo]
(
    @IdConsulta INT,
    @IdTipoPliegue INT,
    @ValorMM DECIMAL(5,2)
)
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY

        INSERT INTO Consultas_Pliegues_Cutaneos
        (
            Id_Consulta,
            Id_Tipo_Pliegue,
            Valor_mm,
            Fecha_Registro
        )
        VALUES
        (
            @IdConsulta,
            @IdTipoPliegue,
            @ValorMM,
            GETDATE()
        )

        SELECT SCOPE_IDENTITY()

    END TRY
    BEGIN CATCH
        SELECT 0
    END CATCH
END
GO

CREATE OR ALTER PROCEDURE [dbo].[USP_Obtener_Pliegues_Cutaneos]
(
    @IdConsulta INT
)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        P.Id_Pliegue,
        P.Id_Consulta,
        TP.Nombre AS Tipo_Pliegue,
        P.Valor_mm,
        P.Fecha_Registro
    FROM Consultas_Pliegues_Cutaneos P
    INNER JOIN Tipos_Pliegues TP ON P.Id_Tipo_Pliegue = TP.Id_Tipo_Pliegue
    WHERE P.Id_Consulta = @IdConsulta
    ORDER BY TP.Id_Tipo_Pliegue
END
GO