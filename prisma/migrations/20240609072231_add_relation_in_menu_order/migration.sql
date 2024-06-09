/*
  Warnings:

  - Added the required column `menu_id` to the `menu_orders` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "menu_orders" ADD COLUMN     "menu_id" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "menu_orders" ADD CONSTRAINT "menu_orders_menu_id_fkey" FOREIGN KEY ("menu_id") REFERENCES "menus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
