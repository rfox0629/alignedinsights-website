alter table public.aligned_insights_inquiries
add column if not exists looking_for_values text[];

update public.aligned_insights_inquiries
set looking_for_values = case
  when looking_for = any (array[
    'Accounting and bookkeeping',
    'Payroll support',
    'Financial reporting',
    'Board or leadership dashboards',
    'Fractional finance team',
    'Not sure yet'
  ]::text[]) then array[looking_for]
  else array['Not sure yet']
end
where looking_for_values is null;

alter table public.aligned_insights_inquiries
drop column looking_for;

alter table public.aligned_insights_inquiries
rename column looking_for_values to looking_for;

alter table public.aligned_insights_inquiries
alter column looking_for set default '{}'::text[],
alter column looking_for set not null;

update public.aligned_insights_inquiries
set phone = 'Not provided'
where phone is null or btrim(phone) = '';

alter table public.aligned_insights_inquiries
alter column phone set not null;

alter table public.aligned_insights_inquiries
drop constraint if exists aligned_insights_inquiries_phone_required,
drop constraint if exists aligned_insights_inquiries_looking_for_required,
drop constraint if exists aligned_insights_inquiries_looking_for_allowed;

alter table public.aligned_insights_inquiries
add constraint aligned_insights_inquiries_phone_required
check (btrim(phone) <> ''),
add constraint aligned_insights_inquiries_looking_for_required
check (cardinality(looking_for) > 0),
add constraint aligned_insights_inquiries_looking_for_allowed
check (
  looking_for <@ array[
    'Accounting and bookkeeping',
    'Payroll support',
    'Financial reporting',
    'Board or leadership dashboards',
    'Fractional finance team',
    'Not sure yet'
  ]::text[]
);
