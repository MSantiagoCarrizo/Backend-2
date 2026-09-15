# Plataforma de Cursos

API REST desarrollada con Node.js, Express y MongoDB para la gestión de usuarios y autenticación mediante Passport.js, JWT y cookies HTTP Only.

El dominio de la API está modelado con una nomenclatura genérica de gestión de eventos (`Event`, `Category`, `Ticket`), mientras que el producto está tematizado como una **plataforma de cursos**: cada `Event` representa un curso o taller (por ejemplo, "Curso de JavaScript" o "Curso de Fotografía"), cada `Category` una disciplina (Tecnología, Diseño, Fotografía, etc.), y cada `Ticket` la inscripción de un alumno a un curso. Mantener el modelo de datos genérico permite reutilizar la misma API para cualquier dominio basado en eventos con cupo e inscripciones (charlas, workshops, conferencias, torneos), cambiando únicamente la capa de presentación.

## Tecnologías utilizadas

- Node.js
- Express
- MongoDB Atlas
- Mongoose
- bcrypt
- dotenv
- jsonwebtoken
- cookie-parser
- passport.js
- passport-local
- passport-jwt
- nodemailer

## Instalación

1. Clonar el repositorio:

```bash
git clone https://github.com/MSantiagoCarrizo/Backend-2
```

2. Ingresar al proyecto:

```bash
cd backend-2
```

3. Instalar dependencias:

```bash
npm install
```

4. Crear un archivo `.env` tomando como referencia `.env.example`. El detalle de cada variable está en la sección [Variables de entorno](#variables-de-entorno), más abajo.

5. Ejecutar el proyecto:

Modo desarrollo:

```bash
npm run dev
```

Modo producción:

```bash
npm start
```

---

# Estructura del proyecto

```
src
├── config
├── controllers
├── dao
├── dto
├── middlewares
├── models
├── repositories
├── routes
├── services
├── utils
├── app.js
└── server.js
```

---

# Arquitectura en capas

El proyecto separa responsabilidades en capas, donde cada una tiene una única función clara. Una petición recorre el sistema de la siguiente forma:

```
Route → Controller → Service → Repository → DAO → Model
```

Y al momento de responder:

```
Model → Repository → Service → Controller → DTO → Response
```

## Responsabilidad de cada capa

- **Routes**: definen los endpoints disponibles y qué middlewares/controller ejecutar. No contienen lógica de negocio.
- **Controllers**: reciben la request y arman la response. No calculan cupos, no validan reglas de negocio y no importan modelos de Mongoose — todo eso se delega al service.
- **Services**: concentran toda la lógica de negocio (validaciones de eventos, control de cupos, duplicados, permisos sobre recursos propios, disparo de emails). Nunca acceden a los modelos directamente, siempre a través de un repository.
- **Repositories**: capa intermedia entre el service y el DAO, con métodos orientados al dominio (`getEventById`, `getActiveTicketByUserAndEvent`, `reserveCapacity`). No importan modelos directamente.
- **DAO** (Data Access Object): única capa que importa los modelos de Mongoose y ejecuta las consultas concretas (`find`, `findOneAndUpdate`, `aggregate`, etc.).
- **Models**: definen los schemas de Mongoose y las validaciones a nivel de base de datos.
- **DTO** (Data Transfer Object): controlan qué datos viajan hacia el cliente en la respuesta final. Transforman los documentos de Mongoose (que pueden tener campos internos o sensibles) en una forma controlada y segura.

## DTOs implementados

| DTO | Usado en | Filtra |
|---|---|---|
| `CurrentUserDTO` | `GET /api/sessions/current` | Expone solo `id`, `email`, `role` |
| `EventResponseDTO` | Todos los endpoints de `/api/events` | Si `category`/`organizer` vienen poblados, los reduce a sus campos mínimos (`id`, `name`, `description` / `id`, `first_name`, `last_name`, `email`); si no, deja pasar el `id` en crudo. No expone `createdAt`/`updatedAt`/`reservedSeats` |
| `TicketResponseDTO` | Todos los endpoints de `/api/tickets` y `/api/events/:eid/tickets` | Nunca expone `password`; si `event`/`user` vienen poblados, los reduce a sus campos mínimos, si no, deja pasar el `id` en crudo |
| `UserResponseDTO` | `POST /api/sessions/register`, `GET /api/users` | Expone `id`, `first_name`, `last_name`, `email`, `role` — nunca `password`, ni `createdAt`/`updatedAt` |

Ningún DTO valida reglas de negocio ni consulta la base de datos — solo dan forma a la salida. Esa responsabilidad sigue siendo exclusiva de los services.

---

# Autenticación con Passport.js

La autenticación se encuentra centralizada mediante estrategias de Passport.js.

## Estrategia `register`

La estrategia de registro se encarga de:

- Validar los campos obligatorios.
- Normalizar nombre, apellido y email.
- Validar el formato del email.
- Verificar que el email no se encuentre registrado.
- Validar la longitud mínima de la contraseña.
- Hashear la contraseña utilizando bcrypt.
- Crear el usuario mediante el repositorio.
- Mantener el rol user por defecto sin permitir su manipulación desde el body.

## Estrategia `login`

La estrategia de login se encarga de:

- Validar la presencia de email y contraseña.
- Normalizar el email.
- Buscar el usuario registrado.
- Comparar la contraseña ingresada con el hash almacenado mediante bcrypt.
- Rechazar credenciales inválidas utilizando un mensaje genérico.

Una vez autenticado correctamente, el controller genera el JWT y lo almacena en la cookie currentUser.

## Estrategia `current`

La estrategia current se encarga de:

- Obtener el JWT desde la cookie `currentUser`.
- Verificar el token utilizando `JWT_SECRET`.
- Validar su firma y expiración.
- Dejar la información del usuario disponible en `req.user`.

La ruta devuelve únicamente:

- `id`
- `email`
- `role`

La contraseña nunca se incluye en el JWT ni en las respuestas.

Las estrategias se encuentran centralizadas en:

`src/config/passport.config.js`

El sistema queda preparado para incorporar futuras estrategias de autenticación mediante providers externos como Google o GitHub sin modificar la inicialización de Passport en `app.js`.

---

# Endpoints

## Health

### GET `/api/health`

Verifica que el servidor esté funcionando.

Respuesta:

```json
{
  "status": "success",
  "message": "Servidor activo"
}
```

---

## Categorías

Las categorías clasifican los eventos y se modelan como una entidad independiente (`name`, `description`), referenciada desde `Event.category` mediante su `ObjectId`.

Actualmente no exponen endpoints propios (`/api/categories`); se administran directamente en la base de datos. Para crear una categoría, se inserta un documento en la colección `categories`:

```json
{ "name": "Tecnología", "description": "Cursos y talleres de programación." }
```

El `_id` generado es el valor que debe usarse en el campo `category` al crear un evento.

---

## Events

### Modelo `Event`

| Campo | Tipo | Detalle |
|---|---|---|
| `title` | String | obligatorio |
| `description` | String | obligatorio |
| `category` | ObjectId (ref `Category`) | obligatorio |
| `date` | Date | obligatorio, debe ser futura al crear |
| `location` | String | obligatorio |
| `capacity` | Number | obligatorio, > 0 |
| `reservedSeats` | Number | default `0`, ≥ 0. Contador de lugares ya reservados, actualizado de forma atómica. No se expone en las respuestas (no pasa por `EventResponseDTO`) |
| `price` | Number | opcional, default `0`, ≥ 0 |
| `status` | String | `draft` \| `published` \| `cancelled` \| `finished`, default `draft` |
| `organizer` | ObjectId (ref `User`) | asignado automáticamente desde `req.user` |

### GET `/api/events`

Lista eventos. Ruta pública. Soporta filtros, paginación y ordenamiento vía query params.

| Query param | Descripción |
|---|---|
| `status` | `draft` \| `published` \| `cancelled` \| `finished` |
| `category` | `_id` de una categoría |
| `location` | búsqueda parcial, case-insensitive |
| `dateFrom` / `dateTo` | rango de fechas |
| `search` | busca en `title` o `description` |
| `page` | página actual (default `1`) |
| `limit` | resultados por página (default `10`, máximo `50`) |
| `sort` | `date`, `title`, `price`, `capacity`, `createdAt`. Prefijo `-` para descendente |

Ejemplo: `GET /api/events?status=published&category=65f1...&page=2&limit=5&sort=-date`

### Respuesta exitosa (200)

```json
{
  "status": "success",
  "data": [
    {
      "id": "66f...",
      "title": "Curso de JavaScript",
      "description": "Introducción a JS moderno",
      "date": "2026-12-01T00:00:00.000Z",
      "location": "Online",
      "capacity": 30,
      "price": 0,
      "status": "published",
      "category": { "id": "65f1...", "name": "Tecnología", "description": "Cursos y talleres de programación." },
      "organizer": { "id": "66a...", "first_name": "Marco", "last_name": "Carrizo", "email": "marco@ejemplo.com" }
    }
  ],
  "page": 2,
  "limit": 5,
  "total": 12,
  "totalPages": 3
}
```

---

### GET `/api/events/:id`

Obtiene el detalle de un evento, con `category` y `organizer` poblados. Ruta pública.

### Respuesta exitosa (200)

```json
{
  "status": "success",
  "payload": {
    "id": "66f...",
    "title": "Curso de JavaScript",
    "description": "Introducción a JS moderno",
    "date": "2026-12-01T00:00:00.000Z",
    "location": "Online",
    "capacity": 30,
    "price": 0,
    "status": "published",
    "category": { "id": "65f1...", "name": "Tecnología", "description": "Cursos y talleres de programación." },
    "organizer": { "id": "66a...", "first_name": "Marco", "last_name": "Carrizo", "email": "marco@ejemplo.com" }
  }
}
```

### Error (404)

```json
{ "status": "error", "message": "Evento no encontrado" }
```

---

### POST `/api/events`

Crea un evento nuevo. Requiere estar autenticado y tener rol `organizer` o `admin`. El campo `organizer` se asigna automáticamente a partir del usuario autenticado; nunca se toma del body. El campo `status` tampoco se toma del body: todo evento nace en `draft`.

### Body

```json
{
  "title": "Curso de JavaScript",
  "description": "Introducción a JS moderno",
  "category": "65f1...",
  "date": "2026-12-01",
  "location": "Online",
  "capacity": 30,
  "price": 0
}
```

### Respuesta exitosa (201)

`category` y `organizer` viajan como `id` en crudo (sin poblar) porque este endpoint no hace `populate` sobre el documento recién creado.

```json
{
  "status": "success",
  "payload": {
    "id": "66f...",
    "title": "Curso de JavaScript",
    "description": "Introducción a JS moderno",
    "date": "2026-12-01T00:00:00.000Z",
    "location": "Online",
    "capacity": 30,
    "price": 0,
    "status": "draft",
    "category": "65f1...",
    "organizer": "66a..."
  }
}
```

### Posibles respuestas de error

**401 - No autenticado**

```json
{ "status": "error", "message": "No autenticado" }
```

**403 - Rol sin permiso**

```json
{ "status": "error", "message": "No tenés permisos para realizar esta acción" }
```

**400 - Campos obligatorios**

```json
{ "status": "error", "message": "Faltan campos obligatorios" }
```

**400 - Fecha pasada**

```json
{ "status": "error", "message": "La fecha del evento debe ser futura" }
```

**400 - Categoría inexistente**

```json
{ "status": "error", "message": "La categoría indicada no existe" }
```

---

### PUT `/api/events/:id`

Actualiza los datos de un evento existente. Requiere ser el `organizer` dueño del evento o tener rol `admin`. Los campos `organizer` y `status` se ignoran si vienen en el body. No permite editar eventos `cancelled` o `finished`.

### Body

```json
{
  "title": "Curso de JavaScript (actualizado)",
  "capacity": 40
}
```

### Respuesta exitosa (200)

Igual que en `POST`, `category` y `organizer` viajan como `id` en crudo (este endpoint tampoco hace `populate`).

```json
{
  "status": "success",
  "payload": {
    "id": "66f...",
    "title": "Curso de JavaScript (actualizado)",
    "description": "Introducción a JS moderno",
    "date": "2026-12-01T00:00:00.000Z",
    "location": "Online",
    "capacity": 40,
    "price": 0,
    "status": "draft",
    "category": "65f1...",
    "organizer": "66a..."
  }
}
```

### Posibles respuestas de error

**401 - No autenticado**

```json
{ "status": "error", "message": "No autenticado" }
```

**403 - No es el dueño del evento**

```json
{ "status": "error", "message": "No tenés permisos para modificar este evento" }
```

**404 - Evento no encontrado**

```json
{ "status": "error", "message": "Evento no encontrado" }
```

**400 - Evento cancelado o finalizado**

```json
{ "status": "error", "message": "No se puede modificar un evento cancelado" }
```

---

### PATCH `/api/events/:id/status`

Cambia el estado de un evento (`draft`, `published`, `cancelled`, `finished`). Mismo control de propiedad que `PUT`. Cancelar un evento no lo elimina: solo cambia su `status`, conservando el historial.

### Body

```json
{ "status": "published" }
```

### Respuesta exitosa (200)

```json
{
  "status": "success",
  "payload": {
    "id": "66f...",
    "title": "Curso de JavaScript",
    "description": "Introducción a JS moderno",
    "date": "2026-12-01T00:00:00.000Z",
    "location": "Online",
    "capacity": 30,
    "price": 0,
    "status": "published",
    "category": "65f1...",
    "organizer": "66a..."
  }
}
```

### Posibles respuestas de error

**400 - Evento cancelado o finalizado**

```json
{ "status": "error", "message": "No se puede modificar el estado de un evento cancelado o finalizado" }
```

**400 - Publicar con fecha ya pasada**

```json
{ "status": "error", "message": "No se puede publicar un evento que ya finalizó" }
```

**401 / 403 / 404**: mismas respuestas que `PUT /api/events/:id`.

---

## Reglas de negocio de eventos

Toda la lógica vive en `events.service.js`, nunca en rutas o controllers.

- No se puede crear un evento con `date` pasada.
- `capacity` debe ser mayor a 0; `price` no puede ser negativo.
- `category` debe existir en la colección `Category`.
- Un evento `cancelled` o `finished` no puede editarse ni cambiar de estado nuevamente.
- No se puede publicar un evento cuya fecha ya pasó.
- Cancelar un evento nunca lo elimina físicamente, solo cambia su `status`.
- `organizer` y `status` nunca se toman del body en `PUT`; `organizer` es inmutable y `status` solo cambia con `PATCH /:id/status`.

---

## Tickets (inscripciones)

Un `Ticket` representa la inscripción de un usuario a un evento. Conecta `User` y `Event`, y solo contiene referencias, nunca objetos embebidos.

### Modelo `Ticket`

| Campo | Tipo | Detalle |
|---|---|---|
| `user` | ObjectId (ref `User`) | obligatorio, se asigna desde `req.user`, nunca del body |
| `event` | ObjectId (ref `Event`) | obligatorio |
| `status` | String | `confirmed` \| `pending` \| `cancelled`, default `confirmed` |
| `quantity` | Number | default `1`, mínimo `1` |
| `reservationCode` | String | único, generado automáticamente (`TCK-XXXXXX`) |
| `cancelledAt` | Date | `null` hasta que se cancela |

Cancelar un ticket **nunca** elimina el documento: solo cambia `status` a `cancelled` y completa `cancelledAt`, para conservar historial.

### Endpoints

| Método | Ruta | Acceso |
|---|---|---|
| `POST` | `/api/events/:eid/tickets` | autenticado (cualquier rol) |
| `GET` | `/api/tickets/my-tickets` | autenticado (propios) |
| `GET` | `/api/events/:eid/tickets` | `organizer` dueño del evento, o `admin` |
| `PATCH` | `/api/tickets/:tid/cancel` | dueño del ticket, o `admin` |

---

### POST `/api/events/:eid/tickets`

Inscribe al usuario autenticado al evento `:eid`. El `user` del ticket sale de `req.user`, nunca del body.

#### Body

```json
{ "quantity": 1 }
```

`quantity` es opcional (default `1`).

#### Respuesta exitosa (201)

`event` y `user` viajan como `id` en crudo (este endpoint no hace `populate` sobre el ticket recién creado).

```json
{
  "status": "success",
  "payload": {
    "id": "66f...",
    "status": "confirmed",
    "quantity": 1,
    "reservationCode": "TCK-3F2A9C",
    "cancelledAt": null,
    "createdAt": "2026-09-15T20:00:00.000Z",
    "event": "66f...",
    "user": "66a..."
  }
}
```

Si la inscripción se crea correctamente, se envía un email de confirmación con Nodemailer al correo del usuario. Si el envío del email falla, la inscripción **igual queda creada**: el email es una notificación posterior, no forma parte de la operación principal.

#### Posibles respuestas de error

**401 - No autenticado**

```json
{ "status": "error", "message": "No autenticado" }
```

**404 - Evento no encontrado**

```json
{ "status": "error", "message": "Evento no encontrado" }
```

**400 - Evento no disponible para inscripciones** (no está `published`)

```json
{ "status": "error", "message": "El evento no está disponible para inscripciones" }
```

**400 - Evento finalizado**

```json
{ "status": "error", "message": "No es posible inscribirse a un evento finalizado" }
```

**400 - Cantidad inválida**

```json
{ "status": "error", "message": "La cantidad debe ser mayor a cero" }
```

**409 - Inscripción duplicada**

```json
{ "status": "error", "message": "Ya tenés una inscripción activa para este evento" }
```

**400 - Sin cupo suficiente**

```json
{ "status": "error", "message": "No hay cupos suficientes disponibles" }
```

---

### GET `/api/tickets/my-tickets`

Devuelve las inscripciones del usuario autenticado, con el evento poblado (`title`, `date`, `location`, `status`). No expone datos de otros usuarios.

#### Respuesta exitosa (200)

`user` viaja como `id` en crudo (es el propio usuario autenticado; este endpoint solo pobla `event`).

```json
{
  "status": "success",
  "payload": [
    {
      "id": "66f...",
      "status": "confirmed",
      "quantity": 1,
      "reservationCode": "TCK-3F2A9C",
      "cancelledAt": null,
      "createdAt": "2026-09-15T20:00:00.000Z",
      "event": { "id": "66f...", "title": "Curso de JavaScript", "date": "2026-12-01T00:00:00.000Z", "location": "Online", "status": "published" },
      "user": "66a..."
    }
  ]
}
```

---

### GET `/api/events/:eid/tickets`

Lista las inscripciones de un evento puntual. Solo el `organizer` dueño de ese evento o un `admin` pueden verla; incluye datos básicos del usuario inscripto (`id`, `first_name`, `last_name`, `email`). Acá es al revés que en `my-tickets`: se pobla `user`, y `event` viaja como `id` en crudo.

#### Posibles respuestas de error

**401 - No autenticado**, **403 - Sin permiso** (rol `user`, u `organizer` de otro evento), **404 - Evento no encontrado**.

---

### PATCH `/api/tickets/:tid/cancel`

Cancela una inscripción. Solo puede cancelarla el dueño del ticket o un `admin`.

#### Respuesta exitosa (200)

`event` y `user` viajan como `id` en crudo (mismo motivo que en la creación: este endpoint no hace `populate`).

```json
{
  "status": "success",
  "payload": {
    "id": "66f...",
    "status": "cancelled",
    "quantity": 1,
    "reservationCode": "TCK-3F2A9C",
    "cancelledAt": "2026-09-15T20:10:00.000Z",
    "createdAt": "2026-09-15T20:00:00.000Z",
    "event": "66f...",
    "user": "66a..."
  }
}
```

Al confirmarse la cancelación se envía un email avisando al usuario (mismo criterio que la confirmación: si el email falla, la cancelación igual queda aplicada).

#### Posibles respuestas de error

**401 - No autenticado**

```json
{ "status": "error", "message": "No autenticado" }
```

**403 - Ticket ajeno**

```json
{ "status": "error", "message": "No tenés permisos para cancelar este ticket" }
```

**404 - Ticket no encontrado**

```json
{ "status": "error", "message": "Ticket no encontrado" }
```

**400 - Ya estaba cancelado**

```json
{ "status": "error", "message": "El ticket ya está cancelado" }
```

---

## Reglas de negocio de tickets

Toda la lógica vive en `tickets.service.js`, nunca en rutas o controllers.

- El evento debe existir, estar en estado `published` y no haber finalizado (fecha futura) para aceptar inscripciones.
- Un usuario no puede tener más de una inscripción activa (`confirmed`) para el mismo evento; sí puede volver a inscribirse si su ticket anterior está `cancelled`.
- El cupo se controla mediante el contador `reservedSeats` del propio evento, no recalculando sobre la colección de tickets en cada inscripción. Reservar y liberar cupo son operaciones atómicas (`findOneAndUpdate` con condición `$expr`), para que dos inscripciones simultáneas nunca puedan superar la `capacity` del evento aunque lleguen al mismo tiempo. Cancelar un ticket libera automáticamente su cupo restando de `reservedSeats`.
- Cancelar un ticket no lo elimina: cambia su `status` a `cancelled` y completa `cancelledAt`, conservando el historial.
- El `user` de un ticket siempre sale de `req.user`; nunca se toma del body.
- Si el envío del email (confirmación o cancelación) falla, la operación principal (crear o cancelar el ticket) igual se completa; el error se registra en el log del servidor.

---

## Usuarios (admin)

### GET `/api/users`

Devuelve la lista completa de usuarios registrados, sin incluir contraseñas. Ruta exclusiva para el rol `admin`.

### Respuesta exitosa (200)

```json
{
  "status": "success",
  "payload": [
    {
      "id": "66a...",
      "first_name": "Marco",
      "last_name": "Carrizo",
      "email": "marco@ejemplo.com",
      "role": "admin"
    }
  ]
}
```

### Posibles respuestas de error

**401 - No autenticado**

```json
{ "status": "error", "message": "No autenticado" }
```

**403 - Rol sin permiso** (por ejemplo, `user` u `organizer`)

```json
{ "status": "error", "message": "No tenés permisos para realizar esta acción" }
```

---

## Sessions

### GET `/api/sessions`

Endpoint de prueba para sesiones.

Respuesta:

```json
{
  "status": "success",
  "message": "Sessions endpoint"
}
```

---

## Registro de usuarios

### POST `/api/sessions/register`

Registra un nuevo usuario mediante la estrategia `register` de Passport.js.

### Body

```json
{
  "first_name": "Santiago",
  "last_name": "Carrizo",
  "email": "santiago@gmail.com",
  "password": "123456"
}
```

### Respuesta exitosa (201)

```json
{
  "status": "success",
  "payload": {
    "id": "665f2a...",
    "first_name": "Santiago",
    "last_name": "Carrizo",
    "email": "santiago@gmail.com",
    "role": "user"
  }
}
```

### Posibles respuestas de error

**400 - Campos obligatorios**

```json
{
  "status": "error",
  "message": "Faltan campos obligatorios"
}
```

**400 - Email inválido**

```json
{
  "status": "error",
  "message": "El formato del email no es válido"
}
```

**400 - Contraseña inválida**

```json
{
  "status": "error",
  "message": "La contraseña debe tener al menos 6 caracteres"
}
```

**409 - Email duplicado**

```json
{
  "status": "error",
  "message": "El email ya está registrado"
}
```
---

## Login

### POST `/api/sessions/login`

Autentica un usuario mediante la estrategia `login` de Passport.js y genera una cookie HTTP Only con un JWT.

### Body

```json
{
  "email": "santiago@gmail.com",
  "password": "123456"
}
```

### Respuesta exitosa (200)

```json
{
  "status": "success",
  "message": "Login correcto"
}
```

La respuesta exitosa establece la cookie:

```json
currentUser
```

La cookie contiene el JWT y está configurada como:

- `httpOnly: true`
- `sameSite: "lax"`
- `maxAge: 3600000`
- `secure: true` solamente en producción

El JWT contiene únicamente información básica del usuario:

```json
{
  "id": "665f2a...",
  "email": "santiago@gmail.com",
  "role": "user"
}
```

### Error (401)

```json
{
  "status": "error",
  "message": "Credenciales inválidas"
}
```

---

## Usuario autenticado

### GET `/api/sessions/current`

Ruta protegida mediante la estrategia `current` de Passport.js.

La estrategia obtiene el JWT desde la cookie `currentUser`, verifica el token y deja el usuario disponible en `req.user`.

### Respuesta exitosa (200)

```json
{
  "status": "success",
  "payload": {
    "id": "665f2a...",
    "email": "santiago@gmail.com",
    "role": "user"
  }
}
```

### Error (401) - Sin cookie

```json
{
  "status": "error",
  "message": "No autenticado"
}
```

### Error (401) - Token inválido o expirado

```json
{
  "status": "error",
  "message": "Token inválido o expirado"
}
```

---

## Logout

### POST `/api/sessions/logout`

Elimina la cookie de autenticación y cierra la sesión.

### Respuesta (200)

```json
{
  "status": "success",
  "message": "Sesión cerrada"
}
```

---

# Flujo de autenticación e inscripción

Recorrido completo de la API, desde el registro hasta la cancelación de una inscripción. Cada paso referencia el endpoint correspondiente, documentado en detalle más arriba.

1. **Registro** — `POST /api/sessions/register`. Crea un usuario con rol `user` por defecto.
2. **Login** — `POST /api/sessions/login`. Devuelve la cookie `currentUser` con el JWT.
3. **Consultar sesión actual** — `GET /api/sessions/current`. Confirma la identidad del usuario autenticado (`id`, `email`, `role`).
4. **Crear un evento** — `POST /api/events`. Requiere un usuario con rol `organizer` o `admin` (ver [Usuarios de prueba](#usuarios-de-prueba)). El evento nace en estado `draft`.
5. **Publicar el evento** — `PATCH /api/events/:id/status` con `{ "status": "published" }`. Solo el `organizer` dueño del evento (o un `admin`) puede hacerlo.
6. **Inscribirse** — `POST /api/events/:eid/tickets`, con un usuario `user` autenticado. Valida cupo, duplicados y estado del evento; envía un email de confirmación.
7. **Consultar las propias inscripciones** — `GET /api/tickets/my-tickets`.
8. **Ver quién se inscribió** (solo el organizador dueño del evento, o un admin) — `GET /api/events/:eid/tickets`.
9. **Cancelar la inscripción** — `PATCH /api/tickets/:tid/cancel`. Libera el cupo automáticamente y envía un email de cancelación.
10. **Cerrar sesión** — `POST /api/sessions/logout`. A partir de este punto, `GET /api/sessions/current` vuelve a responder `401`.

---

# Roles y autorización

El sistema diferencia dos conceptos: **autenticación** (¿quién sos?) y **autorización** (¿qué podés hacer?). Un usuario puede estar autenticado y aun así no tener permiso para realizar una acción determinada.

## Roles del sistema

- **`user`**: usuario común. Puede consultar eventos e inscribirse a ellos.
- **`organizer`**: puede crear eventos y modificar únicamente los eventos de los que es dueño, además de ver quiénes se inscribieron a ellos.
- **`admin`**: puede modificar cualquier evento, administrar usuarios y ver las inscripciones de cualquier evento.

El rol se asigna por defecto como `user` al registrarse y **nunca** puede asignarse desde el body de una petición pública. Solo se modifica manualmente en la base de datos.

## Matriz de permisos

| Acción | user | organizer | admin |
|---|---|---|---|
| Consultar eventos | ✅ | ✅ | ✅ |
| Crear eventos | ❌ | ✅ | ✅ |
| Modificar eventos propios | ❌ | ✅ | ✅ |
| Modificar cualquier evento | ❌ | ❌ | ✅ |
| Ver todos los usuarios | ❌ | ❌ | ✅ |
| Cambiar estado de eventos propios (publicar/cancelar) | ❌ | ✅ | ✅ |
| Inscribirse a un evento (crear ticket) | ✅ | ✅ | ✅ |
| Ver las propias inscripciones | ✅ | ✅ | ✅ |
| Ver inscriptos de eventos propios | ❌ | ✅ | ✅ |
| Ver inscriptos de cualquier evento | ❌ | ❌ | ✅ |
| Cancelar la propia inscripción | ✅ | ✅ | ✅ |
| Cancelar inscripciones ajenas | ❌ | ❌ | ✅ |

## Diferencia entre 401 y 403

- **401 (Unauthorized)**: no se pudo identificar al usuario. No envió cookie, la cookie no existe, o el token es inválido/expiró.
- **403 (Forbidden)**: el usuario sí está autenticado, pero su rol (o la propiedad del recurso) no le permite realizar la acción.

## Middlewares de autorización

- **`auth.middleware.js`**: valida el JWT desde la cookie `currentUser` (reutilizando la estrategia `current` de Passport) y responde 401 si no hay sesión válida.
- **`authorize.middleware.js`** (`authorizeRoles`): recibe los roles permitidos para una ruta y responde 403 si el rol del usuario autenticado no está entre ellos.
- **`eventOwnership.middleware.js`** (`authorizeEventOwnerOrAdmin`): para rutas que modifican un evento puntual, valida que el usuario sea el `organizer` dueño del evento o tenga rol `admin`. Responde 404 si el evento no existe, y 403 si no es el dueño ni admin. La misma validación se reutiliza como `authorizeEventOrganizerOrAdmin` para `GET /api/events/:eid/tickets` (listar inscriptos), leyendo el parámetro `eid` en vez de `id`.

Estas validaciones se combinan en cadena en las rutas protegidas, por ejemplo:

```js
router.put(
    "/:id",
    auth,
    authorizeRoles("organizer", "admin"),
    authorizeEventOwnerOrAdmin,
    updateEvent
);

router.patch(
    "/:id/status",
    auth,
    authorizeRoles("organizer", "admin"),
    authorizeEventOwnerOrAdmin,
    updateEventStatus
);

router.get(
    "/:eid/tickets",
    auth,
    authorizeRoles("organizer", "admin"),
    authorizeEventOrganizerOrAdmin,
    getEventTickets
);
```

Primero se valida identidad (401), después rol (403), y por último propiedad del recurso (403/404). `PATCH /:id/status` y `GET /:eid/tickets` siguen exactamente la misma cadena que `PUT /:id`.

## Usuarios de prueba

El registro público (`POST /api/sessions/register`) siempre crea usuarios con rol `user`, y ese rol nunca puede asignarse desde el body — es una decisión de seguridad explícita del proyecto. Por lo tanto, no existe ningún endpoint para "promocionarse" a `organizer` o `admin`.

Para probar los flujos de `organizer` y `admin`:

1. Registrar un usuario normal vía `POST /api/sessions/register`.
2. Conectarse a la base de datos configurada en `MONGO_URL` (por ejemplo desde MongoDB Compass o el visor de colecciones de Atlas) y abrir la colección `users`.
3. Editar el documento de ese usuario y cambiar el campo `role` a `"organizer"` o `"admin"` a mano.
4. Loguearse de nuevo con ese usuario (`POST /api/sessions/login`) para obtener un JWT actualizado con el nuevo rol.

Se recomienda tener al menos 3 usuarios de prueba, uno por rol, para poder ejercitar toda la matriz de permisos.

---

# Notificaciones por email (Nodemailer)

Al confirmarse o cancelarse una inscripción, el backend envía un email al usuario usando Nodemailer. El envío se ejecuta después de haber creado/cancelado el ticket en la base de datos: si el email falla, la operación principal ya quedó aplicada, y el error solo se registra en el log del servidor (no se devuelve como error al cliente).

La configuración del transporter vive en `src/config/mailer.config.js`, y las funciones de armado y envío de cada email en `src/services/mail.service.js`.

---

# Variables de entorno

El proyecto utiliza variables de entorno para configurar el servidor, la conexión a MongoDB, la autenticación mediante JWT y el envío de emails.

El archivo `.env` contiene los valores reales y no debe subirse al repositorio.

El archivo `.env.example` contiene las variables necesarias sin credenciales reales.

```env
PORT=8080
MONGO_URL=tu_cadena_de_conexion
JWT_SECRET=tu_clave_secreta
JWT_EXPIRES_IN=1h
NODE_ENV=development
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=tu_correo@gmail.com
MAIL_PASS=clave_de_aplicacion
MAIL_FROM=tu_correo@gmail.com
```

---

# Seguridad implementada

- Contraseñas hasheadas con bcrypt.
- JWT firmado mediante jsonwebtoken.
- Cookie HTTP Only.
- Validación de email duplicado.
- Normalización de email.
- Manejo global de errores.
- Estrategias de autenticación mediante Passport.js
- No se devuelve la contraseña en las respuestas.
- La contraseña no forma parte del payload del JWT.
- `JWT_SECRET` se obtiene desde variables de entorno.
- La cookie utiliza `secure: true` solamente en producción
- Autorización por rol mediante middleware reutilizable (`authorizeRoles`).
- Validación de propiedad de recursos: un `organizer` solo modifica sus propios eventos y solo ve los inscriptos de sus propios eventos.
- Diferenciación explícita entre error de autenticación (401) y de autorización (403).
- El rol de un usuario nunca se toma del body de una petición pública.
- El `user` de un ticket nunca se toma del body de una petición pública; siempre sale del JWT.
- Credenciales de email (`MAIL_USER`, `MAIL_PASS`) obtenidas desde variables de entorno, nunca hardcodeadas.

---

# Autor

Marcos Santiago Carrizo
