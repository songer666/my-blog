import React from 'react'
import {LoginForm} from "@/components/auth/login/login-form";
import styles from "./page.module.css"

const FirstPage = async () => {
    return (
        <div className={styles.container}>
            <div className={styles.item}>
                <LoginForm />
            </div>
        </div>
    )
}
export default FirstPage;
