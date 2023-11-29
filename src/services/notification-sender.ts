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
    console.log("notifications pre:")    
    console.log(notifications)

    // order notifications by pedido.number first and then by coincidence.number
    notifications.sort((a, b) => {
        if (a.coincidences.pedido.number < b.coincidences.pedido.number) {
            return -1
        }
        if (a.coincidences.pedido.number > b.coincidences.pedido.number) {
            return 1
        }
        if (a.coincidences.number < b.coincidences.number) {
            return -1
        }
        if (a.coincidences.number > b.coincidences.number) {
            return 1
        }
        return 0
    })
    
    console.log("notifications post:")
    console.log(notifications)

    // notifications.forEach(notification => {
    //     const pedido= notification.coincidences.pedido
    //     console.log("celulares: ", notification.celulares)
    //     console.log("pedido #", pedido.number)
    //     console.log("coincidence #", notification.coincidences.number)
    //     console.log("----------------------")
    //     const json= notification.json
    //     const url= notificationsEndpoint
    //     fetch(url, {
    //         method: 'POST',
    //         headers: {
    //             'Content-Type': 'application/json'
    //         },
    //         body: JSON.stringify(json)
    //     })
    //     //check status code and only 200 is ok
    //     .then(response => {
    //         console.log("response: ", response.status, " - text: ", response.statusText)
            
    //         if (response.status === 200) {
    //             updateNotificationSent(notification.id)
    //             .then(() => {
    //                 console.log("notification updated")
    //             })
    //             .catch(error => {
    //                 console.log("error: ", error)
    //             })
    //         } else {
    //             console.log("error on fetch: ", response.status)
    //         }
    //     })
    //     .catch(error => {
    //         console.log("error: ", error)
    //     })        
    // })

    // change the above forEach to a for loop to avoid sending all notifications at once
    // and instead send them one by one with await
    for (const notification of notifications) {
        const pedido= notification.coincidences.pedido
        console.log("celulares: ", notification.celulares)
        console.log("pedido #", pedido.number)
        console.log("coincidence #", notification.coincidences.number)
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
    }
    

}

