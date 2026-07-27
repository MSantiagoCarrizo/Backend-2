# Plataforma de Cursos

## Descripción

API REST desarrollada con Node.js y Express para la gestión de cursos e inscripciones.

La plataforma permite administrar cursos de distintas categorías y gestionar las inscripciones de los usuarios.

## Temática

La plataforma está orientada a la gestión de cursos.

Algunos cursos de ejemplo:

- Curso de JavaScript
- Curso de React
- Curso de Node.js
- Curso de MongoDB
- Curso de Edición Audiovisual
- Curso de Fotografía

## Tecnologías

- Node.js
- Express
- MongoDB
- Mongoose
- dotenv

## Instalación

Clonar el repositorio:

```bash
git clone https://github.com/MSantiagoCarrizo/Backend-2
```

Instalar las dependencias:

```bash
npm install
```

## Variables de entorno

Crear un archivo `.env` tomando como referencia `.env.example`.

Variables disponibles:

```env
PORT=8080
NODE_ENV=development
MONGO_URL=
JWT_SECRET=
```

## Ejecución

Modo desarrollo:

```bash
npm run dev
```

Modo producción:

```bash
npm start
```

## Estructura del proyecto

```text
src
│
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

## Endpoints disponibles

### Health Check

**GET** `/api/health`

Respuesta:

```json
{
  "status": "ok",
  "message": "Servidor activo"
}
```

### Cursos

**GET** `/api/events`

Respuesta:

```json
{
  "status": "success",
  "payload": []
}
```

En esta implementación, cada **Event** representa un curso disponible para inscripción.

### Sessions

**GET** `/api/sessions`

Endpoint inicial para la gestión de sesiones de usuarios.