import {auth} from "@/lib/auth";

const createUserData = async () => {
    const result = await auth.api.signUpEmail({
        body: {
            name: 'xxx',
            email: 'xxxx',
            password: 'xxx',
        }
    })
    console.log(result)
}

createUserData()