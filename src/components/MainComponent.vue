<template>
    <div>
        <h1>
            До отпуска осталось: {{ timeDifference.hours }} {{ getHoursText(timeDifference.hours) }},
            {{ timeDifference.minutes }} {{ getMinutesText(timeDifference.minutes) }},
            {{ timeDifference.seconds }} {{ getSecondsText(timeDifference.seconds) }}
        </h1>
    </div>
</template>

<script>
import { ref, onMounted } from 'vue';

export default {
  setup() {
    const targetTime = ref('2023-06-15T18:00:00'); // Заданное время
    const timeDifference = ref({ hours: 0, minutes: 0, seconds: 0 });

    const getTimeDifference = (targetTime) => {
      const currentTime = new Date();
      const targetDate = new Date(targetTime);

      const timeDiff = targetDate - currentTime;

      // Вычисляем разницу в часах, минутах и секундах
      const hours = Math.floor(timeDiff / (1000 * 60 * 60));
      const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

      // Обновляем реактивную переменную timeDifference
      timeDifference.value = { hours, minutes, seconds };
    };

    // Функции для определения склонения слов
    const getHoursText = (hours) => {
      if (hours === 1) {
        return 'час';
      } else if (hours >= 2 && hours <= 4) {
        return 'часа';
      } else {
        return 'часов';
      }
    };

    const getMinutesText = (minutes) => {
      if (minutes === 1) {
        return 'минута';
      } else if (minutes >= 2 && minutes <= 4) {
        return 'минуты';
      } else {
        return 'минут';
      }
    };

    const getSecondsText = (seconds) => {
      if (seconds === 1) {
        return 'секунда';
      } else if (seconds >= 2 && seconds <= 4) {
        return 'секунды';
      } else {
        return 'секунд';
      }
    };

    // Обновляем разницу времени при монтировании компонента
    onMounted(() => {
      getTimeDifference(targetTime.value);

      // Обновляем разницу времени каждую секунду
      setInterval(() => {
        getTimeDifference(targetTime.value);
      }, 1000);
    });

    return {
      targetTime,
      timeDifference,
      getHoursText,
      getMinutesText,
      getSecondsText
    };
  }
};
</script>
