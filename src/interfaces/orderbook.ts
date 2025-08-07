import { z } from 'zod'

export const OrderbookSchema = z.object({
    topic: z.string(),
    data: z.union([z.object(), z.array(z.object())]),
})

export type Orderbook = {
    topic: string
    data: {
        bids: Array<[string, string]>
        asks: Array<[string, string]>
        seqNum: number
        prevSeqNum: number
        type: string
    },
}
