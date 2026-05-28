#!/usr/bin/env bash
set -e

DIR="transcription/qa"
mkdir -p "$DIR"

# Login as admin (super_admin sees everything)
agent-browser open "http://localhost:3000/login"
agent-browser fill 'input[name="username"]' 'admin'
agent-browser fill 'input[name="password"]' 'admin12345'
agent-browser click 'button[type="submit"]'
sleep 3

# All routes that exist in the app
ROUTES=(
  "/dashboard"
  "/organization"
  "/ewaybill"
  "/booking/orders"
  "/booking/orders/add"
  "/booking/delivery-info"
  "/manifest"
  "/manifest/pending-dispatch"
  "/manifest/hub-dispatch"
  "/manifest/forwarding"
  "/manifest/pending-depart"
  "/manifest/incoming"
  "/manifest/all"
  "/runsheet/pending-delivery"
  "/runsheet/hub-dispatch"
  "/runsheet/incoming"
  "/runsheet/all"
  "/ems/login-details"
  "/ems/permissions"
  "/ems/users"
  "/ems/departments"
  "/ems/designations"
  "/ems/change-password"
  "/master/commodities"
  "/master/branches"
  "/master/vendors"
  "/master/vehicles"
  "/master/assets"
  "/analytics/reports"
)

for r in "${ROUTES[@]}"; do
  name=$(echo "$r" | sed 's|^/||; s|/|_|g')
  echo "Screenshotting $r -> $name.png"
  agent-browser open "http://localhost:3000$r" || true
  sleep 1.5
  agent-browser screenshot --full "$DIR/${name}.png" || true
done

agent-browser close
echo "Done. Screenshots in $DIR"
