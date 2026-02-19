-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "vector";

-- CreateTable
CREATE TABLE "accused" (
    "accused_id" VARCHAR(50) NOT NULL,
    "crime_id" VARCHAR(50) NOT NULL,
    "person_id" VARCHAR(50) NOT NULL,
    "accused_code" VARCHAR(20) NOT NULL,
    "type" VARCHAR(50) DEFAULT 'Accused',
    "seq_num" VARCHAR(50),
    "is_ccl" BOOLEAN DEFAULT false,
    "beard" VARCHAR(100),
    "build" VARCHAR(100),
    "color" VARCHAR(100),
    "ear" VARCHAR(100),
    "eyes" VARCHAR(100),
    "face" VARCHAR(100),
    "hair" VARCHAR(100),
    "height" VARCHAR(100),
    "leucoderma" VARCHAR(100),
    "mole" VARCHAR(100),
    "mustache" VARCHAR(100),
    "nose" VARCHAR(100),
    "teeth" VARCHAR(100),
    "physical_features_embedding" vector(768),
    "date_created" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "date_modified" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "accused_pkey" PRIMARY KEY ("accused_id")
);

-- CreateTable
CREATE TABLE "crimes" (
    "crime_id" VARCHAR(50) NOT NULL,
    "ps_code" VARCHAR(20) NOT NULL,
    "fir_num" VARCHAR(50) NOT NULL,
    "fir_reg_num" VARCHAR(50) NOT NULL,
    "fir_type" VARCHAR(50),
    "acts_sections" TEXT,
    "fir_date" TIMESTAMP(6),
    "case_status" VARCHAR(100),
    "major_head" VARCHAR(100),
    "minor_head" VARCHAR(255),
    "crime_type" VARCHAR(100),
    "io_name" VARCHAR(255),
    "io_rank" VARCHAR(100),
    "brief_facts" TEXT,
    "brief_facts_embedding" vector(768),
    "crime_pattern_embedding" vector(768),
    "date_created" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "date_modified" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "crimes_pkey" PRIMARY KEY ("crime_id")
);

-- CreateTable
CREATE TABLE "hierarchy" (
    "ps_code" VARCHAR(20) NOT NULL,
    "ps_name" VARCHAR(255) NOT NULL,
    "circle_code" VARCHAR(20),
    "circle_name" VARCHAR(255),
    "sdpo_code" VARCHAR(20),
    "sdpo_name" VARCHAR(255),
    "sub_zone_code" VARCHAR(20),
    "sub_zone_name" VARCHAR(255),
    "dist_code" VARCHAR(20),
    "dist_name" VARCHAR(255),
    "range_code" VARCHAR(20),
    "range_name" VARCHAR(255),
    "zone_code" VARCHAR(20),
    "zone_name" VARCHAR(255),
    "adg_code" VARCHAR(20),
    "adg_name" VARCHAR(255),
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "hierarchy_pkey" PRIMARY KEY ("ps_code")
);

-- CreateTable
CREATE TABLE "persons" (
    "person_id" VARCHAR(50) NOT NULL,
    "name" VARCHAR(255),
    "surname" VARCHAR(255),
    "alias" VARCHAR(255),
    "full_name" VARCHAR(500),
    "relation_type" VARCHAR(50),
    "relative_name" VARCHAR(255),
    "gender" VARCHAR(20),
    "is_died" BOOLEAN DEFAULT false,
    "date_of_birth" DATE,
    "age" INTEGER,
    "occupation" VARCHAR(255),
    "education_qualification" VARCHAR(255),
    "caste" VARCHAR(255),
    "sub_caste" VARCHAR(255),
    "religion" VARCHAR(255),
    "nationality" VARCHAR(255),
    "designation" VARCHAR(255),
    "place_of_work" VARCHAR(500),
    "present_house_no" VARCHAR(255),
    "present_street_road_no" VARCHAR(255),
    "present_ward_colony" VARCHAR(255),
    "present_landmark_milestone" VARCHAR(255),
    "present_locality_village" VARCHAR(255),
    "present_area_mandal" VARCHAR(255),
    "present_district" VARCHAR(255),
    "present_state_ut" VARCHAR(255),
    "present_country" VARCHAR(255),
    "present_residency_type" VARCHAR(255),
    "present_pin_code" VARCHAR(20),
    "present_jurisdiction_ps" VARCHAR(20),
    "permanent_house_no" VARCHAR(255),
    "permanent_street_road_no" VARCHAR(255),
    "permanent_ward_colony" VARCHAR(255),
    "permanent_landmark_milestone" VARCHAR(255),
    "permanent_locality_village" VARCHAR(255),
    "permanent_area_mandal" VARCHAR(255),
    "permanent_district" VARCHAR(255),
    "permanent_state_ut" VARCHAR(255),
    "permanent_country" VARCHAR(255),
    "permanent_residency_type" VARCHAR(255),
    "permanent_pin_code" VARCHAR(20),
    "permanent_jurisdiction_ps" VARCHAR(20),
    "phone_number" VARCHAR(20),
    "country_code" VARCHAR(10),
    "email_id" VARCHAR(255),
    "name_embedding" vector(768),
    "profile_embedding" vector(768),
    "date_created" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "date_modified" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "persons_pkey" PRIMARY KEY ("person_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "accused_seq_num_key" ON "accused"("seq_num");

-- CreateIndex
CREATE INDEX "idx_accused_code" ON "accused"("accused_code");

-- CreateIndex
CREATE INDEX "idx_accused_crime" ON "accused"("crime_id");

-- CreateIndex
CREATE INDEX "idx_accused_person" ON "accused"("person_id");

-- CreateIndex
CREATE INDEX "idx_accused_physical_embedding" ON "accused"("physical_features_embedding");

-- CreateIndex
CREATE UNIQUE INDEX "unique_accused_per_crime" ON "accused"("crime_id", "accused_code");

-- CreateIndex
CREATE UNIQUE INDEX "crimes_fir_reg_num_key" ON "crimes"("fir_reg_num");

-- CreateIndex
CREATE INDEX "idx_crimes_brief_facts_embedding" ON "crimes"("brief_facts_embedding");

-- CreateIndex
CREATE INDEX "idx_crimes_case_status" ON "crimes"("case_status");

-- CreateIndex
CREATE INDEX "idx_crimes_crime_type" ON "crimes"("crime_type");

-- CreateIndex
CREATE INDEX "idx_crimes_fir_date" ON "crimes"("fir_date");

-- CreateIndex
CREATE INDEX "idx_crimes_fir_num" ON "crimes"("fir_num");

-- CreateIndex
CREATE INDEX "idx_crimes_fir_reg_num" ON "crimes"("fir_reg_num");

-- CreateIndex
CREATE INDEX "idx_crimes_pattern_embedding" ON "crimes"("crime_pattern_embedding");

-- CreateIndex
CREATE INDEX "idx_crimes_ps_code" ON "crimes"("ps_code");

-- CreateIndex
CREATE INDEX "idx_hierarchy_dist_code" ON "hierarchy"("dist_code");

-- CreateIndex
CREATE INDEX "idx_hierarchy_ps_name" ON "hierarchy"("ps_name");

-- CreateIndex
CREATE INDEX "idx_hierarchy_range_code" ON "hierarchy"("range_code");

-- CreateIndex
CREATE INDEX "idx_hierarchy_zone_code" ON "hierarchy"("zone_code");

-- CreateIndex
CREATE INDEX "idx_persons_full_name" ON "persons"("full_name");

-- CreateIndex
CREATE INDEX "idx_persons_name" ON "persons"("name");

-- CreateIndex
CREATE INDEX "idx_persons_name_embedding" ON "persons"("name_embedding");

-- CreateIndex
CREATE INDEX "idx_persons_phone" ON "persons"("phone_number");

-- CreateIndex
CREATE INDEX "idx_persons_present_district" ON "persons"("present_district");

-- CreateIndex
CREATE INDEX "idx_persons_present_state" ON "persons"("present_state_ut");

-- CreateIndex
CREATE INDEX "idx_persons_profile_embedding" ON "persons"("profile_embedding");

-- AddForeignKey
ALTER TABLE
    "accused"
ADD
    CONSTRAINT "accused_crime_id_fkey" FOREIGN KEY ("crime_id") REFERENCES "crimes"("crime_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
    "accused"
ADD
    CONSTRAINT "accused_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "persons"("person_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
    "crimes"
ADD
    CONSTRAINT "crimes_ps_code_fkey" FOREIGN KEY ("ps_code") REFERENCES "hierarchy"("ps_code") ON DELETE RESTRICT ON UPDATE CASCADE;