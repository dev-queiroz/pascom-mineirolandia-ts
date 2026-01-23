# PASCOM Backend (NestJS)

API completa do sistema PASCOM.
Link do backend no Render: https://pascom-backend.onrender.com/

## Tecnologias
- NestJS 11
- Prisma 5.18.0 + Neon PostgreSQL
- Argon2, JWT, Passport
- Multer (upload)
- PDFkit, ICS
- Swagger docs
- Render (deploy)
- Docker (opcional)

## Setup local
1. cd backend-nest
2. `npm install`
3. Copie .env.example → .env (preencha DATABASE_URL + JWT_SECRET)
4. `npx prisma generate`
5. `npx prisma migrate dev`
6. `npm run start:dev`

- API: http://localhost:3000
- Swagger: http://localhost:3000/api

## Docker local
docker compose up --build

## Deploy Render
- Service ID: srv-d5p42ad6ubrc739pa2u0
- Hook: https://api.render.com/deploy/srv-d5p42ad6ubrc739pa2u0?key=1U63X5OTxM4
- CI/CD: GitHub Actions (push main → deploy automático)
- Keep-alive: GitHub Actions ping a cada 2 min

## Endpoints principais (Swagger)
- POST /auth/login → login
- GET /auth/me → perfil
- POST /users → criar usuário (admin)
- POST /events → criar evento (admin)
- POST /financial/contribution → contribuição + upload
- GET /financial/pendings → pendências (admin)
- GET /dashboard → dashboard admin
- GET /pdf/scale?month=01 → PDF escala (admin)
- GET /extras/ics/:eventId → ICS
- GET /extras/whatsapp?month=01 → links WhatsApp (admin)

## Autor
- [Douglas Vinícios dos Santos Queiroz](https://www.linkedin.com/in/douglas-queiroz-saas/)
- GitHub: [dev-queiroz](https://github.com/dev-queiroz)
- E-mail: [queirozdouglas466@gmail.com](mailto:queirozdouglas466@gmail.com)
- WhatsApp: +55 (88) 9 9629-3741