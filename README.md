# Plataforma de Cursos

API REST desarrollada con Node.js, Express y MongoDB para la gestión de usuarios y autenticación mediante JWT y cookies HTTP Only.


## Tecnologías utilizadas

- Node.js
- Express
- MongoDB Atlas
- Mongoose
- bcrypt
- dotenv
- jsonwebtoken
- cookie-parser

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

Registra un nuevo usuario.

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

Autentica un usuario y genera una cookie HTTP Only con un JWT.

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

Ruta protegida que devuelve la información del usuario autenticado.

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

### Error (401)

```json
{
  "status": "error",
  "message": "No autenticado"
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

# Seguridad implementada

- Contraseñas hasheadas con bcrypt.
- JWT firmado mediante jsonwebtoken.
- Cookie HTTP Only.
- Middleware de autenticación.
- Validación de email duplicado.
- Normalización de email.
- Manejo global de errores.

---

# Autor

Marcos Carrizo