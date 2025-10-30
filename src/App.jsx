import './App.css';
import { useState } from 'react'; // 1. Импортирован useState
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
            options: {
                scopes: "https://www.googleapis.com/auth/calendar",
            }
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
                        <span>Hey, {session.user.email}</span>
                        <button onClick={signOut} className="btn btn-secondary">
                            Sign out
                        </button>
                    </div>
                )}
            </header>

            <main className="App-main">
                {session && session.expires_at > Math.floor(Date.now() / 1000) ? (
                    <div className={`content-wrapper ${isScheduleVisible ? 'schedule-visible-state' : ''}`}>
                        <h2>Загрузите ваш файл</h2>
                        <p>Поддерживаемые форматы: .xslx, .xls, .xlsx</p>

                        <Excel
                            fileTypes={['.xslx', '.xls', '.xlsx']}
                            setIsScheduleVisible={setIsScheduleVisible}
                        />
                    </div>
                ) : (
                    <div className="login-container">
                        <h2>Добро пожаловать!</h2>
                        <p>Пожалуйста, войдите с помощью Google, чтобы продолжить.</p>
                        <button onClick={googleSignIn} className="btn btn-primary google-signin-btn">
                            <svg
                                className="google-logo"
                                aria-hidden="true"
                                focusable="false"
                                width="20px"
                                height="20px"
                                viewBox="0 0 18 18">
                                <path d="M16.51 8.1H9v3.4h4.14c-.18 1.12-.76 2.06-1.69 2.68v2.28h2.92c1.7-1.57 2.68-3.88 2.68-6.36z" fill="#4285F4"></path>
                                <path d="M9 17.1c2.4 0 4.41-.79 5.88-2.15l-2.92-2.28c-.79.53-1.8.84-2.96.84-2.28 0-4.21-1.55-4.91-3.64H1.09v2.36C2.51 15.3 5.48 17.1 9 17.1z" fill="#34A853"></path>
                                <path d="M4.09 10.38c-.14-.42-.22-.86-.22-1.31s.08-.89.22-1.31V5.41H1.09C.36 6.8 0 8.35 0 10.04s.36 3.24 1.09 4.63l3-2.29z" fill="#FBBC05"></path>
                                <path d="M9 3.84c1.3 0 2.48.45 3.42 1.35l2.6-2.6C13.41 1.13 11.4 0 9 0 5.48 0 2.51 1.8 1.09 4.38l3 2.29C4.79 4.7 6.72 3.84 9 3.84z" fill="#EA4335"></path>
                            </svg>

                            {/* Текст кнопки */}
                            <span>Войти с помощью Google</span>
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
}

export default App;