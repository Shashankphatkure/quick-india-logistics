# Product Requirements Document
## New Logistics Web Application

**Version:** 1.0  
**Date:** 2026-05-15  
**Stack:** Next.js 14 · TypeScript · TailwindCSS · AlignUI Design System  
**Reference:** Existing "Logistics Cube" software (Quick India Logistics Pvt Ltd)  
**Current Phase:** UI Only — all pages are static/mock, no backend or API integration yet

---

## 1. Overview

We are rebuilding an existing logistics management platform into a modern, scalable, and performant web application. The existing software handles end-to-end logistics operations — from booking shipments, managing manifests and runsheets, tracking cold chain assets, to generating MIS reports. This PRD captures everything observed in the existing system so we can rebuild it better: cleaner UX, faster performance, and a consistent design system using AlignUI components.

### Goals
- Replace the legacy system with a modern Next.js app
- Improve UI consistency and usability across all modules
- Support multiple organizations (multi-tenant) under one platform
- Maintain all existing business logic while adding improvements
- Mobile-responsive design from the ground up
- Role-based access control (RBAC) with granular permissions

---

## 2. Navigation Structure (Sidebar)

The app uses a collapsible left sidebar with the following top-level modules:

```
├── Dashboard
├── Organization
├── EMS (Employee Management System)
│   ├── Login Details
│   ├── Permission
│   ├── Users
│   ├── Departments
│   ├── Designations
│   └── Change Password
├── EwayBill
│   └── Eway Dashboard
├── Master
│   ├── Commodities
│   ├── Charges
│   ├── Bill To
│   ├── Branches
│   ├── Locations
│   ├── Assets
│   ├── Routes
│   ├── Vendors
│   └── Vehicle
├── Booking
│   ├── Orders
│   ├── Docket Issues
│   └── Delivery Info
├── Runsheet
│   ├── Pending Delivery
│   ├── Hub Dispatch Runsheet
│   ├── Incoming Runsheet
│   └── All Runsheet
├── Manifest
│   ├── Pending For Dispatch
│   ├── Hub Dispatch
│   ├── Forwarding Details
│   ├── Pending To Depart
│   ├── Incoming Manifest
│   └── All Manifest
├── Analytics
│   └── Reports
├── Miscellaneous
│   └── Notice Category
├── Enquiry
│   └── Docket Movement
└── Connect Us
    ├── Service Request
    └── Report
```

### Global Header Elements
- **Enter Docket No** — global docket search bar
- **Branch Selector** — e.g., `QIL-AMRITSAR`
- **Sync/Refresh** button
- **User profile** dropdown (top-right)
- **Settings** icon

---

## 3. Module 1: Dashboard

### Overview
The dashboard is the landing page for each logged-in user, filtered by their assigned branch.

### Layout
- Header shows: `Summary Dashboard For '[Branch Name]'`
- Date range filter at top (From → To)
- View toggle icons (list/grid/table)
- Delivery Type filter dropdown

### Dashboard Sections

#### 3.1 Outgoing Orders
| Metric | Description |
|--------|-------------|
| Outgoing | Total outgoing orders |
| Delivered | Delivered count |
| Pending | Pending count |
| All Pending | Cumulative pending |

#### 3.2 Incoming Orders
| Metric | Description |
|--------|-------------|
| Incoming | Total incoming |
| Delivered | Delivered count |
| Pending | Pending count |
| All Pending | Cumulative pending |

#### 3.3 Cold Chain Orders
| Metric | Description |
|--------|-------------|
| Incoming | Cold chain incoming |
| Outgoing | Cold chain outgoing |

#### 3.4 Delay Orders
| Metric | Description |
|--------|-------------|
| Incoming 24hrs | Delayed > 24 hrs (incoming) |
| Outgoing 24hrs | Delayed > 24 hrs (outgoing) |
| Incoming 40hrs | Delayed > 40 hrs (incoming) |
| Outgoing 40hrs | Delayed > 40 hrs (outgoing) |

#### 3.5 Manifest / Hub Orders
**Incoming Orders:**
- Received
- Not Received

**Outgoing Orders:**
- Received
- Not Received

### Improvements Over Existing
- Clickable stat cards — navigate to filtered list view
- Real-time data refresh
- Branch comparison view
- Date range presets (Today, Yesterday, Last 7 days, This Month)

---

## 4. Module 2: Organization

### Purpose
Multi-tenant support — multiple companies (organizations) can operate within one software instance.

### 4.1 Organization List View
**Columns:**
- Organization Name
- PAN Number
- GST Number
- Registration No
- Website Address
- Email
- Mobile No
- Image/Logo

**Actions:**
- `+ Add Organization` button (top-right)
- Search bar
- Pagination (1-1 of N)

### 4.2 Add / Edit Organization Form

#### Organization Info Section
| Field | Type | Required |
|-------|------|----------|
| PAN Number | Text | Yes |
| Name | Text | Yes |
| Alias Name | Text | Yes |
| Company Type | Dropdown | Yes |
| Email | Email | No |
| Toll Free Number | Text | No |
| Registration / Incorporation No | Text | Yes |
| TAN Number | Text | Yes |
| Primary Mobile No | Text | Yes |
| Secondary Mobile No | Text | No |
| Website Address | URL | Yes |
| Upload Logo | Image upload | Yes |

#### GST Address Section (Repeatable)
| Field | Type | Required |
|-------|------|----------|
| GST No | Text | Yes |
| City | Text | Yes |
| Pincode | Text | Yes |
| Address | Textarea | Yes |
| H.O (Head Office) | Checkbox | No |
| + Add Another GST | Action | — |

#### Head Office Address Section
| Field | Type | Required |
|-------|------|----------|
| Address Line 1 | Text | Yes |
| Address Line 2 | Text | No |
| State | Dropdown | Yes |
| City | Dropdown | Yes |
| Pin Code | Text | Yes |

#### Billing Address Section
- Checkbox: "IF BILLING ADDRESS IS SAME AS HEAD OFFICE ADDRESS"
- Same fields as Head Office Address if different

#### Contact Person Info Section
| Field | Type | Required |
|-------|------|----------|
| Contact Person | Text | Yes |
| Contact Person Email | Email | Yes |
| Contact Person Phone Number | Text | Yes |

#### Description / T&C Section
- Rich text editor (Bold, Italic, Underline, Lists, etc.)
- Preview button

#### Organization Configuration Section (Repeatable)
| Field | Type |
|-------|------|
| System Type | Dropdown |
| Username | Text |
| Password | Password |
| URL | Text |
| + Add Another Config | Action |

**Actions:** Save | Cancel

---

## 5. Module 3: EMS (Employee Management System)

### 5.1 Login Details

**Purpose:** Audit trail of all user login sessions.

**Table Columns:**
- User
- IP Address
- Longitude / Latitude
- Platform
- Is Mobile
- Login Time
- Logout Time

**Features:**
- Search
- Pagination (default 10 rows, configurable)
- Sortable columns

---

### 5.2 Permission

**Purpose:** Define granular permissions per model/section of the app.

**Table Columns:**
- Model Name (linked)
- Category
- Sub Model Name
- Created By
- Created At

**Actions:**
- `+ Add Permission` button
- Filter button
- Search

**Permission Categories observed:**
- Dashboard → Home, Change Password, Booking Date & Time, Detail, Branch Wise, Checker/Maker, Ewaybill
- Pages → Login Details, Eway Dashboard, Assets, Orders, Pending Delivery, Pending For Dispatch, Reports, etc.

---

### 5.3 Users

#### Users List View
**Columns:**
- Username
- Email
- First Name
- Phone Number
- User Type
- Home Branch
- Channel Access
- Department
- Designation
- Is Active (checkmark)
- Organization
- Image

**Actions:**
- `+ Add User` button
- Filter button
- Search

#### Add User Form

**User Info Section:**
| Field | Type | Required |
|-------|------|----------|
| Username | Text | Yes |
| First Name | Text | Yes |
| Last Name | Text | Yes |
| Password | Password | Yes |
| Password Confirmation | Password | Yes |
| Phone Number | Text | Yes |
| Email | Email | Yes |
| DOB | Date | No |
| Gender | Radio (Male / Female / Other) | No |
| Application Usage Type | Dropdown | Yes |
| Organization | Dropdown | Yes |
| Home Branch | Dropdown | Yes |
| Channel Access | Dropdown | Yes |
| Department | Dropdown | Yes |
| Designation | Dropdown | Yes |
| Joined Date | Date | Auto |
| Is Active | Checkbox | — |
| Create International Order | Checkbox | — |
| Barcode Skip For | Dropdown | No |
| Default Barcode Type | Radio (Manually / Auto Generate) | Yes |
| Profile Pic | Image Upload | No |

**Associated Branch Section:**
- Dual-listbox: Available branches ↔ Selected branches
- Transfer controls: `>>` `>` `<` `<<`

**Permissions Section:**
Granular CRUD permissions per App > Section:

| App | Section | View | Add | Change | Delete |
|-----|---------|------|-----|--------|--------|
| EMS App | All Section | ☐ | ☐ | ☐ | ☐ |
| EMS | Login Details | ☐ | ☐ | ☐ | ☐ |
| EMS | Users | ☐ | ☐ | ☐ | ☐ |
| EMS | Departments | ☐ | ☐ | ☐ | ☐ |
| EMS | Designations | ☐ | ☐ | ☐ | ☐ |
| Ewaybill App | All Section | ☐ | ☐ | ☐ | ☐ |
| Ewaybill | Eway Dashboard | ☐ | ☐ | ☐ | ☐ |
| Master App | All Section | ☐ | ☐ | ☐ | ☐ |
| Master | Assets | ☐ | ☐ | ☐ | ☐ |
| Master | Routes | ☐ | ☐ | ☐ | ☐ |
| Master | Calculation Info | ☐ | ☐ | ☐ | ☐ |
| Master | Vendors | ☐ | ☐ | ☐ | ☐ |
| Master | Billing Info | ☐ | ☐ | ☐ | ☐ |
| Master | Vehicle | ☐ | ☐ | ☐ | ☐ |
| Master | Client | ☐ | ☐ | ☐ | ☐ |
| Master | Commodities | ☐ | ☐ | ☐ | ☐ |
| Master | Charges | ☐ | ☐ | ☐ | ☐ |
| Master | Bill To | ☐ | ☐ | ☐ | ☐ |
| Master | Branches | ☐ | ☐ | ☐ | ☐ |
| Master | Locations | ☐ | ☐ | ☐ | ☐ |
| Booking App | All Section | ☐ | ☐ | ☐ | ☐ |
| Booking | Orders | ☐ | ☐ | ☐ | ☐ |
| Booking | Docket Issues | ☐ | ☐ | ☐ | ☐ |
| Booking | Delivery Info | ☐ | ☐ | ☐ | ☐ |
| Booking | Cold Chain | ☐ | ☐ | ☐ | ☐ |
| Booking | Airport Order | ☐ | ☐ | ☐ | ☐ |
| Booking | Order Status | ☐ | ☐ | ☐ | ☐ |
| Booking | Detail Order | ☐ | ☐ | ☐ | ☐ |
| Booking | Short Order | ☐ | ☐ | ☐ | ☐ |
| Runsheet App | All Section | ☐ | ☐ | ☐ | ☐ |
| Runsheet | Pending Delivery | ☐ | ☐ | ☐ | ☐ |
| Runsheet | Hub Dispatch Runsheet | ☐ | ☐ | ☐ | ☐ |
| Runsheet | Incoming Runsheet | ☐ | ☐ | ☐ | ☐ |
| Runsheet | All Runsheet | ☐ | ☐ | ☐ | ☐ |
| Manifest App | All Section | ☐ | ☐ | ☐ | ☐ |
| Manifest | Pending For Dispatch | ☐ | ☐ | ☐ | ☐ |
| Manifest | Hub Dispatch | ☐ | ☐ | ☐ | ☐ |
| Manifest | Forwarding Details | ☐ | ☐ | ☐ | ☐ |
| Manifest | Pending To Depart | ☐ | ☐ | ☐ | ☐ |
| Manifest | Incoming Manifest | ☐ | ☐ | ☐ | ☐ |
| Manifest | All Manifest | ☐ | ☐ | ☐ | ☐ |
| Analytics App | All Section | ☐ | ☐ | ☐ | ☐ |
| Analytics | Reports | ☐ | ☐ | ☐ | ☐ |
| Miscellaneous App | All Section | ☐ | ☐ | ☐ | ☐ |
| Miscellaneous | Notice Category | ☐ | ☐ | ☐ | ☐ |

**Report Permissions Section:**

| App | Section | Download | View | Add | Change |
|-----|---------|----------|------|-----|--------|
| Report App | All Section | ☐ | ☐ | ☐ | ☐ |
| Report | Detailed Report | ☐ | ☐ | ☐ | ☐ |
| Report | Airport Order Report | ☐ | ☐ | ☐ | ☐ |
| Report | Asset Report | ☐ | ☐ | ☐ | ☐ |
| Report | Branch Report | ☐ | ☐ | ☐ | ☐ |
| Report | Coloader Report | ☐ | ☐ | ☐ | ☐ |
| Report | Daily Followup Report | ☐ | ☐ | ☐ | ☐ |
| Report | Incoming Shipment Report | ☐ | ☐ | ☐ | ☐ |
| Report | Local Runsheet Report | ☐ | ☐ | ☐ | ☐ |
| Report | Pending Shipment Report | ☐ | ☐ | ☐ | ☐ |
| Report | User Report | ☐ | ☐ | ☐ | ☐ |
| Report | Vendor Bill Report | ☐ | ☐ | ☐ | ☐ |
| Report | Weight Difference Report | ☐ | ☐ | ☐ | ☐ |

**Dashboard / Other Permissions Section:**

| App | Section | View |
|-----|---------|------|
| Booking | Booking Date & Time | ☐ |
| Dashboard | Home | ☐ |
| Dashboard | Detail | ☐ |
| Dashboard | Branch Wise | ☐ |
| Dashboard | Checker/Maker | ☐ |
| Dashboard | Ewaybill | ☐ |
| EMS | Change Password | ☐ |
| Manifest | Branch Transfer | ☐ |
| Runsheet | Hub Transfer | ☐ |
| Enquiry | Docket Movement | ☐ |

---

### 5.4 Departments

**Purpose:** Define departments used for Maker & Checker role assignment.

**List Columns:**
- Department Name (linked)
- Organization
- Created By

**Existing Departments:**
- Client, Software, Home, Admin, Account, Operation, Customer Support, Data Entry

#### Add Department Form
| Field | Type | Required |
|-------|------|----------|
| Department Name | Text | Yes |

**Department Permissions:** Same matrix as User permissions (App → Section → View/Add/Change/Delete)

---

### 5.5 Designations

**List Columns:**
- Designation Name (linked)
- Organization
- Created Date

**Existing:** Manager, Executive

#### Add Designation Form
| Field | Type | Required |
|-------|------|----------|
| Designation Name | Text | Yes |

---

### 5.6 Change Password

**Form Fields:**
| Field | Type |
|-------|------|
| Enter Username | Text |
| Enter New Password | Password (with show/hide toggle) |

**Action:** Change Password button

---

## 6. Module 4: EwayBill

**Purpose:** API integration with the government EwayBill system.

### Eway Dashboard Layout

#### Top Bar
- Assigned Eway Bill For Last 48 hrs (count)
- "Assigned Eway Bill To Us" label
- All Actionable EWB count
- FetchEwayBill button (with timestamp)

#### My Eway Bill Stats
| Metric | Value |
|--------|-------|
| Assign For Transport | 191780 |
| Generated By Me | 63 |
| Generated By Others | 8 |
| Archived EWBs | 180 |

#### Part B Details
| Metric | Value |
|--------|-------|
| Updated Part B | 339 |
| Not Updated Part B | 250 |

#### Transporter Details
| Metric | Value |
|--------|-------|
| Assign Transporter | 1 |
| Receive Transporter | 0 |

#### Expiry Tracking
| Metric | Value |
|--------|-------|
| Expired Yesterday | 19 |
| Expiring Today | 25 |
| Only Part A EWBs (Pending Part B) | 14308 |
| For more than 12 days (Pending Part B) | 223 |

#### Local EWBs
- Distance less than 200kms

#### Docket With EWBs
- All assign EWBs

---

## 7. Module 5: Master

### 7.1 Commodities

**Purpose:** Define commodity types for shipments.

**List Columns:**
- Commodity Name (linked)
- Commodity Type
- Organization Name
- Verified By
- Current Status (badge: Active/Inactive)

**Commodity Types:**
- General
- Perishable Food
- Expiry Goods
- Sample
- Boundary Matters *(custom)*

**Examples:** Cement Pipe, Cricket Balls, Sweet, Expiry Goods, Sample, Boundary Matters, Paints, Sales, Shooting Material, Spare Parts

**Actions:** `+ Add Commodity` | Filter | Search  
**Pagination:** 1-10 of 33

#### Update Commodity Form
| Field | Type | Required |
|-------|------|----------|
| Commodity Type | Dropdown | Yes |
| Commodity Name | Text | Yes |

**Actions:** Update | Cancel | History button

---

### 7.2 Charges

> **Status: Not implemented yet — to be built from scratch**

---

### 7.3 Bill To

**Purpose:** Manage billing entities (clients billed separately from shippers).

**List Columns:**
- Name
- PAN Number
- Client
- Total Clients
- Organization Name
- Verified By
- Current Status

**Actions:** `+ Add Bill To` | Filter

#### Add Bill To Form

**Bill To Details Section:**
| Field | Type | Required |
|-------|------|----------|
| PAN Number | Text | Yes |
| Name | Text | Yes |
| Branch / Organization Email | Email | Yes |
| Phone Number | Text | Yes |
| Is ETA Applicable | Checkbox | No |
| Credit Limit | Checkbox | No |

**Associated Branch** — Dual listbox (same pattern as Users)

**Report Column** — Dual listbox to select which columns appear in reports:
- Available: ID, ORGANIZATION, IS DELETED, TEMPERATURE TYPE, BARCODE TYPE, DOCKET NO, IS SHORT BOOKING, BOOKING AT

**GST Info Section (Repeatable):**
| Field | Type | Required |
|-------|------|----------|
| GST No | Text | Yes |
| City | Text | Yes |
| Pincode | Text | Yes |
| Address | Text | Yes |
| H.O | Checkbox | No |
| + Add Another GST | Action | — |

**Primary Address Section:**
| Field | Type | Required |
|-------|------|----------|
| Address Line | Text | Yes |
| State | Dropdown | Yes |
| City | Dropdown | Yes |
| Pin Code | Text | Yes |

**Communication Info Authorised Section:**
| Field | Type | Required |
|-------|------|----------|
| Authorised Person Name | Text | Yes |
| Authorised Person Email | Email | Yes |
| Authorised Person Number | Text | Yes |

**Actions:** Save | Cancel

---

### 7.4 Branches

**Purpose:** Manage physical branch locations.

**List Columns:**
- Branch Id
- Branch Name (linked)
- Organization Name
- Branch Type
- Vendor Name
- Location
- Email
- Phone Number
- Branch Head
- Verified By
- Current Status (badge)

**Actions:** `+ Add Branch` | Filter

#### Add Branch Form

**Branch Info Section:**
| Field | Type | Required |
|-------|------|----------|
| Branch Type | Dropdown | Yes |
| Alias Name | Text | Yes |
| Branch Name | Text | Yes (prefix: `QIL-`) |
| Branch Email | Email | Yes |
| Branch Phone Number | Text | Yes |

**Location Info Section:**
| Field | Type | Required |
|-------|------|----------|
| Address Line | Text | Yes |
| State | Dropdown | Yes |
| City | Dropdown | Yes |
| Pin Code | Text | Yes |
| Operating City | Dual listbox | Yes |

**Employee Info Section:**
| Field | Type | Required |
|-------|------|----------|
| Branch Head | Text | Yes |
| Branch Head Email | Email | Yes |
| Branch Head Phone Number | Text | Yes |

**Actions:** Save | Save & Add Another | Cancel

---

### 7.5 Locations

**Purpose:** Define serviceable city/location data with inter-state limits.

**Tabs:** All Locations | All City

**List Columns:**
- Pin Code
- Country
- State
- City (linked)
- Verified By
- Current Status (badge)

**Actions:** `+ Add Location` | Filter

#### Add Location Form
| Field | Type | Required |
|-------|------|----------|
| Country | Dropdown (default: India) | Yes |
| State | Dropdown | Yes |
| Inter State Limit | Number | Yes |
| Intra State Limit | Number | Yes |
| City | Dropdown | Yes |

**Actions:** Save | Cancel

---

### 7.6 Assets

**Purpose:** Track physical logistics assets (loggers, temperature control boxes).

**List Columns:**
- Asset ID
- Bar Code
- Asset Type
- Uses Type
- Product ID
- Assigned Branch
- Current Branch
- Created By
- In Use
- No. of Usages
- Is Defective
- Created Branch
- Verified By
- Current Status

**Header Actions:**
- Download Report
- Update Assets Calibration
- Update Assign Branch
- `+ Add Asset`
- Filter

#### Add Asset — Logger Type

**Asset Info Section:**
| Field | Type | Options | Required |
|-------|------|---------|----------|
| Asset Type | Dropdown | Logger | Yes |
| Logger Type | Dropdown | Single Use, Multi Use, Dry Ice Single Use, Dry Ice Multi Use, Liquid Nitrogen | Yes |
| Manufacture Name | Dropdown | Yes |
| Logger Number | Text | Yes |

**Asset Details Section:**
| Field | Type | Required |
|-------|------|----------|
| Initial Assign Branch | Search dropdown | Yes |
| Is Checked | Checkbox | — |

**Asset Calibration Info Section:**
| Field | Type | Required |
|-------|------|----------|
| Calibration From | Date | Yes |
| Calibration To | Date | Yes |
| Certificate Issued By | Text | Yes |
| Issued Date | Date | Yes |
| Document | File upload | Yes |

**Actions:** Save | Cancel | Import

---

#### Add Asset — Temperature Control Box Type

**Asset Info Section:**
| Field | Type | Options | Required |
|-------|------|---------|----------|
| Asset Type | Dropdown | Temperature Control Box | Yes |
| Box Type | Dropdown | Credo, Vype, Cool Guard, Iqo, Sytle, VAQ-TEC | Yes |
| Box Capacities | Dropdown | 02L, 04L, 07L, 12L, 14L, 18L, 28L | Yes |
| Manufacture Product ID | Text | Yes |
| Old Box Number | Text | No |

**Asset Details Section:**
| Field | Type | Required |
|-------|------|----------|
| Initial Assign Branch | Search dropdown | Yes |
| Is Checked | Checkbox | — |

**Actions:** Save | Cancel | Import

---

### 7.7 Routes

> **Status: Not implemented yet — to be built from scratch**

---

### 7.8 Vendors

**Purpose:** Manage third-party transport vendors / co-loaders.

**List Columns:**
- Vendor Name (linked)
- PAN Number
- GST Number
- Vendor Email
- Vendor Phone
- Company Type
- Service Region
- Line Of Business
- Verified By
- Current Status (badge: Approved/Pending)

**Actions:** `+ Add Vendor` | Filter

#### Add Vendor Form

**Vendor Info Section:**
| Field | Type | Required |
|-------|------|----------|
| PAN Number | Text | Yes |
| Vendor Name | Text | Yes |
| Company Type | Dropdown | Yes |
| MSME Registered | Radio (Yes / No) | Yes |

**Vendor Registered Office Contact Info Section:**
| Field | Type | Required |
|-------|------|----------|
| Vendor Email | Email | Yes |
| Vendor Ph No | Text | Yes |
| Vendor Email 2 | Email | No |
| Vendor Ph No 2 | Text | No |

**Vendor Services / Address Info Section (Repeatable):**
| Field | Type | Options | Required |
|-------|------|---------|----------|
| Line Of Business | Dropdown | Manufacturing, Production, Transportation, Inventory, Coloader | Yes |
| Service Region | Dropdown | Pan India, State | Yes |
| GST No | Text | No |
| City | Text | No |
| Pincode | Text | No |
| Address | Text | No |
| H.O | Checkbox | No |

**Vendor Dimension Calculation Section:**
- Checkboxes: Local | Air | Surface | Cargo | Train | Courier | Warehouse

**Vendor Billing Info Section:**
*(fields to be defined during implementation)*

**Actions:** Save | Cancel

---

### 7.9 Vehicle

**Tabs:** Vehicle | Market Vehicle

#### Vehicle List Columns:
- Vehicle No (linked)
- Organization Name
- Vehicle Owner
- Vehicle Type
- Vehicle Model
- Verified By
- Current Status (badge)
- Active Status (checkmark)
- Image

#### Market Vehicle List Columns:
Same as above.

#### Add Vehicle Form

**Asset Info Section:**
| Field | Type | Options | Required |
|-------|------|---------|----------|
| Vehicle Number | Text | Yes |
| Vehicle Type | Dropdown | Truck, Van, Bike | Yes |
| Vehicle Owner Info | Dropdown | Owned Vehicle, Partner Vehicle, Market Vehicle | Yes |
| Vehicle Model | Text | No |
| Container Capacity | Text | No |
| Active Status | Dropdown | Active | Yes |
| Vehicle Image | Image Upload | No |

**Associated Branch** — Dual listbox

**Actions:** Save | Cancel

---

## 8. Module 6: Booking

### 8.1 Orders

**Purpose:** Core shipment booking module. Each order generates a docket number.

#### Orders List View

**Table Columns:**
- Docket No (linked)
- Print Barcode (icon)
- Booking Date
- Is Completed
- Client
- Origin
- Destination
- Shipper
- Consignee
- Print Docket (icon)
- Verified By
- Current Status (badge)
- Navigate To
- Order Type
- Order Status
- Order Channel
- POD Image
- Logger Report
- With Ewaybill
- Manifest Pdf
- Manifest Image
- Runsheet No
- Delivery Type
- Created By
- Modified By
- Cold Chain (icon)
- Delivered (icon)
- Total Quantity
- Created Branch
- Current Branch
- Docket Entry Type (Manually / Auto Generate)
- Barcode No's
- Is Manifested
- Is Connect To Hub
- With Auto Generated Barcode

**Header Actions:**
- UPDATE STATUS (bulk)
- `+ Add Order`
- Form View Orders
- Excel View Orders
- Filter

#### Add Order Form — Step 1: Booking Info

**Booking Info Section:**
| Field | Type | Options | Required |
|-------|------|---------|----------|
| Booking For | Dropdown | New | Yes |
| Bill To | Search dropdown | Yes |
| Delivery Type | Radio | Local / Domestic / International | Yes |
| Booking Through | Checkbox | With Eway Bill No | No |
| Entry Type | Radio | Manually / Auto Generate | Yes |
| Cold Chain | Checkbox | Yes/No | No |
| Non Cold Chain | Checkbox | — | — |
| Type Of Booking | Dropdown | Priority / Economy | Yes |
| Booking Date & Time | DateTime | Auto-filled | Yes |
| Delivery Mode | Dropdown | Door To Door | Yes |
| Barcode Type | Radio | Manually / Auto Generate | Yes |

#### Cold Chain Info Section (shown when Cold Chain = Yes)
| Field | Type | Options | Required |
|-------|------|---------|----------|
| QIL Provide Asset | Checkbox | — | — |
| Asset Type | Dropdown | With Box / With Box + With Logger | Yes |
| Temperature Type | Dropdown | Yes |
| Logger No | Dual listbox (search) | Yes |
| Box No | Dual listbox (search) | Yes |

#### Add Order Form — Step 2: Shipper Info
| Field | Type | Required |
|-------|------|----------|
| Is Invalid Shipper Location | Checkbox | — |
| Shipper | Text | Yes |
| State | Dropdown | Yes |
| City | Dropdown | Yes |
| Pin Code | Dropdown | Yes |
| Origin | Text (auto-filled) | Yes |
| Address | Text | No |

#### Add Order Form — Step 3: Consignee Info
| Field | Type | Required |
|-------|------|----------|
| Is Invalid Consignee Location | Checkbox | — |
| Consignee | Text | Yes |
| State | Dropdown | Yes |
| City | Dropdown | Yes |
| Pin Code | Text | Yes |
| Destination | Text | Yes |
| Address | Text | No |

#### Add Order Form — Step 4: Tariff Info
| Field | Type | Options | Required |
|-------|------|---------|----------|
| Commodity | Dropdown | Yes |
| Local Delivery Type | Dropdown | Sales / Sample / Expiry Goods | Yes |
| COD | Dropdown | Yes / No | Yes |
| Total Quantity | Number | Yes |
| Actual Weight | Number | Yes |
| Chargeable Weight | Auto-calculated | — |
| Remarks | Textarea | No |

#### Add Order Form — Step 5: Dimensions
| Field | Type | Required |
|-------|------|----------|
| Length (Cm) | Number | No |
| Breadth (Cm) | Number | No |
| Height (Cm) | Number | No |
| No of Pieces | Number | No |
| + Add Another Dimensions | Action | — |

**Navigation:** Previous | Next | Cancel (multi-step)

#### Add Order Form — Step 6: Order Images
| Field | Type | Required |
|-------|------|----------|
| Caption | Dropdown (Select Value) | No |
| Image | File Upload | No |
| + Add Another Order Images | Action | — |

#### Add Order Form — Step 7: Invoices
| Field | Type | Required |
|-------|------|----------|
| EwayBill No | Text | No |
| Invoices Date | Date | Yes |
| Invoices Number | Text | Yes |
| Amount | Number | Yes |
| EwayBill Image | File Upload | No |
| Invoice Image | File Upload | No |
| + Add Another Image | Action | — |
| + Add Another Invoices | Action | — |

**Actions:** Previous | Save | Cancel

#### Order Status Tracking
When a shipment is entered, statuses are tracked chronologically:
1. Shipment Order Received
2. Shipment Picked Up
3. Shipment Arrived At Hub
4. Shipment In Transit
5. Shipment Out For Delivery
6. Shipment Delivered

Each status entry shows:
- Status No
- Status
- Add Date & Time
- Added By
- Action (Delete — only on last entry)

---

### 8.2 Docket Issues

> **Status: Not implemented yet — to be built from scratch**

---

### 8.3 Delivery Info

**Purpose:** Verify deliveries — view POD images and delivery data.

**Tabs:** Delivery Info | Undelivered Info | Mark Delivered

**Delivery Info Table Columns:**
- Docket Number (linked)
- Delivery Branch
- Person Name
- Phone Number
- Delivered Date & Time
- Signature (image thumbnail)
- POD (image thumbnail)
- Verified By
- Current Status (badge)

**Actions:** Filter

#### POD Image Viewer
- Opens in same page as a modal/overlay
- Shows full POD image
- **Rotate** option (90° clockwise)
- **Open** button → opens image in a separate full page/tab
- Close (×) button

---

## 9. Module 7: Runsheet

A Runsheet is a delivery assignment sheet for drivers.

### 9.1 Pending Delivery

**Purpose:** Pool of orders ready to be assigned to a runsheet for delivery.

**Sub-tabs:** Pending Delivery | Hub Dispatch Runsheet | Incoming Runsheet | All Runsheet

**Pending For Delivery Table:**
- Shows total count: e.g., `Total Local Order - 307`
- Columns: Docket No, Booking Date, Origin, Destination, Client, EwayBill No, Actual Weight, Total Quantity, Action (Add button)

#### Create Runsheet Section (below the table)
- Radio: Create Runsheet / Hub Transfer
- `Create` button
- Preview table of selected dockets: Docket No, Booking Date, Origin, Destination, Client, EwayBill No, Actual Weight, Total Quantity, Damaged

---

### 9.2 Hub Dispatch Runsheet

**Table Columns:**
- Hub Transfer No
- From Branch
- To Branch
- Destination
- Total Orders
- Total Box
- Manifest Date
- Print (icon)
- Edit

---

### 9.3 Incoming Runsheet

**Table Columns:**
- Hub Transfer No
- Origin
- Destination
- Total Orders
- Total Box
- Total Weight
- Print (icon)
- Action (Receive button)

---

### 9.4 All Runsheet

**Table Columns:**
- Runsheet No (linked)
- Branch
- Total Orders
- Verified By
- Current Status (badge)
- Date & Time
- Route
- Vehicle No
- Driver
- Print (icon)
- Delivery Status

**Actions:** Filter

#### Runsheet Print
**Print Options (before printing, allow selection by):**
- Via Docket
- Via Pincode
- Via Shipper
- *(other filter options)*

#### Delivery Run Sheet (Print Layout)
**Header:**
- Company Name: Quick India Logistics Pvt Ltd
- Title: DELIVERY RUN SHEET
- Route, Vehicle No, Driver Name
- DRS No, Date, Market/Fixed Vehicle type

**Table:**
- S.No, Docket No, E-Way Bill No, Shipper, Consignee, Origin, Destination, Pcs, Wt, Date, Name, Stamp

---

## 10. Module 8: Manifest

A Manifest is a grouped shipment document for inter-branch or inter-hub movement.

### 10.1 Pending For Dispatch

**Purpose:** Pool of unmanifested orders ready to be dispatched.

**Sub-tabs:** Pending For Dispatch | Hub Dispatch | Forwarding Details | Pending To Depart | Incoming Manifest | All Manifest

**Table columns:**
- Docket No, Booking Date, Origin, Destination, Client, EwayBill No, Actual Weight, Total Quantity, Damaged, Not Received, Action (Add)
- Shows total: `Total Unmanifest Orders - 342`

#### Create Manifest Section
| Field | Type | Required |
|-------|------|----------|
| Select Branch To Forward | Dropdown | Yes |
| Selected Branch Destination | Dropdown | Yes |
| Transfer Type | Radio: Through Air / Branch Transfer | Yes |
| `Create Manifest` | Button | — |

**Preview table of selected dockets before creating**

---

### 10.2 Hub Dispatch

**Sub-tabs:** Hub Dispatch (Air) | Hub Dispatch (Vehicle)

**Hub Air Forward Table:**
- Manifest, From Branch, To Branch, Destination, Total Orders, Total Bag, Total Box, Manifest Date, Print (icon), Edit

---

### 10.3 Forwarding Details

**Table Columns:**
- Manifest, From Branch, To Branch, Destination, Total Orders, Total Bag, Total Box, Manifest Date, Print (icon), Forward (button)

#### Forward Manifest Modal

**Manifest Info:**
| Field | Type | Required |
|-------|------|----------|
| Manifest No | Text (auto) | — |
| Forward Branch | Dropdown | Yes |
| Origin | Text (auto) | — |
| To Branch | Dropdown | Yes |

**Coloader Info:**
| Field | Type | Required |
|-------|------|----------|
| Select Coloader | Dropdown | Yes |
| Coloader Mode | Dropdown | Yes |
| Co-loader/Airway Bill No | Text | Yes |
| Forwarding Date | DateTime | Yes |

**Package Info:**
| Field | Type | Required |
|-------|------|----------|
| No of Bags | Number | Yes |
| No of Box | Number | Yes |
| Docket Weight | Number | Yes |
| Coloader Actual Weight | Number | Yes |
| Coloader Chargeable Weight | Number | Yes |
| Rate | Number | Yes |
| Tax Slab | Dropdown | Yes |
| Box Barcode (auto-generated) | Display | — |

**Docket Info Table:**
- Docket No, Shipper, Consignee, Delivery Type, Eway Bill No, Total Pcs, Damaged, Not Received, Weight, Date, Status, Barcode, Remove Order

**Manifest Dimensions:**
- Length (Cm), Breadth (Cm), Height (Cm), No of Pieces, + Add Another Dimensions

**Forwarding Images tab**

**Actions:** Forward | Cancel

---

### 10.4 Pending To Depart

**Table Columns:**
- Manifest No, Origin, Destination, Total Orders, Coloader, Total Bags, Total Box, Total Weight, Total Quantity, Print, Action (Depart button)

---

### 10.5 Incoming Manifest

**Sub-tabs:** Incoming Manifest (Air) | Incoming Manifest (Branch) | Picked Orders

**Incoming Manifest Table:**
- Manifest No (linked), Date, Origin, Destination, Total Orders, Coloader, Total Bags, Total Box, Total Weight, Print, Action (Receive button)

**Incoming Hub/Vehicle Table:**
- Hub Transfer No, Origin, Destination, Total Orders, Total Bags, Total Box, Total Weight, Print, Action (Receive button)

**Picked Orders Table:**
- Vehicle No, Picked Date, No Of Boxes, Current Status, Action

---

### 10.6 All Manifest

**Table Columns:**
- Manifest No (linked), Date, Verified By, Current Status (badge), Origin, Destination, Coloader, Coloader No, PDF (icon), Total Bags, Total Box, Weight, Total Orders, Images

**Actions:** Filter

---

## 11. Module 9: Analytics / Reports

### Reports Landing Page (Grouped)

#### Orders Group
- Detailed Report (MIS)
- Incoming Shipment Report
- Pending Shipment Report
- Daily Followup Report
- User Report
- Branch Report
- Vendor Bill Report
- Asset Report
- Airport Order Report

#### Runsheets Group
- Local Runsheet Report (Daily)

#### Manifest Group
- Coloader Report
- Weight Difference Report

#### Validation Report Group
- Order Master Status Mismatch Report

---

### 11.1 Detailed Report (MIS)

**Filters:**
- Select Branch (dropdown)
- Select Bill To (dropdown)
- Booking Type (dropdown)
- From Date
- To Date
- Submit button

---

### 11.2 Incoming Shipment Report

**Filters:**
- Select Branch
- From Date
- To Date
- Submit

---

### 11.3 Pending Shipment Report

**Filters:**
- Select Branch
- From Date
- To Date
- Submit

---

### 11.4 Daily Co-loader Followup Report

**Filters:**
- Select Branch
- From Date
- To Date
- Submit

---

### 11.5 User Report

**Filters:**
- Select Branch
- From Date
- To Date
- Submit
- Column Filter button

---

### 11.6 Branch Report

**Filters:**
- Select Branch
- From Date
- To Date
- Submit
- Column Filter button

---

### 11.7 Vendor Bill Report

**Filters:**
- Select Branch
- Select Vendor
- From Date
- To Date
- Submit

---

### 11.8 Asset Report / Asset Inventory Report

**Filters:**
- Select Branch
- From Date
- To Date
- Submit

---

### 11.9 Airport to Airport Report

> **Status: Currently not required**

---

### 11.10 Local Runsheet Report

**Filters:**
- Select Branch
- From Date (From Date)
- To Date
- Submit

---

### 11.11 Co-loader Report

**Filters:**
- Select Branch
- From Date
- To Date
- Submit

---

### 11.12 Weight Difference Report

**Filters:**
- Select Branch
- From Date
- To Date
- Submit

---

### 11.13 Order Master Status Mismatch Report

**Filters:**
- From Date
- To Date
- Submit

---

## 12. Module 10: Others (Not in active use)

### Miscellaneous
- Notice Category

### Enquiry
- Docket Movement

### Connect Us
- Service Request
- Report

---

## 13. Cross-Cutting Concerns

### 13.1 Authentication & Authorization
- JWT-based auth
- Role-based access control (RBAC) — all permissions managed via EMS module
- Session tracking (login/logout with IP, device, location)
- Password reset flow

### 13.2 Multi-Tenancy
- Multiple organizations under one instance
- Branch-level data isolation
- Users scoped to organization + branches

### 13.3 Barcode System
- Manual entry or auto-generate
- Barcode format: `QILDEL{number}` (manual) or `QILNone{number}` (auto)
- Print barcode from order list

### 13.4 Status Badges
Consistent status indicators across all modules:
- Active (green)
- Inactive (grey)
- Pending (yellow/orange)
- Approved (green)
- Rejected (red)

### 13.5 Tables — Standard Features
All data tables must support:
- Search
- Sortable columns (↑↓ indicators)
- Pagination (configurable rows per page: 10, 25, 50)
- Row checkboxes for bulk actions
- Filter panel
- Excel export (where applicable)
- Column visibility toggle (Column Filter)

### 13.6 Forms — Standard Features
- Section-level collapsible panels (⊖/⊕ toggle)
- Required field indicators (*)
- Inline validation messages
- Save & Cancel on every form
- Multi-step forms with Previous/Next navigation where complex

### 13.7 File Uploads
- Supported: Images (JPG, PNG), PDFs
- POD images viewable in-app (modal) with rotate and full-page open
- EwayBill images, invoice images, manifest forwarding images

### 13.8 Print Functionality
- Runsheet print (Delivery Run Sheet)
- Manifest print
- Barcode print
- Pre-print filter options: by Docket, Pincode, Shipper, etc.

### 13.9 Dual Listbox Pattern
Used in: Users (Associated Branch), Bill To (Associated Branch), Bill To (Report Columns), Vehicle (Associated Branch)
- Left panel: Available items (with search)
- Right panel: Selected items (with search)
- Transfer buttons: `>>` (all right), `>` (selected right), `<` (selected left), `<<` (all left)

### 13.10 Cold Chain Support
- Booking can be flagged as Cold Chain
- Asset type: With Box / With Box + With Logger
- Logger assignment via search + dual listbox
- Box assignment via search + dual listbox
- Temperature type selection

---

## 14. Improvements Over Existing System

| Area | Existing | New (Planned) |
|------|----------|---------------|
| Design | Inconsistent, dense | AlignUI component system, clean spacing |
| Mobile | Limited | Fully responsive |
| Dashboard | Static counts | Clickable cards, real-time refresh, date presets |
| Tables | Basic pagination | Virtual scroll for large datasets, column resize |
| Forms | Long single-page | Multi-step with progress indicator |
| Search | Per-module | Global search across dockets |
| Notifications | None visible | Toast notifications (Sonner) |
| Performance | Unknown | Next.js SSR + API routes, optimistic UI |
| Print | Basic | Improved print layouts, filter before print |
| Export | Basic Excel | Excel + CSV + PDF export |
| Audit Trail | Login Details only | Full audit log per record |
| Error States | Unknown | Proper empty states, error boundaries |
| Loading States | Unknown | Skeleton loaders on all tables/forms |

---

## 15. Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | TailwindCSS |
| UI Components | AlignUI (clsx, tailwind-variants) |
| Icons | Remixicon (`@remixicon/react`) |
| Date Picker | react-day-picker + date-fns |
| Select / Dropdown | Radix UI (via AlignUI) |
| Notifications | Sonner |
| Command Menu | cmdk |
| Form | react-hook-form (to add) |
| Tables | TanStack Table (to add) |
| Auth | NextAuth.js or custom JWT (to add) |
| API | Next.js API Routes or tRPC (to decide) |
| Database | To be decided |

---

## 16. Pages / Routes Map

```
/                          → Dashboard
/organization              → Organization list
/organization/add          → Add organization
/organization/[id]         → Edit organization

/ems/login-details         → Login audit
/ems/permissions           → Permissions list
/ems/users                 → Users list
/ems/users/add             → Add user
/ems/users/[id]            → Edit user
/ems/departments           → Departments list
/ems/designations          → Designations list
/ems/change-password       → Change password

/ewaybill                  → Eway dashboard

/master/commodities        → Commodities list
/master/charges            → Charges (TBD)
/master/bill-to            → Bill To list
/master/bill-to/add        → Add Bill To
/master/branches           → Branches list
/master/branches/add       → Add Branch
/master/locations          → Locations list
/master/assets             → Assets list
/master/assets/add         → Add Asset
/master/routes             → Routes (TBD)
/master/vendors            → Vendors list
/master/vendors/add        → Add Vendor
/master/vehicles           → Vehicles list
/master/vehicles/add       → Add Vehicle

/booking/orders            → Orders list
/booking/orders/add        → Add Order (multi-step)
/booking/orders/[id]       → Order detail / edit
/booking/docket-issues     → Docket Issues (TBD)
/booking/delivery-info     → Delivery Info

/runsheet/pending-delivery → Pending Delivery
/runsheet/hub-dispatch     → Hub Dispatch Runsheet
/runsheet/incoming         → Incoming Runsheet
/runsheet/all              → All Runsheet

/manifest/pending-dispatch → Pending For Dispatch
/manifest/hub-dispatch     → Hub Dispatch
/manifest/forwarding       → Forwarding Details
/manifest/pending-depart   → Pending To Depart
/manifest/incoming         → Incoming Manifest
/manifest/all              → All Manifest

/analytics/reports/mis              → Detailed Report (MIS)
/analytics/reports/incoming         → Incoming Shipment
/analytics/reports/pending          → Pending Shipment
/analytics/reports/coloader-followup → Daily Coloader Followup
/analytics/reports/user             → User Report
/analytics/reports/branch           → Branch Report
/analytics/reports/vendor-bill      → Vendor Bill Report
/analytics/reports/asset            → Asset Report
/analytics/reports/asset-inventory  → Asset Inventory
/analytics/reports/local-runsheet   → Local Runsheet
/analytics/reports/coloader         → Coloader Report
/analytics/reports/weight-diff      → Weight Difference
/analytics/reports/status-mismatch  → Order Status Mismatch

/misc/notice-category      → Notice Category
/enquiry/docket-movement   → Docket Movement
/connect-us/service-request → Service Request
```

---

*This PRD is a living document. Update it as new requirements are discovered during development.*
