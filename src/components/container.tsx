import { cn } from "@/utils";
import React from "react";


export const Container = ({className, children}: {
    children:React.ReactNode;
    className?:string
}) => {
    return <div className={cn("max-w-7xl mx-auto w-full px-4 relative z-10"
, className)}>
{children}
    </div>
}