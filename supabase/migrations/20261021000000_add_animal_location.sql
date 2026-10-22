alter table public.animals
  add column city text,
  add column state text;

alter table public.animals
  add constraint animals_city_length_check
    check (city is null or char_length(trim(city)) between 2 and 80),
  add constraint animals_state_uf_check
    check (
      state is null
      or state in (
        'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT',
        'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO',
        'RR', 'SC', 'SP', 'SE', 'TO'
      )
    );
