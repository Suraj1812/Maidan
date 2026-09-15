-- Storage buckets: evidence media + avatars
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('evidence', 'evidence', true, 104857600, array['image/jpeg','image/png','image/webp','video/mp4','video/webm','video/quicktime'])
on conflict (id) do nothing;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', true, 5242880, array['image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;

-- Evidence: any authenticated user can upload into their own folder (userId/...),
-- public read (evidence is meant to be publicly reviewable for voting/transparency).
create policy "evidence_bucket_read" on storage.objects for select
  using (bucket_id = 'evidence');

create policy "evidence_bucket_insert" on storage.objects for insert to authenticated
  with check (bucket_id = 'evidence' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "evidence_bucket_delete_own" on storage.objects for delete to authenticated
  using (bucket_id = 'evidence' and (storage.foldername(name))[1] = auth.uid()::text);

-- Avatars: public read, users manage their own folder
create policy "avatars_bucket_read" on storage.objects for select
  using (bucket_id = 'avatars');

create policy "avatars_bucket_insert" on storage.objects for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "avatars_bucket_update_own" on storage.objects for update to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "avatars_bucket_delete_own" on storage.objects for delete to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
