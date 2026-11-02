# Diagrama entidad-relación (DER)

Este diagrama resume el modelo de datos de la red social `UnaHur Anti-Social Net`.

```mermaid
erDiagram
    USER ||--o{ POST : crea
    USER ||--o{ COMMENT : escribe
    USER ||--o{ FOLLOW : sigue
    USER ||--o{ FOLLOW : es_seguido
    POST ||--o{ POST_IMAGE : tiene
    POST ||--o{ COMMENT : recibe
    POST }o--o{ TAG : tiene

    USER {
        int id PK
        string nickName UK
        datetime createdAt
        datetime updatedAt
    }

    POST {
        int id PK
        text description
        int userId FK
        datetime createdAt
        datetime updatedAt
    }

    POST_IMAGE {
        int id PK
        string url
        int postId FK
        datetime createdAt
        datetime updatedAt
    }

    COMMENT {
        int id PK
        text message
        int userId FK
        int postId FK
        boolean isVisible
        datetime createdAt
        datetime updatedAt
    }

    TAG {
        int id PK
        string name UK
        datetime createdAt
        datetime updatedAt
    }

    FOLLOW {
        int followerId FK
        int followedId FK
        datetime createdAt
        datetime updatedAt
    }

    POST_TAGS {
        int postId FK
        int tagId FK
    }
```

## Descripción de relaciones

- Un `User` puede crear muchos `Post`.
- Un `User` puede escribir muchos `Comment`.
- Un `Post` puede tener muchas `PostImage`.
- Un `Post` puede recibir muchos `Comment`.
- Un `Post` puede estar asociado a muchos `Tag` mediante `Post_Tags`.
- Un `User` puede seguir a muchos otros `User` y también puede ser seguido por muchos usuarios mediante la tabla `Follows`.
- El atributo `Comment.isVisible` es virtual y no se persiste físicamente en la base de datos; se calcula según la antigüedad del comentario.
