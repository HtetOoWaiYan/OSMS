import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ArrowRight, ExternalLink, MessageSquare, Bot, CheckCircle } from 'lucide-react';

// Force dynamic rendering since this page may need to check authentication
export const dynamic = 'force-dynamic';

export default function BotSetupPage() {
  return (
    <div className="bg-background min-h-screen">
      {/* Navigation */}
      <div className="border-b">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/onboarding" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Welcome
            </Link>
          </Button>
          <Image
            src="/logo.svg"
            alt="Purple Shopping"
            width={120}
            height={19}
            className="h-5 w-auto"
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto max-w-2xl space-y-8 px-4 py-8">
        <Card>
          <CardHeader className="text-center">
            <div className="bg-primary mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
              <Bot className="text-primary-foreground h-8 w-8" />
            </div>
            <CardTitle className="text-2xl">Create Your Telegram Bot</CardTitle>
            <CardDescription>
              Your bot will handle customer inquiries and automate order processing
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Benefits */}
            <div className="bg-muted/50 rounded-lg p-4">
              <h3 className="mb-2 font-semibold">Why do you need a Telegram bot?</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start space-x-2">
                  <CheckCircle className="mt-0.5 h-4 w-4 text-green-600" />
                  <span>Automatically respond to customer messages 24/7</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="mt-0.5 h-4 w-4 text-green-600" />
                  <span>Share your product catalog instantly</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="mt-0.5 h-4 w-4 text-green-600" />
                  <span>Process orders directly through Telegram chat</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="mt-0.5 h-4 w-4 text-green-600" />
                  <span>Send order updates and delivery notifications</span>
                </li>
              </ul>
            </div>

            {/* Instructions */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold">Step-by-step guide:</h3>

              <div className="space-y-4">
                <div className="rounded-lg border p-4">
                  <div className="mb-2 flex items-center space-x-3">
                    <Badge variant="secondary">Step 1</Badge>
                    <h4 className="font-semibold">Open Telegram and find @BotFather</h4>
                  </div>
                  <p className="text-muted-foreground mb-3">
                    BotFather is the official bot that helps you create and manage your Telegram
                    bots.
                  </p>
                  <Button variant="outline" size="sm" asChild>
                    <a
                      href="https://t.me/BotFather"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2"
                    >
                      <MessageSquare className="h-4 w-4" />
                      <span>Open @BotFather</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </Button>
                </div>

                <div className="rounded-lg border p-4">
                  <div className="mb-2 flex items-center space-x-3">
                    <Badge variant="secondary">Step 2</Badge>
                    <h4 className="font-semibold">Launch the Bot Creation Mini App</h4>
                  </div>
                  <p className="text-muted-foreground">
                    Click the <strong>&quot;Open&quot;</strong> button in @BotFather to launch the
                    mini app interface.
                  </p>
                </div>

                <div className="rounded-lg border p-4">
                  <div className="mb-2 flex items-center space-x-3">
                    <Badge variant="secondary">Step 3</Badge>
                    <h4 className="font-semibold">Create a New Bot</h4>
                  </div>
                  <p className="text-muted-foreground">
                    In the mini app, click <strong>&quot;Create a New Bot&quot;</strong> to start
                    the bot creation process.
                  </p>
                </div>

                <div className="rounded-lg border p-4">
                  <div className="mb-2 flex items-center space-x-3">
                    <Badge variant="secondary">Step 4</Badge>
                    <h4 className="font-semibold">Enter Bot Details</h4>
                  </div>
                  <div className="text-muted-foreground space-y-2">
                    <p>
                      <strong>Bot Name:</strong> The display name users will see (e.g., &quot;My
                      Shop Bot&quot;)
                    </p>
                    <p>
                      <strong>About:</strong> Optional description of your bot
                    </p>
                    <p>
                      <strong>Bot Username:</strong> Must end with &quot;bot&quot; (e.g.,
                      &quot;myshopbot&quot; or &quot;my_shop_bot&quot;)
                    </p>
                  </div>
                </div>

                <div className="rounded-lg border p-4">
                  <div className="mb-2 flex items-center space-x-3">
                    <Badge variant="secondary">Step 5</Badge>
                    <h4 className="font-semibold">Copy Your Bot Token</h4>
                  </div>
                  <p className="text-muted-foreground mb-3">
                    After creating the bot, you&apos;ll receive a token that looks like this:
                  </p>
                  <div className="bg-muted mb-3 rounded p-3 font-mono text-sm">
                    123456789:AAEhBOweik6ad9oeWIe9KLsEUjzN3XdGJYs
                  </div>
                  <div className="bg-destructive/10 border-destructive/20 rounded border p-3">
                    <p className="text-destructive text-sm font-semibold">
                      ⚠️ Important: Keep this token secret and safe! Anyone with this token can
                      control your bot.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-between border-t pt-6">
              <Button variant="outline" asChild>
                <Link href="/dashboard/onboarding">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Link>
              </Button>
              <Button asChild>
                <Link href="/dashboard/onboarding/create-project">
                  I have my bot token
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Help Card */}
        <Card className="bg-muted/30">
          <CardContent className="p-6 text-center">
            <h3 className="mb-2 font-semibold">Need Help?</h3>
            <p className="text-muted-foreground mb-4 text-sm">
              If you&apos;re having trouble creating your bot, you can continue with the setup and
              add the bot token later in your project settings.
            </p>
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/onboarding/create-project">Skip for now</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
