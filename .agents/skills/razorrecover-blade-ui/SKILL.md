---
name: razorrecover-blade-ui
description: Frontend UI specification for RazorRecover AI using Razorpay Blade Design System — page layouts, component mapping, visual hierarchy, spacing tokens, and responsive patterns.
---

# RazorRecover AI — Blade UI Specification

## Design System
- **Framework:** Razorpay Blade Design System v1.26.0
- **Install:** `@razorpay/blade`
- **Provider:** Wrap app in `<BladeProvider theme="bladeTheme">`
- **Principle:** Use Blade components exclusively — no custom styles unless absolutely required

## Spacing Tokens
```
spacing.0  = 0px
spacing.1  = 2px
spacing.2  = 4px
spacing.3  = 8px
spacing.4  = 12px
spacing.5  = 16px
spacing.6  = 20px
spacing.7  = 24px
spacing.8  = 32px
spacing.9  = 40px
spacing.10 = 48px
spacing.11 = 56px
```

## Responsive Breakpoints
```
base = 0px (mobile first)
xs   = 320px (small mobiles)
s    = 480px (mobiles, small tablets)
m    = 768px (tablets, treat as desktop)
l    = 1024px (desktop)
xl   = 1200px (HD desktop)
```

## App Shell
```jsx
<BladeProvider theme="bladeTheme">
  <Box display="flex" minHeight="100vh">
    <SideNav>
      <SideNavLink icon={DashboardIcon} title="Dashboard" href="/" />
      <SideNavLink icon={ListIcon} title="Recoveries" href="/recoveries" />
      <SideNavLink icon={AlertIcon} title="Human Review" href="/review" />
      <SideNavLink icon={SettingsIcon} title="Policies" href="/policies" />
    </SideNav>
    <Box flex="1" padding="spacing.8">
      <Router />
    </Box>
  </Box>
</BladeProvider>
```

## Page 1 — Dashboard (Visual Hierarchy)

### Priority Order
1. **Revenue Recovered** (most important — largest, top-left)
2. **Revenue at Risk** (second)
3. **Recovery Rate** (third)
4. **Active Recoveries** + **Human Reviews** (operational)

### Layout
```
┌─────────────────────────────────────────────────┐
│ TopNav: "RazorRecover AI" + Run Recovery Button │
├─────────────────────────────────────────────────┤
│ MetricCards Row (5 cards using Box + Card)       │
│ [Recovered] [At Risk] [Rate] [Active] [Reviews] │
├─────────────────────────────────────────────────┤
│ ┌──────────────────┐ ┌────────────────────────┐ │
│ │ Revenue Breakdown │ │ Live Agent Activity    │ │
│ │ (Recharts Bar)   │ │ (Real-time feed)       │ │
│ └──────────────────┘ └────────────────────────┘ │
├─────────────────────────────────────────────────┤
│ Recent Recoveries Table                         │
└─────────────────────────────────────────────────┘
```

### Blade Components
- `Card` for metric cards and chart containers
- `Heading` size="large" for card values (₹ amounts)
- `Text` for labels
- `Badge` for status (Recovered=positive, Failed=negative, Pending=notice)
- `Button` variant="primary" for "Run Recovery"
- `Box` with `display="flex"` and `gap="spacing.7"` for grid layout
- `Table` for recent recoveries
- `ProgressBar` for batch progress during run

## Page 2 — Revenue Opportunities (Recoveries)

### Blade Components
- `Table` with sortable columns
- `Badge` for scenario type and status
- `Text` for amounts (formatted as ₹)
- `Box` with filters (Blade `Dropdown` for scenario, status)
- Click row → navigate to `/recoveries/:id`

### Columns
| Column | Component | Sortable |
|:---|:---|:---|
| Customer | Text | No |
| Scenario | Badge (info/notice/warning) | Yes |
| Amount | Text (₹ formatted) | Yes |
| Probability | Text (%) | Yes |
| Priority | Text | Yes |
| Action | Badge | No |
| Status | Badge (positive/negative/notice) | Yes |

## Page 3 — Recovery Detail

### Layout
```
┌─────────────────────────────────────────────────┐
│ Case Header: ID + Status Badge + Amount         │
├──────────────────────┬──────────────────────────┤
│ AI Decision Panel    │ Audit Timeline           │
│ ┌──────────────────┐ │ ┌──────────────────────┐ │
│ │ Why at risk?     │ │ │ 09:10:01 Payment     │ │
│ │ Why recoverable? │ │ │ failed               │ │
│ │ What to do?      │ │ │ 09:10:02 Revenue     │ │
│ │ Confidence: 94%  │ │ │ detected             │ │
│ └──────────────────┘ │ │ 09:10:03 AI          │ │
│                      │ │ diagnosis            │ │
│ Policy Decision      │ │ ...                  │ │
│ ┌──────────────────┐ │ └──────────────────────┘ │
│ │ ✓ Checks passed  │ │                          │
│ │ ✓ Action allowed │ │                          │
│ └──────────────────┘ │                          │
└──────────────────────┴──────────────────────────┘
```

### Blade Components
- `Card` for AI Decision Panel and Policy Decision
- `Heading` + `Text` for case info
- `Badge` variant="positive|negative|notice" for status
- `Divider` between sections
- `Box` with `flexDirection="column"` and `gap="spacing.5"` for timeline items
- `Alert` for blocked/stopped cases

## Page 4 — Human Review Queue

### Blade Components
- `Card` for each review item
- `Heading` for amount
- `Text` for reason and AI recommendation
- `Button` variant="primary" for Approve
- `Button` variant="tertiary" for Reject
- `Alert` variant="notice" for why human review is needed
- `Badge` for risk level

## Page 5 — Policies

### Blade Components
- `Card` for each policy section
- `TextInput` type="number" for thresholds
- `Switch` for enable/disable rules
- `Text` for descriptions
- `Divider` between policy groups

## Component Patterns

### MetricCard
```jsx
<Card padding="spacing.7">
  <Box display="flex" flexDirection="column" gap="spacing.3">
    <Text size="small" color="surface.text.gray.muted">{label}</Text>
    <Heading size="large">{value}</Heading>
    <Badge variant={trend > 0 ? 'positive' : 'negative'}>
      {trend}%
    </Badge>
  </Box>
</Card>
```

### Status Badge Mapping
```
RECOVERED          → Badge variant="positive"
FAILED             → Badge variant="negative"
EXECUTING / ACTIVE → Badge variant="information"
HUMAN_REVIEW       → Badge variant="notice"
BLOCKED            → Badge variant="negative"
HALTED             → Badge variant="negative"
DETECTED           → Badge variant="information"
```

## Color Intent
- **Financial recovery (positive):** Use Blade's positive feedback color
- **Revenue at risk:** Use Blade's negative/notice feedback color
- **Active processes:** Use Blade's information feedback color
- **Needs attention:** Use Blade's notice feedback color

## Key Rule
> "It should feel like a financial operations command center, not a generic AI dashboard."

Use `get_blade_component_docs` and `get_blade_pattern_docs` MCP tools before implementing any component.
