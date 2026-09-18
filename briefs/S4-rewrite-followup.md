Your rewrite pass broke the strict checker (95 FAILs) and the legacy checker (3 rules). Fix all of them in content/phase1/scenes.json (and world.json pool values if needed), keeping the review's intent. Categories: RULE3 = words arrays no longer match the rewritten text (regenerate every words array from the new hanzi via longest-match against words.json); RULE2 = new words appear in an exchange before their introduction or are undeclared; RULE4 = coverage dropped below 3 curriculum scenes for the listed words: re-place each in natural lines in scenes where it fits (a rewrite must never delete a word's placement). Full list follows. No shell; report DONE / FILES.

```
RULE2 FAIL p1_pay_rent_01/p1_pay_rent_01_e2/line: encounters 3 unseen words: 年, 今天, 日; unseen word "今天" is not declared in exchange.introduces
RULE3 FAIL p1_mentor_quantities_02/p1_mentor_quantities_02_e3/line: tags [这, 书, 你, 读] != post-fill segmentation [这, 本, 书, 你, 读]
RULE3 FAIL p1_landlord_phone_01/p1_landlord_phone_01_e3/line: tags [你, 今天, 很, 冷, 你, 呢] != post-fill segmentation [今天, 很, 冷, 你, 呢]
RULE3 FAIL p1_cook_family_chat_01/p1_cook_family_chat_01_e2/line: tags [我, 儿子, 北京, 住, 我, 女儿, 住, 家, 里] != post-fill segmentation [我, 儿子, 住, 北京, 我, 女儿, 住, 家, 里]
RULE3 FAIL p1_mentor_address_03/p1_mentor_address_03_e1/line: tags [谁, 是, 他, 是, 什么] != post-fill segmentation [谁, 是, 老师, 他, 是, 什么]
RULE4 FAIL coverage:爱: 1 curriculum scenes; requires at least 3
RULE4 FAIL coverage:爸爸: 1 curriculum scenes; requires at least 3
RULE4 FAIL coverage:北京: 2 curriculum scenes; requires at least 3
RULE4 FAIL coverage:不客气: 1 curriculum scenes; requires at least 3
RULE4 FAIL coverage:菜: 1 curriculum scenes; requires at least 3
RULE4 FAIL coverage:吃: 1 curriculum scenes; requires at least 3
RULE4 FAIL coverage:出租车: 1 curriculum scenes; requires at least 3
RULE4 FAIL coverage:打电话: 2 curriculum scenes; requires at least 3
RULE4 FAIL coverage:点: 2 curriculum scenes; requires at least 3
RULE4 FAIL coverage:电脑: 2 curriculum scenes; requires at least 3
RULE4 FAIL coverage:电视: 2 curriculum scenes; requires at least 3
RULE4 FAIL coverage:电影: 1 curriculum scenes; requires at least 3
RULE4 FAIL coverage:都: 2 curriculum scenes; requires at least 3
RULE4 FAIL coverage:读: 2 curriculum scenes; requires at least 3
RULE4 FAIL coverage:多: 2 curriculum scenes; requires at least 3
RULE4 FAIL coverage:儿子: 2 curriculum scenes; requires at least 3
RULE4 FAIL coverage:二: starter word is not present in each of S00–S03
RULE4 FAIL coverage:飞机: 1 curriculum scenes; requires at least 3
RULE4 FAIL coverage:分钟: 1 curriculum scenes; requires at least 3
RULE4 FAIL coverage:高兴: 1 curriculum scenes; requires at least 3
RULE4 FAIL coverage:汉语: 1 curriculum scenes; requires at least 3
RULE4 FAIL coverage:好: starter word is not present in each of S00–S03
RULE4 FAIL coverage:和: 1 curriculum scenes; requires at least 3
RULE4 FAIL coverage:会: 1 curriculum scenes; requires at least 3
RULE4 FAIL coverage:火车站: 2 curriculum scenes; requires at least 3
RULE4 FAIL coverage:开: 1 curriculum scenes; requires at least 3
RULE4 FAIL coverage:来: 2 curriculum scenes; requires at least 3
RULE4 FAIL coverage:了: 2 curriculum scenes; requires at least 3
RULE4 FAIL coverage:冷: 2 curriculum scenes; requires at least 3
RULE4 FAIL coverage:妈妈: 1 curriculum scenes; requires at least 3
RULE4 FAIL coverage:买: 2 curriculum scenes; requires at least 3
RULE4 FAIL coverage:没关系: 1 curriculum scenes; requires at least 3
RULE4 FAIL coverage:米饭: 1 curriculum scenes; requires at least 3
RULE4 FAIL coverage:明天: 2 curriculum scenes; requires at least 3
RULE4 FAIL coverage:名字: 1 curriculum scenes; requires at least 3
RULE4 FAIL coverage:那: starter word is not present in each of S00–S03
RULE4 FAIL coverage:能: 1 curriculum scenes; requires at least 3
RULE4 FAIL coverage:你: starter word is not present in each of S00–S03
RULE4 FAIL coverage:年: 2 curriculum scenes; requires at least 3
RULE4 FAIL coverage:女儿: 1 curriculum scenes; requires at least 3
RULE4 FAIL coverage:朋友: 2 curriculum scenes; requires at least 3
RULE4 FAIL coverage:漂亮: 1 curriculum scenes; requires at least 3
RULE4 FAIL coverage:苹果: 2 curriculum scenes; requires at least 3
RULE4 FAIL coverage:热: 1 curriculum scenes; requires at least 3
RULE4 FAIL coverage:日: 1 curriculum scenes; requires at least 3
RULE4 FAIL coverage:三: starter word is not present in each of S00–S03
RULE4 FAIL coverage:什么: 2 curriculum scenes; requires at least 3
RULE4 FAIL coverage:是: starter word is not present in each of S00–S03
RULE4 FAIL coverage:水果: 2 curriculum scenes; requires at least 3
RULE4 FAIL coverage:睡觉: 1 curriculum scenes; requires at least 3
RULE4 FAIL coverage:说话: 1 curriculum scenes; requires at least 3
RULE4 FAIL coverage:四: starter word is not present in each of S00–S03
RULE4 FAIL coverage:岁: 1 curriculum scenes; requires at least 3
RULE4 FAIL coverage:太: 1 curriculum scenes; requires at least 3
RULE4 FAIL coverage:天: 1 curriculum scenes; requires at least 3
RULE4 FAIL coverage:天气: 1 curriculum scenes; requires at least 3
RULE4 FAIL coverage:听: 1 curriculum scenes; requires at least 3
RULE4 FAIL coverage:同学: 2 curriculum scenes; requires at least 3
RULE4 FAIL coverage:喂: 2 curriculum scenes; requires at least 3
RULE4 FAIL coverage:我们: 2 curriculum scenes; requires at least 3
RULE4 FAIL coverage:喜欢: 1 curriculum scenes; requires at least 3
RULE4 FAIL coverage:下午: 1 curriculum scenes; requires at least 3
RULE4 FAIL coverage:现在: 2 curriculum scenes; requires at least 3
RULE4 FAIL coverage:想: 1 curriculum scenes; requires at least 3
RULE4 FAIL coverage:些: 2 curriculum scenes; requires at least 3
RULE4 FAIL coverage:写: 1 curriculum scenes; requires at least 3
RULE4 FAIL coverage:谢谢: 2 curriculum scenes; requires at least 3
RULE4 FAIL coverage:星期: 1 curriculum scenes; requires at least 3
RULE4 FAIL coverage:学习: 1 curriculum scenes; requires at least 3
RULE4 FAIL coverage:学校: 2 curriculum scenes; requires at least 3
RULE4 FAIL coverage:一: starter word is not present in each of S00–S03
RULE4 FAIL coverage:衣服: 1 curriculum scenes; requires at least 3
RULE4 FAIL coverage:椅子: 1 curriculum scenes; requires at least 3
RULE4 FAIL coverage:月: 1 curriculum scenes; requires at least 3
RULE4 FAIL coverage:再见: 1 curriculum scenes; requires at least 3
RULE4 FAIL coverage:怎么: 2 curriculum scenes; requires at least 3
RULE4 FAIL coverage:怎么样: 2 curriculum scenes; requires at least 3
RULE4 FAIL coverage:这: starter word is not present in each of S00–S03
RULE4 FAIL coverage:中国: 1 curriculum scenes; requires at least 3
RULE4 FAIL coverage:桌子: 1 curriculum scenes; requires at least 3
RULE4 FAIL coverage:字: 2 curriculum scenes; requires at least 3
RULE4 FAIL coverage:昨天: 1 curriculum scenes; requires at least 3
RULE4 FAIL coverage:坐: 1 curriculum scenes; requires at least 3
RULE10 FAIL scene:p1_delivery_directions_01: requires "下" before it is encountered on the canonical route
RULE14 FAIL p1_warehouse_porter_02/p1_warehouse_porter_02_e4/line: tested word "上" is not present in the exchange; tested word "下" is not present in the exchange
RULE14 FAIL p1_wrong_bus_01/p1_wrong_bus_01_e3/line: tested word "下午" is not present in the exchange; tested word "分钟" is not present in the exchange
RULE14 FAIL p1_buy_fruit_01/p1_buy_fruit_01_e2/line: tested word "水果" is not present in the exchange
RULE14 FAIL p1_warehouse_review_03/p1_warehouse_review_03_e4/line: tested word "怎么样" is not present in the exchange
RULE14 FAIL p1_noodle_review_04/p1_noodle_review_04_e1/line: tested word "中国" is not present in the exchange
RULE14 FAIL p1_noodle_review_04/p1_noodle_review_04_e2/line: tested word "都" is not present in the exchange
```

Rule 2 FAIL — p1_pay_rent_01/p1_pay_rent_01_e2 introduces 3 words: 年, 今天, 日; p1_weather_lunch_01/p1_weather_lunch_01_e2 introduces 3 words: 天, 热, 了
Rule 3 FAIL — p1_mentor_quantities_02/p1_mentor_quantities_02_e3/line tags [这, 书, 你, 读] != segmentation [这, 本, 书, 你, 读]; p1_landlord_phone_01/p1_landlord_phone_01_e3/line tags [你, 今天, 很, 冷, 你, 呢] != segmentation [今天, 很, 
Rule 4 FAIL — 80/150 phase-list words appear in fewer than 3 curriculum scenes
Summary FAIL — 3 rules failed, 0 warnings.
