import { clients, cors, json } from '../_shared/http.ts';

Deno.serve(async req => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  const { asUser, admin } = clients(req);
  const { data: auth } = await asUser.auth.getUser();
  const user = auth.user;
  if (!user) return json({ error: 'unauthorized' }, 401);
  const { data: isDemo } = await admin.rpc('is_demo_account', { uid: user.id });
  if (isDemo) return json({ error: 'protected' }, 403);

  const { confirm } = await req.json().catch(() => ({}));
  if (confirm !== 'EXCLUIR') return json({ error: 'confirmation required' }, 400);

  const { data: courses } = await admin.from('courses').select('id').eq('teacher_id', user.id);
  for (const c of courses ?? []) {
    const { data: files } = await admin.storage.from('materials').list(c.id, { limit: 1000 });
    if (files?.length) await admin.storage.from('materials').remove(files.map(f => `${c.id}/${f.name}`));
  }
  const { data: keys } = await admin.from('answer_key_files').select('path, activities!inner(course_id, courses!inner(teacher_id))')
    .eq('activities.courses.teacher_id', user.id);
  if (keys?.length) await admin.storage.from('answer-keys').remove(keys.map(k => k.path));

  const { error } = await admin.auth.admin.deleteUser(user.id);
  if (error) return json({ error: 'failed' }, 500);
  await admin.from('login_attempts').delete().eq('email', (user.email ?? '').toLowerCase());
  return json({ deleted: true });
});
