"use client"

import { useNavigate, useLocation } from 'react-router-dom'
import { VariantProps } from "class-variance-authority"
import * as React from "react"
import { Button, buttonVariants } from "../../../components/ui/button"

// interface BackButtonProps extends VariantProps<typeof buttonVariants> {
//     className?: string
//     children?: React.ReactNode
// }

interface BackButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
    className?: string
    children?: React.ReactNode
}

export function BackButton({
    variant = "ghost",
    size = "icon",
    className,
    children,
    // ...props
}: BackButtonProps) {
    const navigate = useNavigate()
    const location = useLocation()

    const handleRedirect = () => {
        const pathname = location.pathname.replace('/reservation/cars', '/cars')
        const search = location.search // includes the existing ?query=params
        navigate(`${pathname}${search}`)
    }

    return (
        <Button
            variant={variant}
            size={size}
            type="button"
            onClick={handleRedirect}
            className={className}
        >
            {children}
        </Button>
    )
}