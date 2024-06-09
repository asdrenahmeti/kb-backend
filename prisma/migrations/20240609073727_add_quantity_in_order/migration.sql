/*
  Warnings:

  - You are about to drop the `menus` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "menu_orders" DROP CONSTRAINT "menu_orders_menu_id_fkey";

-- DropForeignKey
ALTER TABLE "menus" DROP CONSTRAINT "menus_site_id_fkey";

-- AlterTable
ALTER TABLE "menu_orders" ADD COLUMN     "quantity" INTEGER;

-- DropTable
DROP TABLE "menus";

-- CreateTable
CREATE TABLE "menu_items" (
    "id" TEXT NOT NULL,
    "item_type" "MenuItemType" NOT NULL,
    "name" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "site_id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "menu_items_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "menu_items" ADD CONSTRAINT "menu_items_site_id_fkey" FOREIGN KEY ("site_id") REFERENCES "sites"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "menu_orders" ADD CONSTRAINT "menu_orders_menu_id_fkey" FOREIGN KEY ("menu_id") REFERENCES "menu_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
