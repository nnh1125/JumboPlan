-- CreateEnum
CREATE TYPE "course_status" AS ENUM ('COMPLETED', 'IN_PROGRESS', 'PLANNED');

-- CreateEnum
CREATE TYPE "PrereqNodeType" AS ENUM ('AND', 'OR', 'MIN_K', 'COURSE', 'CONDITION');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "auth_id" TEXT NOT NULL,
    "email" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "programs" (
    "id" TEXT NOT NULL,
    "school" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "catalog_year" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "programs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_profiles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "program_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "courses" (
    "id" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "title" TEXT,
    "credits" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "courses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_course_statuses" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "course_id" TEXT NOT NULL,
    "status" "course_status" NOT NULL,
    "term" TEXT,
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_course_statuses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "requirement_groups" (
    "id" TEXT NOT NULL,
    "program_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "min_count" INTEGER,
    "min_credits" INTEGER,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "requirement_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "requirement_courses" (
    "id" TEXT NOT NULL,
    "requirement_group_id" TEXT NOT NULL,
    "course_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "requirement_courses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prereq_expressions" (
    "id" TEXT NOT NULL,
    "course_id" TEXT NOT NULL,
    "raw_text" TEXT,
    "root_node_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "prereq_expressions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prereq_nodes" (
    "id" TEXT NOT NULL,
    "expression_id" TEXT NOT NULL,
    "parent_node_id" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "node_type" "PrereqNodeType" NOT NULL,
    "k_value" INTEGER,
    "course_id" TEXT,
    "condition_text" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "prereq_nodes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_auth_id_key" ON "users"("auth_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_profiles_user_id_key" ON "user_profiles"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "courses_subject_number_key" ON "courses"("subject", "number");

-- CreateIndex
CREATE INDEX "user_course_statuses_user_id_status_idx" ON "user_course_statuses"("user_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "user_course_statuses_user_id_course_id_key" ON "user_course_statuses"("user_id", "course_id");

-- CreateIndex
CREATE UNIQUE INDEX "requirement_courses_requirement_group_id_course_id_key" ON "requirement_courses"("requirement_group_id", "course_id");

-- CreateIndex
CREATE UNIQUE INDEX "prereq_expressions_course_id_key" ON "prereq_expressions"("course_id");

-- CreateIndex
CREATE UNIQUE INDEX "prereq_expressions_root_node_id_key" ON "prereq_expressions"("root_node_id");

-- CreateIndex
CREATE INDEX "prereq_nodes_expression_id_idx" ON "prereq_nodes"("expression_id");

-- CreateIndex
CREATE INDEX "prereq_nodes_parent_node_id_idx" ON "prereq_nodes"("parent_node_id");

-- CreateIndex
CREATE INDEX "prereq_nodes_expression_id_parent_node_id_idx" ON "prereq_nodes"("expression_id", "parent_node_id");

-- AddForeignKey
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "programs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_course_statuses" ADD CONSTRAINT "user_course_statuses_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_course_statuses" ADD CONSTRAINT "user_course_statuses_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requirement_groups" ADD CONSTRAINT "requirement_groups_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "programs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requirement_courses" ADD CONSTRAINT "requirement_courses_requirement_group_id_fkey" FOREIGN KEY ("requirement_group_id") REFERENCES "requirement_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requirement_courses" ADD CONSTRAINT "requirement_courses_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prereq_expressions" ADD CONSTRAINT "prereq_expressions_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prereq_expressions" ADD CONSTRAINT "prereq_expressions_root_node_id_fkey" FOREIGN KEY ("root_node_id") REFERENCES "prereq_nodes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prereq_nodes" ADD CONSTRAINT "prereq_nodes_expression_id_fkey" FOREIGN KEY ("expression_id") REFERENCES "prereq_expressions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prereq_nodes" ADD CONSTRAINT "prereq_nodes_parent_node_id_fkey" FOREIGN KEY ("parent_node_id") REFERENCES "prereq_nodes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prereq_nodes" ADD CONSTRAINT "prereq_nodes_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE SET NULL ON UPDATE CASCADE;
