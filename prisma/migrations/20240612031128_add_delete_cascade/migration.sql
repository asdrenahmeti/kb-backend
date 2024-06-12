-- DropForeignKey
ALTER TABLE "menu_orders" DROP CONSTRAINT "menu_orders_booking_id_fkey";

-- DropForeignKey
ALTER TABLE "opening_hours" DROP CONSTRAINT "opening_hours_roomId_fkey";

-- AddForeignKey
ALTER TABLE "opening_hours" ADD CONSTRAINT "opening_hours_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "menu_orders" ADD CONSTRAINT "menu_orders_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
