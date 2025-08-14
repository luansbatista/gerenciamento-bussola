import React from "react"
import Image from "next/image"

interface LogoImageProps {
  size?: "sm" | "md" | "lg"
  className?: string
}

export function LogoImage({ size = "md", className = "" }: LogoImageProps) {
  const sizeClasses = {
    sm: "h-12 w-auto",
    md: "h-16 w-auto", 
    lg: "h-20 w-auto"
  }

  return (
    <div className={`flex items-center justify-center ${className}`}>
             <Image
         src="/images/logo-bussola-aprovacao.png"
         alt="Bússola da Aprovação"
         width={175}
         height={175}
         className={`${sizeClasses[size]} object-contain`}
         priority
       />
    </div>
  )
}
