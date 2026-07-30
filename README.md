# Plataforma de Cursos

API REST desarrollada con Node.js, Express y MongoDB para la gestión de cursos y usuarios.

## Tecnologías utilizadas

- Node.js
- Express
- MongoDB Atlas
- Mongoose
- bcrypt
- dotenv

## Instalación

1. Clonar el repositorio:

```bash
git clone https://github.com/MSantiagoCarrizo/Backend-2
```

2. Ingresar al proyecto:

```bash
cd backend2-plataforma-cursos
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
  "message": "Server running"
}
```

---

## Events

### GET `/api/events`

Obtiene la lista de eventos.

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
