# Page views

Added 2026-11-17 at Julia's request: analytics that visitors don't see. No banner, no cookies, no visitor IDs, no IP.

## What happens
- The deploy (`scripts/build-site.mjs`) inlines `scripts/count.js` at the end of every deployed `.html` page.
  Source files in the repo are not touched. Supabase project **register** (`ycolvxmvcmxfnuicgfay`).
- **Views** (`public.tools_views`): one row on load and on each library route change (`#/...`): time, path, library
  route, the referring site's host (other sites only), a device class from the window width (phone under 640 px,
  tablet under 1024 px, desktop otherwise), and `pv`.
- **Interactions** (`public.tools_dials`, added the same night): one row each time a visitor sets a control:
  time, path, area (`params`, `color`, `presets`, `more`, `view`, `motion`, `note`, `tab`, `panel`, or `page` for
  controls outside the plate panel), the control's name (`Finish`, `Ink · Dark blue`, `Reset all`, `Color`), and
  its value for sliders, number fields, colors, choices, toggles and menus. Text a visitor types is never sent,
  only that the field was edited. Counted: a slider let go, a number committed, keyboard steps (read 0.7 s after the
  keys stop), a color picked, a choice, a palette, a preset, a reset, a tab, a panel button. Not counted: changes
  made by the page's own scripts. At most 150 per page load; the same control and value within 1.5 s count once.
- `pv` is a random id made for each page load and kept only in memory (nothing is stored in the browser). It joins
  a view to its interactions; it cannot link one page or visit to another.

## Not counted
- Pages inside a frame (plates load their source pages in hidden frames).
- Automated browsers (`navigator.webdriver`: Playwright QA, the guard).
- Any browser holding the CMS token (`localStorage['tools.token']`): Julia.
- Any host other than `jalulia.github.io` (local servers, previews, forks).

## Access
- The page uses the project's publishable key. Its role can only insert the listed columns of the two tables; it
  cannot read, change or delete rows. Check constraints cap every field's length.
- Read the numbers in the Supabase dashboard (register → Table editor → `tools_views`) or SQL editor, e.g.

```sql
-- views per page, last 30 days
select path, route, count(*) as views from tools_views
where at > now() - interval '30 days' group by 1, 2 order by 3 desc;

-- where visitors came from
select coalesce(ref, '(direct or internal)') as ref, count(*) from tools_views
where at > now() - interval '30 days' group by 1 order by 2 desc;

-- which plates people actually play with: views, views with any interaction, share
select v.path, count(distinct v.pv) as views, count(distinct d.pv) as touched,
       round(100.0 * count(distinct d.pv) / nullif(count(distinct v.pv), 0)) as pct
from tools_views v left join tools_dials d on d.pv = v.pv
where v.at > now() - interval '30 days' group by 1 order by touched desc, views desc;

-- the most-used controls on one page
select control, area, count(*) as times, count(distinct pv) as visits from tools_dials
where path like '%pl-44%' group by 1, 2 order by 3 desc;

-- where people leave a slider (most common values)
select control, value, count(*) from tools_dials
where path like '%pl-44%' and area = 'params' and value is not null group by 1, 2 order by 1, 3 desc;

-- views per day
select date_trunc('day', at at time zone 'America/New_York')::date as day, count(*) from tools_views group by 1 order by 1 desc;
```

## Limits
- Page views, not people: with no visitor IDs there is no unique-visitor count. Interactions are per page load.
- The script and key are readable in the public repo and in page source; hidden from visitors, not from anyone
  reading the source.
- Visitors with JavaScript off are not counted.

## Later
- Per-share-link counts arrive with the Supabase sharing phase (docs/CMS.md).
