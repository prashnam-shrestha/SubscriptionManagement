# SubscriptionOS
## Software Design Documentation

**Version:** 2.0
**Status:** Approved for Development
**Last Updated:** August 4, 2026
**Owner:** Prashnam Shrestha

---

### Document Control

| Version | Date | Summary |
|---|---|---|
| 1.0 | — | Initial draft (Vision, PRD, Data Dictionary, ER Diagram, Business Rules, UI/UX Spec, Wireframes, API Spec, System Architecture) |
| 1.1 | — | Data model hardened: fixed ID-type inconsistency, added AES encryption for Master Account passwords and Streaming Profile PINs, added DB-transaction locking rule for the Assignment Engine, resolved the bundle-product exception by deferring it to Version 2, added Pending Customer duplicate handling, added Postgres full-text search decision |
| **2.0** | **Aug 4, 2026** | **UI/UX Spec, Wireframes, API Spec, and System Architecture brought up to date with the v1.1 data model and full 17-module PRD (Task Center, Pending Customers, Credential Center, Global Search were previously undocumented at the UI/API layer); standardized REST resource naming; added error/pagination/rate-limit conventions; resolved Master Account archive-with-active-customers gap; added environment configuration and testing sections; single consolidated file with table of contents** |

---

### How to Read This Document

This is a single-business, 1–5 administrator internal tool — not a multi-tenant SaaS product. Every design decision below is deliberately sized for that reality: readable IDs over UUIDs, a monolith over microservices, and a short exclusion list (Section 2, §5) that exists on purpose, not by omission. Where a decision trades simplicity for future flexibility, the document says so explicitly rather than leaving it implicit.

---

### Table of Contents

1. [Vision](#1-vision)
2. [Product Requirements Document](#2-product-requirements-document)
3. [Data Dictionary](#3-data-dictionary)
4. [Database Schema](#4-database-schema)
5. [Entity Relationship Diagram](#5-entity-relationship-diagram)
6. [Business Rules](#6-business-rules)
7. [UI/UX Specification](#7-uiux-specification)
8. [Screen Wireframes](#8-screen-wireframes)
9. [API Specification](#9-api-specification)
10. [System Architecture](#10-system-architecture)
11. [Appendix: Glossary, Open Items & Roadmap](#11-appendix-glossary-open-items--roadmap)

---

## 1. Vision


#### **1. Purpose**

SubscriptionOS is a centralized web application designed to manage a digital subscription reseller business.

The system replaces spreadsheets, handwritten records, messaging history, and manual processes with a single source of truth that allows administrators to efficiently manage customers, subscriptions, streaming accounts, revenue, and daily operations.

The software is designed primarily for small businesses with 1–5 administrators.

---

#### **2. Vision Statement**

SubscriptionOS aims to simplify the management of digital subscription services by automating repetitive operational tasks while keeping administrators in full control of business decisions.

The system should reduce manual work, improve data accuracy, minimize human error, and provide complete visibility into the business through one centralized platform.

---

#### **3. Problem Statement**

The current business workflow relies heavily on manual processes, including:

* Searching spreadsheets  
* Checking available streaming profiles  
* Remembering customer assignments  
* Tracking subscription expiry dates  
* Renewing subscriptions manually  
* Changing streaming profile PINs  
* Identifying affected customers after PIN changes  
* Recording revenue manually  
* Searching Messenger or WhatsApp conversations  
* Copying customer credentials repeatedly

These processes are time-consuming, difficult to scale, and increase the risk of human error.

---

#### **4. Project Goals**

The primary goal of SubscriptionOS is to provide a complete business management platform that allows administrators to manage the entire subscription business from a single dashboard.

The software should automate repetitive tasks wherever possible while ensuring that important business decisions remain under administrator control.

---

#### **5. Target Users**

### **Version 1**

* Business Owner  
* Administrator

### **Future Versions**

* Staff Members  
* Customer Portal  
* Dealer Portal

---

#### **6. Core Objectives**

The system must allow administrators to:

* Manage customers  
* Manage products  
* Manage master accounts  
* Manage streaming services  
* Manage streaming profiles  
* Create subscriptions  
* Renew subscriptions  
* Move customers between profiles  
* Change streaming profile PINs  
* Generate ready-to-send customer credentials  
* Track revenue  
* View reports and statistics  
* Search all business data quickly

---

#### **7. Automation Objectives**

The system should automatically:

* Find eligible streaming profiles  
* Select the most suitable profile based on the configured assignment strategy  
* Prevent profile over-allocation  
* Generate customer credential messages  
* Record revenue automatically  
* Update dashboard statistics  
* Detect expiring subscriptions  
* Detect full streaming profiles  
* Detect inactive or dead master accounts  
* Maintain complete activity history

---

#### **8. Design Principles**

SubscriptionOS will be designed according to the following principles:

* Automation First  
* Single Source of Truth  
* Simplicity  
* Performance  
* Data Consistency  
* Security by Default  
* Auditability  
* Scalability  
* Mobile-Friendly Design

---

#### **9. Success Criteria**

The system will be considered successful if administrators can:

* Create a new subscription in under 30 seconds  
* Renew a subscription in under 15 seconds  
* Find any customer in under 2 seconds  
* Generate customer credentials instantly  
* Change a profile PIN and immediately identify every affected customer  
* Prevent profile over-allocation automatically  
* Record every important business action in the Activity Log  
* Operate the business without relying on spreadsheets

---

#### **10. Version 1 Scope**

Version 1 includes:

* Customer Management  
* Product Management  
* Master Account Management  
* Streaming Service Management  
* Streaming Profile Management  
* Subscription Management  
* Automatic Assignment Engine  
* Revenue Tracking  
* Dashboard  
* Reports  
* Notifications  
* Activity Log  
* Role-Based Access Control

---

#### **11. Out of Scope (Version 1\)**

The following features are intentionally excluded from Version 1:

* Customer Portal  
* Mobile Application  
* Online Payments  
* Automatic WhatsApp Messaging  
* Automatic Messenger Integration  
* SMS Notifications  
* Multi-Business Support  
* Dealer Management  
* Public API  
* AI-Based Business Analytics

These features may be implemented in future releases.

---

#### **12. Long-Term Vision**

SubscriptionOS is intended to become the primary operational platform for the business.

Future versions should support additional services, more administrators, dealer management, customer self-service, payment integration, mobile applications, and advanced business analytics without requiring major architectural changes.

## 2. Product Requirements Document


### **Product**

**SubscriptionOS**

---

### **1. Overview**

SubscriptionOS is a web-based business management system designed for companies that resell digital subscription services such as Netflix, Prime Video, Spotify, and similar platforms.

The system replaces spreadsheets and manual processes with a centralized platform that manages customers, subscriptions, master accounts, streaming profiles, revenue, notifications, reports, and daily operations.

Version 1 is designed for businesses with 1–5 administrators.

---

### **2. User Roles**

#### **Owner**

The Owner has unrestricted access to the entire system.

Permissions include:

* Manage all data  
* Manage users  
* Modify system settings  
* View all reports  
* Archive or restore records  
* Configure assignment strategy  
* Access business analytics

---

#### **Admin**

Administrators perform daily business operations.

Permissions include:

* Manage customers  
* Manage subscriptions  
* Manage streaming profiles  
* Renew subscriptions  
* Move customers  
* Generate credentials  
* View reports  
* Change profile PINs

Restrictions:

* Cannot modify system settings  
* Cannot manage users  
* Cannot archive master accounts  
* Cannot archive products

---

#### **Future Role — Staff**

Reserved for future versions.

Staff members will have limited operational permissions.

---

### **3. Functional Modules**

#### **Module 1 — Dashboard**

Purpose

Provide a real-time overview of the business.

Features

* Today's Revenue  
* Monthly Revenue  
* Active Customers  
* Active Subscriptions  
* Expiring Subscriptions  
* Expired Subscriptions  
* Full Streaming Profiles  
* Dead Master Accounts  
* Recent Activity  
* Pending Tasks

---

#### **Module 2 — Task Center**

Purpose

Display every action requiring administrator attention.

Tasks include

* Pending Customer Approvals  
* Renewals Due Today  
* Renewals Due Tomorrow  
* Expired Subscriptions  
* Dead Master Accounts  
* Full Streaming Profiles  
* PIN Changes Required

The Task Center should be the first screen displayed after login.

---

#### **Module 3 — Pending Customer Management**

Purpose

Review new customer requests before approval.

Features

* View pending requests  
* Approve request  
* Reject request  
* Detect duplicate phone numbers  
* Prevent duplicate pending requests

---

#### **Module 4 — Customer Management**

Features

* Create Customer  
* Edit Customer  
* Archive Customer  
* Search Customer  
* Customer Profile  
* Subscription History  
* Payment History

---

#### **Module 5 — Product Management**

Features

* Create Product  
* Edit Product  
* Archive Product  
* Enable / Disable Product  
* Update Pricing

---

#### **Module 6 — Master Account Management**

Features

* Create Master Account  
* Edit Credentials  
* Mark Account Dead  
* Archive Account  
* View Occupancy  
* View Supported Services

---

#### **Module 7 — Streaming Service Management**

Features

* Create Service  
* Edit Service  
* Configure Capacity Rules

---

#### **Module 8 — Streaming Profile Management**

Features

* Create Streaming Profile  
* Edit Profile  
* Change PIN  
* View Assigned Customers  
* View Occupancy

---

#### **Module 9 — Assignment Engine**

Purpose

Automatically assign customers to the most appropriate Streaming Profile.

Features

* Find Eligible Profiles  
* Validate Capacity  
* Assign Customer  
* Move Customer  
* Bulk Move Customers  
* Prevent Over-allocation  
* Support Configurable Assignment Strategy

Business Requirement

All assignment operations must execute inside a database transaction to prevent concurrent over-allocation.

---

#### **Module 10 — Subscription Management**

Features

* Create Subscription  
* Renew Subscription  
* Cancel Subscription  
* Archive Subscription  
* Subscription History

---

#### **Module 11 — Credential Center**

Purpose

Generate ready-to-send customer credentials.

Features

* Generate Credential Message  
* One-click Copy  
* Multiple Templates  
* Preview Message

Generated message includes

* Customer Name  
* Product  
* Master Account Email  
* Master Account Password  
* Streaming Profile  
* Profile PIN  
* Usage Rules

---

#### **Module 12 — Revenue Management**

Features

* Automatic Revenue Recording  
* Revenue History  
* Monthly Reports  
* Yearly Reports  
* Product Revenue Analysis

---

#### **Module 13 — Reports**

Reports include

* Customer Reports  
* Revenue Reports  
* Subscription Reports  
* Occupancy Reports  
* Expiry Reports  
* Product Reports

---

#### **Module 14 — Global Search**

The search system must return results from

* Customers  
* Products  
* Master Accounts  
* Streaming Services  
* Streaming Profiles  
* Subscriptions

Implementation Requirement

Search shall use PostgreSQL Full-Text Search with GIN indexes.

---

#### **Module 15 — Notifications**

Notify administrators about

* Expiring Subscriptions  
* Expired Subscriptions  
* Full Streaming Profiles  
* Dead Master Accounts  
* Failed Assignments  
* Pending Customer Requests

---

#### **Module 16 — Activity Log**

Record every important system action.

Examples

* Customer Created  
* Subscription Renewed  
* Customer Moved  
* Profile PIN Changed  
* Product Updated  
* Master Account Archived  
* Administrator Login

---

#### **Module 17 — Settings**

Features

* Business Settings  
* Credential Templates  
* Assignment Strategy  
* System Preferences

---

### **4. Non-Functional Requirements**

The system shall

* Load dashboard within 3 seconds  
* Return search results within 2 seconds  
* Create subscriptions within 30 seconds  
* Renew subscriptions within 15 seconds  
* Support desktop and mobile browsers  
* Prevent duplicate records  
* Prevent profile over-allocation  
* Maintain complete audit history  
* Prevent accidental deletion through archive-first design  
* Support concurrent administrator usage safely

---

### **5. Version 1 Scope**

Included

* Dashboard  
* Task Center  
* Pending Customer Management  
* Customer Management  
* Product Management  
* Master Account Management  
* Streaming Service Management  
* Streaming Profile Management  
* Assignment Engine  
* Subscription Management  
* Credential Center  
* Revenue Management  
* Reports  
* Notifications  
* Activity Log  
* Settings

Excluded

* Customer Portal  
* Mobile Application  
* Payment Gateway Integration  
* WhatsApp Automation  
* Email Automation  
* Dealer Management  
* AI Analytics  
* Multi-Business Support  
* Public API

---

### **6. Success Criteria**

Version 1 will be considered successful when administrators can

* Operate the business without spreadsheets  
* Complete daily operations from a single dashboard  
* Prevent profile over-allocation automatically  
* Find any customer in under 2 seconds  
* Generate customer credentials instantly  
* Track all business activity through a complete audit trail  
* Scale to thousands of customers without major architectural changes

## 3. Data Dictionary


#### **Purpose**

This document defines every entity, field, data type, relationship, and storage rule used by SubscriptionOS.

It acts as the single source of truth for the database design and must remain consistent with the SRS, ER Diagram, API Specification, and Business Rules.

---

### **Database Design Principles**

The database follows these principles:

* Human-readable IDs are used as Primary Keys.  
* Every important business action is historically preserved.  
* Records are archived instead of permanently deleted.  
* Assignment history is never overwritten.  
* Data duplication should be avoided whenever possible.  
* Every table includes audit timestamps.  
* Streaming profile capacity must never be exceeded.

---

### **ID Format**

SubscriptionOS uses readable string IDs instead of UUIDs, used as Primary Keys throughout the system.

> The canonical prefix table lives in Section 4 (Database Schema → ID Format) to avoid two sources of truth for the same thing — an earlier draft of this section had a second, slightly different table (`MA-`/`SRV-`/`SPR-` vs. Section 4's `MAC-`/`SER-`/`SPF-`) which has been removed here.

---

### **Customer**

| Field | Type | Description |
| ----- | ----- | ----- |
| CustomerID | String | Primary Key |
| FullName | String | Customer name |
| PhoneNumber | String | Unique customer phone |
| Username | String | Optional social username |
| Source | Enum | Messenger, WhatsApp, Instagram, Telegram, Walk-in |
| Status | Enum | Active, Archived |
| Notes | Text | Optional notes |
| CreatedAt | Timestamp | Record creation |
| UpdatedAt | Timestamp | Last modification |

---

### **Pending Customer**

Stores customer requests awaiting approval.

| Field | Type |
| ----- | ----- |
| PendingCustomerID | String |
| FullName | String |
| PhoneNumber | String |
| Username | String |
| RequestedProduct | String |
| Status | Pending / Approved / Rejected |
| CreatedAt | Timestamp |

Business Rule:

If another pending request exists with the same phone number, update the existing request instead of creating a duplicate.

---

### **Product**

| Field | Type |
| ----- | ----- |
| ProductID | String |
| ProductName | String |
| Price | Decimal |
| DurationDays | Integer |
| RequiredServiceID | String |
| Status | Active / Disabled |
| CreatedAt | Timestamp |
| UpdatedAt | Timestamp |

Version 1 supports one streaming service per product.

Bundle products are planned for Version 2.

---

### **Master Account**

Represents a purchased streaming account.

| Field | Type |
| ----- | ----- |
| MasterAccountID | String |
| Email | String |
| EncryptedPassword | Encrypted String |
| Status | Active / Dead / Archived |
| Notes | Text |
| CreatedAt | Timestamp |
| UpdatedAt | Timestamp |

Master account passwords must be encrypted using AES encryption because they must be displayed to authorized administrators.

Passwords must never be stored in plain text.

---

### **Streaming Service**

Examples:

* Netflix  
* Prime Video  
* Spotify

| Field | Type |
| ----- | ----- |
| ServiceID | String |
| ServiceName | String |
| DefaultCapacity | Integer |
| CreatedAt | Timestamp |

---

### **Streaming Profile**

Represents one usable profile inside a Master Account.

Example:

Netflix Account → Profile 1

| Field | Type |
| ----- | ----- |
| StreamingProfileID | String |
| MasterAccountID | String |
| ServiceID | String |
| ProfileName | String |
| ProfilePIN | String |
| Capacity | Integer |
| Status | Available / Full / Disabled |
| CreatedAt | Timestamp |
| UpdatedAt | Timestamp |

Profile PINs are encrypted before storage.

---

### **Subscription**

Represents the commercial purchase.

| Field | Type |
| ----- | ----- |
| SubscriptionID | String |
| CustomerID | String |
| ProductID | String |
| StartDate | Date |
| ExpiryDate | Date |
| Status | Active / Expired / Cancelled |
| PricePaid | Decimal |
| CreatedAt | Timestamp |
| UpdatedAt | Timestamp |

A Subscription does not store streaming profile information.

Operational placement is managed exclusively through the Assignment table.

---

### **Assignment**

Represents where a subscription is currently placed.

| Field | Type |
| ----- | ----- |
| AssignmentID | String |
| SubscriptionID | String |
| StreamingProfileID | String |
| AssignedDate | DateTime |
| EndedDate | DateTime |
| Status | Active / Closed |
| ReasonForChange | Text |
| CreatedAt | Timestamp |

Database Invariant:

A Subscription may have only one Active Assignment at any time.

Historical Assignments must never be modified or deleted.

Future versions supporting bundle products may allow multiple Active Assignments (one per required streaming service).

---

### **Revenue**

| Field | Type |
| ----- | ----- |
| RevenueID | String |
| SubscriptionID | String |
| Amount | Decimal |
| PaymentMethod | Enum |
| PaymentDate | Date |
| CreatedAt | Timestamp |

Revenue records are automatically generated when subscriptions are created or renewed.

---

### **Notification**

| Field | Type |
| ----- | ----- |
| NotificationID | String |
| Type | String |
| Message | Text |
| Status | Unread / Read |
| CreatedAt | Timestamp |
| ReadAt | Timestamp |

---

### **Activity Log**

Stores every important business action.

| Field | Type |
| ----- | ----- |
| LogID | String |
| UserID | String |
| Action | String |
| Entity | String |
| EntityID | String |
| Description | Text |
| CreatedAt | Timestamp |

Activity Logs are append-only.

Existing records must never be edited.

---

### **User**

| Field | Type |
| ----- | ----- |
| UserID | String |
| FullName | String |
| Email | String |
| PasswordHash | String |
| Role | Owner / Admin |
| Status | Active / Disabled |
| CreatedAt | Timestamp |

User passwords are stored using bcrypt hashing.

Passwords can never be recovered.

---

### **Search**

SubscriptionOS uses PostgreSQL Full-Text Search with GIN indexes to search:

* Customers  
* Products  
* Master Accounts  
* Streaming Services  
* Streaming Profiles  
* Subscriptions

---

### **Concurrency Rules**

Assignment operations must execute inside a database transaction.

The selected Streaming Profile must be locked during assignment to prevent profile over-allocation when multiple administrators create subscriptions simultaneously.

---

### **Future Extensions**

The following are intentionally excluded from Version 1:

* Bundle Products  
* Multiple Active Assignments per Subscription  
* Customer Portal  
* Dealer Management  
* Multi-Business Support  
* Public API

These features are reserved for future versions without requiring major database redesign.

## 4. Database Schema


#### Database

**Database Engine:** PostgreSQL 17+

---

### Database Design Principles

This document defines the physical database structure used by SubscriptionOS.

The schema follows these design principles:

- Human-readable IDs are used as Primary Keys.  
- Historical records are never overwritten.  
- Records are archived instead of permanently deleted.  
- Assignment history is preserved.  
- Streaming profile capacity must never be exceeded.  
- Assignment is the single source of truth for customer placement.  
- Every table contains audit timestamps where applicable.

---

### ID Format

SubscriptionOS uses readable string IDs instead of UUIDs.

Examples:

| Entity | Format |  
|----------|----------------|  
| User | USR-000001 |  
| Customer | CUS-000001 |  
| Product | PRO-000001 |  
| Master Account | MAC-000001 |  
| Streaming Service | SER-000001 |  
| Streaming Profile | SPF-000001 |  
| Subscription | SUB-000001 |  
| Assignment | ASN-000001 |  
| Revenue | REV-000001 |  
| Renewal | REN-000001 |  
| Pending Customer | PEN-000001 |  
| PIN History | PIN-000001 |  
| Notification | NOT-000001 |  
| Activity Log | LOG-000001 |

---

### 1. Users

#### Purpose

Stores administrators who can access SubscriptionOS.

#### Primary Key

UserID

#### Columns

| Column | Data Type | Constraints |  
|----------|-------------|-------------------------------|  
| UserID | VARCHAR(20) | PRIMARY KEY |  
| FullName | VARCHAR(100) | NOT NULL |  
| Email | VARCHAR(255) | UNIQUE NOT NULL |  
| PasswordHash | TEXT | NOT NULL |  
| Role | VARCHAR(20) | NOT NULL |  
| Status | VARCHAR(20) | NOT NULL DEFAULT 'Active' |  
| CreatedAt | TIMESTAMP | NOT NULL |  
| UpdatedAt | TIMESTAMP | NOT NULL |

#### Indexes

- Email

#### Notes

User passwords are stored using bcrypt hashing.

Passwords are never recoverable.

---

### 2. Customers

#### Purpose

Stores every approved customer.

#### Primary Key

CustomerID

#### Columns

| Column | Data Type | Constraints |  
|----------|-------------|-----------------------------|  
| CustomerID | VARCHAR(20) | PRIMARY KEY |  
| FullName | VARCHAR(100) | NOT NULL |  
| Phone | VARCHAR(20) | UNIQUE NOT NULL |  
| Username | VARCHAR(100) | NULL |  
| Platform | VARCHAR(30) | NOT NULL |  
| Notes | TEXT | NULL |  
| Status | VARCHAR(20) | NOT NULL DEFAULT 'Active' |  
| CreatedAt | TIMESTAMP | NOT NULL |  
| UpdatedAt | TIMESTAMP | NOT NULL |

#### Indexes

- Phone  
- FullName

---

### 3. Products

#### Purpose

Represents products sold by the business.

Examples:

- Netflix Shared  
- Netflix Private  
- Prime Shared  
- Spotify

#### Primary Key

ProductID

#### Columns

| Column | Data Type | Constraints |  
|----------|-------------|----------------------------|  
| ProductID | VARCHAR(20) | PRIMARY KEY |  
| ProductCode | VARCHAR(20) | UNIQUE |  
| ProductName | VARCHAR(100) | NOT NULL |  
| ServiceTypeID | VARCHAR(20) | FOREIGN KEY |  
| Price | DECIMAL(10,2) | NOT NULL |  
| DurationDays | INTEGER | NOT NULL |  
| Status | VARCHAR(20) | NOT NULL DEFAULT 'Active' |  
| CreatedAt | TIMESTAMP | NOT NULL |  
| UpdatedAt | TIMESTAMP | NOT NULL |

#### Indexes

- ProductCode  
- ServiceTypeID

#### Notes

Version 1 supports one streaming service per product.

Bundle products are planned for Version 2.

---

### 4. MasterAccounts

#### Purpose

Represents purchased streaming accounts.

Example:

Netflix Account #12

Prime Account #7

#### Primary Key

MasterAccountID

#### Columns

| Column | Data Type | Constraints |  
|----------|-------------|-----------------------------|  
| MasterAccountID | VARCHAR(20) | PRIMARY KEY |  
| Email | VARCHAR(255) | NOT NULL |  
| EncryptedPassword | TEXT | NOT NULL |  
| Nickname | VARCHAR(100) | NULL |  
| Status | VARCHAR(20) | NOT NULL DEFAULT 'Active' |  
| Notes | TEXT | NULL |  
| CreatedAt | TIMESTAMP | NOT NULL |  
| UpdatedAt | TIMESTAMP | NOT NULL |

#### Indexes

- Email

#### Notes

Passwords are encrypted using AES encryption because they must be displayed to authorized administrators.

Passwords are never stored in plain text.

---

### 5. ServiceTypes

#### Purpose

Defines supported streaming service types.

Examples

- Netflix Shared  
- Netflix Private  
- Prime Shared  
- Spotify

#### Primary Key

ServiceTypeID

#### Columns

| Column | Data Type | Constraints |  
|----------|-------------|------------------------------|  
| ServiceTypeID | VARCHAR(20) | PRIMARY KEY |  
| Name | VARCHAR(100) | UNIQUE NOT NULL |  
| DefaultProfileCapacity | INTEGER | NOT NULL |  
| CreatedAt | TIMESTAMP | NOT NULL |  
| UpdatedAt | TIMESTAMP | NOT NULL |

#### Indexes

- Name

### 6. Services

#### Purpose

Represents a streaming service available inside a Master Account.

Example:

Master Account: Netflix Account #12

Services:

- Netflix Shared  
- Netflix Private

A Master Account may contain multiple Services.

#### Primary Key

ServiceID

#### Columns

| Column | Data Type | Constraints |  
|----------|-------------|-----------------------------|  
| ServiceID | VARCHAR(20) | PRIMARY KEY |  
| MasterAccountID | VARCHAR(20) | FOREIGN KEY REFERENCES MasterAccounts(MasterAccountID) |  
| ServiceTypeID | VARCHAR(20) | FOREIGN KEY REFERENCES ServiceTypes(ServiceTypeID) |  
| Status | VARCHAR(20) | NOT NULL DEFAULT 'Active' |  
| CreatedAt | TIMESTAMP | NOT NULL |  
| UpdatedAt | TIMESTAMP | NOT NULL |

#### Unique Constraint

(MasterAccountID, ServiceTypeID)

This prevents the same service from being added twice to one Master Account.

#### Indexes

- MasterAccountID  
- ServiceTypeID

---

### 7. StreamingProfiles

#### Purpose

Represents individual profiles inside a streaming service.

Example:

Netflix Account

├── Profile 1

├── Profile 2

├── Profile 3

├── Profile 4

└── Profile 5

Each profile can have its own PIN and customer capacity.

#### Primary Key

StreamingProfileID

#### Columns

| Column | Data Type | Constraints |  
|----------|-------------|-----------------------------|  
| StreamingProfileID | VARCHAR(20) | PRIMARY KEY |  
| ServiceID | VARCHAR(20) | FOREIGN KEY REFERENCES Services(ServiceID) |  
| ProfileName | VARCHAR(50) | NOT NULL |  
| EncryptedPIN | TEXT | NOT NULL |  
| Capacity | INTEGER | NOT NULL |  
| Status | VARCHAR(20) | NOT NULL DEFAULT 'Available' |  
| CreatedAt | TIMESTAMP | NOT NULL |  
| UpdatedAt | TIMESTAMP | NOT NULL |

#### Constraints

Capacity must be greater than zero.

#### Indexes

- ServiceID

#### Notes

Profile PINs are encrypted because administrators must be able to retrieve and share them with customers.

---

### 8. PendingCustomers

#### Purpose

Stores customer requests waiting for administrator approval.

Customers are first created here before becoming official Customers.

#### Primary Key

PendingCustomerID

#### Columns

| Column | Data Type | Constraints |  
|----------|-------------|-----------------------------|  
| PendingCustomerID | VARCHAR(20) | PRIMARY KEY |  
| FullName | VARCHAR(100) | NOT NULL |  
| Phone | VARCHAR(20) | NOT NULL |  
| Username | VARCHAR(100) | NULL |  
| Platform | VARCHAR(30) | NOT NULL |  
| ProductID | VARCHAR(20) | FOREIGN KEY REFERENCES Products(ProductID) |  
| Status | VARCHAR(20) | NOT NULL DEFAULT 'Pending' |  
| SubmittedAt | TIMESTAMP | NOT NULL |

#### Indexes

- Phone  
- Status

#### Business Rules

If another Pending Customer already exists with the same phone number and Pending status, update the existing record instead of creating a duplicate.

---

### 9. Subscriptions

#### Purpose

Represents a commercial purchase made by a customer.

Subscriptions store purchase information only.

They never store streaming profile information.

Current customer placement is determined exclusively through the Assignment table.

#### Primary Key

SubscriptionID

#### Columns

| Column | Data Type | Constraints |  
|----------|-------------|-----------------------------|  
| SubscriptionID | VARCHAR(20) | PRIMARY KEY |  
| CustomerID | VARCHAR(20) | FOREIGN KEY REFERENCES Customers(CustomerID) |  
| ProductID | VARCHAR(20) | FOREIGN KEY REFERENCES Products(ProductID) |  
| StartDate | DATE | NOT NULL |  
| ExpiryDate | DATE | NOT NULL |  
| AmountPaid | DECIMAL(10,2) | NOT NULL |  
| Status | VARCHAR(20) | NOT NULL |  
| CreatedAt | TIMESTAMP | NOT NULL |  
| UpdatedAt | TIMESTAMP | NOT NULL |

#### Indexes

- CustomerID  
- ProductID  
- ExpiryDate  
- Status

#### Business Rules

Subscription records are immutable business records.

Changing a customer's streaming profile must never modify the Subscription record.

All placement changes occur in the Assignment table.

---

### 10. Assignments

#### Purpose

Represents where a subscription is currently assigned.

Assignment is the single source of truth for operational placement.

#### Primary Key

AssignmentID

#### Columns

| Column | Data Type | Constraints |  
|----------|-------------|-----------------------------|  
| AssignmentID | VARCHAR(20) | PRIMARY KEY |  
| SubscriptionID | VARCHAR(20) | FOREIGN KEY REFERENCES Subscriptions(SubscriptionID) |  
| StreamingProfileID | VARCHAR(20) | FOREIGN KEY REFERENCES StreamingProfiles(StreamingProfileID) |  
| AssignedAt | TIMESTAMP | NOT NULL |  
| EndedAt | TIMESTAMP | NULL |  
| Status | VARCHAR(20) | NOT NULL |  
| ReasonForChange | TEXT | NULL |  
| CreatedAt | TIMESTAMP | NOT NULL |

#### Indexes

- SubscriptionID  
- StreamingProfileID  
- Status

#### Database Invariant

A Subscription may have only ONE Active Assignment at any time.

Historical Assignments must never be modified or deleted.

Future versions supporting Bundle Products may allow multiple Active Assignments, one per required Streaming Service.

#### Concurrency Requirement

Assignment creation must execute inside a database transaction.

The selected Streaming Profile row must be locked during assignment to prevent two administrators from assigning the same remaining seat simultaneously.

Example:

Administrator A starts creating a subscription.

↓

Profile row is locked.

↓

Administrator B waits until the transaction finishes.

↓

Capacity is recalculated before the second assignment proceeds.

This guarantees that Streaming Profile capacity can never be exceeded.  
### 11. Revenue

#### Purpose

Stores every payment received by the business.

Revenue records are created automatically whenever a subscription is created or renewed.

Revenue records are never edited or deleted.

---

#### Primary Key

RevenueID

---

#### Columns

| Column | Data Type | Constraints |  
|----------|-------------|---------------------------------------------|  
| RevenueID | VARCHAR(20) | PRIMARY KEY |  
| SubscriptionID | VARCHAR(20) | FOREIGN KEY REFERENCES Subscriptions(SubscriptionID) |  
| Amount | DECIMAL(10,2) | NOT NULL |  
| PaymentMethod | VARCHAR(30) | NOT NULL |  
| ReceivedDate | DATE | NOT NULL |  
| CreatedBy | VARCHAR(20) | FOREIGN KEY REFERENCES Users(UserID) |  
| CreatedAt | TIMESTAMP | NOT NULL |

---

#### Indexes

- SubscriptionID  
- ReceivedDate

---

#### Business Rules

Every successful subscription purchase creates exactly one Revenue record.

Every paid renewal creates exactly one Revenue record.

Revenue history must never be deleted.

---

### 12. RenewalHistory

#### Purpose

Stores every renewal performed on a subscription.

This table provides a complete audit trail of all subscription renewals.

---

#### Primary Key

RenewalID

---

#### Columns

| Column | Data Type | Constraints |  
|----------|-------------|---------------------------------------------|  
| RenewalID | VARCHAR(20) | PRIMARY KEY |  
| SubscriptionID | VARCHAR(20) | FOREIGN KEY REFERENCES Subscriptions(SubscriptionID) |  
| OldExpiryDate | DATE | NOT NULL |  
| NewExpiryDate | DATE | NOT NULL |  
| AmountPaid | DECIMAL(10,2) | NOT NULL |  
| RenewedBy | VARCHAR(20) | FOREIGN KEY REFERENCES Users(UserID) |  
| RenewedAt | TIMESTAMP | NOT NULL |

---

#### Indexes

- SubscriptionID

---

#### Business Rules

Renewal history is append-only.

Previous renewal records must never be edited.

---

### 13. PinHistory

#### Purpose

Stores every PIN change made to a streaming profile.

This table allows administrators to determine when a PIN was changed and who performed the change.

---

#### Primary Key

PinHistoryID

---

#### Columns

| Column | Data Type | Constraints |  
|----------|-------------|---------------------------------------------|  
| PinHistoryID | VARCHAR(20) | PRIMARY KEY |  
| StreamingProfileID | VARCHAR(20) | FOREIGN KEY REFERENCES StreamingProfiles(StreamingProfileID) |  
| OldEncryptedPIN | TEXT | NOT NULL |  
| NewEncryptedPIN | TEXT | NOT NULL |  
| ChangedBy | VARCHAR(20) | FOREIGN KEY REFERENCES Users(UserID) |  
| ChangedAt | TIMESTAMP | NOT NULL |

---

#### Indexes

- StreamingProfileID

---

#### Business Rules

Every PIN change creates a new history record.

PIN history must never be deleted.

---

### 14. Notifications

#### Purpose

Stores notifications generated by the system.

Notifications are displayed on the Dashboard and Task Center.

---

#### Primary Key

NotificationID

---

#### Columns

| Column | Data Type | Constraints |  
|----------|-------------|---------------------------------------------|  
| NotificationID | VARCHAR(20) | PRIMARY KEY |  
| Type | VARCHAR(50) | NOT NULL |  
| Message | TEXT | NOT NULL |  
| RelatedEntity | VARCHAR(30) | NULL |  
| RelatedEntityID | VARCHAR(20) | NULL |  
| Status | VARCHAR(20) | NOT NULL DEFAULT 'Unread' |  
| CreatedAt | TIMESTAMP | NOT NULL |  
| ReadAt | TIMESTAMP | NULL |

---

#### Indexes

- Status  
- Type  
- CreatedAt

---

#### Example Notification Types

- Subscription Expiring  
- Subscription Expired  
- Profile Full  
- Master Account Dead  
- PIN Change Required  
- Customer Waiting Approval

---

### 15. ActivityLog

#### Purpose

Stores an audit trail of every important action performed inside SubscriptionOS.

ActivityLog is append-only.

No records are ever modified or deleted.

---

#### Primary Key

LogID

---

#### Columns

| Column | Data Type | Constraints |  
|----------|-------------|---------------------------------------------|  
| LogID | VARCHAR(20) | PRIMARY KEY |  
| UserID | VARCHAR(20) | FOREIGN KEY REFERENCES Users(UserID) |  
| Action | VARCHAR(100) | NOT NULL |  
| Entity | VARCHAR(50) | NOT NULL |  
| EntityID | VARCHAR(20) | NOT NULL |  
| Details | TEXT | NULL |  
| IPAddress | VARCHAR(45) | NULL |  
| CreatedAt | TIMESTAMP | NOT NULL |

---

#### Indexes

- UserID  
- Entity  
- CreatedAt

---

#### Example Actions

- Customer Created  
- Customer Updated  
- Customer Archived  
- Subscription Created  
- Subscription Renewed  
- Customer Assigned  
- Customer Moved  
- Profile PIN Changed  
- Master Account Archived  
- Product Price Updated  
- Login  
- Logout  
- Settings Updated

---

### Database Audit Rules

Every business-critical operation must generate an ActivityLog record.

Operations that require logging include:

- Login  
- Customer creation  
- Customer update  
- Subscription creation  
- Subscription renewal  
- Customer assignment  
- Customer movement  
- PIN change  
- Revenue creation  
- Product update  
- Master Account update  
- System settings modification

No ActivityLog records may be edited or deleted.  
### Database Relationships

| Parent Table | Relationship | Child Table |  
|--------------|--------------|-------------|  
| Users | 1 → Many | ActivityLog |  
| Users | 1 → Many | Revenue |  
| Users | 1 → Many | RenewalHistory |  
| Users | 1 → Many | PinHistory |  
| Customers | 1 → Many | Subscriptions |  
| Products | 1 → Many | Subscriptions |  
| ServiceTypes | 1 → Many | Products |  
| MasterAccounts | 1 → Many | Services |  
| ServiceTypes | 1 → Many | Services |  
| Services | 1 → Many | StreamingProfiles |  
| Subscriptions | 1 → Many | Assignments |  
| StreamingProfiles | 1 → Many | Assignments |  
| Subscriptions | 1 → Many | Revenue |  
| Subscriptions | 1 → Many | RenewalHistory |  
| StreamingProfiles | 1 → Many | PinHistory |

---

### Referential Integrity Rules

The database must enforce Foreign Key constraints on every relationship.

A parent record cannot be permanently deleted while child records exist.

Instead of deletion, records must be archived.

Examples:

- Customers are archived.  
- Products are archived.  
- Master Accounts are archived.  
- Streaming Profiles are archived.  
- Subscriptions are archived.

Historical records must always remain valid.

---

### Database Constraints

#### Customer

Phone number must be unique.

---

#### Product

Product Code must be unique.

---

#### Master Account

Email address must be unique.

---

#### Service

Only one Service of the same Service Type may exist inside a Master Account.

Example:

Netflix Account #12

✓ Netflix Shared

✓ Prime Shared

✗ Netflix Shared (duplicate)

---

#### Streaming Profile

Capacity must always be greater than zero.

Profile names only need to be unique within the same Service.

Example:

Netflix Service

Profile 1

Profile 2

Profile 3

Prime Service

Profile 1

Profile 2

This is valid.

---

#### Assignment

Only one Active Assignment may exist for one Subscription.

Previous Assignments remain stored as historical records.

Moving a customer must:

1. Close the current Assignment.  
2. Set EndedAt.  
3. Create a new Assignment.  
4. Log the action.

---

#### Revenue

Revenue records cannot be edited after creation.

Corrections must be recorded as adjustment entries.

---

#### Activity Log

ActivityLog is append-only.

Records cannot be modified.

Records cannot be deleted.

---

### Assignment Rules

Assignment is the single source of truth for customer placement.

Subscriptions never store:

- Streaming Profile  
- Master Account  
- PIN  
- Service

Those are determined through the current Active Assignment.

---

### Capacity Rules

Before creating an Assignment the system must verify:

1. Streaming Profile exists.  
2. Profile is Active.  
3. Master Account is Active.  
4. Service is Active.  
5. Profile capacity has available space.

If any validation fails:

Assignment must not be created.

---

### Concurrency Rules

Assignment creation must execute inside a database transaction.

The selected Streaming Profile must be locked during assignment.

Example:

Admin A creates a Subscription.

↓

Streaming Profile is locked.

↓

Admin B attempts another Subscription.

↓

Admin B waits until Admin A finishes.

↓

Capacity is recalculated.

↓

Assignment proceeds only if space is still available.

This guarantees profile capacity can never be exceeded.

---

### Search Strategy

SubscriptionOS uses PostgreSQL Full-Text Search.

Search supports:

- Customer Name  
- Phone Number  
- Username  
- Product Name  
- Master Account Email  
- Master Account Nickname  
- Streaming Profile Name  
- Subscription ID

Target search time:

Less than 1 second for databases containing up to:

- 10,000 Customers  
- 25,000 Subscriptions  
- 1,000 Master Accounts

---

### Performance Targets

| Operation | Target Time |  
|------------|-------------|  
| Login | < 2 seconds |  
| Dashboard Load | < 3 seconds |  
| Search | < 1 second |  
| Create Customer | < 10 seconds |  
| Create Subscription | < 30 seconds |  
| Renew Subscription | < 15 seconds |  
| Move Customer | < 20 seconds |  
| Change PIN | < 15 seconds |

---

### Data Retention Policy

SubscriptionOS never permanently deletes business data.

Archived records remain available for reports and audit history.

Long-term history tables (ActivityLog, RenewalHistory, PinHistory) may be archived into yearly archive tables when required for performance.

Archived data must remain accessible.

---

### Security Rules

#### User Passwords

Stored using bcrypt hashing.

Passwords are never recoverable.

---

#### Master Account Passwords

Stored using AES encryption.

Visible only to authorized users.

---

#### Streaming Profile PINs

Stored using AES encryption.

Visible only to authorized users.

---

#### Database Access

Only the backend server may communicate directly with PostgreSQL.

Clients never access the database directly.

---

### Future Version Support

The schema has been designed to support future expansion without major redesign.

Planned Version 2 features include:

- Bundle Products  
- Customer Portal  
- Payment Gateway Integration  
- WhatsApp Integration  
- Email Notifications  
- Multi-language Support  
- Mobile Application  
- Automatic Renewal Reminders  
- AI Business Analytics

---

### Version

Document Version: 1.0

Status: Approved for Development

## 5. Entity Relationship Diagram


#### Purpose

This document defines the relationships between every entity in SubscriptionOS.

It serves as the source document for generating:

- Database ER Diagram  
- PostgreSQL schema  
- Prisma models  
- Drizzle ORM schema  
- Entity Framework models

This document must remain consistent with the Database Schema.

---

### Core Entity Relationship

```  
Customer  
    │  
    │ 1  
    │  
    └──────────────< Subscription >────────────── Product  
                          │  
                          │ 1  
                          │  
                          ▼  
                     Assignment  
                          │  
                          │  
                          ▼  
                 StreamingProfile  
                          │  
                          ▼  
                       Service  
                          │  
                          ▼  
                   MasterAccount  
                          ▲  
                          │  
                     ServiceType  
```

---

### Relationship Details

#### Customer → Subscription

Relationship

One Customer may own many Subscriptions.

One Subscription belongs to exactly one Customer.

### Example

John

├── Netflix Shared

├── Prime Shared

└── Spotify

---

#### Product → Subscription

Relationship

One Product may be purchased by many Customers.

Each Subscription references exactly one Product.

### Example

Netflix Premium Shared

↓

250 Active Subscriptions

---

#### ServiceType → Product

Relationship

Every Product belongs to one Service Type.

Examples

Netflix Premium Shared

↓

Netflix Shared

Spotify Premium

↓

Spotify

> Bundle products are outside Version 1 and will introduce ProductServiceMap in a future release.

---

#### MasterAccount → Service

Relationship

One Master Account may provide multiple Services.

### Example

master@gmail.com

├── Netflix Shared

├── Prime Shared

└── Spotify

---

#### Service → StreamingProfile

Relationship

One Service contains multiple Streaming Profiles.

### Example

Netflix Shared

├── Profile 1

├── Profile 2

├── Profile 3

├── Profile 4

└── Profile 5

Prime Shared

├── Profile 1

├── Profile 2

├── Profile 3

├── Profile 4

├── Profile 5

└── Profile 6

---

#### StreamingProfile → Assignment

Relationship

One Streaming Profile may have many historical Assignments.

Only Active Assignments consume profile capacity.

Historical Assignments remain permanently stored.

---

#### Subscription → Assignment

Relationship

One Subscription may have many historical Assignments.

Exactly one Assignment may be Active at any time.

Changing a customer's Streaming Profile creates a new Assignment rather than modifying an existing one.

Assignment is the single source of truth for customer placement.

---

#### Subscription → Revenue

Relationship

One Subscription may generate multiple Revenue records.

Revenue is created when:

- Subscription is purchased  
- Subscription is renewed

Revenue history is immutable.

---

#### Subscription → RenewalHistory

Relationship

Every renewal creates one Renewal History record.

Previous renewals are never modified or deleted.

---

#### StreamingProfile → PinHistory

Relationship

Every PIN change creates one PIN History record.

PIN history is append-only.

---

#### User → ActivityLog

Relationship

Every important system action is recorded.

Examples include:

- Customer Created  
- Subscription Created  
- Subscription Renewed  
- Customer Moved  
- PIN Changed  
- Product Updated  
- Login

---

### Cardinality Summary

| Parent | Relationship | Child |  
|----------|-------------|--------|  
| Customer | 1 → Many | Subscription |  
| Product | 1 → Many | Subscription |  
| ServiceType | 1 → Many | Product |  
| MasterAccount | 1 → Many | Service |  
| Service | 1 → Many | StreamingProfile |  
| Subscription | 1 → Many | Assignment |  
| StreamingProfile | 1 → Many | Assignment |  
| Subscription | 1 → Many | Revenue |  
| Subscription | 1 → Many | RenewalHistory |  
| StreamingProfile | 1 → Many | PinHistory |  
| User | 1 → Many | ActivityLog |

---

### Entity Responsibilities

#### Subscription

Stores the commercial purchase.

Contains:

- Customer  
- Product  
- Dates  
- Amount Paid

Does **not** store:

- Streaming Profile  
- Master Account  
- PIN  
- Service

Those belong to the Assignment entity.

---

#### Assignment

Stores where the customer is currently placed.

Changing accounts never changes Subscription.

Instead:

Old Assignment

↓

Closed

↓

New Assignment Created

This preserves complete placement history.

---

#### StreamingProfile

Represents an actual streaming profile inside a Service.

Examples

Netflix Profile 1

Netflix Profile 2

Prime Profile 4

Spotify Slot 2

Each Streaming Profile has:

- Capacity  
- PIN  
- Status

---

#### Service

Represents a streaming service within a Master Account.

Examples

Netflix Shared

Netflix Private

Prime Shared

Spotify

A Service contains one or more Streaming Profiles.

---

#### MasterAccount

Represents the actual purchased subscription account.

Examples

Netflix Account #12

Prime Account #8

Spotify Family #5

A Master Account may provide multiple Services.

---

### Business Rules

BR-001

Assignment is the single source of truth for customer placement.

---

BR-002

Only one Active Assignment may exist for one Subscription.

---

BR-003

Moving a customer closes the previous Assignment and creates a new one.

---

BR-004

Historical Assignments are never deleted.

---

BR-005

Revenue records are immutable.

---

BR-006

PIN History is immutable.

---

BR-007

Activity Log is append-only.

---

BR-008

Streaming Profile capacity is calculated using only Active Assignments.

---

BR-009

A Streaming Profile belongs to exactly one Service.

---

BR-010

A Service belongs to exactly one Master Account.

---

### Version 2 Extension

Bundle Products (e.g. Netflix \+ Prime Combo) will allow multiple concurrent Active Assignments under a single Subscription.

This feature is intentionally excluded from Version 1 to keep the data model simple while remaining extensible.

---

### Next Step

This document will be used to generate:

- dbdiagram.io DBML  
- PostgreSQL Database  
- Prisma Schema  
- Drizzle ORM Schema  
- Entity Framework Models

No manual changes should be made to generated schemas.

## 6. Business Rules


#### Purpose

This document defines the mandatory business rules that SubscriptionOS must enforce.

Business rules always take precedence over user input.

If user input violates a business rule, the requested operation must be rejected.

---

### Customer Rules

#### BR-001 — Unique Customer Identity

Every customer is primarily identified by their phone number.

The system must prevent duplicate customer records with the same phone number.

---

#### BR-002 — Soft Duplicate Detection

Duplicate usernames or customer names should generate a warning but must not automatically block customer creation.

The administrator decides whether to continue.

---

#### BR-003 — Multiple Subscriptions

One customer may own multiple subscriptions.

Example

John

- Netflix Shared  
- Prime Shared  
- Spotify Premium

---

#### BR-004 — Customer Archive

Customers must never be permanently deleted.

Customers are archived instead.

Archived customers remain available in reports and historical records.

---

#### BR-005 — Customer History

Every customer's complete subscription history must remain permanently available.

---

#### BR-006 — Pending Customer Approval

Customers submitted through external sources (Google Forms, Messenger, etc.) are stored as Pending Customers.

Only approved Pending Customers become official Customer records.

---

#### BR-007 — Duplicate Pending Customers

If a Pending Customer already exists with the same phone number, the system must notify the administrator instead of creating another Pending Customer record.

---

### Product Rules

#### BR-008 — Product Availability

Products may be Active or Archived.

Archived products cannot be selected when creating new subscriptions.

Existing subscriptions remain unaffected.

---

#### BR-009 — Product Price

Every Product has a default selling price.

The administrator may override the selling price when creating a subscription.

The actual charged amount is stored inside the Subscription.

---

#### BR-010 — Product Duration

Every Product has a fixed duration measured in days.

Examples

30 Days

90 Days

365 Days

---

#### BR-011 — Service Type

Every Product belongs to exactly one Service Type in Version 1.

Examples

Netflix Shared

Netflix Private

Prime Shared

Spotify Premium

---

#### BR-012 — Future Bundle Products

Support for bundle products (such as Netflix \+ Prime) is planned for Version 2.

Bundle products are outside the scope of Version 1.

---

### Master Account Rules

#### BR-013 — Multiple Services

One Master Account may provide multiple Services.

Example

Netflix Account #12

- Netflix Shared  
- Prime Shared  
- Spotify

---

#### BR-014 — Unique Email

Each Master Account email address must be unique.

---

#### BR-015 — Dead Accounts

A Master Account marked as Dead cannot receive new customer assignments.

---

#### BR-016 — Existing Customers

Customers already assigned to a Dead Master Account remain assigned until manually moved.

---

#### BR-017 — Archived Accounts

Archived Master Accounts cannot receive new Services or new Assignments.

Historical data remains accessible.

---

#### BR-017a — Archiving an Account with Active Customers

A Master Account cannot be Archived while it has one or more Active Assignments underneath it.

Marking an account Dead does not require moving customers first (BR-016) — Dead only blocks *new* assignments.

Archiving is stricter: the administrator must move (or the system must confirm zero) active customers before an account can move from Dead to Archived. The UI must block the Archive action and list the affected Streaming Profiles/customers if any remain.

*(Gap identified during review — previously Dead accounts and Archived accounts had no distinct rule for existing occupancy.)*

---

### Service Rules

#### BR-018 — Ownership

Every Service belongs to exactly one Master Account.

---

#### BR-019 — Service Type

Every Service belongs to exactly one Service Type.

---

#### BR-020 — Service Status

Only Active Services may receive new customer assignments.

Disabled Services remain available for historical reference.

---

### Streaming Profile Rules

#### BR-021 — Ownership

Every Streaming Profile belongs to exactly one Service.

---

#### BR-022 — Capacity

Every Streaming Profile has a configurable maximum customer capacity.

Example

Netflix Profile 1

Capacity \= 3

---

#### BR-023 — Capacity Enforcement

The number of Active Assignments must never exceed the configured Profile Capacity.

---

#### BR-024 — Occupancy Calculation

Only Active Assignments count toward Profile Occupancy.

Expired, Cancelled, Suspended, or Closed Assignments do not consume capacity.

---

#### BR-025 — Profile Status

Only Active Streaming Profiles may receive new customer assignments.

---

#### BR-026 — PIN Changes

Changing a Streaming Profile PIN must never remove customers from that profile.

---

#### BR-027 — PIN History

Every PIN change creates exactly one Pin History record.

PIN History is append-only.

---

#### BR-028 — Profile Archive

Streaming Profiles are never permanently deleted.

Archived Profiles remain available for historical records.

### Subscription Rules

#### BR-029 — Customer Ownership

Every Subscription belongs to exactly one Customer.

A Subscription cannot exist without a valid Customer.

---

#### BR-030 — Product Ownership

Every Subscription belongs to exactly one Product.

---

#### BR-031 — Subscription Status

A Subscription may have one of the following statuses:

- Active  
- Expired  
- Cancelled  
- Suspended  
- Archived

---

#### BR-032 — Start Date

Every Subscription must have a Start Date.

---

#### BR-033 — Expiry Date

Every Subscription must have an Expiry Date.

The Expiry Date must always be later than the Start Date.

---

#### BR-034 — Amount Paid

Every Subscription stores the actual amount paid by the customer.

This value may differ from the Product's default price.

---

#### BR-035 — Subscription History

Subscriptions are never permanently deleted.

Historical subscriptions remain available for reporting and auditing.

---

#### BR-036 — Subscription Renewal

Renewing a Subscription extends its Expiry Date.

The renewal must also create:

- One Renewal History record.  
- One Revenue record.

---

#### BR-037 — Expired Subscription

When a Subscription expires:

- Its Active Assignment must automatically become Closed.  
- The occupied Streaming Profile seat becomes available.  
- The Subscription status changes to Expired.

---

#### BR-038 — Cancelled Subscription

Cancelling a Subscription immediately closes its Active Assignment.

The Streaming Profile capacity is released.

Historical records remain unchanged.

---

### Assignment Rules

#### BR-039 — Source of Truth

Assignment is the single source of truth for customer placement.

The Subscription table must never store:

- Master Account  
- Service  
- Streaming Profile  
- PIN

Current placement is determined only by the Active Assignment.

---

#### BR-040 — Automatic Assignment

When a Subscription is created, the system automatically searches for the best available Streaming Profile.

---

#### BR-041 — Assignment Validation

Before creating an Assignment, the system must verify:

- Master Account is Active.  
- Service is Active.  
- Streaming Profile is Active.  
- Streaming Profile has available capacity.

If any validation fails, the Assignment must not be created.

---

#### BR-042 — Ignore Invalid Targets

The Assignment Engine must ignore:

- Dead Master Accounts  
- Archived Master Accounts  
- Disabled Services  
- Archived Services  
- Disabled Streaming Profiles  
- Full Streaming Profiles

---

#### BR-043 — Assignment Strategy

If multiple Streaming Profiles are available, the system uses the configured Assignment Strategy.

Supported strategies:

- Lowest Occupancy  
- Fill First

The strategy is configurable in System Settings.

---

#### BR-044 — No Available Profile

If no valid Streaming Profile is available:

- No Assignment is created.  
- The Subscription remains unassigned.  
- The administrator is notified.

---

#### BR-045 — Customer Movement

Moving a customer never edits an existing Assignment.

Instead the system must:

1. Close the current Assignment.  
2. Record EndedAt.  
3. Create a new Assignment.  
4. Record the reason.  
5. Log the activity.

---

#### BR-046 — Assignment History

Assignment history is permanent.

Assignments are never modified after being closed.

Assignments are never deleted.

---

#### BR-047 — Active Assignment Rule

A Subscription may have many historical Assignments.

Only ONE Assignment may be Active at any time.

This rule is enforced by the database.

---

#### BR-048 — Capacity Protection

The system must never allow Profile Capacity to be exceeded.

Assignment creation must fail if capacity has been reached.

---

#### BR-049 — Concurrent Assignment Protection

Assignment creation must execute inside a database transaction.

The selected Streaming Profile must be locked until the transaction completes.

This prevents two administrators from assigning customers to the same final seat simultaneously.

---

#### BR-050 — Occupancy Calculation

Streaming Profile Occupancy is calculated using only Active Assignments.

Historical Assignments never contribute to occupancy.

---

### Revenue Rules

#### BR-051 — Automatic Revenue

Creating a paid Subscription automatically creates one Revenue record.

---

#### BR-052 — Renewal Revenue

Every paid renewal automatically creates one additional Revenue record.

---

#### BR-053 — Revenue Immutability

Revenue records are immutable.

Existing Revenue records cannot be edited or deleted.

Corrections must be recorded as adjustment entries.

---

#### BR-054 — Revenue History

Revenue history must remain permanently available.

---

#### BR-055 — Payment Method

Every Revenue record must store the payment method used.

Examples:

- eSewa  
- Khalti  
- Bank Transfer  
- Cash

---

#### BR-056 — Audit Trail

Every Subscription creation, renewal, cancellation, Assignment creation, Assignment movement, and Revenue creation must be recorded in the Activity Log.  
### Notification Rules

#### BR-057 — Automatic Notifications

The system shall automatically generate notifications for important operational events.

---

#### BR-058 — Expiring Subscriptions

The system shall notify administrators when a Subscription is approaching expiry.

Default reminder periods:

- Today  
- Tomorrow  
- 3 Days Remaining

Reminder periods must be configurable in System Settings.

---

#### BR-059 — Expired Subscriptions

When a Subscription expires, an Expired Subscription notification shall be created automatically.

---

#### BR-060 — Full Streaming Profiles

When a Streaming Profile reaches its maximum capacity, the system shall create a Full Profile notification.

---

#### BR-061 — Dead Master Accounts

When a Master Account is marked as Dead, the system shall create a notification indicating that customers require reassignment.

---

#### BR-062 — Notification Status

Every Notification must have one of the following statuses:

- Unread  
- Read  
- Archived

Notifications are never permanently deleted.

---

### Search Rules

#### BR-063 — Global Search

The system shall provide a single Global Search capable of searching:

- Customers  
- Products  
- Master Accounts  
- Services  
- Streaming Profiles  
- Subscriptions

---

#### BR-064 — Partial Matching

Search must support partial matching.

Example

Searching

```  
net  
```

should return

- Netflix Shared  
- Netflix Private

---

#### BR-065 — Search Fields

Customer search should support:

- Name  
- Phone Number  
- Username

Subscription search should support:

- Subscription ID  
- Customer Name  
- Product

Master Account search should support:

- Email  
- Nickname

---

#### BR-066 — Search Performance

Under normal operating conditions, Global Search should return results within five seconds.

---

### Security Rules

#### BR-067 — Authentication

Every user must log in before accessing the system.

Anonymous access is not permitted.

---

#### BR-068 — Password Storage

User passwords must never be stored in plain text.

Passwords must be securely hashed before storage.

---

#### BR-069 — Streaming Account Credentials

Master Account passwords must be stored using reversible encryption.

Only authorized users may decrypt and view these credentials.

---

#### BR-070 — Authorization

Every action must respect the user's assigned role.

---

#### BR-071 — Owner Permissions

The Owner has unrestricted access to every module and system setting.

---

#### BR-072 — Admin Permissions

Administrators may perform daily business operations but cannot:

- Modify system settings  
- Manage user accounts  
- Delete archived data  
- Change assignment strategies

---

#### BR-073 — Data Protection

Sensitive business information shall only be visible to authorized users.

Examples include:

- Master Account passwords  
- Streaming Profile PINs  
- Customer phone numbers

---

### Activity Log Rules

#### BR-074 — Audit Logging

Every important operation must create an Activity Log record.

---

#### BR-075 — Logged Events

Examples include:

- Login  
- Customer Created  
- Customer Edited  
- Customer Archived  
- Subscription Created  
- Subscription Renewed  
- Subscription Cancelled  
- Customer Moved  
- PIN Changed  
- Product Updated  
- Master Account Updated  
- Settings Changed

---

#### BR-076 — Immutable Logs

Activity Log records are append-only.

Existing log records cannot be edited or deleted.

---

#### BR-077 — Log Information

Every Activity Log record must contain:

- User  
- Action  
- Entity  
- Entity ID  
- Timestamp

---

### User Rules

#### BR-078 — User Status

Users may be:

- Active  
- Disabled

Disabled users cannot log into the system.

---

#### BR-079 — Role Assignment

Every user must have exactly one role.

Supported roles in Version 1:

- Owner  
- Admin

---

#### BR-080 — Session Ownership

Every operation performed within the system must be associated with the currently logged-in user.

This information shall be recorded in the Activity Log whenever applicable.  
### General System Rules

#### BR-081 — Single Source of Truth

Every piece of business information must have exactly one authoritative source.

Examples:

- Current customer placement → Assignments  
- Product price → Products  
- Customer details → Customers  
- Profile PIN → Profiles

Duplicate copies of the same business data must not exist.

---

#### BR-082 — Automatic ID Generation

The system automatically generates every primary key.

Users must never manually enter IDs.

Examples:

- CUS-000001  
- SUB-000001  
- MA-000001  
- PRO-000001

---

#### BR-083 — Nepal Time

All dates and timestamps shall use the Asia/Kathmandu time zone.

---

#### BR-084 — Auditability

Every business operation must be traceable.

The system must always be able to answer:

- Who performed the action?  
- What action was performed?  
- When was it performed?

---

#### BR-085 — Soft Delete Policy

Operational records must never be permanently deleted.

Records are archived instead.

This applies to:

- Customers  
- Products  
- Master Accounts  
- Services  
- Profiles  
- Subscriptions

Historical records remain available for reporting.

---

#### BR-086 — Historical Records

Historical tables are append-only.

This includes:

- Assignments  
- Revenue  
- Renewal History  
- PIN History  
- Activity Log

Existing historical records must never be modified.

---

### Data Integrity Rules

#### BR-087 — Foreign Key Integrity

Every foreign key must reference an existing parent record.

The database must reject orphan records.

---

#### BR-088 — Required Fields

Required fields must never be empty.

Validation must occur before data is saved.

---

#### BR-089 — Valid Status Values

Every status field must contain only predefined values.

Example:

Subscription Status

- Active  
- Expired  
- Cancelled  
- Suspended  
- Archived

---

#### BR-090 — Database Transactions

Operations involving multiple tables must execute inside a single database transaction.

Examples:

- Create Subscription  
- Renew Subscription  
- Move Customer  
- Change Profile PIN

If any step fails, the entire transaction must be rolled back.

---

#### BR-091 — Concurrency Protection

Operations that allocate Streaming Profiles must lock the selected Profile until the transaction finishes.

This prevents multiple administrators from assigning the same available seat simultaneously.

---

#### BR-092 — Validation Before Save

Business rules must be validated before any database changes occur.

Invalid operations must be rejected without modifying existing data.

---

### Performance Rules

#### BR-093 — Dashboard Performance

The Dashboard should load within five seconds under normal operating conditions.

---

#### BR-094 — Customer Search Performance

Customer searches should return results within five seconds.

---

#### BR-095 — Assignment Performance

Automatic profile assignment should complete within five seconds.

---

#### BR-096 — Efficient Queries

The system should use indexed database queries wherever possible.

Large table scans should be avoided unless absolutely necessary.

---

### Automation Rules

#### BR-097 — Automatic Expiry Processing

The system shall automatically identify expired subscriptions on a scheduled basis.

Expired subscriptions shall:

- Update Subscription Status  
- Close the Active Assignment  
- Release Profile Capacity  
- Generate required notifications

---

#### BR-098 — Automatic Notifications

Notifications should be created automatically whenever their triggering conditions are met.

Administrators should not create operational notifications manually.

---

### Version Scope Rules

#### BR-099 — Version 1 Scope

Version 1 includes:

- Dashboard  
- Customer Management  
- Product Management  
- Master Account Management  
- Service Management  
- Profile Management  
- Subscription Management  
- Assignment Engine  
- Revenue  
- Reports  
- Credential Center  
- Task Center  
- Notifications  
- Activity Log  
- User Management

The system is designed for approximately 2–3 administrators managing a single business.

---

#### BR-100 — Future Expansion

The system architecture should support future features without major database redesign.

Examples include:

- Bundle Products  
- Customer Portal  
- Mobile Application  
- WhatsApp Integration  
- Payment Gateway Integration  
- Email Automation  
- AI-powered Customer Support  
- Multi-business (Multi-tenant) Support  
- Advanced Analytics

Future features must not require breaking changes to the existing database schema.

---

### Final Principle

Every feature implemented in SubscriptionOS must satisfy three objectives:

1. Protect business data.  
2. Reduce manual work.  
3. Preserve complete historical records.

If a feature conflicts with these principles, the implementation must follow these principles rather than convenience.

## 7. UI/UX Specification

### Purpose

This document defines every screen in SubscriptionOS. Each screen includes purpose, components, tables, forms, actions, and navigation.

This version aligns with the full 17-module PRD and the v1.1 data model (Section 3–4) — the Task Center, Pending Customer Management, Credential Center, and Global Search screens were part of the PRD but had not previously been specified at the UI layer.

---

### Global Layout

- Persistent left sidebar navigation (collapsible on mobile → bottom nav)
- Sticky top bar containing: Global Search, Notification Bell, User Menu
- Every list screen: Search + Filter + primary action button, top-right
- Every list screen: sortable table with pagination (default 25 rows)
- Every detail screen: Back button, top-left
- Destructive or state-changing actions (Archive, Mark Dead, Change PIN) always show a confirmation dialog naming what will be affected
- Every successful action shows a toast notification
- Dark mode supported via a single design-token theme (no separate dark-mode components)

---

### 1. Login

**Purpose:** Authenticate an administrator.

**Fields:** Email, Password

**Buttons:** Login

**Future:** Forgot Password (Version 2 — requires email delivery, currently out of scope)

---

### 2. Task Center *(first screen after login)*

**Purpose:** Show every action requiring administrator attention today. This is the operational home screen — the Dashboard (below) is the analytical overview.

**Sections, each a collapsible list with a count badge:**

| Section | Source |
|---|---|
| Pending Customer Approvals | `PendingCustomers` where Status = Pending |
| Renewals Due Today / Tomorrow | `Subscriptions` where ExpiryDate ≤ today+1 and Status = Active |
| Expired Subscriptions | `Subscriptions` where Status = Expired |
| Dead Master Accounts | `MasterAccounts` where Status = Dead |
| Full Streaming Profiles | `StreamingProfiles` where occupancy = Capacity |
| PIN Changes Required | flagged manually or by Settings-defined rotation policy |

Each row has an inline action button (Approve/Reject, Renew, Move, View) so common tasks resolve without leaving the Task Center.

---

### 3. Dashboard

**Purpose:** Real-time business overview (read-only, analytical).

**Cards:** Today's Revenue · Monthly Revenue · Active Customers · Active Subscriptions · Expiring Today · Expiring Tomorrow · Full Streaming Profiles · Dead Master Accounts

**Sections:** Recent Activity (latest 20 entries from Activity Log) · Revenue trend chart (last 30 days)

**Quick Actions:** New Customer · New Subscription · Renew · Search · Refresh Dashboard

---

### 4. Global Search

**Purpose:** Search across the whole business from anywhere in the app (top bar, always visible).

**Behavior:** Results grouped by entity type (Customers, Subscriptions, Products, Master Accounts, Streaming Profiles) as the admin types, ranked by relevance via Postgres full-text search (Section 4, Search Strategy). Target: results in under 1 second (NFR, Section 2 §4).

Selecting a result navigates directly to that record's detail screen.

---

### 5. Customers

**Purpose:** Manage all approved customers.

**Top bar:** Search · Filter (Status, Platform) · Add Customer

**Table:** Customer ID · Name · Phone · Username · Active Subscriptions · Status

**Row actions:** View · Edit · Archive

---

### 6. Customer Details

**Sections:** Customer Information · Subscription History · Assignment History · Revenue History · Notes

**Buttons:** Renew · Move Customer · Generate Credentials (opens Credential Center pre-filled for this customer) · Archive

---

### 7. Pending Customers

**Purpose:** Review customer requests submitted through external intake (Google Form, Messenger scraper, manual entry) before they become official Customer records (BR-006).

**Table:** Name · Phone · Platform · Requested Product · Submitted At · Status

**Row actions:** Approve (creates a Customer record and prompts to start a Subscription) · Reject (with a reason, logged)

**Duplicate handling:** if a Pending record already exists for the same phone number, the Add flow updates that record instead of creating a duplicate (BR-007) and the UI surfaces this inline — "already pending, submitted 2 hours ago" — rather than silently merging.

---

### 8. Products

**Table:** Code · Name · Price · Duration · Service Type · Status

**Buttons:** Add Product · Edit · Archive

---

### 9. Master Accounts

**Table:** Nickname · Email · Status · Services · Overall Occupancy

**Buttons:** Add · Edit · Mark Dead · Archive *(Archive disabled with a tooltip if any Active Assignment exists underneath — BR-017a)*

---

### 10. Master Account Details

**Sections:** Account Info (Email; Password shown masked with a "Reveal" action that requires re-auth and is itself logged to the Activity Log) · Services list, each showing Streaming Profile count and occupancy

**Buttons:** Edit · Mark Dead · Archive

---

### 11. Streaming Profiles

**Purpose:** Manage profiles within a Service.

**Table:** Profile Name · Capacity · Occupied · Status *(PIN not shown in the list view — see Profile Details)*

**Buttons:** Add Profile · Change PIN · View Customers

---

### 12. Streaming Profile Details

**Sections:** Profile Info (PIN shown masked with "Reveal," logged like Master Account passwords) · Current Customers (from Active Assignments) · PIN History · Assignment History

**Buttons:** Change PIN · Move Customer

---

### 13. Subscriptions

**Table:** Subscription ID · Customer · Product · Start Date · Expiry Date · Status

**Buttons:** New Subscription · Renew · Cancel

**New Subscription flow:** select Customer → select Product → system runs the Assignment Engine automatically (Section 6, Assignment Rules) → confirm → Credential Center opens automatically with the result pre-filled.

---

### 14. Credential Center

**Purpose:** Generate a ready-to-send message containing a customer's access details, without the admin retyping anything.

**Inputs:** Subscription (pre-filled when opened from a flow) · Template (from Settings)

**Preview pane** shows the assembled message: Customer Name · Product · Master Account Email · Master Account Password · Streaming Profile · PIN · Usage Rules

**Buttons:** Copy to Clipboard · Switch Template

Generating or copying credentials is itself an Activity Log entry (it exposes account secrets, so it's audited the same way a password reveal is).

---

### 15. Revenue

**Cards:** Today · This Month · This Year

**Table:** Date · Customer · Product · Amount · Payment Method

---

### 16. Reports

**Reports:** Revenue · Customers · Occupancy · Expiry · Products

**Export:** PDF · Excel · CSV

---

### 17. Notifications

**List:** grouped by type (Expiring · Expired · Full Profile · Dead Account · Failed Assignment · Pending Approval), each linking directly to the related record.

**Actions:** Mark as read · Mark all as read

---

### 18. Activity Log

**Table:** Time · User · Action · Entity · Details

Searchable and filterable by User, Entity, and date range. Read-only — no edit or delete affordance exists anywhere in the UI, matching BR-056's append-only rule.

---

### 19. Settings

**Sections:** Business Info · Products · Assignment Strategy (Lowest Occupancy / Fill First) · Credential Templates · User Management (Owner only) · System Preferences

**Buttons:** Save (per-section, not global — avoids one failed field blocking unrelated saves)

---

### Navigation (Sidebar)

```
Task Center
Dashboard
Customers
  └ Pending Customers
Subscriptions
Products
Master Accounts
  └ Streaming Profiles
Revenue
Reports
Notifications
Activity Log
Settings
```

---

### Design Guidelines

- Modern, minimal UI with dark mode support
- Mobile responsive down to a single-column layout
- Maximum three clicks to any major action (unchanged from v1 — still the design bar)
- Confirmation required before any destructive or capacity-affecting action
- Toast notifications for all successful actions
- Consistent button hierarchy: one primary action per screen, secondary actions as outline buttons
## 8. Screen Wireframes

These are layout wireframes, not final visual designs — their purpose is to define where every component belongs before frontend development begins. They correspond 1:1 to the screens in Section 7.

---

### 1. Login

```
+----------------------------------------------------+
|                   SubscriptionOS                    |
|                                                      |
|                     Email                            |
|            ________________________                |
|                                                      |
|                    Password                          |
|            ________________________                |
|                                                      |
|                   [ Login ]                          |
+----------------------------------------------------+
```

---

### 2. Task Center (first screen after login)

```
+-----------------------------------------------------------------+
| Sidebar |                Task Center                            |
+-----------------------------------------------------------------+
|         | Pending Customer Approvals (3)          [Approve][x]  |
|         | Renewals Due Today (2)                  [Renew]       |
|         | Renewals Due Tomorrow (4)                [Renew]      |
|         | Expired Subscriptions (1)                [View]       |
|         | Dead Master Accounts (1)                 [View]       |
|         | Full Streaming Profiles (2)               [View]      |
|         | PIN Changes Required (0)                              |
+-----------------------------------------------------------------+
```

---

### 3. Dashboard

```
+-----------------------------------------------------------------+
| Sidebar |                  Dashboard                            |
+-----------------------------------------------------------------+
| [Customers] [Revenue] [Expiring] [Full Profiles]                |
+-----------------------------------------------------------------+
|                    Revenue Trend (30d)                          |
+-----------------------------------------------------------------+
|                    Recent Activity                              |
|  John renewed Netflix                                           |
|  PIN changed on Profile 2                                       |
|  Customer added: Mike                                           |
+-----------------------------------------------------------------+
| [+ New Customer] [+ New Subscription] [Renew] [Search]          |
+-----------------------------------------------------------------+
```

---

### 4. Global Search (top-bar overlay, any screen)

```
+-----------------------------------------------------------------+
| Search: netfl_______________                              [x]  |
+-----------------------------------------------------------------+
| Customers (2)                                                   |
|   John Doe — 9801234567                                         |
| Products (1)                                                    |
|   Netflix Shared — Rs. 499 / 30 days                             |
| Master Accounts (3)                                              |
|   Netflix-01 — 12/15 occupied                                    |
+-----------------------------------------------------------------+
```

---

### 5. Customers

```
+-----------------------------------------------------------------+
| Customers                          Search ____  [Filter] [+Add] |
+-----------------------------------------------------------------+
| ID      Name      Phone       Platform    Active   Status       |
| CUS001  John       98012...   Messenger   2        Active       |
| CUS002  Mike       98045...   Instagram   1        Active       |
+-----------------------------------------------------------------+
|                              (View) (Edit) (Archive)             |
+-----------------------------------------------------------------+
```

---

### 6. Customer Details

```
+-----------------------------------------------------------------+
| < Back            Customer: John Doe                            |
+-----------------------------------------------------------------+
| Info: Phone, Platform, Notes                                    |
+-----------------------------------------------------------------+
| Subscriptions: Netflix Shared, Prime Shared                     |
+-----------------------------------------------------------------+
| Assignment History | Revenue History                            |
+-----------------------------------------------------------------+
| [Renew] [Move Customer] [Generate Credentials] [Archive]        |
+-----------------------------------------------------------------+
```

---

### 7. Pending Customers

```
+-----------------------------------------------------------------+
| Pending Customers                             Search ____       |
+-----------------------------------------------------------------+
| Name    Phone       Platform    Product         Submitted       |
| Sara    98099...    Messenger   Netflix Shared   2h ago  [Approve][Reject]
| ⚠ Ravi  98011...    Google Form Prime Shared     1d ago  (already pending — updated)
+-----------------------------------------------------------------+
```

---

### 8. Products

```
+-----------------------------------------------------------------+
| Products                                          [+ Add]       |
+-----------------------------------------------------------------+
| Code    Name              Price   Duration   Status             |
| NFSH1   Netflix Shared    499     30 days    Active             |
| PRSH1   Prime Shared      399     30 days    Active              |
+-----------------------------------------------------------------+
```

---

### 9. Master Accounts

```
+-----------------------------------------------------------------+
| Master Accounts                     Search ____                 |
+-----------------------------------------------------------------+
| Nickname     Email              Occupancy    Status              |
| Netflix-01   master@gmail.com   12 / 15       Active             |
+-----------------------------------------------------------------+
|                    (View) (Edit) (Mark Dead) (Archive*)          |
|                    *disabled while active customers remain       |
+-----------------------------------------------------------------+
```

---

### 10. Master Account Details

```
+-----------------------------------------------------------------+
| < Back        Master Account: Netflix-01                        |
+-----------------------------------------------------------------+
| master@gmail.com     Password: ●●●●●●●●  [Reveal]                |
+-----------------------------------------------------------------+
| Netflix Shared    — 5 profiles — 12/15 occupied                  |
| Netflix Private   — 2 profiles —  3/6  occupied                  |
+-----------------------------------------------------------------+
|                         (Edit) (Mark Dead) (Archive)              |
+-----------------------------------------------------------------+
```

---

### 11. Streaming Profiles (within a Service)

```
+-----------------------------------------------------------------+
| Netflix Shared — Streaming Profiles              [+ Add]        |
+-----------------------------------------------------------------+
| Profile     Capacity   Occupied   Status                        |
| Profile 1   3          3          Full                          |
| Profile 2   3          2          Available                     |
| Profile 3   3          1          Available                     |
+-----------------------------------------------------------------+
|                    (Change PIN) (View Customers)                 |
+-----------------------------------------------------------------+
```

---

### 12. Streaming Profile Details

```
+-----------------------------------------------------------------+
| < Back        Netflix — Profile 2                                |
+-----------------------------------------------------------------+
| PIN: ●●●●  [Reveal]     Capacity: 3     Occupied: 2               |
+-----------------------------------------------------------------+
| Current Customers: John, Mike                                    |
+-----------------------------------------------------------------+
| PIN History | Assignment History                                 |
+-----------------------------------------------------------------+
|                    (Change PIN) (Move Customer)                  |
+-----------------------------------------------------------------+
```

---

### 13. Subscriptions

```
+-----------------------------------------------------------------+
| Subscriptions                      Search ____   [+ New]        |
+-----------------------------------------------------------------+
| Customer   Product           Expiry    Status                   |
| John       Netflix Shared    12 Aug    Active                   |
+-----------------------------------------------------------------+
|                         (Renew) (Cancel)                         |
+-----------------------------------------------------------------+
```

---

### 14. Credential Center

```
+-----------------------------------------------------------------+
| Credential Center             Template: [Default ▾]              |
+-----------------------------------------------------------------+
| Preview:                                                         |
|  Hi John! Here are your Netflix Shared details:                  |
|  Login: master@gmail.com / ●●●●●●●●                               |
|  Profile: Profile 2 — PIN: ●●●●                                  |
|  Rules: Do not change the profile name or PIN.                   |
+-----------------------------------------------------------------+
|                         [ Copy to Clipboard ]                    |
+-----------------------------------------------------------------+
```

---

### 15. Revenue

```
+-----------------------------------------------------------------+
| Revenue      Today: Rs 2,400   Month: Rs 72,000   Year: Rs 620k  |
+-----------------------------------------------------------------+
| Customer   Product           Amount   Date       Method          |
| John       Netflix Shared    499      1 Aug      eSewa           |
+-----------------------------------------------------------------+
```

---

### 16. Reports

```
+-----------------------------------------------------------------+
| Reports                                                          |
| [Revenue] [Customers] [Occupancy] [Expiry] [Products]            |
+-----------------------------------------------------------------+
|                    Export:  [PDF] [Excel] [CSV]                   |
+-----------------------------------------------------------------+
```

---

### 17. Notifications

```
+-----------------------------------------------------------------+
| Notifications                             [Mark all read]        |
+-----------------------------------------------------------------+
| ⚠ John expires tomorrow                                          |
| ⚠ Netflix Profile 2 is full                                      |
| ⚠ Master Account "Prime-04" marked Dead                          |
| ⚠ 1 customer waiting for approval                                |
+-----------------------------------------------------------------+
```

---

### 18. Activity Log

```
+-----------------------------------------------------------------+
| Activity Log            Search ____   Filter: [User ▾][Entity ▾] |
+-----------------------------------------------------------------+
| Time        User    Action                Entity                |
| 14:30       Admin   Renew Subscription     Subscription SUB-001  |
| 14:12       Owner   Change PIN             Profile SPF-002       |
+-----------------------------------------------------------------+
```

---

### 19. Settings

```
+-----------------------------------------------------------------+
| Settings                                                          |
| Business  | Products | Assignment Strategy | Templates | Users  |
+-----------------------------------------------------------------+
|  [ section-specific form ]                                       |
|                            [ Save ]                                |
+-----------------------------------------------------------------+
```

---

### UI Notes

- Left sidebar navigation, sticky top bar with Global Search
- Every list screen supports sort and pagination
- Every detail screen has a Back button
- Task Center is the first screen after login; Dashboard is one click away
- Masked secrets (Master Account passwords, Profile PINs) never render in plaintext in a table or list view — only in a detail screen behind an explicit, logged "Reveal" action
## 9. API Specification

### Purpose

Defines every backend REST endpoint. Resource names below match the Database Schema (Section 4) exactly — `streaming-profiles`, not `profiles`; `service-types` and `services` are separate resources, matching the ServiceType/Service split introduced in v1.1.

**Base URL:** `/api/v1`

**Authentication:** every endpoint except `/auth/login` requires `Authorization: Bearer <JWT>`.

---

### Conventions

**Pagination** — all list endpoints accept `page` (default 1) and `pageSize` (default 25, max 100), and return:
```json
{
  "success": true,
  "data": [ /* items */ ],
  "pagination": { "page": 1, "pageSize": 25, "totalItems": 137, "totalPages": 6 }
}
```

**Success response**
```json
{ "success": true, "data": {} }
```

**Error response**
```json
{ "success": false, "error": { "code": "CUSTOMER_NOT_FOUND", "message": "Customer not found" } }
```

**Standard error codes:** `VALIDATION_ERROR` (400) · `UNAUTHORIZED` (401) · `FORBIDDEN` (403) · `NOT_FOUND` (404) · `CONFLICT` (409 — e.g. duplicate phone number, profile at capacity) · `INTERNAL_ERROR` (500)

**Rate limiting** — 100 requests/minute per authenticated user; exceeding it returns 429 with a `Retry-After` header. Generous by design — this is a 1–5 admin internal tool, not a public API; the limit exists to catch runaway frontend bugs, not to throttle real usage.

---

### Authentication

| Method | Path | Notes |
|---|---|---|
| POST | `/auth/login` | Body: `{ email, password }`. Returns `{ token, refreshToken, user }` |
| POST | `/auth/refresh` | Body: `{ refreshToken }`. Returns a new `token` |
| POST | `/auth/logout` | Invalidates the refresh token; logged to Activity Log |
| GET | `/auth/me` | Returns the current authenticated user |

```json
// POST /auth/login response
{
  "success": true,
  "data": {
    "token": "JWT_TOKEN",
    "refreshToken": "REFRESH_TOKEN",
    "user": { "id": "USR-000001", "name": "Admin", "role": "Owner" }
  }
}
```

*(v1.0 defined login but never specified how the "refresh supported" JWT claim from Section 10 was actually exposed — `/auth/refresh` closes that gap.)*

---

### Global Search

| Method | Path | Notes |
|---|---|---|
| GET | `/search?q=` | Returns grouped results across Customers, Products, Master Accounts, Streaming Profiles, Subscriptions. Postgres FTS-backed (Section 4, Search Strategy) |

---

### Dashboard & Task Center

| Method | Path |
|---|---|
| GET | `/dashboard` |
| GET | `/dashboard/activity` |
| GET | `/tasks` |

---

### Customers

| Method | Path | Notes |
|---|---|---|
| GET | `/customers` | Query: `page`, `search`, `status`, `platform` |
| GET | `/customers/{customerId}` | |
| POST | `/customers` | |
| PUT | `/customers/{customerId}` | |
| DELETE | `/customers/{customerId}` | Archives, never hard-deletes (BR-004) |
| GET | `/customers/{customerId}/subscriptions` | |
| GET | `/customers/{customerId}/revenue` | |

---

### Pending Customers

| Method | Path | Notes |
|---|---|---|
| GET | `/pending-customers` | Query: `status` |
| POST | `/pending-customers` | Intake endpoint — used by the Google Form webhook and the Messenger scraper pipeline alike. Enforces BR-007 duplicate-phone handling server-side, not just in the UI |
| POST | `/pending-customers/{id}/approve` | Creates a Customer record |
| POST | `/pending-customers/{id}/reject` | Body: `{ reason }` |

---

### Products

Standard CRUD at `/products`, `/products/{id}`. `DELETE` archives (BR-008).

---

### Master Accounts

| Method | Path | Notes |
|---|---|---|
| GET | `/master-accounts` | |
| GET | `/master-accounts/{id}` | |
| POST | `/master-accounts` | |
| PUT | `/master-accounts/{id}` | |
| DELETE | `/master-accounts/{id}` | Rejects with `409 CONFLICT` if any Active Assignment exists underneath (BR-017a) |
| POST | `/master-accounts/{id}/mark-dead` | |
| GET | `/master-accounts/{id}/reveal-password` | Requires re-authentication (short-lived step-up token); every call is written to the Activity Log |

---

### Service Types

| Method | Path |
|---|---|
| GET | `/service-types` |
| POST | `/service-types` |
| PUT | `/service-types/{id}` |

---

### Services

| Method | Path | Notes |
|---|---|---|
| GET | `/master-accounts/{masterAccountId}/services` | Nested under Master Account, matching the schema's FK |
| POST | `/master-accounts/{masterAccountId}/services` | Enforces the (MasterAccountID, ServiceTypeID) unique constraint |
| PUT | `/services/{id}` | |
| DELETE | `/services/{id}` | Archives |

---

### Streaming Profiles

| Method | Path | Notes |
|---|---|---|
| GET | `/services/{serviceId}/streaming-profiles` | |
| GET | `/streaming-profiles/{id}` | |
| POST | `/services/{serviceId}/streaming-profiles` | |
| PUT | `/streaming-profiles/{id}` | |
| DELETE | `/streaming-profiles/{id}` | |
| POST | `/streaming-profiles/{id}/change-pin` | Body: `{ newPin }`. Writes a PinHistory record and returns the list of currently-affected customers (Vision §9 success criterion) |
| GET | `/streaming-profiles/{id}/customers` | |
| GET | `/streaming-profiles/{id}/pin-history` | |

---

### Subscriptions

| Method | Path | Notes |
|---|---|---|
| GET | `/subscriptions` | |
| GET | `/subscriptions/{id}` | |
| POST | `/subscriptions` | Triggers the Assignment Engine (Section 6) inside a DB transaction; returns `409 CONFLICT` with `NO_PROFILE_AVAILABLE` if no eligible profile exists (BR-044) |
| PUT | `/subscriptions/{id}` | |
| DELETE | `/subscriptions/{id}` | Archives |
| POST | `/subscriptions/{id}/renew` | Creates a RenewalHistory + Revenue record |
| POST | `/subscriptions/{id}/cancel` | |
| POST | `/subscriptions/{id}/move` | Closes the current Assignment, opens a new one (BR-045/046) |

---

### Credential Center

| Method | Path | Notes |
|---|---|---|
| GET | `/subscriptions/{id}/credentials?template=` | Returns the assembled, ready-to-send message. Logged to Activity Log on every call, same as a password/PIN reveal |
| GET | `/credential-templates` | |

*(v1.0 only exposed credentials as a sub-resource of Subscription with no template support — this now matches Module 11/14 of the PRD, which explicitly requires multiple templates and a preview step.)*

---

### Assignments

| Method | Path |
|---|---|
| GET | `/assignments` |
| GET | `/assignments/{id}` |

---

### Revenue

| Method | Path |
|---|---|
| GET | `/revenue` |
| GET | `/revenue/{id}` |

---

### Reports

| Method | Path |
|---|---|
| GET | `/reports/revenue` |
| GET | `/reports/customers` |
| GET | `/reports/occupancy` |
| GET | `/reports/expiry` |
| GET | `/reports/products` |
| GET | `/reports/{type}/export?format=pdf\|excel\|csv` |

---

### Notifications

| Method | Path |
|---|---|
| GET | `/notifications` |
| POST | `/notifications/{id}/read` |
| POST | `/notifications/read-all` |

---

### Activity Log

| Method | Path | Notes |
|---|---|---|
| GET | `/activity-log` | Query: `user`, `entity`, `dateFrom`, `dateTo`. Read-only — no PUT/DELETE exists for this resource, matching BR-056 |

---

### Settings & Users

| Method | Path |
|---|---|
| GET / PUT | `/settings` |
| GET / POST | `/users` (Owner only) |
| PUT / DELETE | `/users/{id}` (Owner only) |

---

### Health Check

```
GET /health → { "status": "OK" }
```
## 10. System Architecture

### Purpose

Describes how every part of SubscriptionOS communicates and which technology owns each responsibility.

### A Note on Scale

This system is being designed for **1–5 administrators**, not a multi-tenant SaaS product. Every choice below is sized for that — a monolithic NestJS backend rather than services, Redis and background jobs kept but scoped narrowly (see below), and deployment split across managed platforms chosen for low ops overhead rather than raw throughput. If usage grows well beyond this (Section 12's "Multiple branches / hundreds of thousands of subscriptions" future note), Postgres and the modular backend structure already support scaling up before any of this needs to be re-architected.

---

### Architecture Overview

```
                     Users
                       │
                       ▼
               Next.js Frontend
                       │
                 HTTPS / REST API
                       │
                       ▼
                NestJS Backend
                       │
        ┌──────────────┼──────────────┐
        ▼              ▼              ▼
 PostgreSQL       Redis Cache      Background Jobs
        │
        ▼
   File Storage
(Images / Backups)
```

---

### Technology Stack

**Frontend** — Next.js, TypeScript, Tailwind CSS, shadcn/ui, Lucide Icons, TanStack Table, Recharts

**Backend** — NestJS, TypeScript, Zod validation, Prisma ORM, JWT auth (access + refresh, per Section 9), bcrypt for password hashing, REST API

**Database** — PostgreSQL 17+. Chosen for ACID compliance, native full-text search (used directly for Global Search, Section 9), reliable backups, and straightforward vertical scaling well past this business's projected size.

**Cache — Redis.** *Scoped, not default-on-everything:* used only for dashboard aggregate statistics (which are read constantly and expensive to recompute) and session/refresh-token storage. Every other read goes straight to Postgres. This is a deliberate boundary, not an oversight — for 1–5 admins, most queries are already sub-second against Postgres directly; caching only the genuinely expensive aggregate avoids adding a second data store to reason about everywhere else in the app.

**Background Jobs** — a single scheduled worker process (not a distributed queue) running: Expiry Check, Notification Generation, Dashboard Cache Refresh, Backup Creation. At this scale, a cron-triggered job in the same NestJS codebase is sufficient; a dedicated job queue (BullMQ, etc.) is deferred until job volume or execution time actually requires it.

**File Storage** — images, Excel/PDF report exports, automatic backups.

---

### Folder Structure

```
subscription-os/
├── frontend/
│   ├── app/
│   ├── components/
│   ├── hooks/
│   ├── lib/
│   ├── types/
│   ├── services/
│   └── styles/
├── backend/
│   ├── src/
│   │   ├── modules/
│   │   ├── common/
│   │   ├── config/
│   │   ├── jobs/
│   │   └── middleware/
│   └── prisma/
├── database/
├── docs/
├── docker/
└── scripts/
```

**Backend Modules:** Authentication · Dashboard · Task Center · Customers · Pending Customers · Products · Master Accounts · Service Types · Services · Streaming Profiles · Assignments · Subscriptions · Credential Center · Revenue · Notifications · Reports · Activity Log · Users · Settings

---

### Request Flow

```
User → Frontend → REST API → Controller → Service → Prisma ORM → PostgreSQL → Response → Frontend
```

### Authentication Flow

```
Login → Access Token (short-lived) + Refresh Token (long-lived)
      → Access Token sent in Authorization header
      → Backend verifies on every request
      → Access Token expires → Frontend calls /auth/refresh silently
      → Refresh Token itself expires → user is logged out
```

### Assignment Flow

```
Admin creates subscription
  → Backend validates request
  → Find required Service Type
  → Find eligible Streaming Profiles (Active, not full, parent Service/Master Account Active)
  → BEGIN TRANSACTION, lock candidate profile row
  → Choose best profile (per configured Assignment Strategy)
  → Create Assignment
  → Create Revenue record
  → Create Activity Log entry
  → COMMIT
  → Refresh Dashboard cache
```

### Dashboard Flow

```
Dashboard Request → Redis cache hit? → yes: return cached
                                     → no: query PostgreSQL, compute stats,
                                            store in Redis (TTL: 60s), return
```

### Notification Flow

```
Background Job (scheduled) → Check Expiring Subscriptions → Check Dead Accounts
    → Check Full Profiles → Generate Notification records → surfaced in Task Center / Dashboard
```

### PIN Change Flow

```
Admin changes PIN → encrypt new PIN → save → create PinHistory record
    → find currently-active customers on that profile → return them to the UI immediately
    → Activity Log entry
```

### Revenue Flow

```
Subscription Created or Renewed → Revenue record created (immutable) → Dashboard cache invalidated → Reports reflect new total on next read
```

---

### Security

| Area | Approach |
|---|---|
| User passwords | bcrypt hash, never recoverable |
| Master Account passwords / Profile PINs | AES-256, reversible — required because admins must display these to customers (Section 3–4) |
| Secret reveal | requires step-up re-authentication; every reveal is logged to Activity Log |
| JWT | short-lived access token + refresh token (Section 9, `/auth/refresh`) |
| Input validation | Zod schemas on every endpoint |
| Rate limiting | 100 req/min per user (Section 9) |
| Transport | HTTPS required everywhere, no exceptions |
| Database access | only the backend service connects to PostgreSQL directly; clients never see a DB connection string |

---

### Environment Configuration

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `REDIS_URL` | Redis connection string |
| `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` | signing keys, rotated independently |
| `AES_ENCRYPTION_KEY` | encrypts Master Account passwords and Streaming Profile PINs — stored in the hosting platform's secret manager, never in source control |
| `STORAGE_BUCKET_URL` | file storage for exports/backups |

---

### Testing Strategy

| Layer | Approach |
|---|---|
| Unit | Assignment Engine logic, PIN/password encryption round-trip, business-rule validators (BR-* checks) |
| Integration | Every endpoint in Section 9 against a test database, including the concurrency case: two simultaneous `POST /subscriptions` against a profile with one remaining seat — exactly one must succeed |
| E2E | Critical admin flows: login → create subscription → generate credentials; PIN change → verify affected-customer list is correct |
| Manual QA checklist | maps directly to Section 1 §9 success criteria (create <30s, renew <15s, search <1s) before each release |

---

### Logging

Every business-critical action creates an Activity Log entry (Section 4, Database Audit Rules) — this list, not a general request log, is the audit trail administrators actually review.

### Backups

Automatic daily backups via the background worker; manual backup supported on demand from Settings.

### Deployment

| Layer | Platform |
|---|---|
| Frontend | Vercel |
| Backend | Railway |
| Database | Supabase PostgreSQL |
| Cache | Upstash Redis |
| Storage | Supabase Storage |

### Scalability

Designed to absorb, without a rewrite: more admins, more master accounts (hundreds), and a meaningfully larger subscription volume (tens of thousands) — because the data model (Section 4–5) and the modular backend already separate these concerns cleanly. Multi-business support and dealer/multi-branch operation are explicitly Version 2+ (Section 1 §11) and would require a tenancy boundary that does not exist in v1 by design.

### Design Principles

Single Source of Truth · Modular Architecture · Secure by Default · Automation First · Mobile Friendly · Easily Extendable · Clean Code · High Performance
## 11. Appendix: Glossary, Open Items & Roadmap

### Glossary

| Term | Meaning |
|---|---|
| Master Account | An actual purchased third-party account (e.g. one Netflix login) |
| Service | A streaming service offered inside one Master Account (e.g. that Netflix account's "Netflix Shared" tier) |
| Service Type | The category a Service belongs to, shared across Master Accounts (e.g. "Netflix Shared" as a concept, independent of which account provides it) |
| Streaming Profile | One usable profile slot inside a Service, with its own PIN and customer capacity |
| Product | What the business actually sells to a customer (maps to one Service Type in v1) |
| Subscription | The commercial record of a customer's purchase — dates and amount, never placement |
| Assignment | Where a Subscription is currently placed (which Streaming Profile) — the only source of truth for placement, kept separate from Subscription so that moving a customer never touches the commercial record |
| Occupancy | Count of Active Assignments against a Streaming Profile's Capacity |

---

### Open Items (tracked, not blocking v1 build)

1. **Forgot Password flow** — deferred; requires transactional email, which is otherwise out of scope for v1 (Section 1 §11). Until then, an Owner resets an Admin's password directly via Settings → Users.
2. **PIN rotation policy** — "PIN Changes Required" appears in the Task Center (Section 7) but the triggering rule (time-based? manual flag only?) isn't defined yet. Recommend deciding before Settings → System Preferences is built, since that's where the policy would live.
3. **Report export formatting** — PDF/Excel/CSV are specified as outputs (Section 9) but column sets per report type aren't yet defined. Low risk, but worth a half-page spec before Reports development starts.
4. **Redis failure behavior** — if Redis is unreachable, does the Dashboard fall back to a direct (slower) Postgres read, or fail? Recommend: fall back and log a warning — a slow dashboard beats a broken one for a 1–5 admin tool.

---

### Version 2+ Roadmap (explicitly out of scope for v1 — Section 1 §11)

Bundle Products (multiple active assignments per subscription) · Customer Portal · Dealer Portal · Payment Gateway (eSewa, Khalti, Stripe) · WhatsApp/Telegram/SMS notifications · Multi-business support · Public API · AI-based revenue forecasting · Mobile application · Multi-language support

The data model (Section 4–5) was deliberately built so that most of these — bundle products especially — extend the existing schema rather than requiring a redesign.

---

*End of document.*
