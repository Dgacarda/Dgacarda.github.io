<template>
    <div class="auth-form">
        <h3>ФИО самой прекрасной девушки</h3>
        <input class="input-auth" v-model="passData" type="text" placeholder="ФИО в формате: ЛАВ">
        <button @click="onAuth">Войти</button>
    </div>
</template>

<script>
import {ref} from 'vue'
const AUTH_DATA = 'РАА'
export default {
  setup(_, {emit}) {
    const passData = ref('')

    const onAuth = () => {
      if (passData.value === AUTH_DATA) {
        localStorage.setItem('isAuth', true)
        emit('make-auth')
      }
    }

    return {
      passData,
      onAuth
    };
  }
};
</script>

<style scoped>
.auth-form {
    display: flex;
    flex-direction: column;
    width: 70%;
    margin: 0 auto;
}

.input-auth {

}
</style>
