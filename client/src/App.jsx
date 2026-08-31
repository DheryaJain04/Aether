import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import SearchResults from "./pages/SearchResults";
import PaperDetail from "./pages/PaperDetail";
import SavedPapers from "./pages/SavedPapers";

function App(){
    return(
        <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Routes>
                <Route path="/" element={<Home/>}/>
                <Route path="/search" element={<SearchResults/>}/>
                <Route path="/paper/:id" element={<PaperDetail/>}/>
                <Route path="/saved" element={<SavedPapers/>}/>
                <Route path="*" element={<Navigate to="/" replace/>}/>
            </Routes>
        </BrowserRouter>
    );
}

export default App;
