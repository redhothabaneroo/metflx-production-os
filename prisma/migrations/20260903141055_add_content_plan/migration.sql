-- CreateTable
CREATE TABLE "concepts" (
    "id" SERIAL NOT NULL,
    "clientCode" TEXT NOT NULL,
    "scopeKey" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "concept" TEXT,
    "focus" TEXT,
    "reference" TEXT,
    "talent" TEXT,
    "notes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "questions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "order" INTEGER NOT NULL DEFAULT 0,
    "wrappedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "concepts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shots" (
    "id" SERIAL NOT NULL,
    "conceptId" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "checked" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "shots_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "concepts_clientCode_scopeKey_code_key" ON "concepts"("clientCode", "scopeKey", "code");

-- AddForeignKey
ALTER TABLE "concepts" ADD CONSTRAINT "concepts_clientCode_fkey" FOREIGN KEY ("clientCode") REFERENCES "clients"("code") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shots" ADD CONSTRAINT "shots_conceptId_fkey" FOREIGN KEY ("conceptId") REFERENCES "concepts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
