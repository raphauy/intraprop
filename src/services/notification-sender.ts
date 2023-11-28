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
        // check status code and only 200 is ok
        .then(response => {
            console.log("response: ", response.status, " - text: ", response.statusText)
            
            if (response.status === 200) {
                updateNotificationSent(notification.id)
                .then(() => {
                    console.log("notification updated")
                })
                .catch(error => {
                    console.log("error: ", error)
                })
            } else {
                console.log("error on fetch: ", response.status)
            }
        })
        .catch(error => {
            console.log("error: ", error)
        })        
    })

}

