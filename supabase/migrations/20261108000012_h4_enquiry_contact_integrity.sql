-- Every inserted message starts unread, including direct inserts under RLS.
create function public.tg_enquiry_message_clear_read_at()
returns trigger language plpgsql set search_path = public as $$
begin
  new.read_at := null;
  return new;
end $$;

create trigger enquiry_message_clear_read_at
  before insert on public.enquiry_messages
  for each row execute function public.tg_enquiry_message_clear_read_at();

revoke execute on function public.tg_enquiry_message_clear_read_at()
  from public, anon, authenticated;

-- Contact reveal: login required. Returns numbers + logs the tap.
create or replace function public.reveal_contact(
  p_business uuid,
  p_channel public.contact_channel,
  p_product uuid default null
)
returns table (phone text, whatsapp text)
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then
    raise exception 'login_required' using errcode = '28000';
  end if;
  if not exists (select 1 from public.businesses where id = p_business and status = 'approved') then
    raise exception 'business_not_available' using errcode = 'P0002';
  end if;
  if p_product is not null and not exists (
    select 1 from public.products where id = p_product and business_id = p_business
  ) then
    raise exception 'product_not_in_business' using errcode = '23514';
  end if;
  -- light abuse brake: 60 reveals / user / hour
  if (select count(*) from public.contact_events
       where user_id = auth.uid() and created_at > now() - interval '1 hour') >= 60 then
    raise exception 'rate_limited' using errcode = '53400';
  end if;

  insert into public.contact_events (user_id, business_id, product_id, channel)
  values (auth.uid(), p_business, p_product, p_channel);

  return query select c.phone, c.whatsapp from public.business_contacts c where c.business_id = p_business;
end $$;
