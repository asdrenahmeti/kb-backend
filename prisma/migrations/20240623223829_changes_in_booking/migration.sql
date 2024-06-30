-- DropForeignKey
ALTER TABLE "bookings" DROP CONSTRAINT "bookings_roomId_fkey";

-- AlterTable
ALTER TABLE "bookings" ALTER COLUMN "roomId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "rooms"("id") ON DELETE SET NULL ON UPDATE CASCADE;
