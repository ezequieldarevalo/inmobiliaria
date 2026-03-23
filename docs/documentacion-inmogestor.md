# InmoGestor - Software de Gestión Inmobiliaria

## Documentación Completa de la Aplicación

---

# 1. RESUMEN EJECUTIVO

**InmoGestor** es una plataforma SaaS (Software as a Service) de gestión inmobiliaria integral, diseñada específicamente para inmobiliarias argentinas. Permite administrar propiedades, propietarios, clientes, contratos, cobros, citas, finanzas y reportes desde un único panel de control con interfaz moderna y responsiva.

La aplicación está construida con tecnologías de última generación (Next.js 14, TypeScript, PostgreSQL) y ofrece un modelo de suscripción por planes que se adapta al tamaño y necesidades de cada inmobiliaria.

---

# 2. PROBLEMAS QUE RESUELVE

## 2.1 Gestión Fragmentada de Información
Las inmobiliarias tradicionalmente manejan datos en planillas de Excel, cuadernos, WhatsApp y múltiples sistemas desconectados. InmoGestor centraliza toda la información en una única plataforma accesible desde cualquier dispositivo.

## 2.2 Seguimiento Manual de Contratos y Vencimientos
Los contratos de alquiler requieren seguimiento constante: vencimientos, ajustes de precio, renovaciones. InmoGestor genera alertas automáticas para contratos próximos a vencer y calcula ajustes de alquiler según los índices oficiales argentinos (ICL, IPC, Casa Propia).

## 2.3 Dificultad para Matchear Propiedades con Clientes
Encontrar la propiedad ideal para cada cliente requiere cruzar múltiples criterios. InmoGestor implementa un algoritmo de matching inteligente que puntúa automáticamente la compatibilidad entre propiedades y clientes según tipo de operación, precio, ubicación, ambientes y tipo de propiedad.

## 2.4 Falta de Visibilidad Financiera
Muchas inmobiliarias no tienen visibilidad en tiempo real sobre ingresos, egresos y rentabilidad. InmoGestor ofrece dashboards con gráficos, reportes financieros y gestión de caja para tener el control total de las finanzas del negocio.

## 2.5 Comunicación Desorganizada con Clientes
La comunicación con clientes se pierde en conversaciones de WhatsApp sin registro. InmoGestor integra envío de mensajes por WhatsApp con templates predefinidos y registro de interacciones.

## 2.6 Ausencia de Agenda Centralizada
Las visitas y citas se manejan en agendas personales sin coordinación. InmoGestor ofrece un calendario compartido con sistema de turnos y estados de citas.

## 2.7 Publicación Manual en Portales
Publicar propiedades en portales inmobiliarios es un proceso manual y repetitivo. InmoGestor permite generar fichas de propiedad compartibles con URL pública y prepara la integración con portales como ZonaProp, Argenprop y MercadoLibre.

## 2.8 Falta de Control Multi-Sucursal
Inmobiliarias con múltiples sucursales o equipos necesitan control de acceso por roles. InmoGestor implementa sistema multi-tenant con roles (Usuario, Admin, SuperAdmin) y planes escalonados.

---

# 3. MÓDULOS Y FUNCIONALIDADES

## 3.1 Dashboard Principal

El panel principal ofrece una vista consolidada del estado del negocio con:

- **Indicadores clave (KPIs)**: Total de propiedades, clientes activos, contratos vigentes, ingresos del mes.
- **Gráficos interactivos**: Evolución de ingresos (gráfico de área), distribución por tipo de operación (gráfico de torta), rendimiento mensual (gráfico de barras).
- **Actividad reciente**: Últimos movimientos registrados en el sistema.
- **Acceso rápido**: Botones directos a las funciones más utilizadas.

## 3.2 Gestión de Propiedades

### Listado de Propiedades
- Tabla con búsqueda y filtros avanzados por tipo, operación, estado, rango de precios, zona.
- Vista con información resumida: foto, dirección, precio, estado, tipo de operación.
- Acciones rápidas: ver detalle, editar, eliminar.

### Detalle de Propiedad
- **Información completa**: Título, descripción, dirección (calle, número, piso, depto, barrio, ciudad, provincia).
- **Características**: Tipo (departamento, casa, PH, terreno, local, oficina, cochera, galpón, fondo de comercio, campo, quinta), ambientes, dormitorios, baños, cocheras, superficie total y cubierta, antigüedad, orientación, estado de conservación.
- **Amenities**: Pileta, gimnasio, SUM, balcón, terraza, jardín, parrilla, quincho, ascensor, lavadero, seguridad, baulera.
- **Datos financieros**: Precio, moneda (ARS/USD), expensas.
- **Multimedia**: Fotos (URL), video (YouTube/Vimeo).
- **Ubicación en mapa**: Mapa interactivo (Leaflet/OpenStreetMap) con marcador de la propiedad. Geocodificación automática via Nominatim.
- **Estado**: Disponible, Reservada, Alquilada, Vendida, No Disponible.
- **Propietario vinculado**: Datos del dueño con acceso directo a su ficha.
- **Clientes compatibles (Matching)**: Algoritmo automático que muestra clientes compatibles con puntaje de 0 a 110 puntos, basado en: tipo de operación (40 pts), rango de precio (30 pts), zona (20 pts), ambientes (10 pts), tipo de propiedad (10 pts).

### Creación/Edición de Propiedad
- Formulario completo con validaciones.
- Selección de propietario existente.
- Geocodificación automática: al ingresar la dirección, el sistema obtiene las coordenadas geográficas automáticamente para mostrar el mapa.
- Selección múltiple de amenities.
- Preview antes de guardar.

### Ficha Pública de Propiedad
- URL pública compartible (`/property/[id]`) para enviar a clientes potenciales.
- Vista elegante con galería de fotos, mapa, características y datos de contacto.
- No requiere autenticación para visualizar.
- Botón de compartir por WhatsApp.

## 3.3 Gestión de Propietarios

### Listado de Propietarios
- Tabla completa con búsqueda por nombre, DNI o CUIT.
- Datos de contacto rápidos.

### Detalle de Propietario
- **Datos personales**: Nombre, apellido, DNI, CUIT, email, teléfono.
- **Datos bancarios**: CBU, alias de transferencia.
- **Dirección**: Calle, número, ciudad, provincia.
- **Propiedades vinculadas**: Listado de todas las propiedades del propietario.
- **Informe de liquidación**: Reporte automático de ingresos generados por las propiedades del propietario, con cálculo de comisión.
- **Acciones**: Contactar por WhatsApp, editar, eliminar.

### Alta/Edición de Propietario
- Formulario con validación de DNI y CUIT.
- Datos bancarios opcionales para liquidaciones.

## 3.4 Gestión de Clientes

### Listado de Clientes
- Tabla con búsqueda y filtros por tipo (comprador, inquilino, inversor), fuente (portal, recomendación, redes sociales, cartel, otro), estado.
- Datos de contacto y preferencias resumidos.

### Detalle de Cliente
- **Datos personales**: Nombre, apellido, DNI, email, teléfono.
- **Clasificación**: Tipo de cliente (comprador, inquilino, inversor), fuente de captación.
- **Preferencias de búsqueda**: Tipo de propiedad, operación, zona preferida, presupuesto mínimo y máximo, ambientes mínimos.
- **Propiedades compatibles (Matching)**: El sistema muestra automáticamente propiedades que coinciden con las preferencias del cliente, ordenadas por puntaje de compatibilidad.
- **Historial de interacciones**: Registro de contactos realizados con fecha, tipo (llamada, email, WhatsApp, visita) y notas.
- **Notas adicionales**: Campo libre para observaciones.
- **Acciones**: Contactar por WhatsApp, enviar propiedad, editar.

### Alta/Edición de Cliente
- Formulario completo con preferencias de búsqueda.
- Selección de tipo y fuente con iconos descriptivos.

## 3.5 Gestión de Contratos

### Listado de Contratos
- Tabla con información de propiedad, inquilino, fechas de inicio y fin, monto, estado.
- Filtros por estado: activo, finalizado, rescindido.
- **Indicador visual de vencimiento**: Contratos próximos a vencer se resaltan.

### Datos del Contrato
- **Partes**: Propiedad vinculada, propietario e inquilino.
- **Fechas**: Inicio, fin, período de contrato.
- **Financiero**: Monto del alquiler, moneda, depósito/garantía.
- **Ajustes**: Tipo de ajuste (ICL, IPC, Casa Propia), frecuencia de ajuste (trimestral, semestral, anual), último ajuste aplicado, próximo ajuste.
- **Estado**: Activo, Finalizado, Rescindido.
- **Notas**: Observaciones y cláusulas especiales.

### Calculadora de Ajuste de Alquiler
- Modal integrado en la página de contratos.
- Soporte para los tres índices de ajuste argentinos:
  - **ICL (Índice de Contratos de Locación)**: Para contratos anteriores a julio 2023.
  - **IPC (Índice de Precios al Consumidor)**: Índice general de inflación.
  - **Casa Propia**: Índice específico para viviendas.
- Ingreso de monto actual y porcentaje de ajuste.
- Cálculo automático del nuevo monto.
- Información explicativa sobre cada índice.

## 3.6 Gestión de Cobros y Pagos

### Listado de Pagos
- Registro de todos los pagos asociados a contratos.
- Filtros por contrato, fecha, estado.
- **Estados de pago**: Pendiente, Pagado, Vencido.

### Registro de Pago
- Monto, fecha de vencimiento, fecha de pago efectivo.
- Método de pago: Efectivo, Transferencia, Cheque, Tarjeta.
- Vinculación automática al contrato correspondiente.
- Notas y comprobante.

## 3.7 Gestión de Caja y Finanzas

### Cuentas de Caja
- Múltiples cuentas bancarias o de caja.
- Saldo actual por cuenta.
- Cuenta principal destacada.

### Movimientos
- Registro de ingresos y egresos con categoría.
- Categorías: Alquiler, Venta, Comisión, Expensas, Mantenimiento, Impuestos, Servicios, Otro.
- Asociación opcional a propiedad.
- Balances calculados automáticamente.
- Filtros por fecha, tipo, categoría y cuenta.

## 3.8 Sistema de Alertas y Vencimientos

Página dedicada (`/dashboard/alerts`) con notificaciones inteligentes organizadas por severidad:

- **Críticas (rojo)**: Contratos vencidos sin renovar, pagos con mora.
- **Advertencias (amarillo)**: Contratos que vencen en los próximos 30 días, pagos próximos a vencer, ajustes de alquiler pendientes.
- **Informativas (azul)**: Citas programadas para hoy, nuevos clientes registrados.

Cada alerta incluye:
- Icono según severidad.
- Descripción del evento.
- Fecha relevante.
- Acción sugerida.
- Link directo al recurso afectado.

## 3.9 Calendario y Agenda

### Vista de Calendario
- Calendario mensual interactivo.
- Visualización de citas programadas con código de color.
- Navegación entre meses.

### Gestión de Citas
- **Tipos**: Visita a propiedad, reunión con cliente, firma de contrato, tasación, otro.
- **Estados**: Programada, Confirmada, Cancelada, Completada.
- **Datos**: Fecha y hora, propiedad asociada, cliente asociado, descripción.
- Creación rápida desde el calendario.

## 3.10 Reportes y Estadísticas

Panel de reportes con múltiples visualizaciones:

- **Ingresos mensuales**: Gráfico de área con evolución temporal.
- **Distribución por operación**: Gráfico de torta (alquiler vs. venta).
- **Propiedades por estado**: Barras horizontales (disponible, alquilada, vendida, reservada).
- **Top propiedades**: Ranking por ingresos generados.
- **Métricas clave**: Ocupación, ticket promedio, tasa de conversión.
- **Filtros**: Período de tiempo personalizable.

## 3.11 Pipeline de Ventas (Leads)

### Vista Pipeline
- Tablero estilo Kanban con etapas: Nuevo, Contactado, En Negociación, Visita Programada, Oferta Realizada, Cerrado.
- Drag & drop para mover leads entre etapas.
- Valor estimado por etapa.

### Gestión de Leads
- Origen del lead (portal, redes, referido, cartel, etc.).
- Asignación a propiedad y agente.
- Historial de actividades.
- Probabilidad de cierre.

## 3.12 Buscador Global

- Búsqueda unificada accesible desde la barra superior (`Ctrl+K`).
- Busca en propiedades, clientes, propietarios y contratos simultáneamente.
- Resultados agrupados por categoría con iconos.
- Navegación directa al recurso desde el resultado.

## 3.13 Integración WhatsApp

### Envío de Mensajes
- Botón de WhatsApp en fichas de clientes, propietarios y propiedades.
- Templates predefinidos:
  - **Saludo inicial**: Mensaje de bienvenida con datos de la agencia.
  - **Envío de propiedad**: Ficha resumida con link a la propiedad pública.
  - **Recordatorio de pago**: Aviso de pago pendiente con monto y fecha.
  - **Confirmación de cita**: Datos de la visita programada.
  - **Mensaje personalizado**: Texto libre.
- Apertura directa en WhatsApp Web o app móvil via `wa.me`.

## 3.14 Mapa de Propiedades

- Mapa interactivo (Leaflet + OpenStreetMap) en la página de detalle de cada propiedad.
- Marcador con ubicación exacta basada en coordenadas.
- Geocodificación automática: el sistema convierte direcciones en coordenadas usando la API de Nominatim (OpenStreetMap).
- Zoom y navegación interactiva.

## 3.15 Configuración de la Agencia

### Datos de la Agencia
- Nombre, dirección, teléfono, email, sitio web.
- Logo (URL).
- CUIT de la empresa.
- Horario de atención.

### Gestión del Plan
- Visualización del plan actual con límites.
- Comparación de planes disponibles.
- Solicitud de cambio de plan (requiere aprobación del SuperAdmin).
- Información de cada plan con límites y precios.

## 3.16 Gestión de Empleados

- Alta de empleados/agentes con roles asignados.
- Datos: nombre, email, teléfono, rol (USER, ADMIN).
- Activación/desactivación de cuentas.
- Límite de usuarios según plan contratado.

## 3.17 Gestión de Deudas

- Registro de deudas y obligaciones financieras de la agencia.
- Seguimiento de pagos parciales.
- Estado: pendiente, parcialmente pagada, pagada, vencida.
- Asociación a propiedades o proveedores.

## 3.18 Proveedores

- Base de datos de proveedores y prestadores de servicios.
- Datos de contacto y rubro.
- Registro de servicios contratados.
- Historial de pagos a proveedores.

---

# 4. SISTEMA DE PLANES Y PRECIOS

InmoGestor opera con un modelo de suscripción mensual con cuatro niveles:

| Característica | STARTER | PROFESIONAL | PREMIUM | ENTERPRISE |
|---|---|---|---|---|
| **Precio mensual** | $9,999 | $19,999 | $39,999 | $79,999 |
| **Propiedades** | 20 | 100 | 500 | Ilimitadas |
| **Usuarios** | 2 | 5 | 15 | Ilimitados |
| **Clientes** | 50 | 500 | 5,000 | Ilimitados |
| **Reportes** | Básicos | Avanzados | Avanzados | Avanzados + Personalizados |
| **Soporte** | Email | Email + Chat | Prioritario | Dedicado + SLA |

**Alias de pago**: total.abundance.cp

---

# 5. SISTEMA DE ROLES Y PERMISOS

## 5.1 Roles

| Rol | Descripción | Alcance |
|---|---|---|
| **USER** | Empleado/agente inmobiliario | Acceso al dashboard de su agencia, gestión de propiedades, clientes y citas |
| **ADMIN** | Administrador de agencia | Todo lo anterior + configuración de agencia, gestión de empleados, reportes completos |
| **SUPERADMIN** | Administrador de la plataforma | Panel de administración global, gestión de todas las agencias, usuarios y solicitudes de cambio de plan |

## 5.2 Multi-Tenancy

- Cada agencia opera en un espacio aislado.
- Los datos de una agencia no son visibles para otra.
- Todas las consultas a la base de datos están filtradas por `agencyId`.
- Los SuperAdmins tienen acceso transversal para administración de la plataforma.

---

# 6. PANEL DE ADMINISTRACIÓN (SUPERADMIN)

Accesible solo para SuperAdmins en la ruta `/admin`:

### 6.1 Panel General
- Estadísticas globales: total de agencias, usuarios y propiedades en la plataforma.
- Gráficos de crecimiento.

### 6.2 Gestión de Agencias
- Listado de todas las agencias registradas.
- Detalle de cada agencia: plan actual, cantidad de propiedades/usuarios, fecha de registro.
- Activación/desactivación de agencias.

### 6.3 Gestión de Usuarios
- Listado global de usuarios.
- Filtro por agencia y rol.
- Activación/desactivación de cuentas.

### 6.4 Solicitudes de Cambio de Plan
- Cola de solicitudes pendientes.
- Aprobación o rechazo con motivo.
- Historial de solicitudes procesadas.

---

# 7. ARQUITECTURA TÉCNICA

## 7.1 Stack Tecnológico

| Componente | Tecnología | Versión |
|---|---|---|
| **Framework** | Next.js (App Router) | 14.2.35 |
| **Lenguaje** | TypeScript | 5.x |
| **Frontend** | React | 18.x |
| **Estilos** | Tailwind CSS | 3.4.1 |
| **Base de datos** | PostgreSQL | (Neon serverless) |
| **ORM** | Prisma | 5.22.0 |
| **Autenticación** | NextAuth.js | 4.24.13 |
| **Gráficos** | Recharts | 2.15.0 |
| **Mapas** | Leaflet + react-leaflet | 1.9.4 / 5.0.0 |
| **Iconos** | Lucide React | 0.577.0 |
| **Hashing** | bcryptjs | 2.4.3 |

## 7.2 Modelo de Datos

La base de datos está compuesta por **10 modelos principales**:

### User (Usuarios)
- Campos: id, email, password (hasheado con bcrypt), name, role (USER/ADMIN/SUPERADMIN), agencyId, isActive, createdAt
- Relaciones: pertenece a una Agency

### Agency (Agencias)
- Campos: id, name, address, phone, email, website, logo, cuit, businessHours, plan (STARTER/PROFESIONAL/PREMIUM/ENTERPRISE), isActive, createdAt
- Relaciones: tiene muchos Users, Properties, Owners, Clients, Contracts, Payments, Appointments, Transactions, CashAccounts, CashMovements

### Property (Propiedades)
- Campos: id, title, description, type (DEPARTAMENTO/CASA/PH/TERRENO/LOTE/LOCAL/OFICINA/COCHERA/GALPON/FONDO_DE_COMERCIO/CAMPO/QUINTA), operation (VENTA/ALQUILER/ALQUILER_TEMPORAL/PERMUTA), status (DISPONIBLE/RESERVADA/ALQUILADA/VENDIDA/NO_DISPONIBLE), price, currency (ARS/USD), expensas, address, street, number, floor, apartment, neighborhood, city, province, country, latitude, longitude, totalArea, coveredArea, rooms, bedrooms, bathrooms, garages, age, orientation, condition (EXCELENTE/MUY_BUENO/BUENO/REGULAR/A_RECICLAR/EN_CONSTRUCCION/A_ESTRENAR/POZO), amenities[], photos[], videoUrl, ownerId, agencyId, createdAt, updatedAt
- Relaciones: pertenece a Owner y Agency, tiene muchos Contracts y Appointments

### Owner (Propietarios)
- Campos: id, firstName, lastName, dni, cuit, email, phone, address, city, province, bankCbu, bankAlias, notes, agencyId, createdAt
- Relaciones: pertenece a Agency, tiene muchas Properties

### Client (Clientes)
- Campos: id, firstName, lastName, dni, email, phone, type (COMPRADOR/INQUILINO/INVERSOR), source (PORTAL/RECOMENDACION/REDES_SOCIALES/CARTEL/OTRO), notes, preferredPropertyType, preferredOperation, preferredZone, budgetMin, budgetMax, minRooms, isActive, agencyId, createdAt
- Relaciones: pertenece a Agency, tiene muchos Appointments

### Contract (Contratos)
- Campos: id, propertyId, clientId, ownerId, startDate, endDate, amount, currency, deposit, status (ACTIVO/FINALIZADO/RESCINDIDO), adjustmentType (ICL/IPC/CASA_PROPIA), adjustmentFrequency (TRIMESTRAL/SEMESTRAL/ANUAL), lastAdjustmentDate, nextAdjustmentDate, notes, agencyId, createdAt
- Relaciones: pertenece a Property, Client (inquilino), Owner y Agency

### Payment (Pagos)
- Campos: id, contractId, amount, dueDate, paymentDate, status (PENDIENTE/PAGADO/VENCIDO), method (EFECTIVO/TRANSFERENCIA/CHEQUE/TARJETA), notes, agencyId, createdAt
- Relaciones: pertenece a Contract y Agency

### Appointment (Citas)
- Campos: id, propertyId, clientId, date, type (VISITA/REUNION/FIRMA/TASACION/OTRO), status (PROGRAMADA/CONFIRMADA/CANCELADA/COMPLETADA), description, agencyId, createdAt
- Relaciones: pertenece a Property, Client y Agency

### Transaction (Transacciones)
- Campos: id, type (INGRESO/EGRESO), amount, category (ALQUILER/VENTA/COMISION/EXPENSAS/MANTENIMIENTO/IMPUESTOS/SERVICIOS/SUELDO/OTRO), description, date, propertyId, agencyId, createdAt
- Relaciones: pertenece a Property (opcional) y Agency

### PlanChangeRequest (Solicitudes de Cambio de Plan)
- Campos: id, agencyId, currentPlan, requestedPlan, status (PENDING/APPROVED/REJECTED), reason, adminNotes, createdAt, updatedAt
- Relaciones: pertenece a Agency

## 7.3 API REST

La aplicación expone más de **20 endpoints API**:

| Endpoint | Métodos | Descripción |
|---|---|---|
| `/api/auth/[...nextauth]` | GET, POST | Autenticación (login, logout, session) |
| `/api/auth/register` | POST | Registro de nueva agencia + admin |
| `/api/vehicles` (propiedades) | GET, POST | CRUD de propiedades con filtros |
| `/api/vehicles/[id]` | GET, PUT, DELETE | Operaciones sobre propiedad individual |
| `/api/vehicles/[id]/match` | GET | Matching de clientes compatibles |
| `/api/vehicles/[id]/share` | GET | Datos públicos para ficha compartible |
| `/api/vehicles/[id]/geocode` | POST | Geocodificación de dirección |
| `/api/clients` | GET, POST | CRUD de clientes |
| `/api/clients/[id]` | GET, PUT, DELETE | Operaciones sobre cliente individual |
| `/api/clients/[id]/match` | GET | Matching de propiedades compatibles |
| `/api/suppliers` | GET, POST | CRUD de propietarios |
| `/api/suppliers/[id]` | GET, PUT, DELETE | Operaciones sobre propietario |
| `/api/employees` | GET, POST | CRUD de empleados |
| `/api/employees/[id]` | PUT, DELETE | Operaciones sobre empleado |
| `/api/debts` | GET, POST | Gestión de contratos/deudas |
| `/api/calendar` | GET, POST | Gestión de citas |
| `/api/cash/accounts` | GET, POST | Cuentas de caja |
| `/api/cash/movements` | GET, POST | Movimientos de caja |
| `/api/dashboard` | GET | Datos del dashboard principal |
| `/api/reports` | GET | Datos para reportes |
| `/api/notifications` | GET | Alertas y notificaciones |
| `/api/search` | GET | Búsqueda global |
| `/api/dealership` | GET, PUT | Configuración de agencia |
| `/api/interactions` | POST | Registro de interacciones |

## 7.4 Seguridad

- **Autenticación**: NextAuth.js con provider de credenciales (email + contraseña).
- **Tokens**: JWT para sesiones stateless.
- **Hashing**: bcryptjs para almacenamiento seguro de contraseñas.
- **Multi-tenant**: Todas las queries filtran por `agencyId` del usuario autenticado, previniendo acceso a datos de otras agencias.
- **Roles**: Verificación de rol en cada endpoint sensible.
- **Protección de rutas**: Middleware que redirige usuarios no autenticados al login.

## 7.5 Interfaz de Usuario

- **Tema oscuro**: Fondo gris 950 con acentos en verde esmeralda (#059669).
- **Diseño responsivo**: Adaptable a desktop, tablet y móvil.
- **Componentes reutilizables**: Librería propia de UI (Button, Card, Modal, DataTable, Badge, Select, Tabs, Input).
- **Sidebar colapsable**: Navegación principal con iconos y etiquetas.
- **Barra superior**: Búsqueda global, notificaciones y menú de usuario.
- **Animaciones sutiles**: Transiciones CSS suaves en hover y estados.

---

# 8. PÁGINAS DE LA APLICACIÓN

## 8.1 Páginas Públicas

| Ruta | Descripción |
|---|---|
| `/` | Landing page con hero, features, planes y CTA |
| `/login` | Inicio de sesión |
| `/register` | Registro de nueva agencia |
| `/property/[id]` | Ficha pública de propiedad (compartible) |

## 8.2 Dashboard (requiere autenticación)

| Ruta | Descripción |
|---|---|
| `/dashboard` | Panel principal con KPIs y gráficos |
| `/dashboard/vehicles` | Listado de propiedades |
| `/dashboard/vehicles/[id]` | Detalle de propiedad con mapa y matching |
| `/dashboard/clients` | Listado de clientes |
| `/dashboard/clients/[id]` | Detalle de cliente con matching |
| `/dashboard/suppliers` | Listado de propietarios |
| `/dashboard/suppliers/[id]` | Detalle de propietario con liquidación |
| `/dashboard/debts` | Gestión de contratos |
| `/dashboard/cash` | Caja y movimientos financieros |
| `/dashboard/calendar` | Calendario de citas |
| `/dashboard/leads` | Pipeline de ventas |
| `/dashboard/pipeline` | Vista Kanban de leads |
| `/dashboard/reports` | Reportes y estadísticas |
| `/dashboard/alerts` | Alertas y vencimientos |
| `/dashboard/employees` | Gestión de empleados |
| `/dashboard/settings` | Configuración de agencia y plan |
| `/dashboard/integrations` | Integraciones con portales |

## 8.3 Administración (solo SUPERADMIN)

| Ruta | Descripción |
|---|---|
| `/admin` | Panel de administración global |
| `/admin/agencies` | Gestión de agencias |
| `/admin/users` | Gestión de usuarios |
| `/admin/plan-requests` | Solicitudes de cambio de plan |

---

# 9. ALGORITMO DE MATCHING

InmoGestor implementa un sistema de matching inteligente que conecta propiedades con clientes basándose en las preferencias declaradas por cada cliente.

### Criterios y Puntuación (máximo 110 puntos):

| Criterio | Puntaje máximo | Descripción |
|---|---|---|
| **Tipo de operación** | 40 puntos | Coincidencia exacta entre la operación de la propiedad (venta/alquiler) y la preferencia del cliente |
| **Rango de precio** | 30 puntos | El precio de la propiedad cae dentro del presupuesto mín-máx del cliente |
| **Zona/ubicación** | 20 puntos | Coincidencia parcial o total del barrio/ciudad preferido |
| **Ambientes** | 10 puntos | La propiedad tiene al menos la cantidad mínima de ambientes requeridos |
| **Tipo de propiedad** | 10 puntos | Coincidencia del tipo (depto, casa, etc.) con la preferencia |

### Funcionamiento:
1. Al ver el detalle de una propiedad, el sistema busca todos los clientes activos de la agencia.
2. Evalúa cada cliente contra la propiedad y calcula un puntaje.
3. Muestra los resultados ordenados de mayor a menor compatibilidad.
4. Desde el detalle de un cliente, se ejecuta el proceso inverso (buscar propiedades compatibles).

---

# 10. INTEGRACIONES

## 10.1 WhatsApp
- Envío de mensajes via URL `wa.me` con texto pre-formateado.
- Templates para diferentes situaciones (saludo, envío de propiedad, recordatorio de pago, confirmación de cita).
- Menú desplegable accesible desde fichas de clientes y propietarios.

## 10.2 OpenStreetMap / Nominatim
- Mapas interactivos en detalle de propiedades (Leaflet).
- Geocodificación automática de direcciones para obtener coordenadas.
- Sin costo de licencia (API gratuita).

## 10.3 Portales Inmobiliarios (Preparado)
- Módulo de integraciones preparado para conexión futura con:
  - **ZonaProp**: Principal portal inmobiliario de Argentina.
  - **Argenprop**: Portal inmobiliario argentino.
  - **MercadoLibre Inmuebles**: Marketplace con sección inmobiliaria.
- Interfaz de configuración disponible en `/dashboard/integrations`.

---

# 11. LANDING PAGE

La página principal pública (`/`) presenta InmoGestor con:

### Hero Section
- Título: "Gestioná tu inmobiliaria de forma inteligente"
- Subtítulo descriptivo del producto.
- Botones de CTA (Comenzar gratis, Ver demo).

### Features (6 características destacadas)
1. **Gestión de Propiedades**: Administrá tu cartera completa.
2. **CRM Inmobiliario**: Seguimiento de clientes y leads.
3. **Contratos y Cobros**: Gestión automatizada.
4. **Reportes Inteligentes**: Estadísticas en tiempo real.
5. **Calendario**: Agenda de visitas y reuniones.
6. **Multi-Sucursal**: Gestión centralizada de sucursales.

### Planes y Precios
- Tarjetas comparativas de los 4 planes.
- Destacado del plan "Profesional" como más popular.
- Precios en ARS (pesos argentinos).

### Footer
- Links de contacto y legales.

---

# 12. DATOS DE DEMOSTRACIÓN

La aplicación incluye un seed con datos de ejemplo para facilitar la evaluación:

- **1 Agencia demo**: "Inmobiliaria Demo" (Plan PREMIUM)
- **2 Usuarios**: SuperAdmin y Admin
- **2 Propietarios**: Con datos completos incluyendo bancarios
- **3 Propiedades**: Departamento en Palermo (alquiler), Casa en Belgrano (venta), Monoambiente en Caballito (alquiler)
- **Clientes, Contratos y Citas**: Datos de ejemplo para probar todas las funcionalidades

---

# 13. REQUISITOS DEL SISTEMA

## Para Desarrollo
- Node.js 18+
- PostgreSQL (o Neon serverless)
- npm o yarn

## Para Producción
- Servidor compatible con Node.js (Vercel recomendado)
- Base de datos PostgreSQL en la nube (Neon recomendado)
- Dominio propio (opcional)

## Variables de Entorno Requeridas
- `DATABASE_URL`: URL de conexión a PostgreSQL
- `NEXTAUTH_SECRET`: Clave secreta para JWT
- `NEXTAUTH_URL`: URL base de la aplicación

---

# 14. INSTALACIÓN Y DESPLIEGUE

```bash
# Clonar repositorio
git clone https://github.com/ezequieldarevalo/inmobiliaria.git

# Instalar dependencias
cd inmobiliaria
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con las credenciales requeridas

# Ejecutar migraciones
npx prisma migrate deploy

# Cargar datos de ejemplo (opcional)
npx prisma db seed

# Iniciar en desarrollo
npm run dev

# Build para producción
npm run build
npm start
```

---

# 15. RESUMEN DE CARACTERÍSTICAS

| Categoría | Cantidad |
|---|---|
| **Rutas totales** | 40 |
| **Endpoints API** | 20+ |
| **Modelos de datos** | 10 |
| **Tipos de propiedad** | 12 |
| **Tipos de operación** | 4 |
| **Estados de propiedad** | 5 |
| **Amenities disponibles** | 12 |
| **Roles de usuario** | 3 |
| **Planes de suscripción** | 4 |
| **Tipos de gráfico** | 3 (Área, Torta, Barras) |
| **Métodos de pago** | 4 |
| **Tipos de cita** | 5 |
| **Índices de ajuste** | 3 (ICL, IPC, Casa Propia) |
| **Fuentes de clientes** | 5 |

---

*Documentación generada para InmoGestor v1.0*
*Software de Gestión Inmobiliaria - SaaS para Argentina*
*© 2025 InmoGestor - Todos los derechos reservados*
