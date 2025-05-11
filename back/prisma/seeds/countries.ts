import dotenv from 'dotenv';
dotenv.config();

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const countries = [
        { name: 'Afghánistán', code: 'AF' },
        { name: 'Albánie', code: 'AL' },
        { name: 'Alžírsko', code: 'DZ' },
        { name: 'Andorra', code: 'AD' },
        { name: 'Angola', code: 'AO' },
        { name: 'Argentina', code: 'AR' },
        { name: 'Arménie', code: 'AM' },
        { name: 'Austrálie', code: 'AU' },
        { name: 'Ázerbájdžán', code: 'AZ' },
        { name: 'Bahamy', code: 'BS' },
        { name: 'Bahrajn', code: 'BH' },
        { name: 'Bangladéš', code: 'BD' },
        { name: 'Belgie', code: 'BE' },
        { name: 'Bělorusko', code: 'BY' },
        { name: 'Bolívie', code: 'BO' },
        { name: 'Bosna a Hercegovina', code: 'BA' },
        { name: 'Brazílie', code: 'BR' },
        { name: 'Bulharsko', code: 'BG' },
        { name: 'Čad', code: 'TD' },
        { name: 'Česká republika', code: 'CZ' },
        { name: 'Čína', code: 'CN' },
        { name: 'Dánsko', code: 'DK' },
        { name: 'Dominikánská republika', code: 'DO' },
        { name: 'Egypt', code: 'EG' },
        { name: 'Estonsko', code: 'EE' },
        { name: 'Fidži', code: 'FJ' },
        { name: 'Filipíny', code: 'PH' },
        { name: 'Finsko', code: 'FI' },
        { name: 'Francie', code: 'FR' },
        { name: 'Grécko', code: 'GR' },
        { name: 'Chorvatsko', code: 'HR' },
        { name: 'Indie', code: 'IN' },
        { name: 'Indonésie', code: 'ID' },
        { name: 'Irák', code: 'IQ' },
        { name: 'Irán', code: 'IR' },
        { name: 'Irsko', code: 'IE' },
        { name: 'Island', code: 'IS' },
        { name: 'Itálie', code: 'IT' },
        { name: 'Izrael', code: 'IL' },
        { name: 'Japonsko', code: 'JP' },
        { name: 'Jemen', code: 'YE' },
        { name: 'Jihoafrická republika', code: 'ZA' },
        { name: 'Jižní Korea', code: 'KR' },
        { name: 'Kanada', code: 'CA' },
        { name: 'Kazachstán', code: 'KZ' },
        { name: 'Keňa', code: 'KE' },
        { name: 'Kolumbie', code: 'CO' },
        { name: 'Kostarika', code: 'CR' },
        { name: 'Kuba', code: 'CU' },
        { name: 'Kypr', code: 'CY' },
        { name: 'Maďarsko', code: 'HU' },
        { name: 'Malajsie', code: 'MY' },
        { name: 'Malta', code: 'MT' },
        { name: 'Maroko', code: 'MA' },
        { name: 'Mexiko', code: 'MX' },
        { name: 'Moldavsko', code: 'MD' },
        { name: 'Mongolsko', code: 'MN' },
        { name: 'Německo', code: 'DE' },
        { name: 'Nizozemsko', code: 'NL' },
        { name: 'Norsko', code: 'NO' },
        { name: 'Nový Zéland', code: 'NZ' },
        { name: 'Pákistán', code: 'PK' },
        { name: 'Panama', code: 'PA' },
        { name: 'Peru', code: 'PE' },
        { name: 'Polsko', code: 'PL' },
        { name: 'Portugalsko', code: 'PT' },
        { name: 'Rakousko', code: 'AT' },
        { name: 'Rumunsko', code: 'RO' },
        { name: 'Rusko', code: 'RU' },
        { name: 'Řecko', code: 'GR' },
        { name: 'Saúdská Arábie', code: 'SA' },
        { name: 'Singapur', code: 'SG' },
        { name: 'Slovensko', code: 'SK' },
        { name: 'Slovinsko', code: 'SI' },
        { name: 'Spojené arabské emiráty', code: 'AE' },
        { name: 'Spojené království', code: 'GB' },
        { name: 'Spojené státy', code: 'US' },
        { name: 'Srbsko', code: 'RS' },
        { name: 'Španělsko', code: 'ES' },
        { name: 'Švédsko', code: 'SE' },
        { name: 'Švýcarsko', code: 'CH' },
        { name: 'Thajsko', code: 'TH' },
        { name: 'Turecko', code: 'TR' },
        { name: 'Ukrajina', code: 'UA' },
        { name: 'Uruguay', code: 'UY' },
        { name: 'Uzbekistán', code: 'UZ' },
        { name: 'Vietnam', code: 'VN' }
      ];

  for (const country of countries) {
    await prisma.country.upsert({
      where: { code: country.code },
      update: {},
      create: country,
    });
  }

  console.log(`Přidáno nebo ponecháno ${countries.length} států.`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error('Chyba při vkládání států:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
