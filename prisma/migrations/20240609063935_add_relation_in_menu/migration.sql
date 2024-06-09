/*
  Warnings:

  - You are about to drop the column `type` on the `menus` table. All the data in the column will be lost.
  - Added the required column `item_type` to the `menus` table without a default value. This is not possible if the table is not empty.
  - Added the required column `site_id` to the `menus` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "MenuItemType" AS ENUM ('DRINK', 'FOOD');

-- AlterTable
ALTER TABLE "menus" DROP COLUMN "type",
ADD COLUMN     "item_type" "MenuItemType" NOT NULL,
ADD COLUMN     "site_id" TEXT NOT NULL;

-- DropEnum
DROP TYPE "MenuType";

-- AddForeignKey
ALTER TABLE "menus" ADD CONSTRAINT "menus_site_id_fkey" FOREIGN KEY ("site_id") REFERENCES "sites"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
