import '../index.css';
import { AuthProvider } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { Toaster } from 'react-hot-toast';

export const metadata = {
  title: 'CloudQuest — Quiz Arena',
  description: 'Timed quizzes, live rankings, and focused learning.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400..900;1,9..144,400..900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#f7f4ec] text-[#172a25] font-sans antialiased min-h-screen flex flex-col">
        <AuthProvider>
          <Navbar />
          <div className="flex-1 flex flex-col">{children}</div>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3500,
              style: {
                background: '#ffffff',
                color: '#173c34',
                fontSize: '14px',
                fontWeight: '600',
                borderRadius: '16px',
                border: '2px solid #173c34',
                boxShadow: '4px 4px 0 #173c34',
              },
              success: {
                iconTheme: {
                  primary: '#173c34',
                  secondary: '#f7b955',
                },
              },
              error: {
                iconTheme: {
                  primary: '#e65f45',
                  secondary: '#ffffff',
                },
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
