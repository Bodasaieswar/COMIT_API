BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[Protocol] ALTER COLUMN [BriefSummary] VARCHAR(5000) NULL;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
