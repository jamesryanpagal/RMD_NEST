ALTER TABLE "UserAudit" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE "UserAudit" ALTER COLUMN "dateUpdated" SET DEFAULT NOW();

ALTER TABLE "ClientAudit" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE "ClientAudit" ALTER COLUMN "dateUpdated" SET DEFAULT NOW();

ALTER TABLE "ClientRequestAudit" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE "ClientRequestAudit" ALTER COLUMN "dateUpdated" SET DEFAULT NOW();

ALTER TABLE "ProjectAudit" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE "ProjectAudit" ALTER COLUMN "dateUpdated" SET DEFAULT NOW();
ALTER TABLE "ProjectAudit" ALTER COLUMN "order" SET DEFAULT nextval('"Project_order_seq"'::regclass);

ALTER TABLE "PhaseAudit" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE "PhaseAudit" ALTER COLUMN "dateUpdated" SET DEFAULT NOW();

ALTER TABLE "BlockAudit" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE "BlockAudit" ALTER COLUMN "dateUpdated" SET DEFAULT NOW();

ALTER TABLE "LotAudit" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE "LotAudit" ALTER COLUMN "dateUpdated" SET DEFAULT NOW();

ALTER TABLE "PaymentAudit" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE "PaymentAudit" ALTER COLUMN "dateUpdated" SET DEFAULT NOW();

ALTER TABLE "PaymentRequestAudit" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE "PaymentRequestAudit" ALTER COLUMN "dateUpdated" SET DEFAULT NOW();

ALTER TABLE "ReservationAudit" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE "ReservationAudit" ALTER COLUMN "dateUpdated" SET DEFAULT NOW();

ALTER TABLE "ReservationRequestAudit" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE "ReservationRequestAudit" ALTER COLUMN "dateUpdated" SET DEFAULT NOW();

ALTER TABLE "AgentAudit" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE "AgentAudit" ALTER COLUMN "dateUpdated" SET DEFAULT NOW();

ALTER TABLE "AgentCommissionAudit" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE "AgentCommissionAudit" ALTER COLUMN "dateUpdated" SET DEFAULT NOW();

ALTER TABLE "AgentCommissionRequestAudit" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE "AgentCommissionRequestAudit" ALTER COLUMN "dateUpdated" SET DEFAULT NOW();

ALTER TABLE "FileAudit" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE "FileAudit" ALTER COLUMN "dateUpdated" SET DEFAULT NOW();

ALTER TABLE "FileRequestAudit" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE "FileRequestAudit" ALTER COLUMN "dateUpdated" SET DEFAULT NOW();

ALTER TABLE "ContractAudit" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE "ContractAudit" ALTER COLUMN "dateUpdated" SET DEFAULT NOW();

ALTER TABLE "ContractRequestAudit" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE "ContractRequestAudit" ALTER COLUMN "dateUpdated" SET DEFAULT NOW();