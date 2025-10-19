import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

const AUSTRALIAN_STATES = [
  'Australian Capital Territory',
  'New South Wales',
  'Northern Territory',
  'Queensland',
  'South Australia',
  'Tasmania',
  'Victoria',
  'Western Australia'
]

interface NewsletterModalProps {
  open: boolean
  onClose: () => void
  onSubscribeSuccess?: () => void
}

export function NewsletterModal({ open, onClose, onSubscribeSuccess }: NewsletterModalProps) {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    state: ''
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase.from('subscribers').insert([formData])

      if (error) {
        if (error.code === '23505') {
          toast.error('This email is already subscribed!')
        } else {
          throw error
        }
        return
      }

      toast.success("Successfully subscribed! We'll notify you about new arrivals.")
      setFormData({ first_name: '', last_name: '', email: '', state: '' })
      onClose()
      onSubscribeSuccess?.()
    } catch (error) {
      console.error('Error subscribing:', error)
      toast.error('Failed to subscribe. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="
          sm:max-w-md relative overflow-hidden
          rounded-xl border bg-[#E9F2EC] border-[#B4C7BC]
          shadow-lg
        "
      >
        {/* 🌿 Soft radial glow (remove if you don't like it) */}
        <span
          aria-hidden
          className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-72 w-72 rounded-full bg-white/10 blur-3xl"
        />
        {/* 🧵 Subtle fabric grain (remove if it looks busy) */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.08] mix-blend-multiply
                     bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2240%22 height=%2240%22 viewBox=%220 0 40 40%22><filter id=%22n%22><feTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%222%22 stitchTiles=%22stitch%22/></filter><rect width=%2240%22 height=%2240%22 filter=%22url(%23n)%22 opacity=%220.18%22/></svg>')]"
        />

        <DialogHeader className="relative">
          <DialogTitle className="font-playfair text-[#1F2C26]">
            Get Notified About New Arrivals
          </DialogTitle>
          <p className="text-sm text-[#2B3B34]/80">
            Be the first to know when we add new pieces to our collection
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="relative space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="first_name" className="text-[#1F2C26]">First Name *</Label>
              <Input
                id="first_name"
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                required
                className="bg-white/70 border-[#B4C7BC] text-[#1F2C26] placeholder:text-[#1F2C26]/50
                           focus:ring-2 focus:ring-[#4A6B57] focus:border-[#4A6B57]"
              />
            </div>
            <div>
              <Label htmlFor="last_name" className="text-[#1F2C26]">Last Name *</Label>
              <Input
                id="last_name"
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                required
                className="bg-white/70 border-[#B4C7BC] text-[#1F2C26] placeholder:text-[#1F2C26]/50
                           focus:ring-2 focus:ring-[#4A6B57] focus:border-[#4A6B57]"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="email" className="text-[#1F2C26]">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              className="bg-white/70 border-[#B4C7BC] text-[#1F2C26] placeholder:text-[#1F2C26]/50
                         focus:ring-2 focus:ring-[#4A6B57] focus:border-[#4A6B57]"
            />
          </div>

          <div>
            <Label htmlFor="state" className="text-[#1F2C26]">State *</Label>
            <Select
              value={formData.state}
              onValueChange={(value) => setFormData({ ...formData, state: value })}
              required
            >
              <SelectTrigger className="bg-white/70 border-[#B4C7BC] text-[#1F2C26]
                                            focus:ring-2 focus:ring-[#4A6B57] focus:border-[#4A6B57]">
                <SelectValue placeholder="Select your state" />
              </SelectTrigger>
              <SelectContent className="bg-white text-[#1F2C26] border-[#B4C7BC]">
                {AUSTRALIAN_STATES.map((state) => (
                  <SelectItem key={state} value={state} className="focus:bg-[#E9F2EC]">
                    {state}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            type="submit"
            className="w-full bg-[#4A6B57] hover:bg-[#3E5A48] text-white rounded-full"
            disabled={loading}
          >
            {loading ? 'Subscribing...' : 'Subscribe'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
