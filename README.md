# PASCOM Backend (NestJS)

API completa para sistema PASCOM (autenticação, usuários, eventos, financeiro, dashboard, PDF, ICS, WhatsApp).

## Tecnologias
- NestJS 11
- Prisma 5.18.0
- Argon2 (hash)
- JWT + Passport
- Multer (upload)
- PDFkit (PDF)
- ICS (ical)
- Docker + Render (deploy)

## Setup local
1. Clone repo
2. cd backend-nest
3. `npm install`
4. Copie .env.example → .env e preencha (DATABASE_URL, JWT_SECRET)
5. `npx prisma generate`
6. `npx prisma migrate dev`
7. `npm run start:dev`

- API: http://localhost:3000
- Swagger: http://localhost:3000/api

## Docker local
docker compose up --build

## Deploy Render
1. Crie conta render.com
2. New → Web Service → GitHub repo
3. Build Command: `npm install && npx prisma generate && npm run build`
4. Start Command: `npm run start:prod`
5. Env vars: DATABASE_URL, JWT_SECRET

## Endpoints principais (Swagger)
- POST /auth/login – Login
- GET /auth/me – Perfil próprio (protegido)
- POST /users – Criar usuário (admin)
- GET /users/me – Perfil próprio
- POST /events – Criar evento (admin)
- GET /events?month=01 – Lista eventos
- POST /events/:id/assign – Servir vaga
- POST /events/:id/remove – Desistir + justificativa
- POST /financial/contribution – Adicionar contribuição (com upload)
- GET /financial/pendings – Pendências (admin)
- GET /dashboard – Dashboard admin
- GET /pdf/scale?month=01 – PDF escala (admin)
- GET /extras/ics/:eventId – ICS evento
- GET /extras/whatsapp?month=01 – Links WhatsApp (admin)

## Regras de negócio
- Limite mensal de escalas (user.escalacao ou 2 default)
- Não escalar mesmo dia
- Acompanhante só para habilitados
- Justificativa obrigatória ao desistir
- Contribuição pendente até admin confirmar