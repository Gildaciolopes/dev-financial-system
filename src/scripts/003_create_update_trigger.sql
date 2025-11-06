-- Function to update updated_at timestamp
create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$;

-- Add update triggers to tables with updated_at
create trigger update_transactions_updated_at
  before update on public.transactions
  for each row
  execute function public.update_updated_at_column();

create trigger update_financial_goals_updated_at
  before update on public.financial_goals
  for each row
  execute function public.update_updated_at_column();