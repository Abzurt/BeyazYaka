const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // 1. Clean up existing data (optional but safer for dev)
  // await prisma.comment.deleteMany({})
  // await prisma.post.deleteMany({})
  // await prisma.category.deleteMany({})

  // 2. Create Public Categories (Dosyalar)
  const catDunyasi = await prisma.category.upsert({
    where: { slug: 'beyaz-yaka-dunyasi' },
    update: {},
    create: {
      name: 'Beyaz Yaka Dünyası',
      slug: 'beyaz-yaka-dunyasi',
      description: 'Plaza insanının doğal yaşam alanı.',
      area: 'general',
      defaultVisibility: 'public'
    }
  })

  const catKacis = await prisma.category.upsert({
    where: { slug: 'para-ve-kacis' },
    update: {},
    create: {
      name: 'Para & Kaçış',
      slug: 'para-ve-kacis',
      description: 'Maaş bordrosu ile hayaller arasındaki mesafe.',
      area: 'general',
      defaultVisibility: 'public'
    }
  })

  // 3. Create Forum Category (Members Only)
  const catGercekler = await prisma.category.upsert({
    where: { slug: 'gercekler-ve-yalanlar' },
    update: {},
    create: {
      name: 'Gerçekler & Yalanlar',
      slug: 'gercekler-ve-yalanlar',
      description: 'Kurumsal hayatın filtresiz hali.',
      area: 'forum',
      defaultVisibility: 'members_only'
    }
  })

  // 4. Create Carousel Categories
  const catMarkalar = await prisma.category.upsert({
    where: { slug: 'beyaz-yaka-markalari' },
    update: {},
    create: {
      name: 'Beyaz Yaka Markaları',
      slug: 'beyaz-yaka-markalari',
      description: 'Plaza insanının vazgeçilmezleri ve cebini yakanlar.',
      area: 'general',
      defaultVisibility: 'public'
    }
  })

  // 5. Create a System User for posts
  const systemUser = await prisma.user.upsert({
    where: { email: 'admin@antigravity.com' },
    update: {},
    create: {
      email: 'admin@antigravity.com',
      username: 'admin',
      role: 'admin',
      displayName: 'Antigravity Admin'
    }
  })

  // 6. Create Brands (Posts)
  const brandsData = [
    {
      title: 'Starbucks',
      slug: 'starbucks',
      excerpt: 'Sabah toplantılarının ve öğleden sonra "odaklanma" seanslarının resmi ortağı.',
      content: 'Sabah toplantılarının sönük geçmemesi için gereken kafein dozunu sağlayan, yeşil logolu o dev. Starbucks sadece bir kahveci değil, "ev ve iş arasındaki üçüncü mekan" felsefesiyle hayatımıza giren bir statü sembolüdür.',
      coverImageUrl: '/images/hero/environments.png',
      tags: ['İçecek', 'Prestij', 'Network']
    },
    {
      title: 'Apple',
      slug: 'apple',
      excerpt: 'Toplantı odasında MacBook açmadan konuşan beyaz yakalıya henüz rastlanmadı.',
      content: 'Toplantı odasında MacBook açmadan konuşan beyaz yakalıya henüz rastlanmadı. Ekosistem sizi içine çeker, cüzdanınızı bırakır.',
      coverImageUrl: '/images/hero/brands.png',
      tags: ['Teknoloji', 'Ekosistem', 'Minimalizm']
    }
  ]

  for (const brand of brandsData) {
    await prisma.post.upsert({
      where: { slug: brand.slug },
      update: {},
      create: {
        title: brand.title,
        slug: brand.slug,
        excerpt: brand.excerpt,
        content: brand.content,
        coverImageUrl: brand.coverImageUrl,
        area: 'general',
        visibility: 'public',
        status: 'published',
        authorId: systemUser.id,
        categoryId: catMarkalar.id
      }
    })
  }

  // 7. Create Ad Slots
  const slotGeneral = await prisma.adSlot.upsert({
    where: { locationKey: 'survival-kit-genel' },
    update: {},
    create: {
      name: 'Survival Kit - Genel',
      locationKey: 'survival-kit-genel',
      description: 'Survival kit ana sayfa listeleme için genel ürünler.',
      adKind: 'affiliate_widget'
    }
  })

  const slotSetup = await prisma.adSlot.upsert({
    where: { locationKey: 'survival-kit-setup' },
    update: {},
    create: {
      name: 'Survival Kit - Ofis Setup',
      locationKey: 'survival-kit-setup',
      description: 'Ofis masası ve ergonomi ürünleri.',
      adKind: 'affiliate_widget'
    }
  })

  const slotEducation = await prisma.adSlot.upsert({
    where: { locationKey: 'survival-kit-kitap' },
    update: {},
    create: {
      name: 'Survival Kit - Kitap & Eğitim',
      locationKey: 'survival-kit-kitap',
      description: 'Kariyer ve gelişim kitapları.',
      adKind: 'affiliate_widget'
    }
  })

  // 8. Create Ad Campaigns
  const campaigns = [
    {
      title: 'Sony WH-1000XM5 Kulaklık',
      body: 'Open-office kaosunda hayatta kalmanın tek yolu. Üstün gürültü engelleme özelliği ile toplantılarınızı sessizce yönetin.',
      imageUrl: 'https://images.unsplash.com/photo-1644737599372-76bcca2dd330?q=80&w=2070&auto=format&fit=crop',
      targetUrl: 'https://www.amazon.com.tr/sony-wh-1000xm5',
      slotId: slotGeneral.id
    },
    {
      title: 'Herman Miller Embody Koltuk',
      body: 'Maaşın yarısını bel sağlığına yatırmak isteyenler için. Dünyanın en ergonomik çalışma koltuğu ile tanışın.',
      imageUrl: 'https://images.unsplash.com/photo-1592074455389-a4799564c7ad?q=80&w=1964&auto=format&fit=crop',
      targetUrl: 'https://www.hermanmiller.com/products/seating/office-chairs/embody-chairs/',
      slotId: slotSetup.id
    },
    {
      title: 'Keychron K2 Mekanik Klavye',
      body: 'O meşhur mekanik klavye sesiyle ofistekileri delirtme garantili. Hem şık hem de yazım kalitesi yüksek.',
      imageUrl: 'https://images.unsplash.com/photo-1595225405013-989788b01e67?q=80&w=2070&auto=format&fit=crop',
      targetUrl: 'https://www.keychron.com/products/keychron-k2-wireless-mechanical-keyboard',
      slotId: slotSetup.id
    },
    {
      title: 'Deep Work - Cal Newport',
      body: 'Pür dikkat çalışma sanatı. Slack bildirimleri arasında nasıl odaklanılır? Bu kitap size anlatacak.',
      imageUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=1887&auto=format&fit=crop',
      targetUrl: 'https://www.kitapyurdu.com/kitap/pur-dikkat-odaklanmis-basari-icin-kurallar/427961.html',
      slotId: slotEducation.id
    },
    {
      title: 'Ember Mug 2 Smart Termos',
      body: 'Toplantılar asla bitmez ama kahveniz sıcak kalır. Uygulama kontrollü akıllı termos.',
      imageUrl: 'https://images.unsplash.com/photo-1544787210-282dd25b2f3f?q=80&w=1911&auto=format&fit=crop',
      targetUrl: 'https://ember.com/products/ember-mug-2',
      slotId: slotGeneral.id
    },
    {
      title: 'Logitech MX Vertical Mouse',
      body: 'Karpal tünel sendromuna karşı ilk yardım kiti. Bilimsel olarak tasarlanmış dikey fare.',
      imageUrl: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?q=80&w=2070&auto=format&fit=crop',
      targetUrl: 'https://www.logitech.com/tr-tr/products/mice/mx-vertical-ergonomic-mouse.910-005448.html',
      slotId: slotSetup.id
    }
  ]

  for (const campaign of campaigns) {
    await prisma.adCampaign.upsert({
      where: { id: '00000000-0000-0000-0000-00000000000' + campaigns.indexOf(campaign) }, // Fake ID for upsert logic if needed, but easier to just use create if not exists
      update: {
        title: campaign.title,
        body: campaign.body,
        imageUrl: campaign.imageUrl,
        targetUrl: campaign.targetUrl,
        slotId: campaign.slotId
      },
      create: {
        title: campaign.title,
        body: campaign.body,
        imageUrl: campaign.imageUrl,
        targetUrl: campaign.targetUrl,
        slotId: campaign.slotId
      }
    })
  }

  console.log('Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
