-- CreateTable
CREATE TABLE "Users" (
    "UserID" VARCHAR(20) NOT NULL,
    "FullName" VARCHAR(100) NOT NULL,
    "Email" VARCHAR(255) NOT NULL,
    "PasswordHash" TEXT NOT NULL,
    "Role" VARCHAR(20) NOT NULL,
    "Status" VARCHAR(20) NOT NULL DEFAULT 'Active',
    "CreatedAt" TIMESTAMP(3) NOT NULL,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Users_pkey" PRIMARY KEY ("UserID")
);

-- CreateTable
CREATE TABLE "Customers" (
    "CustomerID" VARCHAR(20) NOT NULL,
    "FullName" VARCHAR(100) NOT NULL,
    "Phone" VARCHAR(20) NOT NULL,
    "Username" VARCHAR(100),
    "Platform" VARCHAR(30) NOT NULL,
    "Notes" TEXT,
    "Status" VARCHAR(20) NOT NULL DEFAULT 'Active',
    "CreatedAt" TIMESTAMP(3) NOT NULL,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Customers_pkey" PRIMARY KEY ("CustomerID")
);

-- CreateTable
CREATE TABLE "Products" (
    "ProductID" VARCHAR(20) NOT NULL,
    "ProductCode" VARCHAR(20),
    "ProductName" VARCHAR(100) NOT NULL,
    "ServiceTypeID" VARCHAR(20) NOT NULL,
    "Price" DECIMAL(10,2) NOT NULL,
    "DurationDays" INTEGER NOT NULL,
    "Status" VARCHAR(20) NOT NULL DEFAULT 'Active',
    "CreatedAt" TIMESTAMP(3) NOT NULL,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Products_pkey" PRIMARY KEY ("ProductID")
);

-- CreateTable
CREATE TABLE "MasterAccounts" (
    "MasterAccountID" VARCHAR(20) NOT NULL,
    "Email" VARCHAR(255) NOT NULL,
    "EncryptedPassword" TEXT NOT NULL,
    "Nickname" VARCHAR(100),
    "Status" VARCHAR(20) NOT NULL DEFAULT 'Active',
    "Notes" TEXT,
    "CreatedAt" TIMESTAMP(3) NOT NULL,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MasterAccounts_pkey" PRIMARY KEY ("MasterAccountID")
);

-- CreateTable
CREATE TABLE "ServiceTypes" (
    "ServiceTypeID" VARCHAR(20) NOT NULL,
    "Name" VARCHAR(100) NOT NULL,
    "DefaultProfileCapacity" INTEGER NOT NULL,
    "CreatedAt" TIMESTAMP(3) NOT NULL,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServiceTypes_pkey" PRIMARY KEY ("ServiceTypeID")
);

-- CreateTable
CREATE TABLE "Services" (
    "ServiceID" VARCHAR(20) NOT NULL,
    "MasterAccountID" VARCHAR(20) NOT NULL,
    "ServiceTypeID" VARCHAR(20) NOT NULL,
    "Status" VARCHAR(20) NOT NULL DEFAULT 'Active',
    "CreatedAt" TIMESTAMP(3) NOT NULL,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Services_pkey" PRIMARY KEY ("ServiceID")
);

-- CreateTable
CREATE TABLE "StreamingProfiles" (
    "StreamingProfileID" VARCHAR(20) NOT NULL,
    "ServiceID" VARCHAR(20) NOT NULL,
    "ProfileName" VARCHAR(50) NOT NULL,
    "EncryptedPIN" TEXT NOT NULL,
    "Capacity" INTEGER NOT NULL,
    "Status" VARCHAR(20) NOT NULL DEFAULT 'Available',
    "CreatedAt" TIMESTAMP(3) NOT NULL,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StreamingProfiles_pkey" PRIMARY KEY ("StreamingProfileID")
);

-- CreateTable
CREATE TABLE "PendingCustomers" (
    "PendingCustomerID" VARCHAR(20) NOT NULL,
    "FullName" VARCHAR(100) NOT NULL,
    "Phone" VARCHAR(20) NOT NULL,
    "Username" VARCHAR(100),
    "Platform" VARCHAR(30) NOT NULL,
    "ProductID" VARCHAR(20) NOT NULL,
    "Status" VARCHAR(20) NOT NULL DEFAULT 'Pending',
    "SubmittedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PendingCustomers_pkey" PRIMARY KEY ("PendingCustomerID")
);

-- CreateTable
CREATE TABLE "Subscriptions" (
    "SubscriptionID" VARCHAR(20) NOT NULL,
    "CustomerID" VARCHAR(20) NOT NULL,
    "ProductID" VARCHAR(20) NOT NULL,
    "StartDate" DATE NOT NULL,
    "ExpiryDate" DATE NOT NULL,
    "AmountPaid" DECIMAL(10,2) NOT NULL,
    "Status" VARCHAR(20) NOT NULL,
    "CreatedAt" TIMESTAMP(3) NOT NULL,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subscriptions_pkey" PRIMARY KEY ("SubscriptionID")
);

-- CreateTable
CREATE TABLE "Assignments" (
    "AssignmentID" VARCHAR(20) NOT NULL,
    "SubscriptionID" VARCHAR(20) NOT NULL,
    "StreamingProfileID" VARCHAR(20) NOT NULL,
    "AssignedAt" TIMESTAMP(3) NOT NULL,
    "EndedAt" TIMESTAMP(3),
    "Status" VARCHAR(20) NOT NULL,
    "ReasonForChange" TEXT,
    "CreatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Assignments_pkey" PRIMARY KEY ("AssignmentID")
);

-- CreateTable
CREATE TABLE "Revenue" (
    "RevenueID" VARCHAR(20) NOT NULL,
    "SubscriptionID" VARCHAR(20) NOT NULL,
    "Amount" DECIMAL(10,2) NOT NULL,
    "PaymentMethod" VARCHAR(30) NOT NULL,
    "ReceivedDate" DATE NOT NULL,
    "CreatedBy" VARCHAR(20) NOT NULL,
    "CreatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Revenue_pkey" PRIMARY KEY ("RevenueID")
);

-- CreateTable
CREATE TABLE "RenewalHistory" (
    "RenewalID" VARCHAR(20) NOT NULL,
    "SubscriptionID" VARCHAR(20) NOT NULL,
    "OldExpiryDate" DATE NOT NULL,
    "NewExpiryDate" DATE NOT NULL,
    "AmountPaid" DECIMAL(10,2) NOT NULL,
    "RenewedBy" VARCHAR(20) NOT NULL,
    "RenewedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RenewalHistory_pkey" PRIMARY KEY ("RenewalID")
);

-- CreateTable
CREATE TABLE "PinHistory" (
    "PinHistoryID" VARCHAR(20) NOT NULL,
    "StreamingProfileID" VARCHAR(20) NOT NULL,
    "OldEncryptedPIN" TEXT NOT NULL,
    "NewEncryptedPIN" TEXT NOT NULL,
    "ChangedBy" VARCHAR(20) NOT NULL,
    "ChangedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PinHistory_pkey" PRIMARY KEY ("PinHistoryID")
);

-- CreateTable
CREATE TABLE "Notifications" (
    "NotificationID" VARCHAR(20) NOT NULL,
    "Type" VARCHAR(50) NOT NULL,
    "Message" TEXT NOT NULL,
    "RelatedEntity" VARCHAR(30),
    "RelatedEntityID" VARCHAR(20),
    "Status" VARCHAR(20) NOT NULL DEFAULT 'Unread',
    "CreatedAt" TIMESTAMP(3) NOT NULL,
    "ReadAt" TIMESTAMP(3),

    CONSTRAINT "Notifications_pkey" PRIMARY KEY ("NotificationID")
);

-- CreateTable
CREATE TABLE "ActivityLog" (
    "LogID" VARCHAR(20) NOT NULL,
    "UserID" VARCHAR(20) NOT NULL,
    "Action" VARCHAR(100) NOT NULL,
    "Entity" VARCHAR(50) NOT NULL,
    "EntityID" VARCHAR(20) NOT NULL,
    "Details" TEXT,
    "IPAddress" VARCHAR(45),
    "CreatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ActivityLog_pkey" PRIMARY KEY ("LogID")
);

-- CreateIndex
CREATE UNIQUE INDEX "Users_Email_key" ON "Users"("Email");

-- CreateIndex
CREATE UNIQUE INDEX "Customers_Phone_key" ON "Customers"("Phone");

-- CreateIndex
CREATE INDEX "Customers_Phone_idx" ON "Customers"("Phone");

-- CreateIndex
CREATE INDEX "Customers_FullName_idx" ON "Customers"("FullName");

-- CreateIndex
CREATE UNIQUE INDEX "Products_ProductCode_key" ON "Products"("ProductCode");

-- CreateIndex
CREATE INDEX "Products_ProductCode_idx" ON "Products"("ProductCode");

-- CreateIndex
CREATE INDEX "Products_ServiceTypeID_idx" ON "Products"("ServiceTypeID");

-- CreateIndex
CREATE UNIQUE INDEX "MasterAccounts_Email_key" ON "MasterAccounts"("Email");

-- CreateIndex
CREATE INDEX "MasterAccounts_Email_idx" ON "MasterAccounts"("Email");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceTypes_Name_key" ON "ServiceTypes"("Name");

-- CreateIndex
CREATE INDEX "ServiceTypes_Name_idx" ON "ServiceTypes"("Name");

-- CreateIndex
CREATE INDEX "Services_MasterAccountID_idx" ON "Services"("MasterAccountID");

-- CreateIndex
CREATE INDEX "Services_ServiceTypeID_idx" ON "Services"("ServiceTypeID");

-- CreateIndex
CREATE UNIQUE INDEX "Services_MasterAccountID_ServiceTypeID_key" ON "Services"("MasterAccountID", "ServiceTypeID");

-- CreateIndex
CREATE INDEX "StreamingProfiles_ServiceID_idx" ON "StreamingProfiles"("ServiceID");

-- CreateIndex
CREATE INDEX "PendingCustomers_Phone_idx" ON "PendingCustomers"("Phone");

-- CreateIndex
CREATE INDEX "PendingCustomers_Status_idx" ON "PendingCustomers"("Status");

-- CreateIndex
CREATE INDEX "Subscriptions_CustomerID_idx" ON "Subscriptions"("CustomerID");

-- CreateIndex
CREATE INDEX "Subscriptions_ProductID_idx" ON "Subscriptions"("ProductID");

-- CreateIndex
CREATE INDEX "Subscriptions_ExpiryDate_idx" ON "Subscriptions"("ExpiryDate");

-- CreateIndex
CREATE INDEX "Subscriptions_Status_idx" ON "Subscriptions"("Status");

-- CreateIndex
CREATE INDEX "Assignments_SubscriptionID_idx" ON "Assignments"("SubscriptionID");

-- CreateIndex
CREATE INDEX "Assignments_StreamingProfileID_idx" ON "Assignments"("StreamingProfileID");

-- CreateIndex
CREATE INDEX "Assignments_Status_idx" ON "Assignments"("Status");

-- CreateIndex
CREATE INDEX "Revenue_SubscriptionID_idx" ON "Revenue"("SubscriptionID");

-- CreateIndex
CREATE INDEX "Revenue_ReceivedDate_idx" ON "Revenue"("ReceivedDate");

-- CreateIndex
CREATE INDEX "RenewalHistory_SubscriptionID_idx" ON "RenewalHistory"("SubscriptionID");

-- CreateIndex
CREATE INDEX "PinHistory_StreamingProfileID_idx" ON "PinHistory"("StreamingProfileID");

-- CreateIndex
CREATE INDEX "Notifications_Status_idx" ON "Notifications"("Status");

-- CreateIndex
CREATE INDEX "Notifications_Type_idx" ON "Notifications"("Type");

-- CreateIndex
CREATE INDEX "Notifications_CreatedAt_idx" ON "Notifications"("CreatedAt");

-- CreateIndex
CREATE INDEX "ActivityLog_UserID_idx" ON "ActivityLog"("UserID");

-- CreateIndex
CREATE INDEX "ActivityLog_Entity_idx" ON "ActivityLog"("Entity");

-- CreateIndex
CREATE INDEX "ActivityLog_CreatedAt_idx" ON "ActivityLog"("CreatedAt");

-- AddForeignKey
ALTER TABLE "Products" ADD CONSTRAINT "Products_ServiceTypeID_fkey" FOREIGN KEY ("ServiceTypeID") REFERENCES "ServiceTypes"("ServiceTypeID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Services" ADD CONSTRAINT "Services_MasterAccountID_fkey" FOREIGN KEY ("MasterAccountID") REFERENCES "MasterAccounts"("MasterAccountID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Services" ADD CONSTRAINT "Services_ServiceTypeID_fkey" FOREIGN KEY ("ServiceTypeID") REFERENCES "ServiceTypes"("ServiceTypeID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StreamingProfiles" ADD CONSTRAINT "StreamingProfiles_ServiceID_fkey" FOREIGN KEY ("ServiceID") REFERENCES "Services"("ServiceID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PendingCustomers" ADD CONSTRAINT "PendingCustomers_ProductID_fkey" FOREIGN KEY ("ProductID") REFERENCES "Products"("ProductID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscriptions" ADD CONSTRAINT "Subscriptions_CustomerID_fkey" FOREIGN KEY ("CustomerID") REFERENCES "Customers"("CustomerID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscriptions" ADD CONSTRAINT "Subscriptions_ProductID_fkey" FOREIGN KEY ("ProductID") REFERENCES "Products"("ProductID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assignments" ADD CONSTRAINT "Assignments_SubscriptionID_fkey" FOREIGN KEY ("SubscriptionID") REFERENCES "Subscriptions"("SubscriptionID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assignments" ADD CONSTRAINT "Assignments_StreamingProfileID_fkey" FOREIGN KEY ("StreamingProfileID") REFERENCES "StreamingProfiles"("StreamingProfileID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Revenue" ADD CONSTRAINT "Revenue_SubscriptionID_fkey" FOREIGN KEY ("SubscriptionID") REFERENCES "Subscriptions"("SubscriptionID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Revenue" ADD CONSTRAINT "Revenue_CreatedBy_fkey" FOREIGN KEY ("CreatedBy") REFERENCES "Users"("UserID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RenewalHistory" ADD CONSTRAINT "RenewalHistory_SubscriptionID_fkey" FOREIGN KEY ("SubscriptionID") REFERENCES "Subscriptions"("SubscriptionID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RenewalHistory" ADD CONSTRAINT "RenewalHistory_RenewedBy_fkey" FOREIGN KEY ("RenewedBy") REFERENCES "Users"("UserID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PinHistory" ADD CONSTRAINT "PinHistory_StreamingProfileID_fkey" FOREIGN KEY ("StreamingProfileID") REFERENCES "StreamingProfiles"("StreamingProfileID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PinHistory" ADD CONSTRAINT "PinHistory_ChangedBy_fkey" FOREIGN KEY ("ChangedBy") REFERENCES "Users"("UserID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_UserID_fkey" FOREIGN KEY ("UserID") REFERENCES "Users"("UserID") ON DELETE RESTRICT ON UPDATE CASCADE;
