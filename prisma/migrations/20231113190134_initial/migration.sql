BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[Protocol] (
    [protocolId] INT NOT NULL,
    [protocolStatus] NVARCHAR(1000),
    [protocolNo] NVARCHAR(1000),
    [library] NVARCHAR(1000),
    [department] NVARCHAR(1000),
    [organizationalUnit] NVARCHAR(1000),
    [protocolType] NVARCHAR(1000),
    [nctNo] NVARCHAR(1000),
    [title] NVARCHAR(1000),
    [shortTitle] NVARCHAR(1000),
    [institution] NVARCHAR(1000),
    [poc] NVARCHAR(1000),
    [poc_role] NVARCHAR(1000),
    [poc_email] NVARCHAR(1000),
    [poc_homeOrganization] NVARCHAR(1000),
    [BriefTitle] NVARCHAR(1000),
    [OfficialTitle] NVARCHAR(1000),
    [MinimumAge] NVARCHAR(1000),
    [MaximumAge] NVARCHAR(1000),
    [StartDate] DATETIME2,
    [CompletionDate] DATETIME2,
    [BriefSummary] VARCHAR(4000),
    [EligibilityCriteria] VARCHAR(4000),
    [LeadSponsorName] NVARCHAR(1000),
    [Phase] NVARCHAR(1000),
    [StudyType] NVARCHAR(1000),
    [EnrollmentCount] INT,
    [LastUpdateSubmitDate] DATETIME2,
    [dbcreateddata] DATETIME2 NOT NULL CONSTRAINT [Protocol_dbcreateddata_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [Protocol_pkey] PRIMARY KEY CLUSTERED ([protocolId])
);

-- CreateTable
CREATE TABLE [dbo].[TrialLocations] (
    [id] INT NOT NULL IDENTITY(1,1),
    [nctNo] NVARCHAR(1000) NOT NULL,
    [LocationFacility] NVARCHAR(1000),
    [LocationStatus] NVARCHAR(1000),
    [LocationCity] NVARCHAR(1000),
    [LocationState] NVARCHAR(1000),
    [LocationZip] NVARCHAR(1000),
    [LocationCountry] NVARCHAR(1000),
    [dbcreateddata] DATETIME2 NOT NULL CONSTRAINT [TrialLocations_dbcreateddata_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [TrialLocations_pkey] PRIMARY KEY CLUSTERED ([id])
);

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
