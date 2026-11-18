# Page views

Added 2026-11-17 at Julia's request: analytics that visitors don't see. No banner, no cookies, no visitor IDs, no IP.

## What happens
- The deploy (`scripts/build-site.mjs`, `COUNT`) adds one small inline script before `</body>` on every deployed
  `.html` page. Source files in the repo are not touched.
- On load, and on each library route change (`#/...`), it posts one row to Supabase:
  project **register** (`ycolvxmvcmxfnuicgfay`), table `public.tools_views`.
- A row holds: time, path, library route, the referring site's host (other sites only), and a device class from
  the window width (phone under 640 px, tablet under 1024 px, desktop otherwise). Nothing else.

## Not counted
- Pages inside a frame (plates load their source pages in hidden frames).
- Automated browsers (`navigator.webdriver`: Playwright QA, the guard).
- Any browser holding the CMS token (`localStorage['tools.token']`): Julia.
- Any host other than `jalulia.github.io` (local servers, previews, forks).

## Access
- The page uses the project's publishable key. Its role can only insert those four columns; it cannot read,
  change or delete rows. Check constraints cap every field's length.
- Read the numbers in the Supabase dashboard (register → Table editor → `tools_views`) or SQL editor, e.g.

```sql
-- views per page, last 30 days
select path, route, count(*) as views from tools_views
where at > now() - interval '30 days' group by 1, 2 order by 3 desc;

-- where visitors came from
select coalesce(ref, '(direct or internal)') as ref, count(*) from tools_views
where at > now() - interval '30 days' group by 1 order by 2 desc;

-- views per day
select date_trunc('day', at at time zone 'America/New_York')::date as day, count(*) from tools_views group by 1 order by 1 desc;
```

## Limits
- Page views, not people: with no IDs there is no unique-visitor count.
- The script and key are readable in the public repo and in page source; hidden from visitors, not from anyone
  reading the source.
- Visitors with JavaScript off are not counted.

## Later
- Per-share-link counts arrive with the Supabase sharing phase (docs/CMS.md).
