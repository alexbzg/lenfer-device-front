<template>
    <div id="data_block">

        <table id="climat_data" v-if="sensors_info">
            <tbody v-for="type_entry in sensors_info" :key="type_entry.type">
                <tr v-for="(sensor_entry, sensor_idx) in type_entry.sensors" :key="sensor_entry.id">
                    <td class="icon">
                        <img :src="'/static/images/' + 
                            $options.TYPE_SETTINGS[type_entry.type].icon"><br/>
                        {{sensor_entry.title}}
                    </td>
                    <td class="current_data">
                        <template v-if="sensors_data">
                            {{sensors_data[sensor_entry.id]}}
                            {{$options.TYPE_SETTINGS[type_entry.type].unit}}
                        </template>
                    </td>
                    <td class="set_data" @click="open_set_limits(type_entry)">
                        <template v-if="sensor_idx === 0">
                            {{type_entry.limits[0]}}
                            {{$options.TYPE_SETTINGS[type_entry.type].unit}}
                        </template>
                    </td>
                </tr>
            </tbody>
        </table>

        <div class="wrapper" id="set_temp_window" v-if="set_limits">
            <div class="set_data_form">
                <span>
                    {{$options.TYPE_SETTINGS[set_limits.type].settings_title}}
                </span>
                <input type="text" id="set_value" v-model="set_limits.data[0]"><br/>
                &plusmn;<input type="text" id="set_delta" v-model="set_limits.data[1]">
                {{$options.TYPE_SETTINGS[set_limits.type].unit}}<br/>
                <button class="cancel" id="close_temp_window" @click="set_limits = null">Отмена</button>
                <button class="confirm" id="ok_temp_window" @click="post_limits">OK</button>
            </div>
        </div>

    </div>
</template>

<script>

import {get, dataPost} from '../api'

export default {
  TYPE_SETTINGS: {
    temperature: {
      icon: 'icon_temp.png',
      unit: '\xB0',
      settings_title: 'Необходимая температура'
    },
    humidity: {
      icon: 'icon_hum.png',
      unit: '%',
      settings_title: 'Необходимая влажность'
    }
  },
  name: 'SensorsData',
  props: ['module'],
  components: {},
  data () {
    return {
      sensors_info: null,
      sensors_data: null,
      set_limits: null
    }
  },
  async mounted () {
    get(`/api/${this.module}/sensors/info`)
     .then(response => {
       this.sensors_info = response.data
     })
    this.load_data()
    setInterval(this.load_data, 60000)
  },
  methods: {
    async load_data () {
      get(`/api/${this.module}/sensors/data`)
        .then(response => {
          this.sensors_data = response.data
      })
    },
    open_set_limits (param_entry) {
      this.set_limits = {
        type: param_entry.type,
        data: [...param_entry.limits],
        entry: param_entry
      }
    },
    async post_limits () {
      const data = this.set_limits.data.map(item => parseFloat(item))
      const post_data = {}
      post_data[this.set_limits.type] = data
      dataPost('climate/limits', post_data)
        .then(() => {
          this.set_limits.entry.limits = data
          this.set_limits = null
        })
        .catch(err => {
          alert(err.message)
        })
    }
  }
}

</script>

