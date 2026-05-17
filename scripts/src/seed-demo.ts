import {
  appointmentsTable,
  barbershopsTable,
  barbersTable,
  clientsTable,
  db,
  expensesTable,
  reviewsTable,
  servicesTable,
  pool,
} from "@workspace/db";

const coverImages = [
  "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&q=80&w=1200",
  "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&q=80&w=1200",
  "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=1200",
  "https://images.unsplash.com/photo-1512690459411-b9245aed614b?auto=format&fit=crop&q=80&w=1200",
];

async function resetDemoData() {
  await db.delete(expensesTable);
  await db.delete(reviewsTable);
  await db.delete(appointmentsTable);
  await db.delete(clientsTable);
  await db.delete(servicesTable);
  await db.delete(barbersTable);
  await db.delete(barbershopsTable);
}

async function seedDemoData() {
  const shops = await db
    .insert(barbershopsTable)
    .values([
      {
        name: "Kreuzberg Klinge",
        description: "Moderner Berliner Barbershop mit Fokus auf Fades, Bartpflege und entspannter Nachbarschaftsatmosphaere.",
        city: "Berlin",
        address: "Oranienstrasse 42, 10999 Berlin",
        phone: "+49 30 4421 9080",
        email: "hallo@kreuzberg-klinge.de",
        website: "https://kreuzberg-klinge.example",
        rating: 4.8,
        reviewCount: 186,
        coverImage: coverImages[0],
        photos: coverImages,
        specialties: ["Skin Fade", "Beard Trim", "Hot Towel Shave", "Classic Cut"],
        languages: ["Deutsch", "Englisch", "Tuerkisch"],
        nationalityFlag: "🇩🇪",
        nationalityLabel: "German",
        isPremium: true,
        isVerified: true,
        ownerId: 1,
      },
      {
        name: "Isar Barber Atelier",
        description: "Praezise Haarschnitte und klassische Rasuren im Herzen von Muenchen.",
        city: "Muenchen",
        address: "Fraunhoferstrasse 18, 80469 Muenchen",
        phone: "+49 89 2198 4410",
        email: "servus@isar-barber.de",
        website: "https://isar-barber.example",
        rating: 4.6,
        reviewCount: 94,
        coverImage: coverImages[1],
        photos: coverImages.slice(1),
        specialties: ["Classic Cut", "Executive Cut", "Beard Styling"],
        languages: ["Deutsch", "Englisch"],
        nationalityFlag: "🇩🇪",
        nationalityLabel: "Bavarian",
        isPremium: false,
        isVerified: true,
        ownerId: 1,
      },
      {
        name: "Hanse Schnitt Hamburg",
        description: "Norddeutscher Barber-Stil mit klaren Konturen, ruhigem Service und schneller Online-Buchung.",
        city: "Hamburg",
        address: "Schanzenstrasse 73, 20357 Hamburg",
        phone: "+49 40 3377 1204",
        email: "moin@hanse-schnitt.de",
        website: "https://hanse-schnitt.example",
        rating: 4.7,
        reviewCount: 128,
        coverImage: coverImages[2],
        photos: coverImages,
        specialties: ["Low Fade", "Scissor Cut", "Beard Trim", "Kids Cut"],
        languages: ["Deutsch", "Englisch", "Arabisch"],
        nationalityFlag: "🇩🇪",
        nationalityLabel: "Northern German",
        isPremium: true,
        isVerified: true,
        ownerId: 2,
      },
      {
        name: "Koeln Kontur",
        description: "Lockerer Veedel-Barber mit sauberem Handwerk, fairen Preisen und treuer Stammkundschaft.",
        city: "Koeln",
        address: "Aachener Strasse 221, 50931 Koeln",
        phone: "+49 221 5609 7712",
        email: "termin@koeln-kontur.de",
        website: "https://koeln-kontur.example",
        rating: 4.5,
        reviewCount: 76,
        coverImage: coverImages[3],
        photos: coverImages.slice(0, 3),
        specialties: ["Taper Fade", "Beard Trim", "Classic Cut"],
        languages: ["Deutsch", "Englisch", "Italienisch"],
        nationalityFlag: "🇩🇪",
        nationalityLabel: "German",
        isPremium: false,
        isVerified: true,
        ownerId: 2,
      },
    ])
    .returning();

  const barbers = await db
    .insert(barbersTable)
    .values([
      {
        name: "Lukas Schneider",
        bio: "Spezialist fuer saubere Skin Fades und natuerliche Bartlinien.",
        barbershopId: shops[0].id,
        nationality: "Deutsch",
        nationalityFlag: "🇩🇪",
        specialties: ["Skin Fade", "Beard Trim"],
        languages: ["Deutsch", "Englisch"],
        rating: 4.9,
        reviewCount: 83,
        avatarUrl: "https://images.unsplash.com/photo-1618077360395-f3068be8e001?auto=format&fit=crop&q=80&w=400",
        yearsExperience: 9,
      },
      {
        name: "Emre Kaya",
        bio: "Praezise Konturen, schnelle Fades und entspannter Service.",
        barbershopId: shops[0].id,
        nationality: "Deutsch-Tuerkisch",
        nationalityFlag: "🇹🇷",
        specialties: ["Fade", "Hot Towel Shave"],
        languages: ["Deutsch", "Tuerkisch", "Englisch"],
        rating: 4.8,
        reviewCount: 64,
        avatarUrl: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&q=80&w=400",
        yearsExperience: 7,
      },
      {
        name: "Maximilian Bauer",
        bio: "Klassische Schnitte, Business Looks und ruhige Beratung.",
        barbershopId: shops[1].id,
        nationality: "Deutsch",
        nationalityFlag: "🇩🇪",
        specialties: ["Classic Cut", "Executive Cut"],
        languages: ["Deutsch", "Englisch"],
        rating: 4.7,
        reviewCount: 51,
        avatarUrl: "https://images.unsplash.com/photo-1582893561942-d61adcb2e534?auto=format&fit=crop&q=80&w=400",
        yearsExperience: 11,
      },
      {
        name: "Jonas Petersen",
        bio: "Nordischer Stil, klare Linien und unkomplizierte Termine.",
        barbershopId: shops[2].id,
        nationality: "Deutsch",
        nationalityFlag: "🇩🇪",
        specialties: ["Low Fade", "Scissor Cut"],
        languages: ["Deutsch", "Englisch"],
        rating: 4.6,
        reviewCount: 47,
        avatarUrl: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=400",
        yearsExperience: 6,
      },
      {
        name: "Matteo Russo",
        bio: "Bartpflege und klassische Konturen mit italienischer Ruhe.",
        barbershopId: shops[3].id,
        nationality: "Deutsch-Italienisch",
        nationalityFlag: "🇮🇹",
        specialties: ["Beard Styling", "Taper Fade"],
        languages: ["Deutsch", "Italienisch", "Englisch"],
        rating: 4.8,
        reviewCount: 59,
        avatarUrl: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400",
        yearsExperience: 8,
      },
    ])
    .returning();

  const services = await db
    .insert(servicesTable)
    .values(
      shops.flatMap((shop) => [
        {
          name: "Haircut",
          description: "Beratung, Waschen und praeziser Schnitt.",
          price: 32,
          durationMinutes: 40,
          category: "Haircut",
          barbershopId: shop.id,
        },
        {
          name: "Skin Fade",
          description: "Sauberer Fade mit Konturen.",
          price: 38,
          durationMinutes: 50,
          category: "Fade",
          barbershopId: shop.id,
        },
        {
          name: "Beard Trim",
          description: "Bart formen, Konturen und Pflegefinish.",
          price: 22,
          durationMinutes: 25,
          category: "Beard",
          barbershopId: shop.id,
        },
      ]),
    )
    .returning();

  const clients = await db
    .insert(clientsTable)
    .values([
      {
        name: "Felix Wagner",
        email: "felix.wagner@example.de",
        phone: "+49 151 2300 1842",
        barbershopId: shops[0].id,
        birthdate: "1991-04-12",
        notes: "Bevorzugt Skin Fade, Seiten sehr kurz.",
        preferredBarberId: barbers[0].id,
        lastVisit: "2026-05-03",
        totalVisits: 12,
        totalSpent: 486,
        loyaltyPoints: 120,
      },
      {
        name: "Anna Hoffmann",
        email: "anna.hoffmann@example.de",
        phone: "+49 176 4401 9273",
        barbershopId: shops[0].id,
        birthdate: "1988-09-21",
        notes: "Bucht meist fuer ihren Sohn mit.",
        preferredBarberId: barbers[1].id,
        lastVisit: "2026-05-10",
        totalVisits: 6,
        totalSpent: 204,
        loyaltyPoints: 64,
      },
      {
        name: "Tobias Klein",
        email: "tobias.klein@example.de",
        phone: "+49 160 8827 4410",
        barbershopId: shops[1].id,
        birthdate: "1984-01-30",
        notes: "Business Cut, alle vier Wochen.",
        preferredBarberId: barbers[2].id,
        lastVisit: "2026-05-14",
        totalVisits: 18,
        totalSpent: 692,
        loyaltyPoints: 180,
      },
      {
        name: "Sophie Neumann",
        email: "sophie.neumann@example.de",
        phone: "+49 171 3400 2258",
        barbershopId: shops[2].id,
        birthdate: "1995-07-03",
        notes: "Kurzer Scissor Cut, mag ruhige Termine.",
        preferredBarberId: barbers[3].id,
        lastVisit: "2026-04-28",
        totalVisits: 4,
        totalSpent: 148,
        loyaltyPoints: 36,
      },
      {
        name: "Marc Becker",
        email: "marc.becker@example.de",
        phone: "+49 152 7711 6094",
        barbershopId: shops[3].id,
        birthdate: "1990-11-18",
        notes: "Bartkonturen sehr exakt, keine Duftprodukte.",
        preferredBarberId: barbers[4].id,
        lastVisit: "2026-05-08",
        totalVisits: 9,
        totalSpent: 314,
        loyaltyPoints: 92,
      },
      {
        name: "Katharina Wolf",
        email: "katharina.wolf@example.de",
        phone: "+49 157 5092 8831",
        barbershopId: shops[0].id,
        birthdate: "1993-02-06",
        notes: "Kauft oft Pflegeprodukte nach dem Termin.",
        preferredBarberId: barbers[0].id,
        lastVisit: "2026-05-15",
        totalVisits: 7,
        totalSpent: 276,
        loyaltyPoints: 78,
      },
    ])
    .returning();

  await db.insert(appointmentsTable).values([
    {
      clientId: clients[0].id,
      barberId: barbers[0].id,
      serviceId: services[1].id,
      barbershopId: shops[0].id,
      scheduledAt: "2026-05-18T09:30:00+02:00",
      status: "confirmed",
      price: 38,
      notes: "Skin Fade, oben nur leicht kuerzen.",
    },
    {
      clientId: clients[1].id,
      barberId: barbers[1].id,
      serviceId: services[2].id,
      barbershopId: shops[0].id,
      scheduledAt: "2026-05-18T11:00:00+02:00",
      status: "pending",
      price: 22,
      notes: "Bart trimmen und Konturen.",
    },
    {
      clientId: clients[2].id,
      barberId: barbers[2].id,
      serviceId: services[3].id,
      barbershopId: shops[1].id,
      scheduledAt: "2026-05-19T14:00:00+02:00",
      status: "confirmed",
      price: 32,
      notes: "Business Cut.",
    },
    {
      clientId: clients[4].id,
      barberId: barbers[4].id,
      serviceId: services[11].id,
      barbershopId: shops[3].id,
      scheduledAt: "2026-05-20T16:30:00+02:00",
      status: "completed",
      price: 22,
      notes: "Bartservice abgeschlossen.",
    },
  ]);

  await db.insert(reviewsTable).values([
    {
      rating: 5,
      comment: "Sehr sauberer Fade und puenktlicher Termin.",
      barbershopId: shops[0].id,
      barberId: barbers[0].id,
      clientId: clients[0].id,
      clientName: "Felix Wagner",
    },
    {
      rating: 5,
      comment: "Ruhige Atmosphaere, toller Service.",
      barbershopId: shops[1].id,
      barberId: barbers[2].id,
      clientId: clients[2].id,
      clientName: "Tobias Klein",
    },
    {
      rating: 4,
      comment: "Guter Schnitt und faire Preise.",
      barbershopId: shops[2].id,
      barberId: barbers[3].id,
      clientId: clients[3].id,
      clientName: "Sophie Neumann",
    },
  ]);

  await db.insert(expensesTable).values([
    {
      barbershopId: shops[0].id,
      amount: "1850.00",
      category: "rent",
      type: "fixed",
      description: "Miete Mai",
      date: "2026-05-01",
    },
    {
      barbershopId: shops[0].id,
      amount: "420.00",
      category: "supplies",
      type: "variable",
      description: "Pomade, Klingen und Handtuecher",
      date: "2026-05-06",
    },
    {
      barbershopId: shops[1].id,
      amount: "260.00",
      category: "marketing",
      type: "variable",
      description: "Lokale Social Ads",
      date: "2026-05-09",
    },
  ]);

  return {
    shops: shops.length,
    barbers: barbers.length,
    services: services.length,
    clients: clients.length,
  };
}

try {
  await resetDemoData();
  const summary = await seedDemoData();
  console.log("Demo data seeded:", summary);
} finally {
  await pool.end();
}
