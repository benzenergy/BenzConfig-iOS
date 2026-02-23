// Service Worker
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
        .then(() => console.log('SW зарегистрирован'))
        .catch(err => console.log('SW ошибка:', err));
}

// Индикатор оффлайн
const offlineIndicator = document.getElementById('offlineIndicator');

function updateOnlineStatus() {
    if (navigator.onLine) {
        offlineIndicator.style.display = 'none';
    } else {
        offlineIndicator.style.display = 'block';
    }
}

window.addEventListener('online', updateOnlineStatus);
window.addEventListener('offline', updateOnlineStatus);

// Проверка при загрузке
updateOnlineStatus();

// Расчёт топлива
function calculateFuel(distance, cityRate, roadRate, cityProp = 0.3, roadProp = 0.7) {
    const cityDistance = distance * cityProp;
    const roadDistance = distance * roadProp;
    const cityFuel = cityDistance * cityRate / 100;
    const roadFuel = roadDistance * roadRate / 100;
    const totalFuel = cityFuel + roadFuel;
    return { totalFuel, cityDistance, roadDistance, cityFuel, roadFuel };
}

// Эффект печатной машинки
function typeWriter(element, text, delay = 15) {
    element.innerHTML = '';
    let i = 0;

    function type() {
        if (i < text.length) {
            const char = text.charAt(i);
            element.innerHTML += char === "\n" ? "<br>" : char;
            i++;
            setTimeout(type, delay);
        }
    }
    type();
}

// Защита от двойного тапа
let lastTouchEnd = 0;
document.addEventListener('touchend', function (event) {
    const now = Date.now();
    if (now - lastTouchEnd <= 300) event.preventDefault();
    lastTouchEnd = now;
}, false);

// Начальные данные
const defaultProportions = { city: 30, road: 70 };
let summerProportions = { ...defaultProportions };
let winterProportions = { ...defaultProportions };

// Загружаем нормы расхода из localStorage или ставим по умолчанию
const summerRates = JSON.parse(localStorage.getItem('summerRates')) || { city: 11.5, road: 8.5 };
const winterRates = JSON.parse(localStorage.getItem('winterRates')) || { city: 13.8, road: 10.2 };

// Валидация числовых полей
const numericInputs = document.querySelectorAll('input[type="number"]');

function validateNumberInput(event) {
    const input = event.target;
    const value = input.value;

    // Разрешаем только цифры и максимум одну точку
    if (/^\d*\.?\d*$/.test(value) && value !== '.' && value !== '') {
        input.classList.remove('error');
    } else {
        input.classList.add('error');
    }
}

numericInputs.forEach(input => {
    input.addEventListener('input', validateNumberInput);
});

// Убираем красную обводку при тапе
document.addEventListener('click', function(event) {
    numericInputs.forEach(input => {
        input.classList.remove('error');
    });
});

// Расчёт Летний
function calcSummer() {
    const input = document.getElementById("summerDistance").value;
    const output = document.getElementById("summerResult");

    if (!input || isNaN(input)) {
        typeWriter(output, "Введите значение пробега");
        return;
    }

    const distance = Number(input);
    const cityRate = summerRates.city;
    const roadRate = summerRates.road;
    const cityProp = summerProportions.city / 100;
    const roadProp = summerProportions.road / 100;

    const { totalFuel, cityDistance, roadDistance } = calculateFuel(distance, cityRate, roadRate, cityProp, roadProp);

    const text = `Общий расход ${totalFuel.toFixed(2)} л

Детализация
Пробег по городу ${cityDistance.toFixed(2)} км
Пробег по трассе ${roadDistance.toFixed(2)} км

Нормы расхода
Город ${cityRate} л на 100 км
Трасса ${roadRate} л на 100 км

Пропорции
Городской режим ${Math.round(cityProp * 100)} %
Трассовый режим ${Math.round(roadProp * 100)} %`;

    typeWriter(output, text, 15);
}

// Расчёт Зимний
function calcWinter() {
    const input = document.getElementById("winterDistance").value;
    const output = document.getElementById("winterResult");

    if (!input || isNaN(input)) {
        typeWriter(output, "Введите значение пробега");
        return;
    }

    const distance = Number(input);
    const cityRate = winterRates.city;
    const roadRate = winterRates.road;
    const cityProp = winterProportions.city / 100;
    const roadProp = winterProportions.road / 100;

    const { totalFuel, cityDistance, roadDistance } = calculateFuel(distance, cityRate, roadRate, cityProp, roadProp);

    const text = `Общий расход ${totalFuel.toFixed(2)} л

Детализация
Пробег по городу ${cityDistance.toFixed(2)} км
Пробег по трассе ${roadDistance.toFixed(2)} км

Нормы расхода
Город ${cityRate} л на 100 км
Трасса ${roadRate} л на 100 км

Пропорции
Городской режим ${Math.round(cityProp * 100)} %
Трассовый режим ${Math.round(roadProp * 100)} %`;

    typeWriter(output, text, 15);
}

// Создание кнопки Настройки под кнопкой Рассчитать
function createSettingsButton(label, calcButton, type) {
    const btn = document.createElement('button');
    btn.className = 'settings-button';
    btn.innerText = label;
    btn.style.marginTop = '8px';
    btn.addEventListener('click', () => openSettingsModal(type));
    calcButton.insertAdjacentElement('afterend', btn);
}

const summerCalcBtn = document.querySelector('#summerDistance').closest('.block').querySelector('button');
const winterCalcBtn = document.querySelector('#winterDistance').closest('.block').querySelector('button');

createSettingsButton('Настройки', summerCalcBtn, 'summer');
createSettingsButton('Настройки', winterCalcBtn, 'winter');

// Модальное окно Настройки
function openSettingsModal(type) {
    const modal = document.createElement('div');
    modal.className = 'modal-background';

    const container = document.createElement('div');
    container.className = 'modal-container';
    container.style.maxWidth = '320px';

    // Заголовок модалки
    const title = document.createElement('div');
    title.innerText = type === 'summer' ? 'Летний' : 'Зимний';
    title.style.fontFamily = '"Gilroy", sans-serif';
    title.style.fontWeight = '400';
    title.style.fontSize = '16px';
    title.style.marginBottom = '12px';
    title.style.textAlign = 'left';
    container.appendChild(title);

    const rates = type === 'summer' ? summerRates : winterRates;
    const proportions = type === 'summer' ? summerProportions : winterProportions;

    // Функции создания меток и полей
    function createLabel(text) {
        const lbl = document.createElement('label');
        lbl.innerText = text;
        lbl.style.display = 'block';
        lbl.style.marginTop = '8px';
        lbl.style.fontFamily = 'Gilroy, sans-serif';
        lbl.style.fontSize = '12px';
        lbl.style.color = '#B2B2B2';
        lbl.style.textAlign = 'left';
        return lbl;
    }

    function createInputBlock(labelText, value, propName) {
        const wrapper = document.createElement('div');
        wrapper.style.display = 'flex';
        wrapper.style.flexDirection = 'column';
        wrapper.style.alignItems = 'flex-start';
        wrapper.style.width = '100%';

        const lbl = createLabel(labelText);
        wrapper.appendChild(lbl);

        const input = document.createElement('input');
        input.type = 'number';
        input.value = value;
        input.dataset.prop = propName;
        input.style.width = '100%';
        input.style.marginTop = '4px';
        input.style.padding = '8px';
        input.style.borderRadius = '8px';
        input.style.border = '1px solid #333333';
        input.style.backgroundColor = '#1F1F1F';
        input.style.color = '#B2B2B2';
        input.style.fontFamily = 'Gilroy, sans-serif';
        input.addEventListener('input', e => {
            let val = parseInt(e.target.value) || 0;
            if (val > 100) val = 100;
            e.target.value = val;

            if (e.target.dataset.prop === 'city') {
                const roadInput = wrapper.parentNode.querySelector('input[data-prop="road"]');
                roadInput.value = 100 - val;
            } else if (e.target.dataset.prop === 'road') {
                const cityInput = wrapper.parentNode.querySelector('input[data-prop="city"]');
                cityInput.value = 100 - val;
            }
        });

        wrapper.appendChild(input);
        return wrapper;
    }

    // Добавляем поля норм расхода
    container.appendChild(createLabel('Нормы расхода'));
    container.appendChild(createInputBlock('Город', rates.city, 'cityRate'));
    container.appendChild(createInputBlock('Трасса', rates.road, 'roadRate'));

    // Добавляем поля пропорций
    container.appendChild(createLabel('Пропорции'));
    container.appendChild(createInputBlock('Город', proportions.city, 'city'));
    container.appendChild(createInputBlock('Трасса', proportions.road, 'road'));

    // Кнопки закрытия и сохранения
    const btnClose = document.createElement('button');
    btnClose.innerText = 'Закрыть';
    btnClose.className = 'modal-close';
    btnClose.addEventListener('click', () => document.body.removeChild(modal));

    const btnSave = document.createElement('button');
    btnSave.innerText = 'Сохранить';
    btnSave.className = 'modal-close';
    btnSave.style.marginLeft = '8px';
    btnSave.addEventListener('click', () => {

        // Сохраняем нормы расхода
        rates.city = parseFloat(container.querySelector('input[data-prop="cityRate"]').value) || rates.city;
        rates.road = parseFloat(container.querySelector('input[data-prop="roadRate"]').value) || rates.road;

        if (type === 'summer') {
            localStorage.setItem('summerRates', JSON.stringify(rates));
            summerProportions.city = parseFloat(container.querySelector('input[data-prop="city"]').value) || defaultProportions.city;
            summerProportions.road = parseFloat(container.querySelector('input[data-prop="road"]').value) || defaultProportions.road;
            document.getElementById('inputCityProp').value = summerProportions.city;
            document.getElementById('inputRoadProp').value = summerProportions.road;
        } else {
            localStorage.setItem('winterRates', JSON.stringify(rates));
            winterProportions.city = parseFloat(container.querySelector('input[data-prop="city"]').value) || defaultProportions.city;
            winterProportions.road = parseFloat(container.querySelector('input[data-prop="road"]').value) || defaultProportions.road;
            document.getElementById('inputCityProp').value = winterProportions.city;
            document.getElementById('inputRoadProp').value = winterProportions.road;
        }

        // Закрываем модальное окно
        if (modal && modal.parentNode) modal.parentNode.removeChild(modal);
    });

    const btnWrapper = document.createElement('div');
    btnWrapper.style.display = 'flex';
    btnWrapper.style.justifyContent = 'flex-end';
    btnWrapper.style.marginTop = '12px';
    btnWrapper.appendChild(btnClose);
    btnWrapper.appendChild(btnSave);

    container.appendChild(btnWrapper);
    modal.appendChild(container);
    document.body.appendChild(modal);
}

// Модальное окно О программе
document.getElementById('btnAbout').addEventListener('click', function() { 
    const modal = document.createElement('div');
    modal.className = 'modal-background';

    const container = document.createElement('div');
    container.className = 'modal-container';

    // Левая часть: логотип
    const leftBlock = document.createElement('div');
    leftBlock.className = 'about-left';
    const img = document.createElement('img');
    img.src = 'res/logo_about.svg';
    img.className = 'modal-logo';
    leftBlock.appendChild(img);

    // Правая часть: текст
    const rightBlock = document.createElement('div');
    rightBlock.className = 'about-right';

    // Заголовок
    const title = document.createElement('div');
    title.innerText = 'BenzConfig 2.5';
    title.className = 'about-title';
    rightBlock.appendChild(title);

    // Лицензия
    const license = document.createElement('div');
    license.innerHTML = 'Лицензия: <a href="https://www.gnu.org/licenses/gpl-3.0.html" target="_blank">GNU GPL v3.0</a>';
    license.className = 'about-text';
    rightBlock.appendChild(license);

    // Материалы
    const materials = document.createElement('div');
    materials.innerHTML = 'Материалы: <a href="https://www.flaticon.com/free-icon/sign_2737912" target="_blank">flaticon.com</a>';
    materials.className = 'about-text';
    rightBlock.appendChild(materials);

    // Исходник
    const source = document.createElement('div');
    source.innerHTML = 'Исходник: <a href="https://github.com/benzenergy/BenzConfig-PWA" target="_blank">github.com</a>';
    source.className = 'about-text';
    rightBlock.appendChild(source);

    // Копирайт
    const copyright = document.createElement('div');
    copyright.innerText = '© 2025 benzenergy';
    copyright.className = 'about-copyright';
    rightBlock.appendChild(copyright);

    // Объединяем левый и правый блок
    const content = document.createElement('div');
    content.className = 'about-content';
    content.appendChild(leftBlock);
    content.appendChild(rightBlock);

    container.appendChild(content);

    // Кнопка закрытия
    const closeBtn = document.createElement('button');
    closeBtn.innerText = "Закрыть";
    closeBtn.className = 'modal-close';
    closeBtn.addEventListener('click', () => document.body.removeChild(modal));
    container.appendChild(closeBtn);

    modal.appendChild(container);
    document.body.appendChild(modal);
});
