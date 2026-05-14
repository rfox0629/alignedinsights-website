alter table public.aligned_insights_inquiries
add column if not exists submission_token text;

update public.aligned_insights_inquiries
set submission_token = gen_random_uuid()::text
where submission_token is null;

alter table public.aligned_insights_inquiries
alter column submission_token set default gen_random_uuid()::text,
alter column submission_token set not null;

create unique index if not exists aligned_insights_inquiries_submission_token_idx
on public.aligned_insights_inquiries (submission_token);
