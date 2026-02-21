import './App.css';
import { useState } from 'react'; 
import { useSession, useSessionContext, useSupabaseClient } from "@supabase/auth-helpers-react"
import Excel from "./components/Excel/Excel";

function App() {
    const supabase = useSupabaseClient();
    const { isLoading } = useSessionContext();
    const session = useSession();
    const [isScheduleVisible, setIsScheduleVisible] = useState(false);

    if (isLoading) {
        return (
            <div className="App-loading">
                <p>Loading...</p>
            </div>
        );
    }

    async function googleSignIn() {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: "google",
            options: { scopes: "https://www.googleapis.com/auth/calendar" }
        });
        if (error) {
            alert(error.message);
            console.log(error);
        }
    }

    async function signOut() {
        await supabase.auth.signOut();
        setIsScheduleVisible(false);
    }

    return (
        <div className="App">
            <header className="App-header">
                <h1>Scheduler 2.0</h1>
                {session && session.expires_at > Math.floor(Date.now() / 1000) && (
                    <div className="user-info">
                        <span>Привет, {session.user.email}</span>
                        <button onClick={signOut} className="btn btn-exit">Выйти</button>
                    </div>
                )}
            </header>

            <main className="App-main">
                {session && session.expires_at > Math.floor(Date.now() / 1000) ? (
                    <div className={`content-wrapper ${isScheduleVisible ? 'schedule-visible-state' : ''}`}>
                        <h2>Загрузите фото расписания</h2>
                        <p>Поддерживаемые форматы: .jpg, .png, .webp</p>

                        <Excel
                            fileTypes={['image/jpeg', 'image/png', 'image/webp']}
                            setIsScheduleVisible={setIsScheduleVisible}
                        />
                    </div>
                ) : (
                    <div className="login-container">
                        <h2>Добро пожаловать!</h2>
                        <p>Пожалуйста, войдите с помощью Google, чтобы продолжить.</p>
                        <button onClick={googleSignIn} className="btn btn-primary google-signin-btn">
                            <span>Войти с помощью Google</span>
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
}

export default App;