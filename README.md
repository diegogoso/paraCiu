# UnaHur Anti-Social Net

Backend de una red social para el Trabajo Práctico Grupal de **Estrategias de Persistencia**. El proyecto implementa una API REST con Node.js, Express, Sequelize y una base de datos relacional.

![UnaHur Anti-Social Net](./assets/ANTI-SOCIALNET.jpeg)

## 1. Especificación funcional

UnaHur Anti-Social Net permite:

- Registrar usuarios identificados por un `nickName` único.
- Crear, consultar, modificar y eliminar publicaciones.
- Asociar cada publicación con un usuario autor.
- Guardar una descripción obligatoria para cada publicación.
- Asociar cero o más imágenes a una publicación guardando su URL.
- Agregar y eliminar imágenes después de crear una publicación.
- Crear, consultar, modificar y eliminar comentarios.
- Asociar comentarios con un usuario y una publicación.
- Ocultar automáticamente los comentarios antiguos al consultar publicaciones.
- Crear, consultar, modificar y eliminar etiquetas.
- Asociar y desasociar etiquetas de publicaciones.
- Consultar seguidores y usuarios seguidos.
- Seguir y dejar de seguir usuarios.

El sistema implementa el MVP solicitado, el bonus de seguimiento entre usuarios y el bonus de carga de imágenes para publicaciones.

## 2. Requisitos de la consigna y estado actual

| Requisito | Estado |
| --- | --- |
| API REST con Node.js y Express | ✅ Implementado |
| Persistencia relacional mediante Sequelize | ✅ Implementado |
| Modelos `User`, `Post`, `Post_Images`, `Comment` y `Tag` | ✅ Implementado |
| Relaciones `User-Post`, `User-Comment`, `Post-Post_Images`, `Post-Comment` y `Post-Tag` | ✅ Implementado |
| Tabla intermedia para la relación N:M entre posts y tags | ✅ Implementado como `Post_Tags` |
| Descripción obligatoria de los posts | ✅ Implementado con Joi y Sequelize |
| Validación de entrada fuera de los controladores | ✅ Implementado con Joi y middleware |
| Atributo virtual de visibilidad de comentarios | ✅ Implementado como `Comment.isVisible` |
| Antigüedad configurable por variable de entorno | ✅ Implementado con `COMMENT_MAX_AGE_MONTHS` |
| GET de un post con autor, imágenes, tags y comentarios | ✅ Implementado con `findByPk` e `include` |
| Filtrado de comentarios no visibles | ✅ Implementado antes de responder |
| Manejo centralizado de errores | ✅ Implementado |
| Cambio de motor SQLite/PostgreSQL/MySQL por configuración | ✅ Implementado |
| Documentación OpenAPI | ✅ Implementada para los endpoints principales en `docs/openapi.yaml` |
| Colección Postman | ✅ Colección base implementada en `postman/anti-social.postman_collection.json` |
| Pruebas automatizadas | ✅ Implementadas con Jest y Supertest |
| Diagrama entidad-relación (DER) como archivo entregable | ✅ Implementado en `docs/der.md` |
| Carga de archivos multipart para imágenes | ✅ Implementado con Multer y almacenamiento local `uploads/` |

## 3. Entidades y modelo de datos

### `User`

Representa un usuario registrado.

- `id`: clave primaria autogenerada.
- `nickName`: texto obligatorio, único, entre 2 y 40 caracteres.
- `createdAt` y `updatedAt`: timestamps administrados por Sequelize.

### `Post`

Representa una publicación.

- `id`: clave primaria autogenerada.
- `description`: texto obligatorio.
- `userId`: clave foránea hacia `User`.
- `createdAt` y `updatedAt`: timestamps administrados por Sequelize.

### `Post_Images`

Representa una imagen asociada a una publicación.

- `id`: clave primaria autogenerada.
- `url`: URL obligatoria de la imagen.
- `postId`: clave foránea hacia `Post`.

En el código el modelo se llama `PostImage` y utiliza la tabla `Post_Images`.

### `Comment`

Representa un comentario realizado por un usuario sobre una publicación.

- `id`: clave primaria autogenerada.
- `message`: texto obligatorio.
- `userId`: clave foránea hacia `User`.
- `postId`: clave foránea hacia `Post`.
- `isVisible`: atributo virtual calculado a partir de `createdAt`; no se persiste.

### `Tag`

Representa una etiqueta reutilizable.

- `id`: clave primaria autogenerada.
- `name`: texto obligatorio, único, entre 2 y 40 caracteres.

### `Follow`

Representa el bonus de seguimiento entre usuarios.

- `followerId`: usuario que sigue.
- `followedId`: usuario seguido.
- Índice único compuesto para impedir relaciones duplicadas.

## 4. Relaciones

Las asociaciones están definidas en [src/models/index.js](./src/models/index.js):

| Relación | Sequelize | Implementación |
| --- | --- | --- |
| Usuario-publicaciones | `User.hasMany(Post)` / `Post.belongsTo(User)` | Un usuario puede crear muchos posts |
| Usuario-comentarios | `User.hasMany(Comment)` / `Comment.belongsTo(User)` | Un usuario puede crear muchos comentarios |
| Post-imágenes | `Post.hasMany(PostImage)` / `PostImage.belongsTo(Post)` | Un post puede tener muchas imágenes |
| Post-comentarios | `Post.hasMany(Comment)` / `Comment.belongsTo(Post)` | Un post puede recibir muchos comentarios |
| Post-tags | `Post.belongsToMany(Tag)` / `Tag.belongsToMany(Post)` | Relación N:M mediante `Post_Tags` |
| Seguimiento | `User.belongsToMany(User)` | Relación autorreferenciada N:M mediante `Follows` |

Las relaciones inexistentes son rechazadas por los servicios antes de persistir. Por ejemplo, no se puede crear un post para un usuario inexistente ni asociar un tag inexistente.

## 5. Regla de visibilidad de comentarios

La antigüedad máxima visible se configura mediante `COMMENT_MAX_AGE_MONTHS`. Por defecto es `6`.

`Comment.isVisible` se calcula dinámicamente con un tipo `DataTypes.VIRTUAL`. Al consultar un post mediante `GET /api/posts/:id`, solamente se incluyen los comentarios cuyo valor virtual `isVisible` sea `true`.

El valor no se guarda en la base de datos.

## 6. Requisitos previos

- Node.js 20 o superior.
- npm.
- SQLite no requiere instalación adicional y es el motor predeterminado.
- Para PostgreSQL o MySQL se necesita una instancia accesible y sus credenciales.

## 7. Instalación y ejecución

Desde la carpeta raíz del proyecto:

```bash
npm install
```

Copiar la plantilla de configuración:

```bash
copy .env.example .env
```

En PowerShell:

```powershell
Copy-Item .env.example .env
```

Iniciar con recarga automática:

```bash
npm run dev
```

Iniciar sin recarga automática:

```bash
npm start
```

La API queda disponible por defecto en:

- API: `http://localhost:3000`
- Health check: `http://localhost:3000/health`
- Swagger UI: `http://localhost:3000/api-docs/`
- API de negocio: `http://localhost:3000/api`

Al iniciar, Sequelize crea o sincroniza las tablas mediante `sequelize.sync()`.

## 8. Configuración mediante `.env`

No se deben guardar credenciales reales en el repositorio. Usar `.env.example` como plantilla.

| Variable | Valor predeterminado | Descripción |
| --- | --- | --- |
| `NODE_ENV` | `development` | Entorno de ejecución |
| `PORT` | `3000` | Puerto HTTP |
| `FRONTEND_URLS` | `http://localhost:5173` | Orígenes del frontend permitidos por CORS, separados por comas |
| `DB_DIALECT` | `sqlite` | Motor: `sqlite`, `postgres` o `mysql` |
| `DB_STORAGE` | `./data/anti-social.sqlite` | Archivo de SQLite |
| `DB_HOST` | `localhost` | Host de PostgreSQL/MySQL |
| `DB_PORT` | `5432` | Puerto del motor configurado |
| `DB_NAME` | `anti_social` | Nombre de la base |
| `DB_USER` | vacío | Usuario de la base |
| `DB_PASSWORD` | vacío | Contraseña de la base |
| `COMMENT_MAX_AGE_MONTHS` | `6` | Meses máximos de visibilidad de comentarios |

Para cambiar el motor se modifica `DB_DIALECT` y se configuran las variables correspondientes. No es necesario modificar modelos, servicios ni controladores.

En producción, configurar `FRONTEND_URLS` con el dominio real del frontend, por ejemplo:

```env
FRONTEND_URLS=https://unahur-antisocial-net.vercel.app
```

Para permitir también el desarrollo local:

```env
FRONTEND_URLS=http://localhost:5173,https://unahur-antisocial-net.vercel.app
```

## 9. Endpoints de la API

Todas las rutas de negocio están bajo el prefijo `/api`.

### Health check

| Método | Ruta | Respuesta |
| --- | --- | --- |
| `GET` | `/health` | `200` con `{ "status": "ok" }` |

### Usuarios

| Método | Ruta | Descripción | Éxito |
| --- | --- | --- | --- |
| `GET` | `/api/users` | Lista usuarios | `200` |
| `POST` | `/api/users` | Crea un usuario | `201` |
| `GET` | `/api/users/:id` | Obtiene un usuario con sus relaciones | `200` |
| `PUT` | `/api/users/:id` | Actualiza un usuario | `200` |
| `DELETE` | `/api/users/:id` | Elimina un usuario | `204` |
| `GET` | `/api/users/nickname/:nickName` | Busca por nickName | `200` |
| `GET` | `/api/users/:id/followers` | Lista seguidores | `200` |
| `GET` | `/api/users/:id/following` | Lista usuarios seguidos | `200` |
| `POST` | `/api/users/:id/following/:followedId` | Sigue a otro usuario | `201` |
| `DELETE` | `/api/users/:id/following/:followedId` | Deja de seguir | `204` |

### Publicaciones

| Método | Ruta | Descripción | Éxito |
| --- | --- | --- | --- |
| `GET` | `/api/posts` | Lista publicaciones con autor, imágenes y tags | `200` |
| `POST` | `/api/posts` | Crea una publicación | `201` |
| `GET` | `/api/posts/:id` | Obtiene un post con tags, imágenes y comentarios visibles | `200` |
| `PUT` | `/api/posts/:id` | Actualiza una publicación | `200` |
| `DELETE` | `/api/posts/:id` | Elimina una publicación | `204` |

El body de creación acepta:

```json
{
  "description": "Publicación de ejemplo",
  "userId": 1,
  "images": ["https://example.com/image.jpg"],
  "tagIds": [1, 2]
}
```

El `GET /api/posts/:id` usa `findByPk` con `include` para obtener el autor, las imágenes, las etiquetas y los comentarios. Antes de enviar la respuesta se eliminan los comentarios cuyo `isVisible` sea `false`.

### Imágenes de publicaciones

| Método | Ruta | Descripción | Éxito |
| --- | --- | --- | --- |
| `GET` | `/api/posts/:postId/images` | Lista imágenes del post | `200` |
| `POST` | `/api/posts/:postId/images` | Agrega una imagen por URL | `201` |
| `DELETE` | `/api/posts/:postId/images/:imageId` | Elimina una imagen | `204` |

Body para agregar una imagen:

```json
{
  "url": "https://example.com/image.jpg"
}
```

### Comentarios

| Método | Ruta | Descripción | Éxito |
| --- | --- | --- | --- |
| `GET` | `/api/comments` | Lista comentarios visibles | `200` |
| `POST` | `/api/comments` | Crea un comentario indicando `postId` | `201` |
| `GET` | `/api/comments/:id` | Obtiene un comentario visible | `200` |
| `PUT` | `/api/comments/:id` | Actualiza un comentario | `200` |
| `DELETE` | `/api/comments/:id` | Elimina un comentario | `204` |
| `GET` | `/api/posts/:postId/comments` | Lista comentarios visibles de un post | `200` |
| `POST` | `/api/posts/:postId/comments` | Crea un comentario dentro de un post | `201` |

Body de comentario:

```json
{
  "message": "Comentario de ejemplo",
  "userId": 1,
  "postId": 1
}
```

En la ruta anidada `/api/posts/:postId/comments`, el `postId` se toma de la URL.

### Etiquetas

| Método | Ruta | Descripción | Éxito |
| --- | --- | --- | --- |
| `GET` | `/api/tags` | Lista etiquetas | `200` |
| `POST` | `/api/tags` | Crea una etiqueta | `201` |
| `GET` | `/api/tags/:id` | Obtiene una etiqueta con sus posts | `200` |
| `PUT` | `/api/tags/:id` | Actualiza una etiqueta | `200` |
| `DELETE` | `/api/tags/:id` | Elimina una etiqueta | `204` |
| `POST` | `/api/posts/:postId/tags/:tagId` | Asocia un tag a un post | `201` |
| `DELETE` | `/api/posts/:postId/tags/:tagId` | Desasocia un tag de un post | `204` |

## 10. Validaciones y errores

Las validaciones de formato se ejecutan en middleware antes de llegar al controlador:

- `POST /api/users` y `PUT /api/users/:id`: `nickName` obligatorio al crear, entre 2 y 40 caracteres.
- `POST /api/posts` y `PUT /api/posts/:id`: `description` obligatoria al crear; `userId`, URLs e IDs con formato válido.
- `POST /api/comments` y `POST /api/posts/:postId/comments`: `message` y `userId` obligatorios.
- `POST` y `PUT` de tags: `name` obligatorio al crear.
- IDs de ruta: enteros positivos.

El middleware `validate` responde `400` con los detalles de Joi cuando el body es inválido.

El middleware centralizado `errorHandler` traduce, entre otros, estos errores:

| Situación | Estado |
| --- | --- |
| Body o parámetro inválido | `400` |
| Relación inexistente | `400` o `404`, según la operación |
| Recurso inexistente | `404` |
| Registro duplicado | `409` |
| Eliminación exitosa | `204` |
| Error inesperado | `500` |

Los controladores se ocupan de HTTP y delegan las reglas de negocio a los servicios. No contienen validaciones manuales de formato.

## 11. Swagger/OpenAPI

La especificación está en [docs/openapi.yaml](./docs/openapi.yaml) y se carga automáticamente en Swagger UI:

```text
http://localhost:3000/api-docs/
```

Documenta los endpoints principales, parámetros, cuerpos, esquemas y respuestas principales. Antes de la entrega final conviene ampliar la especificación con las rutas de seguimiento, imágenes y asociación de tags si la cátedra exige que cada ruta del bonus quede documentada individualmente.

## 12. Colección Postman

La colección está en [postman/anti-social.postman_collection.json](./postman/anti-social.postman_collection.json).

Incluye solicitudes principales para:

- Health check.
- Usuarios.
- Posts.
- Consulta de un post con sus relaciones.
- Comentarios.
- Tags.

La variable `baseUrl` está configurada por defecto como `http://localhost:3000/api`. Las variables `userId`, `postId`, `commentId` y `tagId` permiten reutilizar IDs durante las pruebas.

## 13. Pruebas automatizadas

Ejecutar:

```bash
npm test
```

La suite utiliza Jest y Supertest y cubre:

- Health check.
- Validaciones de usuarios, posts y comentarios.
- CRUD de usuarios.
- CRUD de posts con imágenes y tags.
- CRUD de comentarios.
- Relaciones inexistentes.
- Parámetros inválidos.

## 14. Estructura del proyecto

```text
trabajo-practico-grupal-persistire/
├── assets/
│   └── ANTI-SOCIALNET.jpeg
├── data/
├── docs/
│   └── openapi.yaml
├── postman/
│   └── anti-social.postman_collection.json
├── src/
│   ├── config/
│   │   ├── database.js
│   │   └── index.js
│   ├── controllers/
│   ├── middlewares/
│   │   ├── errorHandler.js
│   │   └── validate.js
│   ├── models/
│   │   └── index.js
│   ├── routes/
│   ├── schemas/
│   │   └── index.js
│   ├── services/
│   ├── app.js
│   └── main.js
├── tests/
├── uploads/
├── .env.example
├── package.json
└── package-lock.json
```

| Carpeta o archivo | Responsabilidad |
| --- | --- |
| `src/config` | Configuración y conexión de Sequelize |
| `src/models` | Modelos, restricciones, asociaciones y atributos virtuales |
| `src/schemas` | Schemas Joi |
| `src/middlewares` | Validación y manejo centralizado de errores |
| `src/controllers` | Adaptación entre HTTP y servicios |
| `src/services` | Reglas de negocio y persistencia mediante Sequelize |
| `src/routes` | Endpoints y composición de middlewares |
| `docs` | Especificación OpenAPI |
| `postman` | Colección de pruebas manuales |
| `tests` | Pruebas automatizadas |
| `uploads` | Carpeta reservada para el bonus de carga de archivos |

## 15. Restricciones técnicas

- No se escribe SQL manual; toda persistencia se realiza mediante Sequelize.
- No se utiliza memoria ni archivos como reemplazo de la base de datos.
- Las validaciones de entrada se realizan con Joi en middlewares.
- `Comment.isVisible` es un valor derivado y no se almacena en la base.
- No se deben subir credenciales reales al repositorio.
- Los controladores no deben contener `if` de validación de formato.

## 16. Stack y dependencias principales

- Node.js 20+
- Express 5
- Sequelize 6
- SQLite, PostgreSQL y MySQL
- Joi
- Jest
- Supertest
- Swagger UI Express
- YAMLJS
