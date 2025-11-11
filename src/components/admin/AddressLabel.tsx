import { Button } from '@/components/ui/button'
import { Printer } from 'lucide-react'

interface Order {
  customer_first_name: string
  customer_last_name: string
  shipping_address_line1: string
  shipping_address_line2?: string
  shipping_city: string
  shipping_state: string
  shipping_postcode: string
  shipping_country?: string
}

interface AddressLabelProps {
  order: Order
  className?: string
}

export function AddressLabel({ order, className }: AddressLabelProps) {
  const printLabel = () => {
    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    const fullName = `${order.customer_first_name} ${order.customer_last_name}`.trim()
    const addressLine2 = order.shipping_address_line2 ? order.shipping_address_line2 : ''
    const cityStatePostcode = `${order.shipping_city}, ${order.shipping_state} ${order.shipping_postcode}`
    const country = order.shipping_country || 'AUSTRALIA'

    const labelHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Shipping Label</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }

            @page {
              size: 89mm 28mm;
              margin: 0;
            }

            @media print {
              body {
                width: 89mm;
                height: 28mm;
                margin: 0;
                padding: 2mm;
                font-family: Arial, sans-serif;
                font-size: 8pt;
                line-height: 1.1;
                display: flex;
                flex-direction: column;
                justify-content: center;
                background: white;
                color: black;
              }

              .label-content {
                height: 100%;
                display: flex;
                flex-direction: column;
                justify-content: center;
              }

              .name {
                font-weight: bold;
                font-size: 9pt;
                margin-bottom: 1mm;
              }

              .address-line {
                margin-bottom: 0.5mm;
              }

              .last-line {
                margin-bottom: 0;
              }
            }

            @media screen {
              body {
                width: 89mm;
                height: 28mm;
                margin: 20px auto;
                padding: 2mm;
                font-family: Arial, sans-serif;
                font-size: 8pt;
                line-height: 1.1;
                border: 1px solid #ccc;
                display: flex;
                flex-direction: column;
                justify-content: center;
                background: white;
                color: black;
              }

              .label-content {
                height: 100%;
                display: flex;
                flex-direction: column;
                justify-content: center;
              }

              .name {
                font-weight: bold;
                font-size: 9pt;
                margin-bottom: 1mm;
              }

              .address-line {
                margin-bottom: 0.5mm;
              }

              .last-line {
                margin-bottom: 0;
              }
            }
          </style>
        </head>
        <body>
          <div class="label-content">
            <div class="name">${fullName}</div>
            <div class="address-line">${order.shipping_address_line1}</div>
            ${addressLine2 ? `<div class="address-line">${addressLine2}</div>` : ''}
            <div class="address-line">${cityStatePostcode}</div>
            <div class="last-line">${country.toUpperCase()}</div>
          </div>
        </body>
      </html>
    `

    printWindow.document.write(labelHTML)
    printWindow.document.close()

    // Wait for content to load then print
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print()
        printWindow.close()
      }, 500)
    }
  }

  return (
    <Button
      onClick={printLabel}
      size="sm"
      variant="outline"
      className={className}
    >
      <Printer className="w-4 h-4 mr-1" />
      Print Label
    </Button>
  )
}