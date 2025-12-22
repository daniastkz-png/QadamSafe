
import json

# Data for all languages
translations = {
    "ru": {
        "demo": {
            "call": "Входящий звонок",
            "riskyFeedback": "Так часто начинаются реальные случаи мошенничества",
            "cautiousFeedback": "Вы выбрали осторожную стратегию",
            "nextScenario": "Следующий сценарий",
            "tryReal": "Реальные тренировки",
            "hint": "Сценарий основан на реальных схемах мошенничества в РК.\nТексты адаптированы.",
            "scenario1": {
                "contact": "Неизвестный номер",
                "message": "Мам, привет. Я телефон потерял, это номер друга.\nСкинь срочно 15 000 ₸ на Каспи, очень надо, потом объясню.\nНомер: +7 705 XXX XX XX",
                "question": "Что сделаете?",
                "choice1": "Сразу переведу — вдруг беда случилась",
                "choice2": "Попрошу записать голосовое сообщение",
                "choice3": "Позвоню на его старый номер"
            },
            "scenario2": {
                "contact": "Служба безопасности",
                "message": "Уважаемый клиент!\nЗафиксирована попытка перевода на сумму 150 000₸.\nЕсли это не Вы, срочно сообщите код из SMS для отмены операции.",
                "question": "Ваши действия?",
                "choice1": "Назову код — нужно спасать деньги",
                "choice2": "Сброшу и проверю в приложении банка",
                "choice3": "Перезвоню на официальный номер банка"
            },
            "scenario3": {
                "contact": "1414 (Egov)",
                "message": "Вам назначена социальная выплата 50 000₸.\nДля получения перейдите по ссылке: egov-portal-kz.com/payment\nСрок действия ссылки 24 часа.",
                "question": "Как поступите?",
                "choice1": "Перейду и введу данные карты",
                "choice2": "Зайду на официальный сайт egov.kz",
                "choice3": "Позвоню в ЦОН (1414)"
            },
            "scenario4": {
                "contact": "HR Менеджер",
                "message": "Здравствуйте! Ищем сотрудников на удаленку.\nЗадача: ставить лайки на товары.\nОплата: от 25 000₸ в день.\nИнтересно?",
                "question": "Что ответите?",
                "choice1": "Да, интересно! (Легкие деньги)",
                "choice2": "Спрошу название компании и договор",
                "choice3": "Заблокирую контакт"
            },
            "scenario5": {
                "contact": "KazPost Доставка",
                "message": "Ваша посылка прибыла на склад, но адрес указан неверно.\nДля доставки обновите адрес и оплатите пошлину 450₸ по ссылке:\nkazpost-delivery-track.com",
                "question": "Ваше решение?",
                "choice1": "Перейду и оплачу, сумма маленькая",
                "choice2": "Проверю трек-номер на post.kz",
                "choice3": "Позвоню на горячую линию почты"
            }
        }
    },
    "en": {
        "demo": {
            "call": "Incoming Call",
            "riskyFeedback": "This is exactly how scammers exploit emotions",
            "cautiousFeedback": "Great choice! Always verify the source",
            "nextScenario": "Next scenario",
            "tryReal": "Try Real Scenarios",
            "hint": "Scenarios based on real fraud cases in Kazakhstan.\nTexts adapted for education.",
            "scenario1": {
                "contact": "Unknown Number",
                "message": "Mom, hi. I lost my phone, using a friend's number.\nPlease send 15,000 ₸ to Kaspi ASAP, it's urgent, I'll explain later.\nNumber: +7 705 XXX XX XX",
                "question": "What do you do?",
                "choice1": "Transfer immediately — it might be an emergency",
                "choice2": "Ask for a voice message",
                "choice3": "Call his old number"
            },
            "scenario2": {
                "contact": "Security Service",
                "message": "Dear client!\nAn attempt to transfer 150,000₸ was detected.\nIf this wasn't you, strictly provide the SMS code to cancel the operation.",
                "question": "Your action?",
                "choice1": "Give the code — need to save the money",
                "choice2": "Hang up and check the banking app",
                "choice3": "Call the official bank number"
            },
            "scenario3": {
                "contact": "1414 (Egov)",
                "message": "You have been approved for a social payment of 50,000₸.\nTo receive it, follow the link: egov-portal-kz.com/payment\nLink valid for 24 hours.",
                "question": "How do you react?",
                "choice1": "Click and enter card details",
                "choice2": "Check on the official egov.kz website",
                "choice3": "Call the service center (1414)"
            },
            "scenario4": {
                "contact": "HR Manager",
                "message": "Hello! Looking for remote employees.\nTask: like products online.\nPay: from 25,000₸ per day.\nInterested?",
                "question": "Your reply?",
                "choice1": "Yes, interested! (Easy money)",
                "choice2": "Ask for company name and contract",
                "choice3": "Block the contact"
            },
            "scenario5": {
                "contact": "KazPost Delivery",
                "message": "Your package arrived, but the address is incorrect.\nTo deliver, update address and pay 450₸ fee via link:\nkazpost-delivery-track.com",
                "question": "What will you do?",
                "choice1": "Pay it, the amount is small",
                "choice2": "Check tracking number on post.kz",
                "choice3": "Call the post office hotline"
            }
        }
    },
    "kk": {
        "demo": {
            "call": "Кіріс қоңырау",
            "riskyFeedback": "Алаяқтар дәл осылай эмоцияға әсер етеді",
            "cautiousFeedback": "Тамаша шешім! Әрқашан ақпаратты тексеріңіз",
            "nextScenario": "Келесі сценарий",
            "tryReal": "Шынайы сценарийлер",
            "hint": "Сценарий ҚР-дағы нақты алаяқтық жағдайларына негізделген.\nМәтіндер бейімделген.",
            "scenario1": {
                "contact": "Белгісіз нөмір",
                "message": "Мама, сәлем. Телефонымды жоғалтып алдым, досымның нөмірі.\nМаған шұғыл 15 000 ₸ Kaspi-ге жіберші, өте керек, кейін түсіндіремін.\nНөмір: +7 705 XXX XX XX",
                "question": "Не істейсіз?",
                "choice1": "Бірден аударамын — жағдай қиын болуы мүмкін",
                "choice2": "Дауыстық хабарлама жазуын сұраймын",
                "choice3": "Ескі нөміріне қоңырау шаламын"
            },
            "scenario2": {
                "contact": "Қауіпсіздік қызметі",
                "message": "Құрметті клиент!\nСіздің шотыңыздан 150 000₸ аудару әрекеті тіркелді.\nЕгер бұл сіз болмасаңыз, операцияны тоқтату үшін SMS кодын айтыңыз.",
                "question": "Сіздің әрекетіңіз?",
                "choice1": "Кодты айтамын — ақшаны сақтау керек",
                "choice2": "Тұтқаны қойып, банк қосымшасын тексеремін",
                "choice3": "Ресми банк нөміріне хабарласамын"
            },
            "scenario3": {
                "contact": "1414 (Egov)",
                "message": "Сізге 50 000₸ әлеуметтік төлем тағайындалды.\nАлу үшін сілтемеге өтіңіз: egov-portal-kz.com/payment\nСілтеме 24 сағат жарамды.",
                "question": "Қалай жасайсыз?",
                "choice1": "Сілтемемен өтіп, карта мәліметтерін енгіземін",
                "choice2": "Ресми egov.kz сайтынан тексеремін",
                "choice3": "ХҚКО-ға (1414) хабарласамын"
            },
            "scenario4": {
                "contact": "HR Менеджер",
                "message": "Сәлеметсіз бе! Қашықтан жұмыс ұсынамыз.\nТапсырма: тауарларға лайк басу.\nТөлем: күніне 25 000₸ бастап.\nҚызық па?",
                "question": "Не жауап бересіз?",
                "choice1": "Иә, қызық! (Оңай ақша)",
                "choice2": "Компания атауын және келісімшартты сұраймын",
                "choice3": "Бұғаттаймын"
            },
            "scenario5": {
                "contact": "KazPost Жеткізу",
                "message": "Сәлемдемеңіз келді, бірақ мекенжай қате көрсетілген.\nЖеткізу үшін мекенжайды жаңартып, 450₸ төлем жасаңыз:\nkazpost-delivery-track.com",
                "question": "Не істейсіз?",
                "choice1": "Төлей саламын, сома аз ғой",
                "choice2": "post.kz сайтынан трек-нөмірді тексеремін",
                "choice3": "Поштаның байланыс орталығына хабарласамын"
            }
        }
    }
}

files = {
    "ru": "frontend/src/i18n/locales/ru.json",
    "en": "frontend/src/i18n/locales/en.json",
    "kk": "frontend/src/i18n/locales/kk.json"
}

for lang, path in files.items():
    try:
        with open(path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # Merge new demo data
        if 'demo' not in data:
            data['demo'] = {}
            
        data['demo'] = translations[lang]['demo']
        
        with open(path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=4)
        print(f"✅ {lang.upper()} translations updated successfully")
    except Exception as e:
        print(f"❌ Error updating {lang.upper()}: {e}")
