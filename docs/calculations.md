# How Costwatch calculates

All money math lives in [`web/lib/calc.ts`](../web/lib/calc.ts) as pure functions.

## Monthly equivalent

| Billing cycle | Monthly equivalent |
| --- | --- |
| Monthly | amount |
| Quarterly | amount ÷ 3 |
| Yearly | amount ÷ 12 |
| Custom: every *n* months | amount ÷ *n* |
| Custom: every *n* years | amount ÷ (12 × *n*) |
| Custom: every *n* weeks / days | amount ÷ (*n* × 7 ÷ 30.4375) / amount ÷ (*n* ÷ 30.4375) |
| One-time | not included |

A 30.4375-day average month (365.25 ÷ 12) is used for day and week intervals, so "every 30
days" comes out slightly higher than monthly, as it really is. Every derived value is labelled
as an estimate in the UI.

## Monthly cost

The **monthly cost** is the sum of monthly equivalents of costs that are:

- `active` (paused and inactive costs are kept but not counted),
- recurring (not one-time), and
- in the **product's currency**.

## Currencies

Costwatch never converts currencies. Costs and revenue in another currency are listed with a
clear marker and summarised in a notice ("Not included: 1 cost in $20/mo…"), but they are not
added to totals.

## Profit and margin

```
estimated profit = revenue recorded in the current month − monthly cost
profit margin    = profit ÷ revenue × 100
```

When revenue is zero, the margin is not calculated and the UI shows "No revenue recorded".
Sums of stored amounts are done in integer cents to avoid floating-point drift.

"Current month" uses the viewer's timezone, which the browser reports in a cookie. Without it,
Costwatch falls back to UTC.

## Renewals

A cost's next renewal is the renewal date you entered. If that date has passed, it is rolled
forward by the billing interval until it is today or later, always counting from the original
date so month-end dates don't drift (Jan 31 → Feb 28 → Mar 31). Projected dates are marked
"Estimated". One-time, paused and inactive costs have no renewals.

## Cost history

A database trigger writes a snapshot to `cost_history` whenever a cost is created or its
amount, currency, billing cycle or status changes. The monthly cost for a past month is rebuilt
from those snapshots:

- a cost counts from its start date (or the day it was added);
- its price and status are those of the last snapshot recorded on or before the end of that
  month (or today, for the current month);
- months between the start date and the first snapshot use the first snapshot.

"Cost changes" and the growth markers on the Costs page compare these snapshots.
