import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
import { 
  CheckCircle, 
  AlertCircle, 
  Info, 
  AlertTriangle 
} from "lucide-react"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, variant, ...props }) {
        const Icon = variant === 'success' ? CheckCircle :
                    variant === 'destructive' ? AlertCircle :
                    variant === 'warning' ? AlertTriangle :
                    Info

        // Generate modern message based on variant
        let modernTitle = title;
        if (variant === 'destructive' && !title) {
          modernTitle = "Error";
        } else if (variant === 'warning' && !title) {
          modernTitle = "Alert";
        }

        // Keep full description without truncation
        let modernDescription = description;
        
        // Calculate dynamic size based on content length
        const titleLength = typeof (title || modernTitle) === 'string' ? (title || modernTitle).length : 0;
        const descriptionLength = typeof description === 'string' ? description.length : 0;
        const totalContentLength = titleLength + descriptionLength;
        const isShortContent = totalContentLength < 50;
        const isMediumContent = totalContentLength >= 50 && totalContentLength < 120;
        const isLongContent = totalContentLength >= 120;

        return (
          <Toast key={id} variant={variant} {...props}>
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                <Icon className={cn(
                  "h-5 w-5 transition-transform duration-200 ease-out transform motion-safe:group-hover:scale-110",
                  variant === 'default' ? "text-blue-600" :
                  variant === 'destructive' ? "text-red-600" :
                  variant === 'success' ? "text-green-600" :
                  variant === 'warning' ? "text-amber-600" : "text-blue-600"
                )} />
              </div>
              <div className={cn(
                "flex-1 min-w-0",
                isShortContent ? "max-w-[200px]" : 
                isMediumContent ? "max-w-[320px]" : 
                "max-w-[450px]"
              )}>
                {(title || modernTitle) && (
                  <ToastTitle className={cn(
                    "font-semibold leading-tight mb-1",
                    isShortContent ? "text-xs" : 
                    isMediumContent ? "text-sm" : 
                    "text-sm"
                  )}>
                    {title || modernTitle}
                  </ToastTitle>
                )}
                {(description || modernDescription) && (
                  <ToastDescription className={cn(
                    "leading-tight",
                    isShortContent ? "text-xs line-clamp-2" : 
                    isMediumContent ? "text-xs line-clamp-3" : 
                    "text-xs line-clamp-4"
                  )}>
                    {modernDescription}
                  </ToastDescription>
                )}
              </div>
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport className="fixed top-4 right-4 z-[100] flex max-h-screen w-full flex-col-reverse p-2 sm:flex-col" />
    </ToastProvider>
  )
}

function cn(...classes: (string | undefined)[]) {
  return classes.filter(Boolean).join(" ")
}