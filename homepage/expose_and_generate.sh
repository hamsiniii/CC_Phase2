#!/bin/bash

TEMPLATE="homepage_template.html"
OUTPUT="generated_index.html"
touch $OUTPUT

declare -A ports=(
  [calendar]=3000
  [announcements]=3001
  [budget]=3002
  [venue]=3010
  [dept_announce]=8081
  [request]=8010
)

declare -A urls

echo "Starting bore tunnels..."

for service in "${!ports[@]}"; do
  port=${ports[$service]}
  echo "Exposing $service on port $port..."

  # Run bore in background and capture output
  url=$(bore local $port --to bore.pub 2>&1 | tee /tmp/${service}_bore.log | grep -o 'bore.pub:[0-9]*' | head -n 1) &

  # Wait a bit and try to fetch from the log
  sleep 3
  url=$(grep -o 'bore.pub:[0-9]*' /tmp/${service}_bore.log | head -n 1)

  if [[ -n "$url" ]]; then
    urls[$service]="http://$url"
    echo "$service exposed at ${urls[$service]}"
  else
    echo "❌ Failed to expose $service"
  fi
done

cp "$TEMPLATE" "$OUTPUT"

for key in "${!urls[@]}"; do
  sed -i "s|{{${key}}}|${urls[$key]}|g" "$OUTPUT"
done

echo "✅ Generated homepage at $OUTPUT"

