import {redirect} from "next/navigation";

const VercelAppHomePage = async () => {
    redirect('/root')
    return null
}

export default VercelAppHomePage
