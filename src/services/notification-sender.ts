import { format } from "date-fns";
import { getValue } from "./config-services";
import { getPendingNotifications, updateNotificationSent } from "./notification-pedidos-services";


export async function sendPendingNotifications() {   
    const notificationsEndpoint= await getValue("NOTIFICATIONS_ENDPOINT")
    if(!notificationsEndpoint) {
        console.log("NOTIFICATIONS_ENDPOINT endpoint not found")
        return
    }
    const notifications= await getPendingNotifications()

    if (notifications.length > 0) 
        console.log(`starting sender with ${notifications.length} notifications`)

    for (const notification of notifications) {
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
                    if (data.json) {
                        const jsonObject= JSON.parse(data.json)
                        const number= jsonObject.number
                        const inmobiliaria= jsonObject.inmobiliaria
                        // now Montevideo time
                        const now= format(new Date(), "yyyy-MM-dd HH:mm:ss")
                        console.log(`${now}pedido ${number} sent to ${inmobiliaria}`)
                    }                    
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

