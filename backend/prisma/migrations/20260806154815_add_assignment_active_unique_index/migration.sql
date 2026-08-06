-- This is an empty migration.
-- Enforce BR-047: Only one Active Assignment per Subscription at DB level
CREATE UNIQUE INDEX IF NOT EXISTS assignment_one_active_per_subscription
ON "Assignments"("SubscriptionID")
WHERE "Status" = 'Active';