import { getValue } from "./config-services";
import { getPendingNotifications, updateNotificationSent } from "./notification-pedidos-services";


export async function sendPendingNotifications() {   
    console.log("starting sender")
    const notificationsEndpoint= await getValue("NOTIFICATIONS_ENDPOINT")
    if(!notificationsEndpoint) {
        console.log("NOTIFICATIONS_ENDPOINT endpoint not found")
        return
    }
    const notifications= await getPendingNotifications()

    for (const notification of notifications) {
        console.log("celulares: ", notification.celulares)
        console.log("----------------------")
        const json= notification.json
        const url= notificationsEndpoint
        await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(json)
        })
        //check status code and only 200 is ok
        .then(response => {
            console.log("response: ", response.status, " - text: ", response.statusText)
            
            if (response.status === 200) {
                updateNotificationSent(notification.id)
                .then((data) => {
                    console.log("******************************")
                    console.log("notification updated")
                    console.log(data)                    
                    console.log("******************************")
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
    }
    

}

