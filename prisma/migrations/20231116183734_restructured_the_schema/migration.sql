BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[Protocol] ADD [KeywordList] NVARCHAR(1000),
[age] NVARCHAR(1000),
[objectives] NVARCHAR(max),
[primaryCompletionDate] NVARCHAR(1000),
[primaryCompletionDateType] NVARCHAR(1000),
[protocolTargetAccrual] NVARCHAR(1000),
[rcLowerAccrualGoal] NVARCHAR(1000),
[rcUpperAccrualGoal] NVARCHAR(1000),
[registrationCenter] NVARCHAR(1000),
[scope] NVARCHAR(1000);

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
