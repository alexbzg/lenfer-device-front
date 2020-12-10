<template>
    <div class="relay">
        <div class="view_period interval" v-for="(timer, idx) in timers_display" :key="idx" @click="open_timer(idx)">
            <table>
                <tr>
                    <td class="time_note">СТАРТ</td>
                    <td class="time_on">
                        <span class="digits">{{timer.on.hr}}</span>:
                        <span class="digits">{{timer.on.mn}}</span>
                    </td>
                </tr>
                <tr>
                    <td class="time_note">ВКЛ на</td>
                    <td class="time_off">
                        <template v-if="timer.duration.mn !== '00'">
                            <span class="digits">{{timer.duration.mn}}</span>
                            <span class="unit">мин</span> 
                        </template>
                        <template v-if="timer.duration.sc !== '00'">
                            <span class="digits">{{timer.duration.sc}}</span>
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
                            <select v-model="timer_edit.timer.on.hr">
                                <option v-for="item in zeropad_range(24)" :key="item" :value="item">{{item}}</option>
                            </select><span>:</span>
                        </td>
                        <td>
                            <select v-model="timer_edit.timer.on.mn">
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
                            <select v-model="timer_edit.timer.duration.mn">
                                <option v-for="item in zeropad_range(60)" :key="item" :value="item">{{item}}</option>
                            </select><span>:</span>
                        </td>
                        <td>
                            <select v-model="timer_edit.timer.duration.sc">
                                <option v-for="item in zeropad_range(60)" :key="item" :value="item">{{item}}</option>
                            </select>
                        </td>
                    </tr>
                    <tr>
                        <td class="bottom_text">мин</td>
                        <td class="bottom_text">сек</td>
                    </tr>
                </table>    
				<button class="delete" id="delete_period" v-if="timer_edit.idx !== -1" 
                    @click="timer_delete()">
                    Удалить этот период
                </button><br/>
                <button class="cancel" id="close_period" @click="timer_edit_cancel()">Отмена</button>
                <button class="confirm" id="ok_period" @click="timer_save()">OK</button>        
            </div>
        </div>

        <div id="manual_counter">
            {{zeropad(relay_elapsed)}}
		</div>

        <button id="manual_button" @mousedown="switch_relay(true)" @mouseup="switch_relay(false)"
			@touchstart="switch_relay(true)" @touchend="switch_relay(false)" @touchcancel="switch_relay(false)">
			РУЧНОЙ ПУСК
		</button><br/>
        <input type="checkbox" v-if="relay_module === 'feeder'" v-model="reverse" 
            @click="reverse = !reverse"/>Реверс
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
            reverse: false,
            relay_elapsed: 0,
            timers: [],
            timer_edit: null
        }
    },
    async mounted () {
        get(`/api/${this.relay_module}/timers`)
            .then(response => {
                this.update(response.data)
            })
    },
    methods: {
        update (data) {
            this.timer_edit = null
            this.timers = data
        },
        async switch_relay (val) {
            if (this.relay_cancel)
				return;
			if (this.relay_tick_handle) {
				clearInterval(this.relay_tick_handle);
				this.relay_tick_handle = null;
			}
			this.relay = !val;
            dataPost(`${this.relay_module}/relay`, {relay: 0, value: val, reverse: this.reverse})
                .then(() => {
                    if (val) {
                        if (!this.relay_cancel) {
                            this.realy_elapsed = 0
                            this.relay_tick_handle = setInterval(() => {
                                this.relay_elapsed++                                
                            }, 1000)
                        }
                    } 
                    this.relay_cancel = false
                })
        },
        zeropad_range: zeropad_range,
        zeropad: zeropad,
        open_timer (idx) {
            this.timer_edit = {
                idx: idx, 
                timer: idx != -1 ? this.timers_display[idx] : {
                    on: {
                        hr: '00',
                        mn: '00',
                    },
                    duration: {
                        mn: '00',
                        sc: '00',
                    }
                }
            }
        },
        secs_to_tuple (secs) {
            const r = {hr:"00", mn: "00", sc: "00"}
            if (secs) {
                r.hr = zeropad(Math.floor(secs/3600))
                r.mn = zeropad(Math.floor((secs - r.hr*3600)/60))
                r.sc = zeropad(secs % 60)
            }
            return r
        },
        tuple_to_secs (tuple) {
            return (tuple.hr ? Number(tuple.hr) : 0)*3600 +
                (tuple.mn ? Number(tuple.mn) : 0)*60 +
                (tuple.sc ? Number(tuple.sc) : 0)
        },
        timer_limits (timer) {
            return [timer.on, timer.on + timer.duration]
        },
        timer_edit_cancel() {
            if (confirm("Отменить все внесенные изменения?"))
                this.timer_edit = null
        },
        timer_delete () {            
            if (confirm("Вы действительно хотите удалить этот период?"))
                dataPost(`${this.relay_module}/timers`, this.timer_edit.idx, 'DELETE')
                    .then(data => { this.update(data) })
        },
        timer_save () {
            const timer = {}
            for (const prop in this.timer_edit.timer) {
                timer[prop] = this.tuple_to_secs(this.timer_edit.timer[prop])
            }
            if (!timer.duration) {
                alert("Нужно установить значение ВКЛЮЧИТЬ на!")
                return
            }
            const limits = this.timer_limits(timer)
            const timers_length = this.timers.length
            for (let co = 0; co < timers_length; co++) {
                if (co != this.timer_edit.idx) {
                    const co_limits = this.timer_limits(this.timers[co])
                    if ((co_limits[0] <= limits[0] && limits[0] <= co_limits[1]) || 
                        (co_limits[0] <= limits[1] && limits[1] <= co_limits[1])) {
                        alert(`Период конфликтует с периодом ${this.timers_display[co].on.hr}:${this.timers_display[co].on.mn}!`)
                        return
                    }
                }
            }
            const data = {}
            data[this.timer_edit.idx] = timer
            dataPost(`${this.relay_module}/timers`, data)
                .then(upd_data => {
                    this.update(upd_data)
                })
        }
    },
    computed: {
        timers_display () {
            return this.timers.map(timer => {
                const display = {}
                for (const prop in timer) {
                    display[prop] = this.secs_to_tuple(timer[prop])
                }
                return display
            })
        }
    }    
}
</script>
<style scoped>

</style>