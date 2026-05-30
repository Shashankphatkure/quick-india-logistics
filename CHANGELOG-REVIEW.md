# Quick India Logistics — Change Log (Preliminary Dev Review)

Source: Notion change-log, captured 2026-05-30. Tracking status per item.
Status key: ☐ todo · ◐ partial · ☑ done · ❓ needs clarification

## /master → Branches
- ◐ Branches dropdown (header) — now lists user's real branches (switch action TBD)
- ◐ Filter typeahead — filter works (popover + search); live typeahead dropdown TBD
- ☑ "Total all time" label → clarified sub-labels
- ❓ Top Performers (based on last activity) — should show Inactive too
- ☑ Filter result works with Enter + Apply button
- ☑ Branch ID — column relabeled "Branch ID"
- ☑ Organisation Name — added to table
- ☑ Head field → renamed "Br. Head"
- ☑ Add Branch button 2x — fixed (converted to Drawer)
- ☑ Branch → Edit option (RowActions edit)
- ☑ Operating City — added (Operating Cities field)
- ❓ Drag property missing — needs clarification
- ☑ Save & Add Another button — added
- ☑ Country field — added (dropdown + DB column)
- ❓ Total Branches / Active Hubs / Vendors — extra fields, clarify
- ☑ Age field — not present (already removed)

## /locations
- ☑ Add Location button — now works (real locations table + form)
- ☑ Sequence Country → Pincode → State → City → Branch in the form
- ☑ Fields added: Assigned Branch, Created By, In Use, Is Active, Country, Validated By

## /assets
- ☑ Asset ID input present (Add form is a Drawer now)
- ☑ Manufacturer — now a dropdown
- ☑ Asset Calibration Info — from/to/issued-by section (loggers)
- ☑ Logger Number — added (→ manufacturer_pid)
- ☑ Initial Assigned Branch — present
- ☑ Old Box Number — added (boxes)
- ☑ Box Capacity — decimal required (step 0.1)
- ☑ Temp Control Box — box kind option present
- ☑ "Add As One More" → Save & Add Another
- ❓ Auto Save & No Comment window issue — needs clarification

## /commodities
- ☑ Add Commodity 2x — fixed (converted to Drawer)
- ☑ Add 1 More — Save & Add Another keeps drawer open
- ☑ Perishable → expiry/shelf-life (days) field on perishable types; orange "{n} days" badge in list
- ❓ "Boy CLI" — pending clarification

## /charges
- ☑ Add Charge now works (DB-backed charges table + drawer); was a dead button on a hard-coded list
- ☑ Fare rates — charge codes (percent/flat/per-kg/per-box + default value) stored in DB
- ☑ Remove — per-row Remove (deactivate)
- ◐ Weight-break "slabs" (tiered rate per weight range) — needs client's slab structure (per route? per charge?) before building

## /routes
- ☑ Add Route — drawer writing to tat_routes (client/mode/origin/destination/TAT/rate), org-scoped + unique guard
- ☑ Allow Remove — per-row Remove with org ownership check

## /dashboard (29 changes)
- ☑ "40H" label → corrected to 48h+ (matches the 2-day query interval)
- ☐ Table view missing columns: Origin/Destination, Consignee/Pincode, Docket, Verified By, Entry Status, Navigate To, Order Type/Status/Card Channel, POD Image, Logger Report, Manifest PDF/Image, Runsheet, Delivery Type, Created/Modified By, Cold Chain, Delivered At, Total Quantity, Created/Current Branch, Docket Entry Type, Barcode, Connected to Hub/In Transit

## Add Order
- ☑ Booking Info step has Bill To, Client, Delivery Type, Mode, Priority, Booking Date, Cold Chain
- ☑ Consignee step present
- ◐ Cold Chain checkbox works; asset attach is on order-detail (not in wizard yet)
- ☑ Tariff: Local Delivery Type, COD, Remarks added; Chargeable Weight auto-computed
- ☑ Dimensions: No. of Pieces present (Tariff step)
- ☑ Add Another Dimension / Add Another Invoice — multi-row repeaters → order_dimensions / order_invoices child tables; volumetric weight sums across rows; detail page shows both
- ☐ Order Image sequence / Invoice Image — image upload is on order-detail gallery
- ❓ Cold Chain "Ayo" field — needs clarification

## /delivery-info
- ☑ Single Signature — added Signature column (view link)
- ☑ POD — added POD column (view link)
- ☑ Verified By — added column

## Run Sheet
### Pending Delivery
- ☐ Required cols: Docket No / Delivery Branch / Person Name / Phone / Delivered Date & Time
- ☐ Additional: Docket No / Booking Date / Origin / Destination / Eway Bill No / Actual Weight / Total Qty / Action
- ☐ Show Actual Weight instead of Total Quantity
- ☐ Action button missing
### Hub Dispatch
- ☐ Print, Edit missing
### Incoming Runsheet
- ☐ Branch, Verified By, Current & Delivery Status missing
- ☐ Required cols: Hub Transfer No / Origin / Destination / Total Orders / Total Box / Total Weight / Print / Action (full rework)
### All Runsheet
- ◐ Cols present + Verified By added + date/time + Status; Print/Delivery-Status TBD

## /manifest
### /pending-dispatch
- ☑ Damaged, Not Received, Delivery Type columns added
### /hub-dispatch
- ☑ Destination column added; Weight extra field removed
- ☐ Print, Edit — need a manifest detail page first
### /forwarding
- ☐ Same as Hub Dispatch + Forward option missing; create Forward Manifest (Page 17/20)
### /pending-depart
- ☑ Columns added: Origin / Destination / Coloader / Bags / Box / Weight / Qty / Action
- ☐ Print — needs manifest detail/print page
### /incoming
- ☐ Full rework (Page 17); support By Air & By Road

## /reports
- ☐ All modules not covered — Page 18 for complete list

---
Items needing reference pages (17/18/20 from Ganesh) flagged ❓ — request from user before building.
