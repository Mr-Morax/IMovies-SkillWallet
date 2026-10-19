// client/src/components/loader/Loader.jsx
import React from "react";
import { Oval } from "react-loader-spinner";

const Loader = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
            <Oval
                visible={true}
                height="60"
                width="60"
                color="#E50914"
                secondaryColor="#282A36"
                ariaLabel="loading-spinner"
            />
            <p className="text-brand-muted text-sm tracking-wide animate-pulse">
                Loading iMovies...
            </p>
        </div>
    );
};

export default Loader;