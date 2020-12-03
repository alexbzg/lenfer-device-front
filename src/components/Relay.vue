<template>
    <div class="relay">
        <div class="view_period interval" v-for="(timer, idx) in timers" :key="idx" @click="open_timer(idx)">
            <table>
                <tr>
                    <td class="time_note">СТАРТ</td>
                    <td class="time_on">
                        <span x-text="timer.conf.on.hr" class="digits"></span>:
                        <span x-text="timer.conf.on.mn" class="digits"></span>
                    </td>
                </tr>
                <tr>
                    <td class="time_note">ВКЛ на</td>
                    <td class="time_off">
                        <template v-if="timer.duration_display.mn">
                            <span class="digits">{{timer.duration_display.mn}}</span>
                            <span class="unit">мин</span> 
                        </template>
                        <template v-if="timer.duration_display.sc">
                            <span class="digits">{{timer.duration_display.sc}}</span>
                            <span class="unit">сек</span> 
                        </template>
                    </td>
                </tr>
            </table>
        </div>

        <div id="add_period_link" @click="open_timer(-1)">Добавить период</div>

        <div class="wrapper" id="set_period" v-if="timer_edit">
            <div id="interval_form" class="set_time_form">
                <table>
                    <tr>
                        <td colspan="2" class="title">ВКЛЮЧИТЬ</td>
                    </tr>
                    <tr>
                        <td>
                            <select v-model="timer_edit.conf.on.hr">
                                <option v-for="item in zeropad_range(24)" :key="item" :value="item">{{item}}</option>
                            </select><span>:</span>
                        </td>
                        <td>
                            <select v-model="timer_edit.conf.on.mn">
                                <option v-for="item in zeropad_range(60)" :key="item" :value="item">{{item}}</option>
                            </select>
                        </td>
                    </tr>
                    <tr>
                        <td class="bottom_text">час</td>
                        <td class="bottom_text">мин</td>
                    </tr>
                </table>
                <table>
                    <tr>
                        <td colspan="2" class="title">ВКЛЮЧИТЬ на</td>
                    </tr>
                    <tr>
                        <td>
                            <select v-model="timer_edit.duration_edit.mn">
                                <option v-for="item in zeropad_range(60)" :key="item" :value="item">{{item}}</option>
                            </select><span>:</span>
                        </td>
                        <td>
                            <select v-model="timer_edit.duration_edit.sc">
                                <option v-for="item in zeropad_range(60)" :key="item" :value="item">{{item}}</option>
                            </select>
                        </td>
                    </tr>
                    <tr>
                        <td class="bottom_text">мин</td>
                        <td class="bottom_text">сек</td>
                    </tr>
                </table>            
            </div>
        </div>

        <button id="manual_button" @mousedown="switch_relay(true)" @mouseup="switch_relay(false)"
			@touchstart="switch_relay(true)" @touchend="switch_relay(false)" @touchcancel="switch_relay(false)">
			РУЧНОЙ ПУСК
		</button>
    </div>
</template>
<script>
import {get, dataPost} from '../api'
import {zeropad_range, zeropad} from '../utils'

export default {
    name: 'Relay',
    props: ['relay_module'],
    data () {
        return {
            timers: null,
            timer_edit: null
        }
    },
    async mounted () {
        get(`/api/${this.relay_module}/timers`)
            .then(response => {
                this.timers = response.data
                for (const timer of this.timers) {
                    timer.duration_display = this.secs_to_tuple(timer.conf.duration)
                }
            })
    },
    methods: {
        async switch_relay (val) {
            dataPost(`${this.relay_module}/relay`, {relay: 0, value: val})
        },
        zeropad_range: zeropad_range,
        zeropad: zeropad,
        open_timer (idx) {
            if (idx != -1) {
                const timer = this.timers[idx];
                this.timer_edit = {
                    idx: idx, 
                    timer_type: timer.timer_type, 
                    conf: JSON.parse(JSON.stringify(timer.conf)),
                    duration_edit: {
                        mn: zeropad(timer.duration_display.mn),
                        sc: zeropad(timer.duration_display.sc)
                    }
                }
            }
            else
                this.timer_edit = {
                    timer_type: 'interval', 
                    idx: -1, 
                    conf: {
                        on: {
							hr: '00',
							mn: '00',
                        }
                    },
                    duration_edit: {
                        mn: '00',
                        sc: '00',
                    }
                }            
        },
        secs_to_tuple (secs) {
            const r = {mn: 0, sc: 0}
            if (secs) {
                r.sc = secs % 60
                r.mn = Math.floor(secs/60)
            }
            return r
        },
        tuple_to_secs (tuple) {
            return Number(tuple.mn)*60 + Number(tuple.sc)
        }
    }    
}
</script>
<style scoped>

</style>