import type {Ref} from 'vue'
import {ref, watch} from 'vue'
import type {Orderbook, Quotes} from '@/interfaces'
import {useWebSocket} from '@/composables/useWebsocket'

type QuoteDetail = {
    priceNum: number
    sizeNum: number
    totalNum: number
    price: string
    size: string
    total: string
    percentage: number
    isNewSize: boolean
    isNewPrice: boolean
}

export const useOrderbook = () => {
    const {data, reconnect} = useWebSocket(
        'wss://ws.btse.com/ws/oss/futures',
        'update:BTCPFC',
    )
    const prevSeqNum: Ref<number | undefined> = ref()
    const setPrevSeqNum = ({data}: Orderbook) => {
        prevSeqNum.value = data.seqNum
    }

    const preBidsMap: Ref<Map<number, number>> = ref(new Map())
    const setPreBidsMap = (data: Array<QuoteDetail>) => {
        preBidsMap.value = data.reduce((map, {priceNum, sizeNum}) => (
            map.set(priceNum, sizeNum)
        ), new Map())
    }
    const rawBids: Ref<Quotes> = ref([])
    const setRawBids = (quotes: Quotes) => {
        rawBids.value = quotes
    }
    const bids: Ref<Array<QuoteDetail>> = ref([])
    const setBids = (data: Array<QuoteDetail>) => {
        bids.value = data
    }
    const getMaxBids = (quotes: Quotes, preMap: Map<number, number>) => {
        const displayAsks = quotes.toSorted((a, b) => parseFloat(b[0]) - parseFloat(a[0]))
        let totalNum = 0

        return displayAsks.slice(0, 8)
            .reduce((carry: Array<QuoteDetail>, [price, size]: [string, string]) => {
                const priceNum = parseFloat(price)
                const sizeNum = parseInt(size, 10)

                totalNum = parseInt(size, 10) + totalNum

                carry.push({
                    priceNum,
                    sizeNum,
                    price: new Intl.NumberFormat('en', {currency: 'USD', minimumFractionDigits: 1, maximumFractionDigits: 1}).format(priceNum),
                    size: new Intl.NumberFormat('en').format(sizeNum),
                    totalNum,
                    total: new Intl.NumberFormat('en').format(totalNum),
                    percentage: 0,
                    isNewSize: preMap.has(priceNum) && (preMap.get(priceNum) !== sizeNum),
                    isNewPrice: !preMap.has(priceNum),
                })

                return carry
            }, [])
            .map((config: QuoteDetail) => {
                const {totalNum: currentTotal} = config

                return {
                    ...config,
                    percentage: (currentTotal / totalNum * 100).toFixed(0),
                }
            })
    }

    const preAsksMap: Ref<Map<number, number>> = ref(new Map())
    const setPreAsksMap = (data: Array<QuoteDetail>) => {
        preAsksMap.value = data.reduce((map, {priceNum, sizeNum}) => (
            map.set(priceNum, sizeNum)
        ), new Map())
    }
    const rawAsks: Ref<Quotes> = ref([])
    const setRawAsks = (quotes: Quotes) => {
        rawAsks.value = quotes
    }
    const asks: Ref<Array<QuoteDetail>> = ref([])
    const setAsks = (data: Array<QuoteDetail>) => {
        asks.value = data
    }
    const getMaxAsks = (quotes: Quotes, preMap: Map<number, number>) => {
        const displayAsks = quotes.toSorted((a, b) => parseFloat(a[0]) - parseFloat(b[0]))
        let totalNum = 0

        return displayAsks.slice(-8)
            .reduce((carry: Array<QuoteDetail>, [price, size]: [string, string]) => {
                const priceNum = parseFloat(price)
                const sizeNum = parseInt(size, 10)

                totalNum = parseInt(size, 10) + totalNum

                carry.push({
                    priceNum,
                    sizeNum,
                    price: new Intl.NumberFormat('en', {currency: 'USD', minimumFractionDigits: 1, maximumFractionDigits: 1}).format(priceNum),
                    size: new Intl.NumberFormat('en').format(sizeNum),
                    totalNum,
                    total: new Intl.NumberFormat('en').format(totalNum),
                    percentage: 0,
                    isNewSize: preMap.has(priceNum) && (preMap.get(priceNum) !== sizeNum),
                    isNewPrice: !preMap.has(priceNum),
                })

                return carry
            }, [])
            .map((config: QuoteDetail) => {
                const {totalNum: currentTotal} = config

                return {
                    ...config,
                    percentage: (currentTotal / totalNum * 100).toFixed(0),
                }
            })
            .reverse()
    }

    const mergeQuotes = (origin: Quotes, update: Quotes): Quotes => {
        const map = new Map<string, string>()

        for (const [price, size] of origin) {
            map.set(price, size)
        }

        for (const [price, size] of update) {
            if (parseInt(size, 10) === 0) {
                map.delete(price) // 移除該價位
            } else {
                map.set(price, size) // 新增或更新該價位
            }
        }

        return Array.from(map.entries())
    }

    watch(data, (newData: Orderbook | undefined) => {
        if (newData) {
            const typeNotExist: boolean = !['snapshot', 'delta'].includes(newData.data.type)
            const seqNumNotMatch: boolean = prevSeqNum.value !== undefined && newData.data.prevSeqNum !== prevSeqNum.value

            if (typeNotExist || seqNumNotMatch) {
                console.warn(`Sequence number mismatch: expected ${prevSeqNum.value}, got ${newData.data.prevSeqNum}`)
                reconnect()

                return
            }

            setRawAsks(mergeQuotes(rawAsks.value, newData.data.asks))
            setAsks(getMaxAsks(rawAsks.value, preAsksMap.value))
            setPreAsksMap(asks.value)

            setRawBids(mergeQuotes(rawBids.value, newData.data.bids))
            setBids(getMaxBids(rawBids.value, preBidsMap.value))
            setPreBidsMap(bids.value)

            setPrevSeqNum(newData)
        }
    })

    return {
        bids,
        asks,
    }
}
