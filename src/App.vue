<template>
    <h1>Order Book</h1>
    <hr>
    <section>
        <div class="header">
            <div>Price (USD)</div>
            <div>Size</div>
            <div>Total</div>
        </div>
        <div
            v-for="({price, size, total, percentage, isNewSize, isNewPrice}, index) in asks"
            :key="index"
            class="asks"
            :class="{'line-highlight': isNewPrice}"
        >
            <div class="price">
                {{ price }}
            </div>
            <div :class="{'price-highlight': isNewSize}">
                {{ size }}
            </div>
            <div class="total">
                {{ total }}
                <div
                    class="bar-fill"
                    :style="{width: `${percentage}%`}"
                />
            </div>
        </div>
        <LastPricePanel />
        <div
            v-for="({price, size, total, percentage, isNewSize, isNewPrice}, index) in bids"
            :key="index"
            class="bids"
            :class="{'line-highlight': isNewPrice}"
        >
            <div class="price">
                {{ price }}
            </div>
            <div :class="{'price-highlight': isNewSize}">
                {{ size }}
            </div>
            <div class="total">
                {{ total }}
                <div
                    class="bar-fill"
                    :style="{width: `${percentage}%`}"
                />
            </div>
        </div>
    </section>
</template>

<script setup lang="ts">
import {useOrderbook} from '@/composables/useOrderbook'
import LastPricePanel from '@/components/LastPricePanel.vue'

const {asks, bids} = useOrderbook()
</script>

<style lang="scss" scoped>
@use './scss/abstracts/_variables.scss' as *;
@use './scss/abstracts/_mixins.scss' as *;

section {
    width: 300px;

    &>div {
        display: grid;
        grid-template-columns: 1fr 1fr 1.2fr;
        line-height: 1.8;

        &.header {
            color: #8698aa;
            font-weight: bold;
            text-align: center;
        }

        &.asks {
            @include orderbook-row($red, $red-bg, $red-bar);
        }

        &.bids {
            @include orderbook-row($green, $green-bg, $green-bar);
        }
    }
}
</style>
