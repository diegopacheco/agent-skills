# Tests Lens

Look only at whether the tests would catch a regression in this change.

* Changed behavior with no test that would fail if it broke.
* Tests that cannot fail: no assertion, an assertion on a mock, a tautology.
* Error paths and boundaries that no test reaches.
* Flaky timing, ordering or shared state between tests.

Evidence is the change to the code that no test would notice.
