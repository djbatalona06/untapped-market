-- Untapped Market — seed data.
-- Direct SQL translation of src/store/mockData.ts (6 strains + 4 dispensaries
-- + their inventory edges). Trip reports are omitted: they require real
-- profile UUIDs and are seeded post-signup.

begin;

-- ---------------------------------------------------------------------------
-- strains
-- ---------------------------------------------------------------------------
insert into public.strains (id, name, type, thc, cbd, terpenes, effects, flavors, lineage, lab_data, chemotype, description, color, like_count) values
('cascadia-haze', 'Cascadia Haze', 'sativa', 23.4, 0.2,
 '[{"name":"Terpinolene","pct":1.42,"effect":"Uplifting"},{"name":"Myrcene","pct":0.98,"effect":"Relaxing"},{"name":"Ocimene","pct":0.76,"effect":"Energizing"},{"name":"Caryophyllene","pct":0.54,"effect":"Anti-inflammatory"}]'::jsonb,
 array['Euphoric','Creative','Focused','Energetic'],
 array['Citrus','Pine','Floral','Earthy'],
 '{"mother":"Haze","father":"Pacific Ghost"}'::jsonb,
 '{"lab":"Confidence Analytics","date":"2025-10-14","cannabinoids":[{"name":"THC","value":"23.4%"},{"name":"THCA","value":"26.2%"},{"name":"CBD","value":"0.2%"},{"name":"CBDA","value":"0.3%"},{"name":"CBG","value":"0.9%"},{"name":"CBN","value":"0.1%"},{"name":"CBC","value":"0.4%"},{"name":"THCV","value":"0.3%"}]}'::jsonb,
 'Type I (THC-dominant)',
 'A bright, cerebral sativa born in the foggy lowlands of the Cascades. Cascadia Haze carries the sharp citrus snap of Pacific air with a golden morning energy that keeps creative momentum flowing without the crash.',
 '#d4a853', 847),
('rainier-kush', 'Rainier Kush', 'indica', 28.1, 0.1,
 '[{"name":"Myrcene","pct":1.85,"effect":"Sedating"},{"name":"Linalool","pct":1.12,"effect":"Calming"},{"name":"Caryophyllene","pct":0.89,"effect":"Anti-inflammatory"},{"name":"Humulene","pct":0.67,"effect":"Appetite suppressant"}]'::jsonb,
 array['Relaxed','Sleepy','Happy','Hungry'],
 array['Earthy','Pine','Diesel','Grape'],
 '{"mother":"OG Kush","father":"Skywalker"}'::jsonb,
 '{"lab":"Trace Analytics","date":"2025-11-02","cannabinoids":[{"name":"THC","value":"28.1%"},{"name":"THCA","value":"31.5%"},{"name":"CBD","value":"0.1%"},{"name":"CBDA","value":"0.1%"},{"name":"CBG","value":"0.7%"},{"name":"CBN","value":"0.4%"},{"name":"CBC","value":"0.2%"},{"name":"THCV","value":"0.1%"}]}'::jsonb,
 'Type I (THC-dominant)',
 'Named for the mountain that watches over the Puget Sound, Rainier Kush is a heavy, earthen indica with the deep resin of old-growth forest. Expect a full-body release and a long, peaceful night.',
 '#8b6fb8', 1204),
('hood-river-haze', 'Hood River Haze', 'hybrid', 19.7, 0.5,
 '[{"name":"Limonene","pct":1.23,"effect":"Mood elevation"},{"name":"Pinene","pct":0.95,"effect":"Alertness"},{"name":"Myrcene","pct":0.78,"effect":"Relaxing"},{"name":"Terpinolene","pct":0.54,"effect":"Uplifting"}]'::jsonb,
 array['Happy','Creative','Relaxed','Talkative'],
 array['Lemon','Apple','Spice','Floral'],
 '{"mother":"Cascadia Haze","father":"Oregon OG"}'::jsonb,
 '{"lab":"Green Leaf Lab","date":"2025-09-28","cannabinoids":[{"name":"THC","value":"19.7%"},{"name":"THCA","value":"22.3%"},{"name":"CBD","value":"0.5%"},{"name":"CBDA","value":"0.6%"},{"name":"CBG","value":"1.1%"},{"name":"CBN","value":"0.2%"},{"name":"CBC","value":"0.6%"},{"name":"THCV","value":"0.2%"}]}'::jsonb,
 'Type I (THC-dominant)',
 'A balanced hybrid born at the intersection of river valley and volcanic ridge. Hood River Haze opens with a sativa clarity and settles into a mellow indica warmth — ideal for the long PNW evening.',
 '#7cb87a', 632),
('olympic-fog', 'Olympic Fog', 'hybrid', 22.8, 0.3,
 '[{"name":"Caryophyllene","pct":1.56,"effect":"Stress relief"},{"name":"Linalool","pct":0.94,"effect":"Calming"},{"name":"Myrcene","pct":0.82,"effect":"Relaxing"},{"name":"Humulene","pct":0.41,"effect":"Anti-anxiety"}]'::jsonb,
 array['Relaxed','Calm','Focused','Happy'],
 array['Herbal','Lavender','Sweet','Woody'],
 '{"mother":"Cookies","father":"Blue Dream"}'::jsonb,
 '{"lab":"Confidence Analytics","date":"2025-10-30","cannabinoids":[{"name":"THC","value":"22.8%"},{"name":"THCA","value":"25.5%"},{"name":"CBD","value":"0.3%"},{"name":"CBDA","value":"0.4%"},{"name":"CBG","value":"0.8%"},{"name":"CBN","value":"0.2%"},{"name":"CBC","value":"0.5%"},{"name":"THCV","value":"0.1%"}]}'::jsonb,
 'Type I (THC-dominant)',
 'Inspired by the perpetual mist rolling off the Olympic Peninsula, this dense hybrid wraps you in calm focus. The terpene stack leans coastal — briney, herbal, and slightly sweet.',
 '#4a9b9e', 489),
('puget-sound-cbd', 'Puget Sound CBD', 'hybrid', 1.2, 18.5,
 '[{"name":"Myrcene","pct":1.14,"effect":"Relaxing"},{"name":"Pinene","pct":0.88,"effect":"Alertness"},{"name":"Linalool","pct":0.73,"effect":"Calming"},{"name":"Humulene","pct":0.52,"effect":"Anti-inflammatory"}]'::jsonb,
 array['Calm','Clear-headed','Focused','Pain relief'],
 array['Earthy','Pine','Floral','Herbal'],
 '{"mother":"ACDC","father":null}'::jsonb,
 '{"lab":"Trace Analytics","date":"2025-11-15","cannabinoids":[{"name":"THC","value":"1.2%"},{"name":"THCA","value":"1.4%"},{"name":"CBD","value":"18.5%"},{"name":"CBDA","value":"20.8%"},{"name":"CBG","value":"0.4%"},{"name":"CBN","value":"0.1%"},{"name":"CBC","value":"0.8%"},{"name":"THCV","value":"0.0%"}]}'::jsonb,
 'Type II (Balanced CBD/THC)',
 'A high-CBD cultivar crafted for the wellness-focused cannabis consumer. Puget Sound CBD delivers calm clarity without intoxication — perfect for daytime relief, anxiety management, or anyone new to cannabis.',
 '#4a9b9e', 341),
('willamette-valley-og', 'Willamette Valley OG', 'indica', 26.3, 0.1,
 '[{"name":"Myrcene","pct":2.01,"effect":"Sedating"},{"name":"Caryophyllene","pct":1.34,"effect":"Anti-inflammatory"},{"name":"Limonene","pct":0.67,"effect":"Mood elevation"},{"name":"Linalool","pct":0.45,"effect":"Calming"}]'::jsonb,
 array['Sedated','Relaxed','Euphoric','Hungry'],
 array['Diesel','Grape','Berry','Earthy'],
 '{"mother":"SFV OG","father":"Bubba Kush"}'::jsonb,
 '{"lab":"Green Leaf Lab","date":"2025-10-05","cannabinoids":[{"name":"THC","value":"26.3%"},{"name":"THCA","value":"29.7%"},{"name":"CBD","value":"0.1%"},{"name":"CBDA","value":"0.2%"},{"name":"CBG","value":"0.6%"},{"name":"CBN","value":"0.5%"},{"name":"CBC","value":"0.3%"},{"name":"THCV","value":"0.1%"}]}'::jsonb,
 'Type I (THC-dominant)',
 'Born in the fertile agricultural valley between the Coast Range and the Cascades. Willamette Valley OG is a bold, resinous indica with notes of fuel and dark fruit. Heavy hitting — for veterans who want the full experience.',
 '#8b6fb8', 756)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- dispensaries
-- ---------------------------------------------------------------------------
insert into public.dispensaries (id, name, address, city, state, lat, lng, hours, rating, phone) values
('green-needle',        'Green Needle Cannabis', '1847 15th Ave E',   'Seattle',    'WA', 47.6219, -122.3080, 'Mon–Sat 9am–10pm · Sun 10am–8pm',  4.8, '(206) 555-0142'),
('cascadia-collective', 'Cascadia Collective',   '2241 NE Alberta St','Portland',   'OR', 45.5580, -122.6393, 'Daily 8am–11pm',                   4.9, '(503) 555-0287'),
('rainforest-remedies', 'Rainforest Remedies',   '420 4th Ave E',     'Olympia',    'WA', 47.0432, -122.9007, 'Mon–Sat 10am–9pm · Sun 11am–7pm',  4.7, '(360) 555-0318'),
('gorge-greens',        'Gorge Greens',          '312 Oak St',        'Hood River', 'OR', 45.7131, -121.5195, 'Daily 9am–9pm',                    4.6, '(541) 555-0463')
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- strain_dispensary (inventory)
-- ---------------------------------------------------------------------------
insert into public.strain_dispensary (strain_id, dispensary_id, in_stock) values
('cascadia-haze',         'green-needle',         true),
('cascadia-haze',         'cascadia-collective',  true),
('rainier-kush',          'green-needle',         true),
('rainier-kush',          'rainforest-remedies',  true),
('hood-river-haze',       'cascadia-collective',  true),
('hood-river-haze',       'gorge-greens',         true),
('olympic-fog',           'rainforest-remedies',  true),
('olympic-fog',           'green-needle',         true),
('puget-sound-cbd',       'cascadia-collective',  true),
('puget-sound-cbd',       'rainforest-remedies',  true),
('willamette-valley-og',  'gorge-greens',         true),
('willamette-valley-og',  'cascadia-collective',  true)
on conflict (strain_id, dispensary_id) do nothing;

commit;
