import type {Ref} from 'vue'
import {ref, onUnmounted} from 'vue'
import type {Orderbook} from '@/interfaces'
import {OrderbookSchema} from '@/interfaces'

export const useWebSocket = (url: string, topic: string) => {
    const data: Ref<Orderbook | undefined> = ref()
    const ws = new WebSocket(url)

    const sendJson = (message: object) => {
        ws.send(JSON.stringify(message))
    }

    const handleOpen = () => {
        sendJson(
            {
                op: 'subscribe',
                args: [topic],
            },
        )
    }

    const handleMessage = (event: MessageEvent) => {
        const parsedData = JSON.parse(event.data)

        if (OrderbookSchema.safeParse(parsedData).success) {
            data.value = parsedData
        }
    }

    ws.addEventListener('open', handleOpen)
    ws.addEventListener('message', handleMessage)

    const disconnect = () => {
        if (ws.readyState === WebSocket.OPEN) {
            sendJson(
                {
                    op: 'unsubscribe',
                    args: [topic],
                },
            )
        }
    }

    const reconnect = () => {
        disconnect()
        handleOpen()
    }

    onUnmounted(() => {
        ws.removeEventListener('open', handleOpen)
        ws.removeEventListener('message', handleMessage)
        ws.close()
    })

    return {
        disconnect,
        reconnect,
        data,
    }
}
