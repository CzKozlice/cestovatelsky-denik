# 📦 Cestovatelský deník – Backend

Tento backend slouží jako API pro mobilní aplikaci Cestovatelský deník, vytvořený pro účely bakalářské práce. Umožňuje správu uživatelů, výletů, příspěvků, checklistů a obrázků.

## 🌐 Technologie

- **Node.js + Express**
- **Prisma ORM + MySQL**
- **JWT autentizace**
- **Multer (nahrávání souborů)**
- **TypeScript**

## 📁 Struktura

```
src/
├── controllers/
├── middleware/
├── prisma/
├── routes/
├── utils/
└── index.ts
```

## 🛠️ Instalace a spuštění

```bash
git clone <URL> back
cd back
npm install
npx prisma generate
npx prisma migrate dev --name init
npx ts-node prisma/seeds/countries.ts
npm run dev
```

### 🔐 Konfigurace prostředí (`.env`)

V kořenovém adresáři projektu si vytvoř soubor `.env` podle následující šablony:

```env
DATABASE_URL="mysql://denik:<heslo>@<host>:3306/cestovnidenik"
JWT_SECRET="JWT_TOKEN"
APP_SECRET="APP_TOKEN"
PORT=3000
```

> ⚠️ `APP_SECRET` je nutné nastavit v kódu dle konstanty, která je ve zdrojovém kódu front-end aplikace. (V případě zájmu mě kontaktujte)
> ⚠️ `.env` není součástí repozitáře, vytvoř si ho ručně dle této šablony.

## 🧪 Build & deploy

Pro produkční build (např. pro nasazení přes PM2):

```bash
npm run build
node dist/index.js
```

## ⚙️ Lokální server

- běží na `http://localhost:3000`
- všechny route prefixed `/api`

## 🔐 Autentizace

- Registrace, přihlášení: `/api/auth`
- JWT token v hlavičce `Authorization: Bearer <token>`

## 📦 API pokrývá:

- `/api/users` – profil, avatar
- `/api/trips` – výlety (včetně přidávání zemí, obrázků, členů)
- `/api/posts` – textové, obrázkové i lokalizační příspěvky
- `/api/tasks`, `/api/packing-items` – checklisty („Co zařídit“, „Co s sebou“)
- `/api/uploads` – nahrávání obrázků podle typu (avatar, výlet, příspěvek)

## 📎 Specifika

- Upload obrázků řešen univerzálně přes `POST /api/uploads`
- Validace rolí (`CREATOR`, `COOWNER`, `VIEWER`) na úrovni middleware
- Migrace běží na MySQL – shadow DB je zakázaná (používej migrate dev --create-only nebo reset) (možno přepnout)
- Seznam zemí je seedován ručně skriptem prisma/seeds/countries.ts
