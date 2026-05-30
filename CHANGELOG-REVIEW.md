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
- ☐ Add Location button not working
- ☐ Correct sequence: Country → Pincode → State → City → Branch → Pincodes
- ☐ Missing fields: Assigned Branch, Created Branch, Created By, In Use (stage), Is Active, Country, Branch, Validated By

## /assets
- ☐ Asset ID — Add option missing
- ☐ Manufacturer dropdown missing
- ☐ Asset Calibration Info missing
- ☐ Logger Number missing
- ☐ Initial Assigned Branch (Logger) missing
- ☐ Old Box Number missing
- ☐ Box Capacity — decimal input required (e.g. 1.0)
- ☐ Temp Control Box missing
- ☐ "Add As One More" button — show Add & None options
- ❓ Auto Save & No Comment window issue

## /commodities
- ☑ Add Commodity 2x — fixed (converted to Drawer)
- ☑ Add 1 More — Save & Add Another keeps drawer open
- ☐ Perishable → show expiry days near client-facing area
- ❓ "Boy CLI" — pending clarification

## /charges
- ☐ Add Slab button not visible/clickable
- ☐ Fare rates missing
- ☐ Add Route → Remove button not working

## /routes
- ☐ Add Route → Allow Remove not implemented

## /dashboard (29 changes)
- ☑ "40H" label → corrected to 48h+ (matches the 2-day query interval)
- ☐ Table view missing columns: Origin/Destination, Consignee/Pincode, Docket, Verified By, Entry Status, Navigate To, Order Type/Status/Card Channel, POD Image, Logger Report, Manifest PDF/Image, Runsheet, Delivery Type, Created/Modified By, Cold Chain, Delivered At, Total Quantity, Created/Current Branch, Docket Entry Type, Barcode, Connected to Hub/In Transit

## Add Order
- ☐ Booking Form / Bookings section / Entry Type / Consignee / Booking Date & Time missing
- ☐ Cold Chain Shipment checkbox — error on add, no cold-chain info shown
- ☐ Shipper: location info, state — invalid/missing/not validating
- ☐ Consignee: valid location missing
- ☐ Tariff: Commodity Type, Local Delivery Type, COD, Chargeable Weight, Remarks missing
- ☐ Dimensions: No. of Pieces missing, Add Another Dimension missing
- ☐ Order Image: sequence after Invoices wrong, Invoice Image missing, Add Another Invoice missing
- ☐ Cold Chain: Buyer Info, Asset Type, Temperature Type, "Ayo" field (clarify)

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
