"use client";

import Sidenav from "../components/Dashboard/Sidenav";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loading } from "../components/Loading";
import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";
import { useAuth } from "../hooks/useAuth";

interface LayoutProps {
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    const router = useRouter();
    const { status, loading } = useAuth();

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push('/');
        }
    }, [status, router]);

    if (loading || status === "loading") {
        return <Loading />;
    }

    if (status === "unauthenticated") {
        return <Loading />;
    }


    return (
        <div className="flex h-screen flex-col md:flex-row md:overflow-hidden">
            <div className="w-full flex-none md:w-64">
                <Sidenav />
            </div>
            <main className="flex-grow md:overflow-y-auto mt-20 md:mt-0 z-40 bg-gray-50">
                <GoogleReCaptchaProvider
                    language="es"
                    reCaptchaKey={process.env.NEXT_PUBLIC_SITE_KEY_RECAPTCHA || ''}
                    scriptProps={{ async: true }}
                >
                    {children}
                </GoogleReCaptchaProvider>
            </main>
        </div>
    );
};

export default Layout;