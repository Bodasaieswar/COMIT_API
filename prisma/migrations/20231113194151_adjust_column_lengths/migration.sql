/*
  Warnings:

  - You are about to alter the column `BriefSummary` on the `Protocol` table. The data in that column could be lost. The data in that column will be cast from `VarChar(8000)` to `NVarChar(1000)`.
  - You are about to alter the column `EligibilityCriteria` on the `Protocol` table. The data in that column could be lost. The data in that column will be cast from `VarChar(8000)` to `NVarChar(1000)`.

*/
BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[Protocol] ALTER COLUMN [BriefSummary] NVARCHAR(1000) NULL;
ALTER TABLE [dbo].[Protocol] ALTER COLUMN [EligibilityCriteria] NVARCHAR(1000) NULL;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
