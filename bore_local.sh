#!/bin/bash

# List of microservices with their ports
declare -A services
services=(
  ["calendar"]=3000
  ["announcements"]=3001
  ["budget"]=3002
  ["venue"]=3010
  ["department-announcement"]=8081
  ["permissions-request"]=8010
)

# Start Bore for each service
for service in "${!services[@]}"; do
  port=${services[$service]}
  echo "Starting Bore for $service on port $port..."
  
  # Start Bore and get the public URL
  bore_url=$(bore local --to "http://localhost:$port" $port)
  
  # Extract the public URL from the output
  public_url=$(echo $bore_url | grep -o 'http://[a-zA-Z0-9.-]*.bore.pub')
  echo "$service is exposed at $public_url"
  
  # Update the index.html dynamically
  sed -i "s|http://localhost:$port|$public_url|g" /home/username/projects/central-dashboard/index.html
done

echo "All Bore services started and index.html updated."

