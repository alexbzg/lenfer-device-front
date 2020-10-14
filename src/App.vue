<template>
    <div id="app">
        <div id="title">
            <img id="setup_link" src="/static/images/icon_setup.png" @click="edit_settings = !edit_settings">
            <span v-if="wlan">{{wlan.name}}</span><br/><span id="version">v.1.0</span>
        </div>

        <edit-settings v-if="edit_settings" :wlan="wlan" :datetime="datetime">
        </edit-settings>

        <div id="top_info_block" v-show="!edit_settings">
            <div id="current_time">
                <span class="date">{{date_text}}</span>&nbsp; 
                <span class="time">{{time_text}}</span>
            </div>
        </div>
    </div>

</template>

<script>

import './style_mobile.css'

import {get} from './api'
import {zeropad, MONTHS_GENITIVE} from './utils'
import EditSettings from './components/EditSettings'

export default {
  name: 'App',
  components: {EditSettings},
  data () {
    return {
      edit_settings: false,
      wlan: null,
      datetime: null,
      date_text: null,
      time_text: null
    }
  },
  async mounted () {
    get('/api/settings/wlan')
      .then(response => {
        this.wlan = response.data
      })
    this.get_datetime()
    setInterval(this.get_datetime, 30000)
  },
  methods: {
    set_datetime (datetime) {
      this.datetime = datetime;
      this.date_text = `${this.datetime[2]} ${MONTHS_GENITIVE[this.datetime[1]]} ${this.datetime[0]}`;
      this.time_text = `${zeropad(this.datetime[4])}:${zeropad(this.datetime[5])}`;
    },
    async get_datetime () {
     get('/api/time')
        .then(response => {
            this.set_datetime(response.data)
        })
    }
  }
}
</script>

<style>
</style>
