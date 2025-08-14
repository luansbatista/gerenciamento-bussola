import React from "react"

interface LogoProps {
  size?: "sm" | "md" | "lg"
  showText?: boolean
  className?: string
}

export function Logo({ size = "md", showText = true, className = "" }: LogoProps) {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-12 w-12", 
    lg: "h-16 w-16"
  }

  const textSizes = {
    sm: "text-sm",
    md: "text-lg",
    lg: "text-2xl"
  }

  const compassSizes = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-10 w-10"
  }

  return (
    <div className={`flex items-center justify-center ${className}`}>
      {showText ? (
        <div className="flex flex-col items-center">
          {/* Text with integrated compass */}
          <div className={`font-bold text-blue-900 ${textSizes[size]} leading-tight flex items-center`}>
            <span>BÚSS</span>
            {/* Compass replacing the 'O' */}
            <div className={`${compassSizes[size]} mx-1 relative`}>
              {/* Compass case - golden/bronze metallic */}
              <div className="w-full h-full rounded-full bg-gradient-to-br from-amber-600 to-yellow-700 shadow-lg border border-amber-500 flex items-center justify-center">
                {/* Compass face - light beige/cream */}
                <div className="w-4/5 h-4/5 rounded-full bg-amber-50 border border-amber-200 relative">
                  {/* Compass needle - dark brown/black pointing northeast */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-0.5 h-full bg-gray-800 transform rotate-12 relative">
                      {/* North pointer */}
                      <div className="absolute -top-0.5 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-1 border-r-1 border-b-2 border-l-transparent border-r-transparent border-b-gray-800"></div>
                    </div>
                  </div>
                  {/* Center dot */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-0.5 h-0.5 bg-gray-800 rounded-full"></div>
                  </div>
                  {/* Small markings around the edge */}
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-0.5 h-1 bg-gray-600"></div>
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0.5 h-1 bg-gray-600"></div>
                  <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-0.5 bg-gray-600"></div>
                  <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-1 h-0.5 bg-gray-600"></div>
                </div>
              </div>
            </div>
            <span>LA</span>
          </div>
          
          {/* Second line */}
          <div className={`font-bold text-blue-900 ${textSizes[size]} leading-tight mt-1`}>
            <div>DA APROVAÇÃO</div>
          </div>
        </div>
      ) : (
        /* Compass only */
        <div className={`${sizeClasses[size]} relative`}>
          {/* Compass case - golden/bronze metallic */}
          <div className="w-full h-full rounded-full bg-gradient-to-br from-amber-600 to-yellow-700 shadow-lg border border-amber-500 flex items-center justify-center">
            {/* Compass face - light beige/cream */}
            <div className="w-4/5 h-4/5 rounded-full bg-amber-50 border border-amber-200 relative">
              {/* Compass needle - dark brown/black pointing northeast */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-0.5 h-full bg-gray-800 transform rotate-12 relative">
                  {/* North pointer */}
                  <div className="absolute -top-0.5 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-1 border-r-1 border-b-2 border-l-transparent border-r-transparent border-b-gray-800"></div>
                </div>
              </div>
              {/* Center dot */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-0.5 h-0.5 bg-gray-800 rounded-full"></div>
              </div>
              {/* Small markings around the edge */}
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-0.5 h-1 bg-gray-600"></div>
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0.5 h-1 bg-gray-600"></div>
              <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-0.5 bg-gray-600"></div>
              <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-1 h-0.5 bg-gray-600"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export function LogoOnly({ size = "md", className = "" }: Omit<LogoProps, "showText">) {
  return <Logo size={size} showText={false} className={className} />
}
