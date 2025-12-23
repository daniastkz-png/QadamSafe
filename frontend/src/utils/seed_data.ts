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
                    content: 'Вам поступает звонок. Голос уверенный, фоном слышен шум колл-центра.\n\n"Служба безопасности":\n"Уважаемый клиент! Зафиксирована подозрительная попытка перевода на сумму 150 000₸. Если это не Вы, срочно сообщите код из SMS для отмены операции."\n\nЧто вы сделаете в этой ситуации?',
                    contentEn: 'You receive a call. The voice is confident, you can hear call center noise in the background.\n\n"Security Service":\n"Dear client! A suspicious transfer attempt of 150,000₸ has been detected. If this wasn\'t you, urgently provide the SMS code to cancel the operation."\n\nWhat will you do in this situation?',
                    contentKk: 'Сізге қоңырау келеді. Дауыс сенімді, фонда колл-орталық шуы естіледі.\n\n"Қауіпсіздік қызметі":\n"Құрметті клиент! 150 000₸ сомасына күдікті аударым әрекеті тіркелді. Егер бұл сіз болмасаңыз, операцияны болдырмау үшін SMS кодын дереу хабарлаңыз."\n\nБұл жағдайда не істейсіз?',
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
                    content: 'Вы получаете SMS с приятной новостью о социальной выплате.\n\nОт: 1414 (Fake)\n"Вам назначена социальная выплата 50 000₸. Для получения перейдите по ссылке: egov-portal-kz.com/payment. Срок действия ссылки 24 часа."\n\nЧто вы сделаете в этой ситуации?',
                    contentEn: 'You receive an SMS with pleasant news about a social payment.\n\nFrom: 1414 (Fake)\n"You have been assigned a social payment of 50,000₸. To receive it, follow the link: egov-portal-kz.com/payment. Link valid for 24 hours."\n\nWhat will you do in this situation?',
                    contentKk: 'Сізге әлеуметтік төлем туралы қуанышты хабармен SMS келеді.\n\nКімнен: 1414 (Жалған)\n"Сізге 50 000₸ әлеуметтік төлем тағайындалды. Алу үшін сілтемені ашыңыз: egov-portal-kz.com/payment. Сілтеме 24 сағат жарамды."\n\nБұл жағдайда не істейсіз?',
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
                    content: 'В Telegram приходит сообщение от "HR менеджера".\n\nHR Manager Anna:\n"Здравствуйте! Ищем сотрудников на удаленку. Задача: ставить лайки на товары Wildberries/Ozon. Оплата: от 25 000₸ в день. Интересно?"\n\nЧто вы сделаете в этой ситуации?',
                    contentEn: 'You receive a Telegram message from an "HR manager".\n\nHR Manager Anna:\n"Hello! We are looking for remote employees. Task: like products on Wildberries/Ozon. Payment: from 25,000₸ per day. Interested?"\n\nWhat will you do in this situation?',
                    contentKk: 'Telegram-ға "HR менеджерден" хабарлама келеді.\n\nHR Manager Anna:\n"Сәлеметсіз бе! Қашықтан жұмыс істейтін қызметкерлер іздейміз. Тапсырма: Wildberries/Ozon тауарларына лайк қою. Төлем: күніне 25 000₸-ден. Қызықты ма?"\n\nБұл жағдайда не істейсіз?',
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
                    content: 'SMS от службы доставки (хотя вы ничего не ждете, или ждете, что делает это опаснее).\n\nKazPost:\n"Ваша посылка прибыла на склад, но адрес указан неверно. Для доставки обновите адрес и оплатите пошлину 450₸ по ссылке: kazpost-delivery-track.com"\n\nЧто вы сделаете в этой ситуации?',
                    contentEn: 'SMS from delivery service (even though you\'re not expecting anything, or you are, which makes it more dangerous).\n\nKazPost:\n"Your parcel has arrived at the warehouse, but the address is incorrect. To deliver, update the address and pay a 450₸ fee via link: kazpost-delivery-track.com"\n\nWhat will you do in this situation?',
                    contentKk: 'Жеткізу қызметінен SMS (ештеңе күтпесеңіз де, немесе күтсеңіз де, бұл қауіптірек етеді).\n\nKazPost:\n"Сәлемдемеңіз қоймаға келді, бірақ мекенжай қате көрсетілген. Жеткізу үшін мекенжайды жаңартып, 450₸ баж төлеңіз: kazpost-delivery-track.com"\n\nБұл жағдайда не істейсіз?',
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

// IDs of old scenarios that should be deleted
const OLD_SCENARIO_IDS = [
    'scenario_sms_01',
    'scenario_001_family',
    'scenario_family_01',
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
