import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, MessageCircle, ExternalLink, Info, Smartphone, Users } from 'lucide-react'

export default function AdminMessages() {
  const navigate = useNavigate()
  const tawkDashboardUrl = "https://dashboard.tawk.to"

  const handleOpenDashboard = () => {
    window.open(tawkDashboardUrl, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              <Button asChild variant="ghost">
                <Link to="/admin/dashboard">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Dashboard
                </Link>
              </Button>
              <div className="flex items-center space-x-3">
                <MessageCircle className="w-8 h-8 text-primary" />
                <h1 className="text-3xl font-bold text-gray-900">Customer Messages</h1>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                onClick={handleOpenDashboard}
                className="flex items-center gap-2 bg-primary hover:bg-primary/90"
              >
                <ExternalLink className="w-4 h-4" />
                Open Tawk.to Dashboard
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Message */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-3">
            Welcome to your customer support center, Rae! 👋
          </h2>
          <p className="text-lg text-gray-600">
            Respond to customer chats and support tickets all in one place. Your customers can reach you through the chat widget on your website.
          </p>
        </div>

        {/* Setup Instructions */}
        <Alert className="mb-8">
          <Info className="h-4 w-4" />
          <AlertTitle>How to Access Your Messages</AlertTitle>
          <AlertDescription>
            Click "Open Tawk.to Dashboard" above to access your customer messages in a new tab.
            You'll need to log in with your Tawk.to account credentials the first time.
            <br />
            <span className="font-medium">Tip:</span> Keep both tabs open so you can switch between admin tasks and customer support!
          </AlertDescription>
        </Alert>

        {/* Main Action Card */}
        <Card className="mb-8 p-8 text-center bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="pt-6">
            <ExternalLink className="w-16 h-16 mx-auto mb-6 text-primary" />
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Access Your Customer Messages</h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Click below to open your Tawk.to dashboard in a new tab where you can view and respond to all customer inquiries,
              manage chat settings, and access conversation history.
            </p>
            <Button
              size="lg"
              onClick={handleOpenDashboard}
              className="gap-2 bg-primary hover:bg-primary/90 text-white px-8 py-3 text-lg"
            >
              <ExternalLink className="w-5 h-5" />
              Open Tawk.to Dashboard
            </Button>
            <p className="text-sm text-gray-500 mt-4">
              Opens in a new tab • Log in with your Tawk.to account credentials
            </p>
          </CardContent>
        </Card>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <MessageCircle className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-lg">Real-Time Chat</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Respond to customers instantly while they browse your website. See when they're typing,
                when they're online, and engage with them in real-time.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-lg">Customer History</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                View past conversations with customers to provide personalized support.
                Remember their preferences and build stronger relationships.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Smartphone className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-lg">Mobile Support</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Download the Tawk.to mobile app to respond to customers even when you're away from your computer.
                Never miss a message!
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={handleOpenDashboard}
            variant="outline"
            className="flex items-center gap-2"
          >
            <ExternalLink className="w-4 h-4" />
            Open Dashboard in New Tab
          </Button>
          <Button asChild variant="outline">
            <Link to="/admin/dashboard" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}