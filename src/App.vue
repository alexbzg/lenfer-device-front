<template>
    <div id="app">
        <img id="logo" src="/static/images/logo_mobile.png">

        <div id="alert" v-if="connected === false">
          <b>Внимание!</b><br/>Нет связи с устройством.<br/>Проверьте соединение или переподключитесь к устройству.
        </div>
        <edit-settings v-if="wlan && datetime && modules"
            :wlan="wlan" :datetime="datetime" :device_hash="device_hash" :modules="modules"
            @datetime-change="datetime_change">
        </edit-settings>

   </div>

</template>

<script>

import './style_mobile.css'

import {get} from './api'
import EditSettings from './components/EditSettings'

export default {
  name: 'App',
  components: {EditSettings},
  data () {
    return {
      connected: null,
      device_hash: null,
      wlan: null,
      modules: {},
      datetime: null,
    }
  },
  async mounted () {
    get('/api/settings/wlan')
      .then(response => {
        this.wlan = response.data
      })
    get('/api/modules')
      .then(response => {
        this.modules = response.data
      })
    get('/api/device_hash')
      .then(response => {
        this.device_hash = response.data
      })
    this.get_datetime()
    setInterval(this.get_datetime, 30000)
  },
  methods: {
    set_datetime (datetime) {
      this.datetime = datetime;
    },
    async get_datetime () {
     get('/api/time')
        .then(response => {
            this.set_datetime(response.data)
            this.connected = true
          })
          .catch(() => {
            this.connected = false
          })
    },
    datetime_change (datetime) {
      this.set_datetime(datetime)
    }
  }
}
</script>

<style>
</style>
