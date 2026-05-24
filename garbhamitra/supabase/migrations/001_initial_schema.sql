-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles (extends Supabase auth)
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  name text,
  phone text unique,
  age int check (age between 18 and 50),
  height_cm numeric(5,2),
  city text,
  state text,
  food_preference text check (food_preference in ('vegetarian','non-vegetarian','eggetarian','jain')),
  regional_cuisine text,
  pregnancy_week int check (pregnancy_week between 1 and 45),
  due_date date,
  trimester int generated always as (
    case when pregnancy_week between 1 and 13 then 1
         when pregnancy_week between 14 and 27 then 2
         else 3 end
  ) stored,
  onboarding_completed boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Health profiles
create table health_profiles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id) on delete cascade unique,
  weight_kg numeric(5,2),
  pre_pregnancy_weight_kg numeric(5,2),
  has_gestational_diabetes boolean default false,
  has_thyroid boolean default false,
  has_iron_deficiency boolean default false,
  has_b12_deficiency boolean default false,
  has_bp_issue boolean default false,
  has_pcos boolean default false,
  has_anemia boolean default false,
  allergies text[] default '{}',
  current_supplements text[] default '{}',
  doctor_restrictions text,
  nausea_level int check (nausea_level between 1 and 5),
  activity_level text check (activity_level in ('sedentary','light','moderate','active')),
  sleep_hours numeric(3,1),
  meals_per_day int default 4,
  updated_at timestamptz default now()
);

-- Food items (Indian food database)
create table food_items (
  id uuid primary key default uuid_generate_v4(),
  name_english text not null,
  name_hindi text,
  name_regional text,
  aliases text[] default '{}',
  category text check (category in ('grain','dal','vegetable','fruit','dairy','non-veg','beverage','snack','sweet','oil','spice','supplement-food')),
  cuisine_tag text,
  serving_unit text not null,
  serving_size_grams numeric(8,2),
  calories numeric(8,2),
  protein_g numeric(8,3),
  carbs_g numeric(8,3),
  fiber_g numeric(8,3),
  fat_g numeric(8,3),
  saturated_fat_g numeric(8,3),
  sugar_g numeric(8,3),
  sodium_mg numeric(8,2),
  iron_mg numeric(8,3),
  calcium_mg numeric(8,2),
  folate_mcg numeric(8,2),
  b12_mcg numeric(8,3),
  vitamin_d_iu numeric(8,2),
  zinc_mg numeric(8,3),
  omega3_mg numeric(8,2),
  dha_mg numeric(8,2),
  choline_mg numeric(8,2),
  magnesium_mg numeric(8,2),
  potassium_mg numeric(8,2),
  hydration_per_serving_ml numeric(8,2) default 0,
  pregnancy_safe text check (pregnancy_safe in ('safe','avoid','moderate')) default 'safe',
  pregnancy_notes text,
  trimester_notes jsonb default '{}',
  is_verified boolean default false,
  created_at timestamptz default now()
);

-- Food logs
create table food_logs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id) on delete cascade,
  logged_at timestamptz default now(),
  meal_type text check (meal_type in ('breakfast','lunch','snack','dinner','drink')),
  food_item_id uuid references food_items(id),
  food_name_raw text not null,
  quantity numeric(8,2) not null,
  quantity_unit text not null,
  source text check (source in ('homemade','restaurant','packaged','unknown')) default 'homemade',
  calories numeric(8,2) default 0,
  protein_g numeric(8,3) default 0,
  carbs_g numeric(8,3) default 0,
  fiber_g numeric(8,3) default 0,
  fat_g numeric(8,3) default 0,
  iron_mg numeric(8,3) default 0,
  calcium_mg numeric(8,2) default 0,
  folate_mcg numeric(8,2) default 0,
  b12_mcg numeric(8,3) default 0,
  hydration_ml numeric(8,2) default 0,
  safety_flag text,
  ai_notes text,
  created_at timestamptz default now()
);

-- Daily summaries
create table daily_summaries (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id) on delete cascade,
  date date not null,
  total_calories numeric(8,2) default 0,
  total_protein_g numeric(8,3) default 0,
  total_iron_mg numeric(8,3) default 0,
  total_calcium_mg numeric(8,2) default 0,
  total_folate_mcg numeric(8,2) default 0,
  total_b12_mcg numeric(8,3) default 0,
  total_hydration_ml numeric(8,2) default 0,
  total_fiber_g numeric(8,3) default 0,
  pregnancy_safe_score int check (pregnancy_safe_score between 0 and 100),
  deficiency_flags text[] default '{}',
  positive_flags text[] default '{}',
  meal_count int default 0,
  weight_kg numeric(5,2),
  unique(user_id, date)
);

-- Nutrition targets (computed at onboarding)
create table nutrition_targets (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id) on delete cascade unique,
  trimester int,
  target_calories numeric(8,2),
  target_protein_g numeric(8,2),
  target_iron_mg numeric(8,2),
  target_calcium_mg numeric(8,2),
  target_folate_mcg numeric(8,2),
  target_b12_mcg numeric(8,3),
  target_water_ml numeric(8,2),
  target_fiber_g numeric(8,2),
  target_dha_mg numeric(8,2),
  target_vitamin_d_iu numeric(8,2),
  adjustment_reasons text[] default '{}',
  updated_at timestamptz default now()
);

-- WhatsApp sessions
create table whatsapp_sessions (
  id uuid primary key default uuid_generate_v4(),
  phone text unique not null,
  user_id uuid references profiles(id),
  session_state text default 'idle',
  pending_log jsonb default '{}',
  conversation_history jsonb default '[]',
  last_message_at timestamptz default now()
);

-- RLS policies
alter table profiles enable row level security;
alter table health_profiles enable row level security;
alter table food_logs enable row level security;
alter table daily_summaries enable row level security;
alter table nutrition_targets enable row level security;

-- Users can only access their own data
create policy "Users own their profile" on profiles for all using (auth.uid() = id);
create policy "Users own their health profile" on health_profiles for all using (auth.uid() = user_id);
create policy "Users own their logs" on food_logs for all using (auth.uid() = user_id);
create policy "Users own their summaries" on daily_summaries for all using (auth.uid() = user_id);
create policy "Users own their targets" on nutrition_targets for all using (auth.uid() = user_id);

-- Food items are public read
create policy "Food items are public" on food_items for select using (true);

-- Indexes for performance
create index idx_food_logs_user_date on food_logs(user_id, logged_at);
create index idx_daily_summaries_user_date on daily_summaries(user_id, date);
create index idx_food_items_name on food_items using gin(to_tsvector('english', name_english));
create index idx_food_items_aliases on food_items using gin(aliases);

-- Auto-update updated_at
create or replace function update_updated_at()
returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;

create trigger profiles_updated_at before update on profiles
  for each row execute function update_updated_at();
create trigger health_profiles_updated_at before update on health_profiles
  for each row execute function update_updated_at();
