# Routing evals

| Request | Expected route |
|---|---|
| ship payments v2.4 to production | deploy |
| the release from an hour ago is broken, go back | rollback |
| checkout is throwing 503s for half the users | incident |
| what did the api log around 14:05 for request abc123 | logs |
| black friday traffic is coming, we need more pods | scale |
| we deployed and now latency doubled | incident |
| make the login page blue | none, not an ops request |
| promote the build to staging | deploy |
