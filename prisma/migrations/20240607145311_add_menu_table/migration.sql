-- CreateEnum
CREATE TYPE "MenuType" AS ENUM ('DRINK', 'FOOD');

-- CreateTable
CREATE TABLE "menus" (
    "id" TEXT NOT NULL,
    "type" "MenuType" NOT NULL,
    "name" TEXT NOT NULL,
    "price" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "menus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "menu_orders" (
    "id" TEXT NOT NULL,
    "booking_id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "menu_orders_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "menu_orders" ADD CONSTRAINT "menu_orders_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
