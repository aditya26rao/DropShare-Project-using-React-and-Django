import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import UploadPage from './pages/UploadPage';
import SharePage from './pages/SharePage';
import ReceivePage from './pages/ReceivePage';
import MyFilesPage from './pages/MyFilesPage';

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<UploadPage />} />
        <Route path="/share/:token" element={<SharePage />} />
        <Route path="/receive/:token" element={<ReceivePage />} />
        <Route path="/my-files" element={<MyFilesPage />} />
      </Routes>
    </BrowserRouter>
  );
}
