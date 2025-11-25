import {io, Socket} from "socket.io-client";
import Config from "@/config";
import type {WarningMessage} from "@/model/WarningMessage";


export function useStatusService() {

    let socket: Socket | null = null;

    async function init() {
        socket = io(Config.statusBackendUrl);

        socket.on("disconnect", () => {
            console.log('Socket.io: disconnected');
        });

        socket.on('warning', (data: WarningMessage) => {
            console.log('Socket.io: received warning', data);
            alert('Warning: ' + data.message);
        })

        return new Promise<void>(resolve => {
            socket?.on("connect", () => {
                console.log('Socket.io: connected');
                resolve();
            });
        })
    }

    function send(message: string) {
        console.log('Socket.io: Sending message', message);
        socket?.emit('message', message);
    }

    function subscribeToAircraftStatus(aircraftId: string, callback: (status: any) => void) {
        console.log('Socket.io: Subscribing to aircraft status for aircraft ' + aircraftId);
        socket?.on('aircraft', callback);
        socket?.emit('subscribeToAircraft', aircraftId);
    }

    function disconnect() {
        socket?.disconnect();
    }

    return {
        init,
        send,
        subscribeToAircraft: subscribeToAircraftStatus,
        disconnect,
    }

}