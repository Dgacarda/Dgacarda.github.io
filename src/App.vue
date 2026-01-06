<template>
    <div class="page">
        <header class="header">
            <div>
                <h1 class="title">До долгожданной встречи 12 января 12:15 осталось:</h1>
            </div>
        </header>

        <section class="card">
            <div class="countdown">
                <div class="box">
                    <div class="num">{{ timeLeft.days }}</div>
                    <div class="lbl">{{ labels.days }}</div>
                </div>
                <div class="box">
                    <div class="num">{{ timeLeft.hours }}</div>
                    <div class="lbl">{{ labels.hours }}</div>
                </div>
                <div class="box">
                    <div class="num">{{ timeLeft.minutes }}</div>
                    <div class="lbl">{{ labels.minutes }}</div>
                </div>
                <div class="box">
                    <div class="num">{{ timeLeft.seconds }}</div>
                    <div class="lbl">{{ labels.seconds }}</div>
                </div>
            </div>

            <div v-if="isDone" class="done">
                🎉 Время пришло!
            </div>
        </section>

        <button class="btn" @click="showCompliment">
            Внезапный комплиментик ✨
        </button>

        <section class="card">
            <button class="toggle" @click="isTodoOpen = !isTodoOpen">
                <span>Список дел</span>
                <span class="chev" :class="{ open: isTodoOpen }">▾</span>
            </button>

            <div v-show="isTodoOpen" class="todo">
                <label v-for="t in todos" :key="t.id" class="todo-item">
                    <input type="checkbox" :checked="checkedSet.has(t.id)" @change="toggleTodo(t.id)" />
                    <span :class="{ checked: checkedSet.has(t.id) }">{{ t.text }}</span>
                </label>
            </div>
        </section>

        <Toast
            :show="toast.show"
            :title="toast.title"
            :message="toast.message"
            @close="toast.show = false"
        />
    </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import Toast from './components/Toast.vue'

const targetMs = new Date('2026-01-12T12:15:00+05:00').getTime()

const timeLeft = reactive({
    days: '0',
    hours: '00',
    minutes: '00',
    seconds: '00',
})

const isDone = computed(() => Date.now() >= targetMs)

let timerId: number | null = null

function pad2(n: number) {
    return String(n).padStart(2, '0')
}

function pluralRu(n: number, one: string, few: string, many: string) {
    const abs = Math.abs(n) % 100
    const last = abs % 10
    if (abs >= 11 && abs <= 19) return many
    if (last === 1) return one
    if (last >= 2 && last <= 4) return few
    return many
}

const labels = computed(() => {
    const d = Number(timeLeft.days)
    const h = Number(timeLeft.hours)
    const m = Number(timeLeft.minutes)
    const s = Number(timeLeft.seconds)

    return {
        days: pluralRu(d, 'день', 'дня', 'дней'),
        hours: pluralRu(h, 'час', 'часа', 'часов'),
        minutes: pluralRu(m, 'минута', 'минуты', 'минут'),
        seconds: pluralRu(s, 'секунда', 'секунды', 'секунд'),
    }
})


function updateCountdown() {
    const now = Date.now()
    const diff = Math.max(0, targetMs - now)

    const totalSeconds = Math.floor(diff / 1000)
    const days = Math.floor(totalSeconds / (3600 * 24))
    const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60

    timeLeft.days = String(days)
    timeLeft.hours = pad2(hours)
    timeLeft.minutes = pad2(minutes)
    timeLeft.seconds = pad2(seconds)
}

onMounted(() => {
    updateCountdown()
    timerId = window.setInterval(updateCountdown, 1000)
})

onBeforeUnmount(() => {
    if (timerId) window.clearInterval(timerId)
})

const compliments = [
    'Лиза самая красивая 💗',
    'Ты делаешь мой день ярче 💗',
    'У тебя супер реснички 💗',
    'Сегодня ты снова красотка 💗',
    'Обожаю когда ты смешно рассказываешь про учеников 💗',
    'Люблю внезапные дебы на 10 голосовых 💗',
    'Я от тебя безума 💗',
    'Я скучаю 💗',
    'Ну почему же ты такая классная 💗',
]

const toast = reactive({
    show: false,
    title: 'Комплимент!',
    message: '',
})

function showCompliment() {
    const msg = compliments[Math.floor(Math.random() * compliments.length)]
    toast.message = String(msg)
    toast.show = true
}

type Todo = { id: string; text: string }

const todos = ref<Todo[]>([
    { id: 't1', text: 'Каток' },
    { id: 't2', text: 'Апы (альпаки!!!)' },
    { id: 't3', text: 'Чебурашка' },
    { id: 't4', text: 'Музей городской какой-то (галерея главный проспект!!!)' },
    { id: 't5', text: 'Стренджер сингс' },
    { id: 't6', text: 'гончарка' },
    { id: 't7', text: 'лепка мантов' },
    { id: 't8', text: 'ужин от Лизы' },
    { id: 't9', text: 'Сандуны' },
    { id: 't10', text: 'Совместный отпуск' },
    { id: 't11', text: 'Бар коллектив' },
    { id: 't12', text: 'Загородный домик на выхи' },
])

const isTodoOpen = ref(true)
const storageKey = 'countdown-app.checkedTodos'

const checkedSet = ref<Set<string>>(new Set())

function loadChecked() {
    try {
        const raw = localStorage.getItem(storageKey)
        if (!raw) return new Set<string>()
        const arr = JSON.parse(raw) as string[]
        return new Set(arr)
    } catch {
        return new Set<string>()
    }
}

function saveChecked() {
    localStorage.setItem(storageKey, JSON.stringify(Array.from(checkedSet.value)))
}

function toggleTodo(id: string) {
    const s = checkedSet.value
    if (s.has(id)) s.delete(id)
    else s.add(id)
    checkedSet.value = new Set(s)
    saveChecked()
}

onMounted(() => {
    checkedSet.value = loadChecked()
})
</script>
