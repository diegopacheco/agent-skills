# test-climb transcript on the invoice sample

Every command test-climb ran on a git copy of this sample, with its real output, in order.

### init

```
$ climb.sh init --test "node --test" --coverage 'node --test --experimental-test-coverage 2>&1 | awk -F"|" '\''/all files/{gsub(/[ ℹ]/,"",$2); print $2"%"}'\''' --patience 2
branch test-climb/2026-11-24-1537, baseline coverage 37.93%
```

### mutant: 1000 boundary

```
$ climb.sh mutant src/invoice.mjs 12 ">= 1000" "> 1000" "node --test test/discount.test.mjs"
killed: src/invoice.mjs:12 '>= 1000' -> '> 1000'. The test fails when the logic breaks
```

### mutant: 500 boundary

```
$ climb.sh mutant src/invoice.mjs 15 ">= 500" "> 500" "node --test test/discount.test.mjs"
killed: src/invoice.mjs:15 '>= 500' -> '> 500'. The test fails when the logic breaks
```

### try

```
$ climb.sh try "discount tiers start exactly at 500 and 1000" test/discount.test.mjs
kept: coverage 51.72%, committed
next: continue (0/2 steps without gain)
```

### mutant: default rate

```
$ climb.sh mutant src/invoice.mjs 22 "?? TAX.DEFAULT" "?? 0" "node --test test/tax.test.mjs"
killed: src/invoice.mjs:22 '?? TAX.DEFAULT' -> '?? 0'. The test fails when the logic breaks
```

### try

```
$ climb.sh try "unknown states are taxed at the default rate, never zero" test/tax.test.mjs
kept: coverage 56.90%, committed
next: continue (0/2 steps without gain)
```

### mutant on a weak test

```
$ climb.sh mutant src/invoice.mjs 30 "items - 3" "items - 2" "node --test test/shipping.test.mjs"
survived: src/invoice.mjs:30 'items - 3' -> 'items - 2'. The tests pass with broken code, strengthen the assertion
```

### mutant: free shipping boundary

```
$ climb.sh mutant src/invoice.mjs 27 ">= 300" "> 300" "node --test test/shipping.test.mjs"
killed: src/invoice.mjs:27 '>= 300' -> '> 300'. The test fails when the logic breaks
```

### mutant: items above 3

```
$ climb.sh mutant src/invoice.mjs 30 "items - 3" "items - 2" "node --test test/shipping.test.mjs"
killed: src/invoice.mjs:30 'items - 3' -> 'items - 2'. The test fails when the logic breaks
```

### try

```
$ climb.sh try "free shipping starts at 300 and extra items cost 2 each" test/shipping.test.mjs
kept: coverage 65.52%, committed
next: continue (0/2 steps without gain)
```

### mutant: cents rounding

```
$ climb.sh mutant src/invoice.mjs 4 "value * 100) / 100" "value * 10) / 10" "node --test test/total.test.mjs"
killed: src/invoice.mjs:4 'value * 100) / 100' -> 'value * 10) / 10'. The test fails when the logic breaks
```

### mutant: tax on net, not subtotal

```
$ climb.sh mutant src/invoice.mjs 37 "tax(net, state)" "tax(sub, state)" "node --test test/total.test.mjs"
killed: src/invoice.mjs:37 'tax(net, state)' -> 'tax(sub, state)'. The test fails when the logic breaks
```

### try

```
$ climb.sh try "the invoice total is rounded to cents after discount, tax and shipping" test/total.test.mjs
kept: coverage 77.59%, committed
next: continue (0/2 steps without gain)
```

### mutant: at most 2 digits

```
$ climb.sh mutant src/coupon.mjs 2 "{1,2}" "{1,3}" "node --test test/coupon.test.mjs"
killed: src/coupon.mjs:2 '{1,2}' -> '{1,3}'. The test fails when the logic breaks
```

### try

```
$ climb.sh try "a coupon can never take 100 percent or more" test/coupon.test.mjs
kept: coverage 87.93%, committed
next: continue (0/2 steps without gain)
```

### mutant: last day

```
$ climb.sh mutant src/coupon.mjs 10 "today > coupon" "today >= coupon" "node --test test/apply-coupon.test.mjs"
killed: src/coupon.mjs:10 'today > coupon' -> 'today >= coupon'. The test fails when the logic breaks
```

### try

```
$ climb.sh try "a coupon expires after its last day, not on it" test/apply-coupon.test.mjs
kept: coverage 100.00%, committed
next: continue (0/2 steps without gain)
```

### mutant: 10 percent

```
$ climb.sh mutant src/invoice.mjs 13 "0.1" "0.2" "node --test test/discount-big.test.mjs"
killed: src/invoice.mjs:13 '0.1' -> '0.2'. The test fails when the logic breaks
```

### try

```
$ climb.sh try "large orders get exactly 10 percent" test/discount-big.test.mjs
rejected: coverage 100.00% is not above 100.00%, reverted
next: continue (1/2 steps without gain)
```

### mutant: reduce start

```
$ climb.sh mutant src/invoice.mjs 8 "line.qty, 0)" "line.qty, 1)" "node --test test/subtotal-empty.test.mjs"
killed: src/invoice.mjs:8 'line.qty, 0)' -> 'line.qty, 1)'. The test fails when the logic breaks
```

### try

```
$ climb.sh try "an empty invoice costs nothing" test/subtotal-empty.test.mjs
rejected: coverage 100.00% is not above 100.00%, reverted
next: stop, 2 steps in a row without gain. Run climb.sh report
```

### status

```
$ climb.sh status
branch test-climb/2026-11-24-1537, baseline 37.93%, best 100.00%, step 8
0  2026-11-24 15:37  baseline  37.93   37.93   -                             suite green before climbing
1  2026-11-24 15:37  kept      51.72   51.72   test/discount.test.mjs        discount tiers start exactly at 500 and 1000
2  2026-11-24 15:37  kept      56.90   56.90   test/tax.test.mjs             unknown states are taxed at the default rate, never zero
3  2026-11-24 15:37  kept      65.52   65.52   test/shipping.test.mjs        free shipping starts at 300 and extra items cost 2 each
4  2026-11-24 15:37  kept      77.59   77.59   test/total.test.mjs           the invoice total is rounded to cents after discount, tax and shipping
5  2026-11-24 15:37  kept      87.93   87.93   test/coupon.test.mjs          a coupon can never take 100 percent or more
6  2026-11-24 15:37  kept      100.00  100.00  test/apply-coupon.test.mjs    a coupon expires after its last day, not on it
7  2026-11-24 15:37  no-gain   100.00  100.00  test/discount-big.test.mjs    large orders get exactly 10 percent
8  2026-11-24 15:37  no-gain   100.00  100.00  test/subtotal-empty.test.mjs  an empty invoice costs nothing
next: stop, 2 steps in a row without gain. Run climb.sh report
```

### report

```
$ climb.sh report
wrote climb-report.md and climb-chart.svg, committed on test-climb/2026-11-24-1537
```

### end

```
$ climb.sh end
climb state removed, branch test-climb/2026-11-24-1537 stays
```

### git log

```
$ git log --format="%h %s" main..HEAD
2b8b11d invoice: test-climb report 37.93% -> 100.00%
d8f006b invoice: test-climb 87.93% -> 100.00% a coupon expires after its last day, not on it
e95ff7f invoice: test-climb 77.59% -> 87.93% a coupon can never take 100 percent or more
9757e95 invoice: test-climb 65.52% -> 77.59% the invoice total is rounded to cents after discount, tax and shipping
c7f237f invoice: test-climb 56.90% -> 65.52% free shipping starts at 300 and extra items cost 2 each
fda05fb invoice: test-climb 51.72% -> 56.90% unknown states are taxed at the default rate, never zero
cb1c854 invoice: test-climb 37.93% -> 51.72% discount tiers start exactly at 500 and 1000
```

### commits on the climb branch

```
2b8b11d invoice: test-climb report 37.93% -> 100.00%
d8f006b invoice: test-climb 87.93% -> 100.00% a coupon expires after its last day, not on it
e95ff7f invoice: test-climb 77.59% -> 87.93% a coupon can never take 100 percent or more
9757e95 invoice: test-climb 65.52% -> 77.59% the invoice total is rounded to cents after discount, tax and shipping
c7f237f invoice: test-climb 56.90% -> 65.52% free shipping starts at 300 and extra items cost 2 each
fda05fb invoice: test-climb 51.72% -> 56.90% unknown states are taxed at the default rate, never zero
cb1c854 invoice: test-climb 37.93% -> 51.72% discount tiers start exactly at 500 and 1000
```
