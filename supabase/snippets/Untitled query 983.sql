delete from public.activities
where type = 'email_received' and message like '%Initiativbewerbung%';

delete from public.email_messages
where subject like '%Initiativbewerbung%';