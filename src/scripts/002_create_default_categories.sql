-- Function to create default categories for new users
create or replace function public.create_default_categories(p_user_id uuid)
returns void
language plpgsql
security definer
as $$
begin
  -- Default expense categories
  insert into public.categories (user_id, name, type, color, icon) values
    (p_user_id, 'Alimentação', 'expense', '#ef4444', 'utensils'),
    (p_user_id, 'Transporte', 'expense', '#f59e0b', 'car'),
    (p_user_id, 'Moradia', 'expense', '#8b5cf6', 'home'),
    (p_user_id, 'Saúde', 'expense', '#ec4899', 'heart'),
    (p_user_id, 'Educação', 'expense', '#3b82f6', 'book'),
    (p_user_id, 'Lazer', 'expense', '#10b981', 'smile'),
    (p_user_id, 'Compras', 'expense', '#f97316', 'shopping-bag'),
    (p_user_id, 'Outros', 'expense', '#6b7280', 'more-horizontal');
  
  -- Default income categories
  insert into public.categories (user_id, name, type, color, icon) values
    (p_user_id, 'Salário', 'income', '#10b981', 'dollar-sign'),
    (p_user_id, 'Freelance', 'income', '#06b6d4', 'briefcase'),
    (p_user_id, 'Investimentos', 'income', '#8b5cf6', 'trending-up'),
    (p_user_id, 'Outros', 'income', '#6b7280', 'more-horizontal');
end;
$$;

-- Trigger to create default categories when user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform create_default_categories(new.id);
  return new;
end;
$$;

-- Drop trigger if exists and create new one
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();