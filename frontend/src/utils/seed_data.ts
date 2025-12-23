import { db } from '../services/firebase';
import { doc, writeBatch } from 'firebase/firestore';
import { Scenario } from '../types';

const now = new Date().toISOString();

export const SCENARIOS: Scenario[] = [
    // СЦЕНАРИЙ 1: SMS-мошенничество
    {
        id: 'scenario_001_sms',
        title: 'Фишинговые SMS',
        titleEn: 'Phishing SMS',
        titleKk: 'Фишинг SMS',
        description: 'Научитесь распознавать мошеннические сообщения от банков и лотерей.',
        descriptionEn: 'Learn to recognize scam messages from banks and lotteries.',
        descriptionKk: 'Банктер мен лотереялардан келетін алаяқтық хабарламаларды тануды үйреніңіз.',
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
                    messageText: '⚠️ Обнаружена подозрительная операция!\n\nС вашей карты списано 89 000 тенге.\n\nЕсли это не вы — срочно перейдите:\nhalyk-secure.kz/stop',
                    messageTextEn: '⚠️ Suspicious transaction detected!\n\n89,000 tenge was charged from your card.\n\nIf this wasn\'t you — urgently go to:\nhalyk-secure.kz/stop',
                    messageTextKk: '⚠️ Күдікті операция анықталды!\n\nКартаңыздан 89 000 теңге шегерілді.\n\nБұл сіз болмасаңыз:\nhalyk-secure.kz/stop',
                    question: 'Что вы сделаете?',
                    questionEn: 'What will you do?',
                    questionKk: 'Не істейсіз?',
                    content: 'SMS о подозрительной операции',
                    options: [
                        {
                            id: 'opt1',
                            text: 'Срочно перейду по ссылке, чтобы остановить списание',
                            textEn: 'Urgently click the link to stop the charge',
                            textKk: 'Шегеруді тоқтату үшін сілтемені ашамын',
                            outcomeType: 'dangerous',
                            explanation: 'Опасно! Домен halyk-secure.kz — поддельный. Настоящий сайт банка — halykbank.kz. Мошенники специально создают срочность.',
                            explanationEn: 'Dangerous! halyk-secure.kz is fake. Real bank site is halykbank.kz. Scammers deliberately create urgency.',
                            explanationKk: 'Қауіпті! halyk-secure.kz жалған. Банктің нақты сайты — halykbank.kz.'
                        },
                        {
                            id: 'opt2',
                            text: 'Проверю баланс в официальном приложении банка',
                            textEn: 'Check balance in the official bank app',
                            textKk: 'Балансты банктің ресми қосымшасынан тексеремін',
                            outcomeType: 'safe',
                            explanation: 'Правильно! Проверка через официальное приложение — единственный надёжный способ. Там вы увидите, что никакого списания не было.',
                            explanationEn: 'Correct! Checking via official app is the only reliable way. You\'ll see there was no charge.',
                            explanationKk: 'Дұрыс! Ресми қосымша арқылы тексеру — жалғыз сенімді жол.'
                        },
                        {
                            id: 'opt3',
                            text: 'Перезвоню по номеру из SMS',
                            textEn: 'Call back the number from SMS',
                            textKk: 'SMS-тегі нөмірге қайта қоңырау шаламын',
                            outcomeType: 'risky',
                            explanation: 'Рискованно! Номер в SMS принадлежит мошенникам. Звоните только по номеру на карте или из приложения.',
                            explanationEn: 'Risky! The number in SMS belongs to scammers. Only call the number on your card.',
                            explanationKk: 'Тәуекелді! SMS-тегі нөмір алаяқтарға тиесілі.'
                        }
                    ]
                },
                {
                    id: 'step2',
                    type: 'question',
                    visualType: 'phone',
                    phoneMessageType: 'whatsapp',
                    senderName: 'KaspiBank Акция',
                    senderNameEn: 'KaspiBank Promo',
                    senderNameKk: 'KaspiBank Акция',
                    senderNumber: '+7 700 XXX XX XX',
                    profileEmoji: '🎉',
                    messageText: '🎊 Поздравляем!\n\nВы выиграли 500 000 тенге!\n\nЗаберите приз:\nkaspi-prize.net/win\n\nОсталось 15 минут!',
                    messageTextEn: '🎊 Congratulations!\n\nYou won 500,000 tenge!\n\nClaim prize:\nkaspi-prize.net/win\n\n15 minutes left!',
                    messageTextKk: '🎊 Құттықтаймыз!\n\nСіз 500 000 теңге ұттыңыз!\n\nЖүлдені алыңыз:\nkaspi-prize.net/win\n\n15 минут қалды!',
                    question: 'Как поступите?',
                    questionEn: 'What will you do?',
                    questionKk: 'Не істейсіз?',
                    content: 'Сообщение о выигрыше',
                    options: [
                        {
                            id: 'opt1',
                            text: 'Перейду — вдруг правда выиграл',
                            textEn: 'Click — maybe I really won',
                            textKk: 'Өтемін — мүмкін шынымен ұттым',
                            outcomeType: 'dangerous',
                            explanation: 'Опасно! kaspi-prize.net — мошенники. Kaspi никогда не проводит акции через мессенджеры. Все акции — только в приложении.',
                            explanationEn: 'Dangerous! kaspi-prize.net is fraudulent. Kaspi never runs promotions via messengers.',
                            explanationKk: 'Қауіпті! kaspi-prize.net — алаяқтар. Kaspi мессенджерлер арқылы акция өткізбейді.'
                        },
                        {
                            id: 'opt2',
                            text: 'Открою приложение Kaspi и проверю',
                            textEn: 'Open Kaspi app and check',
                            textKk: 'Kaspi қосымшасын ашып тексеремін',
                            outcomeType: 'safe',
                            explanation: 'Правильно! Все настоящие акции видны только в официальном приложении. Там никакого выигрыша нет.',
                            explanationEn: 'Correct! All real promotions are only visible in the official app.',
                            explanationKk: 'Дұрыс! Барлық нақты акциялар тек ресми қосымшада көрінеді.'
                        },
                        {
                            id: 'opt3',
                            text: 'Спрошу у знакомых, не получали ли они такое',
                            textEn: 'Ask friends if they received this',
                            textKk: 'Таныстарымнан сұраймын',
                            outcomeType: 'risky',
                            explanation: 'Недостаточно! Мошенники рассылают миллионы сообщений. Проверяйте только через официальные каналы.',
                            explanationEn: 'Not enough! Scammers send millions of messages. Only verify via official channels.',
                            explanationKk: 'Жеткіліксіз! Алаяқтар миллиондаған хабарлама жібереді.'
                        }
                    ]
                },
                {
                    id: 'step3',
                    type: 'question',
                    visualType: 'phone',
                    phoneMessageType: 'sms',
                    senderName: 'kaspi-bonus.kz',
                    senderNameEn: 'kaspi-bonus.kz',
                    senderNameKk: 'kaspi-bonus.kz',
                    senderNumber: 'Kaspi',
                    profileEmoji: '🔴',
                    messageText: '[ Страница kaspi-bonus.kz ]\n\n🏦 Kaspi.kz\nВведите данные карты для получения бонуса:\n\n• Номер карты: ____________\n• Срок: __/__\n• CVV: ___',
                    messageTextEn: '[ Page kaspi-bonus.kz ]\n\n🏦 Kaspi.kz\nEnter card details to receive bonus:\n\n• Card number: ____________\n• Expiry: __/__\n• CVV: ___',
                    messageTextKk: '[ kaspi-bonus.kz беті ]\n\n🏦 Kaspi.kz\nБонус алу үшін карта деректерін енгізіңіз:\n\n• Карта нөмірі: ____________\n• Мерзімі: __/__\n• CVV: ___',
                    question: 'Сайт выглядит как настоящий Kaspi. Что сделаете?',
                    questionEn: 'Site looks like real Kaspi. What will you do?',
                    questionKk: 'Сайт нақты Kaspi сияқты көрінеді. Не істейсіз?',
                    content: 'Фейковый сайт банка',
                    options: [
                        {
                            id: 'opt1',
                            text: 'Введу данные — сайт выглядит официально',
                            textEn: 'Enter data — site looks official',
                            textKk: 'Деректерді енгіземін — сайт ресми көрінеді',
                            outcomeType: 'dangerous',
                            explanation: 'Опасно! kaspi-bonus.kz — подделка. Настоящий сайт — только kaspi.kz. CVV нельзя вводить нигде кроме оплаты покупок!',
                            explanationEn: 'Dangerous! kaspi-bonus.kz is fake. Real site is only kaspi.kz. Never enter CVV except for purchases!',
                            explanationKk: 'Қауіпті! kaspi-bonus.kz — жалған. Нақты сайт — тек kaspi.kz.'
                        },
                        {
                            id: 'opt2',
                            text: 'Проверю адрес — kaspi-bonus.kz не kaspi.kz',
                            textEn: 'Check address — kaspi-bonus.kz is not kaspi.kz',
                            textKk: 'Мекенжайды тексеремін — kaspi-bonus.kz емес kaspi.kz',
                            outcomeType: 'safe',
                            explanation: 'Отлично! Вы заметили подмену домена. Любые дефисы или добавки к kaspi.kz — это мошенники. 🎉 Сценарий пройден!',
                            explanationEn: 'Excellent! You noticed the domain change. Any hyphens or additions to kaspi.kz are scammers. 🎉 Scenario complete!',
                            explanationKk: 'Тамаша! Сіз домен ауыстыруын байқадыңыз. 🎉 Сценарий аяқталды!'
                        },
                        {
                            id: 'opt3',
                            text: 'Введу только номер карты, без CVV',
                            textEn: 'Enter only card number, without CVV',
                            textKk: 'Тек карта нөмірін енгіземін, CVV-сыз',
                            outcomeType: 'risky',
                            explanation: 'Рискованно! Даже номер карты — ценная информация для мошенников. Не вводите никакие данные на подозрительных сайтах.',
                            explanationEn: 'Risky! Even card number is valuable info for scammers. Don\'t enter any data on suspicious sites.',
                            explanationKk: 'Тәуекелді! Карта нөмірі де алаяқтар үшін құнды ақпарат.'
                        }
                    ]
                }
            ]
        }
    },
    // СЦЕНАРИЙ 2: Звонки от "служб безопасности"
    {
        id: 'scenario_002_calls',
        title: 'Звонок из банка',
        titleEn: 'Bank Call Scam',
        titleKk: 'Банктен қоңырау',
        description: 'Распознавайте телефонных мошенников, представляющихся сотрудниками банка.',
        descriptionEn: 'Recognize phone scammers posing as bank employees.',
        descriptionKk: 'Банк қызметкерлері болып көрінетін телефон алаяқтарын тани біліңіз.',
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
                    visualType: 'phone',
                    phoneMessageType: 'call',
                    senderName: 'Служба безопасности',
                    senderNameEn: 'Security Service',
                    senderNameKk: 'Қауіпсіздік қызметі',
                    senderNumber: '+7 727 XXX XX XX',
                    profileEmoji: '📞',
                    messageText: '📞 Входящий звонок...\n\n«Здравствуйте! Служба безопасности Kaspi Bank. С вашего счёта пытаются перевести 200 000 тенге. Подтверждали ли вы эту операцию?»',
                    messageTextEn: '📞 Incoming call...\n\n"Hello! Kaspi Bank Security Service. Someone is trying to transfer 200,000 tenge from your account. Did you authorize this?"',
                    messageTextKk: '📞 Кіріс қоңырау...\n\n«Сәлеметсіз бе! Kaspi Bank қауіпсіздік қызметі. Сіздің шотыңыздан 200 000 теңге аударылмақ. Бұл операцияны растадыңыз ба?»',
                    question: 'Как вы ответите?',
                    questionEn: 'How will you respond?',
                    questionKk: 'Қалай жауап бересіз?',
                    content: 'Звонок от службы безопасности',
                    options: [
                        {
                            id: 'opt1',
                            text: 'Нет, не подтверждал! Помогите заблокировать!',
                            textEn: 'No, I didn\'t! Help me block it!',
                            textKk: 'Жоқ, растамадым! Бұғаттауға көмектесіңіз!',
                            outcomeType: 'dangerous',
                            explanation: 'Вы попались! Мошенники используют страх, чтобы вы действовали импульсивно. Kaspi никогда не звонит — все уведомления в приложении.',
                            explanationEn: 'You fell for it! Scammers use fear to make you act impulsively. Kaspi never calls.',
                            explanationKk: 'Сіз түстіңіз! Алаяқтар қорқынышты пайдаланады.'
                        },
                        {
                            id: 'opt2',
                            text: 'Положу трубку и проверю в приложении',
                            textEn: 'Hang up and check in the app',
                            textKk: 'Трубканы қоямын және қосымшадан тексеремін',
                            outcomeType: 'safe',
                            explanation: 'Правильно! Банки никогда не звонят о переводах. Все операции видны в приложении. Если сомневаетесь — кладите трубку.',
                            explanationEn: 'Correct! Banks never call about transfers. All transactions are visible in the app.',
                            explanationKk: 'Дұрыс! Банктер ешқашан аударымдар туралы қоңырау шалмайды.'
                        },
                        {
                            id: 'opt3',
                            text: 'Попрошу перезвонить через 5 минут',
                            textEn: 'Ask them to call back in 5 minutes',
                            textKk: '5 минуттан қайта қоңырау шалуын сұраймын',
                            outcomeType: 'risky',
                            explanation: 'Рискованно! Мошенники продолжат давить. Не перезванивайте — проверяйте только через официальное приложение.',
                            explanationEn: 'Risky! Scammers will keep pressuring you. Don\'t call back.',
                            explanationKk: 'Тәуекелді! Алаяқтар қысым жасауды жалғастырады.'
                        }
                    ]
                },
                {
                    id: 'step2',
                    type: 'question',
                    visualType: 'phone',
                    phoneMessageType: 'call',
                    senderName: 'Служба безопасности',
                    senderNameEn: 'Security Service',
                    senderNameKk: 'Қауіпсіздік қызметі',
                    senderNumber: '+7 727 XXX XX XX',
                    profileEmoji: '📞',
                    messageText: '📞 Продолжение разговора...\n\n«Операция в процессе! У вас есть только 2 минуты, иначе деньги уйдут! Продиктуйте код из SMS, чтобы мы отменили перевод!»',
                    messageTextEn: '📞 Call continues...\n\n"Transaction in progress! You have only 2 minutes or the money will be gone! Tell us the SMS code so we can cancel the transfer!"',
                    messageTextKk: '📞 Әңгіме жалғасуда...\n\n«Операция жүріп жатыр! Сізде 2 минут қалды, әйтпесе ақша кетеді! Аударымды болдырмау үшін SMS кодын айтыңыз!»',
                    question: 'Они требуют код. Что сделаете?',
                    questionEn: 'They demand the code. What will you do?',
                    questionKk: 'Олар код сұрайды. Не істейсіз?',
                    content: 'Давление и срочность',
                    options: [
                        {
                            id: 'opt1',
                            text: 'Продиктую код — время уходит',
                            textEn: 'Tell them the code — time is running out',
                            textKk: 'Кодты айтамын — уақыт кетіп жатыр',
                            outcomeType: 'dangerous',
                            explanation: 'Катастрофа! SMS-код — это подтверждение перевода. Вы сами авторизовали кражу денег. Банк НИКОГДА не просит коды по телефону!',
                            explanationEn: 'Disaster! SMS code is transfer confirmation. You just authorized the theft. Banks NEVER ask for codes by phone!',
                            explanationKk: 'Апат! SMS-код — бұл аударымды растау. Сіз ұрлықты өзіңіз рұқсат еттіңіз!'
                        },
                        {
                            id: 'opt2',
                            text: 'Код никому не скажу — положу трубку',
                            textEn: 'Won\'t tell the code — hanging up',
                            textKk: 'Кодты ешкімге айтпаймын — трубканы қоямын',
                            outcomeType: 'safe',
                            explanation: 'Правильно! SMS-код — как ключ от сейфа. Никому и никогда. Сотрудники банка не имеют права его спрашивать.',
                            explanationEn: 'Correct! SMS code is like a safe key. Never tell anyone. Bank employees have no right to ask for it.',
                            explanationKk: 'Дұрыс! SMS-код — сейф кілті сияқты. Ешкімге, ешқашан.'
                        },
                        {
                            id: 'opt3',
                            text: 'Попрошу их назвать мой баланс для проверки',
                            textEn: 'Ask them to tell me my balance to verify',
                            textKk: 'Тексеру үшін балансымды айтуын сұраймын',
                            outcomeType: 'risky',
                            explanation: 'Бесполезно! Мошенники могут знать ваше имя и даже часть данных. Это не доказывает, что звонят из банка.',
                            explanationEn: 'Useless! Scammers may know your name and some data. This doesn\'t prove they\'re from the bank.',
                            explanationKk: 'Пайдасыз! Алаяқтар сіздің атыңызды білуі мүмкін.'
                        }
                    ]
                },
                {
                    id: 'step3',
                    type: 'question',
                    visualType: 'phone',
                    phoneMessageType: 'call',
                    senderName: 'Служба безопасности',
                    senderNameEn: 'Security Service',
                    senderNameKk: 'Қауіпсіздік қызметі',
                    senderNumber: '+7 727 XXX XX XX',
                    profileEmoji: '📞',
                    messageText: '📞 Голос звучит профессионально...\n\n«Я понимаю ваши сомнения. Меня зовут Асет Нурланов, мой служебный номер 4521. Можете проверить — я действительно сотрудник. Но времени мало!»',
                    messageTextEn: '📞 Voice sounds professional...\n\n"I understand your doubts. My name is Aset Nurlanov, badge number 4521. You can verify — I\'m really an employee. But time is short!"',
                    messageTextKk: '📞 Дауыс кәсіби естіледі...\n\n«Сіздің күмәніңізді түсінемін. Менің атым Асет Нұрланов, қызмет нөмірім 4521. Тексере аласыз — мен шынымен қызметкермін. Бірақ уақыт аз!»',
                    question: 'Звонящий назвал имя и номер. Можно доверять?',
                    questionEn: 'Caller gave name and badge number. Can you trust them?',
                    questionKk: 'Қоңырау шалушы аты мен нөмірін айтты. Сенуге бола ма?',
                    content: 'Убедительный профессионал',
                    options: [
                        {
                            id: 'opt1',
                            text: 'Раз есть служебный номер — это настоящий сотрудник',
                            textEn: 'If there\'s a badge number — must be real employee',
                            textKk: 'Қызмет нөмірі бар болса — нақты қызметкер',
                            outcomeType: 'dangerous',
                            explanation: 'Нет! Мошенники придумывают любые данные. Служебный номер ничего не доказывает. Проверка возможна только через приложение.',
                            explanationEn: 'No! Scammers make up any data. Badge number proves nothing. Verify only via app.',
                            explanationKk: 'Жоқ! Алаяқтар кез келген деректерді ойлап табады.'
                        },
                        {
                            id: 'opt2',
                            text: 'Положу трубку — никакие данные не доказывают подлинность',
                            textEn: 'Hang up — no data proves authenticity',
                            textKk: 'Трубканы қоямын — ешбір деректер шынайылықты дәлелдемейді',
                            outcomeType: 'safe',
                            explanation: 'Отлично! Вы не поддались давлению. Запомните: банк НИКОГДА не звонит о переводах и не просит коды. 🎉 Сценарий пройден!',
                            explanationEn: 'Excellent! You didn\'t give in to pressure. Remember: bank NEVER calls about transfers. 🎉 Scenario complete!',
                            explanationKk: 'Тамаша! Сіз қысымға берілмедіңіз. 🎉 Сценарий аяқталды!'
                        },
                        {
                            id: 'opt3',
                            text: 'Перезвоню в банк по другому номеру, чтобы проверить',
                            textEn: 'Call bank on different number to verify',
                            textKk: 'Тексеру үшін банкке басқа нөмірден қоңырау шаламын',
                            outcomeType: 'safe',
                            explanation: 'Хорошо! Но лучше сразу положить трубку. Звоните только по номеру на карте. Любая проверка — только через приложение.',
                            explanationEn: 'Good! But better to just hang up. Only call number on your card.',
                            explanationKk: 'Жақсы! Бірақ трубканы қоюға дұрыс. Тек картадағы нөмірге қоңырау шалыңыз.'
                        }
                    ]
                }
            ]
        }
    },
    // СЦЕНАРИЙ 3: Сообщение от близкого
    {
        id: 'scenario_003_friend',
        title: 'Сообщение от близкого',
        titleEn: 'Message from Friend',
        titleKk: 'Жақын адамнан хабар',
        description: 'Мошенники притворяются вашими родственниками и друзьями.',
        descriptionEn: 'Scammers pretend to be your relatives and friends.',
        descriptionKk: 'Алаяқтар сіздің туыстарыңыз бен достарыңыз болып көрінеді.',
        type: 'SOCIAL_ENGINEERING',
        difficulty: 'INTERMEDIATE',
        requiredTier: 'FREE',
        pointsReward: 200,
        order: 3,
        isLegitimate: false,
        createdAt: now,
        updatedAt: now,
        content: {
            steps: [
                {
                    id: 'step1',
                    type: 'question',
                    visualType: 'phone',
                    phoneMessageType: 'whatsapp',
                    senderName: 'Неизвестный номер',
                    senderNameEn: 'Unknown Number',
                    senderNameKk: 'Белгісіз нөмір',
                    senderNumber: '+7 707 XXX XX XX',
                    profileEmoji: '👤',
                    messageText: 'Привет! Это я, мама 😊\n\nПотеряла телефон, это мой новый номер. Сохрани!\n\nКак дела?',
                    messageTextEn: 'Hi! It\'s me, mom 😊\n\nLost my phone, this is my new number. Save it!\n\nHow are you?',
                    messageTextKk: 'Сәлем! Мен анаңмын 😊\n\nТелефонымды жоғалтып алдым, бұл жаңа нөмірім. Сақта!\n\nҚалың қалай?',
                    question: 'Как отреагируете?',
                    questionEn: 'How will you react?',
                    questionKk: 'Қалай жауап бересіз?',
                    content: 'Сообщение с нового номера',
                    options: [
                        {
                            id: 'opt1',
                            text: 'Сохраню номер и отвечу',
                            textEn: 'Save the number and reply',
                            textKk: 'Нөмірді сақтап, жауап беремін',
                            outcomeType: 'risky',
                            explanation: 'Будьте осторожны! Это классическое начало мошенничества. Прежде чем продолжать разговор — позвоните на старый номер.',
                            explanationEn: 'Be careful! This is classic scam start. Before continuing — call the old number.',
                            explanationKk: 'Абай болыңыз! Бұл классикалық алаяқтық. Жалғастырмас бұрын — ескі нөмірге қоңырау шалыңыз.'
                        },
                        {
                            id: 'opt2',
                            text: 'Позвоню на старый номер мамы',
                            textEn: 'Call mom\'s old number',
                            textKk: 'Анамның ескі нөміріне қоңырау шаламын',
                            outcomeType: 'safe',
                            explanation: 'Правильно! Всегда проверяйте через другой канал связи. Позвоните на известный вам номер.',
                            explanationEn: 'Correct! Always verify via another channel. Call the number you know.',
                            explanationKk: 'Дұрыс! Әрқашан басқа байланыс арқылы тексеріңіз.'
                        },
                        {
                            id: 'opt3',
                            text: 'Спрошу что-то личное для проверки',
                            textEn: 'Ask something personal to verify',
                            textKk: 'Тексеру үшін жеке бірдеңе сұраймын',
                            outcomeType: 'risky',
                            explanation: 'Недостаточно! Мошенники могут знать информацию из соцсетей. Проверка — только звонок на старый номер.',
                            explanationEn: 'Not enough! Scammers may know info from social media. Verify only by calling old number.',
                            explanationKk: 'Жеткіліксіз! Алаяқтар әлеуметтік желілерден ақпарат білуі мүмкін.'
                        }
                    ]
                },
                {
                    id: 'step2',
                    type: 'question',
                    visualType: 'phone',
                    phoneMessageType: 'whatsapp',
                    senderName: 'Мама (новый)',
                    senderNameEn: 'Mom (new)',
                    senderNameKk: 'Анам (жаңа)',
                    senderNumber: '+7 707 XXX XX XX',
                    profileEmoji: '👤',
                    messageText: 'Солнышко, у меня проблема 😰\n\nСрочно нужно 50 000 тенге. Потом объясню.\n\nПереведи на Kaspi:\n+7 747 XXX XX XX\n\nВерну завтра!',
                    messageTextEn: 'Sweetie, I have a problem 😰\n\nUrgently need 50,000 tenge. Will explain later.\n\nTransfer to Kaspi:\n+7 747 XXX XX XX\n\nWill return tomorrow!',
                    messageTextKk: 'Күнім, проблема бар 😰\n\nШұғыл 50 000 теңге керек. Кейін түсіндіремін.\n\nKaspi-ге аудар:\n+7 747 XXX XX XX\n\nЕртең қайтарамын!',
                    question: '"Мама" просит деньги. Что сделаете?',
                    questionEn: '"Mom" asks for money. What will you do?',
                    questionKk: '"Анаңыз" ақша сұрайды. Не істейсіз?',
                    content: 'Просьба о переводе денег',
                    options: [
                        {
                            id: 'opt1',
                            text: 'Переведу — маме нужна помощь',
                            textEn: 'Transfer — mom needs help',
                            textKk: 'Аударамын — анама көмек керек',
                            outcomeType: 'dangerous',
                            explanation: 'Опасно! Номер получателя — не мамин. Вы только что отправили деньги мошенникам. Всегда проверяйте звонком!',
                            explanationEn: 'Dangerous! Recipient number is not mom\'s. You just sent money to scammers!',
                            explanationKk: 'Қауіпті! Алушы нөмірі анаңыздікі емес. Сіз алаяқтарға ақша жібердіңіз!'
                        },
                        {
                            id: 'opt2',
                            text: 'Позвоню на старый номер — проверю',
                            textEn: 'Call old number — verify',
                            textKk: 'Ескі нөмірге қоңырау шаламын — тексеремін',
                            outcomeType: 'safe',
                            explanation: 'Правильно! При любой просьбе о деньгах — звоните на известный номер. Настоящая мама ответит и всё объяснит.',
                            explanationEn: 'Correct! For any money request — call known number. Real mom will answer.',
                            explanationKk: 'Дұрыс! Ақша туралы кез келген сұрауда — белгілі нөмірге қоңырау шалыңыз.'
                        },
                        {
                            id: 'opt3',
                            text: 'Попрошу прислать голосовое сообщение',
                            textEn: 'Ask for voice message',
                            textKk: 'Дауыстық хабарлама жіберуін сұраймын',
                            outcomeType: 'risky',
                            explanation: 'Рискованно! ИИ может подделать голос. Единственная надёжная проверка — звонок на старый номер.',
                            explanationEn: 'Risky! AI can fake voice. Only reliable check — call the old number.',
                            explanationKk: 'Тәуекелді! ЖИ дауысты жалған жасай алады.'
                        }
                    ]
                },
                {
                    id: 'step3',
                    type: 'question',
                    visualType: 'phone',
                    phoneMessageType: 'whatsapp',
                    senderName: 'Мама (новый)',
                    senderNameEn: 'Mom (new)',
                    senderNameKk: 'Анам (жаңа)',
                    senderNumber: '+7 707 XXX XX XX',
                    profileEmoji: '👤',
                    messageText: '🎤 Голосовое сообщение (0:05)\n\n[Голос похож на маму, но с шумами]\n\n«Солнышко, пожалуйста, очень срочно...»',
                    messageTextEn: '🎤 Voice message (0:05)\n\n[Voice similar to mom but with noise]\n\n"Sweetie, please, very urgent..."',
                    messageTextKk: '🎤 Дауыстық хабарлама (0:05)\n\n[Дауыс анаға ұқсас, бірақ шулы]\n\n«Күнім, өтінемін, өте шұғыл...»',
                    question: 'Голос похож на маму. Переводить?',
                    questionEn: 'Voice sounds like mom. Transfer?',
                    questionKk: 'Дауыс анаға ұқсас. Аударасыз ба?',
                    content: 'Голосовое сообщение',
                    options: [
                        {
                            id: 'opt1',
                            text: 'Голос мамин — переведу',
                            textEn: 'Voice is mom\'s — will transfer',
                            textKk: 'Дауыс анамдікі — аударамын',
                            outcomeType: 'dangerous',
                            explanation: 'Ошибка! ИИ-технологии могут клонировать голос из 3 секунд записи. Не доверяйте голосовым — только звонок!',
                            explanationEn: 'Mistake! AI can clone voice from 3 seconds of recording. Don\'t trust voice — only call!',
                            explanationKk: 'Қате! ЖИ дауысты 3 секундтық жазбадан клондай алады.'
                        },
                        {
                            id: 'opt2',
                            text: 'Не доверяю — позвоню на старый номер',
                            textEn: 'Don\'t trust — calling old number',
                            textKk: 'Сенбеймін — ескі нөмірге қоңырау шаламын',
                            outcomeType: 'safe',
                            explanation: 'Отлично! Даже голос не гарантия. Мама берёт трубку — и вы узнаёте, что телефон на месте. 🎉 Сценарий пройден!',
                            explanationEn: 'Excellent! Even voice is no guarantee. Mom answers — phone is fine. 🎉 Scenario complete!',
                            explanationKk: 'Тамаша! Дауыс та кепілдік емес. 🎉 Сценарий аяқталды!'
                        },
                        {
                            id: 'opt3',
                            text: 'Попрошу видеозвонок',
                            textEn: 'Ask for video call',
                            textKk: 'Бейне қоңырау сұраймын',
                            outcomeType: 'safe',
                            explanation: 'Хорошо! Видео сложнее подделать. Но проще — просто позвонить на старый номер.',
                            explanationEn: 'Good! Video is harder to fake. But easier — just call old number.',
                            explanationKk: 'Жақсы! Бейнені жалған жасау қиынырақ.'
                        }
                    ]
                }
            ]
        }
    },
    // СЦЕНАРИЙ 4: Фейковые госуслуги
    {
        id: 'scenario_004_gov',
        title: 'Выплата от государства',
        titleEn: 'Government Payment',
        titleKk: 'Мемлекеттен төлем',
        description: 'Мошенники притворяются госорганами и обещают выплаты.',
        descriptionEn: 'Scammers pretend to be government and promise payments.',
        descriptionKk: 'Алаяқтар мемлекеттік органдар болып көрініп, төлем уәде етеді.',
        type: 'PHISHING',
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
                    visualType: 'phone',
                    phoneMessageType: 'sms',
                    senderName: 'eGov',
                    senderNameEn: 'eGov',
                    senderNameKk: 'eGov',
                    senderNumber: 'eGov.kz',
                    profileEmoji: '🏛️',
                    messageText: '🏛️ eGov.kz\n\nВам одобрена социальная выплата 42 500 тенге.\n\nПолучить:\negov-pay.kz/get42500\n\nСрок: 3 дня',
                    messageTextEn: '🏛️ eGov.kz\n\nYou approved for social payment 42,500 tenge.\n\nReceive:\negov-pay.kz/get42500\n\nDeadline: 3 days',
                    messageTextKk: '🏛️ eGov.kz\n\nСізге 42 500 теңге әлеуметтік төлем бекітілді.\n\nАлу:\negov-pay.kz/get42500\n\nМерзім: 3 күн',
                    question: 'Вам пришла выплата от государства?',
                    questionEn: 'Government payment for you?',
                    questionKk: 'Сізге мемлекеттен төлем келді ме?',
                    content: 'SMS о выплате',
                    options: [
                        {
                            id: 'opt1',
                            text: 'Перейду и получу выплату',
                            textEn: 'Go and receive payment',
                            textKk: 'Өтіп, төлемді аламын',
                            outcomeType: 'dangerous',
                            explanation: 'Опасно! egov-pay.kz — подделка. Настоящий сайт — egov.kz без дополнений. Выплаты оформляются только там.',
                            explanationEn: 'Dangerous! egov-pay.kz is fake. Real site is egov.kz without additions.',
                            explanationKk: 'Қауіпті! egov-pay.kz — жалған. Нақты сайт — egov.kz.'
                        },
                        {
                            id: 'opt2',
                            text: 'Зайду на официальный egov.kz и проверю',
                            textEn: 'Go to official egov.kz and check',
                            textKk: 'Ресми egov.kz-ке кіріп тексеремін',
                            outcomeType: 'safe',
                            explanation: 'Правильно! Все выплаты видны в личном кабинете egov.kz. Если там ничего нет — это мошенники.',
                            explanationEn: 'Correct! All payments visible in egov.kz personal account.',
                            explanationKk: 'Дұрыс! Барлық төлемдер egov.kz жеке кабинетте көрінеді.'
                        },
                        {
                            id: 'opt3',
                            text: 'Позвоню в ЦОН и уточню',
                            textEn: 'Call service center to clarify',
                            textKk: 'ХҚО-ға қоңырау шалып нақтылаймын',
                            outcomeType: 'safe',
                            explanation: 'Хорошо! Но проще проверить на egov.kz. Любые госвыплаты там отображаются автоматически.',
                            explanationEn: 'Good! But easier to check egov.kz. All government payments shown there.',
                            explanationKk: 'Жақсы! Бірақ egov.kz-де тексеру оңай.'
                        }
                    ]
                },
                {
                    id: 'step2',
                    type: 'question',
                    visualType: 'phone',
                    phoneMessageType: 'sms',
                    senderName: 'egov-pay.kz',
                    senderNameEn: 'egov-pay.kz',
                    senderNameKk: 'egov-pay.kz',
                    senderNumber: 'eGov',
                    profileEmoji: '🏛️',
                    messageText: '[ Форма на egov-pay.kz ]\n\nДля получения выплаты введите:\n\n• ИИН: ____________\n• Номер карты: ____________\n• Срок действия: __/__',
                    messageTextEn: '[ Form on egov-pay.kz ]\n\nTo receive payment enter:\n\n• IIN: ____________\n• Card number: ____________\n• Expiry: __/__',
                    messageTextKk: '[ egov-pay.kz формасы ]\n\nТөлемді алу үшін енгізіңіз:\n\n• ЖСН: ____________\n• Карта нөмірі: ____________\n• Жарамдылық мерзімі: __/__',
                    question: 'Форма запрашивает данные карты. Вводить?',
                    questionEn: 'Form asks for card data. Enter?',
                    questionKk: 'Форма карта деректерін сұрайды. Енгізесіз бе?',
                    content: 'Форма для выплаты',
                    options: [
                        {
                            id: 'opt1',
                            text: 'Введу — нужна карта для получения денег',
                            textEn: 'Enter — need card to receive money',
                            textKk: 'Енгіземін — ақша алу үшін карта керек',
                            outcomeType: 'dangerous',
                            explanation: 'Ловушка! Для ПОЛУЧЕНИЯ денег НЕ нужен номер карты. Это нужно только для СПИСАНИЯ. Вас обманывают!',
                            explanationEn: 'Trap! Card number NOT needed to RECEIVE money. Only needed to CHARGE. You\'re being scammed!',
                            explanationKk: 'Тұзақ! Ақша АЛУ үшін карта нөмірі ҚАЖЕТ ЕМЕС.'
                        },
                        {
                            id: 'opt2',
                            text: 'Не буду — для получения карта не нужна',
                            textEn: 'Won\'t enter — card not needed to receive',
                            textKk: 'Енгізбеймін — алу үшін карта керек емес',
                            outcomeType: 'safe',
                            explanation: 'Правильно! Госвыплаты приходят на карту, привязанную в egov.kz. Вводить данные не нужно.',
                            explanationEn: 'Correct! Government payments go to card linked in egov.kz. No need to enter data.',
                            explanationKk: 'Дұрыс! Мемлекеттік төлемдер egov.kz-ке байланған картаға түседі.'
                        },
                        {
                            id: 'opt3',
                            text: 'Введу только ИИН',
                            textEn: 'Enter only IIN',
                            textKk: 'Тек ЖСН енгіземін',
                            outcomeType: 'risky',
                            explanation: 'Рискованно! ИИН тоже персональные данные. Не вводите ничего на подозрительных сайтах.',
                            explanationEn: 'Risky! IIN is also personal data. Don\'t enter anything on suspicious sites.',
                            explanationKk: 'Тәуекелді! ЖСН де жеке деректер.'
                        }
                    ]
                },
                {
                    id: 'step3',
                    type: 'question',
                    visualType: 'phone',
                    phoneMessageType: 'sms',
                    senderName: 'Kaspi',
                    senderNameEn: 'Kaspi',
                    senderNameKk: 'Kaspi',
                    senderNumber: 'Kaspi',
                    profileEmoji: '📱',
                    messageText: '📱 SMS от Kaspi:\n\nКод подтверждения: 7429\n\nНе сообщайте никому!',
                    messageTextEn: '📱 SMS from Kaspi:\n\nConfirmation code: 7429\n\nDo not share!',
                    messageTextKk: '📱 Kaspi-ден SMS:\n\nРастау коды: 7429\n\nЕшкімге айтпаңыз!',
                    question: 'На сайте просят ввести этот код для "подтверждения выплаты". Вводить?',
                    questionEn: 'Site asks for this code to "confirm payment". Enter?',
                    questionKk: 'Сайт "төлемді растау" үшін бұл кодты сұрайды. Енгізесіз бе?',
                    content: 'Запрос SMS-кода',
                    options: [
                        {
                            id: 'opt1',
                            text: 'Введу — это же для получения',
                            textEn: 'Enter — it\'s for receiving',
                            textKk: 'Енгіземін — бұл алу үшін',
                            outcomeType: 'dangerous',
                            explanation: 'Катастрофа! SMS-код — подтверждение СПИСАНИЯ. Мошенники уже привязали вашу карту и сейчас снимут деньги!',
                            explanationEn: 'Disaster! SMS code confirms CHARGE. Scammers linked your card and will take money now!',
                            explanationKk: 'Апат! SMS-код — ШЕГЕРУДІ растау. Алаяқтар картаңызды байладып, ақшаны алады!'
                        },
                        {
                            id: 'opt2',
                            text: 'Стоп! Код для получения не нужен',
                            textEn: 'Stop! Code not needed to receive',
                            textKk: 'Тоқта! Алу үшін код қажет емес',
                            outcomeType: 'safe',
                            explanation: 'Отлично! Вы раскусили схему. Для получения денег SMS-коды не нужны — только для отправки. 🎉 Сценарий пройден!',
                            explanationEn: 'Excellent! You figured out the scheme. SMS codes not needed to receive money. 🎉 Scenario complete!',
                            explanationKk: 'Тамаша! Сіз схеманы аштыңыз. 🎉 Сценарий аяқталды!'
                        },
                        {
                            id: 'opt3',
                            text: 'Позвоню в банк и спрошу',
                            textEn: 'Call bank and ask',
                            textKk: 'Банкке қоңырау шалып сұраймын',
                            outcomeType: 'safe',
                            explanation: 'Хорошо! Но вы уже знаете ответ — код вводить нельзя. Просто закройте этот сайт.',
                            explanationEn: 'Good! But you already know — never enter code. Just close this site.',
                            explanationKk: 'Жақсы! Бірақ сіз жауапты білесіз — кодты ешқашан енгізбеңіз.'
                        }
                    ]
                }
            ]
        }
    },
    // СЦЕНАРИЙ 5: Инвестиции и лёгкий заработок
    {
        id: 'scenario_005_invest',
        title: 'Лёгкий заработок',
        titleEn: 'Easy Money',
        titleKk: 'Оңай табыс',
        description: 'Мошенники обещают быстрый доход и гарантированную прибыль.',
        descriptionEn: 'Scammers promise quick income and guaranteed profit.',
        descriptionKk: 'Алаяқтар жылдам табыс пен кепілдендірілген пайда уәде етеді.',
        type: 'INVESTMENT_SCAM',
        difficulty: 'ADVANCED',
        requiredTier: 'FREE',
        pointsReward: 250,
        order: 5,
        isLegitimate: false,
        createdAt: now,
        updatedAt: now,
        content: {
            steps: [
                {
                    id: 'step1',
                    type: 'question',
                    visualType: 'phone',
                    phoneMessageType: 'telegram',
                    senderName: 'Инвест Казахстан',
                    senderNameEn: 'Invest Kazakhstan',
                    senderNameKk: 'Инвест Қазақстан',
                    senderNumber: '@invest_kz',
                    profileEmoji: '💰',
                    messageText: '💰 Пассивный доход!\n\nГарантированно 50% в месяц!\n\nВложите от 10 000 тенге\nи получайте ежедневно.\n\n✅ 1000+ довольных клиентов\n✅ Вывод в любое время',
                    messageTextEn: '💰 Passive income!\n\nGuaranteed 50% per month!\n\nInvest from 10,000 tenge\nand receive daily.\n\n✅ 1000+ happy clients\n✅ Withdraw anytime',
                    messageTextKk: '💰 Пассивті табыс!\n\nАйына 50% кепілдік!\n\n10 000 теңгеден салыңыз\nжәне күнделікті алыңыз.\n\n✅ 1000+ қанағаттанған клиент\n✅ Кез келген уақытта шығару',
                    question: 'Вам предлагают 50% в месяц. Как оцените?',
                    questionEn: 'Offered 50% monthly. How do you evaluate?',
                    questionKk: 'Сізге айына 50% ұсынады. Қалай бағалайсыз?',
                    content: 'Предложение инвестиций',
                    options: [
                        {
                            id: 'opt1',
                            text: 'Звучит отлично — попробую с маленькой суммы',
                            textEn: 'Sounds great — will try small amount',
                            textKk: 'Керемет естіледі — аз сомадан бастаймын',
                            outcomeType: 'dangerous',
                            explanation: 'Ловушка! 50% в месяц — это 600% годовых. Даже лучшие инвесторы мира не дают такую доходность. Это пирамида!',
                            explanationEn: 'Trap! 50% monthly = 600% yearly. Even best investors don\'t give such returns. It\'s a pyramid!',
                            explanationKk: 'Тұзақ! Айына 50% = жылына 600%. Бұл пирамида!'
                        },
                        {
                            id: 'opt2',
                            text: '50% нереально — это мошенники',
                            textEn: '50% is unrealistic — these are scammers',
                            textKk: '50% шынайы емес — бұлар алаяқтар',
                            outcomeType: 'safe',
                            explanation: 'Правильно! Гарантированная высокая доходность — главный признак пирамиды. Легальные инвестиции дают 10-20% в ГОД.',
                            explanationEn: 'Correct! Guaranteed high returns — main sign of pyramid. Legal investments give 10-20% per YEAR.',
                            explanationKk: 'Дұрыс! Кепілдендірілген жоғары табыс — пирамиданың басты белгісі.'
                        },
                        {
                            id: 'opt3',
                            text: 'Спрошу подробности и решу',
                            textEn: 'Ask for details and decide',
                            textKk: 'Толығырақ сұрап, шешім қабылдаймын',
                            outcomeType: 'risky',
                            explanation: 'Бесполезно! Мошенники покажут красивые графики и отзывы. Правило простое: обещают много — обманывают.',
                            explanationEn: 'Useless! Scammers will show nice graphs and reviews. Simple rule: promise a lot = lying.',
                            explanationKk: 'Пайдасыз! Алаяқтар әдемі графиктер көрсетеді.'
                        }
                    ]
                },
                {
                    id: 'step2',
                    type: 'question',
                    visualType: 'phone',
                    phoneMessageType: 'telegram',
                    senderName: 'Инвест Казахстан',
                    senderNameEn: 'Invest Kazakhstan',
                    senderNameKk: 'Инвест Қазақстан',
                    senderNumber: '@invest_kz',
                    profileEmoji: '💰',
                    messageText: '📸 Скриншоты выплат:\n\n"Получил 75 000 за неделю!" — Арман\n"Уже 3 месяц вывожу!" — Айгуль\n"Лучшая платформа!" — Ерлан\n\n⭐⭐⭐⭐⭐ 4.9/5',
                    messageTextEn: '📸 Payment screenshots:\n\n"Got 75,000 in a week!" — Arman\n"Withdrawing for 3 months!" — Aigul\n"Best platform!" — Yerlan\n\n⭐⭐⭐⭐⭐ 4.9/5',
                    messageTextKk: '📸 Төлем скриншоттары:\n\n"Аптасына 75 000 алдым!" — Арман\n"3 ай бойы шығарып жатырмын!" — Айгүл\n"Ең жақсы платформа!" — Ерлан\n\n⭐⭐⭐⭐⭐ 4.9/5',
                    question: 'Показывают отзывы и скриншоты выплат. Доверяете?',
                    questionEn: 'Showing reviews and payment screenshots. Trust?',
                    questionKk: 'Пікірлер мен төлем скриншоттарын көрсетеді. Сенесіз бе?',
                    content: 'Отзывы и доказательства',
                    options: [
                        {
                            id: 'opt1',
                            text: 'Много положительных отзывов — можно доверять',
                            textEn: 'Many positive reviews — can trust',
                            textKk: 'Оң пікірлер көп — сенуге болады',
                            outcomeType: 'dangerous',
                            explanation: 'Наивно! Скриншоты легко подделать за 5 минут. Отзывы пишут сами мошенники или покупают за копейки.',
                            explanationEn: 'Naive! Screenshots easy to fake in 5 min. Reviews written by scammers or bought cheap.',
                            explanationKk: 'Аңғал! Скриншоттарды 5 минутта жасауға болады.'
                        },
                        {
                            id: 'opt2',
                            text: 'Скриншоты — не доказательство',
                            textEn: 'Screenshots are not proof',
                            textKk: 'Скриншоттар — дәлел емес',
                            outcomeType: 'safe',
                            explanation: 'Правильно! Единственное доказательство — лицензия от регулятора. Проверяйте на сайте АРРФР.',
                            explanationEn: 'Correct! Only proof — license from regulator. Check on AFSA website.',
                            explanationKk: 'Дұрыс! Жалғыз дәлел — реттеуші лицензиясы.'
                        },
                        {
                            id: 'opt3',
                            text: 'Поищу их в интернете',
                            textEn: 'Will search for them online',
                            textKk: 'Интернеттен іздеймін',
                            outcomeType: 'risky',
                            explanation: 'Мало толку! Мошенники создают фейковые сайты с положительными отзывами. Проверяйте только лицензию.',
                            explanationEn: 'Little use! Scammers create fake sites with positive reviews. Only check license.',
                            explanationKk: 'Пайдасы аз! Алаяқтар жалған сайттар жасайды.'
                        }
                    ]
                },
                {
                    id: 'step3',
                    type: 'question',
                    visualType: 'phone',
                    phoneMessageType: 'telegram',
                    senderName: 'Менеджер Алия',
                    senderNameEn: 'Manager Aliya',
                    senderNameKk: 'Менеджер Әлия',
                    senderNumber: '@aliya_invest',
                    profileEmoji: '👩',
                    messageText: '👩 Менеджер Алия:\n\nПоздравляю! Вы заработали 15 000 тенге за 3 дня! 🎉\n\nХотите вывести или реинвестировать?\n\nСовет: вложите ещё 50 000 — заработаете втрое больше!',
                    messageTextEn: '👩 Manager Aliya:\n\nCongrats! You earned 15,000 tenge in 3 days! 🎉\n\nWant to withdraw or reinvest?\n\nAdvice: invest 50,000 more — earn three times more!',
                    messageTextKk: '👩 Менеджер Әлия:\n\nҚұттықтаймын! Сіз 3 күнде 15 000 теңге таптыңыз! 🎉\n\nШығарғыңыз келе ме, әлде қайта салғыңыз?\n\nКеңес: тағы 50 000 салыңыз — үш есе көп табасыз!',
                    question: 'Вам показали "прибыль" и предлагают вложить больше. Что сделаете?',
                    questionEn: 'Showed "profit" and offer to invest more. What will you do?',
                    questionKk: '"Пайда" көрсетіп, көбірек салуды ұсынады. Не істейсіз?',
                    content: 'Предложение реинвестировать',
                    options: [
                        {
                            id: 'opt1',
                            text: 'Работает! Вложу ещё больше',
                            textEn: 'It works! Will invest more',
                            textKk: 'Жұмыс істейді! Тағы көбірек саламын',
                            outcomeType: 'dangerous',
                            explanation: 'Классика пирамиды! Показывают "прибыль", чтобы вы вложили больше. Когда вложите крупную сумму — исчезнут.',
                            explanationEn: 'Classic pyramid! Show "profit" so you invest more. When you invest big — they disappear.',
                            explanationKk: 'Классикалық пирамида! "Пайда" көрсетіп, көбірек салуға итермелейді.'
                        },
                        {
                            id: 'opt2',
                            text: 'Это ловушка — выведу всё и уйду',
                            textEn: 'This is a trap — withdraw all and leave',
                            textKk: 'Бұл тұзақ — бәрін шығарып, кетемін',
                            outcomeType: 'safe',
                            explanation: 'Умно! Но часто вывести деньги уже не дают. Запомните: не участвуйте в схемах с "гарантированным доходом". 🎉 Сценарий пройден!',
                            explanationEn: 'Smart! But often they won\'t let you withdraw. Remember: don\'t join "guaranteed income" schemes. 🎉 Scenario complete!',
                            explanationKk: 'Ақылды! Бірақ көбінесе ақшаны шығаруға мүмкіндік бермейді. 🎉 Сценарий аяқталды!'
                        },
                        {
                            id: 'opt3',
                            text: 'Выведу прибыль, основную сумму оставлю',
                            textEn: 'Withdraw profit, leave main amount',
                            textKk: 'Пайданы шығарамын, негізгі соманы қалдырамын',
                            outcomeType: 'risky',
                            explanation: 'Рискованно! "Прибыль" — цифры на экране. Реальные деньги уже у мошенников. Выводите всё, пока можно.',
                            explanationEn: 'Risky! "Profit" is just numbers on screen. Real money already with scammers.',
                            explanationKk: 'Тәуекелді! "Пайда" — экрандағы сандар ғана.'
                        }
                    ]
                }
            ]
        }
    }
];

// IDs of old scenarios to delete
const OLD_SCENARIO_IDS = [
    'scenario_sms_01',
    'scenario_001_family',
    'scenario_001_sms_phishing',
    'scenario_002_bank',
    'scenario_003_egov',
    'scenario_004_job',
    'scenario_005_post',
];

export const seedScenarios = async () => {
    try {
        console.log('Starting batch seed of scenarios...');
        const batch = writeBatch(db);

        OLD_SCENARIO_IDS.forEach((oldId) => {
            const oldDocRef = doc(db, 'scenarios', oldId);
            batch.delete(oldDocRef);
        });

        SCENARIOS.forEach((scenario) => {
            const docRef = doc(db, 'scenarios', scenario.id);
            batch.set(docRef, scenario);
        });

        await batch.commit();
        console.log('5 scenarios seeded successfully!');
        return true;
    } catch (error) {
        console.error('Error seeding scenarios:', error);
        throw error;
    }
};
