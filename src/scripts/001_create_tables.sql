-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create categories table
create table if not exists public.categories (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  type text not null check (type in ('income', 'expense')),
  color text not null default '#6366f1',
  icon text not null default 'circle',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create transactions table
create table if not exists public.transactions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category_id uuid references public.categories(id) on delete set null,
  type text not null check (type in ('income', 'expense')),
  amount decimal(12, 2) not null check (amount > 0),
  description text,
  date date not null default current_date,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create financial_goals table
create table if not exists public.financial_goals (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  target_amount decimal(12, 2) not null check (target_amount > 0),
  current_amount decimal(12, 2) not null default 0 check (current_amount >= 0),
  deadline date,
  status text not null default 'active' check (status in ('active', 'completed', 'cancelled')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create budgets table
create table if not exists public.budgets (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category_id uuid not null references public.categories(id) on delete cascade,
  amount decimal(12, 2) not null check (amount > 0),
  month date not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, category_id, month)
);

-- Create indexes for better query performance
create index if not exists idx_categories_user_id on public.categories(user_id);
create index if not exists idx_transactions_user_id on public.transactions(user_id);
create index if not exists idx_transactions_date on public.transactions(date);
create index if not exists idx_transactions_category_id on public.transactions(category_id);
create index if not exists idx_financial_goals_user_id on public.financial_goals(user_id);
create index if not exists idx_budgets_user_id on public.budgets(user_id);
create index if not exists idx_budgets_month on public.budgets(month);

-- Enable Row Level Security
alter table public.categories enable row level security;
alter table public.transactions enable row level security;
alter table public.financial_goals enable row level security;
alter table public.budgets enable row level security;

-- RLS Policies for categories
create policy "Users can view own categories"
  on public.categories for select
  using (auth.uid() = user_id);

create policy "Users can insert own categories"
  on public.categories for insert
  with check (auth.uid() = user_id);

create policy "Users can update own categories"
  on public.categories for update
  using (auth.uid() = user_id);

create policy "Users can delete own categories"
  on public.categories for delete
  using (auth.uid() = user_id);

-- RLS Policies for transactions
create policy "Users can view own transactions"
  on public.transactions for select
  using (auth.uid() = user_id);

create policy "Users can insert own transactions"
  on public.transactions for insert
  with check (auth.uid() = user_id);

create policy "Users can update own transactions"
  on public.transactions for update
  using (auth.uid() = user_id);

create policy "Users can delete own transactions"
  on public.transactions for delete
  using (auth.uid() = user_id);

-- RLS Policies for financial_goals
create policy "Users can view own goals"
  on public.financial_goals for select
  using (auth.uid() = user_id);

create policy "Users can insert own goals"
  on public.financial_goals for insert
  with check (auth.uid() = user_id);

create policy "Users can update own goals"
  on public.financial_goals for update
  using (auth.uid() = user_id);

create policy "Users can delete own goals"
  on public.financial_goals for delete
  using (auth.uid() = user_id);

-- RLS Policies for budgets
create policy "Users can view own budgets"
  on public.budgets for select
  using (auth.uid() = user_id);

create policy "Users can insert own budgets"
  on public.budgets for insert
  with check (auth.uid() = user_id);

create policy "Users can update own budgets"
  on public.budgets for update
  using (auth.uid() = user_id);

create policy "Users can delete own budgets"
  on public.budgets for delete
  using (auth.uid() = user_id);