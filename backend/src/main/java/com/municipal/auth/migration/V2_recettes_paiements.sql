-- V2_recettes_paiements.sql
-- Étend le schéma v1 (recettes) pour supporter le relevé de compte annuel
-- et les paiements partiels. À exécuter APRÈS V_create_recettes.sql.
--
-- Si vous n'avez pas encore exécuté V_create_recettes.sql (v1), inutile de
-- l'exécuter séparément : les CREATE TABLE IF NOT EXISTS ci-dessous créent
-- directement le schéma v2 complet.

-- ── Table recettes : nouvelles colonnes ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS recettes (
    id                    BIGSERIAL PRIMARY KEY,
    code_recette          VARCHAR(30)  NOT NULL UNIQUE,
    type                  VARCHAR(10)  NOT NULL CHECK (type IN ('TIB', 'TNB')),
    reference_taxe_id     BIGINT,
    numero_avis           VARCHAR(40),

    proprietaire_id       BIGINT       NOT NULL REFERENCES proprietaires(id),
    rue_id                BIGINT       NOT NULL REFERENCES rues(id),
    bien_id               BIGINT       NOT NULL REFERENCES biens_immobiliers(id),
    municipalite_id       BIGINT       NOT NULL,

    date_debut_imposition DATE,
    annee_fiscale         INTEGER      NOT NULL,
    montant                DOUBLE PRECISION NOT NULL,
    montant_paye           DOUBLE PRECISION NOT NULL DEFAULT 0,

    date_creation         DATE         NOT NULL DEFAULT CURRENT_DATE,
    date_generation       DATE         NOT NULL,
    date_limite           DATE,

    statut                VARCHAR(15)  NOT NULL DEFAULT 'EN_ATTENTE',

    -- Clé canonique : un bien n'a qu'une seule recette par (type, année).
    CONSTRAINT uq_recette_bien_annee UNIQUE (bien_id, type, annee_fiscale)
);

-- Si la table recettes existe déjà depuis la v1, appliquez plutôt ces ALTER :
--
-- ALTER TABLE recettes ADD COLUMN IF NOT EXISTS bien_id BIGINT REFERENCES biens_immobiliers(id);
-- ALTER TABLE recettes ADD COLUMN IF NOT EXISTS date_debut_imposition DATE;
-- ALTER TABLE recettes ADD COLUMN IF NOT EXISTS montant_paye DOUBLE PRECISION NOT NULL DEFAULT 0;
-- ALTER TABLE recettes ALTER COLUMN reference_taxe_id DROP NOT NULL;
-- ALTER TABLE recettes DROP CONSTRAINT IF EXISTS uq_recette_reference;
-- -- ⚠️ bien_id doit être renseigné pour toutes les lignes existantes avant :
-- ALTER TABLE recettes ALTER COLUMN bien_id SET NOT NULL;
-- ALTER TABLE recettes ADD CONSTRAINT uq_recette_bien_annee UNIQUE (bien_id, type, annee_fiscale);
-- -- Les anciennes valeurs de "statut" (EN_ATTENTE/PAYE/EN_RETARD) restent valides,
-- -- PARTIEL est juste une nouvelle valeur possible, aucune migration de données requise.

CREATE INDEX IF NOT EXISTS idx_recette_type         ON recettes(type);
CREATE INDEX IF NOT EXISTS idx_recette_statut        ON recettes(statut);
CREATE INDEX IF NOT EXISTS idx_recette_annee         ON recettes(annee_fiscale);
CREATE INDEX IF NOT EXISTS idx_recette_municipalite  ON recettes(municipalite_id);
CREATE INDEX IF NOT EXISTS idx_recette_bien          ON recettes(bien_id);

-- ── Table paiements (nouvelle) ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS paiements (
    id                BIGSERIAL PRIMARY KEY,
    recette_id        BIGINT NOT NULL REFERENCES recettes(id),
    montant           DOUBLE PRECISION NOT NULL,
    date_paiement     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    mode_paiement     VARCHAR(20) NOT NULL,
    numero_quittance  VARCHAR(30) NOT NULL UNIQUE,
    agent_nom         VARCHAR(150)
);

CREATE INDEX IF NOT EXISTS idx_paiement_recette ON paiements(recette_id);

-- ⚠️ Adaptez "biens_immobiliers" et "proprietaires" au nom réel de vos tables
-- (vérifiez avec \d dans psql/pgAdmin avant d'exécuter — vous avez déjà eu ce
-- type de désynchronisation entité/schéma par le passé).
