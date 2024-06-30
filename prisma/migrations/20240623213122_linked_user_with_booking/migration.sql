/*
  Warnings:

  - You are about to drop the column `user` on the `bookings` table. All the data in the column will be lost.
  - You are about to drop the column `dateOfBirth` on the `profiles` table. All the data in the column will be lost.
  - You are about to drop the column `phoneNumber` on the `profiles` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `profiles` table. All the data in the column will be lost.
  - You are about to drop the column `zipCode` on the `profiles` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[user_id]` on the table `profiles` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userId` to the `bookings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `date_of_birth` to the `profiles` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `profiles` table without a default value. This is not possible if the table is not empty.
  - Added the required column `zip_code` to the `profiles` table without a default value. This is not possible if the table is not empty.
  - Made the column `firstName` on table `users` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterEnum
ALTER TYPE "UserRole" ADD VALUE 'GUEST';

-- DropForeignKey
ALTER TABLE "profiles" DROP CONSTRAINT "profiles_userId_fkey";

-- DropIndex
DROP INDEX "profiles_userId_key";

-- AlterTable
ALTER TABLE "bookings" DROP COLUMN "user",
ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "profiles" DROP COLUMN "dateOfBirth",
DROP COLUMN "phoneNumber",
DROP COLUMN "userId",
DROP COLUMN "zipCode",
ADD COLUMN     "date_of_birth" DATE NOT NULL,
ADD COLUMN     "user_id" TEXT NOT NULL,
ADD COLUMN     "zip_code" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "phone_number" TEXT,
ALTER COLUMN "firstName" SET NOT NULL,
ALTER COLUMN "password" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "profiles_user_id_key" ON "profiles"("user_id");

-- AddForeignKey
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
