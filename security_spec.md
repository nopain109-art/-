# Security Spec

1. Data Invariants:
   - Anyone can create a consultation.
   - Only admins can read, list, update, and delete consultations.
   - Admin roles are defined in the /admins/{userId} collection.
   - Consultations must have a name, phone, and timeRange.

2. The "Dirty Dozen" Payloads:
   - Creation without a name
   - Creation with extra fields
   - Creation by an admin with a spoofed timestamp
   - Read by an unauthenticated user
   - Read by a non-admin authenticated user
   - Update by unauthenticated user
   - Update by admin with invalid fields
   - Delete by non-admin
   - PII Test: Consultations contain PII (name, phone) and must only be readable by admins.

3. The Test Runner:
   - Draft tests to verify the rules.
