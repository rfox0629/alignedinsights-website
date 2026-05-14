alter table public.financial_intake_links
add column if not exists inquiry_id uuid references public.aligned_insights_inquiries(id) on delete set null;

alter table public.financial_intake_submissions
add column if not exists inquiry_id uuid references public.aligned_insights_inquiries(id) on delete set null;

create index if not exists financial_intake_links_inquiry_id_idx
on public.financial_intake_links (inquiry_id);

create index if not exists financial_intake_submissions_inquiry_id_idx
on public.financial_intake_submissions (inquiry_id);
