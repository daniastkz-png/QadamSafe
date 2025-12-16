import { PrismaClient, ScenarioDifficulty, ScenarioType, SubscriptionTier } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...');

    // Create Scenarios with progressive unlocking
    const scenarios = [
        // SCENARIO 1: Legitimate bank email (teaches verification)
        {
            title: 'Письмо от банка о новой услуге',
            titleEn: 'Bank Email About New Service',
            titleKk: 'Жаңа қызмет туралы банк хаты',
            description: 'Научитесь проверять подлинность писем от банков',
            descriptionEn: 'Learn to verify authenticity of bank emails',
            descriptionKk: 'Банк хаттарының шынайылығын тексеруді үйреніңіз',
            type: ScenarioType.EMAIL_PHISHING,
            difficulty: ScenarioDifficulty.BEGINNER,
            requiredTier: SubscriptionTier.FREE,
            pointsReward: 10,
            order: 1,
            isLegitimate: true,
            content: {
                steps: [
                    {
                        id: 'step1',
                        type: 'information',
                        content: 'Вы получили письмо от вашего банка о новой программе кэшбэка. В письме указан официальный адрес отправителя support@halykbank.kz',
                        contentEn: 'You received an email from your bank about a new cashback program. The email shows official sender address support@halykbank.kz',
                        contentKk: 'Сіз банкіңізден жаңа кэшбэк бағдарламасы туралы хат алдыңыз. Хатта ресми жіберуші мекенжайы көрсетілген support@halykbank.kz',
                    },
                    {
                        id: 'step2',
                        type: 'decision',
                        content: 'Что вы сделаете?',
                        contentEn: 'What will you do?',
                        contentKk: 'Не істейсіз?',
                        options: [
                            {
                                id: 'opt1',
                                text: 'Проверю адрес отправителя и зайду на сайт банка напрямую',
                                textEn: 'Check sender address and go to bank website directly',
                                textKk: 'Жіберуші мекенжайын тексеріп, банк сайтына тікелей кіремін',
                                outcomeType: 'safe',
                                nextStepId: 'step3_safe',
                                explanation: 'Отличное решение! Всегда проверяйте информацию через официальные каналы.',
                                explanationEn: 'Excellent decision! Always verify information through official channels.',
                                explanationKk: 'Тамаша шешім! Ақпаратты әрқашан ресми арналар арқылы тексеріңіз.',
                            },
                            {
                                id: 'opt2',
                                text: 'Кликну на ссылку в письме',
                                textEn: 'Click the link in the email',
                                textKk: 'Хаттағы сілтемені басамын',
                                outcomeType: 'risky',
                                nextStepId: 'step3_risky',
                                explanation: 'Рискованно. Даже если письмо выглядит настоящим, лучше проверить через официальный сайт.',
                                explanationEn: 'Risky. Even if email looks real, better to check via official website.',
                                explanationKk: 'Қауіпті. Хат шынайы көрінсе де, ресми сайт арқылы тексерген жөн.',
                            },
                        ],
                    },
                    {
                        id: 'step3_safe',
                        type: 'information',
                        content: 'Вы зашли на официальный сайт банка и подтвердили информацию. Это действительно новая программа! Вы в безопасности.',
                        contentEn: 'You visited the official bank website and confirmed the information. It is indeed a new program! You are safe.',
                        contentKk: 'Сіз банктің ресми сайтына кіріп, ақпаратты растадыңыз. Бұл шынымен жаңа бағдарлама! Сіз қауіпсізсіз.',
                    },
                    {
                        id: 'step3_risky',
                        type: 'information',
                        content: 'В этот раз ссылка была настоящей, но такой подход опасен. Мошенники часто подделывают письма банков.',
                        contentEn: 'This time the link was real, but this approach is dangerous. Scammers often fake bank emails.',
                        contentKk: 'Бұл жолы сілтеме шынайы болды, бірақ бұл тәсіл қауіпті. Алаяқтар жиі банк хаттарын жасайды.',
                    },
                ],
            },
        },

        // SCENARIO 2: Phishing SMS from courier
        {
            title: 'SMS от курьерской службы',
            titleEn: 'SMS from Courier Service',
            titleKk: 'Курьерлік қызметтен SMS',
            description: 'Определите поддельное SMS о доставке',
            descriptionEn: 'Identify fake delivery SMS',
            descriptionKk: 'Жалған жеткізу SMS-ін анықтаңыз',
            type: ScenarioType.SMS_PHISHING,
            difficulty: ScenarioDifficulty.BEGINNER,
            requiredTier: SubscriptionTier.FREE,
            pointsReward: 10,
            order: 2,
            isLegitimate: false,
            content: {
                steps: [
                    {
                        id: 'step1',
                        type: 'information',
                        content: 'SMS: "Ваша посылка №8472 ожидает. Оплатите 200₸ за хранение: bit.ly/pkg8472"',
                        contentEn: 'SMS: "Your package #8472 is waiting. Pay 200₸ for storage: bit.ly/pkg8472"',
                        contentKk: 'SMS: "Сіздің сәлемдемеңіз №8472 күтуде. Сақтау үшін 200₸ төлеңіз: bit.ly/pkg8472"',
                    },
                    {
                        id: 'step2',
                        type: 'decision',
                        content: 'Вы не ждёте посылку. Что делать?',
                        contentEn: 'You are not expecting a package. What to do?',
                        contentKk: 'Сіз сәлемдеме күтпейсіз. Не істеу керек?',
                        options: [
                            {
                                id: 'opt1',
                                text: 'Игнорирую — я ничего не заказывал',
                                textEn: 'Ignore it — I did not order anything',
                                textKk: 'Елемеймін — мен ештеңе тапсырыс берген жоқпын',
                                outcomeType: 'safe',
                                explanation: 'Правильно! Если вы ничего не заказывали, это точно мошенничество.',
                                explanationEn: 'Correct! If you did not order anything, this is definitely a scam.',
                                explanationKk: 'Дұрыс! Егер сіз ештеңе тапсырыс бермесеңіз, бұл алаяқтық.',
                            },
                            {
                                id: 'opt2',
                                text: 'Перейду по ссылке, вдруг это подарок',
                                textEn: 'Click the link, maybe it is a gift',
                                textKk: 'Сілтемені басамын, мүмкін бұл сыйлық',
                                outcomeType: 'dangerous',
                                explanation: 'Опасно! Короткие ссылки (bit.ly) часто используют мошенники. Вы могли попасть на фишинговый сайт.',
                                explanationEn: 'Dangerous! Short links (bit.ly) are often used by scammers. You could have landed on a phishing site.',
                                explanationKk: 'Қауіпті! Қысқа сілтемелерді (bit.ly) алаяқтар жиі пайдаланады. Сіз фишинг сайтына түсуіңіз мүмкін.',
                            },
                        ],
                    },
                ],
            },
        },

        // SCENARIO 3: Legitimate website with SSL
        {
            title: 'Проверка сайта интернет-магазина',
            titleEn: 'Checking Online Store Website',
            titleKk: 'Интернет-дүкен сайтын тексеру',
            description: 'Научитесь проверять безопасность сайтов',
            descriptionEn: 'Learn to check website security',
            descriptionKk: 'Сайт қауіпсіздігін тексеруді үйреніңіз',
            type: ScenarioType.FAKE_WEBSITE,
            difficulty: ScenarioDifficulty.BEGINNER,
            requiredTier: SubscriptionTier.FREE,
            pointsReward: 15,
            order: 3,
            isLegitimate: true,
            content: {
                steps: [
                    {
                        id: 'step1',
                        type: 'information',
                        content: 'Вы хотите купить телефон на сайте. URL: https://kaspi.kz/shop/phones. В браузере виден замок 🔒',
                        contentEn: 'You want to buy a phone on a website. URL: https://kaspi.kz/shop/phones. Browser shows lock 🔒',
                        contentKk: 'Сіз сайттан телефон сатып алғыңыз келеді. URL: https://kaspi.kz/shop/phones. Браузерде құлып көрінеді 🔒',
                    },
                    {
                        id: 'step2',
                        type: 'decision',
                        content: 'Какие признаки безопасности вы видите?',
                        contentEn: 'What security signs do you see?',
                        contentKk: 'Қандай қауіпсіздік белгілерін көресіз?',
                        options: [
                            {
                                id: 'opt1',
                                text: 'HTTPS и знакомый домен kaspi.kz — можно покупать',
                                textEn: 'HTTPS and familiar domain kaspi.kz — safe to buy',
                                textKk: 'HTTPS және таныс домен kaspi.kz — сатып алуға болады',
                                outcomeType: 'safe',
                                explanation: 'Верно! HTTPS + официальный домен = безопасно.',
                                explanationEn: 'Correct! HTTPS + official domain = safe.',
                                explanationKk: 'Дұрыс! HTTPS + ресми домен = қауіпсіз.',
                            },
                            {
                                id: 'opt2',
                                text: 'Замок есть, но домен не проверял',
                                textEn: 'Lock is there, but did not check domain',
                                textKk: 'Құлып бар, бірақ доменді тексерген жоқпын',
                                outcomeType: 'risky',
                                explanation: 'Замок — это хорошо, но всегда проверяйте домен! Мошенники могут использовать похожие адреса.',
                                explanationEn: 'Lock is good, but always check the domain! Scammers can use similar addresses.',
                                explanationKk: 'Құлып жақсы, бірақ доменді әрқашан тексеріңіз! Алаяқтар ұқсас мекенжайларды пайдалана алады.',
                            },
                        ],
                    },
                ],
            },
        },

        // SCENARIO 4: Fake bank email with urgency
        {
            title: 'Срочное письмо от банка',
            titleEn: 'Urgent Email from Bank',
            titleKk: 'Банктен шұғыл хат',
            description: 'Распознайте признаки фишинга',
            descriptionEn: 'Recognize phishing signs',
            descriptionKk: 'Фишинг белгілерін танып біліңіз',
            type: ScenarioType.EMAIL_PHISHING,
            difficulty: ScenarioDifficulty.INTERMEDIATE,
            requiredTier: SubscriptionTier.FREE,
            pointsReward: 20,
            order: 4,
            isLegitimate: false,
            content: {
                steps: [
                    {
                        id: 'step1',
                        type: 'information',
                        content: 'Email от "Halyk Bank" <security@halyk-verify.com>: "ВНИМАНИЕ! Ваша карта заблокирована. Подтвердите данные в течение 1 часа!"',
                        contentEn: 'Email from "Halyk Bank" <security@halyk-verify.com>: "WARNING! Your card is blocked. Confirm details within 1 hour!"',
                        contentKk: 'Email "Halyk Bank" <security@halyk-verify.com>: "НАЗАР АУДАРЫҢЫЗ! Сіздің картаңыз бұғатталған. 1 сағат ішінде деректерді растаңыз!"',
                    },
                    {
                        id: 'step2',
                        type: 'decision',
                        content: 'Что насторожило?',
                        contentEn: 'What is suspicious?',
                        contentKk: 'Не күдік тудырды?',
                        options: [
                            {
                                id: 'opt1',
                                text: 'Домен halyk-verify.com вместо halykbank.kz',
                                textEn: 'Domain halyk-verify.com instead of halykbank.kz',
                                textKk: 'Домен halyk-verify.com halykbank.kz орнына',
                                outcomeType: 'safe',
                                nextStepId: 'step3',
                                explanation: 'Отлично! Поддельный домен — главный признак фишинга.',
                                explanationEn: 'Excellent! Fake domain is the main sign of phishing.',
                                explanationKk: 'Керемет! Жалған домен фишингтің басты белгісі.',
                            },
                            {
                                id: 'opt2',
                                text: 'Срочность — банки так не пишут',
                                textEn: 'Urgency — banks do not write like this',
                                textKk: 'Шұғылдық — банктер солай жазбайды',
                                outcomeType: 'safe',
                                nextStepId: 'step3',
                                explanation: 'Верно! Искусственная срочность — тактика мошенников.',
                                explanationEn: 'Correct! Artificial urgency is a scammer tactic.',
                                explanationKk: 'Дұрыс! Жасанды шұғылдық алаяқтардың тактикасы.',
                            },
                            {
                                id: 'opt3',
                                text: 'Ничего, надо срочно подтвердить',
                                textEn: 'Nothing, need to confirm urgently',
                                textKk: 'Ештеңе, шұғыл растау керек',
                                outcomeType: 'dangerous',
                                nextStepId: 'step3',
                                explanation: 'Опасно! Это классический фишинг: поддельный домен + срочность.',
                                explanationEn: 'Dangerous! This is classic phishing: fake domain + urgency.',
                                explanationKk: 'Қауіпті! Бұл классикалық фишинг: жалған домен + шұғылдық.',
                            },
                        ],
                    },
                    {
                        id: 'step3',
                        type: 'information',
                        content: 'Правильное действие: позвонить в банк по номеру с обратной стороны карты.',
                        contentEn: 'Correct action: call the bank using the number on the back of your card.',
                        contentKk: 'Дұрыс әрекет: картаның артқы жағындағы нөмір бойынша банкке қоңырау шалу.',
                    },
                ],
            },
        },

        // SCENARIO 5: Social engineering phone call
        {
            title: 'Звонок от "техподдержки"',
            titleEn: 'Call from "Tech Support"',
            titleKk: '"Техникалық қолдаудан" қоңырау',
            description: 'Защититесь от социальной инженерии',
            descriptionEn: 'Protect from social engineering',
            descriptionKk: 'Әлеуметтік инженериядан қорғаныңыз',
            type: ScenarioType.SOCIAL_ENGINEERING,
            difficulty: ScenarioDifficulty.ADVANCED,
            requiredTier: SubscriptionTier.PRO,
            pointsReward: 30,
            order: 5,
            isLegitimate: false,
            content: {
                steps: [
                    {
                        id: 'step1',
                        type: 'information',
                        content: 'Звонок: "Здравствуйте, техподдержка Microsoft. На вашем компьютере обнаружен вирус. Дайте нам удалённый доступ для исправления."',
                        contentEn: 'Call: "Hello, Microsoft tech support. A virus was detected on your computer. Give us remote access to fix it."',
                        contentKk: 'Қоңырау: "Сәлеметсіз бе, Microsoft техникалық қолдауы. Компьютеріңізде вирус анықталды. Оны түзету үшін бізге қашықтан қол жеткізу беріңіз."',
                    },
                    {
                        id: 'step2',
                        type: 'decision',
                        content: 'Ваши действия?',
                        contentEn: 'Your actions?',
                        contentKk: 'Сіздің әрекеттеріңіз?',
                        options: [
                            {
                                id: 'opt1',
                                text: 'Положу трубку — Microsoft не звонит клиентам',
                                textEn: 'Hang up — Microsoft does not call customers',
                                textKk: 'Телефонды қоямын — Microsoft клиенттерге қоңырау шалмайды',
                                outcomeType: 'safe',
                                explanation: 'Правильно! Крупные компании не звонят с предложением "помощи".',
                                explanationEn: 'Correct! Large companies do not call offering "help".',
                                explanationKk: 'Дұрыс! Ірі компаниялар "көмек" ұсынып қоңырау шалмайды.',
                            },
                            {
                                id: 'opt2',
                                text: 'Дам доступ, раз они сами позвонили',
                                textEn: 'Give access, since they called themselves',
                                textKk: 'Қол жеткізу беремін, өздері қоңырау шалғандықтан',
                                outcomeType: 'dangerous',
                                explanation: 'Очень опасно! Это мошенники. Они получат полный контроль над компьютером.',
                                explanationEn: 'Very dangerous! These are scammers. They will get full control of your computer.',
                                explanationKk: 'Өте қауіпті! Бұлар алаяқтар. Олар компьютеріңізге толық бақылау алады.',
                            },
                        ],
                    },
                ],
            },
        },
    ];

    for (const scenario of scenarios) {
        await prisma.scenario.create({ data: scenario as any });
    }

    console.log(`✅ Created ${scenarios.length} scenarios`);

    // Create Achievements
    const achievements = [
        {
            key: 'first_scenario',
            title: 'Первый шаг',
            titleEn: 'First Step',
            titleKk: 'Бірінші қадам',
            description: 'Завершите первый сценарий',
            descriptionEn: 'Complete your first scenario',
            descriptionKk: 'Бірінші сценарийді аяқтаңыз',
            icon: 'shield',
            requiredValue: 1,
        },
        {
            key: 'five_scenarios',
            title: 'Энтузиаст',
            titleEn: 'Enthusiast',
            titleKk: 'Энтузиаст',
            description: 'Завершите 5 сценариев',
            descriptionEn: 'Complete 5 scenarios',
            descriptionKk: '5 сценарийді аяқтаңыз',
            icon: 'target',
            requiredValue: 5,
        },
        {
            key: 'ten_scenarios',
            title: 'Профессионал',
            titleEn: 'Professional',
            titleKk: 'Кәсіпқой',
            description: 'Завершите 10 сценариев',
            descriptionEn: 'Complete 10 scenarios',
            descriptionKk: '10 сценарийді аяқтаңыз',
            icon: 'award',
            requiredValue: 10,
        },
        {
            key: 'perfect_score',
            title: 'Безупречно',
            titleEn: 'Flawless',
            titleKk: 'Мінсіз',
            description: 'Пройдите сценарий без ошибок',
            descriptionEn: 'Complete a scenario without mistakes',
            descriptionKk: 'Қатесіз сценарийден өтіңіз',
            icon: 'star',
            requiredValue: 1,
        },
        {
            key: 'security_expert',
            title: 'Эксперт безопасности',
            titleEn: 'Security Expert',
            titleKk: 'Қауіпсіздік сарапшысы',
            description: 'Наберите 1000 очков',
            descriptionEn: 'Earn 1000 points',
            descriptionKk: '1000 ұпай жинаңыз',
            icon: 'crown',
            requiredValue: 1000,
        },
    ];

    for (const achievement of achievements) {
        await prisma.achievement.create({ data: achievement });
    }

    console.log(`✅ Created ${achievements.length} achievements`);
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
