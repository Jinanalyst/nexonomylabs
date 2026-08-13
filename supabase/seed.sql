-- ============================================================================
-- Nexonomy Labs — seed data (run AFTER schema.sql)
-- Populates markets, 5 demo experts, news, analyses, posts and comments so the
-- connected app looks alive from day one.
--
-- Demo login for all 5 personas:  password = nexonomy123
--   maya@nexonomy.demo (admin), junho@nexonomy.demo, elena@nexonomy.demo,
--   tom@nexonomy.demo, carla@nexonomy.demo
-- Comment/like counts are maintained automatically by triggers.
-- ============================================================================

-- Markets -------------------------------------------------------------------
insert into markets (slug, name, short, description, index_symbol, index_value, index_change) values
 ('us-stocks','US Stocks','US','US equity markets — indices, mega-cap tech, earnings and sector rotation.','S&P 500',6284.12,0.62),
 ('korea-stocks','Korea Stocks','KR','KOSPI, KOSDAQ and Korean listed names — semiconductors, batteries and more.','KOSPI',3187.4,-0.41),
 ('macro','Macro','MACRO','Central banks, inflation, growth and the big-picture forces moving all assets.','US 2Y Yield',3.71,-0.05),
 ('bonds','Bonds','BONDS','Sovereign and credit markets — the yield curve and fixed income flows.','US 10Y Yield',4.18,0.03),
 ('fx','FX','FX','Currencies — the dollar, majors, and cross-rates driving global capital.','DXY',97.84,-0.22),
 ('commodities','Commodities','CMDTY','Energy, metals and agriculture — from crude oil to gold.','Gold',3421.5,0.88),
 ('crypto','Crypto','CRYPTO','Digital assets — Bitcoin, Ethereum and the broader market.','BTC',118240,1.94),
 ('general','General','GEN','Cross-market discussion, strategy and everything in between.','—',0,0)
on conflict (slug) do update set
  name=excluded.name, description=excluded.description,
  index_symbol=excluded.index_symbol, index_value=excluded.index_value, index_change=excluded.index_change;

-- Demo experts (auth users -> profiles via trigger) -------------------------
-- Inserting into auth.users fires handle_new_user(), which creates the profile
-- row from the metadata below.
insert into auth.users
  (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
   created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_super_admin)
values
 ('00000000-0000-0000-0000-000000000000','11111111-1111-1111-1111-111111111111','authenticated','authenticated','maya@nexonomy.demo',  crypt('nexonomy123', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}','{"username":"macro_maya","display_name":"Maya Chen"}', false),
 ('00000000-0000-0000-0000-000000000000','22222222-2222-2222-2222-222222222222','authenticated','authenticated','junho@nexonomy.demo', crypt('nexonomy123', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}','{"username":"chip_analyst","display_name":"Junho Park"}', false),
 ('00000000-0000-0000-0000-000000000000','33333333-3333-3333-3333-333333333333','authenticated','authenticated','elena@nexonomy.demo', crypt('nexonomy123', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}','{"username":"satoshis_ghost","display_name":"Elena Ruiz"}', false),
 ('00000000-0000-0000-0000-000000000000','44444444-4444-4444-4444-444444444444','authenticated','authenticated','tom@nexonomy.demo',   crypt('nexonomy123', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}','{"username":"value_vega","display_name":"Tom Whitfield"}', false),
 ('00000000-0000-0000-0000-000000000000','55555555-5555-5555-5555-555555555555','authenticated','authenticated','carla@nexonomy.demo', crypt('nexonomy123', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}','{"username":"crude_carla","display_name":"Carla Nkosi"}', false)
on conflict (id) do nothing;

-- Identities so the personas can actually sign in
insert into auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
select gen_random_uuid(), u.id,
       jsonb_build_object('sub', u.id::text, 'email', u.email),
       'email', u.email, now(), now(), now()
from auth.users u
where u.email like '%@nexonomy.demo'
on conflict do nothing;

-- Enrich the auto-created profiles
update profiles set role='admin', bio='Rates & FX. Ex-sell-side strategist. I trade the curve, not the noise.' where id='11111111-1111-1111-1111-111111111111';
update profiles set bio='Semiconductors, memory cycle, Korea tech. Bottom-up, spreadsheet-driven.' where id='22222222-2222-2222-2222-222222222222';
update profiles set bio='On-chain data, market structure, crypto liquidity. Skeptic by default.' where id='33333333-3333-3333-3333-333333333333';
update profiles set bio='Long-term equity value. Cash flows over stories. Patience is an edge.' where id='44444444-4444-4444-4444-444444444444';
update profiles set bio='Energy & commodities. Supply chains, inventories, the physical market.' where id='55555555-5555-5555-5555-555555555555';

-- News ----------------------------------------------------------------------
insert into news (id, title, summary, content, image_url, source, source_url, market, published_at, views) values
 ('a1000000-0000-0000-0000-000000000001','Fed holds rates steady, signals patience as inflation cools','The Federal Reserve kept its policy rate unchanged and struck a measured tone, saying it needs ''greater confidence'' that disinflation is durable before easing.','In its latest statement the committee emphasized data-dependence, noting that while headline inflation has moderated, services prices remain sticky. Markets read the tone as mildly dovish, with the front end of the curve rallying modestly.','https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Marriner_S._Eccles_Federal_Reserve_Board_Building.jpg/960px-Marriner_S._Eccles_Federal_Reserve_Board_Building.jpg','Reuters','https://www.reuters.com/markets/','macro','2026-08-13T11:20:00Z',5820),
 ('a1000000-0000-0000-0000-000000000002','Nvidia extends rally as data-center demand outlook stays strong','Shares of the chip giant pushed higher after management reiterated a robust backlog for AI accelerators heading into the next fiscal year.','Analysts pointed to continued hyperscaler capex as the primary driver, though some cautioned that expectations are now priced for perfection.','https://upload.wikimedia.org/wikipedia/commons/thumb/f/f5/EFTA00000440_-_Cluttered_server_room_with_numerous_cables_equipment_and_racks_arranged_on_a_white_wall.jpg/960px-EFTA00000440_-_Cluttered_server_room_with_numerous_cables_equipment_and_racks_arranged_on_a_white_wall.jpg','Bloomberg','https://www.bloomberg.com/markets','us-stocks','2026-08-13T09:05:00Z',9310),
 ('a1000000-0000-0000-0000-000000000003','KOSPI slips as foreign investors trim semiconductor exposure','Korea''s benchmark index edged lower on net foreign selling, led by large-cap memory names amid concerns over the pace of the DRAM upcycle.','Institutional flows were mixed. Battery and shipbuilding names outperformed, cushioning the index decline.','https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/Skyline_of_Yeouido%2C_a_prominent_finance_district_in_Seoul.jpg/960px-Skyline_of_Yeouido%2C_a_prominent_finance_district_in_Seoul.jpg','Yonhap','https://en.yna.co.kr/','korea-stocks','2026-08-13T06:40:00Z',3110),
 ('a1000000-0000-0000-0000-000000000004','Bitcoin reclaims six figures as ETF inflows accelerate','Spot Bitcoin funds saw their strongest week of net creations in months, helping the largest cryptocurrency stabilize above a key psychological level.','On-chain metrics show long-term holder supply near record highs, while exchange balances continue a multi-year decline.','https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/25_BTC_Gold_Casascius_coin_2011_by_Gage_Skidmore.jpg/960px-25_BTC_Gold_Casascius_coin_2011_by_Gage_Skidmore.jpg','CoinDesk','https://www.coindesk.com/','crypto','2026-08-12T22:15:00Z',12400),
 ('a1000000-0000-0000-0000-000000000005','Dollar softens against majors after cooler jobs data','The greenback eased broadly as a softer-than-expected payrolls print revived expectations for a more accommodative policy path.','EUR and JPY led gains among the majors. Rate-sensitive currencies responded to the move lower in short-dated yields.','https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/Hundred_dollar_bill_01.jpg/960px-Hundred_dollar_bill_01.jpg','Financial Times','https://www.ft.com/currencies','fx','2026-08-12T18:30:00Z',2740),
 ('a1000000-0000-0000-0000-000000000006','Gold hits fresh record as real yields drift lower','Bullion extended its advance to a new all-time high, supported by falling real rates and steady central-bank buying.','Analysts note that the move has been orderly, with positioning still short of the extremes seen in prior blow-off tops.','https://upload.wikimedia.org/wikipedia/commons/thumb/a/af/Gold_bullion_bars.jpg/960px-Gold_bullion_bars.jpg','Bloomberg','https://www.bloomberg.com/markets/commodities','commodities','2026-08-12T14:00:00Z',4180),
 ('a1000000-0000-0000-0000-000000000007','10-year Treasury yield steadies near 4.2% ahead of supply','Benchmark yields held in a tight range as investors awaited a heavy slate of government debt auctions later in the week.','Dealers flagged reasonable demand expectations, though term premium remains a topic of debate among strategists.','https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/Us-treasury-building.jpg/960px-Us-treasury-building.jpg','Reuters','https://www.reuters.com/markets/rates-bonds/','bonds','2026-08-12T10:10:00Z',1990),
 ('a1000000-0000-0000-0000-000000000008','Big tech earnings beat, but forward guidance mixed','A cluster of megacap results topped estimates on the quarter, yet cautious outlooks on ad spend and cloud margins tempered the reaction.','The dispersion in guidance underscored how uneven the current cycle has been across business lines.','https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Wall_Street_-_New_York_Stock_Exchange.jpg/960px-Wall_Street_-_New_York_Stock_Exchange.jpg','CNBC','https://www.cnbc.com/markets/','us-stocks','2026-08-11T21:45:00Z',6650),
 ('a1000000-0000-0000-0000-000000000009','Oil edges higher on tighter inventories, demand watched','Crude firmed after data showed a larger-than-expected draw in commercial stockpiles, though demand signals remain mixed.','Refining margins and product cracks will be the key tells for the direction of the next move, traders said.','https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/Oil_platform_P-51_%28Brazil%29.jpg/960px-Oil_platform_P-51_%28Brazil%29.jpg','Reuters','https://www.reuters.com/business/energy/','commodities','2026-08-11T15:20:00Z',2260),
 ('a1000000-0000-0000-0000-000000000010','Ethereum staking ratio climbs as network activity picks up','The share of ETH locked in staking reached a new high, coinciding with a rebound in on-chain transaction volume.','Layer-2 throughput continues to grow, shifting the composition of network fees over time.','https://upload.wikimedia.org/wikipedia/commons/5/54/Ethereum_coin.jpg','The Block','https://www.theblock.co/','crypto','2026-08-11T08:00:00Z',3890),
 ('a1000000-0000-0000-0000-000000000011','Won firms as exporters convert amid narrowing rate gap','The Korean won strengthened against the dollar as month-end exporter flows met a narrowing interest-rate differential.','Traders are watching the pace of foreign equity flows for the next directional cue.','https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/50000_won_banknote.jpg/960px-50000_won_banknote.jpg','Yonhap','https://en.yna.co.kr/','fx','2026-08-10T23:30:00Z',1450),
 ('a1000000-0000-0000-0000-000000000012','Global growth forecasts nudged higher on resilient consumption','A closely watched institution lifted its world GDP projection modestly, citing resilient household spending across major economies.','Risks remain tilted to the downside from geopolitics and financial-condition tightening, the report noted.','https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/IMF_building_HR.jpg/960px-IMF_building_HR.jpg','Financial Times','https://www.ft.com/global-economy','macro','2026-08-10T12:00:00Z',2010)
on conflict (id) do nothing;

-- Analysis ------------------------------------------------------------------
insert into analysis (id, title, body, author_id, market, sentiment, related_news_id, created_at, likes_count) values
 ('b2000000-0000-0000-0000-000000000001','The front end is telling you the cut is coming',E'The 2s10s has been steepening for three months while the 2-year grinds lower. That divergence usually resolves with the front end leading. My read: the market is pricing an easing cycle that the dot plot hasn''t fully acknowledged yet.\n\nI''m watching two things: (1) the trajectory of core services ex-housing, and (2) the tone of regional Fed speakers. If both soften into the next meeting, the risk is a faster repricing than consensus expects.\n\nThis is a framework, not a signal — size positions to survive being early.','11111111-1111-1111-1111-111111111111','macro','bullish','a1000000-0000-0000-0000-000000000001','2026-08-13T12:10:00Z',47),
 ('b2000000-0000-0000-0000-000000000002','Memory upcycle: mid-innings, not late',E'Bears argue the DRAM cycle is topping. I disagree. Bit demand from AI training clusters is structurally different from the PC/mobile cycles of the past. Inventory days at the top three suppliers are still below the five-year average.\n\nThat said, valuation already embeds a lot. I''d rather add on pullbacks than chase strength here. Watch capex discipline — the moment someone breaks ranks and floods capacity, the thesis changes.','22222222-2222-2222-2222-222222222222','korea-stocks','bullish','a1000000-0000-0000-0000-000000000003','2026-08-13T07:30:00Z',61),
 ('b2000000-0000-0000-0000-000000000003','Bitcoin: strong hands, thin float — but mind the leverage',E'Exchange balances keep bleeding lower and long-term holder supply is near records. That''s a constructive backdrop. The risk isn''t spot demand — it''s derivatives. Funding has crept up and open interest is elevated.\n\nMy base case is grind-higher with sharp, leverage-driven flushes along the way. Neutral-to-constructive, but I respect the downside air pockets.','33333333-3333-3333-3333-333333333333','crypto','neutral','a1000000-0000-0000-0000-000000000004','2026-08-12T23:00:00Z',88),
 ('b2000000-0000-0000-0000-000000000004','Why I''m cautious on megacap multiples here',E'The earnings beats are real, but the guidance dispersion matters more. When the market pays 30x forward for names guiding to decelerating growth, the margin for error is thin.\n\nI''m not short — I''m underweight and patient. Give me a 15% drawdown and a reset in expectations, and the same names become interesting again. Price is what you pay; value is what you get.','44444444-4444-4444-4444-444444444444','us-stocks','bearish','a1000000-0000-0000-0000-000000000008','2026-08-12T02:20:00Z',34),
 ('b2000000-0000-0000-0000-000000000005','Gold''s move is about real yields, not fear',E'Every gold rally gets a ''safe haven'' narrative slapped on it. This one is cleaner than that: real yields are drifting lower and official-sector buying is persistent. Positioning isn''t stretched, which is why the move has been orderly.\n\nConstructive while real rates cooperate. The thesis breaks if growth reaccelerates and the front end reprices hawkish.','55555555-5555-5555-5555-555555555555','commodities','bullish','a1000000-0000-0000-0000-000000000006','2026-08-12T15:00:00Z',52),
 ('b2000000-0000-0000-0000-000000000006','Dollar smile: which side are we on?',E'The DXY softness on cooler jobs data fits the ''benign disinflation'' side of the dollar smile — risk-on, dollar-down. The regime I''d worry about is the other tail: a growth scare that sends the dollar bid for safety.\n\nFor now, neutral. I fade extremes in either direction and let the data adjudicate.','11111111-1111-1111-1111-111111111111','fx','neutral','a1000000-0000-0000-0000-000000000005','2026-08-12T19:00:00Z',29)
on conflict (id) do nothing;

-- Community posts -----------------------------------------------------------
insert into community_posts (id, title, body, author_id, market, created_at, likes_count) values
 ('c3000000-0000-0000-0000-000000000001','How do you size positions around FOMC?','Curious how people here manage risk into binary macro events. Do you cut size, hedge with options, or just sit through the vol? I''ve been burned trying to trade the reaction.','44444444-4444-4444-4444-444444444444','macro','2026-08-13T13:00:00Z',18),
 ('c3000000-0000-0000-0000-000000000002','Best resources for learning to read the yield curve?','Newer to fixed income. Looking for solid, non-hype explainers on curve shape and what it implies. Books, blogs, threads — drop your favorites.','33333333-3333-3333-3333-333333333333','bonds','2026-08-13T10:40:00Z',24),
 ('c3000000-0000-0000-0000-000000000003','Korea semis vs Taiwan — where''s the better risk/reward?','Both have exposure to the AI capex wave but very different valuation and policy backdrops. Where are you leaning and why?','22222222-2222-2222-2222-222222222222','korea-stocks','2026-08-12T20:15:00Z',41),
 ('c3000000-0000-0000-0000-000000000004','On-chain data: signal or noise?','Half the on-chain ''metrics'' people post feel like curve-fitting. Which ones do you actually trust for decision-making, and which do you ignore?','33333333-3333-3333-3333-333333333333','crypto','2026-08-12T16:30:00Z',55),
 ('c3000000-0000-0000-0000-000000000005','What''s your process for writing a market analysis?','Trying to be more disciplined about publishing my views. How do you structure a thesis so it''s falsifiable and you can actually grade yourself later?','44444444-4444-4444-4444-444444444444','general','2026-08-11T14:00:00Z',33),
 ('c3000000-0000-0000-0000-000000000006','Oil: are inventories still the best real-time demand tell?','With so much structural change in energy, do weekly inventory draws still mean what they used to? Interested in how the physical traders here think about it.','55555555-5555-5555-5555-555555555555','commodities','2026-08-11T11:20:00Z',21),
 ('c3000000-0000-0000-0000-000000000007','Dollar bulls — what breaks the trend for you?','For those still constructive on USD, what''s the single data point or event that would flip you? Trying to pressure-test my own bias.','11111111-1111-1111-1111-111111111111','fx','2026-08-10T09:10:00Z',27),
 ('c3000000-0000-0000-0000-000000000008','Introduce yourself + what you trade','New members: say hi. What markets do you focus on, and what''s one thing you''ve changed your mind about this year?','11111111-1111-1111-1111-111111111111','general','2026-08-09T08:00:00Z',62)
on conflict (id) do nothing;

-- Comments (counts auto-maintained by trigger) ------------------------------
insert into comments (id, parent_type, parent_id, author_id, body, reply_to, created_at) values
 ('d4000000-0000-0000-0000-000000000001','news','a1000000-0000-0000-0000-000000000001','44444444-4444-4444-4444-444444444444','Measured tone but the front end clearly disagrees with the dots. Something has to give.',null,'2026-08-13T11:40:00Z'),
 ('d4000000-0000-0000-0000-000000000002','news','a1000000-0000-0000-0000-000000000001','33333333-3333-3333-3333-333333333333','Services ex-housing is the whole ballgame. Everything else is a distraction right now.',null,'2026-08-13T11:55:00Z'),
 ('d4000000-0000-0000-0000-000000000003','news','a1000000-0000-0000-0000-000000000001','11111111-1111-1111-1111-111111111111','Agreed — and that''s exactly why I think the repricing risk is asymmetric here.','d4000000-0000-0000-0000-000000000002','2026-08-13T12:05:00Z'),
 ('d4000000-0000-0000-0000-000000000004','news','a1000000-0000-0000-0000-000000000002','22222222-2222-2222-2222-222222222222','Backlog is real but ''priced for perfection'' is doing a lot of work in that last paragraph.',null,'2026-08-13T09:30:00Z'),
 ('d4000000-0000-0000-0000-000000000005','news','a1000000-0000-0000-0000-000000000002','44444444-4444-4444-4444-444444444444','This. The bar keeps rising every quarter. Beats aren''t enough anymore.','d4000000-0000-0000-0000-000000000004','2026-08-13T09:45:00Z'),
 ('d4000000-0000-0000-0000-000000000006','news','a1000000-0000-0000-0000-000000000003','22222222-2222-2222-2222-222222222222','Foreign selling in memory names looks like profit-taking, not a thesis change. Watching flows.',null,'2026-08-13T07:10:00Z'),
 ('d4000000-0000-0000-0000-000000000007','news','a1000000-0000-0000-0000-000000000004','33333333-3333-3333-3333-333333333333','Inflows are nice but keep one eye on funding. Leverage is how these moves end.',null,'2026-08-12T22:40:00Z'),
 ('d4000000-0000-0000-0000-000000000008','news','a1000000-0000-0000-0000-000000000004','55555555-5555-5555-5555-555555555555','Exchange balances at multi-year lows is the quiet story here.',null,'2026-08-12T23:15:00Z'),
 ('d4000000-0000-0000-0000-000000000009','news','a1000000-0000-0000-0000-000000000006','44444444-4444-4444-4444-444444444444','Real yields, not fear. Finally an article that gets the driver right.',null,'2026-08-12T14:30:00Z'),
 ('d4000000-0000-0000-0000-000000000010','news','a1000000-0000-0000-0000-000000000008','11111111-1111-1111-1111-111111111111','Guidance dispersion > headline beats. That''s the tell for the next quarter.',null,'2026-08-11T22:10:00Z'),
 ('d4000000-0000-0000-0000-000000000011','news','a1000000-0000-0000-0000-000000000010','33333333-3333-3333-3333-333333333333','Staking ratio at a new high changes the float dynamics more than people appreciate.',null,'2026-08-11T08:30:00Z'),
 ('d4000000-0000-0000-0000-000000000012','analysis','b2000000-0000-0000-0000-000000000001','44444444-4444-4444-4444-444444444444','Great framing. How are you expressing this — outright front end or steepeners?',null,'2026-08-13T12:30:00Z'),
 ('d4000000-0000-0000-0000-000000000013','analysis','b2000000-0000-0000-0000-000000000001','11111111-1111-1111-1111-111111111111','Mostly steepeners — cleaner carry and it survives being early better than outright.','d4000000-0000-0000-0000-000000000012','2026-08-13T12:40:00Z'),
 ('d4000000-0000-0000-0000-000000000014','analysis','b2000000-0000-0000-0000-000000000002','44444444-4444-4444-4444-444444444444','Capex discipline is the crux. One defector and the whole cycle narrative flips.',null,'2026-08-13T08:00:00Z'),
 ('d4000000-0000-0000-0000-000000000015','analysis','b2000000-0000-0000-0000-000000000003','55555555-5555-5555-5555-555555555555','The ''grind higher with leverage flushes'' base case has aged well historically.',null,'2026-08-12T23:30:00Z'),
 ('d4000000-0000-0000-0000-000000000016','analysis','b2000000-0000-0000-0000-000000000003','22222222-2222-2222-2222-222222222222','Respecting the downside air pockets is underrated advice. Saving this.',null,'2026-08-13T01:00:00Z'),
 ('d4000000-0000-0000-0000-000000000017','analysis','b2000000-0000-0000-0000-000000000004','33333333-3333-3333-3333-333333333333','Underweight and patient is a real position, not a cop-out. People forget that.',null,'2026-08-12T03:00:00Z'),
 ('d4000000-0000-0000-0000-000000000018','community','c3000000-0000-0000-0000-000000000001','11111111-1111-1111-1111-111111111111','I cut size by half into the print and keep a small options hedge. Trading the reaction is a coin flip.',null,'2026-08-13T13:20:00Z'),
 ('d4000000-0000-0000-0000-000000000019','community','c3000000-0000-0000-0000-000000000001','33333333-3333-3333-3333-333333333333','Same — the edge is in position sizing, not prediction. Survive first.','d4000000-0000-0000-0000-000000000018','2026-08-13T13:35:00Z'),
 ('d4000000-0000-0000-0000-000000000020','community','c3000000-0000-0000-0000-000000000002','44444444-4444-4444-4444-444444444444','Start with the basics of what the curve represents, then read the classic strategist primers. Avoid hype threads.',null,'2026-08-13T11:00:00Z'),
 ('d4000000-0000-0000-0000-000000000021','community','c3000000-0000-0000-0000-000000000003','22222222-2222-2222-2222-222222222222','Korea screens cheaper but carries more governance discount. It''s a valuation-vs-quality call.',null,'2026-08-12T21:00:00Z'),
 ('d4000000-0000-0000-0000-000000000022','community','c3000000-0000-0000-0000-000000000003','44444444-4444-4444-4444-444444444444','The governance discount narrowing is itself a potential catalyst though.','d4000000-0000-0000-0000-000000000021','2026-08-12T21:20:00Z'),
 ('d4000000-0000-0000-0000-000000000023','community','c3000000-0000-0000-0000-000000000004','55555555-5555-5555-5555-555555555555','Exchange flows and realized cap I trust. Most of the fancy composite ''scores'' I ignore.',null,'2026-08-12T17:00:00Z'),
 ('d4000000-0000-0000-0000-000000000024','community','c3000000-0000-0000-0000-000000000005','11111111-1111-1111-1111-111111111111','Write the falsification condition first. If you can''t state what would prove you wrong, you don''t have a thesis.',null,'2026-08-11T15:00:00Z'),
 ('d4000000-0000-0000-0000-000000000025','community','c3000000-0000-0000-0000-000000000008','22222222-2222-2222-2222-222222222222','Hi all — Korea semis mainly. Changed my mind on chasing momentum; adding on weakness now.',null,'2026-08-09T09:00:00Z')
on conflict (id) do nothing;

-- Some follow relationships
insert into follows (follower_id, following_id) values
 ('22222222-2222-2222-2222-222222222222','11111111-1111-1111-1111-111111111111'),
 ('33333333-3333-3333-3333-333333333333','11111111-1111-1111-1111-111111111111'),
 ('44444444-4444-4444-4444-444444444444','11111111-1111-1111-1111-111111111111'),
 ('11111111-1111-1111-1111-111111111111','33333333-3333-3333-3333-333333333333'),
 ('55555555-5555-5555-5555-555555555555','22222222-2222-2222-2222-222222222222')
on conflict do nothing;
