# Timux About Copy A/B Test

## Experiment

- ID: `about_copy_v1`
- A: brand-story copy
- B: business-value copy
- Eligibility: visitors assigned on the Timux homepage
- Assignment: 50/50 by browser, persisted in `localStorage`
- Exposure: `about_section_view` when at least 35% of the section is visible
- QA override: `?about_variant=A` or `?about_variant=B` (preview only; does not overwrite the stored assignment)

No form text, email address, question content, or other personal data is sent to GA4.

## Events

- `experiment_impression`: variant rendered on the homepage
- `about_section_view`: visitor actually reached the About section
- `about_section_engagement`: visible time for the About section
- `experiment_page_view`: subsequent site pages viewed by an assigned browser
- `experiment_session_started`: first measured page in a browser session
- `experiment_return_visit`: assigned browser returned on a later calendar day
- `page_scroll_depth`: 25%, 50%, 75%, and 90%
- `page_engagement_summary`: visible page time on exit
- `solution_selected`, `case_open`, `demo_start`, `case_guide_complete`: existing exploration events
- `agent_interaction`: AI advisor suggestion or typed question
- `contact_form_started`: first interaction with the contact form
- `contact_draft_ready`: local email summary prepared; this is not a received lead
- `contact_summary_copied`: summary copied
- `contact_click` with `method=email_draft`: email client opened; this does not prove the email was sent

## GA4 comparison

Create event-scoped custom dimensions for:

- `experiment_id`
- `experiment_variant`
- `page_group`
- `engagement_bucket`
- `method`
- `scenario`

Recommended exploration:

1. Filter `experiment_id = about_copy_v1`.
2. Use `experiment_variant` as the comparison dimension.
3. Use users with `about_section_view` as the exposed population.
4. Compare:
   - primary intent: users with `contact_draft_ready` or `contact_click` where `method=email_draft`
   - browsing: pages per exposed user and downstream `experiment_page_view`
   - feature use: `demo_start`, `case_guide_complete`, and `agent_interaction`
   - engagement: GA4 engagement time plus `about_section_engagement`
   - return: GA4 returning users plus `experiment_return_visit`
5. Report user conversion rates, not raw event counts, so repeated clicks from one visitor do not inflate results.

Run for at least two full weekly cycles. Treat 200 exposed users per variant and 20 total primary-intent users as a practical first review gate, not a guarantee of statistical significance. If volume is lower, continue collecting rather than declaring a winner.

## Known limit

The current static contact form prepares an email draft locally. It does not persist a lead or confirm receipt. Actual lead conversion requires the separate unified lead backend tracked in project issue `OPS-602`.
