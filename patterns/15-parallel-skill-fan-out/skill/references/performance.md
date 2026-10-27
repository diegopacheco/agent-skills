# Performance Lens

Look only for work that grows faster than it should.

* Queries or network calls inside a loop.
* Quadratic loops over data that can be large.
* Missing pagination, missing limits, unbounded caches or queues.
* Blocking IO on a hot or async path.

Evidence is the input size where the cost shows up and the operation that repeats.
