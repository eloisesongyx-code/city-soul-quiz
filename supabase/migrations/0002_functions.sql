-- 城市灵魂测评：受控数据库函数
--
-- 安全模型：函数为 SECURITY INVOKER（继承调用者权限）。
-- 所有表均已启用 RLS 且无任何 anon/authenticated 策略，因此：
--   - 匿名/普通用户直接调用 rpc 会因 RLS 被拒绝；
--   - 仅 Edge Functions（以 service_role 调用，BYPASSRLS）可实际执行。
-- 密码哈希使用 pgcrypto 的 bcrypt（crypt / gen_salt）。

-- ---------------------------------------------------------------
-- start-test：验证密码、原子扣减配额、创建会话（幂等）
-- ---------------------------------------------------------------
create or replace function public.claim_access_code(
  p_code text,
  p_idempotency_key text,
  p_session_token text
) returns json
language plpgsql
set search_path = public, extensions
as $$
declare
  v_code access_codes%rowtype;
  v_session test_sessions%rowtype;
begin
  -- 幂等：同一 idempotency_key 已存在会话则直接返回，不再扣减
  select * into v_session
    from test_sessions
   where idempotency_key = p_idempotency_key
   limit 1;
  if found then
    return json_build_object(
      'session_id', v_session.id,
      'session_token', v_session.session_token,
      'status', v_session.status,
      'reused', true
    );
  end if;

  -- 锁定密码行，序列化并发请求，避免超额使用
  select * into v_code
    from access_codes
   where is_active = true
     and code_prefix = left(p_code, 4)
     and crypt(p_code, code_hash) = code_hash
   for update;

  if not found then
    raise exception 'INVALID_CODE' using errcode = 'P0001';
  end if;

  if v_code.used_count >= v_code.total_uses then
    raise exception 'QUOTA_EXHAUSTED' using errcode = 'P0001';
  end if;

  update access_codes
     set used_count = used_count + 1,
         updated_at = now()
   where id = v_code.id
     and used_count < v_code.total_uses;

  if not found then
    raise exception 'QUOTA_EXHAUSTED' using errcode = 'P0001';
  end if;

  insert into test_sessions (access_code_id, session_token, idempotency_key, status)
  values (v_code.id, p_session_token, p_idempotency_key, 'in_progress')
  returning * into v_session;

  return json_build_object(
    'session_id', v_session.id,
    'session_token', v_session.session_token,
    'status', v_session.status,
    'reused', false
  );

exception
  when unique_violation then
    -- 并发重复：回滚本次扣减，返回已存在会话
    select * into v_session
      from test_sessions
     where idempotency_key = p_idempotency_key
     limit 1;
    if found then
      return json_build_object(
        'session_id', v_session.id,
        'session_token', v_session.session_token,
        'status', v_session.status,
        'reused', true
      );
    end if;
    raise;
end;
$$;

-- ---------------------------------------------------------------
-- get-session：恢复会话（校验会话凭证）
-- ---------------------------------------------------------------
create or replace function public.get_session(
  p_session_id uuid,
  p_session_token text
) returns json
language plpgsql
set search_path = public, extensions
as $$
declare
  v_session test_sessions%rowtype;
begin
  select * into v_session
    from test_sessions
   where id = p_session_id
     and session_token = p_session_token;
  if not found then
    raise exception 'SESSION_NOT_FOUND' using errcode = 'P0001';
  end if;

  return json_build_object(
    'id', v_session.id,
    'status', v_session.status,
    'answers', v_session.answers_json,
    'result_id', v_session.result_id,
    'started_at', v_session.started_at
  );
end;
$$;

-- ---------------------------------------------------------------
-- save-answer：保存/修改单题答案
-- ---------------------------------------------------------------
create or replace function public.save_answer(
  p_session_id uuid,
  p_session_token text,
  p_question_id text,
  p_answer int
) returns json
language plpgsql
set search_path = public, extensions
as $$
declare
  v_session test_sessions%rowtype;
begin
  if p_answer < 1 or p_answer > 5 then
    raise exception 'INVALID_ANSWER' using errcode = 'P0001';
  end if;

  select * into v_session
    from test_sessions
   where id = p_session_id
     and session_token = p_session_token
   for update;
  if not found then
    raise exception 'SESSION_NOT_FOUND' using errcode = 'P0001';
  end if;
  if v_session.status <> 'in_progress' then
    raise exception 'SESSION_COMPLETED' using errcode = 'P0001';
  end if;

  update test_sessions
     set answers_json = answers_json || jsonb_build_object(p_question_id, p_answer),
         updated_at = now()
   where id = p_session_id;

  return json_build_object('saved', true, 'question_id', p_question_id);
end;
$$;

-- ---------------------------------------------------------------
-- complete-test：原子持久化结果并将会话标记为完成（幂等）
-- ---------------------------------------------------------------
create or replace function public.save_result(
  p_session_id uuid,
  p_session_token text,
  p_primary_city_id text,
  p_secondary_city_id text,
  p_dimension_scores_json jsonb,
  p_city_scores_json jsonb,
  p_report_json jsonb,
  p_share_token text
) returns json
language plpgsql
set search_path = public, extensions
as $$
declare
  v_session test_sessions%rowtype;
  v_result test_results%rowtype;
begin
  select * into v_session
    from test_sessions
   where id = p_session_id
     and session_token = p_session_token
   for update;
  if not found then
    raise exception 'SESSION_NOT_FOUND' using errcode = 'P0001';
  end if;

  -- 已完成的会话：幂等返回已有结果，不产生冲突结果
  if v_session.status = 'completed' then
    select * into v_result from test_results where id = v_session.result_id;
    if found then
      return json_build_object(
        'result_id', v_result.id,
        'share_token', v_result.share_token,
        'reused', true
      );
    end if;
    raise exception 'SESSION_COMPLETED' using errcode = 'P0001';
  end if;

  insert into test_results (
    session_id, primary_city_id, secondary_city_id,
    dimension_scores_json, city_scores_json, report_json, share_token
  ) values (
    p_session_id, p_primary_city_id, p_secondary_city_id,
    p_dimension_scores_json, p_city_scores_json, p_report_json, p_share_token
  ) returning * into v_result;

  update test_sessions
     set status = 'completed',
         completed_at = now(),
         result_id = v_result.id,
         updated_at = now()
   where id = p_session_id;

  return json_build_object(
    'result_id', v_result.id,
    'share_token', v_result.share_token,
    'reused', false
  );
end;
$$;

-- ---------------------------------------------------------------
-- get-result：结果页刷新恢复（校验会话凭证后返回完整结果）
-- ---------------------------------------------------------------
create or replace function public.get_result(
  p_session_id uuid,
  p_session_token text
) returns json
language plpgsql
set search_path = public, extensions
as $$
declare
  v_session test_sessions%rowtype;
  v_result test_results%rowtype;
begin
  select * into v_session
    from test_sessions
   where id = p_session_id
     and session_token = p_session_token;
  if not found then
    raise exception 'SESSION_NOT_FOUND' using errcode = 'P0001';
  end if;
  if v_session.result_id is null then
    raise exception 'RESULT_NOT_FOUND' using errcode = 'P0001';
  end if;

  select * into v_result from test_results where id = v_session.result_id;
  if not found then
    raise exception 'RESULT_NOT_FOUND' using errcode = 'P0001';
  end if;

  return json_build_object(
    'result_id', v_result.id,
    'primary_city_id', v_result.primary_city_id,
    'secondary_city_id', v_result.secondary_city_id,
    'dimension_scores', v_result.dimension_scores_json,
    'city_scores', v_result.city_scores_json,
    'report', v_result.report_json,
    'share_token', v_result.share_token,
    'created_at', v_result.created_at
  );
end;
$$;

-- ---------------------------------------------------------------
-- get-share-result：公开分享（仅返回允许公开的字段）
-- ---------------------------------------------------------------
create or replace function public.get_share_result(
  p_share_token text
) returns json
language plpgsql
set search_path = public, extensions
as $$
declare
  v_result test_results%rowtype;
begin
  select * into v_result from test_results where share_token = p_share_token;
  if not found then
    raise exception 'SHARE_NOT_FOUND' using errcode = 'P0001';
  end if;

  return json_build_object(
    'primary_city_id', v_result.primary_city_id,
    'secondary_city_id', v_result.secondary_city_id,
    'dimension_scores', v_result.dimension_scores_json,
    'city_scores', v_result.city_scores_json,
    'report', v_result.report_json,
    'created_at', v_result.created_at
  );
end;
$$;

-- ---------------------------------------------------------------
-- admin-generate-codes：批量生成访问密码（哈希后入库，明文不回存）
-- ---------------------------------------------------------------
create or replace function public.admin_create_codes(
  p_codes text[],
  p_total_uses int,
  p_note text,
  p_batch_id text
) returns json
language plpgsql
set search_path = public, extensions
as $$
declare
  v_code text;
  v_id uuid;
  v_rows jsonb := '[]'::jsonb;
  v_count int;
begin
  if p_total_uses < 1 then
    raise exception 'INVALID_TOTAL_USES' using errcode = 'P0001';
  end if;
  v_count := coalesce(array_length(p_codes, 1), 0);
  if v_count = 0 then
    raise exception 'NO_CODES' using errcode = 'P0001';
  end if;

  foreach v_code in array p_codes loop
    insert into access_codes (code_hash, code_prefix, total_uses, note, batch_id)
    values (crypt(v_code, gen_salt('bf', 10)), left(v_code, 4), p_total_uses, p_note, p_batch_id)
    returning id into v_id;
    v_rows := v_rows || jsonb_build_object(
      'id', v_id,
      'code_prefix', left(v_code, 4),
      'total_uses', p_total_uses
    );
  end loop;

  return json_build_object('created', v_count, 'rows', v_rows);
end;
$$;

-- ---------------------------------------------------------------
-- admin-list-codes：查询密码状态与剩余次数
-- ---------------------------------------------------------------
create or replace function public.admin_list_codes(
  p_status text default null,
  p_batch_id text default null,
  p_search text default null
) returns json
language plpgsql
set search_path = public, extensions
as $$
declare
  v_rows json;
begin
  select coalesce(json_agg(t order by t.created_at desc), '[]'::json)
    into v_rows
    from (
      select id, code_prefix, total_uses, used_count,
             (total_uses - used_count) as remaining_uses,
             is_active, note, batch_id, created_at
        from access_codes
       where (p_status is null
              or (p_status = 'active' and is_active)
              or (p_status = 'disabled' and not is_active))
         and (p_batch_id is null or batch_id = p_batch_id)
         and (p_search is null
              or code_prefix ilike '%' || p_search || '%'
              or note ilike '%' || p_search || '%')
    ) t;
  return v_rows;
end;
$$;

-- ---------------------------------------------------------------
-- admin-disable-code：停用访问密码
-- ---------------------------------------------------------------
create or replace function public.admin_disable_code(
  p_code_id uuid
) returns json
language plpgsql
set search_path = public, extensions
as $$
declare
  v_row access_codes%rowtype;
begin
  update access_codes
     set is_active = false, updated_at = now()
   where id = p_code_id
   returning * into v_row;
  if not found then
    raise exception 'CODE_NOT_FOUND' using errcode = 'P0001';
  end if;
  return json_build_object('id', v_row.id, 'is_active', v_row.is_active);
end;
$$;

-- ---------------------------------------------------------------
-- admin-stats：真实统计
-- ---------------------------------------------------------------
create or replace function public.admin_stats()
returns json
language plpgsql
set search_path = public, extensions
as $$
declare
  v_total bigint;
  v_used bigint;
  v_remaining bigint;
  v_disabled bigint;
  v_completed bigint;
begin
  select count(*), coalesce(sum(used_count), 0), coalesce(sum(total_uses - used_count), 0)
    into v_total, v_used, v_remaining
    from access_codes;
  select count(*) into v_disabled from access_codes where not is_active;
  select count(*) into v_completed from test_sessions where status = 'completed';

  return json_build_object(
    'total_codes', v_total,
    'total_used', v_used,
    'total_remaining', v_remaining,
    'disabled_codes', v_disabled,
    'completed_tests', v_completed
  );
end;
$$;
