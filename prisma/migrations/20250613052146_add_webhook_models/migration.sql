-- CreateTable
CREATE TABLE "WebhookSettings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "url" TEXT,
    "secret" TEXT,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "subscriptions" TEXT[] DEFAULT ARRAY['payment.completed', 'payment.failed']::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WebhookSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WebhookDelivery" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "paymentId" TEXT,
    "status" TEXT NOT NULL,
    "statusCode" INTEGER,
    "error" TEXT,
    "attempts" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WebhookDelivery_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WebhookSettings_userId_key" ON "WebhookSettings"("userId");

-- CreateIndex
CREATE INDEX "WebhookDelivery_userId_idx" ON "WebhookDelivery"("userId");

-- CreateIndex
CREATE INDEX "WebhookDelivery_paymentId_idx" ON "WebhookDelivery"("paymentId");

-- AddForeignKey
ALTER TABLE "WebhookSettings" ADD CONSTRAINT "WebhookSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WebhookDelivery" ADD CONSTRAINT "WebhookDelivery_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WebhookDelivery" ADD CONSTRAINT "WebhookDelivery_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
