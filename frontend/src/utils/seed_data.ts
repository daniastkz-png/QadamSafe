import { db } from '../services/firebase';
import { doc, writeBatch } from 'firebase/firestore';
import { Scenario } from '../types';

const now = new Date().toISOString();

export const SCENARIOS: Scenario[] = [
    {
        id: 'scenario_001_family',
        title: 'Осторожно: Фишинговые SMS',
        titleEn: 'Beware: Phishing SMS',
        titleKk: 'Абай болыңыз: Фишинг SMS',
        description: 'Научитесь распознавать мошенников, выдающих себя за ваших близких.',
        descriptionEn: 'Learn to recognize scammers pretending to be your loved ones.',
        descriptionKk: 'Жақындарыңыз болып көрінетін алаяқтарды тануды үйреніңіз.',
        type: 'SMS_PHISHING',
        difficulty: 'BEGINNER',
        requiredTier: 'FREE',
        pointsReward: 100,
        order: 1,
        isLegitimate: false,
        createdAt: now,
        updatedAt: now,
        content: {
            steps: [
                {
                    id: 'step1',
                    type: 'question',
                    content: 'Вы получаете сообщение в WhatsApp с незнакомого номера. На фото профиля — ваш сын или брат.\n\nСообщение:\n"Мам, привет. Я телефон потерял, это номер друга. Скинь срочно 15 000 ₸ на Каспи, очень надо, потом объясню. Номер: +7 705 XXX XX XX"',
                    contentEn: 'You receive a WhatsApp message from an unknown number. The profile picture shows your son or brother.\n\nMessage:\n"Mom, hi. I lost my phone, this is my friend\'s number. Send 15,000 ₸ to Kaspi urgently, I really need it, I\'ll explain later. Number: +7 705 XXX XX XX"',
                    contentKk: 'Сізге белгісіз нөмірден WhatsApp хабарламасы келеді. Профиль суретінде — сіздің ұлыңыз немесе ағаңыз.\n\nХабарлама:\n"Апа, сәлем. Телефонымды жоғалттым, бұл досымның нөмірі. Каспиге 15 000 ₸ жіберші, өте керек, кейін түсіндіремін. Нөмір: +7 705 XXX XX XX"',
                    options: [
                        {
                            id: 'opt1',
                            text: 'Сразу переведу деньги, ведь это мой родственник',
                            textEn: 'Transfer money immediately, it\'s my relative',
                            textKk: 'Дереу ақша аударамын, бұл менің туысым ғой',
                            outcomeType: 'dangerous',
                            explanation: 'Опасно! Это классическая схема мошенничества. Мошенники копируют фото профиля и выдают себя за родственников. Никогда не переводите деньги без голосового подтверждения.',
                            explanationEn: 'Dangerous! This is a classic scam scheme. Scammers copy profile pictures and pretend to be relatives. Never transfer money without voice confirmation.',
                            explanationKk: 'Қауіпті! Бұл классикалық алаяқтық схемасы. Алаяқтар профиль суретін көшіріп, туыс болып көрінеді. Дауыспен растамай ақша аудармаңыз.'
                        },
                        {
                            id: 'opt2',
                            text: 'Отвечу на сообщение и уточню детали',
                            textEn: 'Reply to the message and clarify details',
                            textKk: 'Хабарламаға жауап беріп, егжей-тегжейін сұраймын',
                            outcomeType: 'risky',
                            explanation: 'Рискованно. Мошенники могут продолжить давить на эмоции и убедить вас перевести деньги. Лучше не вступать в диалог.',
                            explanationEn: 'Risky. Scammers may continue to pressure you emotionally and convince you to transfer money. Better not to engage.',
                            explanationKk: 'Тәуекелді. Алаяқтар эмоцияға қысым жасауды жалғастырып, ақша аударуға сендіре алады. Диалогқа түспеген дұрыс.'
                        },
                        {
                            id: 'opt3',
                            text: 'Позвоню родственнику на старый номер для проверки',
                            textEn: 'Call my relative on their old number to verify',
                            textKk: 'Тексеру үшін туысқа ескі нөмірге қоңырау шаламын',
                            outcomeType: 'safe',
                            explanation: 'Отлично! Это самый безопасный способ. Всегда проверяйте подобные просьбы голосовым звонком на известный вам номер.',
                            explanationEn: 'Excellent! This is the safest way. Always verify such requests with a voice call to a number you know.',
                            explanationKk: 'Тамаша! Бұл ең қауіпсіз тәсіл. Мұндай сұраныстарды әрқашан білетін нөміріңізге дауыстық қоңыраумен тексеріңіз.'
                        },
                        {
                            id: 'opt4',
                            text: 'Проигнорирую сообщение',
                            textEn: 'Ignore the message',
                            textKk: 'Хабарламаны елемеймін',
                            outcomeType: 'safe',
                            explanation: 'Правильно! Игнорирование подозрительных сообщений — безопасная стратегия. Если это действительно ваш родственник, он найдет другой способ связаться.',
                            explanationEn: 'Correct! Ignoring suspicious messages is a safe strategy. If it\'s really your relative, they will find another way to contact you.',
                            explanationKk: 'Дұрыс! Күдікті хабарламаларды елемеу — қауіпсіз стратегия. Егер бұл шынымен туысыңыз болса, байланысудың басқа жолын табады.'
                        }
                    ]
                },
                {
                    id: 'step2',
                    type: 'information',
                    content: '✅ Вывод:\n\nНикогда не переводите деньги "родственникам" с незнакомых номеров без личного подтверждения голосом.\n\n🔑 Ключевые признаки мошенничества:\n• Срочность и давление\n• Просьба о деньгах с нового номера\n• Отказ от голосового звонка\n• Эмоциональное давление',
                    contentEn: '✅ Conclusion:\n\nNever transfer money to "relatives" from unknown numbers without personal voice confirmation.\n\n🔑 Key signs of fraud:\n• Urgency and pressure\n• Money request from new number\n• Refusal of voice call\n• Emotional pressure',
                    contentKk: '✅ Қорытынды:\n\nБелгісіз нөмірлерден "туыстарға" дауыспен жеке растамай ақша аудармаңыз.\n\n🔑 Алаяқтықтың негізгі белгілері:\n• Шұғылдық және қысым\n• Жаңа нөмірден ақша сұрау\n• Дауыстық қоңыраудан бас тарту\n• Эмоционалды қысым'
                }
            ]
        }
    },
    {
        id: 'scenario_002_bank',
        title: 'Звонок из "Службы безопасности"',
        titleEn: 'Call from "Security Service"',
        titleKk: '"Қауіпсіздік қызметінен" қоңырау',
        description: 'Классическая схема с попыткой кражи денег с карты под видом защиты.',
        descriptionEn: 'Classic scheme trying to steal money from card pretending to protect it.',
        descriptionKk: 'Қорғау сылтауымен картадан ақша ұрлаудың классикалық схемасы.',
        type: 'SOCIAL_ENGINEERING',
        difficulty: 'BEGINNER',
        requiredTier: 'FREE',
        pointsReward: 150,
        order: 2,
        isLegitimate: false,
        createdAt: now,
        updatedAt: now,
        content: {
            steps: [
                {
                    id: 'step1',
                    type: 'question',
                    content: 'Вам поступает звонок. Голос уверенный, фоном слышен шум колл-центра.\n\n"Служба безопасности":\n"Уважаемый клиент! Зафиксирована подозрительная попытка перевода на сумму 150 000₸. Если это не Вы, срочно сообщите код из SMS для отмены операции."',
                    contentEn: 'You receive a call. The voice is confident, you can hear call center noise in the background.\n\n"Security Service":\n"Dear client! A suspicious transfer attempt of 150,000₸ has been detected. If this wasn\'t you, urgently provide the SMS code to cancel the operation."',
                    contentKk: 'Сізге қоңырау келеді. Дауыс сенімді, фонда колл-орталық шуы естіледі.\n\n"Қауіпсіздік қызметі":\n"Құрметті клиент! 150 000₸ сомасына күдікті аударым әрекеті тіркелді. Егер бұл сіз болмасаңыз, операцияны болдырмау үшін SMS кодын дереу хабарлаңыз."',
                    options: [
                        {
                            id: 'opt1',
                            text: 'Перейду по ссылке, чтобы проверить информацию',
                            textEn: 'Follow the link to verify information',
                            textKk: 'Ақпаратты тексеру үшін сілтемені ашамын',
                            outcomeType: 'dangerous',
                            explanation: 'Опасно! Никогда не переходите по ссылкам из подозрительных звонков или SMS.',
                            explanationEn: 'Dangerous! Never click on links from suspicious calls or SMS.',
                            explanationKk: 'Қауіпті! Күдікті қоңыраулар немесе SMS-тердегі сілтемелерді ешқашан ашпаңыз.'
                        },
                        {
                            id: 'opt2',
                            text: 'Отвечу на сообщение и уточню детали',
                            textEn: 'Reply to the message and clarify details',
                            textKk: 'Хабарламаға жауап беріп, егжей-тегжейін сұраймын',
                            outcomeType: 'risky',
                            explanation: 'Рискованно. Мошенники используют психологическое давление. Лучше положить трубку и проверить самостоятельно.',
                            explanationEn: 'Risky. Scammers use psychological pressure. Better to hang up and check yourself.',
                            explanationKk: 'Тәуекелді. Алаяқтар психологиялық қысым жасайды. Телефонды қойып, өзіңіз тексерген дұрыс.'
                        },
                        {
                            id: 'opt3',
                            text: 'Проверю информацию через официальное приложение банка',
                            textEn: 'Check information via official bank app',
                            textKk: 'Банктің ресми қосымшасы арқылы ақпаратты тексеремін',
                            outcomeType: 'safe',
                            explanation: 'Отлично! В приложении вы увидите реальное состояние счета. Звонящий — мошенник.',
                            explanationEn: 'Excellent! In the app you will see the real account status. The caller is a scammer.',
                            explanationKk: 'Тамаша! Қосымшада шоттың нақты жағдайын көресіз. Қоңырау шалушы — алаяқ.'
                        },
                        {
                            id: 'opt4',
                            text: 'Проигнорирую сообщение',
                            textEn: 'Ignore the message',
                            textKk: 'Хабарламаны елемеймін',
                            outcomeType: 'safe',
                            explanation: 'Правильно! Банк никогда не звонит с просьбой сообщить код из SMS. Игнорирование — безопасный выбор.',
                            explanationEn: 'Correct! Banks never call asking for SMS codes. Ignoring is a safe choice.',
                            explanationKk: 'Дұрыс! Банк SMS кодын сұрап ешқашан қоңырау шалмайды. Елемеу — қауіпсіз таңдау.'
                        }
                    ]
                },
                {
                    id: 'step2',
                    type: 'information',
                    content: 'Вывод: Банк никогда не звонит, чтобы спросить код из SMS или перевести деньги на "безопасный счет".',
                    contentEn: 'Conclusion: Banks never call to ask for SMS codes or to transfer money to a "safe account".',
                    contentKk: 'Қорытынды: Банк SMS кодын сұрау немесе "қауіпсіз шотқа" ақша аудару үшін ешқашан қоңырау шалмайды.'
                }
            ]
        }
    },
    {
        id: 'scenario_003_egov',
        title: 'Фейковые выплаты от государства',
        titleEn: 'Fake Government Payments',
        titleKk: 'Мемлекеттен жалған төлемдер',
        description: 'Фишинг под видом официальных порталов (Egov/ЦОН).',
        descriptionEn: 'Phishing disguised as official portals.',
        descriptionKk: 'Ресми порталдар сияқты көрінетін фишинг.',
        type: 'SMS_PHISHING',
        difficulty: 'INTERMEDIATE',
        requiredTier: 'FREE',
        pointsReward: 150,
        order: 3,
        isLegitimate: false,
        createdAt: now,
        updatedAt: now,
        content: {
            steps: [
                {
                    id: 'step1',
                    type: 'question',
                    content: 'Вы получаете SMS с приятной новостью о социальной выплате.\n\nОт: 1414 (Fake)\n"Вам назначена социальная выплата 50 000₸. Для получения перейдите по ссылке: egov-portal-kz.com/payment. Срок действия ссылки 24 часа."',
                    contentEn: 'You receive an SMS with pleasant news about a social payment.\n\nFrom: 1414 (Fake)\n"You have been assigned a social payment of 50,000₸. To receive it, follow the link: egov-portal-kz.com/payment. Link valid for 24 hours."',
                    contentKk: 'Сізге әлеуметтік төлем туралы қуанышты хабармен SMS келеді.\n\nКімнен: 1414 (Жалған)\n"Сізге 50 000₸ әлеуметтік төлем тағайындалды. Алу үшін сілтемені ашыңыз: egov-portal-kz.com/payment. Сілтеме 24 сағат жарамды."',
                    options: [
                        {
                            id: 'opt1',
                            text: 'Перейду по ссылке, чтобы проверить информацию',
                            textEn: 'Follow the link to verify information',
                            textKk: 'Ақпаратты тексеру үшін сілтемені ашамын',
                            outcomeType: 'dangerous',
                            explanation: 'Сайт egov-portal-kz.com — подделка (настоящий egov.kz). Вы передадите данные карты мошенникам.',
                            explanationEn: 'The site egov-portal-kz.com is fake (real one is egov.kz). You will give your card details to scammers.',
                            explanationKk: 'egov-portal-kz.com сайты — жалған (нақтысы egov.kz). Карта деректерін алаяқтарға бересіз.'
                        },
                        {
                            id: 'opt2',
                            text: 'Отвечу на сообщение и уточню детали',
                            textEn: 'Reply to the message and clarify details',
                            textKk: 'Хабарламаға жауап беріп, егжей-тегжейін сұраймын',
                            outcomeType: 'risky',
                            explanation: 'Рискованно. Мошенники могут прислать еще более убедительные фейковые ссылки. Не вступайте в диалог.',
                            explanationEn: 'Risky. Scammers may send even more convincing fake links. Don\'t engage.',
                            explanationKk: 'Тәуекелді. Алаяқтар одан да сенімді жалған сілтемелер жібере алады. Диалогқа түспеңіз.'
                        },
                        {
                            id: 'opt3',
                            text: 'Проверю информацию через официальное приложение банка',
                            textEn: 'Check information via official bank app',
                            textKk: 'Банктің ресми қосымшасы арқылы ақпаратты тексеремін',
                            outcomeType: 'safe',
                            explanation: 'Хорошо, но лучше зайти на официальный сайт egov.kz вручную. Если выплата есть — она будет в личном кабинете.',
                            explanationEn: 'Good, but better to go to the official egov.kz site manually. If there\'s a payment — it will be in your personal account.',
                            explanationKk: 'Жақсы, бірақ ресми egov.kz сайтына қолмен кірген дұрыс. Төлем болса — жеке кабинетте болады.'
                        },
                        {
                            id: 'opt4',
                            text: 'Проигнорирую сообщение',
                            textEn: 'Ignore the message',
                            textKk: 'Хабарламаны елемеймін',
                            outcomeType: 'safe',
                            explanation: 'Правильно! Официальные госорганы не присылают ссылки на .com домены. Всегда проверяйте через egov.kz.',
                            explanationEn: 'Correct! Official government agencies don\'t send links to .com domains. Always check via egov.kz.',
                            explanationKk: 'Дұрыс! Ресми мемлекеттік органдар .com доменіне сілтеме жібермейді. Әрқашан egov.kz арқылы тексеріңіз.'
                        }
                    ]
                },
                {
                    id: 'step2',
                    type: 'information',
                    content: 'Вывод: Проверяйте адрес ссылки. Официальные госсайты заканчиваются на .gov.kz или .kz, а не .com/net/org.',
                    contentEn: 'Conclusion: Check the link address. Official government sites end with .gov.kz or .kz, not .com/net/org.',
                    contentKk: 'Қорытынды: Сілтеме мекенжайын тексеріңіз. Ресми мемлекеттік сайттар .gov.kz немесе .kz аяқталады, .com/net/org емес.'
                }
            ]
        }
    },
    {
        id: 'scenario_004_job',
        title: 'Легкий заработок (Лайки за деньги)',
        titleEn: 'Easy Money (Likes for Cash)',
        titleKk: 'Оңай ақша (Лайктар үшін ақша)',
        description: 'Схема с вовлечением в финансовую пирамиду или кражей данных под видом работы.',
        descriptionEn: 'Scheme involving financial pyramid or data theft disguised as a job.',
        descriptionKk: 'Жұмыс түріндегі қаржылық пирамида немесе деректерді ұрлау схемасы.',
        type: 'SOCIAL_ENGINEERING',
        difficulty: 'INTERMEDIATE',
        requiredTier: 'FREE',
        pointsReward: 200,
        order: 4,
        isLegitimate: false,
        createdAt: now,
        updatedAt: now,
        content: {
            steps: [
                {
                    id: 'step1',
                    type: 'question',
                    content: 'В Telegram приходит сообщение от "HR менеджера".\n\nHR Manager Anna:\n"Здравствуйте! Ищем сотрудников на удаленку. Задача: ставить лайки на товары Wildberries/Ozon. Оплата: от 25 000₸ в день. Интересно?"',
                    contentEn: 'You receive a Telegram message from an "HR manager".\n\nHR Manager Anna:\n"Hello! We are looking for remote employees. Task: like products on Wildberries/Ozon. Payment: from 25,000₸ per day. Interested?"',
                    contentKk: 'Telegram-ға "HR менеджерден" хабарлама келеді.\n\nHR Manager Anna:\n"Сәлеметсіз бе! Қашықтан жұмыс істейтін қызметкерлер іздейміз. Тапсырма: Wildberries/Ozon тауарларына лайк қою. Төлем: күніне 25 000₸-ден. Қызықты ма?"',
                    options: [
                        {
                            id: 'opt1',
                            text: 'Перейду по ссылке, чтобы проверить информацию',
                            textEn: 'Follow the link to verify information',
                            textKk: 'Ақпаратты тексеру үшін сілтемені ашамын',
                            outcomeType: 'dangerous',
                            explanation: 'Опасно! Ссылки от мошенников могут вести на фишинговые сайты или вредоносное ПО.',
                            explanationEn: 'Dangerous! Links from scammers may lead to phishing sites or malware.',
                            explanationKk: 'Қауіпті! Алаяқтардың сілтемелері фишинг сайттарға немесе зиянды бағдарламаларға апаруы мүмкін.'
                        },
                        {
                            id: 'opt2',
                            text: 'Отвечу на сообщение и уточню детали',
                            textEn: 'Reply to the message and clarify details',
                            textKk: 'Хабарламаға жауап беріп, егжей-тегжейін сұраймын',
                            outcomeType: 'risky',
                            explanation: 'Рискованно. Сначала вам могут заплатить копейки, чтобы войти в доверие, а потом попросят "выкупить товар".',
                            explanationEn: 'Risky. They may first pay you pennies to gain trust, then ask you to "buy products".',
                            explanationKk: 'Тәуекелді. Алдымен сенім ұту үшін тиын төлеп, кейін "тауар сатып алуды" сұрауы мүмкін.'
                        },
                        {
                            id: 'opt3',
                            text: 'Проверю информацию через официальное приложение банка',
                            textEn: 'Check information via official bank app',
                            textKk: 'Банктің ресми қосымшасы арқылы ақпаратты тексеремін',
                            outcomeType: 'risky',
                            explanation: 'Это не поможет в данной ситуации. Лучше сразу заблокировать контакт — никто не платит 25 000₸ за лайки.',
                            explanationEn: 'This won\'t help in this situation. Better to block the contact immediately — nobody pays 25,000₸ for likes.',
                            explanationKk: 'Бұл жағдайда көмектеспейді. Контактіді дереу бұғаттаған дұрыс — ешкім лайктар үшін 25 000₸ төлемейді.'
                        },
                        {
                            id: 'opt4',
                            text: 'Проигнорирую сообщение',
                            textEn: 'Ignore the message',
                            textKk: 'Хабарламаны елемеймін',
                            outcomeType: 'safe',
                            explanation: 'Отлично! Бесплатный сыр только в мышеловке. Игнорирование подозрительных предложений — лучшая защита.',
                            explanationEn: 'Excellent! There\'s no such thing as a free lunch. Ignoring suspicious offers is the best protection.',
                            explanationKk: 'Тамаша! Тегін ірімшік тек тұзақта болады. Күдікті ұсыныстарды елемеу — ең жақсы қорғаныс.'
                        }
                    ]
                },
                {
                    id: 'step2',
                    type: 'information',
                    content: 'Вывод: Схемы "легкого заработка" всегда ведут к потере денег. Не верьте в мгновенное обогащение.',
                    contentEn: 'Conclusion: "Easy money" schemes always lead to losing money. Don\'t believe in instant wealth.',
                    contentKk: 'Қорытынды: "Оңай табыс" схемалары әрқашан ақша жоғалтуға әкеледі. Лезде байып кетуге сенбеңіз.'
                }
            ]
        }
    },
    {
        id: 'scenario_005_post',
        title: 'Посылка с "неверным адресом"',
        titleEn: 'Parcel with "Wrong Address"',
        titleKk: '"Қате мекенжай" бар сәлемдеме',
        description: 'Мошенничество с доставкой товаров и оплатой мелких пошлин.',
        descriptionEn: 'Scam involving delivery and small fee payments.',
        descriptionKk: 'Тауарларды жеткізу және шағын баждарды төлеу алаяқтығы.',
        type: 'SMS_PHISHING',
        difficulty: 'ADVANCED',
        requiredTier: 'FREE',
        pointsReward: 200,
        order: 5,
        isLegitimate: false,
        createdAt: now,
        updatedAt: now,
        content: {
            steps: [
                {
                    id: 'step1',
                    type: 'question',
                    content: 'SMS от службы доставки (хотя вы ничего не ждете, или ждете, что делает это опаснее).\n\nKazPost:\n"Ваша посылка прибыла на склад, но адрес указан неверно. Для доставки обновите адрес и оплатите пошлину 450₸ по ссылке: kazpost-delivery-track.com"',
                    contentEn: 'SMS from delivery service (even though you\'re not expecting anything, or you are, which makes it more dangerous).\n\nKazPost:\n"Your parcel has arrived at the warehouse, but the address is incorrect. To deliver, update the address and pay a 450₸ fee via link: kazpost-delivery-track.com"',
                    contentKk: 'Жеткізу қызметінен SMS (ештеңе күтпесеңіз де, немесе күтсеңіз де, бұл қауіптірек етеді).\n\nKazPost:\n"Сәлемдемеңіз қоймаға келді, бірақ мекенжай қате көрсетілген. Жеткізу үшін мекенжайды жаңартып, 450₸ баж төлеңіз: kazpost-delivery-track.com"',
                    options: [
                        {
                            id: 'opt1',
                            text: 'Перейду по ссылке, чтобы проверить информацию',
                            textEn: 'Follow the link to verify information',
                            textKk: 'Ақпаратты тексеру үшін сілтемені ашамын',
                            outcomeType: 'dangerous',
                            explanation: 'Вы потеряете не 450₸, а все деньги на карте, так как введете данные на фишинговом сайте.',
                            explanationEn: 'You will lose not 450₸, but all money on your card, as you will enter data on a phishing site.',
                            explanationKk: '450₸ емес, картадағы барлық ақшаны жоғалтасыз, өйткені фишинг сайтына деректерді енгізесіз.'
                        },
                        {
                            id: 'opt2',
                            text: 'Отвечу на сообщение и уточню детали',
                            textEn: 'Reply to the message and clarify details',
                            textKk: 'Хабарламаға жауап беріп, егжей-тегжейін сұраймын',
                            outcomeType: 'risky',
                            explanation: 'Рискованно. Мошенники могут прислать еще более убедительные фейковые ссылки.',
                            explanationEn: 'Risky. Scammers may send even more convincing fake links.',
                            explanationKk: 'Тәуекелді. Алаяқтар одан да сенімді жалған сілтемелер жібере алады.'
                        },
                        {
                            id: 'opt3',
                            text: 'Проверю информацию через официальное приложение банка',
                            textEn: 'Check information via official bank app',
                            textKk: 'Банктің ресми қосымшасы арқылы ақпаратты тексеремін',
                            outcomeType: 'safe',
                            explanation: 'Хорошо, но лучше проверить трек-номер на официальном сайте post.kz.',
                            explanationEn: 'Good, but better to check the tracking number on the official post.kz site.',
                            explanationKk: 'Жақсы, бірақ трек-нөмірді ресми post.kz сайтында тексерген дұрыс.'
                        },
                        {
                            id: 'opt4',
                            text: 'Проигнорирую сообщение',
                            textEn: 'Ignore the message',
                            textKk: 'Хабарламаны елемеймін',
                            outcomeType: 'safe',
                            explanation: 'Правильно! Всегда проверяйте треки на официальном сайте почты. Игнорирование подозрительных SMS — безопасная стратегия.',
                            explanationEn: 'Correct! Always check tracking on the official postal site. Ignoring suspicious SMS is a safe strategy.',
                            explanationKk: 'Дұрыс! Тректі әрқашан ресми пошта сайтында тексеріңіз. Күдікті SMS-терді елемеу — қауіпсіз стратегия.'
                        }
                    ]
                },
                {
                    id: 'step2',
                    type: 'information',
                    content: 'Вывод: Фишеры часто используют маленькие суммы (пошлина, комиссия), чтобы усыпить бдительность.',
                    contentEn: 'Conclusion: Phishers often use small amounts (fees, commissions) to lower your guard.',
                    contentKk: 'Қорытынды: Фишерлер сақтықты әлсірету үшін жиі шағын сомаларды (баж, комиссия) пайдаланады.'
                }
            ]
        }
    }
];

export const seedScenarios = async () => {
    try {
        console.log('Starting batch seed of scenarios...');
        const batch = writeBatch(db);

        SCENARIOS.forEach((scenario) => {
            const docRef = doc(db, 'scenarios', scenario.id);
            batch.set(docRef, scenario);
        });

        await batch.commit();
        console.log('All 5 scenarios seeded successfully!');
        return true;
    } catch (error) {
        console.error('Error seeding scenarios:', error);
        throw error;
    }
};
