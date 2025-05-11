# 📱 Cestovatelský deník – Frontend (React Native)

Tato mobilní aplikace slouží jako cestovní deník pro plánování a dokumentaci výletů. Tato aplikace vznikla jako praktická část bakalářské práce a běží na platformě **Expo + React Native**.

## 🌐 Technologie

- **React Native (Expo)**
- **TypeScript**
- **Tailwind CSS (nativewind)**
- **React Navigation**
- **Axios**
- **FormData + ImagePicker + Camera**
- **Feather Icons**


## 🛠️ Instalace a spuštění

```bash
git clone URL front
cd front
npm install
npx expo start
```

Aplikaci otevři v Expo Go nebo v Android emulatoru.

## ⚙️ Build (APK)

```bash
expo prebuild --platform android --clean
npm run deploy-apk
```

## 📂 Obrazovky

- `LoginScreen`, `RegisterScreen`
- `DashboardScreen`, `TravelDiaryScreen`, `TripDetailScreen`
- `CreateTripScreen`, `EditTripScreen`
- `CreatePostScreen` (s možností nahrát obrázky, texty, lokace)
- `ProfileScreen` (úprava profilu)
- **Checklist záložky:** Co zařídit, Co s sebou
- **Galerie:** Obrázky seskupené podle dat

## 🔁 Navigace a data

- Navigace pomocí React Navigation Stack & Tabs
- Data jsou získávána pomocí Axios z REST API backendu
- Ukládání obrázků přes `FormData` a univerzální endpoint

## 🖼️ Styl

- Styl je napříč celou aplikací sjednocený (Dashboard, detail výletu, tvorba a editace)
- SafeAreaView, paddingy, zaoblení
- Všechny obrazovky laděné na Android

## 🔑 Autentizace

- JWT token uložen v async storage
- Posílán jako `Authorization` v každém requestu
- Kromě JWT tokenu aplikace při requestu typu /login a /register odesílá i klíč `APP_SECRET`, který server porovnává s hodnotou uloženou v `.env` (viz README na back).
- Slouží jako doplňková ochrana proti neautorizovaným požadavkům.

> ⚠️ Uložení klíče ve frontendu není bezpečné řešení a používá se zde pouze jako bezpečnostní doplněk.

## 💡 Specifika

- Výlet nemá `imageUrl` – horní obrázek je první IMAGE příspěvek
- Galerie a checklisty dostupné jen pro CREATOR a COOWNER
- Přepínatelné záložky (lazy loaded, animované)
- Všechny formuláře stylizované do jednotného designu
