# Timux About Copy A/B Test

## Experiment

- ID: `about_copy_v1`
- A: brand-story copy
- B: business-value copy
- Eligibility: visitors who open the standalone `/about/` or `/en/about/` page
- Assignment: 50/50 by browser, persisted in `localStorage`
- Exposure: `about_content_view` when at least 35% of the About page is visible
- QA override: `?about_variant=A` or `?about_variant=B` (preview only; does not overwrite the stored assignment or send experiment events)

No form text, email address, question content, or other personal data is sent to GA4.

## Events

- `experiment_impression`: variant rendered on the standalone About page
- `about_page_view`: standalone About route opened
- `about_content_view`: visitor actually saw the About content
- `about_page_engagement`: visible time for the About page
- `experiment_page_view`: subsequent site pages viewed by an assigned browser
- `experiment_session_started`: first measured page in a browser session
- `experiment_return_visit`: assigned browser returned on a later calendar day
- `page_scroll_depth`: 25%, 50%, 75%, and 90%
- `page_engagement_summary`: visible page time on exit
- `solution_selected`, `case_open`, `demo_start`, `case_guide_complete`: existing exploration events
- `agent_interaction`: AI advisor suggestion or typed question
- `feature_used`: case, adoption-method, contact, or other instrumented feature opened after exposure
- `contact_form_started`: first interaction with the contact form
- `contact_draft_ready`: local email summary prepared; this is not a received lead
  - includes privacy-safe `fields_completed` and `context_length_bucket`; form text is never sent to GA4
- `contact_summary_copied`: summary copied
- `contact_click` with `method=email_draft`: email client opened; this does not prove the email was sent
- `lead_submit_success`: emitted only after a lead backend confirms persistence and provides a submission ID

## GA4 comparison

Create event-scoped custom dimensions for:

- `experiment_id`
- `experiment_variant`
- `page_group`
- `engagement_bucket`
- `method`
- `scenario`
- `feature_name`
- `context_length_bucket`

Create an event-scoped custom metric for `fields_completed` if the amount of information entered should be compared directly.

Recommended exploration:

1. Filter `experiment_id = about_copy_v1`.
2. Use `experiment_variant` as the comparison dimension.
3. Use users with `about_content_view` as the exposed population.
4. Compare:
   - information entered: users with `contact_draft_ready`, plus `fields_completed` and `context_length_bucket`
   - primary intent: users with `contact_click` where `method=email_draft`
   - browsing: pages per exposed user and downstream `experiment_page_view`
   - feature use: `feature_used`, `demo_start`, `case_guide_complete`, and `agent_interaction`
   - engagement: GA4 engagement time plus `about_page_engagement`
   - actual leads: users with `lead_submit_success` only
   - return: GA4 returning users plus `experiment_return_visit`
5. Report user conversion rates, not raw event counts, so repeated clicks from one visitor do not inflate results.

Run for at least two full weekly cycles. Treat 200 exposed users per variant and 20 total primary-intent users as a practical first review gate, not a guarantee of statistical significance. If volume is lower, continue collecting rather than declaring a winner.

## Known limit

GA4 active users provide the unique-browser comparison for this anonymous experiment; the persisted assignment keeps each browser in one variant across sessions and pages. Without login, the same person on multiple browsers or devices cannot be merged reliably.

The current static contact form prepares an email draft locally. It does not persist a lead or confirm receipt, so `contact_draft_ready` and email clicks remain intent metrics. `lead_submit_success` is deliberately sent only after a backend-confirmed submission; actual lead conversion requires the unified lead backend tracked in project issue `OPS-602`.
