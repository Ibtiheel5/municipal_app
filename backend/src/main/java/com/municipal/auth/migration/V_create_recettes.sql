-- V_create_recettes.sql
-- Table centrale du Dashboard Recettes. Alimentée uniquement par les services
-- TIB / TNB du Dashboard Municipalité (jamais de création directe côté front Recettes).
-- Adapter le nom des tables/colonnes référencées (proprietaires, rues) si elles
-- diffèrent dans votre schéma réel — vérifier avec \d proprietaires / \d rues avant d'exécuter.

CREATE TABLE IF NOT EXISTS recettes (
    id                BIGSERIAL PRIMARY KEY,
    code_recette      VARCHAR(30)  NOT NULL UNIQUE,
    type              VARCHAR(10)  NOT NULL CHECK (type IN ('TIB', 'TNB')),
    reference_taxe_id BIGINT       NOT NULL,
    numero_avis       VARCHAR(40),

    proprietaire_id   BIGINT       NOT NULL REFERENCES proprietaires(id),
    rue_id            BIGINT       NOT NULL REFERENCES rues(id),
    municipalite_id   BIGINT       NOT NULL,

    annee_fiscale     INTEGER      NOT NULL,
    montant           DOUBLE PRECISION NOT NULL,

    date_creation     DATE         NOT NULL DEFAULT CURRENT_DATE,
    date_generation   DATE         NOT NULL,
    date_limite       DATE,

    statut            VARCHAR(15)  NOT NULL DEFAULT 'EN_ATTENTE',
    date_paiement      TIMESTAMP,
    mode_paiement      VARCHAR(20),

    -- Une seule recette par avis d'origine : évite les doublons si
    -- creerRecette() est appelé deux fois pour le même avis.
    CONSTRAINT uq_recette_reference UNIQUE (reference_taxe_id, type)
);

CREATE INDEX IF NOT EXISTS idx_recette_type         ON recettes(type);
CREATE INDEX IF NOT EXISTS idx_recette_statut        ON recettes(statut);
CREATE INDEX IF NOT EXISTS idx_recette_annee         ON recettes(annee_fiscale);
CREATE INDEX IF NOT EXISTS idx_recette_municipalite  ON recettes(municipalite_id);
