# Scale

1. Check current usage against limits: CPU, memory, connections, queue depth.
2. Prefer raising autoscaling limits over pinning a replica count.
3. Check the database and downstream services can take the extra load before scaling up.
4. Show the change and wait for approval.
