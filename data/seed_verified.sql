-- Verified seed must only contain facts checked against official admissions documents.
-- This seed intentionally contains institution identities only. Program facts are added by ingestion adapters.
insert into public.universities (external_id, short_name, name, region, city, official_url, admissions_url, source_status)
values
('msu','МГУ','Московский государственный университет имени М.В. Ломоносова','Москва','Москва','https://www.msu.ru','https://pk.msu.ru','partial'),
('mgimo','МГИМО','Московский государственный институт международных отношений (университет) МИД Российской Федерации','Москва','Москва','https://mgimo.ru','https://mgimo.ru/study/admission/','partial'),
('spbu','СПбГУ','Санкт-Петербургский государственный университет','Санкт-Петербург','Санкт-Петербург','https://spbu.ru','https://abiturient.spbu.ru','partial'),
('hse','НИУ ВШЭ','Национальный исследовательский университет «Высшая школа экономики»','Москва','Москва','https://www.hse.ru','https://ba.hse.ru','partial'),
('mipt','МФТИ','Московский физико-технический институт (национальный исследовательский университет)','Московская область','Долгопрудный','https://mipt.ru','https://pk.mipt.ru','partial'),
('mephi','НИЯУ МИФИ','Национальный исследовательский ядерный университет «МИФИ»','Москва','Москва','https://mephi.ru','https://admission.mephi.ru','partial'),
('itmo','ИТМО','Национальный исследовательский университет ИТМО','Санкт-Петербург','Санкт-Петербург','https://itmo.ru','https://abit.itmo.ru','partial'),
('kfu','КФУ','Казанский (Приволжский) федеральный университет','Республика Татарстан','Казань','https://kpfu.ru','https://admissions.kpfu.ru','partial'),
('urfu','УрФУ','Уральский федеральный университет имени первого Президента России Б.Н. Ельцина','Свердловская область','Екатеринбург','https://urfu.ru','https://urfu.ru/ru/admission/','partial'),
('sfu','СФУ','Сибирский федеральный университет','Красноярский край','Красноярск','https://sfu-kras.ru','https://admissions.sfu-kras.ru','partial'),
('nsu','НГУ','Новосибирский национальный исследовательский государственный университет','Новосибирская область','Новосибирск','https://www.nsu.ru','https://education.nsu.ru/entrance/','partial'),
('kbsu','КБГУ','Кабардино-Балкарский государственный университет имени Х.М. Бербекова','Кабардино-Балкарская Республика','Нальчик','https://kbsu.ru','https://pk.kbsu.ru','partial')
on conflict (external_id) do update set
  short_name = excluded.short_name,
  name = excluded.name,
  region = excluded.region,
  city = excluded.city,
  official_url = excluded.official_url,
  admissions_url = excluded.admissions_url,
  updated_at = now();
