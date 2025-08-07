<template>
    <section :class="className">
        {{ displayLastPrice }}
        <svg
            v-if="className"
            width="24"
            height="24"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
        >
            <IconArrowDown />
        </svg>
    </section>
</template>

<script setup lang="ts">
import type {Ref} from 'vue'
import {ref, watch, computed} from 'vue'
import type {Orderbook} from '@/interfaces'
import {useWebSocket} from '@/composables/useWebsocket'
import IconArrowDown from '@/assets/IconArrowDown.svg'

const {data} = useWebSocket(
    'wss://ws.btse.com/ws/futures',
    'tradeHistoryApi:BTCPFC',
)

const lastPrice: Ref<number | undefined> = ref()
const className: Ref<string | undefined> = ref('')

const displayLastPrice: Ref<string | undefined> = computed(() => (
    lastPrice.value !== undefined ?
        new Intl.NumberFormat('en', {currency: 'USD', minimumFractionDigits: 1, maximumFractionDigits: 1})
            .format(lastPrice.value) :
        undefined
))

watch(data, (newData: Orderbook | undefined) => {
    if (newData && Array.isArray(newData.data)) {
        const newPrice = parseFloat(newData.data[0].price)

        if (lastPrice.value !== undefined) {
            if (lastPrice.value > newPrice) {
                className.value = 'decrease'
            } else if (lastPrice.value < newPrice) {
                className.value = 'increase'
            } else {
                className.value = ''
            }
        }

        lastPrice.value = newPrice
    }
})
</script>

<style lang="scss" scoped>
@use '@/scss/abstracts/_variables.scss' as *;

section {
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #F0F4F8;
    background-color: rgba(134, 152, 170, 0.12);
    font-weight: bold;
    font-size: 1.2rem;
    margin: 10px 0;

    &.increase {
        color: $green;
        background-color: $green-bar;

        &>svg {
            transform: rotate(180deg);
        }
    }

    &.decrease {
        color: $red;
        background-color: $red-bar;
    }
}
</style>