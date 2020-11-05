<template>
	<div id="setup_block">
		<input type="text" name="" v-model="edit_wlan.name"><br/>
		название устройства и его WiFi-точки<br/>
		<input type="text" name="" v-model="edit_wlan.ap_key"><br/>
		пароль доступа к устройству<br/>
		<div class="note">Если вы измените название/пароль устройства, после сохранения настроек устройство перезагрузится, и вам нужно будет заново подключиться к WiFi-точке устройства. Уже с новым именем или паролем.</div>
		<br/>
		<br/>
		<br/>
		<h3>Подключение к WiFi сети</h3>
		<select type="text" name="" v-model="edit_wlan.ssid">
            <template v-if="wlan_scan">
                <option v-for="(item, idx) in wlan_scan" :key="idx" 
                    :value="item">{{item}}</option>
            </template>
			<option value="-">Не соединяться</option>
		</select>
		<br/>
		название WiFi сети<br/>
		<input type="text" name="" v-model="edit_wlan.key"><br/>
		пароль<br/>
		<br/>
		<br/>
		<br/>
		<!--
		<h3>Подключение к ClimatController.ru</h3>
		<input type="text" name="" value=""><br/>
		логин<br/>
		<input type="text" name="" value=""><br/>
		пароль
		-->
		<div id="time_setup">
			<h3>Установка даты и времени</h3>
			<select v-model="edit_datetime[2]">
				<option v-for="item in zeropad_range(31)" :key="item" :value="item">{{item}}</option>
			</select>			
			<select v-model="edit_datetime[1]">
				<option value="01">январь</option>
				<option value="02">февраль</option>
				<option value="03">март</option>
				<option value="04">апрель</option>
				<option value="05">май</option>
				<option value="06">июнь</option>
				<option value="07">июль</option>
				<option value="08">август</option>
				<option value="09">сентябрь</option>
				<option value="10">октябрь</option>
				<option value="11">ноябрь</option>
				<option value="12">декабрь</option>
			</select>
			<select v-model="edit_datetime[0]">
				<option v-for="item in 20" :key="item" :value="item + 2019">{{item + 2019}}</option>
			</select>			
			<br/>
			<select v-model="edit_datetime[4]">
				<option v-for="item in zeropad_range(24)" :key="item" :value="item">{{item}}</option>
			</select> :
			<select v-model="edit_datetime[5]">
				<option v-for="item in zeropad_range(60)" :key="item" :value="item">{{item}}</option>
			</select>
		</div>

		<button id="ok_setup_window" @click="post()">Сохранить настройки</button>
	</div>

</template>

<script>

import {get, dataPost} from '../api'
import {zeropad} from '../utils'

const DATETIME_LENGTH = 6

export default {
  name: 'EditSettings',
  props: ['wlan', 'datetime'],
  components: {},
  data () {
    return {
      edit_wlan: JSON.parse(JSON.stringify(this.wlan)),
      edit_datetime: this.datetime.map(item => zeropad(item)),
      wlan_scan: null
    }
  },
  async mounted () {
    get('/api/settings/wlan/scan')
     .then(response => {
       this.wlan_scan = response.data
     })
  },
  methods: {
    post () {
      let datetime_modified = false
      for (let co=0; !datetime_modified && co < DATETIME_LENGTH; co++)
        datetime_modified = this.edit_datetime[co] != this.datetime[co]
      if (datetime_modified)
        dataPost('time', this.edit_datetime.map(item => parseInt(item)))
          .then(data => {
            this.$emit('datetime-change', data)
          })

      let wlan_modified = false
      for (const field in this.wlan) {
        if (this.wlan[field] != this.edit_wlan[field]) {
          wlan_modified = true
          break
        }
      }
      if (wlan_modified) {
        dataPost('settings/wlan', this.edit_wlan)
          .then(() => {
            alert('Устройство будет перезагружено')
          })
      }
    },
    zeropad_range (limit) {
      return [...Array(limit).keys()].map(item => zeropad(item))
    }

  }
}


</script>
