-- CreateTable
CREATE TABLE "ResultatHackathon" (
    "id" TEXT NOT NULL,
    "hackathonId" TEXT NOT NULL,
    "premierPlace" TEXT,
    "deuxiemePlace" TEXT,
    "troisiemePlace" TEXT,
    "preselectionnes" JSONB,
    "podiumPublie" BOOLEAN NOT NULL DEFAULT false,
    "preselectionsPubliees" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ResultatHackathon_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ResultatHackathon_hackathonId_key" ON "ResultatHackathon"("hackathonId");

-- CreateIndex
CREATE INDEX "ResultatHackathon_hackathonId_idx" ON "ResultatHackathon"("hackathonId");

-- CreateIndex
CREATE INDEX "ResultatHackathon_podiumPublie_idx" ON "ResultatHackathon"("podiumPublie");

-- CreateIndex
CREATE INDEX "ResultatHackathon_preselectionsPubliees_idx" ON "ResultatHackathon"("preselectionsPubliees");

-- AddForeignKey
ALTER TABLE "ResultatHackathon" ADD CONSTRAINT "ResultatHackathon_hackathonId_fkey" FOREIGN KEY ("hackathonId") REFERENCES "Hackathon"("id") ON DELETE CASCADE ON UPDATE CASCADE;
