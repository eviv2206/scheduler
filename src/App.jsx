import './App.css';
import {useSession, useSessionContext, useSupabaseClient} from "@supabase/auth-helpers-react"
import Excel from "./components/Excel/Excel";

function App() {
    const supabase = useSupabaseClient();
    const {isLoading} = useSessionContext();
    const session = useSession();

    if (isLoading) {
        return <p>Loading...</p>
    }

    async function googleSignIn() {
        const {error} = await supabase.auth.signInWithOAuth({
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
    }

    return (
        <div className="App">
            <div>
                {session ?
                    <>
                        <h2>Hey there {session.user.email}</h2>
                        <button onClick={() => signOut()}>Sign out</button>
                        <Excel fileTypes={['.xslx', '.xls']}/>
                    </>
                    :
                    <>
                        <button onClick={() => googleSignIn()}>Sign in with Google</button>
                    </>
                }
            </div>
        </div>
    );
}

export default App;
