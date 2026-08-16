# Plataforma de Cursos

API REST desarrollada con Node.js, Express y MongoDB para la gestión de usuarios y autenticación mediante Passport.js, JWT y cookies HTTP Only.



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

4. Crear un archivo `.env` tomando como referencia `.env.example`.

Ejemplo:

```env
PORT=8080
MONGO_URL=tu_cadena_de_conexion
JWT_SECRET=tu_clave_secreta
JWT_EXPIRES_IN=1h
NODE_ENV=development
```

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

## Events

### GET `/api/events`

Obtiene la lista de eventos.

> Actualmente este módulo se encuentra en desarrollo.

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
--

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

# Variables de entorno 

El proyecto utiliza variables de entorno para configurar el servidor, la conexión a MongoDB y la autenticación mediante JWT.

El archivo `.env` contiene los valores reales y no debe subirse al repositorio.

El archivo `.env.example` contiene las variables necesarias sin credenciales reales.

```env
PORT=8080
MONGO_URL=tu_cadena_de_conexion
JWT_SECRET=tu_clave_secreta
JWT_EXPIRES_IN=1h
NODE_ENV=development
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

---

# Autor

Marcos Carrizo