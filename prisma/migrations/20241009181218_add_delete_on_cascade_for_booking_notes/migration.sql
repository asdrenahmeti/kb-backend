-- DropForeignKey
ALTER TABLE "booking_notes" DROP CONSTRAINT "booking_notes_bookingId_fkey";

-- AddForeignKey
ALTER TABLE "booking_notes" ADD CONSTRAINT "booking_notes_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
