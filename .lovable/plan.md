## Goal

Delete the 7 campaigns immediately below the 2 most recent successful ones. Keep everything else.

## Keep

- `Limoniada` (20:06)
- `Untitled campaign` `5f385c01…` (19:56)
- All campaigns older than the 7 below (starting at `Bombaclaaaat` and down)

## Delete (7)

| # | Name | Status | Updated |
|---|------|--------|---------|
| 1 | Untitled campaign `9513f611…` | draft | 19:45 |
| 2 | Untitled campaign `7bae9f1a…` | draft | 19:31 |
| 3 | Untitled campaign `8542d119…` | ready | 19:29 |
| 4 | Untitled campaign `af72a765…` | ready | 19:01 |
| 5 | Untitled campaign `d904d819…` | ready | 18:58 |
| 6 | Untitled campaign `22a4c588…` | ready | 18:55 |
| 7 | `????` `1e7461df…` | ready | 18:51 |

## How

One `DELETE FROM campaigns WHERE id IN (...)` for those 7 ids. Related rows in `variants`, `campaign_assets`, `creative_briefs`, and `director_messages` cascade. Storage objects under `campaign-inputs/{id}/` and `campaign-outputs/{id}/` for those 7 ids are removed via the service-role client.

## Out of scope

- The 2 keepers and all 19 older campaigns are untouched.
- No code, UI, or schema changes.
