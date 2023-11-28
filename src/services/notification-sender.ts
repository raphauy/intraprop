import { getConfigDAO, getValue } from "./config-services";
import { getPendingNotificationsDAO, updateNotificationSent } from "./notification-services";


export async function sendPendingNotifications() {   
    console.log("starting sender")
    const notificationsEndpoint= await getValue("NOTIFICATIONS_ENDPOINT")
    if(!notificationsEndpoint) {
        console.log("NOTIFICATIONS_ENDPOINT endpoint not found")
        return
    }
    const notifications= await getPendingNotificationsDAO()

    notifications.forEach(notification => {
        const pedido= notification.coincidences.pedido
        console.log("celulares: ", notification.celulares)
        console.log("pedido #", pedido.number)
        console.log("coincidence #", notification.coincidences.number)
        console.log("----------------------")
        const json= notification.json
        const url= notificationsEndpoint
        fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(json)
        })
        .then(response => response.json())
        .then(data => {
            console.log(data)
            updateNotificationSent(notification.id)
            .then(() => {
                console.log("notification updated")
            })
            .catch(error => {
                console.log("error: ", error)
            })
        })
        .catch(error => {
            console.log("error: ", error)
        })
        
    })

}

