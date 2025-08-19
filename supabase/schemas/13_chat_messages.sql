-- Chat messages table - manages Telegram chat messages
-- File: 13_chat_messages.sql

create table chat_messages (
    id uuid primary key default gen_random_uuid(),
    project_id uuid not null references projects(id) on delete cascade,
    customer_id uuid not null references customers(id),
    telegram_message_id bigint,
    
    message_type message_type_enum default 'text',
    direction message_direction_enum not null,
    content text,
    media_url varchar(500),
    
    -- Bot response tracking
    is_auto_reply boolean default false,
    reply_to_message_id uuid references chat_messages(id),
    
    created_at timestamp with time zone default now()
);

-- Indexes
create index idx_chat_messages_project_customer on chat_messages(project_id, customer_id);
create index idx_chat_messages_created on chat_messages(created_at desc);

-- Row Level Security (enabled here, policies added later in 80_rls_policies.sql)
alter table chat_messages enable row level security;

comment on table chat_messages is 'Chat messages between customers and business via Telegram bot.';
