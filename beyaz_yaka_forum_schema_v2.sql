-- Beyaz Yaka Toplulugu - Guncellenmis PostgreSQL Schema
-- Yari kapali topluluk: forum icerikleri sadece uyelere acik,
-- genel/editorial icerikler ziyaretcilere acik olabilir.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =========================
-- ENUMS
-- =========================
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('member', 'moderator', 'admin');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE content_status AS ENUM ('draft', 'pending', 'published', 'rejected', 'archived');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE content_area AS ENUM ('forum', 'general');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE visibility_type AS ENUM ('public', 'members_only');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE report_status AS ENUM ('open', 'reviewing', 'resolved', 'dismissed');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE ad_type AS ENUM ('banner', 'sponsored_content', 'affiliate_widget');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- =========================
-- USERS
-- =========================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(30) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'member',

    display_name VARCHAR(60),
    bio TEXT,
    avatar_url TEXT,

    city VARCHAR(100),
    sector VARCHAR(100),
    work_model VARCHAR(20) CHECK (work_model IN ('office', 'hybrid', 'remote')),

    is_email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_banned BOOLEAN NOT NULL DEFAULT FALSE,

    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    last_login_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at DESC);

-- =========================
-- CATEGORIES
-- area = forum veya general
-- visibility forumda members_only olabilir,
-- general kategoriler public olabilir.
-- =========================
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id UUID REFERENCES categories(id) ON DELETE CASCADE,

    name VARCHAR(120) NOT NULL,
    slug VARCHAR(140) NOT NULL UNIQUE,
    description TEXT,

    area content_area NOT NULL,
    default_visibility visibility_type NOT NULL DEFAULT 'members_only',

    sort_order INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_categories_area ON categories(area);
CREATE INDEX IF NOT EXISTS idx_categories_visibility ON categories(default_visibility);

-- =========================
-- CONTENT POSTS
-- Tek tablo ile hem genel yazi hem forum gonderisi tutulur.
-- area + visibility ile ayrim yapilir.
-- =========================
CREATE TABLE IF NOT EXISTS posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,

    title VARCHAR(180) NOT NULL,
    slug VARCHAR(220) NOT NULL UNIQUE,
    excerpt TEXT,
    content TEXT NOT NULL,
    cover_image_url TEXT,

    area content_area NOT NULL,
    visibility visibility_type NOT NULL,
    status content_status NOT NULL DEFAULT 'pending',

    is_anonymous BOOLEAN NOT NULL DEFAULT FALSE,
    is_featured BOOLEAN NOT NULL DEFAULT FALSE,
    allow_comments BOOLEAN NOT NULL DEFAULT TRUE,
    is_sponsored BOOLEAN NOT NULL DEFAULT FALSE,

    view_count INT NOT NULL DEFAULT 0,
    comment_count INT NOT NULL DEFAULT 0,

    published_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_forum_members_only
        CHECK (
            NOT (area = 'forum' AND visibility = 'public')
        )
);

CREATE INDEX IF NOT EXISTS idx_posts_author_id ON posts(author_id);
CREATE INDEX IF NOT EXISTS idx_posts_category_id ON posts(category_id);
CREATE INDEX IF NOT EXISTS idx_posts_area ON posts(area);
CREATE INDEX IF NOT EXISTS idx_posts_visibility ON posts(visibility);
CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);
CREATE INDEX IF NOT EXISTS idx_posts_published_at ON posts(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_featured ON posts(is_featured);
CREATE INDEX IF NOT EXISTS idx_posts_sponsored ON posts(is_sponsored);

-- =========================
-- TAGS
-- =========================
CREATE TABLE IF NOT EXISTS tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(60) NOT NULL UNIQUE,
    slug VARCHAR(80) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS post_tags (
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (post_id, tag_id)
);

-- =========================
-- COMMENTS
-- =========================
CREATE TABLE IF NOT EXISTS comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,

    content TEXT NOT NULL,
    is_edited BOOLEAN NOT NULL DEFAULT FALSE,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    like_count INT NOT NULL DEFAULT 0,

    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at DESC);

-- =========================
-- POST RATINGS
-- Uyeler 1-5 yildiz verebilir.
-- Bir uye, bir yaziya bir kez oy verir.
-- =========================
CREATE TABLE IF NOT EXISTS post_ratings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (post_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_post_ratings_post_id ON post_ratings(post_id);
CREATE INDEX IF NOT EXISTS idx_post_ratings_user_id ON post_ratings(user_id);

-- =========================
-- COMMENT LIKES
-- =========================
CREATE TABLE IF NOT EXISTS comment_likes (
    comment_id UUID NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    PRIMARY KEY (comment_id, user_id)
);

-- =========================
-- REPORTS
-- post veya comment raporlanabilir
-- =========================
CREATE TABLE IF NOT EXISTS reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    target_type VARCHAR(20) NOT NULL CHECK (target_type IN ('post', 'comment')),
    target_post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    target_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    status report_status NOT NULL DEFAULT 'open',
    reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CHECK (
        (target_type = 'post' AND target_post_id IS NOT NULL AND target_comment_id IS NULL) OR
        (target_type = 'comment' AND target_comment_id IS NOT NULL AND target_post_id IS NULL)
    )
);

CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_target_post_id ON reports(target_post_id);
CREATE INDEX IF NOT EXISTS idx_reports_target_comment_id ON reports(target_comment_id);

-- =========================
-- SAVED POSTS
-- =========================
CREATE TABLE IF NOT EXISTS saved_posts (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, post_id)
);

-- =========================
-- BADGES / GAMIFICATION
-- =========================
CREATE TABLE IF NOT EXISTS badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(80) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT
);

CREATE TABLE IF NOT EXISTS user_badges (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    badge_id UUID NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
    earned_at TIMESTAMP NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, badge_id)
);

-- =========================
-- TESTS / QUIZZES
-- Sonuc icin email toplanabilir.
-- =========================
CREATE TABLE IF NOT EXISTS quizzes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(160) NOT NULL,
    slug VARCHAR(180) NOT NULL UNIQUE,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS quiz_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    sort_order INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS quiz_choices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID NOT NULL REFERENCES quiz_questions(id) ON DELETE CASCADE,
    choice_text TEXT NOT NULL,
    score INT NOT NULL DEFAULT 0,
    result_key VARCHAR(80),
    sort_order INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS quiz_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    email VARCHAR(255),
    result_key VARCHAR(80) NOT NULL,
    score INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS email_leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL,
    source VARCHAR(100),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_leads_email ON email_leads(email);

-- =========================
-- ADS / MONETIZATION
-- Reklam, sponsor icerik ve affiliate widget alanlari
-- =========================
CREATE TABLE IF NOT EXISTS ad_slots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(80) NOT NULL UNIQUE,
    location_key VARCHAR(80) NOT NULL UNIQUE,
    description TEXT,
    ad_kind ad_type NOT NULL DEFAULT 'banner',
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS ad_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slot_id UUID NOT NULL REFERENCES ad_slots(id) ON DELETE CASCADE,
    title VARCHAR(160) NOT NULL,
    image_url TEXT,
    body TEXT,
    target_url TEXT NOT NULL,
    starts_at TIMESTAMP,
    ends_at TIMESTAMP,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- =========================
-- OPTIONAL PREMIUM / FUTURE
-- =========================
CREATE TABLE IF NOT EXISTS premium_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(80) NOT NULL UNIQUE,
    description TEXT,
    price_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
    billing_period VARCHAR(20) NOT NULL DEFAULT 'monthly',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES premium_plans(id) ON DELETE RESTRICT,
    starts_at TIMESTAMP NOT NULL DEFAULT NOW(),
    ends_at TIMESTAMP,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired')),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);

-- =========================
-- VIEWS
-- =========================
CREATE OR REPLACE VIEW post_rating_summary AS
SELECT
    p.id AS post_id,
    COUNT(r.id)::INT AS total_votes,
    COALESCE(ROUND(AVG(r.rating)::numeric, 2), 0) AS avg_rating,
    COALESCE(SUM(CASE WHEN r.rating = 1 THEN 1 ELSE 0 END), 0)::INT AS star_1_count,
    COALESCE(SUM(CASE WHEN r.rating = 2 THEN 1 ELSE 0 END), 0)::INT AS star_2_count,
    COALESCE(SUM(CASE WHEN r.rating = 3 THEN 1 ELSE 0 END), 0)::INT AS star_3_count,
    COALESCE(SUM(CASE WHEN r.rating = 4 THEN 1 ELSE 0 END), 0)::INT AS star_4_count,
    COALESCE(SUM(CASE WHEN r.rating = 5 THEN 1 ELSE 0 END), 0)::INT AS star_5_count
FROM posts p
LEFT JOIN post_ratings r ON r.post_id = p.id
GROUP BY p.id;

CREATE OR REPLACE VIEW post_comment_summary AS
SELECT
    p.id AS post_id,
    COUNT(c.id)::INT AS total_comments
FROM posts p
LEFT JOIN comments c
    ON c.post_id = p.id
   AND c.is_deleted = FALSE
GROUP BY p.id;

CREATE OR REPLACE VIEW homepage_public_posts AS
SELECT
    p.id,
    p.title,
    p.slug,
    p.excerpt,
    p.cover_image_url,
    p.published_at,
    p.view_count,
    c.name AS category_name,
    c.slug AS category_slug,
    u.username AS author_username
FROM posts p
JOIN categories c ON c.id = p.category_id
JOIN users u ON u.id = p.author_id
WHERE p.status = 'published'
  AND p.area = 'general'
  AND p.visibility = 'public';

CREATE OR REPLACE VIEW members_forum_posts AS
SELECT
    p.id,
    p.title,
    p.slug,
    p.excerpt,
    p.published_at,
    p.view_count,
    p.is_featured,
    c.name AS category_name,
    c.slug AS category_slug,
    CASE WHEN p.is_anonymous THEN 'anonim' ELSE u.username END AS author_name
FROM posts p
JOIN categories c ON c.id = p.category_id
JOIN users u ON u.id = p.author_id
WHERE p.status = 'published'
  AND p.area = 'forum'
  AND p.visibility = 'members_only';

-- =========================
-- TRIGGERS
-- =========================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_users_updated_at ON users;
CREATE TRIGGER trg_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_posts_updated_at ON posts;
CREATE TRIGGER trg_posts_updated_at
BEFORE UPDATE ON posts
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_comments_updated_at ON comments;
CREATE TRIGGER trg_comments_updated_at
BEFORE UPDATE ON comments
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_post_ratings_updated_at ON post_ratings;
CREATE TRIGGER trg_post_ratings_updated_at
BEFORE UPDATE ON post_ratings
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE OR REPLACE FUNCTION sync_post_comment_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE posts SET comment_count = comment_count + 1 WHERE id = NEW.post_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE posts SET comment_count = GREATEST(comment_count - 1, 0) WHERE id = OLD.post_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_comments_count_insert ON comments;
CREATE TRIGGER trg_comments_count_insert
AFTER INSERT ON comments
FOR EACH ROW EXECUTE FUNCTION sync_post_comment_count();

DROP TRIGGER IF EXISTS trg_comments_count_delete ON comments;
CREATE TRIGGER trg_comments_count_delete
AFTER DELETE ON comments
FOR EACH ROW EXECUTE FUNCTION sync_post_comment_count();

-- =========================
-- SEED DATA
-- Ana kategoriler ve alt kategoriler
-- =========================

-- Ana kategoriler
INSERT INTO categories (name, slug, description, area, default_visibility, sort_order)
VALUES
    ('Beyaz Yaka Dunyasi', 'beyaz-yaka-dunyasi', 'Plaza insaninin dogal yasam alani.', 'forum', 'members_only', 1),
    ('Gercekler ve Yalanlar', 'gercekler-ve-yalanlar', 'Kurumsal hayatin filtresiz hali.', 'forum', 'members_only', 2),
    ('Para ve Kacis', 'para-ve-kacis', 'Maas bordrosu ile hayaller arasindaki mesafe.', 'forum', 'members_only', 3),
    ('Survival Kit', 'survival-kit', 'Plaza hayatta kalma rehberi.', 'general', 'public', 4),
    ('Testler', 'testler', 'Viral buyume ve etkilesim alani.', 'general', 'public', 5)
ON CONFLICT (slug) DO NOTHING;

-- Alt kategoriler - Beyaz Yaka Dunyasi
INSERT INTO categories (parent_id, name, slug, description, area, default_visibility, sort_order)
SELECT id, 'Beyaz Yaka Markalari', 'beyaz-yaka-markalari', 'Plaza insaninin vazgecilmezleri ve cebini yakanlar.', 'forum', 'members_only', 11
FROM categories WHERE slug = 'beyaz-yaka-dunyasi'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO categories (parent_id, name, slug, description, area, default_visibility, sort_order)
SELECT id, 'Beyaz Yaka Ortamlari', 'beyaz-yaka-ortamlari', 'Restoran ve afterwork ortamlari.', 'forum', 'members_only', 12
FROM categories WHERE slug = 'beyaz-yaka-dunyasi'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO categories (parent_id, name, slug, description, area, default_visibility, sort_order)
SELECT id, 'Cuma Kacis Rotalari', 'cuma-kacis-rotalari', 'Hafta sonu oncesi kacis noktalarini toplar.', 'forum', 'members_only', 13
FROM categories WHERE slug = 'beyaz-yaka-dunyasi'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO categories (parent_id, name, slug, description, area, default_visibility, sort_order)
SELECT id, 'Network Mekanlari', 'network-mekanlari', 'Sehir bazli networking ve bulusma mekanlari.', 'forum', 'members_only', 14
FROM categories WHERE slug = 'beyaz-yaka-dunyasi'
ON CONFLICT (slug) DO NOTHING;

-- Alt kategoriler - Gercekler ve Yalanlar
INSERT INTO categories (parent_id, name, slug, description, area, default_visibility, sort_order)
SELECT id, 'Beyaz Yaka Yalanlari', 'beyaz-yaka-yalanlari', 'Kurumsal hayatta surekli tekrar eden klasik cumleler.', 'forum', 'members_only', 21
FROM categories WHERE slug = 'gercekler-ve-yalanlar'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO categories (parent_id, name, slug, description, area, default_visibility, sort_order)
SELECT id, 'LinkedIn Gercegi', 'linkedin-gercegi', 'Profil ile gercek hayat arasindaki fark.', 'forum', 'members_only', 22
FROM categories WHERE slug = 'gercekler-ve-yalanlar'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO categories (parent_id, name, slug, description, area, default_visibility, sort_order)
SELECT id, 'Zam Mitleri', 'zam-mitleri', 'Zam donemlerinde donen kurumsal soylemler.', 'forum', 'members_only', 23
FROM categories WHERE slug = 'gercekler-ve-yalanlar'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO categories (parent_id, name, slug, description, area, default_visibility, sort_order)
SELECT id, 'Kurumsal Motivasyon Yalanlari', 'kurumsal-motivasyon-yalanlari', 'Motivasyon adi altinda sunulan kurumsal klişeler.', 'forum', 'members_only', 24
FROM categories WHERE slug = 'gercekler-ve-yalanlar'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO categories (parent_id, name, slug, description, area, default_visibility, sort_order)
SELECT id, 'Biz Yaptik Olmadi Sendromu', 'biz-yaptik-olmadi-sendromu', 'Ofis icinde tekrar eden bahane mekanizmalari.', 'forum', 'members_only', 25
FROM categories WHERE slug = 'gercekler-ve-yalanlar'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO categories (parent_id, name, slug, description, area, default_visibility, sort_order)
SELECT id, 'Teams Zoom Dramalari', 'teams-zoom-dramalari', 'Online toplantilarin trajikomik tarafi.', 'forum', 'members_only', 26
FROM categories WHERE slug = 'gercekler-ve-yalanlar'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO categories (parent_id, name, slug, description, area, default_visibility, sort_order)
SELECT id, 'Kurumsal Mail Dili Cevirisi', 'kurumsal-mail-dili-cevirisi', 'Mail dilinin gercek hayattaki anlami.', 'forum', 'members_only', 27
FROM categories WHERE slug = 'gercekler-ve-yalanlar'
ON CONFLICT (slug) DO NOTHING;

-- Alt kategoriler - Para ve Kacis
INSERT INTO categories (parent_id, name, slug, description, area, default_visibility, sort_order)
SELECT id, 'Maas Vergi Gercekleri', 'maas-vergi-gercekleri', 'Net, brut ve vergi gercekleri.', 'forum', 'members_only', 31
FROM categories WHERE slug = 'para-ve-kacis'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO categories (parent_id, name, slug, description, area, default_visibility, sort_order)
SELECT id, 'Freelance Rehberi', 'freelance-rehberi', 'Kurumsaldan bagimsiza gecis notlari.', 'forum', 'members_only', 32
FROM categories WHERE slug = 'para-ve-kacis'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO categories (parent_id, name, slug, description, area, default_visibility, sort_order)
SELECT id, 'Remote Isler', 'remote-isler', 'Uzaktan calisma imkanlari ve deneyimleri.', 'forum', 'members_only', 33
FROM categories WHERE slug = 'para-ve-kacis'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO categories (parent_id, name, slug, description, area, default_visibility, sort_order)
SELECT id, 'CV ve Mulakat Taktikleri', 'cv-ve-mulakat-taktikleri', 'Is arama surecinde kullanilacak rehberler.', 'forum', 'members_only', 34
FROM categories WHERE slug = 'para-ve-kacis'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO categories (parent_id, name, slug, description, area, default_visibility, sort_order)
SELECT id, 'Yan Gelir Fikirleri', 'yan-gelir-fikirleri', 'Ek gelir uretecek yollar.', 'forum', 'members_only', 35
FROM categories WHERE slug = 'para-ve-kacis'
ON CONFLICT (slug) DO NOTHING;

-- Alt kategoriler - Survival Kit (public/editorial)
INSERT INTO categories (parent_id, name, slug, description, area, default_visibility, sort_order)
SELECT id, 'Ofis Masasi Setup', 'ofis-masasi-setup', 'Calisma alani duzeni ve urun onerileri.', 'general', 'public', 41
FROM categories WHERE slug = 'survival-kit'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO categories (parent_id, name, slug, description, area, default_visibility, sort_order)
SELECT id, 'Ergonomik Urunler', 'ergonomik-urunler', 'Uzun sureli calisma icin destekleyici urunler.', 'general', 'public', 42
FROM categories WHERE slug = 'survival-kit'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO categories (parent_id, name, slug, description, area, default_visibility, sort_order)
SELECT id, 'Gurultu Engelleyici Kulaklik', 'gurultu-engelleyici-kulaklik', 'Odak icin kulaklik onerileri.', 'general', 'public', 43
FROM categories WHERE slug = 'survival-kit'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO categories (parent_id, name, slug, description, area, default_visibility, sort_order)
SELECT id, 'Mavi Isik Gozluk', 'mavi-isik-gozluk', 'Ekran kullananlar icin gozluk rehberi.', 'general', 'public', 44
FROM categories WHERE slug = 'survival-kit'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO categories (parent_id, name, slug, description, area, default_visibility, sort_order)
SELECT id, 'Planner Ajanda', 'planner-ajanda', 'Planlama ve not alma araclari.', 'general', 'public', 45
FROM categories WHERE slug = 'survival-kit'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO categories (parent_id, name, slug, description, area, default_visibility, sort_order)
SELECT id, 'Productivity Kitaplari', 'productivity-kitaplari', 'Uretkenlik odakli kitap onerileri.', 'general', 'public', 46
FROM categories WHERE slug = 'survival-kit'
ON CONFLICT (slug) DO NOTHING;

-- Alt kategoriler - Testler (public/editorial)
INSERT INTO categories (parent_id, name, slug, description, area, default_visibility, sort_order)
SELECT id, 'Hangi Beyaz Yaka Tipisin', 'hangi-beyaz-yaka-tipisin', 'Kisilik ve rol testi.', 'general', 'public', 51
FROM categories WHERE slug = 'testler'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO categories (parent_id, name, slug, description, area, default_visibility, sort_order)
SELECT id, 'Gercekten Tukenmis misin', 'gercekten-tukenmis-misin', 'Tukenmislik duzeyi testi.', 'general', 'public', 52
FROM categories WHERE slug = 'testler'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO categories (parent_id, name, slug, description, area, default_visibility, sort_order)
SELECT id, 'Kurumsal Hayatta Kac Yilin Kaldi', 'kurumsal-hayatta-kac-yilin-kaldi', 'Kurumsal omur testi.', 'general', 'public', 53
FROM categories WHERE slug = 'testler'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO categories (parent_id, name, slug, description, area, default_visibility, sort_order)
SELECT id, 'LinkedIn Gurusu musun', 'linkedin-gurusu-musun', 'LinkedIn persona testi.', 'general', 'public', 54
FROM categories WHERE slug = 'testler'
ON CONFLICT (slug) DO NOTHING;
