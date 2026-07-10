-- CreateTable
CREATE TABLE "custom_tasks" (
    "id" SERIAL NOT NULL,
    "clientCode" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "owner" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Not started',
    "dueDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "custom_tasks_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "custom_tasks" ADD CONSTRAINT "custom_tasks_clientCode_fkey" FOREIGN KEY ("clientCode") REFERENCES "clients"("code") ON DELETE CASCADE ON UPDATE CASCADE;
