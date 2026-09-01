import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Home from "./pages/Home";
import SearchResults from "./pages/SearchResults";
import PaperDetail from "./pages/PaperDetail";
import SavedPapers from "./pages/SavedPapers";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ProtectedRoute from "./components/ProtectedRoute";

function App(){
    return(
        <AuthProvider>
            <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, "")}>
                <Routes>
                    <Route path="/" element={<Home/>}/>
                    <Route path="/search" element={<SearchResults/>}/>
                    <Route path="/paper/:id" element={<PaperDetail/>}/>
                    <Route path="/login" element={<Login/>}/>
                    <Route path="/signup" element={<Signup/>}/>
                    <Route
                        path="/saved"
                        element={
                            <ProtectedRoute>
                                <SavedPapers/>
                            </ProtectedRoute>
                        }
                    />
                    <Route path="*" element={<Navigate to="/" replace/>}/>
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;
