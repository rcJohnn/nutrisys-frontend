CREATE TABLE [dbo].[Historia_Clinica](
    [Id_Historia] INT IDENTITY(1,1) NOT NULL,
    [Id_Usuario] INT NOT NULL,

    [Fuma] BIT NULL,
    [Consume_Alcohol] BIT NULL,
    [Frecuencia_Alcohol] NVARCHAR(100) NULL,
    [Embarazo] BIT NULL,
    [Lactancia] BIT NULL,
    [Intolerancias] NVARCHAR(MAX) NULL,
    [Alergias_Alimentarias] NVARCHAR(MAX) NULL,

    [Fecha_Registro] DATETIME NULL,
    [Fecha_Modificacion] DATETIME NULL,
    [Id_Usuario_Modificacion] INT NULL,

    CONSTRAINT [PK_Historia_Clinica] PRIMARY KEY CLUSTERED 
(
	[Id_Historia] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO

ALTER TABLE [dbo].[Historia_Clinica] ADD  DEFAULT ((0)) FOR [Fuma]
GO

ALTER TABLE [dbo].[Historia_Clinica] ADD  DEFAULT ((0)) FOR [Consume_Alcohol]
GO

ALTER TABLE [dbo].[Historia_Clinica] ADD  DEFAULT ((0)) FOR [Embarazo]
GO

ALTER TABLE [dbo].[Historia_Clinica] ADD  DEFAULT ((0)) FOR [Lactancia]
GO

ALTER TABLE [dbo].[Historia_Clinica] ADD  DEFAULT (getdate()) FOR [Fecha_Registro]
GO

ALTER TABLE [dbo].[Historia_Clinica]  WITH CHECK ADD  CONSTRAINT [FK_Historia_Usuario] FOREIGN KEY([Id_Usuario])
REFERENCES [dbo].[Usuarios] ([Id_Usuario])
GO

ALTER TABLE [dbo].[Historia_Clinica] CHECK CONSTRAINT [FK_Historia_Usuario]
GO


CREATE TABLE [dbo].[Historia_Clinica_Historial](
    [Id_Historial] INT IDENTITY(1,1) NOT NULL,
    [Id_Consulta] INT NOT NULL,

    [Calidad_Sueno] NVARCHAR(100) NULL,
    [Funcion_Intestinal] NVARCHAR(100) NULL,
    [Actividad_Fisica] NVARCHAR(200) NULL,
    [Medicamentos] NVARCHAR(MAX) NULL,
    [Ingesta_Agua_Diaria] NVARCHAR(50) NULL,
    [Objetivos_Clinicos] NVARCHAR(MAX) NULL,
    [Alimentos_Favoritos] NVARCHAR(MAX) NULL,
    [Alimentos_No_Gustan] NVARCHAR(MAX) NULL,

    [Fecha_Registro] DATETIME NOT NULL,

    CONSTRAINT PK_Historia_Clinica_Historial PRIMARY KEY CLUSTERED (Id_Historial),
    CONSTRAINT FK_HCH_Consulta FOREIGN KEY (Id_Consulta) REFERENCES Consultas(Id_Consulta)
);

CREATE TABLE [dbo].[Tipos_Pliegues](
    [Id_Tipo_Pliegue] INT IDENTITY(1,1) NOT NULL,
    [Nombre] NVARCHAR(50) NOT NULL,

    CONSTRAINT PK_Tipos_Pliegues PRIMARY KEY CLUSTERED (Id_Tipo_Pliegue)
);

INSERT INTO Tipos_Pliegues (Nombre) VALUES
('Tricipital'),
('Subescapular'),
('Bicipital'),
('Suprailiaco'),
('Abdominal'),
('Muslo'),
('Pantorrilla');


CREATE TABLE [dbo].[Consultas_Pliegues_Cutaneos](
    [Id_Pliegue] INT IDENTITY(1,1) NOT NULL,
    [Id_Consulta] INT NOT NULL,
    [Id_Tipo_Pliegue] INT NOT NULL,

    [Valor_mm] DECIMAL(5,2) NOT NULL,
    [Fecha_Registro] DATETIME NOT NULL,

    CONSTRAINT PK_Pliegues PRIMARY KEY CLUSTERED (Id_Pliegue),
    CONSTRAINT FK_Pliegues_Consulta FOREIGN KEY (Id_Consulta) REFERENCES Consultas(Id_Consulta),
    CONSTRAINT FK_Pliegues_Tipo FOREIGN KEY (Id_Tipo_Pliegue) REFERENCES Tipos_Pliegues(Id_Tipo_Pliegue)
);


CREATE TABLE [dbo].[Evaluacion_Cuantitativa](
    [Id_Evaluacion] INT IDENTITY(1,1) NOT NULL,
    [Id_Consulta] INT NOT NULL,

    [Tiempo_Comida] NVARCHAR(20) NOT NULL, -- Desayuno, Almuerzo, etc.
    [Consumo_Usual] NVARCHAR(MAX) NULL,

    [Fecha_Registro] DATETIME NOT NULL,

    CONSTRAINT PK_Evaluacion_Cuantitativa PRIMARY KEY CLUSTERED (Id_Evaluacion),
    CONSTRAINT FK_EC_Consulta FOREIGN KEY (Id_Consulta) REFERENCES Consultas(Id_Consulta)
);
