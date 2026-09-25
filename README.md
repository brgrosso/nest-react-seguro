# nest-react-seguro

Starter Nest + React **seguro por defecto**. No es un CRUD: es una base para copiar controles y entender *por qué* están.

Cada control está explicado en [docs/controles.md](docs/controles.md).

## Qué incluye

- Auth con cookies **httpOnly** (access 15 min + refresh 7 días, rotado y hasheado)
- Roles `USER` / `ADMIN`
- Rate limit extra en `/auth/login` y bloqueo temporal tras fallos
- Helmet + headers en nginx
- Validación de DTOs (`whitelist` + `forbidNonWhitelisted`)
- Logs de auditoría (sin contraseñas)
- Docker (API sin root) y CI (test, build, `npm audit`, imagen)

Esto es **defensa y enseñanza**. No es un kit para atacar sistemas.

## Cómo correrlo en local

```bash
cd nest-react-seguro
cp .env.example api/.env
npm install
cd api && npx prisma db push && npm run seed && cd ..
npm run dev
```

- Front: http://localhost:5174
- API: http://localhost:3002/health

Admin de demo (cambialo): `admin@seguro.local` / `ChangeMe_Admin1!`

## Docker

```bash
docker compose up --build
```

Queda en http://localhost:8080

## Cómo se ve el “nivel seguridad”

1. Entrá como admin y mirá `/admin` (usuarios + auditoría).
2. Creá un USER y comprobá que no entra a admin (el API responde 403).
3. En DevTools → Application → Cookies: `access_token` y `refresh_token` figuran httpOnly.
4. En Network, las respuestas de la API traen headers de Helmet.
