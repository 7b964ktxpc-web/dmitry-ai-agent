create unique index if not exists conversations_agent_external_idx
on public.conversations(agent_id, external_chat_id);
