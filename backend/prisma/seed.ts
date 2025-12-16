import { PrismaClient, ScenarioDifficulty, ScenarioType, SubscriptionTier } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...');

    // Create 7 Progressive Learning Scenarios
    const scenarios = [
        // LEVEL 1: ЛЁГКИЙ - Obvious Phishing (3 questions)
        {
            title: 'Уровень 1: Основы безопасности',
            titleEn: 'Level 1: Security Basics',
            description: 'Научитесь распознавать очевидные признаки мошенничества',
            descriptionEn: 'Learn to recognize obvious signs of fraud',
            type: ScenarioType.EMAIL_PHISHING,
            difficulty: ScenarioDifficulty.BEGINNER,
            requiredTier: SubscriptionTier.FREE,
            pointsReward: 30,
            order: 0,
            isLegitimate: false,
            content: {
                steps: [
                    {
                        id: 'q1',
                        type: 'decision',
                        content: 'Вы получили SMS: "Ваша карта заблокирована! Срочно перейдите по ссылке bit.ly/card123 для разблокировки". Что вас должно насторожить?',
                        contentEn: 'You received SMS: "Your card is blocked! Urgently follow link bit.ly/card123 to unblock". What should alert you?',
                        options: [
                            {
                                id: 'a',
                                text: 'Короткая ссылка и срочность',
                                textEn: 'Short link and urgency',
                                outcomeType: 'safe',
                                explanation: 'Верно! Банки не используют короткие ссылки и не требуют срочных действий через SMS.',
                                explanationEn: 'Correct! Banks don\'t use short links and don\'t require urgent actions via SMS.',
                            },
                            {
                                id: 'b',
                                text: 'Перейду по ссылке, но сначала проверю баланс в приложении',
                                textEn: 'Will follow link, but first check balance in app',
                                outcomeType: 'risky',
                                explanation: 'Рискованно! Хорошо, что проверяете в приложении, но переходить по подозрительной ссылке всё равно опасно. Лучше позвонить в банк.',
                                explanationEn: 'Risky! Good that you check in app, but following suspicious link is still dangerous. Better to call bank.',
                            },
                            {
                                id: 'c',
                                text: 'Ничего подозрительного, надо перейти',
                                textEn: 'Nothing suspicious, should follow',
                                outcomeType: 'dangerous',
                                explanation: 'Опасно! Это классический фишинг. Короткие ссылки и искусственная срочность - главные признаки мошенничества.',
                                explanationEn: 'Dangerous! This is classic phishing. Short links and artificial urgency are main fraud signs.',
                            },
                        ],
                    },
                    {
                        id: 'q2',
                        type: 'decision',
                        content: 'Email от "support@paypa1.com" просит подтвердить данные карты. Что не так?',
                        contentEn: 'Email from "support@paypa1.com" asks to confirm card details. What\'s wrong?',
                        options: [
                            {
                                id: 'a',
                                text: 'Домен с цифрой "1" вместо буквы "l"',
                                textEn: 'Domain with digit "1" instead of letter "l"',
                                outcomeType: 'safe',
                                explanation: 'Отлично! Поддельный домен - главный признак фишинга. Настоящий PayPal: paypal.com',
                                explanationEn: 'Excellent! Fake domain is the main phishing sign. Real PayPal: paypal.com',
                            },
                            {
                                id: 'b',
                                text: 'Введу данные, но только последние 4 цифры карты',
                                textEn: 'Will enter data, but only last 4 digits of card',
                                outcomeType: 'risky',
                                explanation: 'Рискованно! Даже частичные данные на поддельном сайте опасны. Мошенники могут использовать их для социальной инженерии.',
                                explanationEn: 'Risky! Even partial data on fake site is dangerous. Scammers can use it for social engineering.',
                            },
                            {
                                id: 'c',
                                text: 'Всё нормально, это официальный адрес',
                                textEn: 'Everything is fine, this is official address',
                                outcomeType: 'dangerous',
                                explanation: 'Опасно! Внимательно смотрите на домен: paypa1.com (с цифрой) вместо paypal.com',
                                explanationEn: 'Dangerous! Look carefully at domain: paypa1.com (with digit) instead of paypal.com',
                            },
                        ],
                    },
                    {
                        id: 'q3',
                        type: 'decision',
                        content: 'На сайте интернет-магазина нет замка 🔒 в адресной строке. Безопасно ли вводить данные карты?',
                        contentEn: 'Online store website has no lock 🔒 in address bar. Is it safe to enter card details?',
                        options: [
                            {
                                id: 'a',
                                text: 'Нет, без HTTPS данные передаются открыто',
                                textEn: 'No, without HTTPS data is transmitted openly',
                                outcomeType: 'safe',
                                explanation: 'Правильно! Без HTTPS (замка) ваши данные могут перехватить. Никогда не вводите платёжные данные на сайтах без защиты.',
                                explanationEn: 'Correct! Without HTTPS (lock) your data can be intercepted. Never enter payment details on unprotected sites.',
                            },
                            {
                                id: 'b',
                                text: 'Введу данные, если цены хорошие',
                                textEn: 'Will enter data if prices are good',
                                outcomeType: 'risky',
                                explanation: 'Рискованно! Низкие цены часто используются как приманка. Без HTTPS ваши данные могут украсть даже на настоящем сайте.',
                                explanationEn: 'Risky! Low prices are often used as bait. Without HTTPS your data can be stolen even on real site.',
                            },
                            {
                                id: 'c',
                                text: 'Да, главное что сайт работает',
                                textEn: 'Yes, main thing is site works',
                                outcomeType: 'dangerous',
                                explanation: 'Очень опасно! Без HTTPS любой может перехватить данные вашей карты. Всегда проверяйте наличие замка.',
                                explanationEn: 'Very dangerous! Without HTTPS anyone can intercept your card data. Always check for the lock.',
                            },
                        ],
                    },
                ],
            },
        },

        // LEVEL 2: РЕАЛИСТИЧНЫЙ - Real Situations (3 questions)
        {
            title: 'Уровень 2: Реальные ситуации',
            titleEn: 'Level 2: Real Situations',
            description: 'Не всё подозрительное - мошенничество. Учитесь проверять',
            descriptionEn: 'Not everything suspicious is fraud. Learn to verify',
            type: ScenarioType.EMAIL_PHISHING,
            difficulty: ScenarioDifficulty.BEGINNER,
            requiredTier: SubscriptionTier.FREE,
            pointsReward: 30,
            order: 1,
            isLegitimate: true,
            content: {
                steps: [
                    {
                        id: 'q1',
                        type: 'decision',
                        content: 'Банк прислал уведомление о новой программе кэшбэка с официального адреса info@halykbank.kz. Что делать?',
                        contentEn: 'Bank sent notification about new cashback program from official address info@halykbank.kz. What to do?',
                        options: [
                            {
                                id: 'a',
                                text: 'Проверю на официальном сайте банка',
                                textEn: 'Will check on official bank website',
                                outcomeType: 'safe',
                                explanation: 'Отлично! Даже если письмо выглядит настоящим, всегда проверяйте информацию через официальные каналы.',
                                explanationEn: 'Excellent! Even if email looks real, always verify information through official channels.',
                            },
                            {
                                id: 'b',
                                text: 'Подключусь сразу, адрес же официальный',
                                textEn: 'Will connect immediately, address is official',
                                outcomeType: 'risky',
                                explanation: 'Рискованно! Даже официальные адреса можно подделать. Лучше проверить на сайте или позвонить.',
                                explanationEn: 'Risky! Even official addresses can be faked. Better to verify on website or call.',
                            },
                            {
                                id: 'c',
                                text: 'Это точно мошенники, игнорирую',
                                textEn: 'This is definitely scammers, ignoring',
                                outcomeType: 'risky',
                                explanation: 'Не всегда! Банки действительно рассылают уведомления. Лучше проверить на сайте, чем упустить выгодное предложение.',
                                explanationEn: 'Not always! Banks do send notifications. Better to check on website than miss a good offer.',
                            },
                        ],
                    },
                    {
                        id: 'q2',
                        type: 'decision',
                        content: 'Школа отправила SMS о родительском собрании завтра в 18:00. Номер незнакомый. Ваши действия?',
                        contentEn: 'School sent SMS about parent meeting tomorrow at 18:00. Unknown number. Your actions?',
                        options: [
                            {
                                id: 'a',
                                text: 'Позвоню в школу для подтверждения',
                                textEn: 'Will call school to confirm',
                                outcomeType: 'safe',
                                explanation: 'Правильно! Проверка через известный номер школы - лучший способ убедиться в подлинности.',
                                explanationEn: 'Correct! Verification through known school number is the best way to ensure authenticity.',
                            },
                            {
                                id: 'b',
                                text: 'Отвечу на SMS и спрошу подробности',
                                textEn: 'Will reply to SMS and ask for details',
                                outcomeType: 'risky',
                                explanation: 'Рискованно! Ответ на незнакомый номер может подтвердить, что ваш номер активен. Лучше позвонить самому.',
                                explanationEn: 'Risky! Replying to unknown number may confirm your number is active. Better to call yourself.',
                            },
                            {
                                id: 'c',
                                text: 'Это мошенники, школа так не пишет',
                                textEn: 'These are scammers, school doesn\'t write like this',
                                outcomeType: 'risky',
                                explanation: 'Не обязательно! Школы используют SMS-рассылки. Лучше проверить, чем пропустить важное собрание.',
                                explanationEn: 'Not necessarily! Schools use SMS notifications. Better to check than miss important meeting.',
                            },
                        ],
                    },
                    {
                        id: 'q3',
                        type: 'decision',
                        content: 'Вы дома один, визитов не ждёте. В дверь стучат — незнакомый мужчина в форме сантехника говорит о срочной проверке труб. Что вы сделаете?',
                        contentEn: 'You are home alone, not expecting visitors. Someone knocks — stranger in plumber uniform says urgent pipe inspection needed. What will you do?',
                        options: [
                            {
                                id: 'a',
                                text: 'Позвоню в управляющую компанию для проверки',
                                textEn: 'Will call management company to verify',
                                outcomeType: 'safe',
                                explanation: 'Отлично! Форма и уверенный тон не гарантируют безопасность. Всегда проверяйте неожиданные визиты через официальные каналы.',
                                explanationEn: 'Excellent! Uniform and confident tone don\'t guarantee safety. Always verify unexpected visits through official channels.',
                            },
                            {
                                id: 'b',
                                text: 'Попрошу показать документы через дверь',
                                textEn: 'Will ask to show documents through door',
                                outcomeType: 'risky',
                                explanation: 'Рискованно! Документы легко подделать. Лучше позвонить в УК и проверить, действительно ли они отправляли сантехника.',
                                explanationEn: 'Risky! Documents are easy to fake. Better to call management company and verify if they actually sent a plumber.',
                            },
                            {
                                id: 'c',
                                text: 'Открою, но не впущу дальше прихожей',
                                textEn: 'Will open, but won\'t let further than hallway',
                                outcomeType: 'dangerous',
                                explanation: 'Опасно! Открывать дверь незнакомцу без проверки рискованно. Мошенники могут проникнуть силой или осмотреть квартиру.',
                                explanationEn: 'Dangerous! Opening door to stranger without verification is risky. Scammers can force entry or survey your apartment.',
                            },
                        ],
                    },
                ],
            },
        },

        // LEVEL 3: СМЕШАННЫЙ - Mixed (3 questions)
        {
            title: 'Уровень 3: Проверка и сомнения',
            titleEn: 'Level 3: Verification and Doubts',
            description: 'Ситуации, требующие проверки. Может быть и так, и так',
            descriptionEn: 'Situations requiring verification. Could go either way',
            type: ScenarioType.SOCIAL_ENGINEERING,
            difficulty: ScenarioDifficulty.INTERMEDIATE,
            requiredTier: SubscriptionTier.FREE,
            pointsReward: 40,
            order: 2,
            isLegitimate: false,
            content: {
                steps: [
                    {
                        id: 'q1',
                        type: 'decision',
                        content: 'Друг пишет в WhatsApp: "Срочно нужны 20000₸, верну завтра. Переведи на Kaspi 8777 123 4567". Обычно он так не просит. Что делать?',
                        contentEn: 'Friend writes on WhatsApp: "Urgently need 20000₸, will return tomorrow. Transfer to Kaspi 8777 123 4567". He usually doesn\'t ask like this. What to do?',
                        options: [
                            {
                                id: 'a',
                                text: 'Позвоню ему голосом для проверки',
                                textEn: 'Will call him by voice to verify',
                                outcomeType: 'safe',
                                explanation: 'Правильно! Аккаунт мог быть взломан. Голосовой звонок - лучший способ проверить личность.',
                                explanationEn: 'Correct! Account could be hacked. Voice call is the best way to verify identity.',
                            },
                            {
                                id: 'b',
                                text: 'Переведу небольшую сумму сначала, чтобы проверить',
                                textEn: 'Will transfer small amount first to check',
                                outcomeType: 'risky',
                                explanation: 'Рискованно! Даже небольшая сумма подтвердит мошенникам, что вы готовы переводить. Лучше позвонить голосом.',
                                explanationEn: 'Risky! Even small amount confirms to scammers you\'re willing to transfer. Better to call by voice.',
                            },
                            {
                                id: 'c',
                                text: 'Сразу переведу, друг же просит',
                                textEn: 'Will transfer immediately, friend is asking',
                                outcomeType: 'dangerous',
                                explanation: 'Опасно! Взлом аккаунтов друзей - частая схема мошенников. Всегда проверяйте голосом.',
                                explanationEn: 'Dangerous! Hacking friends\' accounts is a common scammer scheme. Always verify by voice.',
                            },
                        ],
                    },
                    {
                        id: 'q2',
                        type: 'decision',
                        content: 'Звонок с незнакомого номера: "Это мама, телефон разрядился, звоню с чужого. Срочно переведи 50000₸ на этот номер". Голос похож. Что делать?',
                        contentEn: 'Call from unknown number: "It\'s mom, phone died, calling from someone else\'s. Urgently transfer 50000₸ to this number". Voice sounds similar. What to do?',
                        options: [
                            {
                                id: 'a',
                                text: 'Задам вопрос, который знает только мама',
                                textEn: 'Will ask question only mom knows',
                                outcomeType: 'safe',
                                explanation: 'Отлично! Проверочный вопрос поможет убедиться в личности. Мошенники часто имитируют голоса.',
                                explanationEn: 'Excellent! Verification question helps ensure identity. Scammers often imitate voices.',
                            },
                            {
                                id: 'b',
                                text: 'Переведу половину суммы, чтобы помочь',
                                textEn: 'Will transfer half amount to help',
                                outcomeType: 'risky',
                                explanation: 'Рискованно! Голос можно подделать с помощью ИИ. Даже частичный перевод опасен без проверки личности.',
                                explanationEn: 'Risky! Voice can be faked with AI. Even partial transfer is dangerous without identity verification.',
                            },
                            {
                                id: 'c',
                                text: 'Сразу переведу, голос же мамин',
                                textEn: 'Will transfer immediately, it\'s mom\'s voice',
                                outcomeType: 'dangerous',
                                explanation: 'Очень опасно! Мошенники используют ИИ для имитации голосов. Всегда задавайте проверочные вопросы.',
                                explanationEn: 'Very dangerous! Scammers use AI to imitate voices. Always ask verification questions.',
                            },
                        ],
                    },
                    {
                        id: 'q3',
                        type: 'decision',
                        content: 'SMS: "Подтвердите платёж 89000₸ в магазин Technodom. Если это не вы, позвоните 8-800-080-0000". Вы ничего не покупали. Что делать?',
                        contentEn: 'SMS: "Confirm payment 89000₸ to Technodom store. If not you, call 8-800-080-0000". You didn\'t buy anything. What to do?',
                        options: [
                            {
                                id: 'a',
                                text: 'Позвоню в банк по номеру с обратной стороны карты',
                                textEn: 'Will call bank using number on back of card',
                                outcomeType: 'safe',
                                explanation: 'Правильно! Никогда не звоните по номерам из подозрительных SMS. Используйте официальный номер банка.',
                                explanationEn: 'Correct! Never call numbers from suspicious SMS. Use official bank number.',
                            },
                            {
                                id: 'b',
                                text: 'Отвечу на SMS стоп-словом для отмены',
                                textEn: 'Will reply to SMS with stop word to cancel',
                                outcomeType: 'risky',
                                explanation: 'Рискованно! Ответ на мошенническое SMS подтверждает активность номера. Лучше позвонить в банк напрямую.',
                                explanationEn: 'Risky! Replying to scam SMS confirms number is active. Better to call bank directly.',
                            },
                            {
                                id: 'c',
                                text: 'Позвоню по номеру из SMS',
                                textEn: 'Will call number from SMS',
                                outcomeType: 'dangerous',
                                explanation: 'Опасно! Это номер мошенников. Они попросят данные карты "для отмены". Звоните только по официальному номеру банка.',
                                explanationEn: 'Dangerous! This is scammers\' number. They\'ll ask for card details "to cancel". Call only official bank number.',
                            },
                        ],
                    },
                ],
            },
        },

        // LEVEL 4: ФИНАНСОВЫЙ - Financial (3 questions)
        {
            title: 'Уровень 4: Финансовая безопасность',
            titleEn: 'Level 4: Financial Security',
            description: 'Деньги, коды, платежи - зона повышенного риска',
            descriptionEn: 'Money, codes, payments - high risk zone',
            type: ScenarioType.EMAIL_PHISHING,
            difficulty: ScenarioDifficulty.INTERMEDIATE,
            requiredTier: SubscriptionTier.FREE,
            pointsReward: 50,
            order: 3,
            isLegitimate: false,
            content: {
                steps: [
                    {
                        id: 'q1',
                        type: 'decision',
                        content: 'Звонок: "Служба безопасности Halyk Bank. Ваша карта под угрозой, назовите код из SMS для защиты". Пришёл код 7834. Что делать?',
                        contentEn: 'Call: "Halyk Bank security service. Your card is at risk, tell us code from SMS for protection". Code 7834 arrived. What to do?',
                        options: [
                            {
                                id: 'a',
                                text: 'Положу трубку и позвоню в банк сам',
                                textEn: 'Will hang up and call bank myself',
                                outcomeType: 'safe',
                                explanation: 'Отлично! Банк НИКОГДА не просит коды из SMS. Это мошенники пытаются получить доступ к вашим деньгам.',
                                explanationEn: 'Excellent! Bank NEVER asks for SMS codes. These are scammers trying to access your money.',
                            },
                            {
                                id: 'b',
                                text: 'Назову только первые 3 цифры кода',
                                textEn: 'Will tell only first 3 digits of code',
                                outcomeType: 'risky',
                                explanation: 'Рискованно! Любая часть кода опасна. Мошенники могут подобрать остальное или использовать для давления.',
                                explanationEn: 'Risky! Any part of code is dangerous. Scammers can guess the rest or use it for pressure.',
                            },
                            {
                                id: 'c',
                                text: 'Назову код, раз банк просит',
                                textEn: 'Will tell code since bank asks',
                                outcomeType: 'dangerous',
                                explanation: 'Критически опасно! Код из SMS = доступ к вашим деньгам. Банк НИКОГДА не просит коды. Вы потеряете все деньги.',
                                explanationEn: 'Critically dangerous! SMS code = access to your money. Bank NEVER asks for codes. You\'ll lose all money.',
                            },
                        ],
                    },
                    {
                        id: 'q2',
                        type: 'decision',
                        content: 'Email от Kaspi: "Вам начислен кэшбэк 15000₸! Для получения введите данные карты на странице cashback-kaspi.com". Что не так?',
                        contentEn: 'Email from Kaspi: "You earned cashback 15000₸! To receive enter card details at cashback-kaspi.com". What\'s wrong?',
                        options: [
                            {
                                id: 'a',
                                text: 'Поддельный домен, настоящий kaspi.kz',
                                textEn: 'Fake domain, real one is kaspi.kz',
                                outcomeType: 'safe',
                                explanation: 'Верно! Мошенники создают похожие домены. Kaspi никогда не просит вводить данные карты для кэшбэка.',
                                explanationEn: 'Correct! Scammers create similar domains. Kaspi never asks to enter card details for cashback.',
                            },
                            {
                                id: 'b',
                                text: 'Проверю домен в браузере перед вводом данных',
                                textEn: 'Will check domain in browser before entering data',
                                outcomeType: 'risky',
                                explanation: 'Рискованно! Хорошо, что проверяете, но лучше зайти в приложение Kaspi. Кэшбэк начисляется автоматически.',
                                explanationEn: 'Risky! Good that you check, but better to enter Kaspi app. Cashback is credited automatically.',
                            },
                            {
                                id: 'c',
                                text: 'Введу данные, хочу получить кэшбэк',
                                textEn: 'Will enter details, want to get cashback',
                                outcomeType: 'dangerous',
                                explanation: 'Опасно! Это фишинговый сайт. Вы отдадите данные карты мошенникам. Кэшбэк начисляется автоматически.',
                                explanationEn: 'Dangerous! This is phishing site. You\'ll give card details to scammers. Cashback is credited automatically.',
                            },
                        ],
                    },
                    {
                        id: 'q3',
                        type: 'decision',
                        content: 'SMS: "Попытка входа в Kaspi с нового устройства. Код подтверждения: 4521. Если это не вы, срочно позвоните 8-700-555-0000". Вы не входили. Что делать?',
                        contentEn: 'SMS: "Login attempt to Kaspi from new device. Confirmation code: 4521. If not you, urgently call 8-700-555-0000". You didn\'t login. What to do?',
                        options: [
                            {
                                id: 'a',
                                text: 'Открою приложение Kaspi и сменю пароль',
                                textEn: 'Will open Kaspi app and change password',
                                outcomeType: 'safe',
                                explanation: 'Правильно! Не звоните по номерам из SMS. Смените пароль через приложение и включите двухфакторную аутентификацию.',
                                explanationEn: 'Correct! Don\'t call numbers from SMS. Change password through app and enable two-factor authentication.',
                            },
                            {
                                id: 'b',
                                text: 'Наберу номер Kaspi с сайта и позвоню',
                                textEn: 'Will find Kaspi number on website and call',
                                outcomeType: 'risky',
                                explanation: 'Рискованно! Хорошо, что ищете официальный номер, но быстрее и безопаснее сменить пароль в приложении.',
                                explanationEn: 'Risky! Good that you search for official number, but faster and safer to change password in app.',
                            },
                            {
                                id: 'c',
                                text: 'Позвоню по номеру из SMS',
                                textEn: 'Will call number from SMS',
                                outcomeType: 'dangerous',
                                explanation: 'Опасно! Это номер мошенников. Они выманят у вас коды и данные. Меняйте пароль только через официальное приложение.',
                                explanationEn: 'Dangerous! This is scammers\' number. They\'ll extract codes and data from you. Change password only through official app.',
                            },
                        ],
                    },
                ],
            },
        },

        // LEVEL 5: КОМБИНИРОВАННЫЙ - Combined Channels (3 questions)
        {
            title: 'Уровень 5: Многоканальные атаки',
            titleEn: 'Level 5: Multi-Channel Attacks',
            description: 'Мошенники используют несколько каналов одновременно',
            descriptionEn: 'Scammers use multiple channels simultaneously',
            type: ScenarioType.SOCIAL_ENGINEERING,
            difficulty: ScenarioDifficulty.ADVANCED,
            requiredTier: SubscriptionTier.FREE,
            pointsReward: 60,
            order: 4,
            isLegitimate: false,
            content: {
                steps: [
                    {
                        id: 'q1',
                        type: 'decision',
                        content: 'Пришло SMS: "Посылка ожидает, оплатите 500₸ за хранение: track-post.kz/p8472". Через 5 минут звонок: "Почта Казахстана, подтвердите оплату". Что делать?',
                        contentEn: 'SMS arrived: "Package waiting, pay 500₸ for storage: track-post.kz/p8472". 5 minutes later call: "Kazakhstan Post, confirm payment". What to do?',
                        options: [
                            {
                                id: 'a',
                                text: 'Проверю на официальном сайте Казпочты',
                                textEn: 'Will check on official Kazakhstan Post website',
                                outcomeType: 'safe',
                                explanation: 'Отлично! Комбинация SMS + звонок - признак координированной атаки. Проверяйте только через официальные каналы.',
                                explanationEn: 'Excellent! Combination of SMS + call is sign of coordinated attack. Verify only through official channels.',
                            },
                            {
                                id: 'b',
                                text: 'Оплачу через ссылку, но сначала позвоню назад',
                                textEn: 'Will pay via link, but first call back',
                                outcomeType: 'risky',
                                explanation: 'Рискованно! Номер для обратного звонка тоже может быть мошенническим. Проверяйте только на официальном сайте.',
                                explanationEn: 'Risky! Number for callback may also be fraudulent. Verify only on official website.',
                            },
                            {
                                id: 'c',
                                text: 'Оплачу, раз и SMS и звонок пришли',
                                textEn: 'Will pay since both SMS and call came',
                                outcomeType: 'dangerous',
                                explanation: 'Опасно! Мошенники специально используют два канала для убедительности. Это скоординированная атака.',
                                explanationEn: 'Dangerous! Scammers deliberately use two channels for credibility. This is coordinated attack.',
                            },
                        ],
                    },
                    {
                        id: 'q2',
                        type: 'decision',
                        content: 'Email: "Ваш заказ на Wildberries отменён, возврат 45000₸". Затем SMS с кодом 8392. Потом звонок: "Для возврата назовите код". Что делать?',
                        contentEn: 'Email: "Your Wildberries order cancelled, refund 45000₸". Then SMS with code 8392. Then call: "To refund tell us code". What to do?',
                        options: [
                            {
                                id: 'a',
                                text: 'Положу трубку, проверю в приложении WB',
                                textEn: 'Will hang up, check in WB app',
                                outcomeType: 'safe',
                                explanation: 'Правильно! Это трёхканальная атака (email + SMS + звонок). Код из SMS нельзя никому сообщать.',
                                explanationEn: 'Correct! This is three-channel attack (email + SMS + call). Never tell SMS code to anyone.',
                            },
                            {
                                id: 'b',
                                text: 'Позвоню в WB по официальному номеру и спрошу про код',
                                textEn: 'Will call WB on official number and ask about code',
                                outcomeType: 'risky',
                                explanation: 'Рискованно! Хорошо, что звоните по официальному номеру, но код из SMS не нужен для возврата. Проверьте в приложении.',
                                explanationEn: 'Risky! Good that you call official number, but SMS code is not needed for refund. Check in app.',
                            },
                            {
                                id: 'c',
                                text: 'Назову код для возврата денег',
                                textEn: 'Will tell code to get refund',
                                outcomeType: 'dangerous',
                                explanation: 'Критически опасно! Код из SMS = доступ к деньгам. Это сложная многоканальная атака. Вы потеряете деньги.',
                                explanationEn: 'Critically dangerous! SMS code = money access. This is complex multi-channel attack. You\'ll lose money.',
                            },
                        ],
                    },
                    {
                        id: 'q3',
                        type: 'decision',
                        content: 'Telegram: "Мама, телефон сломался, пишу с нового аккаунта. Срочно нужны деньги на ремонт". Затем звонок с незнакомого номера: "Это я, мама". Что делать?',
                        contentEn: 'Telegram: "Mom, phone broken, writing from new account. Urgently need money for repair". Then call from unknown number: "It\'s me, mom". What to do?',
                        options: [
                            {
                                id: 'a',
                                text: 'Задам вопрос, который знает только мама',
                                textEn: 'Will ask question only mom knows',
                                outcomeType: 'safe',
                                explanation: 'Отлично! Комбинация мессенджер + звонок усиливает доверие. Проверочный вопрос раскроет мошенника.',
                                explanationEn: 'Excellent! Combination of messenger + call increases trust. Verification question will expose scammer.',
                            },
                            {
                                id: 'b',
                                text: 'Переведу небольшую сумму на ремонт',
                                textEn: 'Will transfer small amount for repair',
                                outcomeType: 'risky',
                                explanation: 'Рискованно! Мошенники используют взломанные аккаунты + имитацию голоса. Даже малая сумма опасна без проверки.',
                                explanationEn: 'Risky! Scammers use hacked accounts + voice imitation. Even small amount is dangerous without verification.',
                            },
                            {
                                id: 'c',
                                text: 'Переведу деньги, это же мама',
                                textEn: 'Will transfer money, it\'s mom',
                                outcomeType: 'dangerous',
                                explanation: 'Опасно! Мошенники используют взломанные аккаунты + имитацию голоса. Всегда проверяйте личность вопросами.',
                                explanationEn: 'Dangerous! Scammers use hacked accounts + voice imitation. Always verify identity with questions.',
                            },
                        ],
                    },
                ],
            },
        },

        // LEVEL 6: СОЦИАЛЬНАЯ ИНЖЕНЕРИЯ - Social Engineering (4 questions)
        {
            title: 'Уровень 6: Эмоциональное давление',
            titleEn: 'Level 6: Emotional Pressure',
            description: 'Страх, срочность, паника - оружие мошенников',
            descriptionEn: 'Fear, urgency, panic - scammers\' weapons',
            type: ScenarioType.SOCIAL_ENGINEERING,
            difficulty: ScenarioDifficulty.ADVANCED,
            requiredTier: SubscriptionTier.FREE,
            pointsReward: 70,
            order: 5,
            isLegitimate: false,
            content: {
                steps: [
                    {
                        id: 'q1',
                        type: 'decision',
                        content: 'Звонок: "Ваш сын попал в ДТП, нужны срочно 500000₸ на операцию! Переведите на карту 4400 1234 5678 9012". Слышен плач. Что делать?',
                        contentEn: 'Call: "Your son had accident, urgently need 500000₸ for operation! Transfer to card 4400 1234 5678 9012". Crying heard. What to do?',
                        options: [
                            {
                                id: 'a',
                                text: 'Положу трубку, позвоню сыну напрямую',
                                textEn: 'Will hang up, call son directly',
                                outcomeType: 'safe',
                                explanation: 'Правильно! Эмоциональное давление + срочность = классическая схема. Всегда проверяйте напрямую, даже в панике.',
                                explanationEn: 'Correct! Emotional pressure + urgency = classic scheme. Always verify directly, even in panic.',
                            },
                            {
                                id: 'b',
                                text: 'Переведу часть суммы, чтобы помочь',
                                textEn: 'Will transfer part of amount to help',
                                outcomeType: 'risky',
                                explanation: 'Рискованно! Даже частичный перевод опасен без проверки. Больницы не требуют переводов на карты. Позвоните сыну.',
                                explanationEn: 'Risky! Even partial transfer is dangerous without verification. Hospitals don\'t require card transfers. Call your son.',
                            },
                            {
                                id: 'c',
                                text: 'Сразу переведу, сын же в опасности',
                                textEn: 'Will transfer immediately, son is in danger',
                                outcomeType: 'dangerous',
                                explanation: 'Опасно! Мошенники используют панику и страх. Больницы не требуют переводов на карты. Это обман.',
                                explanationEn: 'Dangerous! Scammers use panic and fear. Hospitals don\'t require transfers to cards. This is fraud.',
                            },
                        ],
                    },
                    {
                        id: 'q2',
                        type: 'decision',
                        content: 'WhatsApp от "начальника": "Срочное совещание через 10 минут! Купи 5 сертификатов Google Play по 10000₸, отчитаемся потом". Аккаунт похож на настоящий. Что делать?',
                        contentEn: 'WhatsApp from "boss": "Urgent meeting in 10 minutes! Buy 5 Google Play certificates for 10000₸ each, will report later". Account looks real. What to do?',
                        options: [
                            {
                                id: 'a',
                                text: 'Позвоню начальнику для подтверждения',
                                textEn: 'Will call boss to confirm',
                                outcomeType: 'safe',
                                explanation: 'Отлично! Срочность + необычная просьба = признак взлома. Начальники не просят покупать сертификаты через мессенджеры.',
                                explanationEn: 'Excellent! Urgency + unusual request = sign of hack. Bosses don\'t ask to buy certificates via messengers.',
                            },
                            {
                                id: 'b',
                                text: 'Куплю 1-2 сертификата для проверки',
                                textEn: 'Will buy 1-2 certificates to check',
                                outcomeType: 'risky',
                                explanation: 'Рискованно! Даже один сертификат невозможно вернуть. Это взломанный аккаунт. Позвоните начальнику голосом.',
                                explanationEn: 'Risky! Even one certificate can\'t be returned. This is hacked account. Call boss by voice.',
                            },
                            {
                                id: 'c',
                                text: 'Куплю сертификаты, начальник же просит',
                                textEn: 'Will buy certificates, boss is asking',
                                outcomeType: 'dangerous',
                                explanation: 'Опасно! Это взломанный аккаунт или подделка. Сертификаты невозможно вернуть. Вы потеряете 50000₸.',
                                explanationEn: 'Dangerous! This is hacked account or fake. Certificates can\'t be returned. You\'ll lose 50000₸.',
                            },
                        ],
                    },
                    {
                        id: 'q3',
                        type: 'decision',
                        content: 'Звонок: "Служба безопасности. На ваше имя оформляют кредит 2000000₸! Чтобы остановить, срочно переведите 50000₸ на безопасный счёт". Что делать?',
                        contentEn: 'Call: "Security service. Someone is taking 2000000₸ loan in your name! To stop, urgently transfer 50000₸ to safe account". What to do?',
                        options: [
                            {
                                id: 'a',
                                text: 'Положу трубку, позвоню в банк сам',
                                textEn: 'Will hang up, call bank myself',
                                outcomeType: 'safe',
                                explanation: 'Правильно! "Безопасный счёт" не существует. Банк никогда не просит переводить деньги для защиты.',
                                explanationEn: 'Correct! "Safe account" doesn\'t exist. Bank never asks to transfer money for protection.',
                            },
                            {
                                id: 'b',
                                text: 'Переведу меньшую сумму для проверки',
                                textEn: 'Will transfer smaller amount to check',
                                outcomeType: 'risky',
                                explanation: 'Рискованно! Любой перевод подтверждает, что вы поверили. "Безопасного счёта" не существует. Позвоните в банк сами.',
                                explanationEn: 'Risky! Any transfer confirms you believed. "Safe account" doesn\'t exist. Call bank yourself.',
                            },
                            {
                                id: 'c',
                                text: 'Переведу для защиты от кредита',
                                textEn: 'Will transfer to protect from loan',
                                outcomeType: 'dangerous',
                                explanation: 'Критически опасно! Это мошенники. Никакого кредита нет. "Безопасный счёт" = счёт мошенников.',
                                explanationEn: 'Critically dangerous! These are scammers. There\'s no loan. "Safe account" = scammers\' account.',
                            },
                        ],
                    },
                    {
                        id: 'q4',
                        type: 'decision',
                        content: 'SMS: "Вы выиграли iPhone 15 Pro! Для получения оплатите доставку 3000₸ на карту 5555 6666 7777 8888". Вы участвовали в розыгрыше. Что делать?',
                        contentEn: 'SMS: "You won iPhone 15 Pro! To receive pay delivery 3000₸ to card 5555 6666 7777 8888". You did participate in giveaway. What to do?',
                        options: [
                            {
                                id: 'a',
                                text: 'Проверю на сайте организатора розыгрыша',
                                textEn: 'Will check on giveaway organizer\'s website',
                                outcomeType: 'safe',
                                explanation: 'Правильно! Настоящие призы не требуют оплаты доставки. Проверяйте через официальные каналы организатора.',
                                explanationEn: 'Correct! Real prizes don\'t require delivery payment. Verify through organizer\'s official channels.',
                            },
                            {
                                id: 'b',
                                text: 'Оплачу доставку, сумма небольшая',
                                textEn: 'Will pay delivery, amount is small',
                                outcomeType: 'risky',
                                explanation: 'Рискованно! Даже 3000₸ - это деньги. Настоящие призы не требуют оплаты. Проверьте на сайте организатора.',
                                explanationEn: 'Risky! Even 3000₸ is money. Real prizes don\'t require payment. Check organizer\'s website.',
                            },
                            {
                                id: 'c',
                                text: 'Оплачу доставку, я же выиграл',
                                textEn: 'Will pay delivery, I won',
                                outcomeType: 'dangerous',
                                explanation: 'Опасно! Это мошенники. Настоящие призы не требуют оплаты доставки на карту. Вы потеряете деньги и ничего не получите.',
                                explanationEn: 'Dangerous! These are scammers. Real prizes don\'t require delivery payment to card. You\'ll lose money and get nothing.',
                            },
                        ],
                    },
                ],
            },
        },

        // LEVEL 7: МАКСИМАЛЬНЫЙ - Maximum Complexity (5 questions)
        {
            title: 'Уровень 7: Мастер проверки',
            titleEn: 'Level 7: Verification Master',
            description: 'Сложные ситуации, требующие максимальной внимательности',
            descriptionEn: 'Complex situations requiring maximum attention',
            type: ScenarioType.SOCIAL_ENGINEERING,
            difficulty: ScenarioDifficulty.EXPERT,
            requiredTier: SubscriptionTier.FREE,
            pointsReward: 80,
            order: 6,
            isLegitimate: false,
            content: {
                steps: [
                    {
                        id: 'q1',
                        type: 'decision',
                        content: 'Email от HR: "Обновите данные для зарплатной карты до 18:00, иначе перевод задержится". Ссылка ведёт на hr-company.kz (похоже на ваш домен hr.company.kz). Что делать?',
                        contentEn: 'Email from HR: "Update data for salary card before 18:00, otherwise transfer will be delayed". Link leads to hr-company.kz (similar to your domain hr.company.kz). What to do?',
                        options: [
                            {
                                id: 'a',
                                text: 'Обращу внимание на домен, напишу в HR напрямую',
                                textEn: 'Will notice domain, write to HR directly',
                                outcomeType: 'safe',
                                explanation: 'Отлично! Тонкая подмена домена (hr-company.kz вместо hr.company.kz). Всегда проверяйте точный адрес.',
                                explanationEn: 'Excellent! Subtle domain substitution (hr-company.kz instead of hr.company.kz). Always verify exact address.',
                            },
                            {
                                id: 'b',
                                text: 'Перейду, но не введу полные данные карты',
                                textEn: 'Will follow, but won\'t enter full card details',
                                outcomeType: 'risky',
                                explanation: 'Рискованно! Даже частичные данные на поддельном сайте опасны. Домен hr-company.kz ≠ hr.company.kz. Напишите в HR.',
                                explanationEn: 'Risky! Even partial data on fake site is dangerous. Domain hr-company.kz ≠ hr.company.kz. Write to HR.',
                            },
                            {
                                id: 'c',
                                text: 'Перейду по ссылке, домен похож',
                                textEn: 'Will follow link, domain looks similar',
                                outcomeType: 'dangerous',
                                explanation: 'Опасно! Мошенники используют похожие домены. Вы отдадите данные карты. Проверяйте каждый символ в адресе.',
                                explanationEn: 'Dangerous! Scammers use similar domains. You\'ll give away card data. Check every character in address.',
                            },
                        ],
                    },
                    {
                        id: 'q2',
                        type: 'decision',
                        content: 'Звонок с номера банка (определился как Halyk Bank): "Проверка безопасности. Назовите последние 4 цифры карты и срок действия для подтверждения личности". Что делать?',
                        contentEn: 'Call from bank number (showed as Halyk Bank): "Security check. Tell last 4 digits of card and expiry date to confirm identity". What to do?',
                        options: [
                            {
                                id: 'a',
                                text: 'Положу трубку, позвоню в банк сам',
                                textEn: 'Will hang up, call bank myself',
                                outcomeType: 'safe',
                                explanation: 'Правильно! Мошенники подделывают номера (spoofing). Банк никогда не просит данные карты для "проверки".',
                                explanationEn: 'Correct! Scammers fake numbers (spoofing). Bank never asks for card data for "verification".',
                            },
                            {
                                id: 'b',
                                text: 'Назову только последние 4 цифры',
                                textEn: 'Will tell only last 4 digits',
                                outcomeType: 'risky',
                                explanation: 'Рискованно! Даже частичные данные помогают мошенникам. Номер подделан. Положите трубку и позвоните сами.',
                                explanationEn: 'Risky! Even partial data helps scammers. Number is spoofed. Hang up and call yourself.',
                            },
                            {
                                id: 'c',
                                text: 'Назову данные, номер же банковский',
                                textEn: 'Will tell data, it\'s bank number',
                                outcomeType: 'dangerous',
                                explanation: 'Опасно! Номер подделан (caller ID spoofing). Даже если определитель показывает банк - это могут быть мошенники.',
                                explanationEn: 'Dangerous! Number is spoofed (caller ID spoofing). Even if caller ID shows bank - these can be scammers.',
                            },
                        ],
                    },
                    {
                        id: 'q3',
                        type: 'decision',
                        content: 'Коллега пишет в Telegram: "Директор просит срочно перевести 200000₸ на счёт партнёра. Вот реквизиты". Стиль письма обычный, но запрос странный. Что делать?',
                        contentEn: 'Colleague writes in Telegram: "Director asks to urgently transfer 200000₸ to partner account. Here are details". Writing style is normal, but request is strange. What to do?',
                        options: [
                            {
                                id: 'a',
                                text: 'Позвоню коллеге и директору для подтверждения',
                                textEn: 'Will call colleague and director to confirm',
                                outcomeType: 'safe',
                                explanation: 'Отлично! Даже если стиль письма знакомый, крупные переводы требуют голосового подтверждения от обоих.',
                                explanationEn: 'Excellent! Even if writing style is familiar, large transfers require voice confirmation from both.',
                            },
                            {
                                id: 'b',
                                text: 'Напишу директору напрямую для уточнения',
                                textEn: 'Will write to director directly to clarify',
                                outcomeType: 'risky',
                                explanation: 'Рискованно! Письменное подтверждение недостаточно - аккаунт директора тоже может быть взломан. Звоните голосом.',
                                explanationEn: 'Risky! Written confirmation is not enough - director\'s account may also be hacked. Call by voice.',
                            },
                            {
                                id: 'c',
                                text: 'Переведу, коллега же пишет',
                                textEn: 'Will transfer, colleague is writing',
                                outcomeType: 'dangerous',
                                explanation: 'Опасно! Аккаунт коллеги мог быть взломан. Мошенники изучают стиль общения. Всегда подтверждайте голосом.',
                                explanationEn: 'Dangerous! Colleague\'s account could be hacked. Scammers study communication style. Always confirm by voice.',
                            },
                        ],
                    },
                    {
                        id: 'q4',
                        type: 'decision',
                        content: 'Email: "Ваш аккаунт Kaspi будет заблокирован через 24 часа. Подтвердите личность, загрузив фото паспорта на secure-kaspi-verify.com". Сайт выглядит официально. Что делать?',
                        contentEn: 'Email: "Your Kaspi account will be blocked in 24 hours. Confirm identity by uploading passport photo to secure-kaspi-verify.com". Site looks official. What to do?',
                        options: [
                            {
                                id: 'a',
                                text: 'Проверю домен, зайду в приложение Kaspi',
                                textEn: 'Will check domain, enter Kaspi app',
                                outcomeType: 'safe',
                                explanation: 'Правильно! secure-kaspi-verify.com - поддельный домен. Kaspi никогда не просит фото паспорта через email.',
                                explanationEn: 'Correct! secure-kaspi-verify.com is fake domain. Kaspi never asks for passport photo via email.',
                            },
                            {
                                id: 'b',
                                text: 'Загружу фото только первой страницы',
                                textEn: 'Will upload photo of first page only',
                                outcomeType: 'risky',
                                explanation: 'Рискованно! Даже первая страница паспорта содержит все данные для мошенничества. Это поддельный сайт. Проверьте в приложении.',
                                explanationEn: 'Risky! Even first page of passport contains all data for fraud. This is fake site. Check in app.',
                            },
                            {
                                id: 'c',
                                text: 'Загружу фото паспорта на сайт',
                                textEn: 'Will upload passport photo to site',
                                outcomeType: 'dangerous',
                                explanation: 'Критически опасно! Вы отдадите данные паспорта мошенникам. Они смогут оформить кредиты на ваше имя.',
                                explanationEn: 'Critically dangerous! You\'ll give passport data to scammers. They can take loans in your name.',
                            },
                        ],
                    },
                    {
                        id: 'q5',
                        type: 'decision',
                        content: 'Ночью звонок от "полиции": "Ваша карта использована в преступлении. Для снятия подозрений переведите все деньги на защищённый счёт следствия". Угрожают приездом. Что делать?',
                        contentEn: 'Night call from "police": "Your card was used in crime. To clear suspicion transfer all money to investigation\'s protected account". Threaten to come. What to do?',
                        options: [
                            {
                                id: 'a',
                                text: 'Положу трубку, утром обращусь в полицию сам',
                                textEn: 'Will hang up, contact police myself in morning',
                                outcomeType: 'safe',
                                explanation: 'Отлично! Полиция НИКОГДА не требует переводов денег. Ночные звонки + угрозы = классическая схема мошенников.',
                                explanationEn: 'Excellent! Police NEVER demands money transfers. Night calls + threats = classic scammer scheme.',
                            },
                            {
                                id: 'b',
                                text: 'Попрошу прислать официальное уведомление',
                                textEn: 'Will ask to send official notification',
                                outcomeType: 'risky',
                                explanation: 'Рискованно! Хорошо, что не переводите сразу, но мошенники могут прислать поддельные документы. Положите трубку и обратитесь в полицию сами.',
                                explanationEn: 'Risky! Good that you don\'t transfer immediately, but scammers can send fake documents. Hang up and contact police yourself.',
                            },
                            {
                                id: 'c',
                                text: 'Переведу деньги, боюсь проблем',
                                textEn: 'Will transfer money, afraid of problems',
                                outcomeType: 'dangerous',
                                explanation: 'Критически опасно! Это мошенники используют страх и ночное время. Полиция не требует денег. Вы потеряете всё.',
                                explanationEn: 'Critically dangerous! These are scammers using fear and night time. Police don\'t demand money. You\'ll lose everything.',
                            },
                        ],
                    },
                ],
            },
        },
    ];

    // Delete all existing scenarios and their progress
    await prisma.userProgress.deleteMany({});
    await prisma.scenario.deleteMany({});
    console.log('🗑️  Deleted existing scenarios');

    // Create scenarios with updated content
    for (const scenario of scenarios) {
        await prisma.scenario.create({ data: scenario as any });
    }

    console.log(`✅ Created ${scenarios.length} scenarios with 3 answer options`);

    // Create Achievements including Ranks
    const achievements = [
        // Existing achievements
        {
            key: 'first_scenario',
            title: 'Первый шаг',
            titleEn: 'First Step',
            description: 'Завершите первый сценарий',
            descriptionEn: 'Complete your first scenario',
            icon: 'shield',
            requiredValue: 1,
        },
        {
            key: 'all_scenarios',
            title: 'Полный курс',
            titleEn: 'Full Course',
            description: 'Завершите все 7 обучающих сценариев',
            descriptionEn: 'Complete all 7 training scenarios',
            icon: 'award',
            requiredValue: 7,
        },
    ];

    for (const achievement of achievements) {
        await prisma.achievement.upsert({
            where: { key: achievement.key },
            update: achievement,
            create: achievement,
        });
    }

    console.log(`✅ Updated ${achievements.length} achievements`);
    console.log('✨ Seeding completed!');
}

main()
    .catch((e) => {
        console.error('❌ Seeding failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
