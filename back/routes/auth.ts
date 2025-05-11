import { Router, Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'
import { authenticateToken } from '../middleware/auth'
import multer from 'multer'
import { FileFilterCallback } from 'multer'
import path from 'path';
import dayjs from 'dayjs';
import fs from 'fs';

export interface AuthRequest extends Request {
  userId?: string
}

const router = Router()
const prisma = new PrismaClient()
const JWT_SECRET = process.env.JWT_SECRET || 't0j3sup3rkl1c0vyToken'

const calculateTripDuration = (start: Date, end: Date): number => {
  const msInDay = 1000 * 60 * 60 * 24;
  const startDateOnly = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const endDateOnly = new Date(end.getFullYear(), end.getMonth(), end.getDate());
  return Math.floor((endDateOnly.getTime() - startDateOnly.getTime()) / msInDay) + 1;
};



// REGISTRACE
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  // Ověření tajného klíče z hlavičky
  const APP_SECRET = process.env.APP_SECRET;
  const clientSecret = req.headers['x-app-secret'];

  if (!APP_SECRET || clientSecret !== APP_SECRET) {
    res.status(403).json({ error: 'Neautorizovaný přístup.' });
    return;
  }

  let { email, password, passwordVerify, username, firstname, surname, birthday, gender, country } = req.body;
  email = email?.toLowerCase();

  if (!email || !password || !passwordVerify || !username || !firstname || !surname || !birthday || !gender || !country) {
    res.status(400).json({ error: 'Chybí požadovaná pole.' });
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    res.status(400).json({ error: 'Neplatný formát e-mailu.' });
    return;
  }

  if (password.length < 6) {
    res.status(400).json({ error: 'Heslo musí mít alespoň 6 znaků.' });
    return;
  }

  if(password !== passwordVerify) {
    res.status(400).json({ error: 'Hesla se neshodují.' });
    return;
  }

  const parsedBirthday = new Date(birthday);
  if (isNaN(parsedBirthday.getTime())) {
    res.status(400).json({ error: 'Neplatné datum narození.' });
    return;
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    res.status(400).json({ error: 'Uživatel s tímto e-mailem již existuje.' });
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      username,
      firstname,
      surname,
      birthday: parsedBirthday,
      gender,
      country,
    },
  });

  res.status(201).json({ message: 'Uživatel vytvořen.' });
});

// PŘIHLÁŠENÍ
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  // Ověření app secret z hlavičky
  const APP_SECRET = process.env.APP_SECRET;
  const clientSecret = req.headers['x-app-secret'];

  if (!APP_SECRET || clientSecret !== APP_SECRET) {
    res.status(403).json({ error: 'Neautorizovaný přístup.' });
    return;
  }

  if (!email || !password) {
    res.status(400).json({ error: 'Zadejte e-mail i heslo.' });
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    res.status(400).json({ error: 'Neplatný formát e-mailu.' });
    return;
  }

  const normalizedEmail = email.toLowerCase();

  const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (!user) {
    res.status(401).json({ error: 'Neplatné přihlašovací údaje.' });
    return;
  }

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    res.status(401).json({ error: 'Neplatné přihlašovací údaje.' });
    return;
  }

  if (!process.env.JWT_SECRET) {
    res.status(500).json({ error: 'Chybí JWT_SECRET v prostředí.' });
    return;
  }

  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });

  res.status(200).json({
    token,
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      firstname: user.firstname,
      surname: user.surname,
    },
  });
});

// PŘÍSTUP K PROFILU
router.get('/profile', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.userId

  if (!userId) {
    res.status(401).json({ error: 'Neautorizovaný přístup.' })
    return
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        firstname: true,
        surname: true,
        bio: true,
        birthday: true,
        gender: true,
        country: true,
        phone: true,
        avatarUrl: true,
        createdAt: true,
        updatedAt: true
      }
    })

    if (!user) {
      res.status(404).json({ error: 'Uživatel nenalezen.' })
      return
    }

    // Všechny výlety uživatele, kde je účastníkem
    const userTrips = await prisma.tripUser.findMany({
      where: { userId },
      include: {
        trip: {
          include: {
            countries: {
              include: { country: true },
            },
          },
        },
      },
    })

    // Pouze dokončené výlety
    const now = new Date()
    const completedTrips = userTrips.filter(t => t.trip.endDate && new Date(t.trip.endDate) < now)
    const plannedTrips = userTrips.filter(t => t.trip.startDate && new Date(t.trip.startDate) >= now)

    const visitedCountryCodes = Array.from(new Set(
      completedTrips
        .flatMap(t => t.trip.countries ?? [])
        .map(tc => tc.country?.code?.trim().toUpperCase())
        .filter((code): code is string => !!code)
    ))

    // Plánované země
    const plannedCountryCodes = Array.from(new Set(
      plannedTrips
        .flatMap(t => t.trip.countries ?? [])
        .map(tc => tc.country?.code?.trim().toUpperCase())
        .filter((code): code is string => !!code)
    ))

    res.status(200).json({
      ...user,
      visitedCountryCodes,
      plannedCountryCodes,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Chyba při načítání profilu.' })
  }
})

// ÚPRAVA PROFILU
router.patch('/profile', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.userId

  if (!userId) {
    res.status(401).json({ error: 'Neautorizovaný přístup.' })
    return
  }

  const { username, firstname, surname, bio, phone, country, avatarUrl } = req.body

  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        username,
        firstname,
        surname,
        bio,
        phone,
        country,
        avatarUrl
      },
      select: {
        id: true,
        email: true,
        username: true,
        firstname: true,
        surname: true,
        bio: true,
        phone: true,
        country: true,
        avatarUrl: true
      }
    })

    res.status(200).json(updatedUser)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Chyba při aktualizaci profilu.' })
  }
})


// VYTVOŘENÍ NOVÉHO VÝLETU
router.post('/trips', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.userId

  if (!userId) {
    res.status(401).json({ error: 'Neautorizovaný přístup.' })
    return
  }

  const { name, description, startDate, endDate, countryIds } = req.body

  if (!name || !startDate || !endDate || !countryIds || !Array.isArray(countryIds)) {
    res.status(400).json({ error: 'Neplatné vstupní údaje.' })
    return
  }

  const parsedStart = new Date(startDate)
  const parsedEnd = new Date(endDate)

  if (isNaN(parsedStart.getTime()) || isNaN(parsedEnd.getTime())) {
    res.status(400).json({ error: 'Neplatný formát datumu.' })
    return
  }

  try {
    const trip = await prisma.trip.create({
      data: {
        name,
        description,
        location: '',
        startDate: parsedStart,
        endDate: parsedEnd,
        participants: {
          create: {
            userId,
            role: 'CREATOR',
          },
        },
        countries: {
          create: countryIds.map((countryId: string) => ({
            country: {
              connect: { id: countryId },
            },
          })),
        },
      },
    })

    res.status(201).json(trip)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Nepodařilo se vytvořit výlet.' })
  }
})

// ÚPRAVA EXISTUJÍCÍHO VÝLETU
router.patch('/trips/:id', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.userId
  const tripId = req.params.id

  const { name, description, startDate, endDate, countryIds } = req.body

  if (!userId) {
    res.status(401).json({ error: 'Neautorizovaný přístup.' })
    return
  }

  if (!name || !startDate || !endDate || !countryIds || !Array.isArray(countryIds)) {
    res.status(400).json({ error: 'Neplatné vstupní údaje.' })
    return
  }

  const parsedStart = new Date(startDate)
  const parsedEnd = new Date(endDate)

  if (isNaN(parsedStart.getTime()) || isNaN(parsedEnd.getTime())) {
    res.status(400).json({ error: 'Neplatný formát datumu.' })
    return
  }

  try {
    // Ověření, že uživatel je CREATOR nebo COOWNER
    const participant = await prisma.tripUser.findFirst({
      where: {
        tripId,
        userId,
      },
    })

    if (!participant || !['CREATOR', 'COOWNER'].includes(participant.role)) {
      res.status(403).json({ error: 'Nemáš oprávnění upravit tento výlet.' })
      return
    }

    // Smazání původních zemí
    await prisma.tripCountry.deleteMany({
      where: { tripId },
    })

    // Aktualizace výletu
    const updatedTrip = await prisma.trip.update({
      where: { id: tripId },
      data: {
        name,
        description: description ?? '',
        startDate: parsedStart,
        endDate: parsedEnd,
        countries: {
          create: countryIds.map((countryId: string) => ({
            country: {
              connect: { id: countryId },
            },
          })),
        },
      },
    })

    res.status(200).json(updatedTrip)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Nepodařilo se aktualizovat výlet.' })
  }
})


// VÝLETY, KTERÉ UŽIVATEL VYTVOŘIL
router.get('/trips/mine', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.userId

  if (!userId) {
    res.status(401).json({ error: 'Neautorizovaný přístup.' })
    return
  }

  const trips = await prisma.trip.findMany({
    where: {
      participants: {
        some: {
          userId,
          role: 'CREATOR',
        },
      },
    },
  })

  res.status(200).json(trips)
})

// VÝLETY, NA KTERÉ JE UŽIVATEL POZVÁN
router.get('/trips/invited', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.userId

  if (!userId) {
    res.status(401).json({ error: 'Neautorizovaný přístup.' })
    return
  }

  const trips = await prisma.tripUser.findMany({
    where: {
      userId,
      role: {
        not: 'CREATOR',
      },
    },
    include: {
      trip: true,
      user: true,
    },
  })

  res.status(200).json(trips)
})

// NADCHÁZEJÍCÍ VÝLETY
router.get('/trips/upcoming', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.userId

  if (!userId) {
    res.status(401).json({ error: 'Neautorizovaný přístup.' })
    return
  }

  const trips = await prisma.trip.findMany({
    where: {
      participants: {
        some: { userId },
      },
      startDate: { gte: new Date() },
    },
    orderBy: { startDate: 'asc' },
  })

  res.status(200).json(trips)
})

// MINULÉ VÝLETY
router.get('/trips/past', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.userId

  if (!userId) {
    res.status(401).json({ error: 'Neautorizovaný přístup.' })
    return
  }

  const trips = await prisma.trip.findMany({
    where: {
      participants: {
        some: { userId },
      },
      endDate: { lt: new Date() },
    },
    orderBy: { endDate: 'desc' },
  })

  res.status(200).json(trips)
})


// VŠECHNY VÝLETY UŽIVATELE S NÁHLEDEM
router.get('/trips/all', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.userId

  if (!userId) {
    res.status(401).json({ error: 'Neautorizovaný přístup.' })
    return
  }

  try {
    const trips = await prisma.tripUser.findMany({
      where: { userId },
      include: {
        trip: {
          include: {
            posts: {
              where: { type: 'IMAGE', imageUrl: { not: null } },
              orderBy: { createdAt: 'asc' },
              take: 1,
            },
          },
        },
      },
    })

    const formattedTrips = trips.map(t => ({
      id: t.trip.id,
      name: t.trip.name,
      startDate: t.trip.startDate,
      endDate: t.trip.endDate,
      imageUrl: t.trip.posts[0]?.imageUrl || null,
      role: t.role,
    }))

    res.status(200).json(formattedTrips)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Chyba při načítání výletů.' })
  }
})

// VYHLEDÁVÁNÍ VÝLETŮ PODLE NÁZVU
router.get('/trips/search', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.userId;
  const query = (req.query.query as string)?.trim().toLowerCase();

  if (!userId) {
    res.status(401).json({ error: 'Neautorizovaný přístup.' });
    return;
  }

  if (!query || query.length < 2) {
    res.status(400).json({ error: 'Zadej alespoň 2 znaky pro hledání.' });
    return;
  }

  try {
    const allTripUsers = await prisma.tripUser.findMany({
      where: { userId },
      include: {
        trip: true,
      },
    });

    const filtered = allTripUsers.filter(t =>
      t.trip.name?.toLowerCase().includes(query)
    );

    const results = await Promise.all(
      filtered.map(async (t) => {
        const post = await prisma.post.findFirst({
          where: {
            tripId: t.tripId,
            type: 'IMAGE',
            imageUrl: { not: null },
          },
          orderBy: { createdAt: 'asc' },
        });

        return {
          id: t.trip.id,
          title: t.trip.name,
          startDate: t.trip.startDate,
          endDate: t.trip.endDate,
          imageUrl: post?.imageUrl || null,
          role: t.role,
        };
      })
    );

    res.status(200).json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Chyba při vyhledávání výletů.' });
  }
});

// PŘIDÁNÍ PŘÍSPĚVKU K VÝLETU
router.post('/trips/:id/posts', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.userId
  const { id: tripId } = req.params
  const { type, content, location, imageUrl } = req.body

  if (!userId) {
    res.status(401).json({ error: 'Neautorizovaný přístup.' })
    return
  }

  if (!type || !['TEXT', 'IMAGE', 'LOCATION'].includes(type)) {
    res.status(400).json({ error: 'Neplatný nebo chybějící typ příspěvku.' })
    return
  }

  try {
    const post = await prisma.post.create({
      data: {
        type,
        content,
        location,
        imageUrl,
        tripId,
        authorId: userId,
        createdAt: req.body.date ? new Date(req.body.date) : undefined,
      },
    })

    res.status(201).json(post)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Nepodařilo se vytvořit příspěvek.' })
  }
})

// Načtení detailu jednoho příspěvku
router.get('/posts/:id', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.userId
  const { id } = req.params

  if (!userId) {
    res.status(401).json({ error: 'Neautorizovaný přístup.' })
    return
  }

  try {
    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
        trip: {
          select: {
            id: true,
            name: true,
            participants: {
              include: {
                user: {
                  select: {
                    id: true,
                    username: true,
                  },
                },
              },
            },
          },
        },
      },
    })

    if (!post) {
      res.status(404).json({ error: 'Příspěvek nenalezen.' })
      return
    }
    const isParticipant = post.trip.participants.some(p => p.user.id === userId)
    if (!isParticipant) {
      res.status(403).json({ error: 'Nemáš přístup k tomuto příspěvku.' })
      return
    }

    res.status(200).json(post)
  } catch (error) {
    console.error('Chyba načítání příspěvku:', error)
    res.status(500).json({ error: 'Chyba při načítání příspěvku.' })
  }
})

// SMAZÁNÍ PŘÍSPĚVKU
router.delete('/posts/:id', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.userId
  const { id } = req.params

  if (!userId) {
    res.status(401).json({ error: 'Neautorizovaný přístup.' })
    return
  }

  try {
    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        trip: {
          include: {
            participants: true,
          },
        },
      },
    })

    if (!post) {
      res.status(404).json({ error: 'Příspěvek nenalezen.' })
      return
    }

    const participant = post.trip.participants.find(p => p.userId === userId)

    if (!participant || !['CREATOR', 'COOWNER'].includes(participant.role)) {
      res.status(403).json({ error: 'Nemáš oprávnění smazat tento příspěvek.' })
      return
    }

    if (post.type === 'IMAGE' && post.imageUrl) {
      const imagePath = path.join(__dirname, '..', post.imageUrl.replace(/^\/+/, ''))
      if (fs.existsSync(imagePath)) {
        try {
          fs.unlinkSync(imagePath)
        } catch (err) {
          console.warn('⚠️ Nepodařilo se smazat obrázek:', err)
        }
      }
    }

    await prisma.post.delete({ where: { id } })

    res.status(200).json({ message: 'Příspěvek byl smazán.' })
  } catch (error) {
    res.status(500).json({ error: 'Chyba při mazání příspěvku.' })
  }
})

// DETAIL VÝLETU
router.get('/trips/:id', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.userId
  const { id } = req.params

  if (!userId) {
    res.status(401).json({ error: 'Neautorizovaný přístup.' })
    return
  }

  const trip = await prisma.trip.findUnique({
    where: { id },
    include: {
      participants: {
        include: {
          user: {
            select: {
              id: true,
              username: true,
              firstname: true,
              surname: true,
              avatarUrl: true,
              email: true,
            },
          },
        },
      },
      posts: {
        orderBy: {
          createdAt: 'desc',
        },
      },
      countries: {
        include: {
          country: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
        },
      },
    },
  })

  if (!trip) {
    res.status(404).json({ error: 'Výlet nenalezen.' })
    return
  }

  const isParticipant = trip.participants.some(p => p.userId === userId)
  if (!isParticipant) {
    res.status(403).json({ error: 'Nemáš přístup k tomuto výletu.' })
    return
  }

  res.status(200).json(trip)
})

// POZVÁNÍ UŽIVATELE DO VÝLETU
router.post('/trips/:id/invite', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  const inviterId = req.userId
  const { id: tripId } = req.params
  const { email, role } = req.body

  if (!inviterId) {
    res.status(401).json({ error: 'Neautorizovaný přístup.' })
    return
  }

  const allowedInviteRoles = ['COOWNER', 'VIEWER']
  if (!allowedInviteRoles.includes(role)) {
    res.status(400).json({ error: 'Neplatná role. Povolené jsou: COOWNER, VIEWER.' })
    return
  }

  const trip = await prisma.trip.findUnique({
    where: { id: tripId },
    include: {
      participants: true,
    },
  })

  if (!trip) {
    res.status(404).json({ error: 'Výlet nenalezen.' })
    return
  }

  const inviter = trip.participants.find(p => p.userId === inviterId)
  if (!inviter) {
    res.status(403).json({ error: 'Nejsi účastníkem tohoto výletu.' })
    return
  }

  const canInvite = inviter.role === 'CREATOR'
  if (!canInvite) {
    res.status(403).json({ error: 'Pouze Autor může přidávat další uživatele.' })
    return
  }

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    res.status(404).json({ error: 'Uživatel s tímto e-mailem neexistuje.' })
    return
  }

  const alreadyMember = trip.participants.some(p => p.userId === user.id)
  if (alreadyMember) {
    res.status(400).json({ error: 'Uživatel už je ve výletu.' })
    return
  }

  await prisma.tripUser.create({
    data: {
      tripId,
      userId: user.id,
      role,
    },
  })

  res.status(201).json({ message: `Uživatel ${user.email} byl přidán jako ${role}.` })
})

// ODEBRÁNÍ UŽIVATELE Z VÝLETU
router.delete('/trips/:tripId/users/:userId', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  const currentUserId = req.userId
  const { tripId, userId } = req.params

  if (!currentUserId) {
    res.status(401).json({ error: 'Neautorizovaný přístup.' })
    return
  }

  const trip = await prisma.trip.findUnique({
    where: { id: tripId },
    include: {
      participants: true,
    },
  })

  if (!trip) {
    res.status(404).json({ error: 'Výlet nenalezen.' })
    return
  }

  const actingUser = trip.participants.find(p => p.userId === currentUserId)
  if (!actingUser) {
    res.status(403).json({ error: 'Nemáš přístup k tomuto výletu.' })
    return
  }

  const target = trip.participants.find(p => p.userId === userId)
  if (!target) {
    res.status(404).json({ error: 'Uživatel není součástí výletu.' })
    return
  }

  if (target.userId === currentUserId) {
    res.status(400).json({ error: 'Nemůžeš smazat sám sebe.' })
    return
  }

  const canRemove =
    actingUser.role === 'CREATOR' || (actingUser.role === 'COOWNER' && target.role === 'VIEWER')

  if (!canRemove) {
    res.status(403).json({ error: 'Nemáš oprávnění tohoto uživatele odstranit.' })
    return
  }

  await prisma.tripUser.delete({
    where: {
      tripId_userId: {
        tripId,
        userId,
      },
    },
  })

  res.status(200).json({ message: 'Uživatel byl odstraněn z výletu.' })
})

// OPUŠTĚNÍ VÝLETU
router.post('/trips/:id/leave', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.userId
  const { id: tripId } = req.params

  if (!userId) {
    res.status(401).json({ error: 'Neautorizovaný přístup.' })
    return
  }

  const trip = await prisma.trip.findUnique({
    where: { id: tripId },
    include: {
      participants: true,
    },
  })

  if (!trip) {
    res.status(404).json({ error: 'Výlet nenalezen.' })
    return
  }

  const participant = trip.participants.find(p => p.userId === userId)
  if (!participant) {
    res.status(403).json({ error: 'Nejsi účastníkem tohoto výletu.' })
    return
  }

  if (participant.role === 'CREATOR') {
    res.status(403).json({
      error: 'CREATOR nemůže opustit výlet. Předtím předej správu nebo výlet smaž.',
    })
    return
  }

  await prisma.tripUser.delete({
    where: {
      tripId_userId: {
        tripId,
        userId,
      },
    },
  })

  res.status(200).json({ message: 'Výlet byl úspěšně opuštěn.' })
})

// DASHBOARD PŘEHLED
router.get('/dashboard', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.userId;

  if (!userId) {
    res.status(401).json({ error: 'Neautorizovaný přístup.' });
    return;
  }

  try {
    const allTrips = await prisma.tripUser.findMany({
      where: { userId },
      include: {
        trip: {
          include: {
            countries: {
              include: { country: true },
            },
          },
        },
      },
    });

    const now = new Date();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const futureTrips = allTrips
      .filter(t => t.trip.startDate && tSafeDate(t.trip.startDate).getTime() >= today.getTime())
      .sort((a, b) => tSafeDate(a.trip.startDate).getTime() - tSafeDate(b.trip.startDate).getTime());


    const nextTrip = futureTrips[0];

    const completedTrips = allTrips.filter(t => t.trip.endDate && new Date(t.trip.endDate) < now);

    const allCountryCodes = completedTrips
      .flatMap(t => t.trip.countries ?? [])
      .map(tc => tc.country?.code?.trim().toUpperCase())
      .filter((code): code is string => !!code);

    const visitedCountrySet = new Set(allCountryCodes);
    const visitedCountries = visitedCountrySet.size;

    const getFirstImageUrl = async (tripId: string): Promise<string | null> => {
      const post = await prisma.post.findFirst({
        where: { tripId, type: 'IMAGE', imageUrl: { not: null } },
        orderBy: { createdAt: 'asc' },
      });
      return post?.imageUrl || null;
    };

    const nextTripImageUrl = nextTrip ? await getFirstImageUrl(nextTrip.trip.id) : null;

    const nextTripsData = await Promise.all(
      futureTrips.map(async (t) => {
        const start = tSafeDate(t.trip.startDate);
        const end = tSafeDate(t.trip.endDate);
        const imageUrl = await getFirstImageUrl(t.trip.id);
        return {
          id: t.trip.id,
          title: t.trip.name,
          duration: calculateTripDuration(start, end) + ' dní',
          places: Math.floor(Math.random() * 10) + 1,
          distance: Math.floor(Math.random() * 1000) + 100,
          imageUrl: imageUrl || '',
          role: t.role,
        };
      })
    );

    const completedWithImages = await Promise.all(
      completedTrips.map(async t => {
        const imageUrl = await getFirstImageUrl(t.trip.id);
        const start = tSafeDate(t.trip.startDate);
        const end = tSafeDate(t.trip.endDate);
        return {
          id: t.trip.id,
          title: t.trip.name,
          duration: calculateTripDuration(start, end) + ' dní',
          places: Math.floor(Math.random() * 10) + 1,
          distance: Math.floor(Math.random() * 1000) + 100,
          imageUrl: imageUrl || '',
          role: t.role,
        };
      })
    );

    res.status(200).json({
      tripCount: allTrips.length,
      futureTrips: futureTrips.length,
      visitedCountries,
      nextTrip: nextTrip
        ? {
            id: nextTrip.trip.id,
            title: nextTrip.trip.name,
            duration: calculateTripDuration(tSafeDate(nextTrip.trip.startDate), tSafeDate(nextTrip.trip.endDate)) + ' dní',
            places: Math.floor(Math.random() * 10) + 1,
            distance: Math.floor(Math.random() * 1000) + 100,
            imageUrl: nextTripImageUrl || '',
            role: nextTrip.role,
          }
        : null,
      nextTrips: nextTripsData,
      completedTrips: completedWithImages,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Chyba při získávání dat pro dashboard.' });
  }
});

// Helper na bezpečnou práci s Date | null
const tSafeDate = (d: Date | string | null | undefined): Date => {
  return d ? new Date(d) : new Date(0)
}

// VRÁCENÍ VŠECH ZEMÍ
router.get('/countries', async (req: Request, res: Response): Promise<void> => {
  try {
    const countries = await prisma.country.findMany({
      select: {
        id: true,
        name: true,
        code: true,
      },
    })

    res.status(200).json(countries)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Chyba při načítání zemí.' })
  }
})


const allowedExtensions = ['.png', '.jpg', '.jpeg', '.gif'];

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folder = dayjs().format('YYYY-MM-DD');
    const uploadPath = path.join(__dirname, '..', 'uploads', folder);
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const name = path.basename(file.originalname, ext).replace(/\s+/g, '_');
    cb(null, `${name}_${Date.now()}${ext}`);
  },
});

const fileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback): void => {
  const ext = path.extname(file.originalname).toLowerCase()
  if (allowedExtensions.includes(ext)) {
    cb(null, true)
  } else {
    cb(new Error('Nepovolený typ souboru'))
  }
}

const upload = multer({ storage, fileFilter });

// UNIVERZÁLNÍ NAHRÁVÁNÍ OBRÁZKŮ
router.post('/upload', authenticateToken, upload.array('files', 10), async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.userId
  const type = req.body.type
  const tripId = req.body.tripId

  if (!userId) {
    res.status(401).json({ error: 'Neautorizovaný přístup.' })
    return
  }

  if (!type || !['avatar', 'trip', 'post'].includes(type)) {
    res.status(400).json({ error: 'Neplatný nebo chybějící typ nahrávání.' })
    return
  }

  if (!req.files || req.files.length === 0) {
    res.status(400).json({ error: 'Chybí soubor.' })
    return
  }

  const folder = dayjs().format('YYYY-MM-DD')
  const uploadedUrls = (req.files as Express.Multer.File[]).map(
    (file) => `/uploads/${folder}/${file.filename}`
  )

  try {
    if (type === 'avatar') {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { avatarUrl: true },
      })

      if (user?.avatarUrl) {
        const oldPath = path.join(__dirname, '..', user.avatarUrl.replace(/^\/+/, ''))
        if (fs.existsSync(oldPath)) {
          try {
            fs.unlinkSync(oldPath)
          } catch (err) {
            console.warn('Nepodařilo se smazat starý avatar:', err)
          }
        }
      }

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          avatarUrl: uploadedUrls[0],
        },
      })

      res.status(200).json({ avatarUrl: updatedUser.avatarUrl })
      return
    }

    if (type === 'trip') {
      if (!tripId) {
        res.status(400).json({ error: 'Chybí tripId.' })
        return
      }

      const trip = await prisma.trip.findUnique({
        where: { id: tripId },
        include: { participants: true },
      })

      if (!trip) {
        res.status(404).json({ error: 'Výlet nenalezen.' })
        return
      }

      const isParticipant = trip.participants.some(p => p.userId === userId)
      if (!isParticipant) {
        res.status(403).json({ error: 'Nemáš oprávnění upravit tento výlet.' })
        return
      }

      res.status(200).json({ tripImageUrl: uploadedUrls[0] })
      return
    }

    if (type === 'post') {
      if (!tripId) {
        res.status(400).json({ error: 'Chybí tripId.' })
        return
      }

      const trip = await prisma.trip.findUnique({
        where: { id: tripId },
        include: { participants: true },
      })

      if (!trip) {
        res.status(404).json({ error: 'Výlet nenalezen.' })
        return
      }

      const isParticipant = trip.participants.some(p => p.userId === userId)
      if (!isParticipant) {
        res.status(403).json({ error: 'Nemáš oprávnění přidat příspěvek do tohoto výletu.' })
        return
      }

      const createdPosts = await Promise.all(
        uploadedUrls.map(url =>
          prisma.post.create({
            data: {
              type: 'IMAGE',
              imageUrl: url,
              tripId,
              authorId: userId,
              createdAt: req.body.date ? new Date(req.body.date) : undefined,
            },
          })
        )
      )

      res.status(201).json({ posts: createdPosts })
      return
    }

    res.status(400).json({ error: 'Neznámý typ nahrávání.' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Chyba při zpracování obrázků.' })
  }
});


router.get('/trips/:tripId/tasks', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  const { tripId } = req.params;

  try {
    const tasks = await prisma.task.findMany({
      where: { tripId },
      orderBy: { position: 'asc' },
    });

    res.json(tasks);
  } catch (error) {
    console.error('Chyba při načítání úkolů:', error);
    res.status(500).json({ error: 'Chyba při načítání úkolů.' });
  }
});

router.post('/trips/:tripId/tasks', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.userId;
  const { tripId } = req.params;
  const { title } = req.body;

  if (!userId) {
    res.status(401).json({ error: 'Neautorizováno.' });
    return;
  }

  try {
    const participant = await prisma.tripUser.findUnique({
      where: { tripId_userId: { tripId, userId } },
    });

    if (!participant || !['CREATOR', 'COOWNER'].includes(participant.role)) {
      res.status(403).json({ error: 'Nemáš oprávnění.' });
      return;
    }

    const lastTask = await prisma.task.findFirst({
      where: { tripId },
      orderBy: { position: 'desc' },
    });

    const task = await prisma.task.create({
      data: {
        title,
        tripId,
        position: lastTask ? lastTask.position + 1 : 1,
      },
    });

    res.status(201).json(task);
  } catch (error) {
    console.error('Chyba při vytváření úkolu:', error);
    res.status(500).json({ error: 'Chyba při vytváření úkolu.' });
  }
});

router.patch('/tasks/:taskId', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.userId;
  const { taskId } = req.params;
  const { title, completed, position } = req.body;

  if (!userId) {
    res.status(401).json({ error: 'Neautorizováno.' });
    return;
  }

  try {
    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) {
      res.status(404).json({ error: 'Úkol nenalezen.' });
      return;
    }

    const participant = await prisma.tripUser.findUnique({
      where: { tripId_userId: { tripId: task.tripId, userId } },
    });

    if (!participant || !['CREATOR', 'COOWNER'].includes(participant.role)) {
      res.status(403).json({ error: 'Nemáš oprávnění.' });
      return;
    }

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: {
        title,
        completed,
        position,
      },
    });

    res.json(updatedTask);
  } catch (error) {
    console.error('Chyba při úpravě úkolu:', error);
    res.status(500).json({ error: 'Chyba při úpravě úkolu.' });
  }
});

router.delete('/tasks/:taskId', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.userId;
  const { taskId } = req.params;

  if (!userId) {
    res.status(401).json({ error: 'Neautorizováno.' });
    return;
  }

  try {
    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) {
      res.status(404).json({ error: 'Úkol nenalezen.' });
      return;
    }

    const participant = await prisma.tripUser.findUnique({
      where: { tripId_userId: { tripId: task.tripId, userId } },
    });

    if (!participant || !['CREATOR', 'COOWNER'].includes(participant.role)) {
      res.status(403).json({ error: 'Nemáš oprávnění.' });
      return;
    }

    await prisma.task.delete({ where: { id: taskId } });

    res.json({ success: true });
  } catch (error) {
    console.error('Chyba při mazání úkolu:', error);
    res.status(500).json({ error: 'Chyba při mazání úkolu.' });
  }
});


// CO S SEBOU
router.get('/trips/:tripId/packing', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  const { tripId } = req.params;

  try {
    const items = await prisma.packingItem.findMany({
      where: { tripId },
      orderBy: { position: 'asc' },
    });

    res.status(200).json(items);
  } catch (error) {
    console.error('Chyba při načítání věcí:', error);
    res.status(500).json({ error: 'Chyba při načítání věcí.' });
  }
});

// CO S SEBOU – přidání položky
router.post('/trips/:tripId/packing', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.userId;
  const { tripId } = req.params;
  const { title } = req.body;

  if (!userId) {
    res.status(401).json({ error: 'Neautorizováno.' });
    return;
  }

  if (!title || typeof title !== 'string') {
    res.status(400).json({ error: 'Neplatný název položky.' });
    return;
  }

  try {
    const participant = await prisma.tripUser.findUnique({
      where: { tripId_userId: { tripId, userId } },
    });

    if (!participant || !['CREATOR', 'COOWNER'].includes(participant.role)) {
      res.status(403).json({ error: 'Nemáš oprávnění.' });
      return;
    }

    const lastItem = await prisma.packingItem.findFirst({
      where: { tripId },
      orderBy: { position: 'desc' },
    });

    const newItem = await prisma.packingItem.create({
      data: {
        title,
        tripId,
        position: lastItem ? lastItem.position + 1 : 1,
      },
    });

    res.status(201).json(newItem);
  } catch (error) {
    console.error('Chyba při přidávání věci:', error);
    res.status(500).json({ error: 'Chyba při přidávání věci.' });
  }
});

// CO S SEBOU – aktualizace položky
router.patch('/packing/:id', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.userId;
  const { id } = req.params;
  const { title, completed, position } = req.body;

  if (!userId) {
    res.status(401).json({ error: 'Neautorizováno.' });
    return;
  }

  try {
    const item = await prisma.packingItem.findUnique({ where: { id } });

    if (!item) {
      res.status(404).json({ error: 'Položka nenalezena.' });
      return;
    }

    const participant = await prisma.tripUser.findUnique({
      where: { tripId_userId: { tripId: item.tripId, userId } },
    });

    if (!participant || !['CREATOR', 'COOWNER'].includes(participant.role)) {
      res.status(403).json({ error: 'Nemáš oprávnění.' });
      return;
    }

    const updatedItem = await prisma.packingItem.update({
      where: { id },
      data: {
        title,
        completed,
        position,
      },
    });

    res.status(200).json(updatedItem);
  } catch (error) {
    console.error('Chyba při aktualizaci položky:', error);
    res.status(500).json({ error: 'Chyba při aktualizaci položky.' });
  }
});

// CO S SEBOU – smazání položky
router.delete('/packing/:id', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.userId;
  const { id } = req.params;

  if (!userId) {
    res.status(401).json({ error: 'Neautorizováno.' });
    return;
  }

  try {
    const item = await prisma.packingItem.findUnique({ where: { id } });

    if (!item) {
      res.status(404).json({ error: 'Položka nenalezena.' });
      return;
    }

    const participant = await prisma.tripUser.findUnique({
      where: { tripId_userId: { tripId: item.tripId, userId } },
    });

    if (!participant || !['CREATOR', 'COOWNER'].includes(participant.role)) {
      res.status(403).json({ error: 'Nemáš oprávnění.' });
      return;
    }

    await prisma.packingItem.delete({ where: { id } });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Chyba při mazání položky:', error);
    res.status(500).json({ error: 'Chyba při mazání položky.' });
  }
});

export default router