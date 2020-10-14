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
				<option v-for="item in 31" :key="item" :value="item">{{item}}</option>
			</select>			
			<select v-model="edit_datetime[1]">
				<option value="1">январь</option>
				<option value="2">февраль</option>
				<option value="3">март</option>
				<option value="4">апрель</option>
				<option value="5">май</option>
				<option value="6">июнь</option>
				<option value="7">июль</option>
				<option value="8">август</option>
				<option value="9">сентябрь</option>
				<option value="10">октябрь</option>
				<option value="11">ноябрь</option>
				<option value="12">декабрь</option>
			</select>
			<select v-model="edit_datetime[0]">
				<option v-for="item in 20" :key="item" :value="item + 2019">{{item + 2019}}</option>
			</select>			
			<br/>
			<select v-model="edit_datetime[4]">
				<option v-for="item in 24" :key="item" :value="item">{{item}}</option>
			</select> :
			<select v-model="edit_datetime[5]">
				<option v-for="item in 60" :key="item" :value="item">{{item}}</option>
			</select>
		</div>

		<button id="ok_setup_window" @click="post()">Сохранить настройки</button>
	</div>

</template>

<script>

import {get, dataPost} from '../api'

export default {
  name: 'EditSettings',
  props: ['wlan', 'datetime'],
  components: {},
  data () {
    return {
      edit_wlan: JSON.parse(JSON.stringify(this.wlan)),
      edit_datetime: [...this.datetime],
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
      dataPost()
    }
  }
}


</script>
