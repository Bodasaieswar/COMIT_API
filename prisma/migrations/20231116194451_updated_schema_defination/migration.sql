/*
  Warnings:

  - You are about to alter the column `MinimumAge` on the `Protocol` table. The data in that column could be lost. The data in that column will be cast from `NVarChar(1000)` to `Int`.
  - You are about to alter the column `MaximumAge` on the `Protocol` table. The data in that column could be lost. The data in that column will be cast from `NVarChar(1000)` to `Int`.
  - You are about to alter the column `protocolTargetAccrual` on the `Protocol` table. The data in that column could be lost. The data in that column will be cast from `NVarChar(1000)` to `Int`.
  - You are about to alter the column `rcLowerAccrualGoal` on the `Protocol` table. The data in that column could be lost. The data in that column will be cast from `NVarChar(1000)` to `Int`.
  - You are about to alter the column `rcUpperAccrualGoal` on the `Protocol` table. The data in that column could be lost. The data in that column will be cast from `NVarChar(1000)` to `Int`.
  - Made the column `primaryCompletionDate` on table `Protocol` required. This step will fail if there are existing NULL values in that column.

*/
BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[Protocol] ALTER COLUMN [MinimumAge] INT NULL;
ALTER TABLE [dbo].[Protocol] ALTER COLUMN [MaximumAge] INT NULL;
ALTER TABLE [dbo].[Protocol] ALTER COLUMN [primaryCompletionDate] DATETIME2 NOT NULL;
ALTER TABLE [dbo].[Protocol] ALTER COLUMN [protocolTargetAccrual] INT NULL;
ALTER TABLE [dbo].[Protocol] ALTER COLUMN [rcLowerAccrualGoal] INT NULL;
ALTER TABLE [dbo].[Protocol] ALTER COLUMN [rcUpperAccrualGoal] INT NULL;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
