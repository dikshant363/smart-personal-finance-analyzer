-- CreateTable
CREATE TABLE "CollaborationInvitation" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "permissions" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CollaborationInvitation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CollaboratorShare" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "collaboratorId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "permissions" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CollaboratorShare_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReviewRequest" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "collaboratorId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "module" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReviewRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CollaborationComment" (
    "id" TEXT NOT NULL,
    "reviewRequestId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CollaborationComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CollaborationAudit" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "details" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CollaborationAudit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CollaborationInvitation_token_key" ON "CollaborationInvitation"("token");

-- CreateIndex
CREATE INDEX "CollaborationInvitation_userId_idx" ON "CollaborationInvitation"("userId");

-- CreateIndex
CREATE INDEX "CollaboratorShare_userId_idx" ON "CollaboratorShare"("userId");

-- CreateIndex
CREATE INDEX "CollaboratorShare_collaboratorId_idx" ON "CollaboratorShare"("collaboratorId");

-- CreateIndex
CREATE INDEX "ReviewRequest_userId_idx" ON "ReviewRequest"("userId");

-- CreateIndex
CREATE INDEX "ReviewRequest_collaboratorId_idx" ON "ReviewRequest"("collaboratorId");

-- CreateIndex
CREATE INDEX "CollaborationComment_reviewRequestId_idx" ON "CollaborationComment"("reviewRequestId");

-- CreateIndex
CREATE INDEX "CollaborationAudit_userId_idx" ON "CollaborationAudit"("userId");

-- AddForeignKey
ALTER TABLE "CollaborationInvitation" ADD CONSTRAINT "CollaborationInvitation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CollaboratorShare" ADD CONSTRAINT "CollaboratorShare_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewRequest" ADD CONSTRAINT "ReviewRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CollaborationComment" ADD CONSTRAINT "CollaborationComment_reviewRequestId_fkey" FOREIGN KEY ("reviewRequestId") REFERENCES "ReviewRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
