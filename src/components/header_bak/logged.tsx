import getSession from "@/lib/auth"
import PopOver from "./PopOver"
import PopOverUserHandler from "./PopOverUserHandler"

export default async function Logged() {

    const session= await getSession()

    if (!session) return (
        <div></div>
    )

    const { user } = session

    const avatar= <p>{user.email}</p>

    return (<PopOver trigger={avatar} body={<PopOverUserHandler />} />)
}
