-- CreateEnum
CREATE TYPE "ClientType" AS ENUM ('RETAINER', 'PROMO');

-- CreateTable
CREATE TABLE "clients" (
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "ClientType" NOT NULL,
    "owner" TEXT NOT NULL,
    "editor" TEXT,
    "stage" TEXT NOT NULL DEFAULT 'Onboarding',
    "note" TEXT,
    "contact" TEXT,
    "email" TEXT,
    "plan" TEXT,
    "contractStart" TIMESTAMP(3),
    "contractEnd" TIMESTAMP(3),
    "videosPerMonth" INTEGER,
    "currentMonth" INTEGER,
    "totalMonths" INTEGER NOT NULL DEFAULT 6,
    "shootDate" TIMESTAMP(3),
    "rawFolderLink" TEXT,
    "frameIoLink" TEXT,
    "finalDeliveryLink" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "clients_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "videos" (
    "id" SERIAL NOT NULL,
    "clientCode" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "title" TEXT,
    "stage" TEXT NOT NULL,
    "month" INTEGER,
    "num" INTEGER,
    "ir" INTEGER NOT NULL DEFAULT 0,
    "cr" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "videos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tasks" (
    "id" SERIAL NOT NULL,
    "clientCode" TEXT NOT NULL,
    "scopeKey" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "owner" TEXT,

    CONSTRAINT "tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shoot_dates" (
    "id" SERIAL NOT NULL,
    "clientCode" TEXT NOT NULL,
    "scopeKey" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shoot_dates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "videos_code_key" ON "videos"("code");

-- CreateIndex
CREATE UNIQUE INDEX "tasks_clientCode_scopeKey_taskId_key" ON "tasks"("clientCode", "scopeKey", "taskId");

-- CreateIndex
CREATE UNIQUE INDEX "shoot_dates_clientCode_scopeKey_key" ON "shoot_dates"("clientCode", "scopeKey");

-- AddForeignKey
ALTER TABLE "videos" ADD CONSTRAINT "videos_clientCode_fkey" FOREIGN KEY ("clientCode") REFERENCES "clients"("code") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_clientCode_fkey" FOREIGN KEY ("clientCode") REFERENCES "clients"("code") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shoot_dates" ADD CONSTRAINT "shoot_dates_clientCode_fkey" FOREIGN KEY ("clientCode") REFERENCES "clients"("code") ON DELETE CASCADE ON UPDATE CASCADE;
