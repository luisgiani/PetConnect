alter table public.profiles
  drop constraint if exists profiles_state_format;

alter table public.profiles
  add constraint profiles_state_valid
  check (
    state is null
    or state in (
      'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT',
      'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO',
      'RR', 'SC', 'SP', 'SE', 'TO'
    )
  );
