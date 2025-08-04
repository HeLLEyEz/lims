import { toast } from 'sonner'

export const useToast = () => {
  return {
    toast: (props: { title?: string; description?: string; variant?: 'default' | 'destructive' }) => {
      if (props.variant === 'destructive') {
        toast.error(props.description || props.title)
      } else {
        toast.success(props.description || props.title)
      }
    }
  }
} 