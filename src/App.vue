<template>
  <transition name="fade" mode="out-in">
    <AuthComponent v-if="!isAuth" @make-auth="isAuth = true" />
    <MainComponent v-else/>
  </transition>
</template>

<script>
import {onMounted, ref} from 'vue'
import AuthComponent from './components/AuthComponent.vue'
import MainComponent from './components/MainComponent.vue'

export default {
  name: 'App',
  components: {
    AuthComponent,
    MainComponent,
  },
  setup() {
    const isAuth = ref(false)

    onMounted(() => {
      isAuth.value = localStorage.getItem('isAuth')
    })

    return {
      isAuth
    }
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
