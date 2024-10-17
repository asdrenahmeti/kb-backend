-- CreateTable
CREATE TABLE "Song" (
    "id" TEXT NOT NULL,
    "artistName" TEXT NOT NULL,
    "songName" TEXT NOT NULL,
    "duration" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Song_pkey" PRIMARY KEY ("id")
);
