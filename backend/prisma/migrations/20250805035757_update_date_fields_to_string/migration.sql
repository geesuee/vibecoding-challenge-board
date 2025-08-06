-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_certifications" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "challengeId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "certifications_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "challenges" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_certifications" ("challengeId", "createdAt", "date", "id") SELECT "challengeId", "createdAt", "date", "id" FROM "certifications";
DROP TABLE "certifications";
ALTER TABLE "new_certifications" RENAME TO "certifications";
CREATE UNIQUE INDEX "certifications_challengeId_date_key" ON "certifications"("challengeId", "date");
CREATE TABLE "new_challenges" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "startDate" TEXT NOT NULL,
    "endDate" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "image" TEXT,
    "tasks" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_challenges" ("category", "createdAt", "description", "endDate", "id", "image", "name", "startDate", "status", "tasks", "updatedAt") SELECT "category", "createdAt", "description", "endDate", "id", "image", "name", "startDate", "status", "tasks", "updatedAt" FROM "challenges";
DROP TABLE "challenges";
ALTER TABLE "new_challenges" RENAME TO "challenges";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
