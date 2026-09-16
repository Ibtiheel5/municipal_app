-- ============================================================
-- data.sql - Version complète corrigée
-- Tables TIB alignées avec les entités Java fournies :
-- categorie_tib / valeur_venale / parametre_tib
-- ============================================================

-- ============================================================
-- 1. MISE À JOUR STRUCTURE
-- ============================================================
ALTER TABLE users ADD COLUMN IF NOT EXISTS statut VARCHAR(20) DEFAULT 'EN_ATTENTE';
ALTER TABLE rues ALTER COLUMN eclairage_public SET DEFAULT false;
ALTER TABLE rues ALTER COLUMN assainissement SET DEFAULT false;
ALTER TABLE rues ALTER COLUMN eau_potable SET DEFAULT false;
ALTER TABLE rues ALTER COLUMN electricite SET DEFAULT false;
ALTER TABLE rues ALTER COLUMN voirie SET DEFAULT false;
ALTER TABLE rues ALTER COLUMN proprete SET DEFAULT false;
ALTER TABLE rues ALTER COLUMN autre_critere SET DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS municipalite_id BIGINT;

-- ============================================================
-- 2. ADMIN
-- ============================================================
INSERT INTO users (id, nom, email, password, role, statut)
VALUES (1, 'Administrateur', 'admin@municipal.tn',
        '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lHuu',
        'ADMIN', 'ACTIF')
ON CONFLICT (email) DO NOTHING;

-- ============================================================
-- 3. MUNICIPALITÉS (avec IDs explicites)
-- ============================================================
INSERT INTO municipalites (id, nom, description) VALUES
(1, 'Tunis', 'Capitale et municipalité centrale'),
(2, 'La Marsa', 'Municipalité côtière nord de Tunis'),
(3, 'Carthage', 'Municipalité historique'),
(4, 'Le Bardo', 'Municipalité ouest de Tunis'),
(5, 'Ariana', 'Municipalité nord de Tunis'),
(6, 'Ben Arous', 'Municipalité sud de Tunis'),
(7, 'La Goulette', 'Municipalité portuaire'),
(8, 'Sidi Bou Saïd', 'Village de charme au nord'),
(9, 'Manouba', 'Municipalité ouest'),
(10, 'Ezzouhour', 'Municipalité nord-ouest')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 4. SECTEURS - TUNIS (municipalite_id = 1)
-- ============================================================
INSERT INTO secteurs (id, nom, municipalite_id) VALUES
(1, 'Médina', 1),
(2, 'Lafayette', 1),
(3, 'Bab El Bhar', 1),
(4, 'El Menzah', 1),
(5, 'Belvedère', 1)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 5. RUES - MÉDINA (secteur_id = 1)
-- ============================================================
INSERT INTO rues (
    id, nom, secteur_id, prix_reference_m2, taux, taux_base, etat,
    eclairage_public, assainissement, eau_potable, electricite,
    voirie, proprete, autre_critere, autre_critere_details,
    observations, nb_criteres_coches, priorite
)
VALUES
(1, 'Rue de la Kasbah', 1, 180.00, 0.08, 0.02, 'BONNE', true, true, false, true, false, false, false, NULL, NULL, 3, 1),
(2, 'Rue Sidi Ben Arous', 1, 170.00, 0.08, 0.02, 'BONNE', true, true, true, true, false, false, false, NULL, NULL, 4, 1),
(3, 'Rue Jemaa Zitouna', 1, 190.00, 0.10, 0.02, 'BONNE', true, true, true, true, true, false, false, NULL, NULL, 5, 1),
(4, 'Souk El Attarine', 1, 200.00, 0.10, 0.02, 'MOYENNE', true, true, true, true, false, false, false, NULL, NULL, 4, 2),
(5, 'Rue de la Commission', 1, 160.00, 0.08, 0.02, 'BONNE', true, true, false, true, false, false, false, NULL, NULL, 3, 1)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 6. RUES - LAFAYETTE (secteur_id = 2)
-- ============================================================
INSERT INTO rues (
    id, nom, secteur_id, prix_reference_m2, taux, taux_base, etat,
    eclairage_public, assainissement, eau_potable, electricite,
    voirie, proprete, autre_critere, autre_critere_details,
    observations, nb_criteres_coches, priorite
)
VALUES
(6, 'Avenue de Paris', 2, 210.00, 0.10, 0.02, 'BONNE', true, true, true, true, true, false, false, NULL, NULL, 5, 1),
(7, 'Rue de Marseille', 2, 190.00, 0.08, 0.02, 'BONNE', true, true, true, true, false, false, false, NULL, NULL, 4, 1),
(8, 'Avenue de Carthage', 2, 200.00, 0.10, 0.02, 'MOYENNE', true, true, false, true, false, false, false, NULL, NULL, 3, 2),
(9, 'Rue Charles de Gaulle', 2, 185.00, 0.08, 0.02, 'BONNE', true, true, true, true, false, false, false, NULL, NULL, 4, 1)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 7. RUES - BAB EL BHAR (secteur_id = 3)
-- ============================================================
INSERT INTO rues (
    id, nom, secteur_id, prix_reference_m2, taux, taux_base, etat,
    eclairage_public, assainissement, eau_potable, electricite,
    voirie, proprete, autre_critere, autre_critere_details,
    observations, nb_criteres_coches, priorite
)
VALUES
(10, 'Avenue Habib Bourguiba', 3, 250.00, 0.12, 0.02, 'BONNE', true, true, true, true, true, true, false, NULL, NULL, 6, 1),
(11, 'Rue d''Espagne', 3, 220.00, 0.10, 0.02, 'BONNE', true, true, true, true, true, false, false, NULL, NULL, 5, 1),
(12, 'Rue d''Angleterre', 3, 210.00, 0.10, 0.02, 'MOYENNE', true, true, true, true, false, false, false, NULL, NULL, 4, 2),
(13, 'Rue de Rome', 3, 200.00, 0.08, 0.02, 'BONNE', true, true, false, true, false, false, false, NULL, NULL, 3, 1)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 8. RUES - EL MENZAH (secteur_id = 4)
-- ============================================================
INSERT INTO rues (
    id, nom, secteur_id, prix_reference_m2, taux, taux_base, etat,
    eclairage_public, assainissement, eau_potable, electricite,
    voirie, proprete, autre_critere, autre_critere_details,
    observations, nb_criteres_coches, priorite
)
VALUES
(14, 'Avenue Mohamed V', 4, 230.00, 0.10, 0.02, 'BONNE', true, true, true, true, true, false, false, NULL, NULL, 5, 1),
(15, 'Rue El Menzah 1', 4, 200.00, 0.08, 0.02, 'BONNE', true, true, true, true, false, false, false, NULL, NULL, 4, 1),
(16, 'Rue El Menzah 6', 4, 195.00, 0.08, 0.02, 'BONNE', true, true, false, true, false, false, false, NULL, NULL, 3, 1)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 9. RUES - BELVEDÈRE (secteur_id = 5)
-- ============================================================
INSERT INTO rues (
    id, nom, secteur_id, prix_reference_m2, taux, taux_base, etat,
    eclairage_public, assainissement, eau_potable, electricite,
    voirie, proprete, autre_critere, autre_critere_details,
    observations, nb_criteres_coches, priorite
)
VALUES
(17, 'Avenue du Belvédère', 5, 220.00, 0.10, 0.02, 'BONNE', true, true, true, true, false, false, false, NULL, NULL, 4, 1),
(18, 'Rue du Parc', 5, 190.00, 0.08, 0.02, 'BONNE', true, true, false, true, false, false, false, NULL, NULL, 3, 1)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 10. SECTEURS - LA MARSA (municipalite_id = 2)
-- ============================================================
INSERT INTO secteurs (id, nom, municipalite_id) VALUES
(6, 'La Marsa Plage', 2),
(7, 'La Marsa Centre', 2),
(8, 'Aïn Zaghouan', 2)
ON CONFLICT (id) DO NOTHING;

-- 10.1 RUES - LA MARSA PLAGE (secteur_id = 6)
INSERT INTO rues (
    id, nom, secteur_id, prix_reference_m2, taux, taux_base, etat,
    eclairage_public, assainissement, eau_potable, electricite,
    voirie, proprete, autre_critere, autre_critere_details,
    observations, nb_criteres_coches, priorite
)
VALUES
(19, 'Avenue Taieb Mhiri', 6, 280.00, 0.12, 0.02, 'BONNE', true, true, true, true, true, true, false, NULL, NULL, 6, 1),
(20, 'Rue de la Plage', 6, 260.00, 0.10, 0.02, 'BONNE', true, true, true, true, true, false, false, NULL, NULL, 5, 1)
ON CONFLICT (id) DO NOTHING;

-- 10.2 RUES - LA MARSA CENTRE (secteur_id = 7)
INSERT INTO rues (
    id, nom, secteur_id, prix_reference_m2, taux, taux_base, etat,
    eclairage_public, assainissement, eau_potable, electricite,
    voirie, proprete, autre_critere, autre_critere_details,
    observations, nb_criteres_coches, priorite
)
VALUES
(21, 'Avenue du Président Bourguiba', 7, 270.00, 0.12, 0.02, 'BONNE', true, true, true, true, true, true, false, NULL, NULL, 6, 1),
(22, 'Rue du Commerce', 7, 250.00, 0.10, 0.02, 'BONNE', true, true, true, true, true, false, false, NULL, NULL, 5, 1),
(23, 'Rue Ali Belhouane', 7, 240.00, 0.10, 0.02, 'MOYENNE', true, true, true, true, false, false, false, NULL, NULL, 4, 2)
ON CONFLICT (id) DO NOTHING;

-- 10.3 RUES - AÏN ZAGHOUAN (secteur_id = 8)
INSERT INTO rues (
    id, nom, secteur_id, prix_reference_m2, taux, taux_base, etat,
    eclairage_public, assainissement, eau_potable, electricite,
    voirie, proprete, autre_critere, autre_critere_details,
    observations, nb_criteres_coches, priorite
)
VALUES
(24, 'Avenue Aïn Zaghouan Nord', 8, 230.00, 0.10, 0.02, 'BONNE', true, true, true, true, false, false, false, NULL, NULL, 4, 1),
(25, 'Rue des Jasmins', 8, 210.00, 0.08, 0.02, 'BONNE', true, true, false, true, false, false, false, NULL, NULL, 3, 1)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 11. SECTEURS - CARTHAGE (municipalite_id = 3)
-- ============================================================
INSERT INTO secteurs (id, nom, municipalite_id) VALUES
(9, 'Carthage Hannibal', 3),
(10, 'Carthage Dermech', 3),
(11, 'Carthage Byrsa', 3)
ON CONFLICT (id) DO NOTHING;

-- 11.1 RUES - CARTHAGE HANNIBAL (secteur_id = 9)
INSERT INTO rues (
    id, nom, secteur_id, prix_reference_m2, taux, taux_base, etat,
    eclairage_public, assainissement, eau_potable, electricite,
    voirie, proprete, autre_critere, autre_critere_details,
    observations, nb_criteres_coches, priorite
)
VALUES
(26, 'Avenue de la République', 9, 350.00, 0.14, 0.02, 'BONNE', true, true, true, true, true, true, true, NULL, NULL, 7, 1),
(27, 'Rue Hannibal', 9, 320.00, 0.12, 0.02, 'BONNE', true, true, true, true, true, true, false, NULL, NULL, 6, 1)
ON CONFLICT (id) DO NOTHING;

-- 11.2 RUES - CARTHAGE DERMECH (secteur_id = 10)
INSERT INTO rues (
    id, nom, secteur_id, prix_reference_m2, taux, taux_base, etat,
    eclairage_public, assainissement, eau_potable, electricite,
    voirie, proprete, autre_critere, autre_critere_details,
    observations, nb_criteres_coches, priorite
)
VALUES
(28, 'Avenue des Thermes', 10, 310.00, 0.12, 0.02, 'BONNE', true, true, true, true, true, false, false, NULL, NULL, 5, 1),
(29, 'Rue Hamilcar', 10, 290.00, 0.10, 0.02, 'BONNE', true, true, true, true, true, false, false, NULL, NULL, 5, 1)
ON CONFLICT (id) DO NOTHING;

-- 11.3 RUES - CARTHAGE BYRSA (secteur_id = 11)
INSERT INTO rues (
    id, nom, secteur_id, prix_reference_m2, taux, taux_base, etat,
    eclairage_public, assainissement, eau_potable, electricite,
    voirie, proprete, autre_critere, autre_critere_details,
    observations, nb_criteres_coches, priorite
)
VALUES
(30, 'Rue de Byrsa', 11, 330.00, 0.12, 0.02, 'BONNE', true, true, true, true, true, true, false, NULL, NULL, 6, 1)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 12. SECTEURS - LE BARDO (municipalite_id = 4)
-- ============================================================
INSERT INTO secteurs (id, nom, municipalite_id) VALUES
(12, 'Bardo Centre', 4),
(13, 'Bardo Nord', 4)
ON CONFLICT (id) DO NOTHING;

-- 12.1 RUES - BARDO CENTRE (secteur_id = 12)
INSERT INTO rues (
    id, nom, secteur_id, prix_reference_m2, taux, taux_base, etat,
    eclairage_public, assainissement, eau_potable, electricite,
    voirie, proprete, autre_critere, autre_critere_details,
    observations, nb_criteres_coches, priorite
)
VALUES
(31, 'Avenue du Bardo', 12, 200.00, 0.10, 0.02, 'BONNE', true, true, true, true, true, false, false, NULL, NULL, 5, 1),
(32, 'Rue du Musée', 12, 190.00, 0.08, 0.02, 'BONNE', true, true, true, true, false, false, false, NULL, NULL, 4, 1),
(33, 'Rue Ibn Khaldoun', 12, 185.00, 0.08, 0.02, 'MOYENNE', true, true, false, true, false, false, false, NULL, NULL, 3, 2)
ON CONFLICT (id) DO NOTHING;

-- 12.2 RUES - BARDO NORD (secteur_id = 13)
INSERT INTO rues (
    id, nom, secteur_id, prix_reference_m2, taux, taux_base, etat,
    eclairage_public, assainissement, eau_potable, electricite,
    voirie, proprete, autre_critere, autre_critere_details,
    observations, nb_criteres_coches, priorite
)
VALUES
(34, 'Avenue Mongi Slim', 13, 195.00, 0.08, 0.02, 'BONNE', true, true, true, true, false, false, false, NULL, NULL, 4, 1),
(35, 'Rue de Tunis', 13, 180.00, 0.08, 0.02, 'BONNE', true, true, false, true, false, false, false, NULL, NULL, 3, 1)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 13. SECTEURS - LA GOULETTE (municipalite_id = 7)
-- ============================================================
INSERT INTO secteurs (id, nom, municipalite_id) VALUES
(14, 'La Goulette Vieille', 7),
(15, 'Kheireddine', 7)
ON CONFLICT (id) DO NOTHING;

-- 13.1 RUES - LA GOULETTE VIEILLE (secteur_id = 14)
INSERT INTO rues (
    id, nom, secteur_id, prix_reference_m2, taux, taux_base, etat,
    eclairage_public, assainissement, eau_potable, electricite,
    voirie, proprete, autre_critere, autre_critere_details,
    observations, nb_criteres_coches, priorite
)
VALUES
(36, 'Avenue Franklin Roosevelt', 14, 240.00, 0.10, 0.02, 'BONNE', true, true, true, true, true, false, false, NULL, NULL, 5, 1),
(37, 'Rue de la Jetée', 14, 230.00, 0.10, 0.02, 'MOYENNE', true, true, true, true, false, false, false, NULL, NULL, 4, 2),
(38, 'Rue du Port', 14, 220.00, 0.08, 0.02, 'BONNE', true, true, true, true, false, false, false, NULL, NULL, 4, 1)
ON CONFLICT (id) DO NOTHING;

-- 13.2 RUES - KHEIREDDINE (secteur_id = 15)
INSERT INTO rues (
    id, nom, secteur_id, prix_reference_m2, taux, taux_base, etat,
    eclairage_public, assainissement, eau_potable, electricite,
    voirie, proprete, autre_critere, autre_critere_details,
    observations, nb_criteres_coches, priorite
)
VALUES
(39, 'Avenue Kheireddine', 15, 230.00, 0.10, 0.02, 'BONNE', true, true, true, true, false, false, false, NULL, NULL, 4, 1),
(40, 'Rue des Pêcheurs', 15, 210.00, 0.08, 0.02, 'BONNE', true, true, false, true, false, false, false, NULL, NULL, 3, 1)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 14. CATÉGORIES TIB - ✅ CORRECTION : Ajout du champ libelle
-- ============================================================
INSERT INTO categorie_tib (id, code, libelle, prix_reference_m2, description, ordre_affichage, municipalite_id, actif)
VALUES
(1, '1', 'Catégorie 1 - Habitat populaire', 100.00, 'Moins de 100 DT/m²', 1, 1, true),
(2, '101', 'Catégorie 101 - Habitat standard', 130.00, '101 à 200 DT/m²', 2, 1, true),
(3, '201', 'Catégorie 201 - Habitat confortable', 170.00, '201 à 300 DT/m²', 3, 1, true),
(4, '301', 'Catégorie 301 - Habitat haut standing', 200.00, '301 à 400 DT/m²', 4, 1, true),
(5, '>400', 'Catégorie >400 - Luxe', 250.00, 'Plus de 400 DT/m²', 5, 1, true)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 15. VALEURS VÉNALES
-- ============================================================
INSERT INTO valeur_venale (id, zone, valeur_venale_m2, description, municipalite_id, actif)
VALUES
(1, 'Résidentielle', 300.00, 'Zone résidentielle - Logements', 1, true),
(2, 'Commerciale', 600.00, 'Zone commerciale - Commerces et bureaux', 1, true),
(3, 'Industrielle', 1000.00, 'Zone industrielle - Usines et entrepôts', 1, true),
(4, 'Mixte', 450.00, 'Zone mixte - Résidentielle et commerciale', 1, true)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 16. PARAMÈTRES TIB
-- Aligné avec l'entité Java ParametreTIB
-- ============================================================
INSERT INTO parametre_tib (
    id,
    frais_administratifs,
    coefficient_tib,
    delai_paiement_jours,
    date_modification
)
VALUES (
    1,
    10.00,
    0.02,
    30,
    CURRENT_TIMESTAMP
)
ON CONFLICT (id) DO NOTHING;
-- ============================================================
-- 17. PRIX DE RÉFÉRENCE
-- ============================================================
INSERT INTO prix_reference (id, annee_fiscale, type_bien, prix_m2, municipalite_id, date_creation)
VALUES
(1, 2022, 'MAISON', 170.00, 1, CURRENT_DATE),
(2, 2022, 'APPARTEMENT', 150.00, 1, CURRENT_DATE),
(3, 2022, 'LOCAL_COMMERCIAL', 210.00, 1, CURRENT_DATE),
(4, 2022, 'TERRAIN', 85.00, 1, CURRENT_DATE),
(5, 2023, 'MAISON', 185.00, 1, CURRENT_DATE),
(6, 2023, 'APPARTEMENT', 165.00, 1, CURRENT_DATE),
(7, 2023, 'LOCAL_COMMERCIAL', 230.00, 1, CURRENT_DATE),
(8, 2023, 'TERRAIN', 95.00, 1, CURRENT_DATE),
(9, 2024, 'MAISON', 200.00, 1, CURRENT_DATE),
(10, 2024, 'APPARTEMENT', 180.00, 1, CURRENT_DATE),
(11, 2024, 'LOCAL_COMMERCIAL', 250.00, 1, CURRENT_DATE),
(12, 2024, 'TERRAIN', 100.00, 1, CURRENT_DATE),
(13, 2025, 'MAISON', 210.00, 1, CURRENT_DATE),
(14, 2025, 'APPARTEMENT', 190.00, 1, CURRENT_DATE),
(15, 2025, 'LOCAL_COMMERCIAL', 270.00, 1, CURRENT_DATE),
(16, 2025, 'TERRAIN', 110.00, 1, CURRENT_DATE),
(17, 2026, 'MAISON', 220.00, 1, CURRENT_DATE),
(18, 2026, 'APPARTEMENT', 200.00, 1, CURRENT_DATE),
(19, 2026, 'LOCAL_COMMERCIAL', 280.00, 1, CURRENT_DATE),
(20, 2026, 'TERRAIN', 120.00, 1, CURRENT_DATE)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 18. RÉINITIALISER LES SÉQUENCES
-- ============================================================
SELECT setval('municipalites_id_seq', COALESCE((SELECT MAX(id) FROM municipalites), 1));
SELECT setval('secteurs_id_seq', COALESCE((SELECT MAX(id) FROM secteurs), 1));
SELECT setval('rues_id_seq', COALESCE((SELECT MAX(id) FROM rues), 1));
SELECT setval('categorie_tib_id_seq', COALESCE((SELECT MAX(id) FROM categorie_tib), 1));
SELECT setval('valeur_venale_id_seq', COALESCE((SELECT MAX(id) FROM valeur_venale), 1));
SELECT setval('prix_reference_id_seq', COALESCE((SELECT MAX(id) FROM prix_reference), 1));
SELECT setval('parametre_tib_id_seq', COALESCE((SELECT MAX(id) FROM parametre_tib), 1));

-- ============================================================
-- 19. VÉRIFICATIONS FINALES
-- ============================================================
SELECT '🏛️ Municipalités' as type, COUNT(*) as total FROM municipalites
UNION ALL
SELECT '📌 Secteurs', COUNT(*) FROM secteurs
UNION ALL
SELECT '🛣️ Rues', COUNT(*) FROM rues
UNION ALL
SELECT '🏷️ Catégories TIB', COUNT(*) FROM categorie_tib
UNION ALL
SELECT '💰 Valeurs vénales', COUNT(*) FROM valeur_venale
UNION ALL
SELECT '📊 Prix de référence', COUNT(*) FROM prix_reference
UNION ALL
SELECT '⚙️ Paramètres TIB', COUNT(*) FROM parametre_tib;

-- ============================================================
-- 20. RÉSUMÉ PAR SECTEUR
-- ============================================================
SELECT
    s.id,
    s.nom as secteur,
    m.nom as municipalite,
    COUNT(r.id) as nb_rues
FROM secteurs s
LEFT JOIN rues r ON r.secteur_id = s.id
LEFT JOIN municipalites m ON m.id = s.municipalite_id
GROUP BY s.id, s.nom, m.nom
ORDER BY s.id;
