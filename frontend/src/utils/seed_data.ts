import { db } from '../services/firebase';
import { doc, writeBatch } from 'firebase/firestore';
import { Scenario } from '../types';

const now = new Date().toISOString();

export const SCENARIOS: Scenario[] = [
    {
        id: 'scenario_001_sms_phishing',
        title: 'Осторожно: Фишинговые SMS',
        titleEn: 'Beware: Phishing SMS',
        titleKk: 'Абай болыңыз: Фишинг SMS',
        description: 'Научитесь распознавать мошеннические SMS-сообщения и защитить свои данные.',
        descriptionEn: 'Learn to recognize fraudulent SMS messages and protect your data.',
        descriptionKk: 'Алаяқтық SMS хабарламаларды тануды және деректеріңізді қорғауды үйреніңіз.',
        type: 'SMS_PHISHING',
        difficulty: 'BEGINNER',
        requiredTier: 'FREE',
        pointsReward: 150,
        order: 1,
        isLegitimate: false,
        createdAt: now,
        updatedAt: now,
        content: {
            steps: [
                // ШАГ 1: SMS от "банка" о блокировке карты
                {
                    id: 'step1',
                    type: 'question',
                    visualType: 'phone',
                    phoneMessageType: 'sms',
                    senderName: 'Halyk Bank',
                    senderNameEn: 'Halyk Bank',
                    senderNameKk: 'Halyk Bank',
                    senderNumber: '+7 701 XXX XX XX',
                    profileEmoji: '🏦',
                    messageText: '⚠️ Ваша карта заблокирована!\n\nОбнаружена подозрительная активность. Для разблокировки срочно перейдите:\nhalyk-secure.com/unblock\n\nСлужба безопасности Halyk Bank',
                    messageTextEn: '⚠️ Your card is blocked!\n\nSuspicious activity detected. To unblock urgently go to:\nhalyk-secure.com/unblock\n\nHalyk Bank Security Service',
                    messageTextKk: '⚠️ Сіздің картаңыз бұғатталды!\n\nКүдікті белсенділік анықталды. Бұғаттан шығару үшін:\nhalyk-secure.com/unblock\n\nHalyk Bank қауіпсіздік қызметі',
                    question: 'Вы получили это SMS. Что вы сделаете?',
                    questionEn: 'You received this SMS. What will you do?',
                    questionKk: 'Сіз бұл SMS алдыңыз. Не істейсіз?',
                    content: 'SMS о блокировке карты от банка',
                    options: [
                        {
                            id: 'opt1_1',
                            text: 'Позвоню в банк по номеру на обратной стороне карты',
                            textEn: 'Call the bank using the number on the back of my card',
                            textKk: 'Картаның артындағы нөмір бойынша банкке қоңырау шаламын',
                            outcomeType: 'safe',
                            explanation: 'Отлично! Это самый безопасный способ проверить информацию. Настоящий банк подтвердит или опровергнет блокировку.\n\n✅ Совет: Всегда звоните по официальному номеру банка, а не по номеру из SMS.',
                            explanationEn: 'Excellent! This is the safest way to verify information. The real bank will confirm or deny the block.\n\n✅ Tip: Always call the official bank number, not the number from SMS.',
                            explanationKk: 'Тамаша! Бұл ақпаратты тексерудің ең қауіпсіз жолы. Нақты банк бұғатты растайды немесе жоққа шығарады.\n\n✅ Кеңес: Әрқашан банктің ресми нөміріне қоңырау шалыңыз.'
                        },
                        {
                            id: 'opt1_2',
                            text: 'Перейду по ссылке и проверю статус карты',
                            textEn: 'Click the link and check card status',
                            textKk: 'Сілтемені ашып, карта күйін тексеремін',
                            outcomeType: 'dangerous',
                            explanation: 'Опасно! Домен halyk-secure.com — поддельный. Настоящий сайт Halyk Bank — halykbank.kz.\n\n🚨 Признаки мошенничества:\n• Неофициальный домен\n• Давление на срочность\n• SMS вместо звонка от банка\n\nБанки НИКОГДА не отправляют ссылки для разблокировки карты!',
                            explanationEn: 'Dangerous! The domain halyk-secure.com is fake. The real Halyk Bank site is halykbank.kz.\n\n🚨 Signs of fraud:\n• Unofficial domain\n• Urgency pressure\n• SMS instead of bank call\n\nBanks NEVER send links to unblock cards!',
                            explanationKk: 'Қауіпті! halyk-secure.com домені жалған. Halyk Bank нақты сайты — halykbank.kz.\n\n🚨 Алаяқтық белгілері:\n• Ресми емес домен\n• Шұғылдық қысымы\n• Банк қоңырауының орнына SMS\n\nБанктер картаны бұғаттан шығару үшін ЕШҚАШАН сілтеме жібермейді!'
                        },
                        {
                            id: 'opt1_3',
                            text: 'Проигнорирую сообщение',
                            textEn: 'Ignore the message',
                            textKk: 'Хабарламаны елемеймін',
                            outcomeType: 'safe',
                            explanation: 'Правильно! Если карта действительно заблокирована, вы узнаете об этом при попытке оплаты или через официальное приложение банка.\n\n✅ Совет: Проверьте статус карты в мобильном приложении банка.',
                            explanationEn: 'Correct! If your card is really blocked, you will find out when trying to pay or through the official bank app.\n\n✅ Tip: Check your card status in the bank\'s mobile app.',
                            explanationKk: 'Дұрыс! Карта шынымен бұғатталған болса, төлем жасағанда немесе банктің ресми қосымшасы арқылы білесіз.\n\n✅ Кеңес: Карта күйін банктің мобильді қосымшасынан тексеріңіз.'
                        }
                    ]
                },
                // ШАГ 2: SMS о выигрыше
                {
                    id: 'step2',
                    type: 'question',
                    visualType: 'phone',
                    phoneMessageType: 'whatsapp',
                    senderName: 'Акция KaspiBank',
                    senderNameEn: 'KaspiBank Promo',
                    senderNameKk: 'KaspiBank Акция',
                    senderNumber: '+7 700 XXX XX XX',
                    profileEmoji: '🎉',
                    messageText: 'Поздравляем! 🎊\n\nВы выиграли 500 000 тенге в акции Kaspi!\n\nДля получения перейдите:\nkaspi-prize.net/get\n\nАкция действует 30 минут!',
                    messageTextEn: 'Congratulations! 🎊\n\nYou won 500,000 tenge in Kaspi promotion!\n\nTo receive go to:\nkaspi-prize.net/get\n\nPromotion valid for 30 minutes!',
                    messageTextKk: 'Құттықтаймыз! 🎊\n\nСіз Kaspi акциясында 500 000 теңге ұттыңыз!\n\nАлу үшін өтіңіз:\nkaspi-prize.net/get\n\nАкция 30 минут жарамды!',
                    question: 'Вам пришло сообщение о выигрыше. Ваши действия?',
                    questionEn: 'You received a message about winning. Your actions?',
                    questionKk: 'Сізге ұтыс туралы хабарлама келді. Сіздің әрекетіңіз?',
                    content: 'SMS о выигрыше в акции',
                    options: [
                        {
                            id: 'opt2_1',
                            text: 'Проверю информацию в приложении Kaspi',
                            textEn: 'Check information in Kaspi app',
                            textKk: 'Ақпаратты Kaspi қосымшасынан тексеремін',
                            outcomeType: 'safe',
                            explanation: 'Отлично! Все настоящие акции Kaspi отображаются только в официальном приложении. Там вы увидите, что никакого выигрыша нет.\n\n✅ Правило: Если выигрыш настоящий — он будет в приложении.',
                            explanationEn: 'Excellent! All real Kaspi promotions are displayed only in the official app. There you will see there is no prize.\n\n✅ Rule: If the prize is real — it will be in the app.',
                            explanationKk: 'Тамаша! Барлық нақты Kaspi акциялары тек ресми қосымшада көрсетіледі. Ол жерде ұтыс жоқ екенін көресіз.\n\n✅ Ереже: Ұтыс нақты болса — қосымшада болады.'
                        },
                        {
                            id: 'opt2_2',
                            text: 'Перейду по ссылке — вдруг правда выиграл',
                            textEn: 'Click the link — maybe I really won',
                            textKk: 'Сілтемені ашамын — мүмкін шынымен ұттым',
                            outcomeType: 'dangerous',
                            explanation: 'Опасно! Домен kaspi-prize.net — мошеннический. Официальный сайт — kaspi.kz.\n\n🚨 Красные флаги:\n• Слишком хорошее предложение\n• Срочность (30 минут)\n• Неофициальный домен (.net вместо .kz)\n• Вы не участвовали в акции\n\nБесплатный сыр только в мышеловке!',
                            explanationEn: 'Dangerous! The domain kaspi-prize.net is fraudulent. Official site is kaspi.kz.\n\n🚨 Red flags:\n• Too good to be true\n• Urgency (30 minutes)\n• Unofficial domain (.net instead of .kz)\n• You didn\'t participate\n\nThere\'s no such thing as free money!',
                            explanationKk: 'Қауіпті! kaspi-prize.net домені алаяқтық. Ресми сайт — kaspi.kz.\n\n🚨 Қызыл жалаушалар:\n• Тым жақсы ұсыныс\n• Шұғылдық (30 минут)\n• Ресми емес домен (.kz орнына .net)\n• Сіз акцияға қатыспадыңыз\n\nТегін ірімшік тек тұзақта болады!'
                        },
                        {
                            id: 'opt2_3',
                            text: 'Удалю сообщение и заблокирую отправителя',
                            textEn: 'Delete message and block sender',
                            textKk: 'Хабарламаны өшіріп, жіберушіні бұғаттаймын',
                            outcomeType: 'safe',
                            explanation: 'Правильно! Это лучшая реакция на мошеннические сообщения. Блокировка предотвратит повторные попытки.\n\n✅ Дополнительно: Можно пожаловаться на номер как спам в настройках телефона.',
                            explanationEn: 'Correct! This is the best reaction to scam messages. Blocking will prevent repeat attempts.\n\n✅ Additionally: You can report the number as spam in phone settings.',
                            explanationKk: 'Дұрыс! Бұл алаяқтық хабарламаларға ең жақсы жауап. Бұғаттау қайталанатын әрекеттерді болдырмайды.\n\n✅ Қосымша: Нөмірді телефон параметрлерінде спам ретінде шағымдануға болады.'
                        }
                    ]
                },
                // ШАГ 3: SMS со ссылкой на поддельный сайт
                {
                    id: 'step3',
                    type: 'question',
                    visualType: 'phone',
                    phoneMessageType: 'sms',
                    senderName: 'Kaspi.kz',
                    senderNameEn: 'Kaspi.kz',
                    senderNameKk: 'Kaspi.kz',
                    senderNumber: 'Kaspi',
                    profileEmoji: '🔴',
                    messageText: 'Уважаемый клиент!\n\nВаш аккаунт будет удален через 24 часа из-за подозрительной активности.\n\nПодтвердите личность:\nkaspi-verify.kz/confirm\n\nKaspi.kz',
                    messageTextEn: 'Dear customer!\n\nYour account will be deleted in 24 hours due to suspicious activity.\n\nVerify identity:\nkaspi-verify.kz/confirm\n\nKaspi.kz',
                    messageTextKk: 'Құрметті клиент!\n\nСіздің аккаунтыңыз күдікті белсенділікке байланысты 24 сағат ішінде жойылады.\n\nЖеке басыңызды растаңыз:\nkaspi-verify.kz/confirm\n\nKaspi.kz',
                    question: 'Как вы отреагируете на это сообщение?',
                    questionEn: 'How will you react to this message?',
                    questionKk: 'Бұл хабарламаға қалай жауап бересіз?',
                    content: 'SMS об удалении аккаунта',
                    options: [
                        {
                            id: 'opt3_1',
                            text: 'Проверю домен — kaspi-verify.kz выглядит подозрительно',
                            textEn: 'Check the domain — kaspi-verify.kz looks suspicious',
                            textKk: 'Доменді тексеремін — kaspi-verify.kz күдікті көрінеді',
                            outcomeType: 'safe',
                            explanation: 'Отлично! Вы правы — это поддельный домен. Настоящий Kaspi использует только kaspi.kz.\n\n🔍 Как проверять домены:\n• Официальный: kaspi.kz\n• Мошеннический: kaspi-verify.kz, kaspi-secure.com, и т.д.\n\nЛюбые дефисы или дополнительные слова — признак подделки!',
                            explanationEn: 'Excellent! You\'re right — this is a fake domain. Real Kaspi only uses kaspi.kz.\n\n🔍 How to check domains:\n• Official: kaspi.kz\n• Fraudulent: kaspi-verify.kz, kaspi-secure.com, etc.\n\nAny hyphens or extra words are signs of fraud!',
                            explanationKk: 'Тамаша! Сіз дұрыс айтасыз — бұл жалған домен. Нақты Kaspi тек kaspi.kz пайдаланады.\n\n🔍 Домендерді қалай тексеруге болады:\n• Ресми: kaspi.kz\n• Алаяқтық: kaspi-verify.kz, kaspi-secure.com, т.б.\n\nКез келген сызықшалар немесе қосымша сөздер жалғандық белгісі!'
                        },
                        {
                            id: 'opt3_2',
                            text: 'Срочно перейду — не хочу потерять аккаунт',
                            textEn: 'Click urgently — don\'t want to lose my account',
                            textKk: 'Шұғыл өтемін — аккаунтымды жоғалтқым келмейді',
                            outcomeType: 'dangerous',
                            explanation: 'Опасно! Мошенники специально создают ощущение срочности, чтобы вы не успели подумать.\n\n🚨 Тактики мошенников:\n• Угроза удаления аккаунта\n• Ограничение по времени (24 часа)\n• Официальный вид сообщения\n\nKaspi НИКОГДА не удаляет аккаунты через SMS!',
                            explanationEn: 'Dangerous! Scammers deliberately create urgency so you don\'t have time to think.\n\n🚨 Scammer tactics:\n• Account deletion threat\n• Time limit (24 hours)\n• Official-looking message\n\nKaspi NEVER deletes accounts via SMS!',
                            explanationKk: 'Қауіпті! Алаяқтар сіз ойлануға үлгермеуіңіз үшін әдейі шұғылдық тудырады.\n\n🚨 Алаяқтар тактикасы:\n• Аккаунтты жою қаупі\n• Уақыт шектеуі (24 сағат)\n• Ресми көрінетін хабарлама\n\nKaspi ЕШҚАШАН SMS арқылы аккаунттарды жоймайды!'
                        },
                        {
                            id: 'opt3_3',
                            text: 'Открою приложение Kaspi и проверю уведомления',
                            textEn: 'Open Kaspi app and check notifications',
                            textKk: 'Kaspi қосымшасын ашып, хабарландыруларды тексеремін',
                            outcomeType: 'safe',
                            explanation: 'Правильно! Все важные уведомления от Kaspi приходят через официальное приложение, а не через SMS со ссылками.\n\n✅ Правило безопасности: Если получили тревожное SMS — проверьте информацию в приложении, а не по ссылке.\n\n🎉 Поздравляем! Вы успешно прошли обучение по SMS-мошенничеству!',
                            explanationEn: 'Correct! All important Kaspi notifications come through the official app, not via SMS with links.\n\n✅ Security rule: If you receive an alarming SMS — check information in the app, not via the link.\n\n🎉 Congratulations! You have successfully completed SMS fraud training!',
                            explanationKk: 'Дұрыс! Барлық маңызды Kaspi хабарландырулары ресми қосымша арқылы келеді, сілтемелері бар SMS арқылы емес.\n\n✅ Қауіпсіздік ережесі: Алаңдатарлық SMS алсаңыз — ақпаратты сілтеме арқылы емес, қосымшадан тексеріңіз.\n\n🎉 Құттықтаймыз! Сіз SMS алаяқтығы бойынша оқуды сәтті аяқтадыңыз!'
                        }
                    ]
                }
            ]
        }
    }
];

// IDs of old scenarios that should be deleted from Firestore
const OLD_SCENARIO_IDS = [
    'scenario_sms_01',
    'scenario_001_family',
    'scenario_family_01',
    // Removed scenarios
    'scenario_002_bank',
    'scenario_003_egov',
    'scenario_004_job',
    'scenario_005_post',
];

export const seedScenarios = async () => {
    try {
        console.log('Starting batch seed of scenarios...');
        const batch = writeBatch(db);

        // Delete old scenarios with deprecated IDs
        OLD_SCENARIO_IDS.forEach((oldId) => {
            const oldDocRef = doc(db, 'scenarios', oldId);
            batch.delete(oldDocRef);
        });

        // Add/update new scenarios
        SCENARIOS.forEach((scenario) => {
            const docRef = doc(db, 'scenarios', scenario.id);
            batch.set(docRef, scenario);
        });

        await batch.commit();
        console.log('Old scenarios deleted, new scenarios seeded successfully!');
        return true;
    } catch (error) {
        console.error('Error seeding scenarios:', error);
        throw error;
    }
};
