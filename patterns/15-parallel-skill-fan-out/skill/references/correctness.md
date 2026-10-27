# Correctness Lens

Look only for code that gives the wrong result.

* Off by one, wrong boundary, wrong comparison operator.
* Null, empty, missing key and zero handling.
* Error paths that swallow an error or return a wrong default.
* State that changes in one branch and not the other.
* Behavior that contradicts the name, the docstring, the ticket or the tests.

Evidence is the input that produces the wrong output.
