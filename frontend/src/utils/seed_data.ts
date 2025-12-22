
import { db } from '../services/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { Scenario } from '../types';

export const SOC_SCENARIO_1: Scenario = {
    id: 'scenario_sms_01',
    title: 'Осторожно: Фишинговые СМС',
    titleEn: 'Caution: Phishing SMS',
    titleKk: 'Сақ болыңыз: Фишингтік SMS',
    description: 'Учимся распознавать фальшивые сообщения от банков и розыгрышей. Реальные примеры.',
    descriptionEn: 'Learn to spot fake messages from banks and lotteries. Real examples.',
    descriptionKk: 'Банктер мен ұтыс ойындарынан келетін жалған хабарламаларды тануды үйренеміз.',
    type: 'SMS_PHISHING',
    difficulty: 'BEGINNER',
    requiredTier: 'FREE',
    pointsReward: 100,
    order: 1,
    isLegitimate: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    content: {
        steps: [
            {
                id: 'step_intro',
                type: 'information',
                content: 'Тебе приходит SMS с неизвестного номера:\n\n"Уважаемый клиент, по вашей карте зафиксирована подозрительная активность. Срочно подтвердите данные по ссылке."\n\nСсылка выглядит как сайт банка.',
                nextStepId: 'step_q1'
            },
            {
                id: 'step_q1',
                type: 'question',
                content: 'Что ты сделаешь в первую очередь?',
                options: [
                    {
                        id: 'opt_q1_1',
                        text: 'Перейду по ссылке, чтобы быстрее разобраться',
                        outcomeType: 'dangerous',
                        explanation: 'Опасно! Переход по неизвестным ссылкам может привести на фишинговый сайт.',
                        nextStepId: 'step_q2'
                    },
                    {
                        id: 'opt_q1_2',
                        text: 'Проверю номер отправителя и домен ссылки',
                        outcomeType: 'safe',
                        explanation: 'Правильно! Всегда сверяйте отправителя и адрес сайта с официальными данными банка.',
                        nextStepId: 'step_q2'
                    },
                    {
                        id: 'opt_q1_3',
                        text: 'Проигнорирую сообщение полностью',
                        outcomeType: 'risky',
                        explanation: 'Безопасно, но лучше проверить информацию через официальное приложение банка, вдруг это правда.',
                        nextStepId: 'step_q2'
                    }
                ]
            },
            {
                id: 'step_q2',
                type: 'question',
                content: 'Через несколько минут приходит ещё одно SMS:\n\n"Поздравляем! Вы выиграли 500 000 ₸. Для получения приза перейдите по ссылке."',
                options: [
                    {
                        id: 'opt_q2_1',
                        text: 'Перейду по ссылке — вдруг правда выиграл',
                        outcomeType: 'dangerous',
                        explanation: 'Опасно! Бесплатный сыр только в мышеловке. Это уловка, чтобы заманить вас на сайт.',
                        nextStepId: 'step_q3'
                    },
                    {
                        id: 'opt_q2_2',
                        text: 'Проверю информацию о розыгрыше в официальных источниках',
                        outcomeType: 'safe',
                        explanation: 'Отлично! Если розыгрыш реальный, информация о нем будет на официальном сайте компании.',
                        nextStepId: 'step_q3'
                    },
                    {
                        id: 'opt_q2_3',
                        text: 'Отправлю сообщение друзьям, чтобы спросить их мнение',
                        outcomeType: 'risky',
                        explanation: 'Рискованно. Друзья могут тоже ошибиться, а вы потратите время и распространите спам.',
                        nextStepId: 'step_q3'
                    }
                ]
            },
            {
                id: 'step_q3',
                type: 'question',
                content: 'Ссылка ведет на сайт, визуально похожий на сайт банка.',
                options: [
                    {
                        id: 'opt_q3_1',
                        text: 'Введу данные, если сайт выглядит знакомо',
                        outcomeType: 'dangerous',
                        explanation: 'Никогда не вводите данные, не убедившись на 100% в подлинности сайта (адресная строка).',
                        nextStepId: 'step_outro'
                    },
                    {
                        id: 'opt_q3_2',
                        text: 'Проверю адрес сайта и наличие HTTPS, затем закрою страницу',
                        outcomeType: 'safe',
                        explanation: 'Верно! Мошенники часто подделывают дизайн, но не могут подделать официальный домен.',
                        nextStepId: 'step_outro'
                    },
                    {
                        id: 'opt_q3_3',
                        text: 'Позвоню по номеру, указанному на сайте',
                        outcomeType: 'dangerous',
                        explanation: 'На поддельном сайте указаны номера мошенников. Звоните только на номер с обратной стороны карты.',
                        nextStepId: 'step_outro'
                    }
                ]
            },
            {
                id: 'step_outro',
                type: 'information',
                content: 'Поздравляем! Ты прошел сценарий.\n\nЗапомни: банки и лотереи никогда не присылают ссылки с требованием срочно ввести данные. Любая срочность — признак мошенничества.',
                // End of scenario (no nextStepId)
            }
        ]
    }
};

export const seedScenarios = async () => {
    try {
        console.log('Starting seed...');
        await setDoc(doc(db, 'scenarios', SOC_SCENARIO_1.id), SOC_SCENARIO_1);
        console.log('Scenario 1 seeded successfully!');
        alert('Scenario 1 added!');
    } catch (error) {
        console.error('Error seeding scenarios:', error);
        alert('Error seeding: ' + error);
    }
};
