import { Globe } from 'lucide-react'
import { Button } from './ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'
import { useCartStore } from '../lib/store'
import { CURRENCIES, setCurrencyPreference, type Currency } from '../lib/utils/currency'

export function CurrencySelector() {
  const { currency, setCurrency } = useCartStore()

  const handleCurrencyChange = (newCurrency: Currency) => {
    setCurrency(newCurrency)
    setCurrencyPreference(newCurrency)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline">
            {CURRENCIES[currency].code}
          </span>
          <span className="sm:hidden">
            {CURRENCIES[currency].symbol}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {(Object.keys(CURRENCIES) as Currency[]).map((curr) => (
          <DropdownMenuItem
            key={curr}
            onClick={() => handleCurrencyChange(curr)}
            className={`flex items-center justify-between ${
              currency === curr ? 'bg-accent' : ''
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="font-medium">{CURRENCIES[curr].symbol}</span>
              <span>{CURRENCIES[curr].name}</span>
            </div>
            <span className="text-sm text-muted-foreground">
              {CURRENCIES[curr].code}
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}