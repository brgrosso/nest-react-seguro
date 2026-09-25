# Por qué está cada control

Texto para copiar, no para “saltar” controles. Todo acá es preventivo.

## Cookies httpOnly (no localStorage)

El access y el refresh van en cookies `httpOnly`, `SameSite=Lax`, `Secure` en prod.

Si un XSS llega a ejecutar JS, **no puede leer** `document.cookie` de esas cookies. Un JWT en `localStorage` sí se puede robar con JS.

El access dura 15 minutos. El refresh dura 7 días, se **hashea** en SQLite y se **rota** en cada refresh.

## Hash de contraseña (scrypt)

No se guarda la clave. Se usa scrypt de Node.

## Política de contraseña

Mínimo 10 caracteres, mayúscula, minúscula y número. No evita todas las claves malas; sube el piso para cuentas de demo y de gente que arranca.

## Rate limit + bloqueo

`/auth/login` acepta 5 intentos por minuto. Después de 5 fallos, esa cuenta queda 15 minutos sin poder entrar.
Frena fuerza bruta y stuffing de credenciales contra _este_ login. En varios procesos/instancias el mapa en memoria no alcanza: ahí iría Redis.
Los fallos se auditan **sin** guardar la contraseña.

## Roles

`USER` y `ADMIN`. El guard mira el JWT. Un USER que pega a `GET /users` o `GET /audit` recibe 403.

El front esconde el menú; **la regla de verdad está en el API**.

## Helmet y headers de nginx

En la API, Helmet pone (entre otros):

- `X-Frame-Options: DENY` — no embeber en iframes (clickjacking).
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: no-referrer`
- CSP restrictiva para respuestas de la API

El front en Docker (nginx) repite headers y una CSP para la SPA. Helmet en Nest **no** cubre el HTML del React si lo sirve otro host: por eso nginx también los manda.

## CORS cerrado

`origin` es una URL (`WEB_ORIGIN`), con `credentials: true`. No hay `*`. En local el Vite proxy hace same-origin y CORS casi no entra en juego.

## ValidationPipe

`whitelist` + `forbidNonWhitelisted`: el body no puede colar campos de más (`role: ADMIN` en el register no pasa). El rol lo asigna el server.

## Auditoría

Se registra login, login fallido, register y logout, con IP y user-agent. Sirve para ver quién tocó qué. No es un SIEM.

## Docker

La API corre como usuario `app`, no root. La DB va a un volumen. Los secretos de JWT salen de env, no del código.

## CI

Test de hash y de roles, build, `npm audit --audit-level=high` y `docker compose build`. Si una dep grave entra, el pipeline lo muestra.
