-- CreateTable
CREATE TABLE "Settings" (
    "id" TEXT NOT NULL DEFAULT 'SETTINGS-001',
    "businessName" TEXT NOT NULL,
    "businessContactEmail" TEXT,
    "businessContactPhone" TEXT,
    "currency" TEXT NOT NULL DEFAULT 'NPR',
    "assignmentStrategy" TEXT NOT NULL DEFAULT 'LowestOccupancy',
    "pinRotationPolicy" TEXT NOT NULL DEFAULT 'Manual',
    "preferences" JSONB,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CredentialTemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "templateText" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CredentialTemplate_pkey" PRIMARY KEY ("id")
);
