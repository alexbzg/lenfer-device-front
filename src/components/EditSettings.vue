<template>
	<div id="setup_block">
		<div id="setup_device" class="setup_list">
			<input type="text" name="" v-model="edit_wlan.name"><br/>
			название WiFi-точки устройства<br/>
			<span id="code">{{device_hash}}</span>
			код устройства для MY.LENFER.RU<br/>
			<input type="text" name="" v-model="edit_wlan.ap_key"><br/>
			пароль доступа к устройству<br/>
			<img id="view_note" src="/static/images/icon_info.png" @click="show_info = !show_info">
			<div class="clearboth"><!-- --></div>
			<div class="note" style="display: none;" v-show="show_info" @click="show_info = false">Если вы измените название/пароль устройства, после сохранения настроек устройство перезагрузится, и вам нужно будет заново подключиться к WiFi-точке устройства. Уже с новым именем или паролем.</div>
		</div>		
		<div id="setup_wifi" class="setup_list">
			<h3>Подключение к WiFi сети</h3>
			<input type="text" name="" v-model="edit_wlan.ssid"><br/>
			название WiFi сети<br/>
			<input type="text" name="" v-model="edit_wlan.key"><br/>
			пароль
		</div>
		<div id="setup_time" class="setup_list" v-if="modules.rtc">
			<h3>Установка даты и времени</h3>
			<select v-model="edit_datetime[2]" @change="edit_datetime_changed = true">
				<option v-for="item in zeropad_range(31, 1)" :key="item" :value="item">{{item}}</option>
			</select>			
			<select v-model="edit_datetime[1]" @change="edit_datetime_changed = true">
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
			<select v-model="edit_datetime[0]" @change="edit_datetime_changed = true">
				<option v-for="item in 20" :key="item" :value="item + 2019">{{item + 2019}}</option>
			</select>			
			<br/>
			<select v-model="edit_datetime[4]" @change="edit_datetime_changed = true">
				<option v-for="item in zeropad_range(24)" :key="item" :value="item">{{item}}</option>
			</select> :
			<select v-model="edit_datetime[5]" @change="edit_datetime_changed = true">
				<option v-for="item in zeropad_range(60)" :key="item" :value="item">{{item}}</option>
			</select>
		</div>

		<button id="setup_save" @click="post()">Сохранить настройки</button>
	</div>

</template>

<script>

import {dataPost} from '../api'
import {zeropad_range, zeropad} from '../utils'

const DATETIME_LENGTH = 6

export default {
  name: 'EditSettings',
  props: ['wlan', 'datetime', 'device_hash', 'modules'],
  data () {
    return {
      edit_wlan: JSON.parse(JSON.stringify(this.wlan)),	  
      edit_datetime: this.datetime.map(item => zeropad(item)),
      edit_datetime_changed: false,
      show_info: false
    }
  },
  methods: {
    post () {
      if (this.modules.rtc) {
        let datetime_modified = false
        for (let co=0; !datetime_modified && co < DATETIME_LENGTH; co++)
          datetime_modified = this.edit_datetime[co] != this.datetime[co]
        if (datetime_modified)
          dataPost('time', this.edit_datetime.map(item => parseInt(item)))
            .then(data => {
              this.$emit('datetime-change', data)
            })
      }

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
    zeropad_range: zeropad_range
  },
  watch: {
	datetime () {
      if (!this.edit_datetime_changed) {
		this.edit_datetime = this.datetime.map(item => zeropad(item))
      }
	}  
  }
}


</script>
