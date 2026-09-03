import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { LabProvider } from "./context/LabContext";
import Home from "./pages/Home";
import SearchResults from "./pages/SearchResults";
import PaperDetail from "./pages/PaperDetail";
import SavedPapers from "./pages/SavedPapers";
import ScholarLab from "./pages/ScholarLab";
import SynthesisTool from "./pages/lab/SynthesisTool";
import CompareTool from "./pages/lab/CompareTool";
import MatrixTool from "./pages/lab/MatrixTool";
import GapsTool from "./pages/lab/GapsTool";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ProtectedRoute from "./components/ProtectedRoute";

function App(){
    return(
        <AuthProvider>
            <LabProvider>
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
                        {/* Scholar Lab — nested layout with persistent bench sidebar */}
                        <Route
                            path="/lab"
                            element={
                                <ProtectedRoute>
                                    <ScholarLab/>
                                </ProtectedRoute>
                            }
                        >
                            <Route index element={<Navigate to="/lab/synthesis" replace/>}/>
                            <Route path="synthesis" element={<SynthesisTool/>}/>
                            <Route path="compare" element={<CompareTool/>}/>
                            <Route path="matrix" element={<MatrixTool/>}/>
                            <Route path="gaps" element={<GapsTool/>}/>
                        </Route>
                        <Route path="*" element={<Navigate to="/" replace/>}/>
                    </Routes>
                </BrowserRouter>
            </LabProvider>
        </AuthProvider>
    );
}

export default App;

