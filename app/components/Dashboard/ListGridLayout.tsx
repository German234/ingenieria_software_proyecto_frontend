import { LayoutGrid, LayoutList } from "lucide-react";
import { ReactNode } from "react";

interface ListGridLayoutProps {
    isCardView: boolean;
    setIsCardView: (isCardView: boolean) => void;
    downloadButton?: ReactNode;
}

export default function ListGridLayout({ isCardView, setIsCardView, downloadButton }: ListGridLayoutProps) {
    return (
        <div className="flex flex-row-reverse items-center gap-3 mt-4">
            <button
                onClick={() => setIsCardView(!isCardView)}
                className={`${
                    isCardView
                        ? 'bg-blue_principal text-white'
                        : 'text-gray-600 bg-white'
                    } font-medium px-4 py-2 rounded-lg shadow transition-all hover:scale-105`}
            >
                {isCardView ? <LayoutList size={18} /> : <LayoutGrid size={18} />}
            </button>
            {downloadButton && downloadButton}
        </div>
    );
}